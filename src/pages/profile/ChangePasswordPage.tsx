import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Check,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { changePassword } from '../../services/app/profile'

type Step = 'form' | 'success'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [step, setStep] = useState<Step>('form')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordChecks = {
    length: newPassword.length >= 8,
    hasNumber: /\d/.test(newPassword),
    hasUppercase: /[A-Z]/.test(newPassword),
    hasLowercase: /[a-z]/.test(newPassword),
  }

  const isPasswordValid =
    passwordChecks.length &&
    passwordChecks.hasNumber &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasLowercase

  const isNewPasswordDifferent = newPassword !== currentPassword

  const canSubmit =
    currentPassword &&
    isPasswordValid &&
    isNewPasswordDifferent &&
    newPassword === confirmPassword

  const handleSubmit = async () => {
    setError(null)

    if (!currentPassword) {
      setError('Please enter your current password')
      return
    }

    if (!isPasswordValid) {
      setError('New password does not meet the requirements')
      return
    }

    if (!isNewPasswordDifferent) {
      setError('New password must be different from your current password')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await changePassword({
        oldPassword: currentPassword,
        newPassword,
        confirmPassword,
      })

      if (!response.is_success) {
        throw new Error(
          response.message || 'Failed to change password.'
        )
      }

      setStep('success')

      const successEvent = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Password changed successfully.',
        },
      })
      window.dispatchEvent(successEvent)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Success screen ────────────────────────────────
  if (step === 'success') {
    return (
      <AppLayout>
        <section className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center px-6 pb-24 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.greenLight }}
          >
            <CheckCircle
              size={40}
              strokeWidth={2}
              style={{ color: themeColors.green }}
            />
          </div>

          <h1
            className="mt-5 text-[24px] font-extrabold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            Password changed
          </h1>

          <p
            className="mt-2 max-w-[320px] text-[14px] leading-[1.55]"
            style={{ color: themeColors.mid }}
          >
            Your password has been updated successfully. Use your new password
            next time you log in.
          </p>

          <div className="mt-8 w-full max-w-[320px]">
            <Button
              type="button"
              onClick={() => navigate('/settings')}
            >
              Back to Settings
            </Button>
          </div>
        </section>
      </AppLayout>
    )
  }

  // ─── Form ──────────────────────────────────────────
  return (
    <AppLayout>
      <section
        className="flex min-h-[calc(100vh-150px)] flex-col"
        style={{ color: themeColors.charcoal }}
      >
        {/* Header */}
        <div className="px-2 pt-6 text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mx-auto mb-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95"
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.charcoal,
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          {/* Icon */}
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[16px]"
            style={{ backgroundColor: themeColors.greenLight }}
          >
            <Shield size={26} style={{ color: themeColors.green }} />
          </div>

          {/* Heading */}
          <h1
            className="mb-2 text-[24px] font-extrabold tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            Change your password
          </h1>

          <p
            className="mx-auto mb-8 max-w-[340px] text-[14px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            Enter your current password, then choose a new one.
          </p>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-[380px] px-2 pb-24 text-left">
          {/* Current password */}
          <div className="mb-4">
            <label
              className="mb-1.5 block text-[13px] font-medium"
              style={{ color: themeColors.charcoal }}
            >
              Current password
            </label>

            <div
              className="flex items-center rounded-[12px] border px-3 transition-all"
              style={{
                borderColor: error
                  ? themeColors.red
                  : currentPassword
                    ? themeColors.green
                    : themeColors.border,
                backgroundColor: themeColors.card,
              }}
            >
              <Lock size={16} style={{ color: themeColors.mid }} />
              <input
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Enter current password"
                className="w-full border-0 bg-transparent py-3 pl-2 text-[14px] outline-none"
                style={{ color: themeColors.charcoal }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="cursor-pointer rounded-full p-1 transition-all hover:opacity-70"
                style={{ color: themeColors.mid }}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="mb-4">
            <label
              className="mb-1.5 block text-[13px] font-medium"
              style={{ color: themeColors.charcoal }}
            >
              New password
            </label>

            <div
              className="flex items-center rounded-[12px] border px-3 transition-all"
              style={{
                borderColor: error
                  ? themeColors.red
                  : newPassword
                    ? themeColors.green
                    : themeColors.border,
                backgroundColor: themeColors.card,
              }}
            >
              <Lock size={16} style={{ color: themeColors.mid }} />
              <input
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Enter new password"
                className="w-full border-0 bg-transparent py-3 pl-2 text-[14px] outline-none"
                style={{ color: themeColors.charcoal }}
              />
              <button
                type="button"
                onClick={() => setShowNew((prev) => !prev)}
                className="cursor-pointer rounded-full p-1 transition-all hover:opacity-70"
                style={{ color: themeColors.mid }}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {newPassword && !isNewPasswordDifferent && (
              <p
                className="mt-1.5 text-[11px]"
                style={{ color: themeColors.warning }}
              >
                New password must be different from your current password
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="mb-4">
            <label
              className="mb-1.5 block text-[13px] font-medium"
              style={{ color: themeColors.charcoal }}
            >
              Confirm new password
            </label>

            <div
              className="flex items-center rounded-[12px] border px-3 transition-all"
              style={{
                borderColor: error
                  ? themeColors.red
                  : confirmPassword && confirmPassword === newPassword
                    ? themeColors.green
                    : themeColors.border,
                backgroundColor: themeColors.card,
              }}
            >
              <Lock size={16} style={{ color: themeColors.mid }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Confirm new password"
                className="w-full border-0 bg-transparent py-3 pl-2 text-[14px] outline-none"
                style={{ color: themeColors.charcoal }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="cursor-pointer rounded-full p-1 transition-all hover:opacity-70"
                style={{ color: themeColors.mid }}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {confirmPassword && confirmPassword !== newPassword && (
              <p
                className="mt-1.5 text-[11px]"
                style={{ color: themeColors.red }}
              >
                Passwords do not match
              </p>
            )}
          </div>

          {/* Password requirements */}
          <div
            className="mb-4 rounded-[12px] p-3"
            style={{ backgroundColor: themeColors.background }}
          >
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.mid }}
            >
              Password must contain
            </p>

            <ul className="space-y-1.5">
              {[
                {
                  label: 'At least 8 characters',
                  met: passwordChecks.length,
                },
                {
                  label: 'At least one number',
                  met: passwordChecks.hasNumber,
                },
                {
                  label: 'At least one uppercase letter',
                  met: passwordChecks.hasUppercase,
                },
                {
                  label: 'At least one lowercase letter',
                  met: passwordChecks.hasLowercase,
                },
              ].map((check) => (
                <li
                  key={check.label}
                  className="flex items-center gap-2"
                >
                  <div
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: check.met
                        ? themeColors.green
                        : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.05)',
                      color: check.met
                        ? '#FFFFFF'
                        : themeColors.mid,
                    }}
                  >
                    {check.met && <Check size={10} strokeWidth={3} />}
                  </div>
                  <span
                    className="text-[12px]"
                    style={{
                      color: check.met
                        ? themeColors.charcoal
                        : themeColors.mid,
                    }}
                  >
                    {check.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 flex items-start gap-2 rounded-[12px] px-3 py-2.5"
              style={{
                color: themeColors.red,
                backgroundColor: themeColors.redBackground,
              }}
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-[13px]">{error}</p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText="Changing password..."
            disabled={!canSubmit || isSubmitting}
          >
            Change Password
          </Button>
        </div>
      </section>
    </AppLayout>
  )
}