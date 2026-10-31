import {
  Frown,
  Clock,
  PlusCircle,
  Plus,
  Sparkles,
  Target,
  Calendar,
  Shield,
  Zap,
  User,
  Calculator,
  BarChart3,
  Banknote,
  Lock,
  Hand,
  Info,
  Wallet,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Wand2,
  Receipt,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
} from 'lucide-react'

import { type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'

import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'

import { getDashboard } from '../../services/app/dashboard'
import type {
  DashboardData,
  AccountStatus,
  WalletItem,
} from '../../services/app/dashboard'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { useCountUp } from '../../hooks/useCountUp'
import {
  formatCompactCurrency,
  formatCurrency,
} from '../../utils/formatting'

type ThemeColors = typeof colors | typeof darkColors

/* ───────────── Types ───────────── */

interface CarouselItem {
  id: number
  icon: LucideIcon
  title: string
  description: string
  color: string
}

interface StarterTemplate {
  name: string
  description: string
  tag: string
  accent: string
  icon: LucideIcon
  walletType: 'scheduled' | 'trustee' | 'circle'
}

interface TourStep {
  icon: LucideIcon
  iconColor: string
  title: string
  body: string
}

interface BadgeSpec {
  label: string
  color: string
  icon: LucideIcon
}

/* ───────────── Theme-aware builders ───────────── */

const buildCarouselItems = (c: ThemeColors): CarouselItem[] => [
  {
    id: 1,
    icon: Target,
    title: 'Keep money for later separate',
    description: 'Move money into wallets so it is not all available at once.',
    color: c.green,
  },
  {
    id: 2,
    icon: Calendar,
    title: 'Choose when money is released',
    description: 'Set the amount and release schedule that works for you.',
    color: c.green,
  },
  {
    id: 3,
    icon: Shield,
    title: 'Or let a trustee approve each release',
    description:
      'Trustee wallets need approval from someone you trust before any money moves.',
    color: c.trustee,
  },
  {
    id: 4,
    icon: Sparkles,
    title: 'Avoid spending it all at once',
    description: 'Make money available over time instead of all at once.',
    color: c.warning,
  },
  {
    id: 5,
    icon: Zap,
    title: 'Start with a wallet',
    description: 'Choose an amount and decide when it becomes available.',
    color: c.green,
  },
  {
    id: 6,
    icon: Users,
    title: 'Or save together in a circle',
    description:
      'Pool money with people you trust — each round, one member takes the pot.',
    color: c.circle,
  },
]

const buildStarterTemplates = (c: ThemeColors): StarterTemplate[] => [
  {
    name: 'Transport Allowance',
    description: 'Daily transport money, released every weekday.',
    tag: 'Daily',
    accent: c.green,
    icon: Wand2,
    walletType: 'scheduled',
  },
  {
    name: 'Family Fund',
    description: 'Shared money needing trustee approval before release.',
    tag: 'Trustee',
    accent: c.trustee,
    icon: Shield,
    walletType: 'trustee',
  },
  {
    name: 'Weekly Ajo Circle',
    description:
      'Rotate savings with friends — one member takes the pot each round.',
    tag: 'Circle',
    accent: c.circle,
    icon: Users,
    walletType: 'circle',
  },
]

const buildTourSteps = (c: ThemeColors): TourStep[] => [
  {
    icon: Hand,
    iconColor: c.green,
    title: 'Welcome to MOVA',
    body:
      "When money is available all at once, it can be easy to spend more than you planned. MOVA helps you set money aside and choose when it is released. Here's a quick tour.",
  },
  {
    icon: Wallet,
    iconColor: c.green,
    title: 'Your Balance',
    body:
      'The green card shows your total balance, including money available in your main balance and money held in wallets until it is released.',
  },
  {
    icon: Clock,
    iconColor: c.trustee,
    title: "Today's Releases",
    body:
      'See money released from your wallets here. Releases go to the destination set for the wallet.',
  },
  {
    icon: Target,
    iconColor: c.warning,
    title: 'Your Wallets',
    body:
      'Scheduled wallets release money on a schedule you set. Trustee wallets need approval from someone you trust before any money moves. Circle wallets are shared group savings — one member takes the pot each round.',
  },
  {
    icon: Banknote,
    iconColor: c.circle,
    title: 'Quick Access',
    body:
      'From here you can add funds, manage trustees and bank accounts, view your wallet activity, and check upcoming releases.',
  },
]

/* ───────────── Status badge resolvers ───────────── */

const getWalletStatusBadge = (
  status: string,
  c: ThemeColors
): BadgeSpec | null => {
  switch ((status ?? '').toLowerCase()) {
    case 'active':
      return null
    case 'paused':
      return { label: 'Paused', color: c.warning, icon: Pause }
    case 'completed':
      return { label: 'Done', color: c.trustee, icon: CheckCircle }
    case 'closed':
      return { label: 'Closed', color: c.light, icon: XCircle }
    case 'broken':
      return { label: 'Broken', color: c.red, icon: XCircle }
    default:
      return null
  }
}

const getCircleStatusBadge = (
  status: string,
  c: ThemeColors
): BadgeSpec | null => {
  switch ((status ?? '').toLowerCase()) {
    case 'draft':
      return { label: 'Draft', color: c.warning, icon: Pause }
    case 'active':
      return null
    case 'completed':
      return { label: 'Done', color: c.trustee, icon: CheckCircle }
    case 'cancelled':
      return { label: 'Cancelled', color: c.light, icon: XCircle }
    default:
      return null
  }
}

const getAutomationBadge = (
  hasAutomation: boolean,
  automationStatus: string | null,
  c: ThemeColors
): BadgeSpec | null => {
  if (!hasAutomation) return null
  const s = (automationStatus ?? '').toLowerCase()
  if (s === 'active') {
    return { label: 'Auto', color: c.green, icon: Zap }
  }
  if (s === 'paused') {
    return { label: 'Auto off', color: c.warning, icon: Pause }
  }
  return null
}

const isCircleType = (type: string): boolean =>
  (type ?? '').toLowerCase() === 'circle'

const isTrusteeType = (type: string): boolean =>
  (type ?? '').toLowerCase() === 'trustee'

/* ───────────── Tour / storage constants ───────────── */

type TourKey = 'welcome'

const TOUR_SEEN_KEY = 'mova_dashboard_tour_seen'
const BALANCE_HIDDEN_KEY = 'mova_balance_hidden'
const LOW_BALANCE_SHOWN_KEY = 'mova_low_balance_shown'
const LOW_BALANCE_THRESHOLD = 5000

/* ───────────── Account status banner ───────────── */

interface AccountStatusBannerProps {
  status: AccountStatus
  isDark: boolean
  themeColors: ThemeColors
}

function AccountStatusBanner({
  status,
  isDark,
  themeColors,
}: AccountStatusBannerProps) {
  if (status.isHealthy) return null

  const isCritical =
    status.status === 'Suspended' ||
    status.status === 'Closed' ||
    status.status === 'Deactivated'

  const accent = isCritical ? themeColors.red : themeColors.warning

  const subtitle = status.statusLabel
    ? `${status.statusLabel} account`
    : 'Account notice'

  return (
    <div
      className="mb-5 rounded-[14px] px-4 py-3"
      style={{
        backgroundColor: isDark ? `${accent}1F` : `${accent}14`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: isDark ? `${accent}33` : `${accent}22`,
            color: accent,
          }}
        >
          <AlertTriangle size={14} strokeWidth={2.5} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold" style={{ color: accent }}>
            {subtitle}
          </p>

          <p
            className="mt-1 text-[12px] leading-[1.55]"
            style={{ color: themeColors.charcoal }}
          >
            {status.statusDescription}
          </p>

          {status.restrictionReasonDetails && (
            <p
              className="mt-1.5 text-[11px] leading-[1.55]"
              style={{ color: themeColors.mid }}
            >
              {status.restrictionReasonDetails}
            </p>
          )}

          {status.restrictionExpiresAt && (
            <p
              className="mt-2 text-[11px] font-medium"
              style={{ color: themeColors.mid }}
            >
              Ends{' '}
              {new Date(status.restrictionExpiresAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────────── Dashboard ───────────── */

export default function Dashboard() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const themeColors = isDark ? darkColors : colors

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const tourSheet = useBottomSheet<TourKey>()
  const [tourStep, setTourStep] = useState(0)

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null)

  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(() => {
    return localStorage.getItem(BALANCE_HIDDEN_KEY) === '1'
  })

  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false)

  const getIcon = useCategoryIcon()

  // Theme-aware collections
  const carouselItems = useMemo(
    () => buildCarouselItems(themeColors),
    [themeColors]
  )
  const starterTemplates = useMemo(
    () => buildStarterTemplates(themeColors),
    [themeColors]
  )
  const TOUR_STEPS = useMemo(
    () => buildTourSteps(themeColors),
    [themeColors]
  )

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true)
      try {
        const response = await getDashboard()
        if (response.is_success && response.data) {
          setDashboardData(response.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  useEffect(() => {
    if (!dashboardData) return

    const balance = dashboardData.balance.userBalance
    const alreadyShown = sessionStorage.getItem(LOW_BALANCE_SHOWN_KEY)

    if (balance < LOW_BALANCE_THRESHOLD && !alreadyShown) {
      setShowLowBalanceModal(true)
      sessionStorage.setItem(LOW_BALANCE_SHOWN_KEY, '1')
    }
  }, [dashboardData])

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_SEEN_KEY)
    if (!seen && !isLoading && dashboardData) {
      const t = setTimeout(() => {
        setTourStep(0)
        tourSheet.open('welcome')
        localStorage.setItem(TOUR_SEEN_KEY, '1')
      }, 800)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, dashboardData])

  useEffect(() => {
    if (isPaused || !dashboardData) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused, dashboardData, carouselItems.length])

  const handleDotClick = (index: number) => {
    setCurrentSlide(index)
  }

  const handleCreateWalletFromCarousel = () => {
    navigate('/dashboard/create-wallet')
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    } else if (touchEndX - touchStartX > 50) {
      setCurrentSlide(
        (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
      )
    }
  }

  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragEndX, setDragEndX] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setDragEndX(e.clientX)
  }

  const handleMouseUp = () => {
    if (isDragging) {
      if (dragStartX - dragEndX > 50) {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
      } else if (dragEndX - dragStartX > 50) {
        setCurrentSlide(
          (prev) => (prev - 1 + carouselItems.length) % carouselItems.length
        )
      }
      setIsDragging(false)
      setDragStartX(0)
      setDragEndX(0)
    }
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      setDragStartX(0)
      setDragEndX(0)
    }
  }

  const getGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    if (hour >= 17 && hour < 21) return 'Good evening'
    return 'Good night'
  }

  const greeting = getGreeting()

  const handleSeeAll = (): void => {
    navigate('/dashboard/releases')
  }

  const handleViewAll = (): void => {
    navigate('/dashboard/wallets')
  }

  const handleCreateWallet = (): void => {
    navigate('/dashboard/create-wallet')
  }

  const handleWalletClick = (wallet: WalletItem) => {
    const type = wallet.type as string
    if (isTrusteeType(type)) {
      navigate(`/dashboard/trustee/wallet/${wallet.id}`)
    } else if (isCircleType(type)) {
      navigate(`/dashboard/circles/details/${wallet.id}`)
    } else {
      navigate(`/dashboard/scheduled/wallet/${wallet.id}`)
    }
  }

  const handleAddFunds = (): void => {
    navigate('/dashboard/add-funds')
  }

  const handleWithdraw = (): void => {
    navigate('/dashboard/withdraw')
  }

  const handleControlled = (): void => {
    navigate('/dashboard/wallets')
  }

  const handleBrowseTemplates = (): void => {
    navigate('/dashboard/templates')
  }

  const handleTemplateClick = (
    type: 'scheduled' | 'trustee' | 'circle'
  ): void => {
    navigate('/dashboard/templates', {
      state: { walletType: type },
    })
  }

  const handleTransactions = (): void => {
    navigate('/dashboard/transactions')
  }

  const handleServices = (): void => {
    navigate('/dashboard/services')
  }

  const handleTrustees = (): void => {
    navigate('/dashboard/trustees')
  }

  const handleToggleBalance = () => {
    setIsBalanceHidden((prev) => {
      const next = !prev
      if (next) {
        localStorage.setItem(BALANCE_HIDDEN_KEY, '1')
      } else {
        localStorage.removeItem(BALANCE_HIDDEN_KEY)
      }
      return next
    })
  }

  const handleCloseLowBalance = () => {
    setShowLowBalanceModal(false)
  }

  const handleAddFundsFromModal = () => {
    setShowLowBalanceModal(false)
    navigate('/dashboard/add-funds')
  }

  const handleViewAllCircles = (): void => {
    navigate('/dashboard/wallets')
  }

  const handleCreateCircle = (): void => {
    navigate('/dashboard/create-wallet/circle')
  }

  // Quick access — theme-aware, in-component (has handler access)
  const quickAccessItems = [
    {
      icon: User,
      label: 'Profile',
      onClick: () => navigate('/dashboard/profile'),
      color: themeColors.green,
    },
    {
      icon: Banknote,
      label: 'Bank Accounts',
      onClick: () => navigate('/dashboard/bank'),
      color: themeColors.trustee,
    },
    {
      icon: Shield,
      label: 'Trustees',
      onClick: handleTrustees,
      color: themeColors.trustee,
    },
    {
      icon: Wand2,
      label: 'Templates',
      onClick: handleBrowseTemplates,
      color: themeColors.circle,
    },
    {
      icon: Calculator,
      label: 'Calculate Release',
      onClick: () => navigate('/dashboard/calculate-release'),
      color: themeColors.warning,
    },
    {
      icon: BarChart3,
      label: 'View Analytics',
      onClick: () => navigate('/dashboard/analytics'),
      color: themeColors.trustee,
    },
    {
      icon: Receipt,
      label: 'Transactions',
      onClick: handleTransactions,
      color: themeColors.green,
    },
    {
      icon: Plus,
      label: 'Add Funds',
      onClick: () => navigate('/dashboard/add-funds'),
      color: themeColors.red,
    },
  ]

  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
  const fullName = userData.fullName || 'Lucky'

  const animatedBalance = useCountUp(
    dashboardData?.balance.userBalance ?? 0,
    1400
  )

  const openTour = () => {
    setTourStep(0)
    tourSheet.open('welcome')
  }

  const nextTourStep = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep((s) => s + 1)
    } else {
      tourSheet.close()
    }
  }

  const skipTour = () => {
    tourSheet.close()
  }

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

  if (!dashboardData) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center py-5 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? `${themeColors.green}26`
                : `${themeColors.green}14`,
              color: themeColors.mid,
            }}
          >
            <Frown size={32} strokeWidth={1.5} />
          </div>
          <p
            className="mt-4 text-[15px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            No dashboard data
          </p>
          <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
            We couldn't load your dashboard. Please try again later.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Try again
          </button>
        </div>
      </AppLayout>
    )
  }

  const { balance, todayReleased, wallets, lockedAmountHistory } =
    dashboardData

  const allWallets = wallets ?? []

  const circleWallets = allWallets.filter((w) =>
    isCircleType(w.type as string)
  )
  const trusteeWallets = allWallets.filter((w) =>
    isTrusteeType(w.type as string)
  )
  const scheduledWallets = allWallets.filter(
    (w) => !isCircleType(w.type as string) && !isTrusteeType(w.type as string)
  )

  const chartPoints = lockedAmountHistory ?? []
  const maxChartValue = chartPoints.reduce(
    (max, p) => (p.value > max ? p.value : max),
    0
  )
  const activeBar =
    activeBarIndex !== null && chartPoints[activeBarIndex]
      ? chartPoints[activeBarIndex]
      : null

  const currentStep = TOUR_STEPS[tourStep]
  const StepIcon = currentStep.icon
  const isLastStep = tourStep === TOUR_STEPS.length - 1

  // ─── Type-aware standard wallet card ───
  const renderStandardWallet = (wallet: WalletItem, index: number) => {
    const walletType = (wallet.type ?? '').toLowerCase()
    const isTrustee = walletType === 'trustee'
    const accent = isTrustee ? themeColors.trustee : themeColors.green

    const Icon = getIcon(wallet.categoryIcon)
    const statusBadge = getWalletStatusBadge(wallet.status, themeColors)
    const automationBadge = getAutomationBadge(
      wallet.hasAutomation,
      wallet.automationStatus,
      themeColors
    )
    const hasAnyBadge = !!automationBadge || !!statusBadge

    return (
      <div
        key={index}
        onClick={() => handleWalletClick(wallet)}
        className="relative cursor-pointer rounded-[16px] border p-4 transition-opacity hover:opacity-80"
        style={{
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          boxShadow: isDark
            ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        {hasAnyBadge && (
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
            {automationBadge && (
              <div
                className="flex h-5 items-center gap-1 rounded-full px-2"
                style={{
                  backgroundColor: isDark
                    ? `${automationBadge.color}33`
                    : `${automationBadge.color}1A`,
                  color: automationBadge.color,
                }}
              >
                <automationBadge.icon size={10} strokeWidth={2.5} />
                <span className="text-[8px] font-bold uppercase tracking-wide">
                  {automationBadge.label}
                </span>
              </div>
            )}

            {statusBadge && (
              <div
                className="flex h-5 items-center gap-1 rounded-full px-2"
                style={{
                  backgroundColor: isDark
                    ? `${statusBadge.color}33`
                    : `${statusBadge.color}1A`,
                  color: statusBadge.color,
                }}
              >
                <statusBadge.icon size={10} strokeWidth={2.5} />
                <span className="text-[8px] font-bold uppercase tracking-wide">
                  {statusBadge.label}
                </span>
              </div>
            )}
          </div>
        )}

        <div
          className="mb-2 flex h-10 w-10 items-center justify-center rounded-[12px]"
          style={{
            backgroundColor: isDark ? `${accent}33` : `${accent}1A`,
            color: accent,
          }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <p className="text-[12px] truncate pr-12" style={{ color: themeColors.mid }}>
          {wallet.walletName}
        </p>
        <p
          className="mt-1 text-[16px] font-bold"
          style={{
            color: themeColors.charcoal,
            fontFamily:
              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          ₦{(wallet.targetAmount / 1000).toFixed(0)}k
        </p>

        <p className="mt-1 text-[11px]" style={{ color: themeColors.mid }}>
          {formatCurrency(wallet.releaseAmount)} per release
        </p>
      </div>
    )
  }

  const circleAccent = themeColors.circle

  return (
    <>
      {showLowBalanceModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={handleCloseLowBalance}
        >
          <div
            className="w-full max-w-[400px] rounded-[20px] border p-5"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? `${themeColors.warning}26`
                  : `${themeColors.warning}14`,
              }}
            >
              <Wallet size={26} strokeWidth={2} style={{ color: themeColors.warning }} />
            </div>

            <h3
              className="mt-4 text-center text-[18px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Your Mova balance is low
            </h3>

            <p
              className="mt-2 text-center text-[13px] leading-[1.6]"
              style={{ color: themeColors.mid }}
            >
              You have less than {formatCurrency(LOW_BALANCE_THRESHOLD)} in your
              main Mova balance. Top up so your wallets and automation can keep
              running without interruptions.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCloseLowBalance}
                className="flex-1 cursor-pointer rounded-[12px] border px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-70"
                style={{
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                  backgroundColor: 'transparent',
                }}
              >
                Maybe later
              </button>

              <button
                type="button"
                onClick={handleAddFundsFromModal}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                Add funds
              </button>
            </div>
          </div>
        </div>
      )}

      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          {dashboardData.accountStatus && (
            <AccountStatusBanner
              status={dashboardData.accountStatus}
              isDark={isDark}
              themeColors={themeColors}
            />
          )}

          <section className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px]" style={{ color: themeColors.mid }}>
                  {greeting}
                </p>
                <h2
                  className="mt-1 flex items-center gap-2 text-[18px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  {fullName}
                  <Hand
                    size={20}
                    strokeWidth={2}
                    style={{ color: themeColors.green }}
                  />
                </h2>
              </div>

              <button
                type="button"
                onClick={openTour}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                  color: themeColors.mid,
                }}
                aria-label="How this page works"
              >
                <Info size={14} strokeWidth={2.4} />
              </button>
            </div>
          </section>

          {/* ─── 1. BALANCE CARD ─── */}
          <section
            className="rounded-[20px] p-5"
            style={{ backgroundColor: themeColors.green, color: '#FFFFFF' }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <p
                  className="truncate text-[13px]"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Mova Main Balance
                </p>
                <button
                  type="button"
                  onClick={handleToggleBalance}
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-80 active:scale-90"
                  style={{ color: 'rgba(255,255,255,0.85)' }}
                  aria-label={isBalanceHidden ? 'Show balance' : 'Hide balance'}
                >
                  {isBalanceHidden ? (
                    <EyeOff size={15} strokeWidth={2.2} />
                  ) : (
                    <Eye size={15} strokeWidth={2.2} />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddFunds}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                Add funds
              </button>
            </div>

            <p
              className="mt-1 font-bold"
              style={{
                color: '#FFFFFF',
                fontSize: 'clamp(22px, 6.5vw, 42px)',
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                overflowWrap: 'anywhere',
              }}
            >
              {isBalanceHidden ? '••••••' : formatCurrency(animatedBalance)}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleWithdraw}
                className="flex min-w-0 flex-1 cursor-pointer flex-col rounded-[12px] p-3 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="flex items-center justify-between gap-1">
                  <p
                    className="min-w-0 truncate text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Available to Spend
                  </p>
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2.5}
                    style={{ color: '#FFFFFF' }}
                    className="shrink-0"
                  />
                </div>
                <p
                  className="mt-1 font-bold"
                  style={{
                    color: '#FFFFFF',
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: 'clamp(14px, 4vw, 18px)',
                    lineHeight: 1.15,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {isBalanceHidden
                    ? '••••'
                    : formatCurrency(balance.totalAvailableAmount)}
                </p>
              </button>

              <button
                type="button"
                onClick={handleControlled}
                className="flex min-w-0 flex-1 cursor-pointer flex-col rounded-[12px] p-3 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="flex items-center justify-between gap-1">
                  <p
                    className="flex min-w-0 items-center gap-1 text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <Lock size={11} strokeWidth={2.5} className="shrink-0" />
                    <span className="truncate">Controlled</span>
                  </p>
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2.5}
                    style={{ color: '#FFFFFF' }}
                    className="shrink-0"
                  />
                </div>
                <p
                  className="mt-1 font-bold"
                  style={{
                    color: '#FFFFFF',
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: 'clamp(14px, 4vw, 18px)',
                    lineHeight: 1.15,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {isBalanceHidden
                    ? '••••'
                    : formatCurrency(balance.totalLockedAmount)}
                </p>
              </button>
            </div>
          </section>

          {/* ─── 2. TEMPLATES (single row, 3 cards — one per type) ─── */}
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Start with a template
                </p>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Pick a preset and go
                </p>
              </div>
              <button
                type="button"
                onClick={handleBrowseTemplates}
                className="cursor-pointer text-[12px] font-semibold transition-opacity hover:opacity-80"
                style={{ color: themeColors.green }}
              >
                See all →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {starterTemplates.map((template) => {
                const Icon = template.icon
                return (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => handleTemplateClick(template.walletType)}
                    className="flex min-w-0 flex-col items-start rounded-[12px] border p-2.5 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                      boxShadow: isDark
                        ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                        : '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-[8px]"
                      style={{
                        backgroundColor: isDark
                          ? `${template.accent}33`
                          : `${template.accent}1A`,
                        color: template.accent,
                      }}
                    >
                      <Icon size={15} strokeWidth={2} />
                    </div>
                    <p
                      className="w-full truncate text-[10.5px] font-semibold leading-tight"
                      style={{ color: themeColors.charcoal }}
                    >
                      {template.name}
                    </p>
                    <span
                      className="mt-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: isDark
                          ? `${template.accent}26`
                          : `${template.accent}14`,
                        color: template.accent,
                      }}
                    >
                      {template.tag}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ─── 3. SCHEDULED WALLETS ─── */}
          {scheduledWallets.length > 0 && (
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Scheduled Wallets
                </p>
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="cursor-pointer text-[12px] font-semibold transition-opacity hover:opacity-80"
                  style={{ color: themeColors.green }}
                >
                  See all →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scheduledWallets.map((wallet, index) =>
                  renderStandardWallet(wallet, index)
                )}
              </div>
            </section>
          )}

          {/* ─── 4. TRUSTEE WALLETS ─── */}
          {trusteeWallets.length > 0 && (
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Trustee Wallets
                </p>
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="cursor-pointer text-[12px] font-semibold transition-opacity hover:opacity-80"
                  style={{ color: themeColors.trustee }}
                >
                  See all →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {trusteeWallets.map((wallet, index) =>
                  renderStandardWallet(wallet, index)
                )}
              </div>
            </section>
          )}

          {/* ─── 5. EMPTY STATE ─── */}
          {scheduledWallets.length === 0 && trusteeWallets.length === 0 && (
            <section className="mt-6">
              <p
                className="mb-3 text-[15px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Your Wallets
              </p>
              <div
                className="cursor-pointer rounded-[16px] border p-8 text-center transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                  borderStyle: 'dashed',
                }}
                onClick={handleCreateWallet}
              >
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? `${themeColors.green}33`
                      : `${themeColors.green}1A`,
                    color: themeColors.green,
                  }}
                >
                  <PlusCircle size={24} strokeWidth={1.5} />
                </div>
                <p
                  className="mt-3 text-[14px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  Create your first wallet
                </p>
                <p
                  className="mt-1 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  Scheduled or trustee — you choose how it moves
                </p>
              </div>
            </section>
          )}

          {/* ─── 6. CIRCLE WALLETS ─── */}
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Your Circles
                </p>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Save together — one member gets the pot each round
                </p>
              </div>
              {circleWallets.length > 0 && (
                <button
                  type="button"
                  onClick={handleViewAllCircles}
                  className="cursor-pointer text-[12px] font-semibold transition-opacity hover:opacity-80"
                  style={{ color: themeColors.circle }}
                >
                  See all →
                </button>
              )}
            </div>

            {circleWallets.length > 0 ? (
              <div className="space-y-2.5">
                {circleWallets.map((circle) => {
                  const Icon = getIcon(circle.categoryIcon)
                  const statusBadge = getCircleStatusBadge(
                    circle.status,
                    themeColors
                  )

                  return (
                    <div
                      key={circle.id}
                      onClick={() => handleWalletClick(circle)}
                      className="flex cursor-pointer items-center gap-3 rounded-[14px] border p-3 transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
                        boxShadow: isDark
                          ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                          : '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
                        style={{
                          backgroundColor: isDark
                            ? `${circleAccent}33`
                            : `${circleAccent}1A`,
                          color: circleAccent,
                        }}
                      >
                        <Icon size={20} strokeWidth={2} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p
                            className="truncate text-[14px] font-semibold"
                            style={{ color: themeColors.charcoal }}
                          >
                            {circle.walletName}
                          </p>
                          {statusBadge && (
                            <span
                              className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide"
                              style={{
                                backgroundColor: isDark
                                  ? `${statusBadge.color}33`
                                  : `${statusBadge.color}1A`,
                                color: statusBadge.color,
                              }}
                            >
                              {statusBadge.label}
                            </span>
                          )}
                        </div>
                        <p
                          className="mt-0.5 truncate text-[11px]"
                          style={{ color: themeColors.mid }}
                        >
                          {circle.categoryName}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className="text-[14px] font-bold"
                          style={{
                            color: themeColors.charcoal,
                            fontFamily:
                              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}
                        >
                          {formatCurrency(circle.targetAmount)}
                        </p>
                        <p
                          className="mt-0.5 flex items-center justify-end gap-0.5 text-[10px]"
                          style={{ color: themeColors.mid }}
                        >
                          <Users size={9} strokeWidth={2.5} />
                          Group
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                onClick={handleCreateCircle}
                className="cursor-pointer rounded-[16px] border-2 border-dashed p-6 text-center transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: isDark
                    ? `${circleAccent}0D`
                    : `${circleAccent}08`,
                  borderColor: circleAccent,
                }}
              >
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? `${circleAccent}33`
                      : `${circleAccent}1A`,
                    color: circleAccent,
                  }}
                >
                  <Users size={24} strokeWidth={1.8} />
                </div>
                <p
                  className="mt-3 text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Start a savings circle
                </p>
                <p
                  className="mt-1 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  Save together. Each round, one member receives the pot.
                </p>
              </div>
            )}
          </section>

          {/* ─── 7. QUICK ACCESS ─── */}
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p
                className="text-[15px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Quick Access
              </p>
              <button
                type="button"
                onClick={handleServices}
                className="cursor-pointer text-[12px] font-semibold transition-opacity hover:opacity-80"
                style={{ color: themeColors.green }}
              >
                See all →
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {quickAccessItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={item.onClick}
                    className="flex min-w-0 cursor-pointer flex-col items-center overflow-hidden rounded-[12px] border p-2 transition-all duration-200 hover:opacity-80 active:scale-[0.98] sm:rounded-[16px] sm:p-4"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div
                      className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:mb-2 sm:h-10 sm:w-10"
                      style={{
                        backgroundColor: isDark
                          ? `${item.color}26`
                          : `${item.color}14`,
                        color: item.color,
                      }}
                    >
                      <Icon
                        className="h-3.5 w-3.5 sm:h-5 sm:w-5"
                        strokeWidth={2}
                      />
                    </div>
                    <p
                      className="w-full truncate text-center text-[8.5px] font-medium leading-tight sm:text-[11px]"
                      style={{ color: themeColors.charcoal }}
                    >
                      {item.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ─── TODAY'S RELEASES ─── */}
          <section className="mt-6">
            <div
              className="rounded-[16px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Today's Releases
                </p>
                {todayReleased && todayReleased.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSeeAll}
                    className="cursor-pointer text-[12px] font-semibold transition-opacity hover:opacity-80"
                    style={{ color: themeColors.green }}
                  >
                    See all →
                  </button>
                )}
              </div>

              {todayReleased && todayReleased.length > 0 ? (
                <div className="space-y-3">
                  {todayReleased.map((release, index) => {
                    const Icon = getIcon(release.walletName)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                            style={{
                              backgroundColor: isDark
                                ? `${themeColors.green}33`
                                : `${themeColors.green}1A`,
                              color: themeColors.green,
                            }}
                          >
                            <Icon size={16} strokeWidth={2} />
                          </div>
                          <p
                            className="text-[14px] font-medium"
                            style={{ color: themeColors.charcoal }}
                          >
                            {release.walletName}
                          </p>
                        </div>
                        <p
                          className="text-[15px] font-bold"
                          style={{
                            color: themeColors.green,
                            fontFamily:
                              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}
                        >
                          +{formatCurrency(release.releasedAmount)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-8 text-center"
                  style={{ color: themeColors.mid }}
                >
                  <Clock size={32} strokeWidth={1.5} />
                  <p className="mt-3 text-[14px] font-medium">
                    No releases today
                  </p>
                  <p className="mt-1 text-[12px]">
                    Wallet money will appear here when a release is due
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ─── CAROUSEL ─── */}
          <section className="mt-6">
            <div
              ref={carouselRef}
              className="relative overflow-hidden rounded-[5px] border"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => {
                setIsPaused(false)
                handleMouseLeave()
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
              >
                {carouselItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.id} className="min-w-full p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: isDark
                              ? `${item.color}26`
                              : `${item.color}14`,
                          }}
                        >
                          <Icon
                            size={22}
                            strokeWidth={2}
                            style={{ color: item.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-[14px] font-semibold"
                            style={{ color: themeColors.charcoal }}
                          >
                            {item.title}
                          </h4>
                          <p
                            className="text-[12px]"
                            style={{ color: themeColors.mid }}
                          >
                            {item.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateWalletFromCarousel}
                          className="shrink-0 cursor-pointer rounded-[5px] px-4 py-2 text-[12px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
                          style={{
                            backgroundColor: themeColors.green,
                            color: '#FFFFFF',
                          }}
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-center gap-1.5 pb-3">
                {carouselItems.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDotClick(index)}
                    className="h-1.5 cursor-pointer rounded-full transition-all duration-300"
                    style={{
                      width: currentSlide === index ? '16px' : '6px',
                      backgroundColor:
                        currentSlide === index
                          ? themeColors.green
                          : themeColors.border,
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ─── MONEY SET ASIDE CHART ─── */}
          {chartPoints.length > 0 && (
            <section className="mt-6">
              <div
                className="rounded-[16px] border p-4"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p
                      className="text-[15px] font-bold"
                      style={{ color: themeColors.charcoal }}
                    >
                      Money Set Aside
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Last {chartPoints.length} months
                    </p>
                  </div>
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isDark
                        ? `${themeColors.green}26`
                        : `${themeColors.green}14`,
                      color: themeColors.green,
                    }}
                  >
                    <BarChart3 size={16} strokeWidth={2} />
                  </div>
                </div>

                <div
                  className="mb-3 flex items-center justify-between rounded-[10px] px-3 py-2 transition-all"
                  style={{
                    backgroundColor: isDark
                      ? `${themeColors.green}14`
                      : `${themeColors.green}0D`,
                    opacity: activeBar ? 1 : 0.6,
                  }}
                >
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: themeColors.mid }}
                  >
                    {activeBar
                      ? activeBar.label
                      : 'Hover a bar to see the value'}
                  </span>
                  <span
                    className="text-[13px] font-bold"
                    style={{
                      color: themeColors.green,
                      fontFamily:
                        "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {activeBar ? formatCurrency(activeBar.value) : '—'}
                  </span>
                </div>

                <div
                  className="flex items-end justify-between gap-2"
                  style={{ height: 140 }}
                  onMouseLeave={() => setActiveBarIndex(null)}
                >
                  {chartPoints.map((point, index) => {
                    const heightPercent =
                      maxChartValue > 0
                        ? (point.value / maxChartValue) * 100
                        : 0
                    const isActive = activeBarIndex === index
                    const isLast = index === chartPoints.length - 1

                    return (
                      <div
                        key={`${point.label}-${index}`}
                        className="flex flex-1 cursor-pointer flex-col items-center"
                        onMouseEnter={() => setActiveBarIndex(index)}
                        onClick={() => setActiveBarIndex(index)}
                      >
                        <p
                          className="mb-1 whitespace-nowrap text-[10px] font-semibold transition-all"
                          style={{
                            color: isActive
                              ? themeColors.green
                              : isLast
                              ? themeColors.green
                              : themeColors.mid,
                            transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          }}
                        >
                          {formatCompactCurrency(point.value)}
                        </p>

                        <div
                          className="flex w-full items-end"
                          style={{ height: 100 }}
                        >
                          <div
                            className="w-full rounded-t-[6px] transition-all duration-300"
                            style={{
                              height: `${Math.max(heightPercent, 2)}%`,
                              backgroundColor: isActive
                                ? themeColors.green
                                : isLast
                                ? themeColors.green
                                : isDark
                                ? `${themeColors.green}59`
                                : `${themeColors.green}40`,
                              transform: isActive
                                ? 'scaleY(1.03)'
                                : 'scaleY(1)',
                              transformOrigin: 'bottom',
                            }}
                          />
                        </div>

                        <p
                          className="mt-2 text-center text-[10px] font-medium transition-all"
                          style={{
                            color: isActive
                              ? themeColors.charcoal
                              : isLast
                              ? themeColors.charcoal
                              : themeColors.mid,
                          }}
                        >
                          {point.label}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div
                  className="mt-1 h-px w-full"
                  style={{ backgroundColor: themeColors.border }}
                />

                {maxChartValue > 0 && (
                  <p
                    className="mt-3 text-center text-[10px]"
                    style={{ color: themeColors.mid }}
                  >
                    Peak: {formatCurrency(maxChartValue)}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        <BottomSheet
          isOpen={tourSheet.activeSheet !== null}
          onClose={skipTour}
          title={currentStep.title}
          icon={<StepIcon size={16} strokeWidth={2.4} />}
          disableBackdropClose
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={skipTour}
                className="cursor-pointer rounded-[12px] px-4 py-3 text-[13px] font-semibold transition-all hover:opacity-70"
                style={{ color: themeColors.mid }}
              >
                {isLastStep ? 'Close' : 'Skip'}
              </button>

              <button
                type="button"
                onClick={nextTourStep}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                {isLastStep ? "Let's go!" : 'Next'}
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          }
        >
          <div style={{ color: themeColors.mid }}>
            <div className="mb-4 flex items-center justify-center gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === tourStep ? '20px' : '6px',
                    height: '6px',
                    backgroundColor:
                      i === tourStep
                        ? themeColors.green
                        : themeColors.border,
                  }}
                />
              ))}
            </div>

            <p className="text-[13px] leading-[1.65]">{currentStep.body}</p>

            <p
              className="mt-4 text-center text-[11px]"
              style={{ color: themeColors.light }}
            >
              Step {tourStep + 1} of {TOUR_STEPS.length}
            </p>
          </div>
        </BottomSheet>
      </AppLayout>
    </>
  )
}