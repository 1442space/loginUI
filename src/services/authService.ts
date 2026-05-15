import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

const TOKEN_KEY = 'loginui.jwt'
const AUTH_SERVICE_URL = import.meta.env.VITE_AUTH_SERVICE_URL
const STORAGE_PASSPHRASE = `${import.meta.env.VITE_SUPABASE_URL ?? 'local'}::loginui`

export type UserProfile = {
  name: string
  region: string
  gender: string
}

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
const fromBase64 = (value: string) =>
  Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

let cachedKey: Promise<CryptoKey> | null = null

const getStorageKey = () => {
  if (!cachedKey) {
    cachedKey = (async () => {
      const encoder = new TextEncoder()
      const material = await crypto.subtle.importKey(
        'raw',
        encoder.encode(STORAGE_PASSPHRASE),
        'PBKDF2',
        false,
        ['deriveKey'],
      )

      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          hash: 'SHA-256',
          salt: encoder.encode('loginui-salt'),
          iterations: 60000,
        },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
      )
    })()
  }

  return cachedKey
}

// Encrypts JWT before browser persistence to avoid clear-text storage.
const encryptJwt = async (jwt: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getStorageKey()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(jwt),
  )

  return `${toBase64(iv)}.${toBase64(new Uint8Array(encrypted))}`
}

const decryptJwt = async (payload: string) => {
  const [ivPart, encryptedPart] = payload.split('.')
  if (!ivPart || !encryptedPart) return null

  try {
    const key = await getStorageKey()
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(ivPart) },
      key,
      fromBase64(encryptedPart),
    )

    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

// Persists encrypted JWT to selected browser storage for session continuity.
const persistJwt = async (jwt: string, remember = false) => {
  const encryptedToken = await encryptJwt(jwt)

  if (remember) {
    localStorage.setItem(TOKEN_KEY, encryptedToken)
    sessionStorage.removeItem(TOKEN_KEY)
    return
  }

  sessionStorage.setItem(TOKEN_KEY, encryptedToken)
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

export const readStoredJwt = async () => {
  const encryptedToken = sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
  if (!encryptedToken) return null

  return decryptJwt(encryptedToken)
}

export const clearStoredJwt = () => {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

export const loginWithEmail = async (email: string, password: string, remember = false) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const jwt = data.session?.access_token
  if (jwt) {
    await persistJwt(jwt, remember)
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

  return { sent: true }
}

export const signupWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  const jwt = data.session?.access_token
  if (jwt) {
    await persistJwt(jwt)
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
    await persistJwt(jwt)
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
