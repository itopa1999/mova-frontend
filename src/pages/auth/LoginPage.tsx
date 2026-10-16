import {
  LogIn,
  ShieldAlert,
  Clock,
  ArrowLeft,
  LifeBuoy,
  MailCheck,
  Loader2,
} from 'lucide-react'

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'

import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

import {
  validateRequired,
} from '../../utils/validation'

import {
  loginUser,
  type LoginBlockedData,
} from '../../services/auth/login'

import {
  resendVerificationCode,
} from '../../services/auth/resend-verification'

const VERIFICATION_REQUIRED_MATCHERS = [
  'verify your account',
  'verify your email',
  'please verify',
  'account is not verified',
  'account not verified',
  'email is not verified',
  'email not verified',
  'not verified',
]

function isVerificationRequiredMessage(
  message: string | null | undefined,
): boolean {
  if (!message) return false

  const normalized = message.toLowerCase().replace(/\s+/g, ' ').trim()

  return VERIFICATION_REQUIRED_MATCHERS.some((m) => normalized.includes(m))
}

function looksLikeEmail(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.includes('@') && trimmed.includes('.')
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const themeColors = isDark ? darkColors : colors

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const [touched, setTouched] = useState({
    identifier: false,
    password: false,
  })

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [blockedInfo, setBlockedInfo] = useState<LoginBlockedData | null>(null)

  const showResendOption = isVerificationRequiredMessage(errorMessage)

  const identifierError = touched.identifier
    ? validateRequired(identifier, 'Email or phone number')
    : undefined

  const passwordError = touched.password
    ? validateRequired(password, 'Password')
    : undefined

  function handleIdentifierChange(event: ChangeEvent<HTMLInputElement>) {
    setIdentifier(event.target.value)
    if (errorMessage) setErrorMessage(null)
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
    if (errorMessage) setErrorMessage(null)
  }

  function handleIdentifierBlur() {
    setTouched((current) => ({ ...current, identifier: true }))
  }

  function handlePasswordBlur() {
    setTouched((current) => ({ ...current, password: true }))
  }

  function handleForgotPassword() {
    navigate('/forgot-password')
  }

  function handleCreateAccount() {
    navigate('/register')
  }

  function handleContactSupport() {
    navigate('/support')
  }

  function handleBackToHome() {
    setBlockedInfo(null)
    setErrorMessage(null)
    setIdentifier('')
    setPassword('')
    setTouched({ identifier: false, password: false })
    navigate('/welcome')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setTouched({ identifier: true, password: true })

    if (!identifier.trim() || !password.trim()) return

    setIsLoggingIn(true)
    setErrorMessage(null)

    try {
      const result = await loginUser({
        emailOrPhone: identifier.trim(),
        password: password.trim(),
        platform: 'web',
      })

      if (result.success) {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              type: 'success',
              message: 'Login successful!',
            },
          }),
        )

        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)

        return
      }

      if (result.blocked) {
        setBlockedInfo(result.blocked)
        return
      }

      setErrorMessage(result.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  async function handleResendVerification() {
    if (isResending) return

    if (!looksLikeEmail(identifier)) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              'Please enter your email address above, then tap resend.',
          },
        }),
      )
      return
    }

    setIsResending(true)

    try {
      const result = await resendVerificationCode({
        email: identifier.trim(),
        platform: 'web',
        purpose: 'account-verification',
      })

      if (result.is_success) {
        setTimeout(() => {
          navigate('/verify-email', {
            state: {
              email: identifier.trim(),
              returnTo: '/login',
            },
          })
        }, 800)
      }
    } finally {
      setIsResending(false)
    }
  }

  // =====================================================
  // BLOCKED VIEW
  // =====================================================
  if (blockedInfo) {
    const hasExpiry =
      Boolean(blockedInfo.restrictionExpiresAt) ||
      Boolean(blockedInfo.lockoutEndsAt)

    const expiryAt = blockedInfo.lockoutEndsAt
      ? new Date(blockedInfo.lockoutEndsAt)
      : blockedInfo.restrictionExpiresAt
      ? new Date(blockedInfo.restrictionExpiresAt)
      : null

    const statusLabel = (blockedInfo.statusLabel || 'BLOCKED').toUpperCase()
    const isLockout = Boolean(blockedInfo.lockoutEndsAt)

    return (
      <AuthLayout>
        <div className="flex min-h-full flex-col">
          <div className="pt-16 sm:pt-20">
            <div className="relative mb-7 flex h-[80px] w-[80px] items-center justify-center">
              <div
                className="absolute inset-0 rounded-[24px]"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(239, 68, 68, 0.05)',
                  transform: 'scale(1.35)',
                  filter: 'blur(6px)',
                }}
              />

              <div
                className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[20px]"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.18)'
                    : 'rgba(239, 68, 68, 0.1)',
                  boxShadow: `0 0 0 1px ${
                    isDark
                      ? 'rgba(239, 68, 68, 0.35)'
                      : 'rgba(239, 68, 68, 0.2)'
                  }`,
                }}
              >
                <ShieldAlert
                  size={36}
                  strokeWidth={2}
                  style={{ color: '#EF4444' }}
                />
              </div>
            </div>

            <div className="mb-7">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: '#EF4444' }}
              >
                Account status
              </p>

              <h1
                className="mt-3 text-[42px] font-black uppercase leading-none tracking-[-0.04em] sm:text-[48px]"
                style={{ color: '#EF4444' }}
              >
                {statusLabel}
              </h1>

              <p
                className="mt-4 text-[15px] font-semibold leading-[1.4]"
                style={{ color: themeColors.charcoal }}
              >
                {isLockout
                  ? 'Access is temporarily paused.'
                  : 'Login has been disabled for this account.'}
              </p>

              <p
                className="mt-2 text-[14px] leading-[1.6]"
                style={{ color: themeColors.mid }}
              >
                {blockedInfo.statusDescription}
              </p>
            </div>

            <div
              className="rounded-[16px] border p-4"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.03)'
                  : '#F9FAFB',
                borderColor: themeColors.border,
              }}
            >
              {blockedInfo.restrictionReason && (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="shrink-0 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Reason
                    </span>
                    <span
                      className="text-right text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatRestrictionReason(
                        blockedInfo.restrictionReason,
                      )}
                    </span>
                  </div>

                  {blockedInfo.restrictionReasonDetails && (
                    <div
                      className="my-3 h-px w-full"
                      style={{ backgroundColor: themeColors.border }}
                    />
                  )}
                </>
              )}

              {blockedInfo.restrictionReasonDetails && (
                <div>
                  <p
                    className="mb-1 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    What we found
                  </p>
                  <p
                    className="text-[13px] leading-[1.55]"
                    style={{ color: themeColors.charcoal }}
                  >
                    {blockedInfo.restrictionReasonDetails}
                  </p>
                </div>
              )}

              {hasExpiry && expiryAt && (
                <>
                  <div
                    className="my-3 h-px w-full"
                    style={{ backgroundColor: themeColors.border }}
                  />
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="shrink-0 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      {isLockout
                        ? 'Try again after'
                        : 'Restriction ends'}
                    </span>
                    <span
                      className="flex items-center gap-1.5 text-right text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      <Clock
                        size={13}
                        style={{ flexShrink: 0 }}
                      />
                      {expiryAt.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-3">
              <Button
                type="button"
                onClick={handleContactSupport}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <LifeBuoy size={16} />
                  Contact support
                </span>
              </Button>

              <button
                type="button"
                onClick={handleBackToHome}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border px-4 py-3.5 text-[14px] font-semibold transition-all hover:opacity-80 active:scale-[0.99]"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.card,
                  color: themeColors.charcoal,
                }}
              >
                <ArrowLeft size={16} />
                Back to home
              </button>
            </div>

            <p
              className="mt-8 text-center text-[12px] leading-[1.55]"
              style={{ color: themeColors.mid }}
            >
              If you believe this is a mistake, contact support
              and we'll review it right away.
            </p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // =====================================================
  // NORMAL VIEW — login form
  // =====================================================
  return (
    <AuthLayout>
      <div className="flex min-h-full flex-col">
        <div className="pt-20 sm:pt-24">
          <div
            className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-[17px]"
            style={{ backgroundColor: themeColors.greenLight }}
          >
            <LogIn
              size={32}
              strokeWidth={2}
              style={{ color: themeColors.green }}
            />
          </div>

          <div className="mb-9">
            <h1
              className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em]"
              style={{ color: themeColors.charcoal }}
            >
              Welcome back
            </h1>

            <p
              className="mt-2 text-[14px] leading-6"
              style={{ color: themeColors.mid }}
            >
              Log in to manage your wallets and control when your
              money is released.
            </p>
          </div>

          {errorMessage && (
            <div
              className="mb-6 rounded-[12px] border px-4 py-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.05)',
                borderColor: isDark
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(239, 68, 68, 0.2)',
              }}
            >
              <p
                className="text-[13px] leading-[1.55]"
                style={{ color: '#EF4444' }}
              >
                {errorMessage}
              </p>

              {showResendOption && (
                <>
                  <div
                    className="my-3 h-px w-full"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(239, 68, 68, 0.25)'
                        : 'rgba(239, 68, 68, 0.15)',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="group inline-flex items-center gap-1.5 text-[12px] font-semibold transition-opacity duration-200 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ color: themeColors.green }}
                  >
                    {isResending ? (
                      <>
                        <Loader2
                          size={12}
                          strokeWidth={2.5}
                          className="animate-spin"
                        />
                        <span>Sending new code...</span>
                      </>
                    ) : (
                      <>
                        <MailCheck size={12} strokeWidth={2.5} />
                        <span>Resend verification code</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Email or phone number"
              name="identifier"
              type="text"
              placeholder="Enter your email or phone number"
              value={identifier}
              onChange={handleIdentifierChange}
              onBlur={handleIdentifierBlur}
              error={identifierError}
              touched={touched.identifier}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              error={passwordError}
              touched={touched.password}
              required
            />

            <div className="-mt-1 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="shrink-0 text-[13px] font-semibold transition-opacity duration-200 hover:opacity-70"
                style={{ color: themeColors.green }}
              >
                Forgot password?
              </button>
            </div>

            <div className="mt-7">
              <Button
                type="submit"
                loading={isLoggingIn}
                loadingText="Logging in..."
                disabled={!identifier.trim() || !password.trim()}
              >
                Log in
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-auto pb-6 pt-14 text-center">
          <p
            className="text-[13px]"
            style={{ color: themeColors.mid }}
          >
            Don't have an account?{' '}

            <button
              type="button"
              onClick={handleCreateAccount}
              className="font-semibold transition-opacity duration-200 hover:opacity-70"
              style={{ color: themeColors.green }}
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

function formatRestrictionReason(reason: string): string {
  if (!reason) return ''
  const spaced = reason.replace(/([A-Z])/g, ' $1').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase()
}