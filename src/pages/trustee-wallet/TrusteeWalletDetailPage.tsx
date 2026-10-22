import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Target,
  Info,
  Loader2,
  Frown,
  Plus,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  List,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { colors, darkColors } from '../../styles/tokens'
import { formatCurrency, formatUSDateTime } from '../../utils/formatting'
import { verifyPin } from '../../services/app/pin'
import { PinChallengeType } from '../../types/enums/pinChallengeType'

import {
  getTrusteeWalletDetail,
  getWalletReleaseRequests,
  type TrusteeWalletDetail,
  type ReleaseRequestItem,
  type ReleaseRequestsPage,
} from '../../services/app/trusteeWallet'

import {
  getWalletActivities,
  getWalletPayouts,
  getWalletBankAccount,
  getAvailableBanks,
  linkBankToWallet,
  type ActivityGroup,
  type BankAccountData,
  type AvailableBank,
} from '../../services/app/wallet'

/* ─────────── Types ─────────── */

type TabType = 'request' | 'activities' | 'bank'
type ActivitiesViewType = 'transactions' | 'payouts'

/* ─────────── Countdown helper ─────────── */

function formatTimeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'

  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

/* ─────────── Status style pair ───────────
 * Returns pre-built { bg, text } instead of a single color so we don't
 * break CSS-var tokens with hex-opacity string concatenation.
 */

function getRequestStatusStyles(
  status: string,
  isDark: boolean,
  themeColors: typeof colors | typeof darkColors
): { bg: string; text: string } {
  switch ((status ?? '').toLowerCase()) {
    case 'pending':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
        text: '#F59E0B',
      }
    case 'approved':
      return {
        bg: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
        text: themeColors.green,
      }
    case 'rejected':
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
        text: '#EF4444',
      }
    case 'expired':
      return {
        bg: isDark ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.1)',
        text: '#9CA3AF',
      }
    default:
      return {
        bg: isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(107, 114, 128, 0.1)',
        text: themeColors.mid,
      }
  }
}

/* ─────────── Account number mask ─────────── */

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return ''
  const last4 = accountNumber.slice(-4)
  const masked = '•'.repeat(Math.max(accountNumber.length - 4, 0))
  return `${masked}${last4}`
}

/* ─────────── Main component ─────────── */

export default function TrusteeWalletDetailPage() {
  const navigate = useNavigate()
  const { walletId } = useParams<{ walletId: string }>()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const [activeTab, setActiveTab] = useState<TabType>('request')
  const [activitiesView, setActivitiesView] =
    useState<ActivitiesViewType>('transactions')

  const [wallet, setWallet] = useState<TrusteeWalletDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Request tab state
  const [requestsPage, setRequestsPage] = useState<ReleaseRequestsPage | null>(null)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingMoreRequests, setIsLoadingMoreRequests] = useState(false)

  // Activities tab state
  const [activities, setActivities] = useState<ActivityGroup[]>([])
  const [activitiesPage, setActivitiesPage] = useState(1)
  const [activitiesTotalPages, setActivitiesTotalPages] = useState(0)
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [isLoadingMoreActivities, setIsLoadingMoreActivities] = useState(false)
  const [activitiesLoaded, setActivitiesLoaded] = useState(false)

  const [payouts, setPayouts] = useState<ActivityGroup[]>([])
  const [payoutsPage, setPayoutsPage] = useState(1)
  const [payoutsTotalPages, setPayoutsTotalPages] = useState(0)
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false)
  const [isLoadingMorePayouts, setIsLoadingMorePayouts] = useState(false)
  const [payoutsLoaded, setPayoutsLoaded] = useState(false)

  // Bank state
  const [bankAccount, setBankAccount] = useState<BankAccountData | null>(null)
  const [bankLoaded, setBankLoaded] = useState(false)
  const [availableBanks, setAvailableBanks] = useState<AvailableBank[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [showBankList, setShowBankList] = useState(false)
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null)
  const [pendingBankId, setPendingBankId] = useState<number | null>(null)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isLinking, setIsLinking] = useState(false)

  // Tick so countdowns update every minute
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60000)
    return () => clearInterval(t)
  }, [])

  /* ─────────── Initial wallet fetch ─────────── */

  useEffect(() => {
    if (!walletId) return
    const id = Number(walletId)
    if (!Number.isFinite(id) || id <= 0) {
      setError('Invalid wallet ID.')
      setIsLoading(false)
      return
    }

    const fetchDetail = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getTrusteeWalletDetail(id)
        if (res.is_success && res.data) {
          setWallet(res.data)
        } else {
          setError(res.message || 'Failed to load wallet.')
        }
      } catch {
        setError('Failed to load wallet. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [walletId])

  /* ─────────── Bank loader (runs on mount) ─────────── */

  useEffect(() => {
    if (!walletId || bankLoaded) return
    const id = Number(walletId)
    if (!Number.isFinite(id) || id <= 0) {
      setBankLoaded(true)
      return
    }

    const load = async () => {
      try {
        const res = await getWalletBankAccount(id)
        if (res.is_success && res.data) {
          setBankAccount(res.data)
        }
      } catch (err) {
        console.error('Failed to load bank', err)
      } finally {
        setBankLoaded(true)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId, bankLoaded])

  /* ─────────── Request tab loader ─────────── */

  const loadRequestsPage = useCallback(
    async (page: number) => {
      if (!walletId) return
      const id = Number(walletId)

      if (page === 1) setIsLoadingRequests(true)
      else setIsLoadingMoreRequests(true)

      try {
        const res = await getWalletReleaseRequests(id, page, 20)
        if (res.is_success && res.data) {
          if (page === 1) {
            setRequestsPage(res.data)
          } else {
            setRequestsPage((prev) =>
              prev
                ? {
                    ...prev,
                    page: res.data!.page,
                    items: [...prev.items, ...res.data!.items],
                  }
                : res.data
            )
          }
        }
      } catch (err) {
        console.error('Failed to load requests', err)
      } finally {
        setIsLoadingRequests(false)
        setIsLoadingMoreRequests(false)
      }
    },
    [walletId]
  )

  useEffect(() => {
    if (activeTab === 'request' && !requestsPage) {
      loadRequestsPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  /* ─────────── Activities tab loaders ─────────── */

  useEffect(() => {
    if (
      activeTab === 'activities' &&
      activitiesView === 'transactions' &&
      !activitiesLoaded &&
      !isLoadingActivities
    ) {
      const load = async () => {
        setIsLoadingActivities(true)
        try {
          const res = await getWalletActivities(Number(walletId), 1)
          if (res.is_success && res.data) {
            setActivities(res.data.items)
            setActivitiesPage(res.data.page)
            setActivitiesTotalPages(res.data.totalPages)
          }
          setActivitiesLoaded(true)
        } catch (err) {
          console.error('Failed to load activities', err)
        } finally {
          setIsLoadingActivities(false)
        }
      }
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activitiesView, activitiesLoaded])

  useEffect(() => {
    if (
      activeTab === 'activities' &&
      activitiesView === 'payouts' &&
      !payoutsLoaded &&
      !isLoadingPayouts
    ) {
      const load = async () => {
        setIsLoadingPayouts(true)
        try {
          const res = await getWalletPayouts(Number(walletId), 1)
          if (res.is_success && res.data) {
            setPayouts(res.data.items)
            setPayoutsPage(res.data.page)
            setPayoutsTotalPages(res.data.totalPages)
          }
          setPayoutsLoaded(true)
        } catch (err) {
          console.error('Failed to load payouts', err)
        } finally {
          setIsLoadingPayouts(false)
        }
      }
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activitiesView, payoutsLoaded])

  /* ─────────── Load more handlers ─────────── */

  const handleLoadMoreActivities = async () => {
    if (isLoadingMoreActivities) return
    if (activitiesPage >= activitiesTotalPages) return
    setIsLoadingMoreActivities(true)
    try {
      const res = await getWalletActivities(Number(walletId), activitiesPage + 1)
      if (res.is_success && res.data) {
        setActivities((prev) => [...prev, ...res.data!.items])
        setActivitiesPage(res.data.page)
        setActivitiesTotalPages(res.data.totalPages)
      }
    } finally {
      setIsLoadingMoreActivities(false)
    }
  }

  const handleLoadMorePayouts = async () => {
    if (isLoadingMorePayouts) return
    if (payoutsPage >= payoutsTotalPages) return
    setIsLoadingMorePayouts(true)
    try {
      const res = await getWalletPayouts(Number(walletId), payoutsPage + 1)
      if (res.is_success && res.data) {
        setPayouts((prev) => [...prev, ...res.data!.items])
        setPayoutsPage(res.data.page)
        setPayoutsTotalPages(res.data.totalPages)
      }
    } finally {
      setIsLoadingMorePayouts(false)
    }
  }

  /* ─────────── Bank linking handlers ─────────── */

  const handleAddBank = async () => {
    setIsLoadingBanks(true)
    setShowBankList(false)
    setSelectedBankId(null)
    try {
      const response = await getAvailableBanks()
      if (response.is_success && response.data && response.data.length > 0) {
        setAvailableBanks(response.data)
        setShowBankList(true)
      } else {
        navigate(`/dashboard/bank?walletId=${walletId}`)
      }
    } catch (error) {
      console.error('Error fetching banks:', error)
      navigate(`/dashboard/bank?walletId=${walletId}`)
    } finally {
      setIsLoadingBanks(false)
    }
  }

  const handleAddBankFromRequestTab = () => {
    setActiveTab('bank')
    handleAddBank()
  }

  const handleSelectBank = (bankId: number) => {
    setSelectedBankId(bankId)
  }

  const handleLinkBankClick = () => {
    if (selectedBankId === null) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: 'Please select a bank account first',
          },
        })
      )
      return
    }
    setPendingBankId(selectedBankId)
    setIsPinModalOpen(true)
  }

  const handlePinVerification = async (pin: string) => {
    try {
      const pinResponse = await verifyPin({
        pin,
        platform: 'web',
        pinChallengeType: PinChallengeType.LinkBankAccountToWallet,
      })

      if (!pinResponse.is_success) {
        throw new Error(pinResponse.message || 'Invalid PIN. Please try again.')
      }

      if (pendingBankId === null) {
        throw new Error('No bank account selected')
      }

      setIsLinking(true)

      const response = await linkBankToWallet(Number(walletId), pendingBankId)

      if (response.is_success && response.data) {
        setBankAccount(response.data)
        setShowBankList(false)
        setAvailableBanks([])
        setSelectedBankId(null)
        setPendingBankId(null)

        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: {
              type: 'success',
              message: 'Bank account linked successfully!',
            },
          })
        )

        setIsPinModalOpen(false)
      } else {
        throw new Error(response.message || 'Failed to link bank account')
      }
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to link bank account. Please try again.',
          },
        })
      )
      throw error
    } finally {
      setIsLinking(false)
    }
  }

  /* ─────────── Request release ─────────── */

  const handleRequestRelease = () => {
    if (!wallet) return

    if (!wallet.trustee || wallet.trustee.status !== 'Verified') {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              'A verified trustee is required before you can request a release.',
          },
        })
      )
      return
    }

    if (!hasBank) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              'This wallet has no destination bank account. Add one before requesting a release.',
          },
        })
      )
      return
    }

    if (!canRequestRelease) return

    navigate(`/dashboard/trustee/wallet/${wallet.id}/request-release`, {
      state: {
        walletId: wallet.id,
        walletName: wallet.name,
        categoryIcon: wallet.categoryIcon,
        lockedAmount: wallet.lockedAmount,
        trusteeName: wallet.trustee.name,
        trusteeEmail: wallet.trustee.email,
      },
    })
  }

  /* ─────────── Loading ─────────── */

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: themeColors.trustee }}
          />
        </div>
      </AppLayout>
    )
  }

  if (error || !wallet) {
    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          <div className="mb-4 flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)} />
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Wallet
            </h2>
          </div>
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(239, 68, 68, 0.08)',
                color: '#EF4444',
              }}
            >
              <Frown size={32} strokeWidth={1.5} />
            </div>
            <p
              className="mt-4 text-[15px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              {error ?? 'Wallet not found'}
            </p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-5 rounded-full px-6 py-2.5 text-[14px] font-semibold"
              style={{
                backgroundColor: themeColors.trustee,
                color: '#FFFFFF',
              }}
            >
              Go back
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  /* ─────────── Derived ─────────── */

  const CategoryIcon = getIcon(wallet.categoryIcon)
  const isTrusteeVerified = wallet.trustee?.status === 'Verified'
  const hasPendingRelease = !!wallet.pendingRelease
  const hasBank = !!bankAccount

  const canRequestRelease =
    isTrusteeVerified &&
    !hasPendingRelease &&
    wallet.status === 'Active' &&
    hasBank

  /* ─────────── Render ─────────── */

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />
          <CategoryIcon
            size={20}
            strokeWidth={2}
            style={{ color: themeColors.trustee }}
          />
          <h2
            className="text-[20px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            {wallet.name}
          </h2>
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: themeColors.trusteeLight,
              color: themeColors.trustee,
            }}
          >
            <Shield size={10} strokeWidth={2.5} />
            Trustee
          </span>
        </div>

        {/* Hero */}
        <section
          className="rounded-[20px] border p-5 text-center"
          style={{
            backgroundColor: themeColors.trusteeLight,
            borderColor: themeColors.trusteeMid,
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Target size={16} style={{ color: themeColors.trustee }} />
            <p
              className="text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.trustee }}
            >
              Target Amount
            </p>
          </div>

          <p
            className="mt-2 font-bold leading-none"
            style={{
              color: themeColors.charcoal,
              fontSize: 'clamp(28px, 8vw, 42px)',
              fontFamily:
                "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: '-0.03em',
            }}
          >
            {formatCurrency(wallet.targetAmount)}
          </p>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span style={{ color: themeColors.mid }}>
                Released: {formatCurrency(wallet.totalReleasedAmount)}
              </span>
              <span style={{ color: themeColors.mid }}>
                {Math.round(wallet.progressPercentage)}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: themeColors.border }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  backgroundColor: themeColors.trustee,
                  width: `${Math.min(wallet.progressPercentage, 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div
              className="rounded-[12px] p-2.5 text-center"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.04)',
              }}
            >
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: themeColors.mid }}
              >
                Locked
              </p>
              <p
                className="mt-0.5 text-[14px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(wallet.lockedAmount)}
              </p>
            </div>
            <div
              className="rounded-[12px] p-2.5 text-center"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.04)',
              }}
            >
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: themeColors.mid }}
              >
                Available
              </p>
              <p
                className="mt-0.5 text-[14px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(wallet.availableAmount)}
              </p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div
          className="mt-4 flex border-b"
          style={{ borderColor: themeColors.border }}
        >
          {(
            [
              { key: 'request', label: 'Request' },
              { key: 'activities', label: 'Activities' },
              { key: 'bank', label: 'Bank' },
            ] as { key: TabType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 py-3 text-center text-[13px] font-semibold transition-all"
              style={{
                color:
                  activeTab === tab.key ? themeColors.trustee : themeColors.mid,
                borderBottom:
                  activeTab === tab.key
                    ? `2px solid ${themeColors.trustee}`
                    : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* ═══════════ REQUEST TAB ═══════════ */}
          {activeTab === 'request' && (
            <div className="space-y-4">
              {/* Trustee card */}
              {wallet.trustee ? (
                <div
                  className="flex items-center gap-3 rounded-[16px] border p-4"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: themeColors.trusteeLight,
                      color: themeColors.trustee,
                    }}
                  >
                    <Shield size={20} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="truncate text-[14px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {wallet.trustee.name ||
                          wallet.trustee.email.split('@')[0]}
                      </p>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                        style={
                          wallet.trustee.status === 'Verified'
                            ? {
                                backgroundColor: themeColors.trusteeLight,
                                color: themeColors.trustee,
                              }
                            : {
                                backgroundColor: isDark
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(245, 158, 11, 0.1)',
                                color: '#F59E0B',
                              }
                        }
                      >
                        {wallet.trustee.status}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 truncate text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      {wallet.trustee.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-start gap-3 rounded-[16px] border border-dashed p-4"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.05)'
                      : 'rgba(239, 68, 68, 0.03)',
                    borderColor: isDark
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <AlertCircle
                    size={16}
                    style={{
                      color: '#EF4444',
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: '#EF4444' }}
                    >
                      No trustee assigned
                    </p>
                    <p
                      className="mt-1 text-[11px] leading-[1.55]"
                      style={{ color: themeColors.mid }}
                    >
                      This wallet can't release funds until a verified trustee
                      is assigned.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/trustees')}
                      className="mt-2 text-[11px] font-semibold"
                      style={{ color: themeColors.trustee }}
                    >
                      Invite a trustee →
                    </button>
                  </div>
                </div>
              )}

              {/* Request Release CTA */}
              <button
                type="button"
                onClick={handleRequestRelease}
                disabled={!canRequestRelease}
                className="flex w-full items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: themeColors.trustee,
                  color: '#FFFFFF',
                }}
              >
                <Target size={18} />
                Request Release
                <ArrowRight size={16} />
              </button>

              {!isTrusteeVerified && (
                <p
                  className="text-center text-[11px]"
                  style={{ color: '#EF4444' }}
                >
                  A verified trustee is required before you can request a
                  release.
                </p>
              )}
              {hasPendingRelease && (
                <p
                  className="text-center text-[11px]"
                  style={{ color: '#F59E0B' }}
                >
                  You already have a pending release. Wait for it to resolve.
                </p>
              )}

              {/* No bank warning — jumps straight to the Bank tab */}
              {!hasBank && bankLoaded && (
                <div
                  className="rounded-[14px] border border-dashed p-3"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.06)'
                      : 'rgba(239, 68, 68, 0.03)',
                    borderColor: isDark
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={16}
                      style={{
                        color: '#EF4444',
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: '#EF4444' }}
                      >
                        No destination bank
                      </p>
                      <p
                        className="mt-1 text-[11px] leading-[1.55]"
                        style={{ color: themeColors.mid }}
                      >
                        This wallet can't release funds until a bank account is
                        added.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddBankFromRequestTab}
                        disabled={isLoadingBanks}
                        className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold disabled:opacity-60"
                        style={{ color: themeColors.trustee }}
                      >
                        <Plus size={12} strokeWidth={2.5} />
                        {isLoadingBanks
                          ? 'Opening bank tab...'
                          : 'Add bank account →'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending release card */}
              {hasPendingRelease && wallet.pendingRelease && (
                <div
                  className="rounded-[16px] border p-4"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'rgba(245, 158, 11, 0.04)',
                    borderColor: isDark
                      ? 'rgba(245, 158, 11, 0.25)'
                      : 'rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: '#F59E0B' }} />
                      <p
                        className="text-[12px] font-semibold"
                        style={{ color: '#F59E0B' }}
                      >
                        Waiting for approval
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(245, 158, 11, 0.1)',
                        color: '#F59E0B',
                      }}
                    >
                      {formatTimeLeft(wallet.pendingRelease.expiresAt)}
                    </span>
                  </div>

                  <p
                    className="mt-2 text-[22px] font-bold"
                    style={{
                      color: themeColors.charcoal,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(wallet.pendingRelease.amount)}
                  </p>

                  <div className="mt-2 space-y-1">
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      <span style={{ fontWeight: 600 }}>To:</span>{' '}
                      {wallet.pendingRelease.payoutDestination}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      <span style={{ fontWeight: 600 }}>Requested:</span>{' '}
                      {formatUSDateTime(wallet.pendingRelease.requestedAt)}
                    </p>
                    {wallet.pendingRelease.userNote && (
                      <p
                        className="text-[11px] italic"
                        style={{ color: themeColors.mid }}
                      >
                        "{wallet.pendingRelease.userNote}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Request history */}
              <div>
                <p
                  className="mb-2 text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Request history
                </p>

                {isLoadingRequests ? (
                  <div className="flex justify-center py-6">
                    <Loader2
                      size={24}
                      className="animate-spin"
                      style={{ color: themeColors.trustee }}
                    />
                  </div>
                ) : requestsPage && requestsPage.items.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {requestsPage.items.map((req) => (
                        <RequestHistoryCard
                          key={req.id}
                          request={req}
                          isDark={isDark}
                          themeColors={themeColors}
                        />
                      ))}
                    </div>

                    {requestsPage.page < requestsPage.totalPages && (
                      <button
                        type="button"
                        onClick={() =>
                          loadRequestsPage(requestsPage.page + 1)
                        }
                        disabled={isLoadingMoreRequests}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border py-2.5 text-[12px] font-semibold transition-all hover:opacity-80 disabled:opacity-60"
                        style={{
                          borderColor: themeColors.border,
                          color: themeColors.charcoal,
                        }}
                      >
                        {isLoadingMoreRequests ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          'Load more'
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center rounded-[12px] border border-dashed py-8 text-center"
                    style={{
                      borderColor: themeColors.border,
                      color: themeColors.mid,
                    }}
                  >
                    <Clock size={24} strokeWidth={1.5} />
                    <p className="mt-2 text-[13px] font-medium">
                      No requests yet
                    </p>
                    <p className="mt-0.5 text-[11px]">
                      Requested releases will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════ ACTIVITIES TAB ═══════════ */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <div
                className="flex items-center gap-1 rounded-[12px] border p-1"
                style={{ borderColor: themeColors.border }}
              >
                <button
                  type="button"
                  onClick={() => setActivitiesView('transactions')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all"
                  style={{
                    backgroundColor:
                      activitiesView === 'transactions'
                        ? themeColors.trustee
                        : 'transparent',
                    color:
                      activitiesView === 'transactions'
                        ? '#FFFFFF'
                        : themeColors.mid,
                  }}
                >
                  <List size={14} />
                  Transactions
                </button>
                <button
                  type="button"
                  onClick={() => setActivitiesView('payouts')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all"
                  style={{
                    backgroundColor:
                      activitiesView === 'payouts'
                        ? themeColors.trustee
                        : 'transparent',
                    color:
                      activitiesView === 'payouts'
                        ? '#FFFFFF'
                        : themeColors.mid,
                  }}
                >
                  <Banknote size={14} />
                  Payouts
                </button>
              </div>

              {activitiesView === 'transactions' && (
                <>
                  {isLoadingActivities ? (
                    <div className="flex justify-center py-6">
                      <Loader2
                        size={24}
                        className="animate-spin"
                        style={{ color: themeColors.trustee }}
                      />
                    </div>
                  ) : activities.length > 0 ? (
                    <>
                      {activities.map((group) => (
                        <div key={group.date}>
                          <p
                            className="mb-2 text-[13px] font-semibold"
                            style={{ color: themeColors.mid }}
                          >
                            {formatUSDateTime(group.date)}
                          </p>
                          <div className="space-y-2">
                            {group.activities.map((activity) => (
                              <ActivityRow
                                key={activity.id}
                                activity={activity}
                                themeColors={themeColors}
                              />
                            ))}
                          </div>
                        </div>
                      ))}

                      {activitiesPage < activitiesTotalPages && (
                        <button
                          type="button"
                          onClick={handleLoadMoreActivities}
                          disabled={isLoadingMoreActivities}
                          className="flex w-full items-center justify-center gap-2 rounded-[10px] border py-2.5 text-[12px] font-semibold transition-all hover:opacity-80 disabled:opacity-60"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.charcoal,
                          }}
                        >
                          {isLoadingMoreActivities ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            'Load more'
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-12 text-center"
                      style={{ color: themeColors.mid }}
                    >
                      <List size={32} strokeWidth={1.5} />
                      <p className="mt-3 text-[14px] font-medium">
                        No transactions yet
                      </p>
                    </div>
                  )}
                </>
              )}

              {activitiesView === 'payouts' && (
                <>
                  {isLoadingPayouts ? (
                    <div className="flex justify-center py-6">
                      <Loader2
                        size={24}
                        className="animate-spin"
                        style={{ color: themeColors.trustee }}
                      />
                    </div>
                  ) : payouts.length > 0 ? (
                    <>
                      {payouts.map((group) => (
                        <div key={group.date}>
                          <p
                            className="mb-2 text-[13px] font-semibold"
                            style={{ color: themeColors.mid }}
                          >
                            {formatUSDateTime(group.date)}
                          </p>
                          <div className="space-y-2">
                            {group.activities.map((activity) => (
                              <ActivityRow
                                key={activity.id}
                                activity={activity}
                                themeColors={themeColors}
                              />
                            ))}
                          </div>
                        </div>
                      ))}

                      {payoutsPage < payoutsTotalPages && (
                        <button
                          type="button"
                          onClick={handleLoadMorePayouts}
                          disabled={isLoadingMorePayouts}
                          className="flex w-full items-center justify-center gap-2 rounded-[10px] border py-2.5 text-[12px] font-semibold transition-all hover:opacity-80 disabled:opacity-60"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.charcoal,
                          }}
                        >
                          {isLoadingMorePayouts ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            'Load more'
                          )}
                        </button>
                      )}
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-12 text-center"
                      style={{ color: themeColors.mid }}
                    >
                      <Banknote size={32} strokeWidth={1.5} />
                      <p className="mt-3 text-[14px] font-medium">
                        No payouts yet
                      </p>
                      <p className="mt-1 text-[12px]">
                        Payouts will appear here after approved releases move
                        money out
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ═══════════ BANK TAB ═══════════ */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              {!bankLoaded ? (
                <div className="flex justify-center py-6">
                  <Loader2
                    size={24}
                    className="animate-spin"
                    style={{ color: themeColors.trustee }}
                  />
                </div>
              ) : bankAccount ? (
                <>
                  <div
                    className="rounded-[16px] border p-4"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {bankAccount.bankImageUrl ? (
                        <img
                          src={bankAccount.bankImageUrl}
                          alt={bankAccount.bankName}
                          className="h-12 w-12 rounded-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-[12px]"
                          style={{
                            backgroundColor: themeColors.trusteeLight,
                            color: themeColors.trustee,
                          }}
                        >
                          <Banknote size={22} strokeWidth={2} />
                        </div>
                      )}
                      <div>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          {bankAccount.accountName}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: themeColors.mid }}
                        >
                          {maskAccountNumber(bankAccount.accountNumber)} ·{' '}
                          {bankAccount.bankName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-[12px] border p-4"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div className="space-y-3">
                      <div>
                        <p
                          className="text-[11px]"
                          style={{ color: themeColors.mid }}
                        >
                          Bank name
                        </p>
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          {bankAccount.bankName}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[11px]"
                          style={{ color: themeColors.mid }}
                        >
                          Account number
                        </p>
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          {maskAccountNumber(bankAccount.accountNumber)}
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-[11px]"
                          style={{ color: themeColors.mid }}
                        >
                          Account name
                        </p>
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          {bankAccount.accountName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-start gap-3 rounded-[12px] border p-3"
                    style={{
                      backgroundColor: themeColors.trusteeLight,
                      borderColor: themeColors.trusteeMid,
                    }}
                  >
                    <Info
                      size={14}
                      style={{
                        color: themeColors.trustee,
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <p
                      className="text-[11.5px] leading-[1.55]"
                      style={{ color: themeColors.mid }}
                    >
                      This bank account is linked to your trustee wallet for
                      withdrawals. Release destinations are chosen per request.
                    </p>
                  </div>
                </>
              ) : showBankList && availableBanks.length > 0 ? (
                <>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Select a bank account to link
                  </p>
                  <div className="space-y-3">
                    {availableBanks.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => handleSelectBank(bank.id)}
                        className="flex w-full items-center justify-between rounded-[14px] border p-4 transition-all duration-200 hover:opacity-80"
                        style={{
                          backgroundColor:
                            selectedBankId === bank.id
                              ? themeColors.trusteeLight
                              : themeColors.card,
                          borderColor:
                            selectedBankId === bank.id
                              ? themeColors.trustee
                              : themeColors.border,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {bank.bankImageUrl ? (
                            <img
                              src={bank.bankImageUrl}
                              alt={bank.bankName}
                              className="h-10 w-10 rounded-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: themeColors.trusteeLight,
                                color: themeColors.trustee,
                              }}
                            >
                              <Banknote size={18} strokeWidth={2} />
                            </div>
                          )}
                          <div className="text-left">
                            <p
                              className="text-[14px] font-semibold"
                              style={{ color: themeColors.charcoal }}
                            >
                              {bank.accountName}
                            </p>
                            <p
                              className="text-[12px]"
                              style={{ color: themeColors.mid }}
                            >
                              {bank.bankName} · {bank.accountNumber}
                            </p>
                          </div>
                        </div>
                        {selectedBankId === bank.id && (
                          <CheckCircle
                            size={20}
                            style={{ color: themeColors.trustee }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedBankId !== null && (
                    <button
                      type="button"
                      onClick={handleLinkBankClick}
                      disabled={isLinking}
                      className="mt-4 w-full rounded-[14px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: themeColors.trustee,
                        color: '#FFFFFF',
                      }}
                    >
                      {isLinking ? (
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="h-4 w-4 animate-spin rounded-full border-2"
                            style={{
                              borderColor: '#FFFFFF',
                              borderTopColor: 'transparent',
                            }}
                          />
                          Linking...
                        </div>
                      ) : (
                        'Link Bank Account'
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowBankList(false)
                      setSelectedBankId(null)
                    }}
                    className="mt-2 w-full rounded-[12px] border px-4 py-2.5 text-[13px] font-semibold transition-all hover:opacity-80"
                    style={{
                      borderColor: themeColors.border,
                      color: themeColors.mid,
                      backgroundColor: 'transparent',
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-8 text-center"
                  style={{ color: themeColors.mid }}
                >
                  <Banknote size={32} strokeWidth={1.5} />
                  <p className="mt-3 text-[14px] font-medium">
                    No bank account linked
                  </p>
                  <p className="mt-1 text-[12px]">
                    Releases go to the bank account linked to this wallet. Add
                    one so approved releases have a destination.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddBank}
                    disabled={isLoadingBanks}
                    className="mt-6 flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: themeColors.trustee,
                      color: '#FFFFFF',
                    }}
                  >
                    {isLoadingBanks ? (
                      <>
                        <div
                          className="h-4 w-4 animate-spin rounded-full border-2"
                          style={{
                            borderColor: '#FFFFFF',
                            borderTopColor: 'transparent',
                          }}
                        />
                        Loading...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={18} />
                        Add Bank Account
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PIN modal for bank linking */}
      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description="Enter your PIN to confirm linking this bank account to your wallet."
        onClose={() => {
          setIsPinModalOpen(false)
          setPendingBankId(null)
        }}
        onVerify={handlePinVerification}
        isLoading={isLinking}
        maxLength={6}
      />
    </AppLayout>
  )
}

/* ─────────── Request history card ─────────── */

function RequestHistoryCard({
  request,
  isDark,
  themeColors,
}: {
  request: ReleaseRequestItem
  isDark: boolean
  themeColors: typeof colors | typeof darkColors
}) {
  const styles = getRequestStatusStyles(request.status, isDark, themeColors)
  const isPending = request.status.toLowerCase() === 'pending'

  return (
    <div
      className="rounded-[12px] border p-3"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p
              className="text-[15px] font-bold"
              style={{
                color: themeColors.charcoal,
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {formatCurrency(request.amount)}
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: styles.bg,
                color: styles.text,
              }}
            >
              {request.status}
            </span>
          </div>

          <p className="mt-1 text-[11px]" style={{ color: themeColors.mid }}>
            <span style={{ fontWeight: 600 }}>To:</span>{' '}
            {request.destination}
          </p>

          <p className="mt-0.5 text-[11px]" style={{ color: themeColors.mid }}>
            Requested {formatUSDateTime(request.requestedAt)}
          </p>

          {isPending && (
            <p
              className="mt-0.5 text-[11px] font-medium"
              style={{ color: '#F59E0B' }}
            >
              {formatTimeLeft(request.expiresAt)}
            </p>
          )}

          {request.decidedAt && (
            <p className="mt-0.5 text-[11px]" style={{ color: themeColors.mid }}>
              Decided {formatUSDateTime(request.decidedAt)}
              {request.decidedByTrusteeName && (
                <>
                  {' '}
                  by <strong>{request.decidedByTrusteeName}</strong>
                </>
              )}
            </p>
          )}

          {request.decisionReason && (
            <p
              className="mt-1 rounded-[8px] px-2 py-1 text-[11px] italic"
              style={{
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(239, 68, 68, 0.04)',
                color: '#EF4444',
              }}
            >
              "{request.decisionReason}"
            </p>
          )}

          {request.userNote && (
            <p
              className="mt-1 text-[11px] italic"
              style={{ color: themeColors.mid }}
            >
              "{request.userNote}"
            </p>
          )}
        </div>

        {request.status.toLowerCase() === 'approved' && (
          <CheckCircle
            size={18}
            style={{ color: themeColors.green, flexShrink: 0 }}
          />
        )}
        {request.status.toLowerCase() === 'rejected' && (
          <XCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
        )}
        {request.status.toLowerCase() === 'expired' && (
          <Clock size={18} style={{ color: '#9CA3AF', flexShrink: 0 }} />
        )}
        {isPending && (
          <Clock size={18} style={{ color: '#F59E0B', flexShrink: 0 }} />
        )}
      </div>
    </div>
  )
}

/* ─────────── Activity row ─────────── */

function ActivityRow({
  activity,
  themeColors,
}: {
  activity: ActivityGroup['activities'][number]
  themeColors: typeof colors | typeof darkColors
}) {
  return (
    <div
      className="flex items-center justify-between rounded-[12px] border p-3"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: activity.isCredit
              ? 'rgba(15, 151, 61, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            color: activity.isCredit ? themeColors.green : '#EF4444',
          }}
        >
          {activity.isCredit ? (
            <ArrowDownRight size={16} strokeWidth={2} />
          ) : (
            <ArrowUpRight size={16} strokeWidth={2} />
          )}
        </div>
        <div>
          <p
            className="text-[14px] font-medium"
            style={{ color: themeColors.charcoal }}
          >
            {activity.title}
          </p>
          <p className="text-[11px]" style={{ color: themeColors.mid }}>
            {activity.subtitle}
          </p>
        </div>
      </div>
      <p
        className="text-[15px] font-bold"
        style={{
          color: activity.isCredit ? themeColors.green : '#EF4444',
          fontFamily:
            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {activity.isCredit ? '+' : '-'}
        {formatCurrency(activity.amount)}
      </p>
    </div>
  )
}