import {
  ChevronLeft,
  Mail,
  KeyRound,
  Lock,
  CheckCircle,
  Check
} from 'lucide-react'

import {
  useState,
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

import { requestPasswordReset } from '../../services/auth/request-password-reset'
import { verifyResetToken } from '../../services/auth/verify-reset-token'
import { resetPassword } from '../../services/auth/reset-password'
import { resendVerificationCode } from '../../services/auth/resend-verification'

type Step = 1 | 2 | 3

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  // =======================================================
  // STEP STATE
  // =======================================================

  const [step, setStep] = useState<Step>(1)
  const [userPublicId, setUserPublicId] = useState('')
  const [email, setEmail] = useState('')

  // =======================================================
  // STEP 1: EMAIL
  // =======================================================

  const [identifier, setIdentifier] = useState('')
  const [identifierTouched, setIdentifierTouched] = useState(false)
  const [isSubmittingStep1, setIsSubmittingStep1] = useState(false)

  const identifierError = identifierTouched
    ? validateRequired(identifier, 'Email address')
    : undefined

  // =======================================================
  // STEP 2: OTP VERIFICATION
  // =======================================================

  const [otp, setOtp] = useState('')
  const [otpTouched, setOtpTouched] = useState(false)
  const [isSubmittingStep2, setIsSubmittingStep2] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const otpError = otpTouched
    ? validateRequired(otp, 'Verification code')
    : undefined

  // =======================================================
  // STEP 3: NEW PASSWORD
  // =======================================================

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [isSubmittingStep3, setIsSubmittingStep3] = useState(false)

  // Password validation
  const hasMinLength = newPassword.length >= 8
  const hasUpperCase = /[A-Z]/.test(newPassword)
  const hasLowerCase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol

  const passwordError = passwordTouched && !isPasswordValid
    ? 'Password must meet all requirements below'
    : undefined

  const confirmPasswordError = passwordTouched && confirmPassword && confirmPassword !== newPassword
    ? 'Passwords do not match'
    : undefined

  // =======================================================
  // MASK EMAIL
  // =======================================================

  const maskEmail = (email: string): string => {
    if (!email) return ''
    const [localPart, domain] = email.split('@')
    
    if (localPart.length <= 2) {
      return email
    }
    
    const visibleStart = localPart.slice(0, 2)
    const asteriskCount = localPart.length - 2
    const maskedLocal = visibleStart + '*'.repeat(asteriskCount)
    
    return `${maskedLocal}@${domain}`
  }

  // =======================================================
  // HANDLERS
  // =======================================================

  function handleBackToLogin() {
    navigate('/login')
  }

  function handleBackToStep1() {
    setStep(1)
    setOtp('')
    setOtpTouched(false)
  }

  function handleBackToStep2() {
    setStep(2)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordTouched(false)
  }

  // =======================================================
  // STEP 1 SUBMIT
  // =======================================================

  async function handleStep1Submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIdentifierTouched(true)

    if (!identifier.trim()) {
      return
    }

    setIsSubmittingStep1(true)

    try {
      const response = await requestPasswordReset({
        email: identifier.trim()
      })

      if (response.is_success && response.data) {
        setUserPublicId(response.data.userPublicId)
        setEmail(identifier.trim())
        setStep(2)
      }
    } finally {
      setIsSubmittingStep1(false)
    }
  }

  // =======================================================
  // STEP 2 SUBMIT
  // =======================================================

  async function handleStep2Submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setOtpTouched(true)

    if (!otp.trim()) {
      return
    }

    setIsSubmittingStep2(true)

    try {
      const response = await verifyResetToken({
        userPublicId: userPublicId,
        token: otp.trim(),
      })

      if (response.is_success) {
        setStep(3)
      }
    } finally {
      setIsSubmittingStep2(false)
    }
  }

  // =======================================================
  // RESEND OTP
  // =======================================================

  async function handleResendCode() {
    if (isResending) return

    setIsResending(true)

    try {
      const response = await resendVerificationCode({
        email: email,
        platform: 'web',
        purpose: "password-reset"

      })

      if (response.is_success) {
        setOtp('')
        setOtpTouched(false)
      }
    } finally {
      setIsResending(false)
    }
  }

  // =======================================================
  // STEP 3 SUBMIT
  // =======================================================

  async function handleStep3Submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordTouched(true)

    if (!isPasswordValid || confirmPassword !== newPassword) {
      return
    }

    setIsSubmittingStep3(true)

    try {
      const response = await resetPassword({
        userPublicId: userPublicId,
        newPassword: newPassword.trim(),
      })

      if (response.is_success) {
        sessionStorage.removeItem('resetPasswordData')
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      }
    } finally {
      setIsSubmittingStep3(false)
    }
  }

  // =======================================================
  // RENDER STEP INDICATOR
  // =======================================================

  function renderStepIndicator() {
    const steps = [
      { number: 1, label: 'Email' },
      { number: 2, label: 'Verify' },
      { number: 3, label: 'Reset' },
    ]

    return (
      <div className="mb-8 flex items-center justify-center gap-6">
        {steps.map((s) => {
          const isActive = step === s.number
          const isCompleted = step > s.number

          return (
            <div key={s.number} className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300"
                style={{
                  backgroundColor: isActive
                    ? themeColors.green
                    : isCompleted
                    ? themeColors.greenLight
                    : themeColors.background,
                  color: isActive
                    ? '#FFFFFF'
                    : isCompleted
                    ? themeColors.green
                    : themeColors.mid,
                  border: isActive
                    ? `2px solid ${themeColors.green}`
                    : isCompleted
                    ? `2px solid ${themeColors.green}`
                    : `2px solid ${themeColors.border}`,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {isCompleted ? (
                  <CheckCircle size={18} strokeWidth={2.5} />
                ) : (
                  s.number
                )}
              </div>
              <span
                className="text-[11px] font-medium"
                style={{
                  color: isActive ? themeColors.green : themeColors.mid,
                }}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  // =======================================================
  // RENDER PASSWORD REQUIREMENTS
  // =======================================================

  function renderPasswordRequirements() {
    const requirements = [
      { label: 'At least 8 characters', met: hasMinLength },
      { label: 'Contains uppercase letter', met: hasUpperCase },
      { label: 'Contains lowercase letter', met: hasLowerCase },
      { label: 'Contains a number', met: hasNumber },
      { label: 'Contains a symbol (!@#$%^&*)', met: hasSymbol },
    ]

    return (
      <div
        className="mb-6 mt-1 rounded-[14px] px-4 py-3.5 space-y-2"
        style={{ backgroundColor: themeColors.background }}
      >
        <p
          className="text-[12px] font-medium"
          style={{ color: themeColors.mid }}
        >
          Password must include:
        </p>
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2.5">
            {req.met ? (
              <Check size={14} strokeWidth={2.5} style={{ color: themeColors.green }} />
            ) : (
              <div className="h-3.5 w-3.5 rounded-full border" style={{ borderColor: themeColors.border }} />
            )}
            <span
              className="text-[12px]"
              style={{
                color: req.met ? themeColors.charcoal : themeColors.mid,
                textDecoration: req.met ? 'none' : 'none',
              }}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // =======================================================
  // RENDER STEP 1
  // =======================================================

  function renderStep1() {
    return (
      <>
        <button
          type="button"
          onClick={handleBackToLogin}
          className="mb-6 flex items-center gap-1 text-[14px] font-semibold transition-opacity duration-200 hover:opacity-70"
          style={{ color: themeColors.green }}
        >
          <ChevronLeft size={17} strokeWidth={2} />
          Back to Login
        </button>

        <div
          className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-[17px]"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <Mail size={32} strokeWidth={2} style={{ color: themeColors.green }} />
        </div>

        <div className="mb-6">
          <h1
            className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            Forgot your password?
          </h1>
          <p
            className="mt-2 text-[14px] leading-[1.65]"
            style={{ color: themeColors.mid }}
          >
            Enter the email address associated with your MOVA account.
          </p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleStep1Submit} noValidate>
          <Input
            label="Email address"
            name="identifier"
            type="email"
            placeholder="Enter your email address"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onBlur={() => setIdentifierTouched(true)}
            error={identifierError}
            touched={identifierTouched}
            required
            autoComplete="email"
          />

          <Button type="submit" loading={isSubmittingStep1}>
            Continue
          </Button>
        </form>

        <p className="mt-5 pb-4 text-center text-[13px]" style={{ color: themeColors.mid }}>
          Remember your password?{' '}
          <button
            type="button"
            onClick={handleBackToLogin}
            className="font-semibold transition-opacity duration-200 hover:opacity-70"
            style={{ color: themeColors.green }}
          >
            Log in
          </button>
        </p>
      </>
    )
  }

  // =======================================================
  // RENDER STEP 2
  // =======================================================

  function renderStep2() {
    return (
      <>
        <button
          type="button"
          onClick={handleBackToStep1}
          className="mb-6 flex items-center gap-1 text-[14px] font-semibold transition-opacity duration-200 hover:opacity-70"
          style={{ color: themeColors.green }}
        >
          <ChevronLeft size={17} strokeWidth={2} />
          Back
        </button>

        <div
          className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-[17px]"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <KeyRound size={32} strokeWidth={2} style={{ color: themeColors.green }} />
        </div>

        <div className="mb-6">
          <h1
            className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            Verify your identity
          </h1>
          <p
            className="mt-2 text-[14px] leading-[1.65]"
            style={{ color: themeColors.mid }}
          >
            We've sent a verification code to:
          </p>
          <p
            className="mt-1 text-[15px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            {maskEmail(email)}
          </p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleStep2Submit} noValidate>
          <Input
            label="Verification code"
            name="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onBlur={() => setOtpTouched(true)}
            error={otpError}
            touched={otpTouched}
            required
            autoComplete="one-time-code"
          />

          <p className="mb-6 mt-1 text-[13px]" style={{ color: themeColors.mid }}>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="font-semibold transition-opacity duration-200 hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: isResending ? themeColors.mid : themeColors.green,
              }}
            >
              {isResending ? 'Resending...' : 'Resend code'}
            </button>
          </p>

          <Button type="submit" loading={isSubmittingStep2}>
            Verify
          </Button>
        </form>
      </>
    )
  }

  // =======================================================
  // RENDER STEP 3
  // =======================================================

  function renderStep3() {
    return (
      <>
        <button
          type="button"
          onClick={handleBackToStep2}
          className="mb-6 flex items-center gap-1 text-[14px] font-semibold transition-opacity duration-200 hover:opacity-70"
          style={{ color: themeColors.green }}
        >
          <ChevronLeft size={17} strokeWidth={2} />
          Back
        </button>

        <div
          className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-[17px]"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <Lock size={32} strokeWidth={2} style={{ color: themeColors.green }} />
        </div>

        <div className="mb-6">
          <h1
            className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            Set new password
          </h1>
          <p
            className="mt-2 text-[14px] leading-[1.65]"
            style={{ color: themeColors.mid }}
          >
            Create a new password for your MOVA account.
          </p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleStep3Submit} noValidate>
          <Input
            label="New password"
            name="newPassword"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            error={passwordError}
            touched={passwordTouched}
            required
            autoComplete="new-password"
          />

          {/* Password Requirements - shows as user types */}
          {newPassword.length > 0 && renderPasswordRequirements()}

          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            error={confirmPasswordError}
            touched={passwordTouched}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            loading={isSubmittingStep3}
            disabled={!isPasswordValid || !confirmPassword || confirmPassword !== newPassword}
          >
            Reset Password
          </Button>
        </form>
      </>
    )
  }

  // =======================================================
  // MAIN RENDER
  // =======================================================

  return (
    <AuthLayout>
      <div className="flex min-h-full flex-col">
        <div className="pt-10 sm:pt-14">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </AuthLayout>
  )
}