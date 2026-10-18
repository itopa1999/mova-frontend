// src/pages/trustees/TrusteesPage.tsx

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Mail,
  Clock,
  CheckCircle,
  RefreshCw,
  Plus,
  Loader2,
  Frown,
  AlertCircle,
  Users,
  Send,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import BottomSheet from '../../components/ui/BottomSheet'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import { formatUSDateTime } from '../../utils/formatting'
import { verifyPin } from '../../services/app/pin'
import { PinChallengeType } from '../../types/enums/pinChallengeType'
import {
  listOwnerTrustees,
  inviteTrustee,
  resendTrusteeInvitation,
  type OwnerTrusteeItem,
} from '../../services/app/trustees'

type SheetKey = 'invite'

type PendingAction =
  | { type: 'invite' }
  | { type: 'resend'; trusteeId: number }

function formatTimeLeft(expiresAt: string | null): string {
  if (!expiresAt) return ''
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'

  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60

  if (h >= 24) {
    const d = Math.floor(h / 24)
    return `${d}d ${h % 24}h left`
  }
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`
}

export default function TrusteesPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [trustees, setTrustees] = useState<OwnerTrusteeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Invite form state
  const inviteSheet = useBottomSheet<SheetKey>()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSubmitting, setInviteSubmitting] = useState(false)

  // PIN gate
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  /* ─── Data ─── */

  const loadTrustees = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    const res = await listOwnerTrustees()

    if (res.is_success && res.data) {
      setTrustees(res.data.items)
    } else {
      setLoadError(res.message || 'Failed to load trustees.')
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadTrustees()
  }, [loadTrustees])

  /* ─── Derived ─── */

  const verified = trustees.filter(
    (t) => t.status?.toLowerCase() === 'verified'
  )
  const pending = trustees.filter(
    (t) => t.status?.toLowerCase() !== 'verified'
  )

  /* ─── Invite form ─── */

  const resetInviteForm = () => {
    setInviteEmail('')
    setInviteName('')
    setInviteError(null)
  }

  const handleOpenInvite = () => {
    resetInviteForm()
    inviteSheet.open('invite')
  }

  const handleInviteSubmit = () => {
    const email = inviteEmail.trim().toLowerCase()

    if (!email) {
      setInviteError('Please enter the trustee’s email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError('Please enter a valid email address.')
      return
    }

    if (email === (sessionStorage.getItem('userEmail') ?? '').toLowerCase()) {
      setInviteError('You cannot invite your own email as trustee.')
      return
    }

    setInviteError(null)
    setPendingAction({ type: 'invite' })
    setIsPinModalOpen(true)
  }

  /* ─── Resend ─── */

  const handleResendClick = (trusteeId: number) => {
    setPendingAction({ type: 'resend', trusteeId })
    setIsPinModalOpen(true)
  }

  /* ─── PIN + execution ─── */

  const executeAfterPin = async (pin: string) => {
    setIsVerifyingPin(true)

    try {
      const pinRes = await verifyPin({
        pin,
        platform: 'web',
        pinChallengeType: PinChallengeType.CreateTrustee,
      })

      if (!pinRes.is_success) {
        throw new Error(pinRes.message || 'Invalid PIN. Please try again.')
      }

      if (pendingAction?.type === 'invite') {
        setInviteSubmitting(true)

        const res = await inviteTrustee({
          trusteeEmail: inviteEmail.trim().toLowerCase(),
          trusteeName: inviteName.trim() || undefined,
        })

        if (!res.is_success) {
          throw new Error(res.message || 'Failed to send invitation.')
        }

        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              type: 'success',
              message: `Invitation sent to ${inviteEmail.trim()}`,
            },
          })
        )

        setIsPinModalOpen(false)
        inviteSheet.close()
        resetInviteForm()
        setPendingAction(null)
        setInviteSubmitting(false)
        await loadTrustees()
      } else if (pendingAction?.type === 'resend') {
        const res = await resendTrusteeInvitation(pendingAction.trusteeId)

        if (!res.is_success) {
          throw new Error(res.message || 'Failed to resend invitation.')
        }

        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              type: 'success',
              message: 'Invitation resent successfully',
            },
          })
        )

        setIsPinModalOpen(false)
        setPendingAction(null)
        await loadTrustees()
      }
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Something went wrong. Please try again.',
          },
        })
      )
      throw error
    } finally {
      setIsVerifyingPin(false)
      setInviteSubmitting(false)
    }
  }

  const handlePinClose = () => {
    setIsPinModalOpen(false)
    setPendingAction(null)
    // If invite sheet is still open, keep it open so the user can retry
  }

  /* ─── Render states ─── */

  if (isLoading && trustees.length === 0) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: themeColors.green }}
          />
        </div>
      </AppLayout>
    )
  }

  if (loadError && trustees.length === 0) {
    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          <div className="mb-4 flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)} />
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Trustees
            </h2>
          </div>
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <Frown size={32} strokeWidth={1.5} style={{ color: themeColors.mid }} />
            <p
              className="mt-3 text-[15px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Couldn't load trustees
            </p>
            <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
              {loadError}
            </p>
            <button
              type="button"
              onClick={loadTrustees}
              className="mt-5 rounded-full px-6 py-2.5 text-[14px] font-semibold"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />

          <div className="flex-1">
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Trustees
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              People who approve releases from your trustee wallets
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenInvite}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add
          </button>
        </div>

        {/* Summary strip */}
        {trustees.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div
              className="rounded-[14px] border p-3"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle
                  size={12}
                  strokeWidth={2.4}
                  style={{ color: themeColors.green }}
                />
                <p
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: themeColors.green }}
                >
                  Verified
                </p>
              </div>
              <p
                className="mt-1 text-[18px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {verified.length}
              </p>
            </div>

            <div
              className="rounded-[14px] border p-3"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-center gap-1.5">
                <Clock
                  size={12}
                  strokeWidth={2.4}
                  style={{ color: '#F59E0B' }}
                />
                <p
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: '#F59E0B' }}
                >
                  Pending
                </p>
              </div>
              <p
                className="mt-1 text-[18px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {pending.length}
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {trustees.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-8 text-center"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.15)'
                  : 'rgba(96, 165, 250, 0.08)',
                color: '#60A5FA',
              }}
            >
              <Users size={30} strokeWidth={1.6} />
            </div>
            <p
              className="mt-4 text-[16px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              No trustees yet
            </p>
            <p
              className="mt-1 max-w-[280px] text-[12px] leading-[1.55]"
              style={{ color: themeColors.mid }}
            >
              Invite someone you trust. They'll get an email to accept, then
              you can assign them to trustee wallets.
            </p>
            <button
              type="button"
              onClick={handleOpenInvite}
              className="mt-5 flex items-center gap-2 rounded-[12px] px-5 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Invite your first trustee
            </button>
          </div>
        )}

        {/* Verified section */}
        {verified.length > 0 && (
          <section className="mt-4">
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.mid }}
            >
              Verified
            </p>

            <div className="space-y-2">
              {verified.map((trustee) => (
                <TrusteeCard
                  key={trustee.id}
                  trustee={trustee}
                  isDark={isDark}
                  themeColors={themeColors}
                />
              ))}
            </div>
          </section>
        )}

        {/* Pending section */}
        {pending.length > 0 && (
          <section className="mt-4">
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.mid }}
            >
              Pending invitations
            </p>

            <div className="space-y-2">
              {pending.map((trustee) => (
                <TrusteeCard
                  key={trustee.id}
                  trustee={trustee}
                  isDark={isDark}
                  themeColors={themeColors}
                  onResend={() => handleResendClick(trustee.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Add another trustee — bottom dashed button */}
        {trustees.length > 0 && (
          <button
            type="button"
            onClick={handleOpenInvite}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed py-3.5 text-[13px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
            style={{
              borderColor: themeColors.green,
              color: themeColors.green,
              backgroundColor: 'transparent',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Invite another trustee
          </button>
        )}

        {/* Info card */}
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
          <Shield
            size={14}
            style={{ color: '#60A5FA', marginTop: 2, flexShrink: 0 }}
          />
          <p
            className="text-[11.5px] leading-[1.55]"
            style={{ color: themeColors.mid }}
          >
            A trustee is someone who approves releases from your trustee
            wallets. They never get direct access to your money — they only
            approve or reject requests you send them.
          </p>
        </div>
      </div>

      {/* ─── Invite form BottomSheet ─── */}
      <BottomSheet
        isOpen={inviteSheet.activeSheet !== null}
        onClose={() => {
          inviteSheet.close()
          resetInviteForm()
        }}
        title="Invite a trustee"
        icon={<Users size={16} strokeWidth={2.4} />}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                inviteSheet.close()
                resetInviteForm()
              }}
              className="flex-1 cursor-pointer rounded-[12px] border px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-70"
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
              onClick={handleInviteSubmit}
              disabled={inviteSubmitting}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              {inviteSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={15} strokeWidth={2.5} />
                  Send invitation
                </>
              )}
            </button>
          </div>
        }
      >
        <div style={{ color: themeColors.mid }}>
          <p className="mb-4 text-[13px] leading-[1.6]">
            We'll send an email with a link to accept. They don't need a MOVA
            account — just a valid email address.
          </p>

          <div className="mb-3">
            <label
              className="mb-1.5 block text-[12px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Email address
            </label>
            <div
              className="flex items-center gap-2 rounded-[12px] border px-3"
              style={{
                borderColor: inviteError
                  ? '#EF4444'
                  : inviteEmail
                  ? themeColors.green
                  : themeColors.border,
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
              }}
            >
              <Mail size={16} style={{ color: themeColors.mid }} />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value)
                  if (inviteError) setInviteError(null)
                }}
                placeholder="jane@example.com"
                className="w-full border-0 bg-transparent py-3 text-[14px] outline-none"
                style={{ color: themeColors.charcoal }}
                maxLength={200}
              />
            </div>
          </div>

          <div className="mb-3">
            <label
              className="mb-1.5 block text-[12px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Name{' '}
              <span style={{ color: themeColors.mid, fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full rounded-[12px] border px-3 py-3 text-[14px] outline-none"
              style={{
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                borderColor: themeColors.border,
                color: themeColors.charcoal,
              }}
              maxLength={100}
            />
          </div>

          {inviteError && (
            <div
              className="flex items-start gap-2 rounded-[10px] p-2.5"
              style={{
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.06)',
              }}
            >
              <AlertCircle
                size={14}
                style={{ color: '#EF4444', marginTop: 1, flexShrink: 0 }}
              />
              <span
                className="text-[12px] font-medium"
                style={{ color: '#EF4444' }}
              >
                {inviteError}
              </span>
            </div>
          )}

          <div
            className="mt-4 flex items-start gap-2 rounded-[10px] p-2.5"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.08)'
                : 'rgba(96, 165, 250, 0.04)',
            }}
          >
            <Clock
              size={12}
              style={{ color: '#60A5FA', marginTop: 2, flexShrink: 0 }}
            />
            <p
              className="text-[11px] leading-[1.55]"
              style={{ color: themeColors.mid }}
            >
              The invitation expires in 24 hours. If they don't respond, you
              can resend it from this page.
            </p>
          </div>
        </div>
      </BottomSheet>

      {/* ─── PIN modal (used for invite + resend) ─── */}
      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description={
          pendingAction?.type === 'resend'
            ? 'Enter your PIN to resend the invitation.'
            : 'Enter your PIN to send the invitation.'
        }
        onClose={handlePinClose}
        onVerify={executeAfterPin}
        isLoading={isVerifyingPin}
        maxLength={6}
      />
    </AppLayout>
  )
}

/* ─── Trustee card ─── */

function TrusteeCard({
  trustee,
  isDark,
  themeColors,
  onResend,
}: {
  trustee: OwnerTrusteeItem
  isDark: boolean
  themeColors: typeof colors | typeof darkColors
  onResend?: () => void
}) {
  const isVerified = trustee.status?.toLowerCase() === 'verified'
  const displayName =
    trustee.name && trustee.name.trim().length > 0
      ? trustee.name
      : trustee.email.split('@')[0]

  const initial = displayName.charAt(0).toUpperCase()

  const statusColor = isVerified ? themeColors.green : '#F59E0B'
  const timeLeft = !isVerified ? formatTimeLeft(trustee.tokenExpiresAt) : ''

  return (
    <div
      className="rounded-[14px] border p-3.5"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold"
          style={{
            backgroundColor: isDark
              ? 'rgba(96, 165, 250, 0.15)'
              : 'rgba(96, 165, 250, 0.08)',
            color: '#60A5FA',
          }}
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className="truncate text-[14px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              {displayName}
            </p>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: isDark
                  ? `${statusColor}33`
                  : `${statusColor}1A`,
                color: statusColor,
              }}
            >
              {trustee.status}
            </span>
          </div>

          <p
            className="mt-0.5 truncate text-[12px]"
            style={{ color: themeColors.mid }}
          >
            {trustee.email}
          </p>

          {isVerified && (
            <p
              className="mt-1 text-[11px]"
              style={{ color: themeColors.mid }}
            >
              {trustee.walletCount === 0
                ? 'Not used in any wallet yet'
                : `Used in ${trustee.walletCount} ${
                    trustee.walletCount === 1 ? 'wallet' : 'wallets'
                  }`}
            </p>
          )}

          {!isVerified && (
            <div className="mt-1 flex items-center gap-2">
              <p
                className="text-[11px]"
                style={{ color: themeColors.mid }}
              >
                Invited {formatUSDateTime(trustee.invitedAt)}
              </p>
              {timeLeft && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(245, 158, 11, 0.1)',
                    color: '#F59E0B',
                  }}
                >
                  {timeLeft}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {!isVerified && onResend && (
        <button
          type="button"
          onClick={onResend}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[10px] border py-2 text-[12px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
          style={{
            borderColor: themeColors.border,
            color: themeColors.charcoal,
            backgroundColor: 'transparent',
          }}
        >
          <RefreshCw size={12} strokeWidth={2.5} />
          Resend invitation
        </button>
      )}
    </div>
  )
}