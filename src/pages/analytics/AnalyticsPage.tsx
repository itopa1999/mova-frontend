import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Shield,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { getAnalytics } from '../../services/app/analytics'

// Types
interface AnalyticsData {
  month: string
  moneyProtected: number
  moneyReleased: number
  moneySpent: number
  remaining: number
  protectedPercentage: number
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Month/Year filter state
  const currentDate = new Date()
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1) // 1-12

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedYear, selectedMonth])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      const response = await getAnalytics(selectedYear, selectedMonth)
      if (response.is_success && response.data) {
        setAnalytics(response.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
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

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value))
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value))
  }

  const getMonthName = (month: number): string => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })
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

  if (!analytics) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <p style={{ color: themeColors.mid }}>No analytics data available</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header with Back Button */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ChevronLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <h1 className="text-[20px] font-bold" style={{ color: themeColors.charcoal }}>
            Monthly Analytics
          </h1>
        </div>

        {/* Month/Year Selector */}
        <div
          className="mb-4 flex items-center gap-3 rounded-[14px] border p-3"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95"
            style={{ backgroundColor: themeColors.background }}
          >
            <ChevronLeft size={16} style={{ color: themeColors.charcoal }} />
          </button>

          <div className="flex flex-1 items-center justify-center gap-2">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="rounded-[8px] border px-3 py-1.5 text-[14px] font-medium outline-none"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.charcoal,
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="rounded-[8px] border px-3 py-1.5 text-[14px] font-medium outline-none"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.charcoal,
              }}
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95"
            style={{ backgroundColor: themeColors.background }}
          >
            <ChevronRight size={16} style={{ color: themeColors.charcoal }} />
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="space-y-4">
          {/* Month Title */}
          <p
            className="text-center text-[13px]"
            style={{ color: themeColors.mid }}
          >
            {analytics.month}
          </p>

          {/* Protected Amount */}
          <div
            className="rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
                    color: themeColors.green,
                  }}
                >
                  <Shield size={22} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[12px]" style={{ color: themeColors.mid }}>
                    Money Protected
                  </p>
                  <p
                    className="text-[20px] font-bold"
                    style={{
                      color: themeColors.charcoal,
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(analytics.moneyProtected)}
                  </p>
                </div>
              </div>
              <div
                className="rounded-full px-3 py-1 text-[12px] font-semibold"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 185, 110, 0.2)' : 'rgba(15, 185, 110, 0.1)',
                  color: themeColors.green,
                }}
              >
                {analytics.protectedPercentage}%
              </div>
            </div>
          </div>

          {/* Money Released & Spent */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-[14px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-center gap-2">
                <ArrowUpRight size={16} style={{ color: themeColors.green }} />
                <p className="text-[11px]" style={{ color: themeColors.mid }}>
                  Money Released
                </p>
              </div>
              <p
                className="mt-1 text-[17px] font-bold"
                style={{
                  color: themeColors.green,
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(analytics.moneyReleased)}
              </p>
            </div>

            <div
              className="rounded-[14px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-center gap-2">
                <ArrowDownRight size={16} style={{ color: '#EF4444' }} />
                <p className="text-[11px]" style={{ color: themeColors.mid }}>
                  Money Spent
                </p>
              </div>
              <p
                className="mt-1 text-[17px] font-bold"
                style={{
                  color: '#EF4444',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(analytics.moneySpent)}
              </p>
            </div>
          </div>

          {/* Remaining */}
          <div
            className="rounded-[14px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px]" style={{ color: themeColors.mid }}>
                  Remaining Balance
                </p>
                <p
                  className="mt-1 text-[18px] font-bold"
                  style={{
                    color: themeColors.charcoal,
                    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {formatCurrency(analytics.remaining)}
                </p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 185, 110, 0.15)' : 'rgba(15, 185, 110, 0.08)',
                  color: themeColors.green,
                }}
              >
                <Wallet size={18} strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Protected Percentage Bar */}
          <div
            className="rounded-[14px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Protection Rate
              </p>
              <p
                className="text-[14px] font-bold"
                style={{ color: themeColors.green }}
              >
                {analytics.protectedPercentage}%
              </p>
            </div>
            <div
              className="h-2 w-full rounded-full overflow-hidden"
              style={{ backgroundColor: themeColors.border }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: themeColors.green,
                  width: `${Math.min(analytics.protectedPercentage, 100)}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px]" style={{ color: themeColors.mid }}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}