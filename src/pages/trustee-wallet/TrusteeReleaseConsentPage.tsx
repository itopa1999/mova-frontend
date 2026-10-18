import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Shield,
  Lock,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Landmark,
  Target,
} from 'lucide-react'

import AuthLayout from '../../components/layout/AuthLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { formatCurrency, formatUSDateTime } from '../../utils/formatting'
import {
  getReleaseRequestConsent,
  approveReleaseRequest,
  rejectReleaseRequest,
  type ReleaseRequestConsentInfo,
} from '../../services/app/trusteeWallet'
import { useNow } from '@/hooks/useNow'

type PageState = 'loading' | 'ready' | 'submitting' | 'done' | 'error'

export default function TrusteeReleaseConsentPage() {
  const { token } = useParams<{ token: string }>()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [state, setState] = useState<PageState>('loading')
  const [data, setData] = useState<ReleaseRequestConsentInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)
  const [showRejectReason, setShowRejectReason] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!token) {
      setState('error')
      setError('Invalid link.')
      return
    }

    const load = async () => {
      setState('loading')
      try {
        const res = await getReleaseRequestConsent(token)
        if (res.is_success && res.data) {
          setData(res.data)
          setState('ready')
        } else {
          setError(res.message || 'This link is no longer valid.')
          setState('error')
        }
      } catch {
        setError('Something went wrong. Please try again.')
        setState('error')
      }
    }

    load()
  }, [token])

  const handleApprove = async () => {
    if (!token) return
    setState('submitting')
    setDecision('approve')
    try {
      const res = await approveReleaseRequest(token)
      if (res.is_success) {
        setState('done')
      } else {
        setError(res.message || 'Failed to approve.')
        setState('error')
      }
    } catch {
      setError('Something went wrong.')
      setState('error')
    }
  }

  const handleReject = async () => {
    if (!token) return
    setState('submitting')
    setDecision('reject')
    try {
      const res = await rejectReleaseRequest(
        token,
        rejectReason.trim() || undefined
      )
      if (res.is_success) {
        setState('done')
      } else {
        setError(res.message || 'Failed to reject.')
        setState('error')
      }
    } catch {
      setError('Something went wrong.')
      setState('error')
    }
  }

  const now = useNow()

  const formatTimeLeft = (expiresAt: string): string => {
    const ms = new Date(expiresAt).getTime() - now
    if (ms <= 0) return 'Expired'
    const totalMin = Math.floor(ms / 60000)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return h > 0 ? `${h}h ${m}m left` : `${m}m left`
  }

  /* ─── Loading ─── */
  if (state === 'loading') {
    return (
      <AuthLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: themeColors.green }}
          />
        </div>
      </AuthLayout>
    )
  }

  /* ─── Error ─── */
  if (state === 'error') {
    return (
      <AuthLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
            }}
          >
            <AlertCircle size={32} strokeWidth={1.8} />
          </div>
          <h1
            className="mt-4 text-[20px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Can't open this request
          </h1>
          <p
            className="mt-2 max-w-[320px] text-[13px] leading-[1.55]"
            style={{ color: themeColors.mid }}
          >
            {error}
          </p>
        </div>
      </AuthLayout>
    )
  }

  /* ─── Success (approved or rejected) ─── */
  if (state === 'done') {
    const isApproved = decision === 'approve'
    const accent = isApproved ? themeColors.green : '#EF4444'

    return (
      <AuthLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? `${accent}26` : `${accent}14`,
            }}
          >
            {isApproved ? (
              <CheckCircle size={40} strokeWidth={2.2} style={{ color: accent }} />
            ) : (
              <XCircle size={40} strokeWidth={2.2} style={{ color: accent }} />
            )}
          </div>

          <h1
            className="mt-5 text-[22px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            {isApproved ? 'Release approved' : 'Release rejected'}
          </h1>

          <p
            className="mt-3 max-w-[320px] text-[14px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            {isApproved
              ? `${data?.requesterFirstName ?? 'The wallet owner'} has been notified. The money is on its way to their bank account.`
              : `${data?.requesterFirstName ?? 'The wallet owner'} has been notified. The funds are back in their wallet.`}
          </p>
        </div>
      </AuthLayout>
    )
  }

  /* ─── Ready — show request details + approve/reject ─── */
  if (!data) return null

  const isSubmitting = state === 'submitting'

  return (
    <AuthLayout>
      <div className="py-6" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-6 text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.15)'
                : 'rgba(96, 165, 250, 0.08)',
              color: '#60A5FA',
            }}
          >
            <Shield size={26} strokeWidth={2} />
          </div>
          <h1
            className="mt-3 text-[20px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Release request
          </h1>
          <p
            className="mt-1 text-[13px]"
            style={{ color: themeColors.mid }}
          >
            {data.requesterFirstName} needs your approval
          </p>
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
              Amount requested
            </p>
          </div>

          <p
            className="mt-2 font-bold leading-none"
            style={{
              color: themeColors.charcoal,
              fontSize: 'clamp(32px, 10vw, 44px)',
              fontFamily:
                "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: '-0.03em',
            }}
          >
            {formatCurrency(data.amount)}
          </p>

          <div
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              backgroundColor: isDark
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
            }}
          >
            <Clock size={11} strokeWidth={2.5} />
            <span className="text-[11px] font-bold">
              {formatTimeLeft(data.expiresAt)}
            </span>
          </div>
        </div>

        {/* Details card */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                From wallet
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {data.walletName}
              </span>
            </div>

            <div
              className="h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-start justify-between gap-3">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Destination
              </span>
              <div className="text-right">
                <p
                  className="flex items-center justify-end gap-1.5 text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  <Landmark size={12} />
                  {data.bankName}
                </p>
                <p
                  className="text-[11px] tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  {data.maskedAccountNumber}
                </p>
              </div>
            </div>

            <div
              className="h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Requested
              </span>
              <span
                className="text-[12px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                {formatUSDateTime(data.requestedAt)}
              </span>
            </div>

            {data.userNote && (
              <>
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: themeColors.border }}
                />
                <div>
                  <p
                    className="mb-1 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    Reason
                  </p>
                  <p
                    className="rounded-[8px] px-2.5 py-2 text-[12px] italic"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.03)'
                        : '#F9FAFB',
                      color: themeColors.charcoal,
                    }}
                  >
                    "{data.userNote}"
                  </p>
                </div>
              </>
            )}
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
          <Lock size={14} style={{ color: '#60A5FA', marginTop: 2, flexShrink: 0 }} />
          <p
            className="text-[11.5px] leading-[1.55]"
            style={{ color: themeColors.mid }}
          >
            Approving will send{' '}
            <strong style={{ color: themeColors.charcoal }}>
              {formatCurrency(data.amount)}
            </strong>{' '}
            from {data.walletName} to the bank account above. Rejecting leaves the
            money in the wallet.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            {isSubmitting && decision === 'approve' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Approve release
              </>
            )}
          </button>

          {!showRejectReason ? (
            <button
              type="button"
              onClick={() => setShowRejectReason(true)}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] border-2 px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                borderColor: '#EF4444',
                color: '#EF4444',
                backgroundColor: 'transparent',
              }}
            >
              <XCircle size={18} />
              Reject release
            </button>
          ) : (
            <div
              className="rounded-[14px] border-2 p-3"
              style={{
                borderColor: '#EF4444',
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.06)'
                  : 'rgba(239, 68, 68, 0.03)',
              }}
            >
              <p
                className="mb-2 text-[12px] font-semibold"
                style={{ color: '#EF4444' }}
              >
                Why are you rejecting?
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Optional — help the owner understand"
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-[10px] border px-3 py-2 text-[13px] outline-none"
                style={{
                  backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#FFFFFF',
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectReason(false)
                    setRejectReason('')
                  }}
                  disabled={isSubmitting}
                  className="flex-1 rounded-[10px] border px-3 py-2 text-[13px] font-semibold disabled:opacity-60"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.charcoal,
                    backgroundColor: 'transparent',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold disabled:opacity-60"
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                  }}
                >
                  {isSubmitting && decision === 'reject' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Confirm reject'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}