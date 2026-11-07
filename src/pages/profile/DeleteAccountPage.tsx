import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import BottomSheet from '../../components/ui/BottomSheet'
import PinModal from '../../components/ui/PinModal'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { UseUserBalance } from '../../hooks/useUserBalance'
import { verifyPin } from '../../services/app/pin'
import {
  getAccountDeletionEligibility,
  requestAccountDeletion,
  type AccountDeletionEligibility,
} from '../../services/app/deletion'
import { PinChallengeType } from '../../types/enums/pinChallengeType'

const RESOLUTION_THRESHOLD = 100
const SESSION_USER_KEY = 'userData'

type SheetKey = 'confirm-delete'

function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(value)
}

function clearUserSession() {
  try {
    sessionStorage.removeItem(SESSION_USER_KEY)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token')
  } catch {
    // best-effort
  }
}

export default function DeleteAccountPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const { userBalance, refresh: refreshBalance } = UseUserBalance()

  const confirmSheet = useBottomSheet<SheetKey>()

  const [reason, setReason] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [understood, setUnderstood] = useState(false)
  const [status] = useState('')

  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const [eligibility, setEligibility] =
    useState<AccountDeletionEligibility | null>(null)
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(true)
  const [eligibilityError, setEligibilityError] = useState<string | null>(null)

  const loadEligibility = useCallback(async () => {
    setIsLoadingEligibility(true)
    setEligibilityError(null)

    try {
      const response = await getAccountDeletionEligibility()

      if (!response.is_success || !response.data) {
        throw new Error(
          response.message ||
            'We could not check your account status right now.'
        )
      }

      setEligibility(response.data)
    } catch (error) {
      setEligibility(null)
      setEligibilityError(
        error instanceof Error
          ? error.message
          : 'We could not check your account status right now.'
      )
    } finally {
      setIsLoadingEligibility(false)
    }
  }, [])

  useEffect(() => {
    void loadEligibility()
  }, [loadEligibility])

  const hasInactiveAccountStatus =
    eligibility?.accountStatus !== null &&
    eligibility?.accountStatus !== undefined

  const hasBlockingMainBalance = userBalance > RESOLUTION_THRESHOLD

  const isEligibleFromBackend =
    eligibility?.canRequestAccountDeletion === true

  const isEligible = isEligibleFromBackend && !hasBlockingMainBalance

  const canSubmit =
    isEligible && understood && confirmation.trim() === 'DELETE'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit) return

    setSubmitError(null)
    confirmSheet.open('confirm-delete')
  }

  function handleConfirm() {
    confirmSheet.close()
    setIsPinModalOpen(true)
  }

  const verifyPinAndDeleteAccount = async (pin: string) => {
    setIsVerifyingPin(true)
    setSubmitError(null)

    try {
      const pinResponse = await verifyPin({
        pin,
        platform: 'web',
        pinChallengeType: PinChallengeType.AccountDeletion,
      })

      if (!pinResponse.is_success) {
        throw new Error(
          pinResponse.message || 'Invalid PIN. Please try again.'
        )
      }

      const deletionResponse = await requestAccountDeletion(reason || undefined)

      if (!deletionResponse.is_success) {
        throw new Error(
          deletionResponse.message ||
            'Failed to submit your account deletion request. Please try again.'
        )
      }

      setIsPinModalOpen(false)

      clearUserSession()
      refreshBalance()

      setShowSuccess(true)
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to verify PIN. Please try again.',
          },
        })
      )
      throw error
    } finally {
      setIsVerifyingPin(false)
    }
  }

  const cardStyle = {
    backgroundColor: themeColors.card,
    borderColor: themeColors.border,
  }

  const headingStyle = {
    color: themeColors.charcoal,
  }

  const mutedStyle = {
    color: themeColors.mid,
  }

  const blockers = eligibility
    ? [
        hasBlockingMainBalance && {
          key: 'main-balance',
          icon: Wallet,
          title: 'Main account balance needs attention',
          description: `Your main MOVA balance is ${formatNaira(
            userBalance
          )}. Balances above ₦${RESOLUTION_THRESHOLD} must be resolved first.`,
          tone: 'red' as const,
        },
        eligibility.walletBalanceNeedsResolution && {
          key: 'wallet-balance',
          icon: Wallet,
          title: 'Wallet balance needs attention',
          description: `Your locked wallet balance across all wallets is ${formatNaira(
            eligibility.walletBalance
          )}. Balances above ₦${RESOLUTION_THRESHOLD} must be resolved first.`,
          tone: 'red' as const,
        },
        eligibility.availableBalanceNeedsResolution && {
          key: 'available-balance',
          icon: Wallet,
          title: 'Available balance across all wallets needs attention',
          description: `Your available balance is ${formatNaira(
            eligibility.walletAvailableBalance
          )}. Balances above ₦${RESOLUTION_THRESHOLD} must be resolved first.`,
          tone: 'red' as const,
        },
        eligibility.scheduleReleaseNeedsResolution && {
          key: 'schedule-release',
          icon: Clock,
          title: 'Pending scheduled release',
          description:
            'You have a scheduled release that is still active. complete it before requesting deletion.',
          tone: 'amber' as const,
        },
        eligibility.activeWalletNeedsResolution && {
          key: 'active-wallet',
          icon: Wallet,
          title: 'Active wallet exists',
          description:
            'Complete all active wallets before requesting deletion.',
          tone: 'amber' as const,
        },
        eligibility.userActionNeedsResolution && {
          key: 'user-action',
          icon: Clock,
          title: 'Transaction in progress',
          description:
            'You have a transaction currently processing. Wait for it to complete before requesting deletion.',
          tone: 'amber' as const,
        },
      ].filter(Boolean)
    : []

  const showAccountStatusView =
    !isLoadingEligibility &&
    !eligibilityError &&
    eligibility &&
    hasInactiveAccountStatus

  const showBlockedView =
    !isLoadingEligibility &&
    !eligibilityError &&
    eligibility &&
    !hasInactiveAccountStatus &&
    !isEligible

  const showEligibleView =
    !isLoadingEligibility &&
    !eligibilityError &&
    eligibility &&
    !hasInactiveAccountStatus &&
    isEligible

  /* ─── Success view ─── */
  if (showSuccess) {
    return (
      <AuthLayout>
        <section className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(15, 185, 110, 0.15)'
                : 'rgba(15, 185, 110, 0.08)',
            }}
          >
            <Heart
              size={38}
              strokeWidth={2}
              style={{ color: themeColors.green }}
            />
          </div>

          <h1
            className="mb-3 text-2xl font-bold"
            style={headingStyle}
          >
            Thank you for choosing MOVA
          </h1>

          <p
            className="mb-6 max-w-md text-sm leading-relaxed"
            style={mutedStyle}
          >
            Your account deletion request has been received. We're sad to see
            you go, but we're grateful you gave MOVA a try.
          </p>

          <div
            className="mb-6 w-full max-w-md rounded-2xl border p-5 text-left"
            style={cardStyle}
          >
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck
                size={18}
                style={{ color: themeColors.green }}
              />
              <p
                className="text-sm font-semibold"
                style={headingStyle}
              >
                What happens next
              </p>
            </div>

            <ul className="space-y-2 text-sm leading-relaxed" style={mutedStyle}>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: themeColors.green }}
                />
                <span>
                  Your session has ended. Any remaining refresh tokens have
                  been revoked.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: themeColors.green }}
                />
                <span>
                  Financial records may be retained where required by law.
                  Personal data will be handled under our Privacy Policy.
                </span>
              </li>
            </ul>
          </div>

          <div
            className="mb-8 w-full max-w-md rounded-2xl border p-5 text-left"
            style={cardStyle}
          >
            <div className="mb-3 flex items-center gap-2">
              <Mail
                size={18}
                style={{ color: themeColors.green }}
              />
              <p
                className="text-sm font-semibold"
                style={headingStyle}
              >
                Changed your mind?
              </p>
            </div>

            <p
              className="text-sm leading-relaxed"
              style={mutedStyle}
            >
              If you ever want to come back, our support team will be happy
              to help you set up a new account. Reach out any time — we'd
              love to have you again.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/support')}
            className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: themeColors.green }}
          >
            <Mail size={16} />
            Contact support
          </button>

          <button
            type="button"
            onClick={() => navigate('/auth/login', { replace: true })}
            className="mt-3 text-sm font-medium transition-opacity hover:opacity-75"
            style={{ color: themeColors.mid }}
          >
            Return to sign in
          </button>
        </section>
      </AuthLayout>
    )
  }

  return (
    <AppLayout>
      <section className="flex flex-col py-10">
        {/* Header */}
        <div className="mb-7 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} variant="subtle" />

          <div>
            <h1 className="text-xl font-bold" style={headingStyle}>
              Delete account
            </h1>

            <p className="mt-0.5 text-xs" style={mutedStyle}>
              Manage your MOVA account
            </p>
          </div>
        </div>

        {/* Warning banner (FIXED CONTRAST) */}
        <div
          className="mb-7 rounded-2xl border p-5"
          style={{
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <div
            className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <Trash2 size={22} style={{ color: '#EF4444' }} />
          </div>

          <h2
            className="mb-2 text-lg font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Are you sure you want to leave MOVA?
          </h2>

          <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
            Deleting your account will begin the process of closing your
            MOVA account. This action may affect your wallet configurations,
            automation settings, and access to your account history.
          </p>

          <p className="mt-3 text-sm font-medium leading-relaxed" style={{ color: themeColors.charcoal }}>
            Please review the information below before continuing.
          </p>
        </div>

        {/* Loading */}
        {isLoadingEligibility && (
          <div
            className="mb-7 flex items-center gap-3 rounded-xl border p-4"
            style={cardStyle}
          >
            <Loader2
              size={18}
              className="animate-spin"
              style={{ color: themeColors.mid }}
            />
            <p className="text-sm" style={mutedStyle}>
              Checking your account…
            </p>
          </div>
        )}

        {/* Error (FIXED CONTRAST) */}
        {!isLoadingEligibility && eligibilityError && (
          <div
            className="mb-7 rounded-xl border p-4"
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle
                size={17}
                style={{ color: '#EF4444' }}
              />
              <p className="text-sm font-semibold" style={{ color: themeColors.charcoal }}>
                We couldn't check your account status
              </p>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
              {eligibilityError}
            </p>

            <button
              type="button"
              onClick={() => void loadEligibility()}
              className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Account status gate (FIXED CONTRAST) */}
        {showAccountStatusView && eligibility && (
          <div
            className="mb-7 rounded-xl border p-5"
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <div
              className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              }}
            >
              <AlertTriangle
                size={20}
                style={{ color: '#EF4444' }}
              />
            </div>

            <h2 className="mb-2 text-base font-bold" style={{ color: themeColors.charcoal }}>
              {eligibility.accountStatusLabel ?? 'Account not active'}
            </h2>

            <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
              {eligibility.accountStatusDescription ??
                'Your account is not in an active state and cannot request deletion at this time.'}
            </p>

            <button
              type="button"
              onClick={() => void loadEligibility()}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
            >
              <RefreshCw size={13} />
              Refresh status
            </button>
          </div>
        )}

        {/* Blocked view */}
        {showBlockedView && (
          <div className="mb-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold" style={headingStyle}>
                What you need to do first
              </h2>

              <button
                type="button"
                onClick={() => void loadEligibility()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-75"
                style={{ color: themeColors.green }}
              >
                <RefreshCw size={13} />
                Refresh
              </button>
            </div>

            <p className="mb-4 text-sm leading-relaxed" style={mutedStyle}>
              Your account still has open items that need to be resolved
              before you can request deletion. Once they're cleared, come
              back to this page and the delete option will become
              available.
            </p>

            <div className="space-y-3">
              {blockers.map((blocker) => {
                if (!blocker) return null
                const Icon = blocker.icon

                return (
                  <div
                    key={blocker.key}
                    className="rounded-xl border p-4"
                    style={cardStyle}
                  >
                    <div className="flex items-start gap-3">
                      {/* FIXED ICON CONTRAST HERE */}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor:
                            blocker.tone === 'red'
                              ? (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)')
                              : (isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)'),
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color: blocker.tone === 'red' ? '#EF4444' : '#F59E0B',
                          }}
                        />
                      </div>

                      <div>
                        <h3
                          className="mb-1 text-sm font-semibold"
                          style={headingStyle}
                        >
                          {blocker.title}
                        </h3>

                        <p
                          className="text-sm leading-relaxed"
                          style={mutedStyle}
                        >
                          {blocker.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Eligible view */}
        {showEligibleView && (
          <>
            <div
              className="mb-7 rounded-xl border p-4"
              style={{
                backgroundColor: isDark ? 'rgba(15, 185, 110, 0.1)' : 'rgba(15, 185, 110, 0.05)',
                borderColor: isDark ? 'rgba(15, 185, 110, 0.3)' : 'rgba(15, 185, 110, 0.2)',
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  style={{ color: themeColors.green }}
                />
                <p className="text-sm font-semibold" style={{ color: themeColors.charcoal }}>
                  You're clear to request deletion
                </p>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                No blocking balances or activity were found. Complete the
                form below to continue.
              </p>
            </div>

            <div className="mb-7">
              <h2
                className="mb-4 text-base font-semibold"
                style={headingStyle}
              >
                Before you delete your account
              </h2>

              <div className="space-y-3">
                <div
                  className="flex items-start gap-3 rounded-xl border p-4"
                  style={cardStyle}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)' }}
                  >
                    <Wallet
                      size={19}
                      style={{ color: '#EF4444' }}
                    />
                  </div>

                  <div>
                    <h3
                      className="mb-1 text-sm font-semibold"
                      style={headingStyle}
                    >
                      Wallets and automation
                    </h3>

                    <p
                      className="text-sm leading-relaxed"
                      style={mutedStyle}
                    >
                      Your wallet configurations and automation settings
                      may no longer be accessible after closure.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start gap-3 rounded-xl border p-4"
                  style={cardStyle}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(96, 165, 250, 0.08)' }}
                  >
                    <FileText
                      size={19}
                      style={{ color: '#60A5FA' }}
                    />
                  </div>

                  <div>
                    <h3
                      className="mb-1 text-sm font-semibold"
                      style={headingStyle}
                    >
                      Financial records and personal data
                    </h3>

                    <p
                      className="text-sm leading-relaxed"
                      style={mutedStyle}
                    >
                      We will handle your personal information according to
                      our Privacy Policy. Certain records may need to be
                      retained where required by law.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mb-7 flex items-start gap-3 rounded-xl border p-4"
              style={cardStyle}
            >
              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0"
                style={{ color: themeColors.green }}
              />

              <div>
                <h3
                  className="mb-1 text-sm font-semibold"
                  style={headingStyle}
                >
                  Your request will be reviewed
                </h3>

                <p className="text-sm leading-relaxed" style={mutedStyle}>
                  Account closure should be handled securely. Additional
                  verification may be required, and the process may take
                  time if legal retention obligations remain unresolved.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="deletion-reason"
                  className="mb-2 block text-sm font-semibold"
                  style={headingStyle}
                >
                  Why are you leaving?
                  <span
                    className="ml-2 text-xs font-normal"
                    style={mutedStyle}
                  >
                    Optional
                  </span>
                </label>

                <select
                  id="deletion-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeColors.card,
                    color: themeColors.charcoal,
                    borderColor: themeColors.border,
                  }}
                >
                  <option value="">Select a reason</option>
                  <option value="not-needed">I no longer need MOVA</option>
                  <option value="difficult">MOVA is difficult to use</option>
                  <option value="features">Missing features</option>
                  <option value="privacy">
                    Privacy or security concerns
                  </option>
                  <option value="other-service">I use another service</option>
                  <option value="other">Other reason</option>
                </select>

                <p className="mt-2 text-xs" style={mutedStyle}>
                  Your feedback helps us improve MOVA.
                </p>
              </div>

              <label
                className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4"
                style={cardStyle}
              >
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(event) =>
                    setUnderstood(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-red-600"
                />

                <span
                  className="text-sm leading-relaxed"
                  style={headingStyle}
                >
                  I understand that closing my account may affect my access
                  to MOVA, and that some financial or transaction records
                  may be retained where legally required.
                </span>
              </label>

              <div className="mb-6">
                <label
                  htmlFor="delete-confirmation"
                  className="mb-2 block text-sm font-semibold"
                  style={headingStyle}
                >
                  Confirm account deletion
                </label>

                <p
                  className="mb-3 text-sm leading-relaxed"
                  style={mutedStyle}
                >
                  Type{' '}
                  <span className="font-bold" style={headingStyle}>
                    DELETE
                  </span>{' '}
                  in the field below to confirm that you want to proceed.
                </p>

                <input
                  id="delete-confirmation"
                  type="text"
                  value={confirmation}
                  onChange={(event) =>
                    setConfirmation(event.target.value)
                  }
                  placeholder="Type DELETE"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeColors.card,
                    color: themeColors.charcoal,
                    borderColor: themeColors.border,
                  }}
                />
              </div>

              {status && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border p-4 text-sm leading-relaxed"
                  style={{
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)',
                    color: themeColors.charcoal,
                  }}
                >
                  {status}
                </div>
              )}

              {submitError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border p-4 text-sm leading-relaxed"
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
                    color: themeColors.charcoal,
                  }}
                >
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: !canSubmit
                    ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                    : '#DC2626',
                  color: !canSubmit
                    ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')
                    : '#FFFFFF'
                }}
              >
                <Trash2 size={17} />
                Request account deletion
                <ArrowRight size={17} />
              </button>
            </form>
          </>
        )}

        {/* Cancel action */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-75"
          style={{
            color: themeColors.charcoal,
            borderColor: themeColors.border,
          }}
        >
          <CheckCircle2 size={17} />
          Keep my account
        </button>

        {/* Support */}
        <div className="mt-8 text-center">
          <div className="mb-2 flex justify-center">
            <AlertTriangle size={18} style={{ color: themeColors.mid }} />
          </div>

          <p className="text-sm font-medium" style={headingStyle}>
            Need help before deciding?
          </p>

          <p className="mt-1 text-sm leading-relaxed" style={mutedStyle}>
            Contact MOVA support if you have questions about your account,
            pending transactions, or personal data.
          </p>

          <button
            type="button"
            onClick={() => navigate('/legal/privacy')}
            className="mt-3 text-sm font-semibold underline underline-offset-4"
            style={{ color: themeColors.green }}
          >
            Read our Privacy Policy
          </button>
        </div>
      </section>

      {/* ─── Confirmation BottomSheet ─── */}
      <BottomSheet
        isOpen={confirmSheet.activeSheet === 'confirm-delete'}
        onClose={confirmSheet.close}
        title="Confirm account deletion"
        icon={<Trash2 size={16} strokeWidth={2.4} />}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={confirmSheet.close}
              className="flex-1 rounded-[12px] border px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-70"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.card,
                color: themeColors.charcoal,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
            >
              Continue
              <ArrowRight size={15} />
            </button>
          </div>
        }
      >
        <div style={{ color: themeColors.charcoal }}>
          <div
            className="rounded-[12px] border p-3"
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <p className="text-[13px] font-semibold" style={{ color: '#EF4444' }}>
              This action cannot be undone.
            </p>
            <p className="mt-1 text-[12px] leading-[1.5]" style={{ color: themeColors.mid }}>
              You're about to start the process of permanently closing your
              MOVA account.
            </p>
          </div>

          {reason && (
            <div
              className="mt-3 rounded-[12px] border p-3"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB',
                borderColor: themeColors.border,
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: themeColors.mid }}
              >
                Reason
              </p>
              <p
                className="mt-1 text-[13px] capitalize"
                style={{ color: themeColors.charcoal }}
              >
                {reason.replace(/-/g, ' ')}
              </p>
            </div>
          )}

          <div
            className="mt-3 flex items-start gap-2.5 rounded-[12px] border p-3"
            style={{
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)',
            }}
          >
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0"
              style={{ color: '#F59E0B' }}
            />
            <p className="text-[12px] leading-[1.55]" style={{ color: themeColors.charcoal }}>
              You'll be asked to enter your transaction PIN next to confirm this request.
            </p>
          </div>
        </div>
      </BottomSheet>

      {/* PIN Verification Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        title="Confirm account deletion"
        description="Enter your transaction PIN to confirm deleting your account."
        onClose={() => setIsPinModalOpen(false)}
        onVerify={verifyPinAndDeleteAccount}
        isLoading={isVerifyingPin}
        maxLength={6}
      />
    </AppLayout>
  )
}