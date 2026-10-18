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
  UserCheck,
  Mail,
  Zap,
} from 'lucide-react'

import AuthLayout from '../../components/layout/AuthLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { formatUSDateTime } from '../../utils/formatting'
import {
  getTrusteeInviteConsent,
  acceptTrusteeInvite,
  declineTrusteeInvite,
  type TrusteeInviteConsentInfo,
} from '../../services/app/trustees'
import { useNow } from '@/hooks/useNow'

type PageState = 'loading' | 'ready' | 'submitting' | 'done' | 'error'

export default function TrusteeCreateConsentPage() {
  const { token } = useParams<{ token: string }>()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [state, setState] = useState<PageState>('loading')
  const [data, setData] = useState<TrusteeInviteConsentInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [decision, setDecision] = useState<'accept' | 'decline' | null>(null)
  const [showDeclineReason, setShowDeclineReason] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!token) {
      setState('error')
      setError('Invalid invitation link.')
      return
    }

    const load = async () => {
      setState('loading')
      try {
        const res = await getTrusteeInviteConsent(token)
        if (res.is_success && res.data) {
          setData(res.data)
          setState('ready')
        } else {
          setError(res.message || 'This invitation is no longer valid.')
          setState('error')
        }
      } catch {
        setError('Something went wrong. Please try again.')
        setState('error')
      }
    }

    load()
  }, [token])

  const handleAccept = async () => {
    if (!token) return
    setState('submitting')
    setDecision('accept')
    try {
      const res = await acceptTrusteeInvite(token)
      if (res.is_success) {
        setState('done')
      } else {
        setError(res.message || 'Failed to accept invitation.')
        setState('error')
      }
    } catch {
      setError('Something went wrong.')
      setState('error')
    }
  }

  const handleDecline = async () => {
    if (!token) return
    setState('submitting')
    setDecision('decline')
    try {
      const res = await declineTrusteeInvite(
        token,
        declineReason.trim() || undefined
      )
      if (res.is_success) {
        setState('done')
      } else {
        setError(res.message || 'Failed to decline invitation.')
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
            Can't open this invitation
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

  /* ─── Success (accepted or declined) ─── */
  if (state === 'done') {
    const accepted = decision === 'accept'
    const accent = accepted ? themeColors.green : '#EF4444'

    return (
      <AuthLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? `${accent}26` : `${accent}14`,
            }}
          >
            {accepted ? (
              <CheckCircle
                size={40}
                strokeWidth={2.2}
                style={{ color: accent }}
              />
            ) : (
              <XCircle
                size={40}
                strokeWidth={2.2}
                style={{ color: accent }}
              />
            )}
          </div>

          <h1
            className="mt-5 text-[22px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            {accepted ? "You're now a trustee" : 'Invitation declined'}
          </h1>

          <p
            className="mt-3 max-w-[320px] text-[14px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            {accepted
              ? `${data?.ownerFirstName ?? 'The wallet owner'} has been notified. You'll receive an email whenever they request a release — you'll have 3 hours to approve or reject each one.`
              : `${data?.ownerFirstName ?? 'The wallet owner'} has been notified. Nothing else is required from you.`}
          </p>

          {accepted && (
            <div
              className="mt-6 w-full max-w-[380px] rounded-[14px] border p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.06)'
                  : 'rgba(96, 165, 250, 0.03)',
                borderColor: isDark
                  ? 'rgba(96, 165, 250, 0.2)'
                  : 'rgba(96, 165, 250, 0.15)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <Mail
                  size={14}
                  style={{
                    color: '#60A5FA',
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[11.5px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  We'll send everything to{' '}
                  <strong style={{ color: themeColors.charcoal }}>
                    {data?.trusteeEmail}
                  </strong>
                  . No app, no account, no signup — just click the link in
                  the email.
                </p>
              </div>
            </div>
          )}
        </div>
      </AuthLayout>
    )
  }

  /* ─── Ready — show invitation details + accept/decline ─── */
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
            Trustee invitation
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
            {data.ownerFirstName} invited you to be their trustee
          </p>
        </div>

        {/* Hero: what being a trustee means */}
        <div
          className="rounded-[20px] p-5"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.22) 0%, rgba(96, 165, 250, 0.06) 100%)'
              : 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(96, 165, 250, 0.02) 100%)',
            border: `1px solid ${
              isDark ? 'rgba(96, 165, 250, 0.3)' : 'rgba(96, 165, 250, 0.2)'
            }`,
          }}
        >
          <div className="flex items-center gap-2">
            <UserCheck size={16} style={{ color: '#60A5FA' }} />
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: '#60A5FA' }}
            >
              What this means
            </p>
          </div>

          <p
            className="mt-2 text-[13.5px] leading-[1.65]"
            style={{ color: themeColors.charcoal }}
          >
            {data.ownerFirstName} wants you to approve every money release
            from certain wallets. Nothing leaves those wallets without your
            say-so — even they can't bypass it.
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
              Invitation {formatTimeLeft(data.invitationExpiresAt)}
            </span>
          </div>
        </div>

        {/* How it works — three bullets */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <p
            className="mb-3 text-[13px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            How it works
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(96, 165, 250, 0.15)'
                    : 'rgba(96, 165, 250, 0.08)',
                  color: '#60A5FA',
                }}
              >
                <Mail size={14} strokeWidth={2.2} />
              </div>
              <div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  You'll get an email per request
                </p>
                <p
                  className="mt-0.5 text-[11.5px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  When {data.ownerFirstName} wants to release money, we email
                  you a link — no app or account needed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(245, 158, 11, 0.08)',
                  color: '#F59E0B',
                }}
              >
                <Clock size={14} strokeWidth={2.2} />
              </div>
              <div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  3 hours to respond
                </p>
                <p
                  className="mt-0.5 text-[11.5px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  Each request is open for 3 hours. If you don't respond in
                  time, it expires and no money moves.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(15, 185, 110, 0.15)'
                    : 'rgba(15, 185, 110, 0.08)',
                  color: themeColors.green,
                }}
              >
                <Lock size={14} strokeWidth={2.2} />
              </div>
              <div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  You're a second signature
                </p>
                <p
                  className="mt-0.5 text-[11.5px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  The money stays {data.ownerFirstName}'s. You only decide
                  whether and when it can leave the wallet.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Invited by
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {data.ownerFirstName} · {data.ownerMaskedEmail}
              </span>
            </div>

            <div
              className="h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Your email
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {data.trusteeEmail}
              </span>
            </div>

            <div
              className="h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Expires
              </span>
              <span
                className="text-[12px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                {formatUSDateTime(data.invitationExpiresAt)}
              </span>
            </div>
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
          <Zap
            size={14}
            style={{ color: '#60A5FA', marginTop: 2, flexShrink: 0 }}
          />
          <p
            className="text-[11.5px] leading-[1.55]"
            style={{ color: themeColors.mid }}
          >
            Accepting is free and reversible. You can be removed as trustee
            by {data.ownerFirstName} at any time.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            {isSubmitting && decision === 'accept' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Accept invitation
              </>
            )}
          </button>

          {!showDeclineReason ? (
            <button
              type="button"
              onClick={() => setShowDeclineReason(true)}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] border-2 px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                borderColor: '#EF4444',
                color: '#EF4444',
                backgroundColor: 'transparent',
              }}
            >
              <XCircle size={18} />
              Decline
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
                Why are you declining?
              </p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
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
                    setShowDeclineReason(false)
                    setDeclineReason('')
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
                  onClick={handleDecline}
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold disabled:opacity-60"
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                  }}
                >
                  {isSubmitting && decision === 'decline' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Declining...
                    </>
                  ) : (
                    'Confirm decline'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p
          className="mt-4 text-center text-[11px] leading-[1.55]"
          style={{ color: themeColors.mid }}
        >
          If you weren't expecting this invitation, you can safely decline or
          ignore the email. Nothing happens unless you respond.
        </p>
      </div>
    </AuthLayout>
  )
}