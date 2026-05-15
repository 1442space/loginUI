import { useState } from 'react'
import {
  TbAt,
  TbBrandGoogle,
  TbBrandWindows,
  TbDeviceMobile,
  TbLock,
  TbMail,
  TbPhone,
} from 'react-icons/tb'
import type { UserProfile } from '../services/authService'
import { loginWithEmail, loginWithOAuth, loginWithPhone, verifyPhoneOtp } from '../services/authService'
import { OTPModal } from '../components/OTPModal'

type LoginPageProps = {
  onLoginSuccess: (profile: UserProfile) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [phone, setPhone] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)
  const [isOtpOpen, setIsOtpOpen] = useState(false)

  const setStatus = (message: string, type: 'success' | 'error') => {
    setStatusMessage(message)
    setStatusType(type)
  }

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const profile = await loginWithEmail(email, password, rememberMe)
      onLoginSuccess(profile)
      setStatus('Email login successful.', 'success')
    } catch (error) {
      setStatus((error as Error).message, 'error')
    }
  }

  const handlePhoneLogin = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      const result = await loginWithPhone(phone)
      setStatus(result.sent ? 'OTP sent for phone login.' : 'Could not send OTP.', 'success')
      setIsOtpOpen(true)
    } catch (error) {
      setStatus((error as Error).message, 'error')
    }
  }

  return (
    <div className="premium-card mx-auto w-full max-w-2xl">
      <h1 className="mb-5 text-center font-title text-4xl md:text-5xl">Sovereign Identity Login</h1>

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          aria-label="Login with Google"
          className="premium-button"
          onClick={() => loginWithOAuth('google').catch((error) => setStatus(error.message, 'error'))}
        >
          <TbBrandGoogle aria-hidden="true" /> Continue with Google
        </button>
        <button
          type="button"
          aria-label="Login with Microsoft"
          className="premium-button"
          onClick={() => loginWithOAuth('microsoft').catch((error) => setStatus(error.message, 'error'))}
        >
          <TbBrandWindows aria-hidden="true" /> Continue with Microsoft
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <form onSubmit={handleEmailLogin} className="space-y-3 border-2 border-brand-gold p-4">
          <h2 className="flex items-center gap-2 font-title text-2xl"><TbMail aria-hidden="true" /> Email Login</h2>
          <label htmlFor="login-email" className="block text-sm uppercase tracking-wide">Email</label>
          <div className="relative">
            <TbAt className="pointer-events-none absolute left-3 top-3" aria-hidden="true" />
            <input
              id="login-email"
              aria-label="Login email"
              className="premium-input pl-10"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <label htmlFor="login-password" className="block text-sm uppercase tracking-wide">Password</label>
          <div className="relative">
            <TbLock className="pointer-events-none absolute left-3 top-3" aria-hidden="true" />
            <input
              id="login-password"
              aria-label="Login password"
              className="premium-input pl-10"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm uppercase tracking-wide">
            <input
              type="checkbox"
              aria-label="Remember me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember me
          </label>

          <button type="submit" className="premium-button w-full" aria-label="Submit email login">
            <TbMail aria-hidden="true" /> Login with Email
          </button>
        </form>

        <form onSubmit={handlePhoneLogin} className="space-y-3 border-2 border-brand-gold p-4">
          <h2 className="flex items-center gap-2 font-title text-2xl"><TbDeviceMobile aria-hidden="true" /> Phone Login</h2>
          <label htmlFor="login-phone" className="block text-sm uppercase tracking-wide">Phone</label>
          <div className="relative">
            <TbPhone className="pointer-events-none absolute left-3 top-3" aria-hidden="true" />
            <input
              id="login-phone"
              aria-label="Login phone"
              className="premium-input pl-10"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <button type="submit" className="premium-button w-full" aria-label="Submit phone login">
            <TbPhone aria-hidden="true" /> Send OTP
          </button>
        </form>
      </div>

      <p className={`mt-4 text-sm ${statusType === 'error' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
        {statusMessage}
      </p>

      {isOtpOpen ? (
        <OTPModal
          isOpen={isOtpOpen}
          phone={phone}
          statusMessage={statusMessage || 'Enter the OTP to complete phone login.'}
          statusType={statusType}
          onClose={() => setIsOtpOpen(false)}
          onVerify={async (otp) => {
            try {
              const profile = await verifyPhoneOtp(phone, otp)
              onLoginSuccess(profile)
              setStatus('Phone login verified successfully.', 'success')
              setIsOtpOpen(false)
            } catch (error) {
              setStatus((error as Error).message, 'error')
            }
          }}
          onResend={async () => {
            await loginWithPhone(phone)
            setStatus('OTP resent successfully.', 'success')
          }}
        />
      ) : null}
    </div>
  )
}
