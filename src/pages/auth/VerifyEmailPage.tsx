import {
  ArrowLeft,
  Mail,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { useTheme } from '../../hooks/useTheme'
import { verifyEmail } from '../../services/auth/verify-email'
import { resendVerificationCode } from '../../services/auth/resend-verification'

export default function VerifyEmailPage() {
  const navigate = useNavigate()

  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  // Get data from sessionStorage
  const registrationData = JSON.parse(sessionStorage.getItem('registrationData') || '{}')
  const firstName = registrationData.firstName || ''
  const email = registrationData.email || ''


  useEffect(() => {
    // Only redirect if we're sure there's no data
    if (!email || !firstName) {
      navigate('/register')
    }
  }, [email, firstName, navigate])

  const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split('@')
    
    if (localPart.length <= 2) {
      return email
    }
    
    const visibleStart = localPart.slice(0, 2)
    const asteriskCount = localPart.length - 2
    const maskedLocal = visibleStart + '*'.repeat(asteriskCount)
    
    return `${maskedLocal}@${domain}`
  }

  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  function handleCodeChange(value: string) {
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 6) {
      setCode(numericValue)
    }
  }

  async function handleVerify() {
    if (isVerifying || code.length !== 6 || isVerified) {
      return
    }

    setIsVerifying(true)

    try {
      const response = await verifyEmail({
        email: email,
        otpCode: code,
        platform: 'web',
      })

      if (response.is_success) {
        setIsVerified(true)
        sessionStorage.setItem('isEmailVerified', 'true')
        sessionStorage.removeItem('registrationData')
        sessionStorage.removeItem('verifyEmailExpiry')
        
        setTimeout(() => {
          navigate('/pin-setup')
        }, 1500)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  async function handleResend() {
    if (isResending) return

    setIsResending(true)

    try {
      const response = await resendVerificationCode({
        email: email,
        platform: 'web',
        purpose: "account-verification"

      })

      if (response.is_success) {
        setCode('')
      }
    } finally {
      setIsResending(false)
    }
  }

  // Show loading state while redirecting
  if (isVerified) {
    return (
      <AuthLayout>
        <section className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.greenLight }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: themeColors.green }} />
          </div>
          <p className="text-[16px]" style={{ color: themeColors.mid }}>
            Redirecting to PIN setup...
          </p>
        </section>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <section className="py-10">
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="mb-8 flex items-center gap-2 text-[13px] font-medium transition-opacity duration-200 hover:opacity-70"
          style={{ color: themeColors.mid }}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back
        </button>

        <div
          className="mb-6 flex h-12 w-12 items-center justify-center rounded-[14px]"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <Mail
            size={22}
            strokeWidth={1.8}
            style={{ color: themeColors.green }}
          />
        </div>

        <h1
          className="mb-5 text-[36px] font-extrabold leading-[1.08] tracking-[-0.035em]"
          style={{ color: themeColors.charcoal }}
        >
          Verify your
          <br />
          email address
        </h1>

        <p className="text-[15px] leading-[1.65]" style={{ color: themeColors.mid }}>
          Dear {firstName},
        </p>

        <p className="mt-3 text-[15px] leading-[1.65]" style={{ color: themeColors.mid }}>
          We've sent a 6-digit verification code to
        </p>

        <p
          className="mt-1 break-all text-[15px] font-semibold"
          style={{ color: themeColors.charcoal }}
        >
          {maskEmail(email)}
        </p>

        <p className="mt-3 text-[13px] leading-[1.5]" style={{ color: themeColors.mid }}>
          Enter the code below to verify your email address.
        </p>

        <div className="mt-8">
          <label
            htmlFor="verification-code"
            className="mb-2 block text-[13px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            Verification code
          </label>

          <input
            id="verification-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => handleCodeChange(event.target.value)}
            placeholder="000000"
            className="w-full rounded-[14px] border-[1.5px] bg-transparent px-4 py-[15px] text-center font-mono text-[24px] font-medium tracking-[0.35em] outline-none transition-all duration-300 placeholder:tracking-[0.35em]"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.charcoal,
            }}
          />
        </div>

        <div className="mt-6">
          <Button
            onClick={handleVerify}
            loading={isVerifying}
            loadingText="Verifying..."
            disabled={code.length !== 6 || isVerified}
          >
            Verify Email
          </Button>
        </div>

        <div className="mt-5 text-center">
          <p className="text-[13px]" style={{ color: themeColors.mid }}>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-semibold transition-opacity duration-200 hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: isResending ? themeColors.mid : themeColors.green,
                cursor: isResending ? 'not-allowed' : 'pointer',
              }}
            >
              {isResending ? 'Resending...' : 'Resend code'}
            </button>
          </p>
        </div>
      </section>
    </AuthLayout>
  )
}