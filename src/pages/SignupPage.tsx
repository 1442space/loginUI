import { useState } from 'react'
import { TbAt, TbDeviceMobile, TbLock, TbMail, TbPhone, TbUserPlus } from 'react-icons/tb'
import { OTPModal } from '../components/OTPModal'
import { signupWithEmail, signupWithPhone, verifyPhoneOtp } from '../services/authService'

type SignupPageProps = {
  onSuccess: (message: string) => void
}

export function SignupPage({ onSuccess }: SignupPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)
  const [isOtpOpen, setIsOtpOpen] = useState(false)

  const setStatus = (message: string, type: 'success' | 'error') => {
    setStatusMessage(message)
    setStatusType(type)
  }

  const handleEmailSignup = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      await signupWithEmail(email, password)
      const message = 'Email signup submitted. Please verify your email inbox.'
      setStatus(message, 'success')
      onSuccess(message)
    } catch (error) {
      setStatus((error as Error).message, 'error')
    }
  }

  const handlePhoneSignup = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      await signupWithPhone(phone)
      setStatus('Signup OTP sent to your phone.', 'success')
      setIsOtpOpen(true)
    } catch (error) {
      setStatus((error as Error).message, 'error')
    }
  }

  return (
    <div className="premium-card mx-auto w-full max-w-2xl">
      <h1 className="mb-5 text-center font-title text-4xl md:text-5xl">Create Sovereign Account</h1>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <form onSubmit={handleEmailSignup} className="space-y-3 border-2 border-brand-gold p-4">
          <h2 className="flex items-center gap-2 font-title text-2xl"><TbMail aria-hidden="true" /> Email Signup</h2>
          <label htmlFor="signup-email" className="block text-sm uppercase tracking-wide">Email</label>
          <div className="relative">
            <TbAt className="pointer-events-none absolute left-3 top-3" aria-hidden="true" />
            <input
              id="signup-email"
              aria-label="Signup email"
              className="premium-input pl-10"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <label htmlFor="signup-password" className="block text-sm uppercase tracking-wide">Password</label>
          <div className="relative">
            <TbLock className="pointer-events-none absolute left-3 top-3" aria-hidden="true" />
            <input
              id="signup-password"
              aria-label="Signup password"
              className="premium-input pl-10"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit" className="premium-button w-full" aria-label="Submit email signup">
            <TbUserPlus aria-hidden="true" /> Signup with Email
          </button>
        </form>

        <form onSubmit={handlePhoneSignup} className="space-y-3 border-2 border-brand-gold p-4">
          <h2 className="flex items-center gap-2 font-title text-2xl"><TbDeviceMobile aria-hidden="true" /> Phone Signup</h2>
          <label htmlFor="signup-phone" className="block text-sm uppercase tracking-wide">Phone</label>
          <div className="relative">
            <TbPhone className="pointer-events-none absolute left-3 top-3" aria-hidden="true" />
            <input
              id="signup-phone"
              aria-label="Signup phone"
              className="premium-input pl-10"
              type="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <button type="submit" className="premium-button w-full" aria-label="Submit phone signup">
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
          statusMessage={statusMessage || 'Enter OTP to complete your phone signup.'}
          statusType={statusType}
          onClose={() => setIsOtpOpen(false)}
          onVerify={async (otp) => {
            try {
              await verifyPhoneOtp(phone, otp)
              setStatus('Phone signup verified successfully.', 'success')
              onSuccess('Phone signup verified successfully.')
              setIsOtpOpen(false)
            } catch (error) {
              setStatus((error as Error).message, 'error')
            }
          }}
          onResend={async () => {
            await signupWithPhone(phone)
            setStatus('OTP resent successfully.', 'success')
          }}
        />
      ) : null}
    </div>
  )
}
