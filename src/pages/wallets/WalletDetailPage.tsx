import {
  ArrowLeft,
  Wallet,
  Calendar,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Coins,
  AlertTriangle,
  Banknote,
  PlusCircle,
  Check,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { 
  getWalletDetails, 
  getWalletActivities, 
  getWalletSchedule, 
  getWalletBankAccount, 
  getAvailableBanks,
  linkBankToWallet 
} from '../../services/app/wallet'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'

// Types
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
  schedulePreview: Array<{
    scheduledReleaseId: number
    scheduledFor: string
    scheduledForDisplay: string
    amount: number
    status: string
    isReleased: boolean
    isProjected: boolean
    releasedAt: string
    releasedAtDisplay: string
  }>
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

export default function WalletDetailPage() {
  const navigate = useNavigate()
  const { walletId } = useParams<{ walletId: string }>()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [wallet, setWallet] = useState<WalletDetailData | null>(null)
  const [activities, setActivities] = useState<ActivityGroup[]>([])
  const [schedule, setSchedule] = useState<ScheduleData | null>(null)
  const [bankAccount, setBankAccount] = useState<BankAccountData | null>(null)
  const [availableBanks, setAvailableBanks] = useState<AvailableBank[]>([])
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [isLinking, setIsLinking] = useState(false)
  const [showBankList, setShowBankList] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [detailsRes, activitiesRes, scheduleRes, bankRes] = await Promise.all([
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
          setSchedule(scheduleRes.data)
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
    console.log('Selected bank ID:', bankId)
    setSelectedBankId(bankId)
  }

  const handleLinkBank = async () => {
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

  setIsLinking(true)

  try {
    // Make sure we're passing the correct ID
    const bankId = selectedBankId
    console.log('Linking bank with ID:', bankId)
    
    const response = await linkBankToWallet(Number(walletId), bankId)
    
    if (response.is_success && response.data) {
      setBankAccount(response.data)
      setShowBankList(false)
      setAvailableBanks([])
      setSelectedBankId(null)

      const successEvent = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Bank account linked successfully!',
        },
      })
      window.dispatchEvent(successEvent)
    } else {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: response.message || 'Failed to link bank account',
        },
      })
      window.dispatchEvent(errorEvent)
    }
  } catch (error) {
    console.error('Error linking bank:', error)
    const errorEvent = new CustomEvent('showToast', {
      detail: {
        type: 'error',
        message: 'Failed to link bank account. Please try again.',
      },
    })
    window.dispatchEvent(errorEvent)
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
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
        {status}
      </span>
    )
  }

  const handleUnusedMoney = () => {
    navigate(`/wallet/${walletId}/unused-money`)
  }

  const handleBreakWallet = () => {
    navigate(`/wallet/${walletId}/break-wallet`)
  }

  const Icon = wallet ? getIcon(wallet.categoryIcon) : Wallet
  const BankIcon = Banknote

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
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <p style={{ color: themeColors.mid }}>Wallet not found</p>
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
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <Icon size={20} strokeWidth={2} style={{ color: themeColors.green }} />
          <h1 className="text-[20px] font-bold" style={{ color: themeColors.charcoal }}>
            {wallet.name}
          </h1>
          {getStatusBadge(wallet.status)}
        </div>

        {/* Action Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleUnusedMoney}
            className="flex items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-[13px] font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
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
            className="flex items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-[13px] font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
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
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
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
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {Math.round(wallet.progressPercentage)}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="mt-3 h-1.5 w-full rounded-full overflow-hidden"
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

          {/* Stats Grid */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div
              className="rounded-[10px] p-2.5 text-center"
              style={{ backgroundColor: themeColors.background }}
            >
              <p className="text-[10px]" style={{ color: themeColors.mid }}>
                Locked
              </p>
              <p
                className="mt-0.5 text-[14px] font-bold"
                style={{
                  color: themeColors.charcoal,
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
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
                className="mt-0.5 text-[14px] font-bold"
                style={{
                  color: themeColors.green,
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
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
                className="mt-0.5 text-[14px] font-bold"
                style={{
                  color: themeColors.charcoal,
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(wallet.availableAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex border-b" style={{ borderColor: themeColors.border }}>
          {(['overview', 'activities', 'schedule', 'bank'] as TabType[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 text-center text-[13px] font-semibold capitalize transition-all duration-200"
              style={{
                color: activeTab === tab ? themeColors.green : themeColors.mid,
                borderBottom: activeTab === tab ? `2px solid ${themeColors.green}` : 'none',
              }}
            >
              {tab === 'bank' ? 'Bank' : tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Description */}
              {wallet.description && (
                <div
                  className="rounded-[12px] border p-3"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <p className="text-[13px]" style={{ color: themeColors.mid }}>
                    {wallet.description}
                  </p>
                </div>
              )}

              {/* Schedule Info */}
              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px]" style={{ color: themeColors.mid }}>
                      Schedule
                    </p>
                    <p className="text-[14px] font-semibold" style={{ color: themeColors.charcoal }}>
                      {wallet.scheduleDescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px]" style={{ color: themeColors.mid }}>
                      Next Release
                    </p>
                    <p className="text-[14px] font-semibold" style={{ color: themeColors.charcoal }}>
                      {wallet.nextReleaseDisplay}
                    </p>
                  </div>
                </div>
              </div>

              {/* Release Summary */}
              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <p className="mb-2 text-[13px] font-semibold" style={{ color: themeColors.charcoal }}>
                  Release Summary
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px]" style={{ color: themeColors.mid }}>
                      Total
                    </p>
                    <p className="text-[15px] font-bold" style={{ color: themeColors.charcoal }}>
                      {wallet.releaseSummary.totalReleases}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px]" style={{ color: themeColors.mid }}>
                      Completed
                    </p>
                    <p className="text-[15px] font-bold" style={{ color: themeColors.green }}>
                      {wallet.releaseSummary.completedReleases}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px]" style={{ color: themeColors.mid }}>
                      Remaining
                    </p>
                    <p className="text-[15px] font-bold" style={{ color: themeColors.charcoal }}>
                      {wallet.releaseSummary.remainingReleases}
                    </p>
                  </div>
                </div>
              </div>

              {/* Projected End Date */}
              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px]" style={{ color: themeColors.mid }}>
                      Projected End Date
                    </p>
                    <p className="text-[14px] font-semibold" style={{ color: themeColors.charcoal }}>
                      {wallet.projectedEndDateDisplay}
                    </p>
                  </div>
                  <Clock size={20} style={{ color: themeColors.mid }} />
                </div>
              </div>

              {/* Schedule Preview */}
              <div
                className="rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <p className="mb-2 text-[13px] font-semibold" style={{ color: themeColors.charcoal }}>
                  Upcoming Releases
                </p>
                <div className="space-y-2">
                  {wallet.schedulePreview.slice(0, 3).map((release) => (
                    <div
                      key={release.scheduledReleaseId}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: themeColors.charcoal }}>
                          {formatCurrency(release.amount)}
                        </p>
                        <p className="text-[11px]" style={{ color: themeColors.mid }}>
                          {release.scheduledForDisplay}
                        </p>
                      </div>
                      {getStatusBadge(release.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((group) => (
                  <div key={group.date}>
                    <p className="mb-2 text-[13px] font-semibold" style={{ color: themeColors.mid }}>
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
                              <p className="text-[14px] font-medium" style={{ color: themeColors.charcoal }}>
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
                              fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            }}
                          >
                            {activity.isCredit ? '+' : '-'}{formatCurrency(activity.amount)}
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
                  <p className="mt-3 text-[14px] font-medium">No activities yet</p>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && schedule && (
            <div className="space-y-3">
              {/* Schedule Summary */}
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
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
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
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
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
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(schedule.remainingLockedAmount)}
                  </p>
                </div>
              </div>

              {/* Release List */}
              <div className="space-y-2">
                {schedule.releases.map((release) => (
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
                      <p className="text-[14px] font-medium" style={{ color: themeColors.charcoal }}>
                        {formatCurrency(release.amount)}
                      </p>
                      <p className="text-[11px]" style={{ color: themeColors.mid }}>
                        {formatDate(release.scheduled_for)} at {formatTime(release.scheduled_for)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {release.is_released ? (
                        <CheckCircle size={16} style={{ color: themeColors.green }} />
                      ) : release.is_projected ? (
                        <AlertCircle size={16} style={{ color: themeColors.mid }} />
                      ) : (
                        <Clock size={16} style={{ color: '#60A5FA' }} />
                      )}
                      {getStatusBadge(release.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              {bankAccount ? (
                <>
                  {/* Existing Bank Account */}
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
                            backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
                            color: themeColors.green,
                          }}
                        >
                          <BankIcon size={22} strokeWidth={2} />
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: themeColors.charcoal }}>
                          {bankAccount.accountName}
                        </p>
                        <p className="text-[11px]" style={{ color: themeColors.mid }}>
                          {bankAccount.accountNumber} · {bankAccount.bankName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div
                    className="rounded-[12px] border p-4"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px]" style={{ color: themeColors.mid }}>
                          Bank Name
                        </p>
                        <p className="text-[14px] font-semibold" style={{ color: themeColors.charcoal }}>
                          {bankAccount.bankName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px]" style={{ color: themeColors.mid }}>
                          Account Number
                        </p>
                        <p className="text-[14px] font-semibold" style={{ color: themeColors.charcoal }}>
                          {bankAccount.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px]" style={{ color: themeColors.mid }}>
                          Account Name
                        </p>
                        <p className="text-[14px] font-semibold" style={{ color: themeColors.charcoal }}>
                          {bankAccount.accountName}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : showBankList && availableBanks.length > 0 ? (
                <>
                  <p className="text-[13px] font-semibold" style={{ color: themeColors.charcoal }}>
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
                          backgroundColor: selectedBankId === bank.id ? themeColors.greenLight : themeColors.card,
                          borderColor: selectedBankId === bank.id ? themeColors.green : themeColors.border,
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
                                backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
                                color: themeColors.green,
                              }}
                            >
                              <BankIcon size={18} strokeWidth={2} />
                            </div>
                          )}
                          <div className="text-left">
                            <p className="text-[14px] font-semibold" style={{ color: themeColors.charcoal }}>
                              {bank.accountName}
                            </p>
                            <p className="text-[12px]" style={{ color: themeColors.mid }}>
                              {bank.bankName} · {bank.accountNumber}
                            </p>
                          </div>
                        </div>
                        {selectedBankId === bank.id && (
                          <CheckCircle size={20} style={{ color: themeColors.green }} />
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedBankId !== null && (
                    <button
                      type="button"
                      onClick={handleLinkBank}
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
                  <p className="mt-3 text-[14px] font-medium">No bank account linked</p>
                  <p className="mt-1 text-[12px]">This wallet does not have a linked bank account</p>
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
    </AppLayout>
  )
}