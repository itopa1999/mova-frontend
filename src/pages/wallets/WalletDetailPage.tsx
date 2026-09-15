import {
  ArrowLeft,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Frown,
  CheckCircle,
  AlertCircle,
  Coins,
  AlertTriangle,
  Banknote,
  PlusCircle,
  CalendarDays,
  List,
  Calendar,
  Timer,
  Tag,
  FileText,
  Repeat,
  Unlock,
  Info,
  History,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import {
  getWalletDetails,
  getWalletActivities,
  getWalletSchedule,
  getWalletBankAccount,
  getAvailableBanks,
  linkBankToWallet,
  getWalletPayouts,
} from '../../services/app/wallet'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import PinModal from '../../components/ui/PinModal'
import { verifyPin } from '../../services/app/pin'
import ReleaseCalendar from '../../components/ui/ReleaseCalendar'

interface SchedulePreviewItem {
  scheduledReleaseId: number
  scheduledFor: string
  scheduledForDisplay: string
  amount: number
  status: string
  isReleased: boolean
  isProjected: boolean
  releasedAt: string
  releasedAtDisplay: string
}

interface WalletDetailData {
  walletId: number
  name: string
  description: string
  status: string
  categoryId: number
  categoryName: string
  categoryIcon: string
  targetAmount: number
  lockedAmount: number
  releasedAmount: number
  totalWithdrawnAmount: number
  availableAmount: number
  unusedAmount: number
  progressPercentage: number
  setAmountToBeRemoved: number
  frequency: string
  scheduleDescription: string
  startDate: string
  endDate: string
  releaseSummary: {
    totalReleases: number
    completedReleases: number
    scheduledReleases: number
    failedReleases: number
    projectedReleases: number
    totalReleasedAmount: number
    averageReleaseAmount: number
    remainingAmount: number
    allReleases: number
    remainingReleases: number
  }
  nextReleaseDate: string
  nextReleaseDisplay: string
  lastReleaseDate: string
  lastReleaseDisplay: string
  projectedEndDate: string
  projectedEndDateDisplay: string
  schedulePreview: SchedulePreviewItem[]
  createdAt: string
  updatedAt: string
}

interface ActivityItem {
  id: number
  type: string
  title: string
  subtitle: string
  amount: number
  isCredit: boolean
  date: string
}

interface ActivityGroup {
  date: string
  activities: ActivityItem[]
}

interface ScheduleReleaseRaw {
  scheduledReleaseId?: number
  scheduled_for?: string
  scheduledFor?: string
  amount?: number
  is_released?: boolean
  isReleased?: boolean
  released_at?: string
  releasedAt?: string
  status?: string
  is_projected?: boolean
  isProjected?: boolean
}

interface ScheduleRelease {
  scheduledReleaseId: number
  scheduled_for: string
  amount: number
  is_released: boolean
  released_at: string
  status: string
  is_projected: boolean
}

interface ScheduleData {
  walletId: number
  targetAmount: number
  totalReleasedAmount: number
  remainingLockedAmount: number
  releases: ScheduleRelease[]
}

interface BankAccountData {
  id: number
  accountName: string
  accountNumber: string
  bankName: string
  bankImageUrl: string
}

interface AvailableBank {
  id: number
  accountNumber: string
  accountName: string
  bankName: string
  bankImageUrl: string
}

type TabType = 'overview' | 'activities' | 'schedule' | 'bank'
type ScheduleViewType = 'list' | 'calendar'
type ActivitiesViewType = 'transactions' | 'payouts'

// ─── Tour content per tab ──────────────────────────────
type TourKey = 'overview' | 'activities' | 'schedule' | 'bank'

interface TabTour {
  title: string
  body: string
  icon: typeof Wallet
}

const TAB_TOURS: Record<TourKey, TabTour> = {
  overview: {
    icon: Wallet,
    title: 'Overview',
    body:
      'See everything about this wallet at a glance — target amount, progress, what\u2019s locked, what\u2019s been released, and what\u2019s available. The Release Summary and Timeline show you exactly where this wallet is in its lifecycle.',
  },
  activities: {
    icon: History,
    title: 'Activities',
    body:
      'Two views here: **Transactions** shows every money movement inside the wallet — deposits, releases, and manual transfers. **Payouts** shows only the moments when money left your wallet and landed in your linked bank account.',
  },
  schedule: {
    icon: CalendarDays,
    title: 'Schedule',
    body:
      'See every past, current, and projected release. Switch between **List** view for a scrollable timeline or **Calendar** view to see releases plotted on a month grid — tap a date to see that day\u2019s releases.',
  },
  bank: {
    icon: Banknote,
    title: 'Bank Account',
    body:
      'The bank account where this wallet sends its releases. You can view the linked account here. If no bank is linked yet, add one so future releases have somewhere to land.',
  },
}

const TAB_TOUR_SEEN_KEYS: Record<TourKey, string> = {
  overview: 'mova_wallet_tab_overview_seen',
  activities: 'mova_wallet_tab_activities_seen',
  schedule: 'mova_wallet_tab_schedule_seen',
  bank: 'mova_wallet_tab_bank_seen',
}

const normalizeScheduleRelease = (
  raw: ScheduleReleaseRaw
): ScheduleRelease => ({
  scheduledReleaseId: raw.scheduledReleaseId ?? 0,
  scheduled_for: raw.scheduled_for ?? raw.scheduledFor ?? '',
  amount: raw.amount ?? 0,
  is_released: raw.is_released ?? raw.isReleased ?? false,
  released_at: raw.released_at ?? raw.releasedAt ?? '',
  status: raw.status ?? 'scheduled',
  is_projected: raw.is_projected ?? raw.isProjected ?? false,
})

export default function WalletDetailPage() {
  const navigate = useNavigate()
  const { walletId } = useParams<{ walletId: string }>()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [scheduleView, setScheduleView] = useState<ScheduleViewType>('list')
  const [activitiesView, setActivitiesView] =
    useState<ActivitiesViewType>('transactions')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [wallet, setWallet] = useState<WalletDetailData | null>(null)
  const [activities, setActivities] = useState<ActivityGroup[]>([])
  const [payouts, setPayouts] = useState<ActivityGroup[]>([])
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false)
  const [payoutsLoaded, setPayoutsLoaded] = useState(false)
  const [schedule, setSchedule] = useState<ScheduleData | null>(null)
  const [bankAccount, setBankAccount] = useState<BankAccountData | null>(null)
  const [availableBanks, setAvailableBanks] = useState<AvailableBank[]>([])
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [showBankList, setShowBankList] = useState(false)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pendingBankId, setPendingBankId] = useState<number | null>(null)

  // Tour state
  const tourSheet = useBottomSheet<TourKey>()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [detailsRes, activitiesRes, scheduleRes, bankRes] =
          await Promise.all([
            getWalletDetails(Number(walletId)),
            getWalletActivities(Number(walletId)),
            getWalletSchedule(Number(walletId)),
            getWalletBankAccount(Number(walletId)),
          ])

        if (detailsRes.is_success && detailsRes.data) {
          setWallet(detailsRes.data)
        }

        if (activitiesRes.is_success && activitiesRes.data) {
          setActivities(activitiesRes.data)
        }

        if (scheduleRes.is_success && scheduleRes.data) {
          const rawSchedule = scheduleRes.data as ScheduleData & {
            releases: ScheduleReleaseRaw[]
          }
          const normalized: ScheduleData = {
            walletId: rawSchedule.walletId,
            targetAmount: rawSchedule.targetAmount,
            totalReleasedAmount: rawSchedule.totalReleasedAmount,
            remainingLockedAmount: rawSchedule.remainingLockedAmount,
            releases: (rawSchedule.releases ?? []).map(normalizeScheduleRelease),
          }
          setSchedule(normalized)
        }

        if (bankRes.is_success && bankRes.data) {
          setBankAccount(bankRes.data)
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [walletId])

  // Auto-open the tour for the currently active tab (once per tab)
  useEffect(() => {
    const seenKey = TAB_TOUR_SEEN_KEYS[activeTab]
    const seen = localStorage.getItem(seenKey)

    if (!seen) {
      const t = setTimeout(() => {
        tourSheet.open(activeTab)
        localStorage.setItem(seenKey, '1')
      }, 700)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // Lazy-load payouts
  useEffect(() => {
    if (
      activeTab === 'activities' &&
      activitiesView === 'payouts' &&
      !payoutsLoaded &&
      !isLoadingPayouts
    ) {
      const loadPayouts = async () => {
        setIsLoadingPayouts(true)
        try {
          const res = await getWalletPayouts(Number(walletId))
          if (res.is_success && res.data) {
            setPayouts(res.data)
          }
          setPayoutsLoaded(true)
        } catch (error) {
          console.error('Error fetching payouts:', error)
        } finally {
          setIsLoadingPayouts(false)
        }
      }
      loadPayouts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activitiesView, payoutsLoaded])

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
        navigate(`/bank?walletId=${walletId}`)
      }
    } catch (error) {
      console.error('Error fetching banks:', error)
      navigate(`/bank?walletId=${walletId}`)
    } finally {
      setIsLoadingBanks(false)
    }
  }

  const handleSelectBank = (bankId: number) => {
    setSelectedBankId(bankId)
  }

  const handleLinkBankClick = () => {
    if (selectedBankId === null) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Please select a bank account first',
        },
      })
      window.dispatchEvent(errorEvent)
      return
    }

    setPendingBankId(selectedBankId)
    setIsPinModalOpen(true)
  }

  const handlePinVerification = async (pin: string) => {
    try {
      const pinResponse = await verifyPin({ pin, platform: 'web' })

      if (!pinResponse.is_success) {
        throw new Error(
          pinResponse.message || 'Invalid PIN. Please try again.'
        )
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

        const successEvent = new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: 'Bank account linked successfully!',
          },
        })
        window.dispatchEvent(successEvent)

        setIsPinModalOpen(false)
      } else {
        throw new Error(response.message || 'Failed to link bank account')
      }
    } catch (error) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to link bank account. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)
      throw error
    } finally {
      setIsLinking(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const maskAccountNumber = (accountNumber: string): string => {
    if (!accountNumber) return ''
    const last4 = accountNumber.slice(-4)
    const masked = '•'.repeat(Math.max(accountNumber.length - 4, 0))
    return `${masked}${last4}`
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string): string => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
        return themeColors.green
      case 'completed':
        return '#3B82F6'
      case 'paused':
        return '#F59E0B'
      case 'cancelled':
        return '#EF4444'
      case 'scheduled':
        return '#60A5FA'
      case 'projected':
        return '#9CA3AF'
      case 'failed':
        return '#EF4444'
      case 'released':
        return themeColors.green
      case 'pending':
        return '#F59E0B'
      case 'processing':
        return '#60A5FA'
      case 'successful':
        return themeColors.green
      case 'reversed':
        return '#9CA3AF'
      default:
        return themeColors.mid
    }
  }

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status)
    return (
      <span
        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase"
        style={{
          backgroundColor: color + '20',
          color: color,
        }}
      >
        {status || 'unknown'}
      </span>
    )
  }

  const isTerminalStatus =
    wallet?.status?.toLowerCase() === 'completed' ||
    wallet?.status?.toLowerCase() === 'broken'

  const handleUnusedMoney = () => {
    if (isTerminalStatus) return
    navigate(`/wallet/${walletId}/unused-money`)
  }

  const handleBreakWallet = () => {
    if (!wallet) return
    if (isTerminalStatus) return

    navigate(`/wallet/${walletId}/break-wallet`, {
      state: {
        walletId: wallet.walletId,
        walletName: wallet.name,
        categoryIcon: wallet.categoryIcon,
        lockedAmount: wallet.lockedAmount,
        setAmountToBeRemoved: wallet.setAmountToBeRemoved,
        walletStatus: wallet.status,
      },
    })
  }

  const Icon = wallet ? getIcon(wallet.categoryIcon) : Wallet
  const BankIcon = Banknote

  // Current tour + reusable info button
  const currentTour = TAB_TOURS[activeTab]
  const StepIcon = currentTour.icon

  const TabTourButton = () => (
    <button
      type="button"
      onClick={() => tourSheet.open(activeTab)}
      className="ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
      style={{
        backgroundColor: isDark
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.04)',
        color: themeColors.mid,
      }}
      aria-label="Explain this tab"
    >
      <Info size={12} strokeWidth={2.4} />
    </button>
  )

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4"
            style={{
              borderColor: themeColors.green,
              borderTopColor: 'transparent',
            }}
          />
        </div>
      </AppLayout>
    )
  }

  if (!wallet) {
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
            This wallet may have been deleted or doesn't exist.
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/wallets')}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <Icon size={20} strokeWidth={2} style={{ color: themeColors.green }} />
          <h1
            className="text-[20px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            {wallet.name}
          </h1>
          {getStatusBadge(wallet.status)}
        </div>

        {/* Action Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleUnusedMoney}
            disabled={isTerminalStatus}
            className="flex items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-[13px] font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              color: themeColors.charcoal,
            }}
          >
            <Coins size={18} strokeWidth={2} />
            Unused Money
          </button>
          <button
            type="button"
            onClick={handleBreakWallet}
            disabled={isTerminalStatus}
            className="flex items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-[13px] font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              color: themeColors.warning,
            }}
          >
            <AlertTriangle size={18} strokeWidth={2} />
            Break Wallet
          </button>
        </div>

        {isTerminalStatus && (
          <p
            className="mb-4 -mt-2 text-center text-[11px]"
            style={{ color: themeColors.mid }}
          >
            {wallet.status.toLowerCase() === 'broken'
              ? 'This wallet was broken. Its funds have been returned.'
              : 'This wallet has completed its schedule. All funds have been released.'}
          </p>
        )}

        {/* Summary Card */}
        <div
          className="rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Total Target
              </p>
              <p
                className="mt-0.5 text-[24px] font-bold"
                style={{
                  color: themeColors.charcoal,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(wallet.targetAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Progress
              </p>
              <p
                className="mt-0.5 text-[24px] font-bold"
                style={{
                  color: themeColors.green,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {Math.round(wallet.progressPercentage)}%
              </p>
            </div>
          </div>

          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: themeColors.border }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: themeColors.green,
                width: `${Math.min(wallet.progressPercentage, 100)}%`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <div
              className="rounded-[10px] p-2.5 text-center"
              style={{ backgroundColor: themeColors.background }}
            >
              <p className="text-[10px]" style={{ color: themeColors.mid }}>
                Locked
              </p>
              <p
                className="mt-0.5 text-[13px] font-bold"
                style={{
                  color: themeColors.charcoal,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(wallet.lockedAmount)}
              </p>
            </div>
            <div
              className="rounded-[10px] p-2.5 text-center"
              style={{ backgroundColor: themeColors.background }}
            >
              <p className="text-[10px]" style={{ color: themeColors.mid }}>
                Released
              </p>
              <p
                className="mt-0.5 text-[13px] font-bold"
                style={{
                  color: themeColors.green,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(wallet.releasedAmount)}
              </p>
            </div>
            <div
              className="rounded-[10px] p-2.5 text-center"
              style={{ backgroundColor: themeColors.background }}
            >
              <p className="text-[10px]" style={{ color: themeColors.mid }}>
                Available
              </p>
              <p
                className="mt-0.5 text-[13px] font-bold"
                style={{
                  color: themeColors.charcoal,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(wallet.availableAmount)}
              </p>
            </div>
            <div
              className="rounded-[10px] p-2.5 text-center"
              style={{ backgroundColor: themeColors.background }}
            >
              <p className="text-[10px]" style={{ color: themeColors.mid }}>
                Removal
              </p>
              <p
                className="mt-0.5 text-[13px] font-bold"
                style={{
                  color: '#F59E0B',
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(wallet.setAmountToBeRemoved)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="mt-4 flex border-b"
          style={{ borderColor: themeColors.border }}
        >
          {(['overview', 'activities', 'schedule', 'bank'] as TabType[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="relative flex-1 py-3 text-center text-[13px] font-semibold capitalize transition-all duration-200"
                style={{
                  color:
                    activeTab === tab ? themeColors.green : themeColors.mid,
                  borderBottom:
                    activeTab === tab
                      ? `2px solid ${themeColors.green}`
                      : 'none',
                }}
              >
                <span className="inline-flex items-center justify-center">
                  {tab === 'bank' ? 'Bank' : tab}
                  {activeTab === tab && <TabTourButton />}
                </span>
              </button>
            )
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {wallet.description && (
                <div
                  className="rounded-[12px] border p-3"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <FileText size={12} style={{ color: themeColors.mid }} />
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Description
                    </p>
                  </div>
                  <p
                    className="text-[13px]"
                    style={{ color: themeColors.charcoal }}
                  >
                    {wallet.description}
                  </p>
                </div>
              )}

              {wallet.setAmountToBeRemoved > 0 && (
                <div
                  className="rounded-[12px] border p-3"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'rgba(245, 158, 11, 0.04)',
                    borderColor: isDark
                      ? 'rgba(245, 158, 11, 0.25)'
                      : 'rgba(245, 158, 11, 0.15)',
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <AlertCircle size={12} style={{ color: '#F59E0B' }} />
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: '#F59E0B' }}
                    >
                      Pending Removal
                    </p>
                  </div>
                  <p
                    className="text-[14px] font-bold"
                    style={{
                      color: themeColors.charcoal,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(wallet.setAmountToBeRemoved)}
                  </p>
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    This amount will be removed from your wallet on your next
                    scheduled removal.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-[12px] border p-3"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Tag size={12} style={{ color: themeColors.mid }} />
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Category
                    </p>
                  </div>
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {wallet.categoryName || '—'}
                  </p>
                </div>

                <div
                  className="rounded-[12px] border p-3"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Repeat size={12} style={{ color: themeColors.mid }} />
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Frequency
                    </p>
                  </div>
                  <p
                    className="text-[14px] font-semibold capitalize"
                    style={{ color: themeColors.charcoal }}
                  >
                    {wallet.frequency || '—'}
                  </p>
                </div>
              </div>

              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Schedule
                    </p>
                    <p
                      className="text-[14px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {wallet.scheduleDescription || '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Next Release
                    </p>
                    <p
                      className="text-[14px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {wallet.nextReleaseDisplay ||
                        formatDate(wallet.nextReleaseDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Last Release
                    </p>
                    <p
                      className="text-[14px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {wallet.lastReleaseDisplay ||
                        formatDate(wallet.lastReleaseDate)}
                    </p>
                  </div>
                  <Timer size={20} style={{ color: themeColors.mid }} />
                </div>
              </div>

              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <p
                  className="mb-3 text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Release Summary
                </p>

                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <p
                      className="text-[10px]"
                      style={{ color: themeColors.mid }}
                    >
                      Total
                    </p>
                    <p
                      className="text-[15px] font-bold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {wallet.releaseSummary?.totalReleases ?? 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[10px]"
                      style={{ color: themeColors.mid }}
                    >
                      Done
                    </p>
                    <p
                      className="text-[15px] font-bold"
                      style={{ color: themeColors.green }}
                    >
                      {wallet.releaseSummary?.completedReleases ?? 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[10px]"
                      style={{ color: themeColors.mid }}
                    >
                      Scheduled
                    </p>
                    <p
                      className="text-[15px] font-bold"
                      style={{ color: '#60A5FA' }}
                    >
                      {wallet.releaseSummary?.scheduledReleases ?? 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p
                      className="text-[10px]"
                      style={{ color: themeColors.mid }}
                    >
                      Failed
                    </p>
                    <p
                      className="text-[15px] font-bold"
                      style={{ color: '#EF4444' }}
                    >
                      {wallet.releaseSummary?.failedReleases ?? 0}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-4 space-y-2 border-t pt-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Total Released
                    </span>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.green }}
                    >
                      {formatCurrency(
                        wallet.releaseSummary?.totalReleasedAmount ?? 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Average per Release
                    </span>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(
                        wallet.releaseSummary?.averageReleaseAmount ?? 0
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Remaining Amount
                    </span>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(
                        wallet.releaseSummary?.remainingAmount ?? 0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-[12px] border p-3"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Coins size={12} style={{ color: themeColors.mid }} />
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Unused
                    </p>
                  </div>
                  <p
                    className="text-[16px] font-bold"
                    style={{
                      color: themeColors.charcoal,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(wallet.unusedAmount)}
                  </p>
                </div>

                <div
                  className="rounded-[12px] border p-3"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Unlock size={12} style={{ color: themeColors.mid }} />
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Withdrawn
                    </p>
                  </div>
                  <p
                    className="text-[16px] font-bold"
                    style={{
                      color: themeColors.charcoal,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(wallet.totalWithdrawnAmount)}
                  </p>
                </div>
              </div>

              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <p
                  className="mb-3 text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Timeline
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(15, 185, 110, 0.15)'
                          : 'rgba(15, 185, 110, 0.08)',
                        color: themeColors.green,
                      }}
                    >
                      <Calendar size={12} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        Start Date
                      </p>
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {formatDateTime(wallet.startDate)}
                      </p>
                    </div>
                  </div>

                  {wallet.endDate && (
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(96, 165, 250, 0.15)'
                            : 'rgba(96, 165, 250, 0.08)',
                          color: '#60A5FA',
                        }}
                      >
                        <CheckCircle size={12} />
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-[11px]"
                          style={{ color: themeColors.mid }}
                        >
                          End Date
                        </p>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          {formatDateTime(wallet.endDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(156, 163, 175, 0.15)'
                          : 'rgba(156, 163, 175, 0.08)',
                        color: '#9CA3AF',
                      }}
                    >
                      <Clock size={12} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        Projected End Date
                      </p>
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {wallet.projectedEndDateDisplay ||
                          formatDateTime(wallet.projectedEndDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Created
                    </p>
                    <p
                      className="text-[12px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatDateTime(wallet.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Last Updated
                    </p>
                    <p
                      className="text-[12px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatDateTime(wallet.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <p
                  className="mb-3 text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Upcoming Releases
                </p>
                {wallet.schedulePreview && wallet.schedulePreview.length > 0 ? (
                  <div className="space-y-3">
                    {wallet.schedulePreview.slice(0, 5).map((release) => (
                      <div
                        key={release.scheduledReleaseId}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p
                            className="text-[13px] font-medium"
                            style={{ color: themeColors.charcoal }}
                          >
                            {formatCurrency(release.amount)}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            {release.scheduledForDisplay ||
                              formatDateTime(release.scheduledFor)}
                          </p>
                          {release.isReleased && release.releasedAt && (
                            <p
                              className="mt-0.5 text-[10px]"
                              style={{ color: themeColors.green }}
                            >
                              Released{' '}
                              {release.releasedAtDisplay ||
                                formatDateTime(release.releasedAt)}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(release.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    No upcoming releases
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITIES */}
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
                        ? themeColors.green
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
                        ? themeColors.green
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
                  {activities.length > 0 ? (
                    activities.map((group) => (
                      <div key={group.date}>
                        <p
                          className="mb-2 text-[13px] font-semibold"
                          style={{ color: themeColors.mid }}
                        >
                          {formatDate(group.date)}
                        </p>
                        <div className="space-y-2">
                          {group.activities.map((activity) => (
                            <div
                              key={activity.id}
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
                                    color: activity.isCredit
                                      ? themeColors.green
                                      : '#EF4444',
                                  }}
                                >
                                  {activity.isCredit ? (
                                    <ArrowDownRight
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  ) : (
                                    <ArrowUpRight
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  )}
                                </div>
                                <div>
                                  <p
                                    className="text-[14px] font-medium"
                                    style={{ color: themeColors.charcoal }}
                                  >
                                    {activity.title}
                                  </p>
                                  <p
                                    className="text-[11px]"
                                    style={{ color: themeColors.mid }}
                                  >
                                    {activity.subtitle}
                                  </p>
                                </div>
                              </div>
                              <p
                                className="text-[15px] font-bold"
                                style={{
                                  color: activity.isCredit
                                    ? themeColors.green
                                    : '#EF4444',
                                  fontFamily:
                                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                                }}
                              >
                                {activity.isCredit ? '+' : '-'}
                                {formatCurrency(activity.amount)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-12 text-center"
                      style={{ color: themeColors.mid }}
                    >
                      <Wallet size={32} strokeWidth={1.5} />
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
                    <div className="flex flex-col items-center justify-center py-12">
                      <div
                        className="h-8 w-8 animate-spin rounded-full border-4"
                        style={{
                          borderColor: themeColors.green,
                          borderTopColor: 'transparent',
                        }}
                      />
                      <p
                        className="mt-3 text-[13px]"
                        style={{ color: themeColors.mid }}
                      >
                        Loading payouts...
                      </p>
                    </div>
                  ) : payouts.length > 0 ? (
                    payouts.map((group) => (
                      <div key={group.date}>
                        <p
                          className="mb-2 text-[13px] font-semibold"
                          style={{ color: themeColors.mid }}
                        >
                          {formatDate(group.date)}
                        </p>
                        <div className="space-y-2">
                          {group.activities.map((activity) => (
                            <div
                              key={activity.id}
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
                                    color: activity.isCredit
                                      ? themeColors.green
                                      : '#EF4444',
                                  }}
                                >
                                  {activity.isCredit ? (
                                    <ArrowDownRight
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  ) : (
                                    <ArrowUpRight
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p
                                      className="text-[14px] font-medium"
                                      style={{ color: themeColors.charcoal }}
                                    >
                                      {activity.title}
                                    </p>
                                    {activity.type && (
                                      <span
                                        className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                                        style={{
                                          backgroundColor:
                                            getStatusColor(activity.type) +
                                            '20',
                                          color: getStatusColor(activity.type),
                                        }}
                                      >
                                        {activity.type}
                                      </span>
                                    )}
                                  </div>
                                  <p
                                    className="text-[11px]"
                                    style={{ color: themeColors.mid }}
                                  >
                                    {activity.subtitle}
                                  </p>
                                </div>
                              </div>
                              <p
                                className="text-[15px] font-bold"
                                style={{
                                  color: activity.isCredit
                                    ? themeColors.green
                                    : '#EF4444',
                                  fontFamily:
                                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                                }}
                              >
                                {activity.isCredit ? '+' : '-'}
                                {formatCurrency(activity.amount)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
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
                        Payouts will appear here once your releases are sent to
                        your bank
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* SCHEDULE */}
          {activeTab === 'schedule' && schedule && (
            <div className="space-y-3">
              <div
                className="grid grid-cols-3 gap-3 rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: themeColors.mid }}>
                    Target
                  </p>
                  <p
                    className="text-[15px] font-bold"
                    style={{
                      color: themeColors.charcoal,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(schedule.targetAmount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: themeColors.mid }}>
                    Released
                  </p>
                  <p
                    className="text-[15px] font-bold"
                    style={{
                      color: themeColors.green,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(schedule.totalReleasedAmount)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: themeColors.mid }}>
                    Remaining
                  </p>
                  <p
                    className="text-[15px] font-bold"
                    style={{
                      color: themeColors.charcoal,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(schedule.remainingLockedAmount)}
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-2 rounded-[12px] border p-1"
                style={{ borderColor: themeColors.border }}
              >
                <button
                  type="button"
                  onClick={() => setScheduleView('list')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-1.5 text-[13px] font-medium transition-all"
                  style={{
                    backgroundColor:
                      scheduleView === 'list'
                        ? themeColors.green
                        : 'transparent',
                    color:
                      scheduleView === 'list' ? '#FFFFFF' : themeColors.mid,
                  }}
                >
                  <List size={16} />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleView('calendar')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-1.5 text-[13px] font-medium transition-all"
                  style={{
                    backgroundColor:
                      scheduleView === 'calendar'
                        ? themeColors.green
                        : 'transparent',
                    color:
                      scheduleView === 'calendar'
                        ? '#FFFFFF'
                        : themeColors.mid,
                  }}
                >
                  <CalendarDays size={16} />
                  Calendar
                </button>
              </div>

              {scheduleView === 'list' ? (
                <div className="space-y-2">
                  {schedule.releases.length > 0 ? (
                    schedule.releases.map((release) => (
                      <div
                        key={release.scheduledReleaseId}
                        className="flex items-center justify-between rounded-[12px] border p-3"
                        style={{
                          backgroundColor: themeColors.card,
                          borderColor: themeColors.border,
                          opacity: release.is_projected ? 0.6 : 1,
                        }}
                      >
                        <div>
                          <p
                            className="text-[14px] font-medium"
                            style={{ color: themeColors.charcoal }}
                          >
                            {formatCurrency(release.amount)}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            {formatDate(release.scheduled_for)} at{' '}
                            {formatTime(release.scheduled_for)}
                          </p>
                          {release.is_released && release.released_at && (
                            <p
                              className="mt-0.5 text-[10px]"
                              style={{ color: themeColors.green }}
                            >
                              Released {formatDateTime(release.released_at)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {release.is_released ? (
                            <CheckCircle
                              size={16}
                              style={{ color: themeColors.green }}
                            />
                          ) : release.is_projected ? (
                            <AlertCircle
                              size={16}
                              style={{ color: themeColors.mid }}
                            />
                          ) : (
                            <Clock size={16} style={{ color: '#60A5FA' }} />
                          )}
                          {getStatusBadge(release.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-12 text-center"
                      style={{ color: themeColors.mid }}
                    >
                      <CalendarDays size={32} strokeWidth={1.5} />
                      <p className="mt-3 text-[14px] font-medium">
                        No releases scheduled
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  <ReleaseCalendar
                    releases={schedule.releases}
                    onDateSelect={(date) => {
                      setSelectedDate(date)
                    }}
                    selectedDate={selectedDate}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && !schedule && (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              style={{ color: themeColors.mid }}
            >
              <CalendarDays size={32} strokeWidth={1.5} />
              <p className="mt-3 text-[14px] font-medium">
                No schedule data available
              </p>
            </div>
          )}

          {/* BANK */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              {bankAccount ? (
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
                            backgroundColor: isDark
                              ? 'rgba(15, 185, 110, 0.2)'
                              : 'rgba(15, 185, 110, 0.1)',
                            color: themeColors.green,
                          }}
                        >
                          <BankIcon size={22} strokeWidth={2} />
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
                          Bank Name
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
                          Account Number
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
                          Account Name
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
                              ? themeColors.greenLight
                              : themeColors.card,
                          borderColor:
                            selectedBankId === bank.id
                              ? themeColors.green
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
                                backgroundColor: isDark
                                  ? 'rgba(15, 185, 110, 0.2)'
                                  : 'rgba(15, 185, 110, 0.1)',
                                color: themeColors.green,
                              }}
                            >
                              <BankIcon size={18} strokeWidth={2} />
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
                            style={{ color: themeColors.green }}
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
                        backgroundColor: themeColors.green,
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
                    This wallet does not have a linked bank account
                  </p>
                  <button
                    type="button"
                    onClick={handleAddBank}
                    disabled={isLoadingBanks}
                    className="mt-6 flex items-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      backgroundColor: themeColors.green,
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

      {/* PIN Modal */}
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

      {/* ───────── Tab Tour BottomSheet ───────── */}
      <BottomSheet
        isOpen={tourSheet.activeSheet !== null}
        onClose={tourSheet.close}
        title={currentTour.title}
        icon={<StepIcon size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={tourSheet.close}
            className="w-full cursor-pointer rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Got it
          </button>
        }
      >
        <div style={{ color: themeColors.mid }}>
          <div className="mb-3 flex items-center justify-center">
            <div
              className="rounded-full px-3 py-1 text-[11px] font-semibold capitalize"
              style={{
                backgroundColor: isDark
                  ? 'rgba(15, 185, 110, 0.15)'
                  : 'rgba(15, 185, 110, 0.08)',
                color: themeColors.green,
              }}
            >
              {activeTab === 'bank' ? 'Bank' : activeTab} tab
            </div>
          </div>

          <p className="text-[13px] leading-[1.65]">{currentTour.body}</p>
        </div>
      </BottomSheet>
    </AppLayout>
  )
}