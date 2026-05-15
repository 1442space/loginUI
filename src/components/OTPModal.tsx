import { useEffect, useMemo, useState } from 'react'
import { TbRefresh, TbShieldCheck, TbX } from 'react-icons/tb'

type OTPModalProps = {
  isOpen: boolean
  phone: string
  statusMessage: string
  statusType: 'success' | 'error' | null
  onClose: () => void
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
}

const RESEND_SECONDS = 30

export function OTPModal({
  isOpen,
  phone,
  statusMessage,
  statusType,
  onClose,
  onVerify,
  onResend,
}: OTPModalProps) {
  const [otp, setOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (!isOpen) return

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isOpen])

  const statusClassName = useMemo(() => {
    if (statusType === 'success') return 'text-green-700 dark:text-green-300'
    if (statusType === 'error') return 'text-red-700 dark:text-red-300'
    return 'text-brand-brown dark:text-brand-ivory'
  }, [statusType])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-brand-brown/50 p-4">
      <div className="premium-card w-full max-w-md">
        <div className="mb-4 flex items-center justify-between border-b-2 border-brand-gold pb-2">
          <h2 className="font-title text-2xl">Phone OTP Verification</h2>
          <button type="button" className="premium-button !p-2" onClick={onClose} aria-label="Close OTP modal">
            <TbX aria-hidden="true" />
          </button>
        </div>

        <p className="mb-4 uppercase tracking-wide">Enter the one-time passcode sent to {phone}.</p>

        <label htmlFor="otp-code" className="mb-1 block text-sm uppercase tracking-wide">
          OTP Code
        </label>
        <input
          id="otp-code"
          aria-label="Enter OTP code"
          className="premium-input"
          value={otp}
          onChange={(event) => setOtp(event.target.value.trim())}
          inputMode="numeric"
          autoComplete="one-time-code"
        />

        <p className={`mt-3 text-sm ${statusClassName}`}>{statusMessage}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="premium-button flex-1"
            onClick={() => onVerify(otp)}
            aria-label="Verify OTP code"
          >
            <TbShieldCheck aria-hidden="true" /> Verify
          </button>
          <button
            type="button"
            className="premium-button flex-1"
            disabled={secondsLeft > 0}
            onClick={async () => {
              await onResend()
              setSecondsLeft(RESEND_SECONDS)
            }}
            aria-label="Resend OTP code"
          >
            <TbRefresh aria-hidden="true" /> {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend'}
          </button>
        </div>
      </div>
    </div>
  )
}
