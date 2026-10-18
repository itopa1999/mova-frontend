import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  Target,
  FileText,
  Shield,
  Landmark,
  Lock,
  CheckCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { verifyPin } from '../../services/app/pin'
import { PinChallengeType } from '../../types/enums/pinChallengeType'
import { formatCurrency, formatUSDateTime } from '../../utils/formatting'
import {
  getTrusteeWalletDetail,
  requestRelease,
  type TrusteeWalletDetail,
} from '../../services/app/trusteeWallet'
import {
  getWalletBankAccount,
  type BankAccountData,
} from '../../services/app/wallet'

interface RequestReleaseRouteState {
  walletId: number
  walletName: string
  categoryIcon: string
  lockedAmount: number
  trusteeName: string | null
  trusteeEmail: string
}

export default function TrusteeRequestRelease() {
  const navigate = useNavigate()
  const { walletId } = useParams<{ walletId: string }>()
  const location = useLocation()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const routeState = location.state as RequestReleaseRouteState | null

  const [walletDetail, setWalletDetail] =
    useState<TrusteeWalletDetail | null>(null)
  const [bank, setBank] = useState<BankAccountData | null>(null)
  const [isFetching, setIsFetching] = useState(!routeState)

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [createdRequest, setCreatedRequest] = useState<{
    requestId: number
    amount: number
    expiresAt: string
  } | null>(null)

  const [errors, setErrors] = useState<{ amount?: string }>({})

  /* ─── Derived — prefer route state for instant paint, fall back to fetched ─── */

  const walletName = walletDetail?.name ?? routeState?.walletName ?? ''
  const lockedAmount =
    walletDetail?.lockedAmount ?? routeState?.lockedAmount ?? 0
  const trusteeName =
    walletDetail?.trustee?.name ?? routeState?.trusteeName ?? null
  const trusteeEmail =
    walletDetail?.trustee?.email ?? routeState?.trusteeEmail ?? ''
  const isTrusteeVerified =
    walletDetail?.trustee?.status === 'Verified' ||
    (routeState !== null && routeState.trusteeEmail !== '')

  const parsedAmount = parseInt(amount || '0', 10)
  const exceedsLocked = parsedAmount > lockedAmount

  const trusteeDisplayName =
    trusteeName && trusteeName.trim().length > 0
      ? trusteeName
      : trusteeEmail.split('@')[0] || '—'

  /* ─── Fetch bank + wallet detail (in parallel) ─── */

  useEffect(() => {
    if (!walletId) return
    const id = Number(walletId)
    if (!Number.isFinite(id) || id <= 0) return

    const load = async () => {
      try {
        const [bankRes, walletRes] = await Promise.all([
          getWalletBankAccount(id),
          getTrusteeWalletDetail(id),
        ])

        if (bankRes.is_success && bankRes.data) setBank(bankRes.data)
        if (walletRes.is_success && walletRes.data)
          setWalletDetail(walletRes.data)
      } catch (err) {
        console.error('Failed to load release context', err)
      } finally {
        setIsFetching(false)
      }
    }

    load()
  }, [walletId])

  /* ─── Handlers ─── */

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '')
    setAmount(numeric)
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
  }

  const handleUseMax = () => {
    setAmount(String(lockedAmount))
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
  }

  const handleOpenPin = () => {
    if (!parsedAmount || parsedAmount < 100) {
      setErrors({ amount: 'Minimum release amount is ₦100' })
      return
    }
    if (parsedAmount > lockedAmount) {
      setErrors({
        amount: `Amount cannot exceed ₦${lockedAmount.toLocaleString()}`,
      })
      return
    }
    if (!isTrusteeVerified) {
      setSubmitError('Your trustee has not verified their email yet.')
      return
    }
    setSubmitError(null)
    setIsPinModalOpen(true)
  }

  const verifyPinAndSubmit = async (pin: string) => {
    setIsVerifyingPin(true)
    setSubmitError(null)

    try {
      const pinRes = await verifyPin({
        pin,
        platform: 'web',
        pinChallengeType: PinChallengeType.RequestRelease,
      })

      if (!pinRes.is_success) {
        throw new Error(pinRes.message || 'Invalid PIN. Please try again.')
      }

      const res = await requestRelease(Number(walletId), {
        amount: parsedAmount,
        userNote: note.trim() || undefined,
      })

      if (!res.is_success || !res.data) {
        throw new Error(
          res.message || 'Failed to send request. Please try again.'
        )
      }

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: 'Release request sent to your trustee.',
          },
        })
      )

      setIsPinModalOpen(false)
      setCreatedRequest({
        requestId: res.data.requestId,
        amount: res.data.amount,
        expiresAt: res.data.expiresAt,
      })
      setShowSuccess(true)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send request. Please try again.'

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message },
        })
      )
      setSubmitError(message)
      throw error
    } finally {
      setIsVerifyingPin(false)
    }
  }

  /* ─── Loading ─── */

  if (isFetching && !routeState) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: themeColors.green }}
          />
        </div>
      </AppLayout>
    )
  }

  /* ─── Success ─── */

  if (showSuccess && createdRequest) {
    return (
      <AppLayout>
        <div className="flex min-h-[75vh] flex-col items-center justify-center px-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.15)'
                : 'rgba(96, 165, 250, 0.08)',
            }}
          >
            <Shield
              size={40}
              strokeWidth={2.4}
              style={{ color: '#60A5FA' }}
            />
          </div>

          <h2
            className="mt-5 text-center text-[22px] font-bold leading-tight"
            style={{ color: themeColors.charcoal }}
          >
            Request sent
          </h2>

          <p
            className="mt-3 max-w-[320px] text-center text-[14px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>
              {trusteeDisplayName}
            </span>{' '}
            has been emailed. They have 3 hours to approve or reject this
            request.
          </p>

          <div
            className="mt-6 w-full max-w-[380px] rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Amount
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(createdRequest.amount)}
              </span>
            </div>

            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Trustee
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {trusteeDisplayName}
              </span>
            </div>

            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Expires
              </span>
              <span
                className="text-[12px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                {formatUSDateTime(createdRequest.expiresAt)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/dashboard/trustee/wallet/${walletId}`, {
                replace: true,
              })
            }
            className="mt-6 flex w-full max-w-[380px] items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            <CheckCircle size={18} />
            Back to wallet
          </button>
        </div>
      </AppLayout>
    )
  }

  /* ─── Form ─── */

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        <div className="mb-6 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />
          <div>
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Request Release
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              {walletName}
            </p>
          </div>
        </div>

        {/* Amount hero */}
        <div
          className="rounded-[20px] p-5 text-center"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.25) 0%, rgba(96, 165, 250, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(96, 165, 250, 0.04) 100%)',
            border: `1px solid ${
              isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(96, 165, 250, 0.2)'
            }`,
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Target size={16} style={{ color: '#60A5FA' }} />
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: '#60A5FA' }}
            >
              Amount to request
            </p>
          </div>

          <div className="mt-2 flex items-center justify-center">
            <span
              className="text-[28px] font-bold"
              style={{ color: themeColors.mid }}
            >
              ₦
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="ml-1 w-full max-w-[260px] border-0 bg-transparent text-center font-bold outline-none placeholder:opacity-50"
              style={{
                color: themeColors.charcoal,
                fontSize: 'clamp(32px, 10vw, 44px)',
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.03em',
              }}
              autoFocus
            />
          </div>

          <div className="mt-2 flex items-center justify-center gap-2">
            <p className="text-[12px]" style={{ color: themeColors.mid }}>
              Max: {formatCurrency(lockedAmount)}
            </p>
            <button
              type="button"
              onClick={handleUseMax}
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all hover:opacity-80"
              style={{
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.2)'
                  : 'rgba(96, 165, 250, 0.1)',
                color: '#60A5FA',
              }}
            >
              Use max
            </button>
          </div>
        </div>

        {errors.amount && (
          <p
            className="mt-2 text-center text-[11px]"
            style={{ color: '#EF4444' }}
          >
            {errors.amount}
          </p>
        )}
        {exceedsLocked && !errors.amount && (
          <p
            className="mt-2 text-center text-[11px]"
            style={{ color: '#EF4444' }}
          >
            Amount exceeds the {formatCurrency(lockedAmount)} locked in this
            wallet.
          </p>
        )}

        {/* Note */}
        <div className="mt-5">
          <label
            className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: themeColors.charcoal }}
          >
            <FileText size={14} style={{ color: themeColors.mid }} />
            Reason (optional)
          </label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. School fees due this week"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-[12px] border px-3 py-3 text-[14px] outline-none"
            style={{
              backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
              borderColor: themeColors.border,
              color: themeColors.charcoal,
            }}
          />
          <p
            className="mt-1 text-right text-[11px]"
            style={{ color: themeColors.mid }}
          >
            {note.length}/500
          </p>
        </div>

        {/* Destination card */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: themeColors.mid }}
          >
            Destination
          </p>

          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.15)'
                  : 'rgba(96, 165, 250, 0.08)',
                color: '#60A5FA',
              }}
            >
              <Landmark size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[14px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {bank?.bankName ?? 'Linked bank account'}
              </p>
              <p
                className="truncate text-[12px]"
                style={{ color: themeColors.mid }}
              >
                {bank
                  ? `${bank.accountName} · ••••${bank.accountNumber.slice(-4)}`
                  : 'Loading bank account...'}
              </p>
            </div>
          </div>
        </div>

        {/* Trustee card */}
        <div
          className="mt-3 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: themeColors.mid }}
          >
            Approver
          </p>

          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.15)'
                  : 'rgba(96, 165, 250, 0.08)',
                color: '#60A5FA',
              }}
            >
              <Shield size={20} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[14px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {trusteeDisplayName}
              </p>
              <p
                className="truncate text-[12px]"
                style={{ color: themeColors.mid }}
              >
                {trusteeEmail || 'No trustee assigned'}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: isTrusteeVerified
                  ? isDark
                    ? 'rgba(15, 185, 110, 0.2)'
                    : 'rgba(15, 185, 110, 0.1)'
                  : isDark
                  ? 'rgba(245, 158, 11, 0.2)'
                  : 'rgba(245, 158, 11, 0.1)',
                color: isTrusteeVerified ? themeColors.green : '#F59E0B',
              }}
            >
              {isTrusteeVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div
          className="mt-4 flex items-start gap-2.5 rounded-[12px] p-3"
          style={{
            backgroundColor: isDark
              ? 'rgba(96, 165, 250, 0.08)'
              : 'rgba(96, 165, 250, 0.04)',
            borderWidth: 1,
            borderColor: isDark
              ? 'rgba(96, 165, 250, 0.2)'
              : 'rgba(96, 165, 250, 0.15)',
          }}
        >
          <Lock
            size={14}
            style={{ color: '#60A5FA', marginTop: 2, flexShrink: 0 }}
          />
          <p
            className="text-[11.5px] leading-[1.55]"
            style={{ color: themeColors.mid }}
          >
            The amount is reserved from your locked balance as soon as you
            submit. If the trustee rejects or doesn't respond within 3 hours,
            the funds return to your wallet automatically.
          </p>
        </div>

        {submitError && (
          <div
            className="mt-4 rounded-[12px] p-3 text-[13px]"
            style={{
              backgroundColor: isDark
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
            }}
          >
            {submitError}
          </div>
        )}

        {/* Submit */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleOpenPin}
            disabled={
              !parsedAmount ||
              parsedAmount < 100 ||
              exceedsLocked ||
              !isTrusteeVerified
            }
            className="flex w-full items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            <Shield size={18} />
            Send request to trustee
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description="Enter your PIN to send this release request."
        onClose={() => setIsPinModalOpen(false)}
        onVerify={verifyPinAndSubmit}
        isLoading={isVerifyingPin}
        maxLength={6}
      />
    </AppLayout>
  )
}