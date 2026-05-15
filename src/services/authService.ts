import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

const TOKEN_KEY = 'loginui.jwt'
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL

export type UserProfile = {
  name: string
  region: string
  gender: string
}

// Persists JWT to selected browser storage for session continuity.
const persistJwt = (jwt: string, remember = false) => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, jwt)
    sessionStorage.removeItem(TOKEN_KEY)
    return
  }

  sessionStorage.setItem(TOKEN_KEY, jwt)
  localStorage.removeItem(TOKEN_KEY)
}

// Sync hook for an external auth backend (e.g. repo-auth service).
const notifyAuthBackend = async (action: string, jwt: string) => {
  if (!AUTH_SERVICE_URL) return

  try {
    await fetch(`${AUTH_SERVICE_URL}/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ action }),
    })
  } catch {
    // Non-blocking: frontend auth should continue even if sync endpoint is unavailable.
  }
}

const extractProfile = (user?: User | null): UserProfile => {
  const metadata = user?.user_metadata ?? {}

  return {
    name: metadata.name ?? metadata.full_name ?? 'Sovereign User',
    region: metadata.region ?? 'Unknown Region',
    gender: metadata.gender ?? 'Undisclosed',
  }
}

export const readStoredJwt = () => sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)

export const clearStoredJwt = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export const loginWithEmail = async (email: string, password: string, remember = false) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const jwt = data.session?.access_token
  if (jwt) {
    persistJwt(jwt, remember)
    await notifyAuthBackend('login-email', jwt)
  }

  return extractProfile(data.user)
}

export const loginWithPhone = async (phone: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: false },
  })

  if (error) throw error
}

export const signupWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  const jwt = data.session?.access_token
  if (jwt) {
    persistJwt(jwt)
    await notifyAuthBackend('signup-email', jwt)
  }
}

export const signupWithPhone = async (phone: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true },
  })

  if (error) throw error
}

export const resendPhoneOtp = async (phone: string) => {
  const { error } = await supabase.auth.resend({
    type: 'sms',
    phone,
  })

  if (error) throw error
}

export const verifyPhoneOtp = async (phone: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })

  if (error) throw error

  const jwt = data.session?.access_token
  if (jwt) {
    persistJwt(jwt)
    await notifyAuthBackend('verify-phone', jwt)
  }

  return extractProfile(data.user)
}

export const loginWithOAuth = async (provider: 'google' | 'microsoft') => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider === 'microsoft' ? 'azure' : 'google',
    options: { redirectTo: window.location.origin },
  })

  if (error) throw error
}

export const logout = async () => {
  clearStoredJwt()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
