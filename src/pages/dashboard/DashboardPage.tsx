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
  Coins,
  User,
  Calculator,
  BarChart3,
  Banknote,
  Lock,
  Hand,
  Info,
  Wallet,
  ArrowRight,
  Pause,
} from 'lucide-react'

import { type LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'

import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { getDashboard } from '../../services/app/dashboard'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { useCountUp } from '../../hooks/useCountUp'

// Types
interface Balance {
  userBalance: number
  totalAvailableAmount: number
  totalLockedAmount: number
}

interface TodayRelease {
  walletName: string
  releasedAmount: number
  releasedAt: string
}

interface WalletItem {
  id: number
  walletName: string
  categoryId: number
  categoryName: string
  categoryIcon: string
  targetAmount: number
  releaseAmount: number
  hasAutomation: boolean
  automationStatus: string | null
}

interface LockedAmountPoint {
  label: string
  value: number
}

interface DashboardData {
  balance: Balance
  todayReleased: TodayRelease[]
  wallets: WalletItem[]
  lockedAmountHistory: LockedAmountPoint[]
}

// Carousel items
interface CarouselItem {
  id: number
  icon: LucideIcon
  title: string
  description: string
  color: string
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    icon: Target,
    title: 'Set Smart Goals',
    description: 'Create wallets for savings, bills, and daily expenses.',
    color: '#4ADE80',
  },
  {
    id: 2,
    icon: Calendar,
    title: 'Plan Your Spending',
    description: 'Schedule releases daily, weekly, or monthly.',
    color: '#60A5FA',
  },
  {
    id: 3,
    icon: Shield,
    title: 'Protect Your Money',
    description: 'Lock funds and release them only when needed.',
    color: '#F472B6',
  },
  {
    id: 4,
    icon: Sparkles,
    title: 'Build Better Habits',
    description: 'Small releases help you stick to your budget.',
    color: '#FBBF24',
  },
  {
    id: 5,
    icon: Zap,
    title: 'Start Your Journey',
    description: 'Create your first wallet today.',
    color: '#34D399',
  },
]

// ─── Dashboard Tour steps ──────────────────────────────
type TourKey = 'welcome'
interface TourStep {
  icon: LucideIcon
  iconColor: string
  title: string
  body: string
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: Hand,
    iconColor: '#4ADE80',
    title: 'Welcome to MOVA',
    body:
      "MOVA helps you put money aside and decide when it becomes available. Let's take a quick 30-second tour of your dashboard.",
  },
  {
    icon: Wallet,
    iconColor: '#4ADE80',
    title: 'Your Balance',
    body:
      'The green card at the top shows your total balance. It splits into two parts: money available to spend right now, and money you have controlled inside wallets.',
  },
  {
    icon: Clock,
    iconColor: '#60A5FA',
    title: "Today's Releases",
    body:
      'When a controlled wallet releases money, you will see it here. Releases go into your main balance or straight to your linked bank account.',
  },
  {
    icon: Target,
    iconColor: '#FBBF24',
    title: 'Controlled Wallets',
    body:
      'Each wallet holds money for a specific purpose — rent, transport, savings, and more. Money stays locked until its schedule releases it.',
  },
  {
    icon: Banknote,
    iconColor: '#F472B6',
    title: 'Quick Access',
    body:
      'From here you can add funds, manage bank accounts, view analytics, and see all your releases — everything at your fingertips.',
  },
]

const TOUR_SEEN_KEY = 'mova_dashboard_tour_seen'

export default function Dashboard() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const themeColors = isDark ? darkColors : colors

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Tour
  const tourSheet = useBottomSheet<TourKey>()
  const [tourStep, setTourStep] = useState(0)

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Chart interaction
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null)

  const getIcon = useCategoryIcon()

  // Fetch dashboard data
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

  // Auto-open the tour on first visit
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

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused || !dashboardData) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused, dashboardData])

  const handleDotClick = (index: number) => {
    setCurrentSlide(index)
  }

  const handleCreateWalletFromCarousel = () => {
    navigate('/create-wallet')
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
      setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
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
        setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCompact = (amount: number): string => {
    if (amount >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`
    }
    if (amount >= 1_000) {
      return `₦${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}k`
    }
    return `₦${amount}`
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
    navigate('/releases')
  }

  const handleViewAll = (): void => {
    navigate('/wallets')
  }

  const handleCreateWallet = (): void => {
    navigate('/create-wallet')
  }

  const handleWalletClick = (walletId: number) => {
    navigate(`/wallet/${walletId}`)
  }

  const handleAddFunds = (): void => {
    navigate('/add-funds')
  }

  const quickAccessItems = [
    { icon: User, label: 'Profile', onClick: () => navigate('/profile'), color: '#4ADE80' },
    { icon: Banknote, label: 'Bank Accounts', onClick: () => navigate('/bank'), color: '#60A5FA' },
    { icon: Calculator, label: 'Calculate Release', onClick: () => navigate('/calculate-release'), color: '#F472B6' },
    { icon: BarChart3, label: 'View Analytics', onClick: () => navigate('/analytics'), color: '#FBBF24' },
    { icon: Plus, label: 'Add Funds', onClick: () => navigate('/add-funds'), color: '#34D399' },
    { icon: Coins, label: 'Releases', onClick: () => navigate('/releases'), color: '#ee1053' },
  ]

  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
  const fullName = userData.fullName || 'Lucky'

  const animatedBalance = useCountUp(
    dashboardData?.balance.userBalance ?? 0,
    1400
  )

  // Tour helpers
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

  // Show loading state
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

  // Empty state
  if (!dashboardData) {
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

  const { balance, todayReleased, wallets, lockedAmountHistory } = dashboardData

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

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Greeting */}
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
                <Hand size={20} strokeWidth={2} style={{ color: themeColors.green }} />
              </h2>
            </div>

            {/* Info button → reopens the tour */}
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

        {/* Balance Card */}
        <section
          className="rounded-[20px] p-5"
          style={{ backgroundColor: themeColors.green, color: '#FFFFFF' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Total Balance
              </p>
              <p
                className="mt-1 font-bold tracking-[-0.02em]"
                style={{
                  color: '#FFFFFF',
                  fontSize: '42px',
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                {formatCurrency(animatedBalance)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddFunds}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
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

          <div className="mt-5 flex gap-3">
            <div
              className="flex-1 rounded-[12px] p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Available to Spend
              </p>
              <p
                className="mt-1 text-[18px] font-bold"
                style={{
                  color: '#FFFFFF',
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(balance.totalAvailableAmount)}
              </p>
            </div>

            <div
              className="flex-1 rounded-[12px] p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <p
                className="flex items-center gap-1 text-[11px]"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                <Lock size={11} strokeWidth={2.5} />
                Controlled
              </p>
              <p
                className="mt-1 text-[18px] font-bold"
                style={{
                  color: '#FFFFFF',
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(balance.totalLockedAmount)}
              </p>
            </div>
          </div>
        </section>

        {/* Today's Releases */}
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
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(15, 185, 110, 0.2)'
                              : 'rgba(15, 185, 110, 0.1)',
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
                <p className="mt-3 text-[14px] font-medium">No releases today</p>
                <p className="mt-1 text-[12px]">
                  Your controlled funds will appear here when released
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Carousel */}
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
                            ? 'rgba(74, 222, 128, 0.15)'
                            : 'rgba(15, 151, 61, 0.08)',
                        }}
                      >
                        <Icon size={22} strokeWidth={2} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          {item.title}
                        </h4>
                        <p className="text-[12px]" style={{ color: themeColors.mid }}>
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
                      currentSlide === index ? themeColors.green : themeColors.border,
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Controlled Wallets */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[15px] font-bold" style={{ color: themeColors.charcoal }}>
              Controlled Wallets
            </p>
            {wallets && wallets.length > 0 && (
              <button
                type="button"
                onClick={handleViewAll}
                className="cursor-pointer text-[12px] font-semibold transition-opacity hover:opacity-80"
                style={{ color: themeColors.green }}
              >
                See all →
              </button>
            )}
          </div>

          {wallets && wallets.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {wallets.map((wallet, index) => {
                const Icon = getIcon(wallet.categoryIcon)

                const automationStatus = (wallet.automationStatus ?? '').toLowerCase()
                const isActive = wallet.hasAutomation && automationStatus === 'active'
                const isPaused = wallet.hasAutomation && automationStatus === 'paused'
                const isOn = isActive || isPaused

                const accentColor = isActive
                  ? themeColors.green
                  : isPaused
                  ? '#F59E0B'
                  : themeColors.green

                return (
                  <div
                    key={index}
                    onClick={() => handleWalletClick(wallet.id)}
                    className="relative cursor-pointer rounded-[16px] border p-4 transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                      boxShadow: isDark
                        ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
                        : '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
                    }}
                  >
                    {isOn && (
                      <div
                        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: isDark
                            ? `${accentColor}33`
                            : `${accentColor}1A`,
                          color: accentColor,
                        }}
                        title={
                          isActive
                            ? 'Automation is active'
                            : 'Automation is paused'
                        }
                      >
                        {isActive ? (
                          <Zap size={12} strokeWidth={2.5} />
                        ) : (
                          <Pause size={12} strokeWidth={2.5} />
                        )}
                      </div>
                    )}

                    <div
                      className="mb-2 flex h-10 w-10 items-center justify-center rounded-[12px]"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(15, 185, 110, 0.2)'
                          : 'rgba(15, 185, 110, 0.1)',
                        color: themeColors.green,
                      }}
                    >
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <p className="text-[12px]" style={{ color: themeColors.mid }}>
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
                    <p
                      className="mt-1 text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      {formatCurrency(wallet.releaseAmount)} per release
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
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
                    ? 'rgba(15, 185, 110, 0.2)'
                    : 'rgba(15, 185, 110, 0.1)',
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
              <p className="mt-1 text-[12px]" style={{ color: themeColors.mid }}>
                Start controlling your spending today
              </p>
            </div>
          )}
        </section>

        {/* Locked Amounts Chart */}
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
                    Controlled Funds
                  </p>
                  <p className="text-[11px]" style={{ color: themeColors.mid }}>
                    Last {chartPoints.length} months
                  </p>
                </div>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.15)'
                      : 'rgba(15, 185, 110, 0.08)',
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
                    ? 'rgba(15, 185, 110, 0.08)'
                    : 'rgba(15, 185, 110, 0.05)',
                  opacity: activeBar ? 1 : 0.6,
                }}
              >
                <span
                  className="text-[11px] font-medium"
                  style={{ color: themeColors.mid }}
                >
                  {activeBar ? activeBar.label : 'Hover a bar to see the value'}
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
                    maxChartValue > 0 ? (point.value / maxChartValue) * 100 : 0
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
                        {formatCompact(point.value)}
                      </p>

                      <div className="flex w-full items-end" style={{ height: 100 }}>
                        <div
                          className="w-full rounded-t-[6px] transition-all duration-300"
                          style={{
                            height: `${Math.max(heightPercent, 2)}%`,
                            backgroundColor: isActive
                              ? themeColors.green
                              : isLast
                              ? themeColors.green
                              : isDark
                              ? 'rgba(15, 185, 110, 0.35)'
                              : 'rgba(15, 185, 110, 0.25)',
                            transform: isActive ? 'scaleY(1.03)' : 'scaleY(1)',
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

        {/* Quick Access */}
        <section className="mt-6">
          <p className="mb-3 text-[15px] font-bold" style={{ color: themeColors.charcoal }}>
            Quick Access
          </p>
          <div className="grid grid-cols-3 gap-3">
            {quickAccessItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  type="button"
                  onClick={item.onClick}
                  className="flex cursor-pointer flex-col items-center rounded-[16px] border p-4 transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div
                    className="mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isDark ? `${item.color}20` : `${item.color}10`,
                      color: item.color,
                    }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <p
                    className="text-center text-[11px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    {item.label}
                  </p>
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/* ───────── Dashboard Tour BottomSheet ───────── */}
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
          {/* Progress dots */}
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
  )
}