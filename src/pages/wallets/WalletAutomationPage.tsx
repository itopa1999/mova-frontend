import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Zap,
  RefreshCw,
  Shield,
  Loader2,
  CheckCircle,
  Info,
  Pause,
  Play,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Sparkles,
  Wallet,
  Landmark,
  Banknote,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import {
  createRenewalPolicy,
  getRenewalPolicy,
  getRenewalEvents,
  toggleRenewal,
  updateRenewalPolicy,
} from '../../services/app/walletAutomation'
import type {
  CreateRenewalPolicyRequest,
  RenewalEvent,
  RenewalPolicy,
  RenewalTriggerType,
  RefillAmountType,
} from '../../services/app/walletAutomation'
import { getWalletDetails } from '../../services/app/wallet'
import type { WalletDetailData } from '../../services/app/wallet'
import PinModal from '../../components/ui/PinModal'
import { verifyPin } from '../../services/app/pin'

interface RouteState {
  justCreated?: boolean
  walletName?: string
  targetAmount?: number
}

export default function WalletAutomationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ walletId: string }>()
  const walletId = Number(params.walletId)

  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const routeState = (location.state || {}) as RouteState
  const justCreated = routeState.justCreated === true

  // ─── Data ─────────────────────────────────────────
  const [wallet, setWallet] = useState<WalletDetailData | null>(null)
  const [policy, setPolicy] = useState<RenewalPolicy | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ─── Form state ───────────────────────────────────
  const [triggerType, setTriggerType] = useState<RenewalTriggerType>('onthreshold')
  const [triggerAmount, setTriggerAmount] = useState<string>('')
  const [refillAmountType, setRefillAmountType] = useState<RefillAmountType>('fixed')
  const [refillAmount, setRefillAmount] = useState<string>('')
  const [minMainBalance, setMinMainBalance] = useState<string>('5000')
  const [maxRenewals, setMaxRenewals] = useState<string>('')

  // ─── UI state ─────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    triggerAmount?: string
    refillAmount?: string
    minMainBalance?: string
    maxRenewals?: string
  }>({})

  const [isPausingOrResuming, setIsPausingOrResuming] = useState(false)

  // ─── Success screen ───────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMode, setSuccessMode] = useState<'created' | 'updated'>('created')

  // ─── Events (lazy) ────────────────────────────────
  const [events, setEvents] = useState<RenewalEvent[]>([])
  const [eventsLoaded, setEventsLoaded] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [eventsPage, setEventsPage] = useState(1)
  const [eventsTotalPages, setEventsTotalPages] = useState(0)
  const [isEventsExpanded, setIsEventsExpanded] = useState(false)

  // ─── Load wallet + policy ─────────────────────────
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)

      const walletRes = await getWalletDetails(walletId)
      if (cancelled) return

      if (walletRes.is_success && walletRes.data) {
        setWallet(walletRes.data)
      }

      if (!justCreated) {
        const policyRes = await getRenewalPolicy(walletId)
        if (cancelled) return

        if (policyRes.is_success && policyRes.data) {
          setPolicy(policyRes.data)
        } else {
          setPolicy(null)
        }
      }

      setIsLoading(false)
    }

    if (walletId) load()

    return () => {
      cancelled = true
    }
  }, [walletId, justCreated])

  // ─── Prefill form ─────────────────────────────────
  useEffect(() => {
    if (policy) {
      setTriggerType(
        policy.triggerType.toLowerCase() === 'onthreshold'
          ? 'onthreshold'
          : 'oncompletion'
      )
      setTriggerAmount(
        policy.triggerType.toLowerCase() === 'onthreshold'
          ? String(policy.triggerAmount)
          : ''
      )
      setRefillAmountType(
        policy.refillAmountType.toLowerCase() === 'custom' ? 'custom' : 'fixed'
      )
      setRefillAmount(
        policy.refillAmountType.toLowerCase() === 'custom'
          ? String(policy.refillAmount)
          : ''
      )
      setMinMainBalance(String(policy.minMainBalance))
      setMaxRenewals(policy.maxRenewals === null ? '' : String(policy.maxRenewals))
      return
    }

    if (wallet && !policy) {
      const target = wallet.targetAmount || 0
      const suggestedTrigger = Math.min(
        5000,
        Math.max(500, Math.round(target * 0.15 / 500) * 500)
      )

      setTriggerType('onthreshold')
      setTriggerAmount(String(suggestedTrigger))
      setRefillAmountType('fixed')
      setRefillAmount('')
      setMinMainBalance('5000')
      setMaxRenewals('')
    }
  }, [policy, wallet])

  // ─── Lazy-load events ─────────────────────────────
  const loadEvents = async (page: number = 1) => {
    setEventsLoading(true)
    setEventsError(null)

    const res = await getRenewalEvents(walletId, page, 20)

    if (res.is_success && res.data) {
      if (page === 1) {
        setEvents(res.data.events)
      } else {
        setEvents((prev) => [...prev, ...res.data!.events])
      }
      setEventsPage(res.data.page)
      setEventsTotalPages(res.data.totalPages)
      setEventsLoaded(true)
    } else {
      setEventsError(res.message || 'Failed to load history.')
    }

    setEventsLoading(false)
  }

  const handleToggleEvents = () => {
    const next = !isEventsExpanded
    setIsEventsExpanded(next)

    if (next && !eventsLoaded) {
      loadEvents(1)
    }
  }

  const handleLoadMoreEvents = () => {
    if (eventsPage < eventsTotalPages && !eventsLoading) {
      loadEvents(eventsPage + 1)
    }
  }

  // ─── Validate + build payload ─────────────────────
  const validate = (): boolean => {
    const e: typeof errors = {}

    if (triggerType === 'onthreshold') {
      const val = parseInt(triggerAmount || '0', 10)
      if (val <= 0) {
        e.triggerAmount = 'Trigger amount must be greater than zero'
      } else if (wallet && val >= wallet.targetAmount) {
        e.triggerAmount = `Must be less than target (₦${wallet.targetAmount.toLocaleString()})`
      }
    }

    if (refillAmountType === 'custom') {
      const val = parseInt(refillAmount || '0', 10)
      if (val < 2000) {
        e.refillAmount = 'Refill amount must be at least ₦2,000'
      } else if (wallet && val > wallet.targetAmount) {
        e.refillAmount = 'Refill amount cannot exceed the wallet target'
      }
    }

    const minVal = parseInt(minMainBalance || '0', 10)
    if (isNaN(minVal) || minVal < 0) {
      e.minMainBalance = 'Must be zero or greater'
    }

    if (maxRenewals !== '') {
      const val = parseInt(maxRenewals, 10)
      if (isNaN(val) || val <= 0) {
        e.maxRenewals = 'Must be greater than zero if set'
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const buildPayload = (): CreateRenewalPolicyRequest => {
    return {
      triggerType,
      triggerAmount:
        triggerType === 'onthreshold' ? parseInt(triggerAmount || '0', 10) : 0,
      refillAmountType,
      refillAmount:
        refillAmountType === 'custom' ? parseInt(refillAmount || '0', 10) : 0,
      minMainBalance: parseInt(minMainBalance || '0', 10),
      maxRenewals: maxRenewals === '' ? null : parseInt(maxRenewals, 10),
    }
  }

  // ─── Submit: create / update ──────────────────────
  const handleOpenPin = () => {
    if (!validate()) return
    setSubmitError(null)
    setIsPinModalOpen(true)
  }

  const handleSubmitWithPin = async (pin: string) => {
    setIsVerifyingPin(true)
    setSubmitError(null)

    try {
      const pinRes = await verifyPin({ pin, platform: 'web' })
      if (!pinRes.is_success) {
        throw new Error(pinRes.message || 'Invalid PIN. Please try again.')
      }

      const payload = buildPayload()

      const res = policy
        ? await updateRenewalPolicy(walletId, payload)
        : await createRenewalPolicy(walletId, payload)

      if (!res.is_success) {
        throw new Error(res.message || 'Failed to save automation.')
      }

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: policy
              ? 'Automation updated successfully.'
              : 'Automation enabled successfully!',
          },
        })
      )

      setIsPinModalOpen(false)
      setIsEditing(false)

      const refreshed = await getRenewalPolicy(walletId)
      if (refreshed.is_success && refreshed.data) {
        setPolicy(refreshed.data)
      }

      // Show success screen instead of navigating away
      setSuccessMode(policy ? 'updated' : 'created')
      setShowSuccess(true)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsVerifyingPin(false)
    }
  }

  // ─── Pause / Resume ───────────────────────────────
    const handleToggleEnabled = async () => {
    if (!policy) return
    setIsPausingOrResuming(true)

    try {
      const res = await toggleRenewal(walletId)

      if (!res.is_success || !res.data) {
        throw new Error(res.message || 'Failed to update automation.')
      }

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: res.data.isEnabled && res.data.status === 'Active'
              ? 'Automation resumed.'
              : 'Automation paused.',
          },
        })
      )

      const refreshed = await getRenewalPolicy(walletId)
      if (refreshed.is_success && refreshed.data) {
        setPolicy(refreshed.data)
      }
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to update automation.',
          },
        })
      )
    } finally {
      setIsPausingOrResuming(false)
    }
  }

  // ─── Helpers ──────────────────────────────────────
  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDateTime = (iso: string): string => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleAmountChange = (
    value: string,
    setter: (v: string) => void,
    errorKey: keyof typeof errors
  ) => {
    const numeric = value.replace(/[^0-9]/g, '')
    setter(numeric)
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: undefined }))
    }
  }

  const isFormVisible = !policy || isEditing

  // ─── Loading state ────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: themeColors.green }}
          />
          <p className="mt-3 text-[13px]" style={{ color: themeColors.mid }}>
            Loading...
          </p>
        </div>
      </AppLayout>
    )
  }

  const walletName = wallet?.name || routeState.walletName || 'this wallet'

  // ─── Success screen ───────────────────────────────
  if (showSuccess) {
    const isCreated = successMode === 'created'

    return (
      <AppLayout>
        <div className="flex min-h-[75vh] flex-col items-center justify-center px-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(15, 185, 110, 0.15)'
                : 'rgba(15, 185, 110, 0.08)',
            }}
          >
            <CheckCircle
              size={40}
              strokeWidth={2.4}
              style={{ color: themeColors.green }}
            />
          </div>

          <h2
            className="mt-5 text-center text-[22px] font-bold leading-tight"
            style={{ color: themeColors.charcoal }}
          >
            {isCreated ? 'Automation enabled!' : 'Automation updated!'}
          </h2>

          <p
            className="mt-3 max-w-[320px] text-center text-[14px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            {isCreated
              ? `MOVA will now refill ${walletName} automatically according to your settings. You can pause or edit it anytime.`
              : `Your changes to ${walletName} automation have been saved.`}
          </p>

          <div
            className="mt-6 w-full max-w-[380px] rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <SuccessRow
              label="Trigger"
              value={
                triggerType === 'onthreshold'
                  ? `Below ${formatCurrency(parseInt(triggerAmount || '0', 10))}`
                  : 'On wallet completion'
              }
              themeColors={themeColors}
            />
            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />
            <SuccessRow
              label="Refill amount"
              value={
                refillAmountType === 'fixed'
                  ? `${formatCurrency(wallet?.targetAmount || 0)} (fixed)`
                  : formatCurrency(parseInt(refillAmount || '0', 10))
              }
              themeColors={themeColors}
            />
            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />
            <SuccessRow
              label="Keeps main above"
              value={formatCurrency(parseInt(minMainBalance || '0', 10))}
              themeColors={themeColors}
            />
          </div>

          <button
            type="button"
            onClick={() => navigate(`/wallet/${walletId}`, { replace: true })}
            className="mt-7 w-full max-w-[380px] rounded-[14px] px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Okay
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/wallet/${walletId}`)}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>

          <div>
            <h2 className="text-[20px] font-bold" style={{ color: themeColors.charcoal }}>
              Automate {walletName}
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              {policy
                ? 'Manage your automation'
                : 'Let MOVA refill this wallet automatically'}
            </p>
          </div>
        </div>

        {/* Convince hero — only when creating, no policy yet */}
        {!policy && justCreated && (
          <div
            className="mb-5 overflow-hidden rounded-[20px] p-5"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(15, 185, 110, 0.25) 0%, rgba(15, 185, 110, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(15, 185, 110, 0.12) 0%, rgba(15, 185, 110, 0.03) 100%)',
              border: `1px solid ${
                isDark ? 'rgba(15, 185, 110, 0.3)' : 'rgba(15, 185, 110, 0.2)'
              }`,
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={18} style={{ color: themeColors.green }} />
              <p
                className="text-[13px] font-bold uppercase tracking-wider"
                style={{ color: themeColors.green }}
              >
                One more thing
              </p>
            </div>

            <h3
              className="text-[18px] font-bold leading-tight"
              style={{ color: themeColors.charcoal }}
            >
              Don't come back to Mova every time this wallet drains.
            </h3>

            <p
              className="mt-2 text-[13px] leading-[1.6]"
              style={{ color: themeColors.mid }}
            >
              Turn on automation and MOVA will refill this wallet from your main
              balance automatically — same amount, same schedule, same
              destination. You set it once, we handle the rest.
            </p>

            <div className="mt-4 space-y-2">
              {[
                'Refills the moment the wallet runs low',
                'Restarts the same release schedule automatically',
                'Never touches more than you allow',
                'You can pause or edit it anytime',
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle
                    size={14}
                    style={{
                      color: themeColors.green,
                      marginTop: 3,
                      flexShrink: 0,
                    }}
                  />
                  <p className="text-[12px]" style={{ color: themeColors.charcoal }}>
                    {line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet summary card */}
        {wallet && (
          <div
            className="mb-5 rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={14} style={{ color: themeColors.mid }} />
                <span className="text-[12px]" style={{ color: themeColors.mid }}>
                  Target
                </span>
              </div>
              <span
                className="text-[13px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(wallet.targetAmount)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw size={14} style={{ color: themeColors.mid }} />
                <span className="text-[12px]" style={{ color: themeColors.mid }}>
                  Release per cycle
                </span>
              </div>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(wallet.releaseAmount)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {wallet.payoutDestination === 'bank' && (
                  <Landmark size={14} style={{ color: themeColors.mid }} />
                )}
                {wallet.payoutDestination === 'wallet' && (
                  <Banknote size={14} style={{ color: themeColors.mid }} />
                )}
                {wallet.payoutDestination === 'main' && (
                  <Wallet size={14} style={{ color: themeColors.mid }} />
                )}
                <span className="text-[12px]" style={{ color: themeColors.mid }}>
                  Releases go to
                </span>
              </div>
              <span
                className="text-[13px] font-semibold capitalize"
                style={{ color: themeColors.charcoal }}
              >
                {wallet.payoutDestination === 'bank'
                  ? 'Bank'
                  : wallet.payoutDestination === 'wallet'
                  ? 'Wallet balance'
                  : 'Main MOVA'}
              </span>
            </div>
          </div>
        )}

        {/* Existing policy summary — when policy exists and not editing */}
        {policy && !isEditing && (
          <>
            <div
              className="mb-4 rounded-[16px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={16} style={{ color: themeColors.green }} />
                  <span
                    className="text-[14px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Automation is on
                  </span>
                </div>

                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor:
                      policy.status.toLowerCase() === 'active'
                        ? isDark
                          ? 'rgba(15, 185, 110, 0.2)'
                          : 'rgba(15, 185, 110, 0.1)'
                        : isDark
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(239, 68, 68, 0.1)',
                    color:
                      policy.status.toLowerCase() === 'active'
                        ? themeColors.green
                        : '#EF4444',
                  }}
                >
                  {policy.status}
                </span>
              </div>

              <div className="space-y-3">
                <SummaryRow
                  label="Trigger"
                  value={
                    policy.triggerType.toLowerCase() === 'onthreshold'
                      ? `When balance drops below ${formatCurrency(
                          policy.triggerAmount
                        )}`
                      : 'When the wallet completes'
                  }
                  themeColors={themeColors}
                />

                <SummaryRow
                  label="Refill amount"
                  value={
                    policy.refillAmountType.toLowerCase() === 'fixed'
                      ? `${formatCurrency(
                          policy.refillAmountEffective
                        )} (same as target)`
                      : formatCurrency(policy.refillAmount)
                  }
                  themeColors={themeColors}
                />

                <SummaryRow
                  label="Keeps main above"
                  value={formatCurrency(policy.minMainBalance)}
                  themeColors={themeColors}
                />

                <SummaryRow
                  label="Renewals used"
                  value={
                    policy.maxRenewals === null
                      ? `${policy.renewalsCount} (unlimited)`
                      : `${policy.renewalsCount} of ${policy.maxRenewals}`
                  }
                  themeColors={themeColors}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  disabled={isPausingOrResuming}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-[12px] font-semibold transition-all hover:opacity-80 disabled:opacity-60"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.charcoal,
                    backgroundColor: themeColors.background,
                  }}
                >
                    {isPausingOrResuming ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : policy.status.toLowerCase() === 'active' ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                  {policy.status.toLowerCase() === 'active' ? 'Pause' : 'Resume'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[12px] font-semibold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: themeColors.green,
                    color: '#FFFFFF',
                  }}
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
            </div>

            {/* Events section */}
            <div
              className="mb-4 overflow-hidden rounded-[16px] border"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <button
                type="button"
                onClick={handleToggleEvents}
                className="flex w-full items-center justify-between p-4 transition-all hover:opacity-80"
              >
                <div className="flex items-center gap-2">
                  <History size={16} style={{ color: themeColors.mid }} />
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Refill history
                  </span>
                </div>
                {isEventsExpanded ? (
                  <ChevronUp size={18} style={{ color: themeColors.mid }} />
                ) : (
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                )}
              </button>

              {isEventsExpanded && (
                <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: themeColors.border }}>
                  {eventsLoading && events.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                      <Loader2
                        size={24}
                        className="animate-spin"
                        style={{ color: themeColors.green }}
                      />
                      <p className="mt-2 text-[12px]" style={{ color: themeColors.mid }}>
                        Loading history...
                      </p>
                    </div>
                  ) : eventsError ? (
                    <div
                      className="rounded-[10px] p-3 text-[12px]"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(239, 68, 68, 0.05)',
                        color: '#EF4444',
                      }}
                    >
                      {eventsError}
                    </div>
                  ) : events.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <History
                        size={28}
                        strokeWidth={1.5}
                        style={{ color: themeColors.mid }}
                      />
                      <p
                        className="mt-2 text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        No refills yet
                      </p>
                      <p className="mt-1 text-[11px]" style={{ color: themeColors.mid }}>
                        Refill events will appear here when automation fires.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {events.map((ev) => (
                          <EventRow
                            key={ev.id}
                            event={ev}
                            themeColors={themeColors}
                            isDark={isDark}
                            formatCurrency={formatCurrency}
                            formatDateTime={formatDateTime}
                          />
                        ))}
                      </div>

                      {eventsPage < eventsTotalPages && (
                        <button
                          type="button"
                          onClick={handleLoadMoreEvents}
                          disabled={eventsLoading}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border py-2.5 text-[12px] font-semibold transition-all hover:opacity-80 disabled:opacity-60"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.charcoal,
                          }}
                        >
                          {eventsLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            'Load more'
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Form (create or edit) */}
        {isFormVisible && (
          <div
            className="rounded-[16px] border p-5"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            {isEditing && (
              <div className="mb-4 flex items-center justify-between">
                <h3
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Edit automation
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    if (policy) {
                      setTriggerType(
                        policy.triggerType.toLowerCase() === 'onthreshold'
                          ? 'onthreshold'
                          : 'oncompletion'
                      )
                      setTriggerAmount(
                        policy.triggerType.toLowerCase() === 'onthreshold'
                          ? String(policy.triggerAmount)
                          : ''
                      )
                      setRefillAmountType(
                        policy.refillAmountType.toLowerCase() === 'custom'
                          ? 'custom'
                          : 'fixed'
                      )
                      setRefillAmount(
                        policy.refillAmountType.toLowerCase() === 'custom'
                          ? String(policy.refillAmount)
                          : ''
                      )
                      setMinMainBalance(String(policy.minMainBalance))
                      setMaxRenewals(
                        policy.maxRenewals === null ? '' : String(policy.maxRenewals)
                      )
                      setErrors({})
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.04)',
                  }}
                >
                  <X size={16} style={{ color: themeColors.mid }} />
                </button>
              </div>
            )}

            {/* Trigger section */}
            <div className="mb-5">
              <label
                className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                <Zap size={14} style={{ color: themeColors.mid }} />
                When should MOVA refill this wallet?
              </label>

              <div className="space-y-2">
                <TriggerOption
                  isSelected={triggerType === 'onthreshold'}
                  onClick={() => setTriggerType('onthreshold')}
                  title="When balance drops below a threshold"
                  description="As soon as the wallet's locked balance falls below your number, MOVA refills it."
                  themeColors={themeColors}
                  isDark={isDark}
                />

                <TriggerOption
                  isSelected={triggerType === 'oncompletion'}
                  onClick={() => setTriggerType('oncompletion')}
                  title="When the wallet completes"
                  description="Only after the entire wallet is drained and completed, MOVA restarts a fresh cycle."
                  themeColors={themeColors}
                  isDark={isDark}
                />
              </div>

              {triggerType === 'onthreshold' && (
                <div className="mt-3">
                  <label
                    className="mb-1.5 block text-[12px] font-medium"
                    style={{ color: themeColors.mid }}
                  >
                    Refill when locked balance falls below
                  </label>
                  <div
                    className="flex items-center rounded-[12px] border px-3 transition-all"
                    style={{
                      borderColor: errors.triggerAmount
                        ? '#EF4444'
                        : triggerAmount
                        ? themeColors.green
                        : themeColors.border,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                    }}
                  >
                    <span
                      className="text-[16px] font-bold"
                      style={{ color: themeColors.mid }}
                    >
                      ₦
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={triggerAmount}
                      onChange={(e) =>
                        handleAmountChange(
                          e.target.value,
                          setTriggerAmount,
                          'triggerAmount'
                        )
                      }
                      placeholder="0"
                      className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                      style={{ color: themeColors.charcoal }}
                    />
                  </div>
                  {errors.triggerAmount ? (
                    <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                      {errors.triggerAmount}
                    </p>
                  ) : (
                    wallet && (
                      <p className="mt-1 text-[11px]" style={{ color: themeColors.mid }}>
                        Suggested: ~15% of your target (₦
                        {wallet.targetAmount.toLocaleString()})
                      </p>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Refill amount section */}
            <div className="mb-5">
              <label
                className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                <RefreshCw size={14} style={{ color: themeColors.mid }} />
                How much should each refill add?
              </label>

              <div className="space-y-2">
                <TriggerOption
                  isSelected={refillAmountType === 'fixed'}
                  onClick={() => setRefillAmountType('fixed')}
                  title="Refill back to the original target"
                  description={
                    wallet
                      ? `Always tops up to ${formatCurrency(
                          wallet.targetAmount
                        )} — the same amount this wallet started with.`
                      : 'Tops up to the same amount the wallet started with.'
                  }
                  themeColors={themeColors}
                  isDark={isDark}
                />

                <TriggerOption
                  isSelected={refillAmountType === 'custom'}
                  onClick={() => setRefillAmountType('custom')}
                  title="Refill a custom amount"
                  description="Choose a specific amount to add on each refill."
                  themeColors={themeColors}
                  isDark={isDark}
                />
              </div>

              {refillAmountType === 'custom' && (
                <div className="mt-3">
                  <label
                    className="mb-1.5 block text-[12px] font-medium"
                    style={{ color: themeColors.mid }}
                  >
                    Refill amount
                  </label>
                  <div
                    className="flex items-center rounded-[12px] border px-3 transition-all"
                    style={{
                      borderColor: errors.refillAmount
                        ? '#EF4444'
                        : refillAmount
                        ? themeColors.green
                        : themeColors.border,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                    }}
                  >
                    <span
                      className="text-[16px] font-bold"
                      style={{ color: themeColors.mid }}
                    >
                      ₦
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={refillAmount}
                      onChange={(e) =>
                        handleAmountChange(
                          e.target.value,
                          setRefillAmount,
                          'refillAmount'
                        )
                      }
                      placeholder="0"
                      className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                      style={{ color: themeColors.charcoal }}
                    />
                  </div>
                  {errors.refillAmount && (
                    <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                      {errors.refillAmount}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Guardrails */}
            <div className="mb-5">
              <label
                className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                <Shield size={14} style={{ color: themeColors.mid }} />
                Guardrails
              </label>

              <div className="mb-3">
                <label
                  className="mb-1.5 block text-[12px] font-medium"
                  style={{ color: themeColors.mid }}
                >
                  Keep at least this much in my main balance
                </label>
                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.minMainBalance
                      ? '#EF4444'
                      : themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <span
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.mid }}
                  >
                    ₦
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minMainBalance}
                    onChange={(e) =>
                      handleAmountChange(
                        e.target.value,
                        setMinMainBalance,
                        'minMainBalance'
                      )
                    }
                    placeholder="0"
                    className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                </div>
                {errors.minMainBalance && (
                  <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                    {errors.minMainBalance}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-1.5 block text-[12px] font-medium"
                  style={{ color: themeColors.mid }}
                >
                  Max refills (leave blank for unlimited)
                </label>
                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.maxRenewals ? '#EF4444' : themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maxRenewals}
                    onChange={(e) =>
                      handleAmountChange(
                        e.target.value,
                        setMaxRenewals,
                        'maxRenewals'
                      )
                    }
                    placeholder="Unlimited"
                    className="w-full border-0 bg-transparent py-3 text-[16px] font-bold outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                </div>
                {errors.maxRenewals && (
                  <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                    {errors.maxRenewals}
                  </p>
                )}
              </div>
            </div>

            {/* Info note */}
            <div
              className="mb-5 flex items-start gap-3 rounded-[12px] p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.1)'
                  : 'rgba(96, 165, 250, 0.06)',
                borderColor: isDark
                  ? 'rgba(96, 165, 250, 0.2)'
                  : 'rgba(96, 165, 250, 0.15)',
                borderWidth: 1,
              }}
            >
              <Info
                size={16}
                style={{ color: '#60A5FA', marginTop: 2, flexShrink: 0 }}
              />
              <p className="text-[12px] leading-[1.55]" style={{ color: themeColors.charcoal }}>
                A one-time MOVA fee will be charged now. Refill principal is only
                debited from your main balance when a refill actually fires.
              </p>
            </div>

            {submitError && (
              <div
                className="mb-4 rounded-[12px] p-3 text-[13px]"
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

            <div className="flex gap-3">
              {!policy && (
                <button
                  type="button"
                  onClick={() => navigate(`/wallet/${walletId}`, { replace: true })}
                  disabled={isVerifyingPin}
                  className="flex-1 rounded-[12px] border px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-70 disabled:opacity-60"
                  style={{
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.card,
                    color: themeColors.charcoal,
                  }}
                >
                  Maybe later
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenPin}
                disabled={isVerifyingPin}
                className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                {isVerifyingPin ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {policy ? 'Save changes' : 'Enable automation'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description={
          policy
            ? 'Enter your PIN to save the automation changes.'
            : 'Enter your PIN to enable automation for this wallet.'
        }
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handleSubmitWithPin}
        isLoading={isVerifyingPin}
        maxLength={6}
      />
    </AppLayout>
  )
}

// ─── Subcomponents ─────────────────────────────────────

function SummaryRow({
  label,
  value,
  themeColors,
}: {
  label: string
  value: string
  themeColors: typeof colors | typeof darkColors
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[12px]" style={{ color: themeColors.mid }}>
        {label}
      </span>
      <span
        className="ml-3 max-w-[65%] text-right text-[13px] font-semibold"
        style={{ color: themeColors.charcoal }}
      >
        {value}
      </span>
    </div>
  )
}

function SuccessRow({
  label,
  value,
  themeColors,
}: {
  label: string
  value: string
  themeColors: typeof colors | typeof darkColors
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px]" style={{ color: themeColors.mid }}>
        {label}
      </span>
      <span
        className="text-[13px] font-semibold"
        style={{ color: themeColors.charcoal }}
      >
        {value}
      </span>
    </div>
  )
}

function TriggerOption({
  isSelected,
  onClick,
  title,
  description,
  themeColors,
  isDark,
}: {
  isSelected: boolean
  onClick: () => void
  title: string
  description: string
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-[14px] border-2 p-3.5 text-left transition-all duration-150"
      style={{
        backgroundColor: isSelected
          ? isDark
            ? 'rgba(15, 185, 110, 0.1)'
            : 'rgba(15, 185, 110, 0.05)'
          : themeColors.background,
        borderColor: isSelected ? themeColors.green : 'transparent',
      }}
    >
      <div
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
        style={{
          borderColor: isSelected ? themeColors.green : themeColors.border,
          backgroundColor: isSelected ? themeColors.green : 'transparent',
        }}
      >
        {isSelected && (
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: '#FFFFFF' }}
          />
        )}
      </div>

      <div className="flex-1">
        <p
          className="text-[13px] font-semibold"
          style={{ color: themeColors.charcoal }}
        >
          {title}
        </p>
        <p
          className="mt-0.5 text-[11px] leading-[1.5]"
          style={{ color: themeColors.mid }}
        >
          {description}
        </p>
      </div>
    </button>
  )
}

function EventRow({
  event,
  themeColors,
  isDark,
  formatCurrency,
  formatDateTime,
}: {
  event: RenewalEvent
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
  formatCurrency: (n: number) => string
  formatDateTime: (iso: string) => string
}) {
  const resultColors: Record<string, { bg: string; fg: string }> = {
    Succeeded: {
      bg: isDark ? 'rgba(15, 185, 110, 0.15)' : 'rgba(15, 185, 110, 0.08)',
      fg: themeColors.green,
    },
    Skipped: {
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
      fg: '#F59E0B',
    },
    Failed: {
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      fg: '#EF4444',
    },
  }

  const style = resultColors[event.result] || resultColors.Succeeded

  return (
    <div
      className="rounded-[12px] border p-3"
      style={{
        borderColor: themeColors.border,
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FAFBFC',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: style.bg, color: style.fg }}
            >
              {event.result}
            </span>
            <span
              className="text-[11px]"
              style={{ color: themeColors.mid }}
            >
              {formatDateTime(event.occurredAt)}
            </span>
          </div>

          <p
            className="mt-1.5 text-[13px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            {formatCurrency(event.amount)}
          </p>

          {event.reason && (
            <p
              className="mt-1 text-[11px] leading-[1.5]"
              style={{ color: themeColors.mid }}
            >
              {event.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}