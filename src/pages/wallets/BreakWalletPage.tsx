import { ChevronLeft, Shield, Frown, PauseCircle, PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { colors, darkColors } from '../../styles/tokens'
import { breakWallet, pauseWallet } from '../../services/app/wallet'
import { verifyPin } from '../../services/app/pin'

interface BreakWalletState {
  walletId: number
  walletName: string
  categoryIcon: string
  lockedAmount: number
  walletStatus: string
}

const BREAK_FEE_PERCENT = 0.02

type PendingAction = 'break' | 'toggle' | null

export default function BreakWalletPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const getIcon = useCategoryIcon()
  const themeColors = isDark ? darkColors : colors

  const [showPauseConfirm, setShowPauseConfirm] = useState(false)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)

  const state = location.state as BreakWalletState | undefined

  useEffect(() => {
    if (!state) {
      navigate('/wallets', { replace: true })
    }
  }, [state, navigate])

  if (!state) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center py-5 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(15, 185, 110, 0.15)'
                : 'rgba(15, 185, 110, 0.08)',
              color: themeColors.mid,
            }}
          >
            <Frown size={32} strokeWidth={1.5} />
          </div>
          <p
            className="mt-4 text-[15px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            Wallet not found
          </p>
          <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
            Redirecting you back...
          </p>
        </div>
      </AppLayout>
    )
  }

  const {
    walletId,
    walletName,
    categoryIcon,
    lockedAmount,
    walletStatus,
  } = state

  const Icon = getIcon(categoryIcon)

  const isPaused = walletStatus?.toLowerCase() === 'paused'

  const breakFee = lockedAmount * BREAK_FEE_PERCENT
  const netAmount = lockedAmount - breakFee

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // ─── Break flow ────────────────────────────────────────
  const handleRequestWithdrawal = () => {
    setPendingAction('break')
    setIsPinModalOpen(true)
  }

  // ─── Toggle pause/resume flow ──────────────────────────
  const handleToggleClick = () => {
    setShowPauseConfirm(true)
  }

  const handleToggleConfirm = () => {
    setShowPauseConfirm(false)
    setPendingAction('toggle')
    setIsPinModalOpen(true)
  }

  const handleToggleCancel = () => {
    setShowPauseConfirm(false)
  }

  const handleKeepProtected = () => {
    navigate(`/wallet/${walletId}`)
  }

  // ─── PIN verification → fire the actual endpoint ───────
  const handlePinVerification = async (pin: string) => {
    setIsVerifyingPin(true)

    try {
      const pinResponse = await verifyPin({ pin, platform: 'web' })

      if (!pinResponse.is_success) {
        throw new Error(
          pinResponse.message || 'Invalid PIN. Please try again.'
        )
      }

      if (pendingAction === 'break') {
        const response = await breakWallet(walletId)

        if (!response.is_success) {
          throw new Error(
            response.message || 'Failed to break wallet.'
          )
        }

        const successEvent = new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: `Wallet broken. ${formatCurrency(netAmount)} will be sent to your linked bank account.`,
          },
        })
        window.dispatchEvent(successEvent)

        setIsPinModalOpen(false)
        setPendingAction(null)
        navigate('/wallets')
        return
      }

      if (pendingAction === 'toggle') {
        const response = await pauseWallet(walletId)

        if (!response.is_success) {
          throw new Error(
            response.message ||
              `Failed to ${isPaused ? 'resume' : 'pause'} schedule.`
          )
        }

        const successEvent = new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: isPaused
              ? 'Schedule resumed. Releases will continue as planned.'
              : 'Schedule paused. All upcoming releases are on hold.',
          },
        })
        window.dispatchEvent(successEvent)

        setIsPinModalOpen(false)
        setPendingAction(null)
        navigate(`/wallet/${walletId}`)
        return
      }

      throw new Error('No action selected.')
    } catch (err) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'Something went wrong. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)

      throw err
    } finally {
      setIsVerifyingPin(false)
    }
  }

  const handlePinModalClose = () => {
    setIsPinModalOpen(false)
    setPendingAction(null)
  }

  return (
    <AppLayout>
      <div
        className="flex min-h-full flex-col"
        style={{ color: themeColors.charcoal }}
      >
        {/* Warning Header */}
        <div
          className="shrink-0 border-b px-5 pb-5 pt-12"
          style={{
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : '#FFF8F0',
            borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FDDCB5',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
            >
              <ChevronLeft size={22} style={{ color: themeColors.charcoal }} />
            </button>
            <div
              className="rounded-[10px] p-2"
              style={{
                backgroundColor: isDark
                  ? 'rgba(245, 158, 11, 0.2)'
                  : '#FEE8C8',
              }}
            >
              <Shield size={20} style={{ color: themeColors.warning }} />
            </div>
            <h1
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Break this wallet?
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Wallet Info Card */}
          <div
            className="mb-5 rounded-[16px] p-5"
            style={{
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`,
              borderLeft: `4px solid ${themeColors.warning}`,
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                <Icon size={18} strokeWidth={2} />
              </div>
              <div>
                <p
                  className="text-[16px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  {walletName}
                </p>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase"
                  style={{
                    backgroundColor: `${themeColors.warning}20`,
                    color: themeColors.warning,
                  }}
                >
                  Protected
                </span>
              </div>
            </div>
            <p className="mb-2 text-[13px]" style={{ color: themeColors.mid }}>
              Protected amount
            </p>
            <p
              className="amount text-[28px] font-extrabold"
              style={{
                color: themeColors.charcoal,
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {formatCurrency(lockedAmount)}
            </p>
          </div>

          {/* Warning Message */}
          <div
            className="mb-4 rounded-[14px] p-4"
            style={{ backgroundColor: themeColors.warningBackground }}
          >
            <p
              className="mb-1 text-[14px] font-semibold"
              style={{ color: '#92400E' }}
            >
              ⚠️ This money was protected for your{' '}
              {walletName.toLowerCase()} budget.
            </p>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: '#92400E' }}
            >
              Breaking this wallet releases the funds to your linked bank
              account. A <strong>2% breaking fee</strong> will be deducted
              from the amount.
            </p>
            <p
              className="mt-2 text-[13px] leading-relaxed"
              style={{ color: '#92400E' }}
            >
              This fee is designed to{' '}
              <strong>discourage impulsive withdrawals</strong> and help you
              stay disciplined with your budget. The longer you keep your
              money protected, the more you grow.
            </p>
          </div>

          {/* Withdrawal Details */}
          <div
            className="mb-6 rounded-[16px] p-5"
            style={{
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[14px]" style={{ color: themeColors.mid }}>
                Withdrawal amount
              </p>
              <p
                className="amount text-[16px] font-bold"
                style={{
                  color: themeColors.charcoal,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(lockedAmount)}
              </p>
            </div>

            <div
              className="mb-3.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[14px]" style={{ color: themeColors.mid }}>
                Breaking fee (2%)
              </p>
              <p
                className="amount text-[16px] font-bold"
                style={{
                  color: themeColors.warning,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                -{formatCurrency(breakFee)}
              </p>
            </div>

            <div
              className="mb-3.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <p
                className="text-[14px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                You receive
              </p>
              <p
                className="amount text-[18px] font-extrabold"
                style={{
                  color: themeColors.green,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2.5">
            {/* 1. Request Withdrawal */}
            <button
              type="button"
              onClick={handleRequestWithdrawal}
              className="w-full cursor-pointer rounded-[14px] border-none px-4 py-4 text-[16px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
              style={{
                backgroundColor: themeColors.warning,
                color: '#FFFFFF',
              }}
            >
              Request Withdrawal
            </button>

            {/* 2. Toggle Pause / Resume */}
            <button
              type="button"
              onClick={handleToggleClick}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border px-4 py-4 text-[15px] font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.99]"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                color: themeColors.charcoal,
              }}
            >
              {isPaused ? (
                <>
                  <PlayCircle size={18} strokeWidth={2} />
                  Resume the Schedule
                </>
              ) : (
                <>
                  <PauseCircle size={18} strokeWidth={2} />
                  Pause the Schedule
                </>
              )}
            </button>

            {/* 3. Keep My Money Protected */}
            <Button variant="secondary" onClick={handleKeepProtected}>
              Keep My Money Protected
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle Confirmation Modal */}
      {showPauseConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleToggleCancel}
        >
          <div
            className="w-full max-w-[380px] rounded-[20px] p-6"
            style={{
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isPaused
                    ? isDark
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(34, 197, 94, 0.08)'
                    : isDark
                      ? 'rgba(96, 165, 250, 0.15)'
                      : 'rgba(96, 165, 250, 0.08)',
                  color: isPaused ? themeColors.green : '#60A5FA',
                }}
              >
                {isPaused ? (
                  <PlayCircle size={28} strokeWidth={2} />
                ) : (
                  <PauseCircle size={28} strokeWidth={2} />
                )}
              </div>
            </div>

            <h2
              className="mt-4 text-center text-[18px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              {isPaused ? 'Resume this schedule?' : 'Pause this schedule?'}
            </h2>

            <p
              className="mt-2 text-center text-[13px] leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              {isPaused ? (
                <>
                  Releases for{' '}
                  <strong style={{ color: themeColors.charcoal }}>
                    {walletName}
                  </strong>{' '}
                  will continue as originally scheduled.
                </>
              ) : (
                <>
                  All upcoming releases for{' '}
                  <strong style={{ color: themeColors.charcoal }}>
                    {walletName}
                  </strong>{' '}
                  will be placed on hold. Your money stays protected and you
                  can resume anytime.
                </>
              )}
            </p>

            <div
              className="mt-4 rounded-[12px] p-3"
              style={{ backgroundColor: themeColors.background }}
            >
              <ul className="space-y-2">
                {isPaused ? (
                  <>
                    <li className="flex items-start gap-2">
                      <div
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: themeColors.green }}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: themeColors.charcoal }}
                      >
                        Releases will resume on the next scheduled date
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: themeColors.green }}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: themeColors.charcoal }}
                      >
                        Missed releases will be caught up automatically
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: themeColors.green }}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: themeColors.charcoal }}
                      >
                        You can pause again at any time
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <div
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: '#60A5FA' }}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: themeColors.charcoal }}
                      >
                        No releases will happen while paused
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: '#60A5FA' }}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: themeColors.charcoal }}
                      >
                        Your locked funds remain safe and untouched
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: '#60A5FA' }}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: themeColors.charcoal }}
                      >
                        You can resume the schedule anytime
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleToggleConfirm}
                className="w-full cursor-pointer rounded-[14px] border-none px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
                style={{
                  backgroundColor: isPaused ? themeColors.green : '#60A5FA',
                  color: '#FFFFFF',
                }}
              >
                {isPaused ? 'Yes, Resume Schedule' : 'Yes, Pause Schedule'}
              </button>

              <button
                type="button"
                onClick={handleToggleCancel}
                className="w-full cursor-pointer rounded-[14px] border px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.99]"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description={
          pendingAction === 'break'
            ? 'Enter your PIN to confirm breaking this wallet.'
            : isPaused
              ? 'Enter your PIN to confirm resuming this schedule.'
              : 'Enter your PIN to confirm pausing this schedule.'
        }
        onClose={handlePinModalClose}
        onVerify={handlePinVerification}
        isLoading={isVerifyingPin}
        maxLength={6}
      />
    </AppLayout>
  )
}