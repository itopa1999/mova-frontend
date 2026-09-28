// src/pages/auth/VerifyEmailPage.tsx

import {
  ArrowLeft,
  Mail,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { useTheme } from '../../hooks/useTheme'
import { verifyEmail } from '../../services/auth/verify-email'
import { resendVerificationCode } from '../../services/auth/resend-verification'
import type { RegistrationHandoff } from '../../services/auth/register'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const state = location.state as RegistrationHandoff | null

  const firstName = state?.firstName ?? ''
  const email = state?.email ?? ''

  useEffect(() => {
    if (!state || !email || !firstName) {
      navigate('/register', { replace: true })
    }
  }, [state, email, firstName, navigate])

  const maskEmail = (value: string): string => {
    const [localPart, domain] = value.split('@')

    if (!domain || localPart.length <= 2) {
      return value
    }

    const visibleStart = localPart.slice(0, 2)
    const asteriskCount = localPart.length - 2
    const maskedLocal = visibleStart + '*'.repeat(asteriskCount)

    return `${maskedLocal}@${domain}`
  }

  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  function handleCodeChange(value: string) {
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 6) {
      setCode(numericValue)
    }
  }

  async function handleVerify() {
    if (isVerifying || code.length !== 6) return

    setIsVerifying(true)

    try {
      await verifyEmail(
        {
          email,
          otpCode: code,
          platform: 'web',
        },
        navigate
      )
    } finally {
      setIsVerifying(false)
    }
  }

  async function handleResend() {
    if (isResending) return

    setIsResending(true)

    try {
      const response = await resendVerificationCode({
        email,
        platform: 'web',
        purpose: 'account-verification',
      })

      if (response.is_success) {
        setCode('')
      }
    } finally {
      setIsResending(false)
    }
  }

  if (!state) {
    return null
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

        <p
          className="text-[15px] leading-[1.65]"
          style={{ color: themeColors.mid }}
        >
          Dear {firstName},
        </p>

        <p
          className="mt-3 text-[15px] leading-[1.65]"
          style={{ color: themeColors.mid }}
        >
          We've sent a 6-digit verification code to
        </p>

        <p
          className="mt-1 break-all text-[15px] font-semibold"
          style={{ color: themeColors.charcoal }}
        >
          {maskEmail(email)}
        </p>

        <p
          className="mt-3 text-[13px] leading-[1.5]"
          style={{ color: themeColors.mid }}
        >
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
            disabled={code.length !== 6}
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