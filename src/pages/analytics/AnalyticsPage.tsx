import {
  ChevronLeft,
  ChevronRight,
  Frown,
  Shield,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Lightbulb,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import { getAnalytics } from '../../services/app/analytics'

// ─── Types ────────────────────────────────────────────
interface AiInsight {
  key: string
  headline: string
  body: string
  tone: 'positive' | 'neutral' | 'caution'
}

interface AnalyticsData {
  month: string
  moneyProtected: number
  moneyReleased: number
  moneySpent: number
  remaining: number
  protectedPercentage: number
  insight: AiInsight
  additionalInsights: AiInsight[]
}

// Info key types
type InfoKey = 'protected' | 'released' | 'spent' | 'remaining' | 'protectionRate'

const INFO_CONTENT: Record<InfoKey, { title: string; body: string }> = {
  protected: {
    title: 'Money Protected',
    body: 'The total amount currently locked across all your wallets. This money is set aside and cannot be spent until your schedule releases it.',
  },
  released: {
    title: 'Money Released',
    body: 'The total amount that has been released from your wallets this month — either into your main balance or sent to your linked bank account.',
  },
  spent: {
    title: 'Money Spent',
    body: 'The total amount that has actually left your account this month — transfers, withdrawals, and payments combined.',
  },
  remaining: {
    title: 'Remaining Balance',
    body: 'The balance still left in your main account, available for you to allocate to a new wallet or leave as spendable cash.',
  },
  protectionRate: {
    title: 'Protection Rate',
    body: 'The percentage of your total money that is currently protected inside wallets. A higher rate means more of your money is locked away from impulse spending.',
  },
}

// ─── Tone mapping ─────────────────────────────────────
const toneStyles = (
  tone: string,
  themeColors: typeof colors | typeof darkColors,
  isDark: boolean
) => {
  switch (tone) {
    case 'positive':
      return {
        accent: themeColors.green,
        bg: isDark
          ? 'rgba(15, 185, 110, 0.10)'
          : 'rgba(15, 185, 110, 0.05)',
        border: isDark
          ? 'rgba(15, 185, 110, 0.25)'
          : 'rgba(15, 185, 110, 0.18)',
        Icon: TrendingUp,
      }
    case 'caution':
      return {
        accent: '#F59E0B',
        bg: isDark
          ? 'rgba(245, 158, 11, 0.10)'
          : 'rgba(245, 158, 11, 0.05)',
        border: isDark
          ? 'rgba(245, 158, 11, 0.25)'
          : 'rgba(245, 158, 11, 0.18)',
        Icon: AlertCircle,
      }
    default:
      return {
        accent: themeColors.mid,
        bg: isDark
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(0, 0, 0, 0.02)',
        border: themeColors.border,
        Icon: Lightbulb,
      }
  }
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const infoSheet = useBottomSheet<InfoKey>()

  // Month/Year filter state
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const canGoPrev = () => true

  const canGoNext = () => {
    if (selectedYear > currentYear) return false
    if (selectedYear === currentYear && selectedMonth >= currentMonth) return false
    return true
  }

  useEffect(() => {
    fetchAnalyticsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!canGoPrev()) return
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (!canGoNext()) return
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value)
    if (year > currentYear) return
    setSelectedYear(year)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value)
    if (selectedYear === currentYear && month > currentMonth) return
    setSelectedMonth(month)
  }

  const getMonthName = (month: number): string => {
    return new Date(2000, month - 1, 1).toLocaleString('default', {
      month: 'long',
    })
  }

  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i)

  const getMonthOptions = () => {
    const maxMonth = selectedYear === currentYear ? currentMonth : 12
    return Array.from({ length: maxMonth }, (_, i) => i + 1)
  }

  const InfoButton = ({ infoKey }: { infoKey: InfoKey }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        infoSheet.open(infoKey)
      }}
      className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
      style={{
        backgroundColor: isDark
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.04)',
        color: themeColors.mid,
      }}
      aria-label="More information"
    >
      <Info size={11} strokeWidth={2.4} />
    </button>
  )

  // ─── Loading ───
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div
            className="h-7 w-7 animate-spin rounded-full border-[3px]"
            style={{
              borderColor: themeColors.border,
              borderTopColor: themeColors.green,
            }}
          />
        </div>
      </AppLayout>
    )
  }

  // ─── Error ───
  if (!analytics) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <Frown size={32} strokeWidth={1.5} style={{ color: themeColors.mid }} />
          <p
            className="mt-4 text-[15px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            No analytics data
          </p>
          <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
            We couldn't load your analytics.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-[14px] font-semibold"
            style={{ backgroundColor: themeColors.green, color: '#FFFFFF' }}
          >
            Try again
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* ─── Header ─────────────────────────────────── */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ChevronLeft size={19} style={{ color: themeColors.charcoal }} />
          </button>
          <h1
            className="text-[19px] font-semibold tracking-[-0.01em]"
            style={{ color: themeColors.charcoal }}
          >
            Analytics
          </h1>
        </div>

        {/* ─── Month Selector ─────────────────────────── */}
        <div
          className="mb-5 flex items-center gap-2 rounded-full border p-1.5"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: themeColors.background }}
          >
            <ChevronLeft size={15} style={{ color: themeColors.charcoal }} />
          </button>

          <div className="flex flex-1 items-center justify-center gap-1.5">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="cursor-pointer appearance-none bg-transparent text-center text-[13px] font-medium outline-none"
              style={{ color: themeColors.charcoal }}
            >
              {getMonthOptions().map((month) => (
                <option
                  key={month}
                  value={month}
                  style={{ color: themeColors.charcoal }}
                >
                  {getMonthName(month)}
                </option>
              ))}
            </select>

            <span style={{ color: themeColors.mid }}>·</span>

            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="cursor-pointer appearance-none bg-transparent text-center text-[13px] font-medium outline-none"
              style={{ color: themeColors.charcoal }}
            >
              {yearOptions.map((year) => (
                <option
                  key={year}
                  value={year}
                  style={{ color: themeColors.charcoal }}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={!canGoNext()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: themeColors.background }}
          >
            <ChevronRight size={15} style={{ color: themeColors.charcoal }} />
          </button>
        </div>

        {/* ─── AI Insight — primary ───────────────────── */}
        <PrimaryInsightCard
          insight={analytics.insight}
          themeColors={themeColors}
          isDark={isDark}
        />

        {/* ─── Hero Metric Row ────────────────────────── */}
        <div className="mt-4 space-y-3">
          {/* Protection rate — the loudest number */}
          <div
            className="overflow-hidden rounded-[18px] border p-5"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <p
                    className="text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: themeColors.mid }}
                  >
                    Protection Rate
                  </p>
                  <InfoButton infoKey="protectionRate" />
                </div>
                <p
                  className="mt-1.5 text-[38px] font-bold leading-none tracking-[-0.03em]"
                  style={{
                    color: themeColors.green,
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {analytics.protectedPercentage}%
                </p>
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  of your activity went into protection
                </p>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(15, 185, 110, 0.15)'
                    : 'rgba(15, 185, 110, 0.08)',
                  color: themeColors.green,
                }}
              >
                <Shield size={18} strokeWidth={2} />
              </div>
            </div>

            <div
              className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: themeColors.border }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  backgroundColor: themeColors.green,
                  width: `${Math.min(analytics.protectedPercentage, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Protected / Released / Spent / Remaining grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricTile
              label="Protected"
              value={formatCurrency(analytics.moneyProtected)}
              icon={<Shield size={14} strokeWidth={2} />}
              accent={themeColors.green}
              infoKey="protected"
              onInfo={infoSheet.open}
              themeColors={themeColors}
              isDark={isDark}
            />
            <MetricTile
              label="Released"
              value={formatCurrency(analytics.moneyReleased)}
              icon={<ArrowUpRight size={14} strokeWidth={2} />}
              accent="#3B82F6"
              infoKey="released"
              onInfo={infoSheet.open}
              themeColors={themeColors}
              isDark={isDark}
            />
            <MetricTile
              label="Spent"
              value={formatCurrency(analytics.moneySpent)}
              icon={<ArrowDownRight size={14} strokeWidth={2} />}
              accent="#EF4444"
              infoKey="spent"
              onInfo={infoSheet.open}
              themeColors={themeColors}
              isDark={isDark}
            />
            <MetricTile
              label="Remaining"
              value={formatCurrency(analytics.remaining)}
              icon={<Wallet size={14} strokeWidth={2} />}
              accent={themeColors.charcoal}
              infoKey="remaining"
              onInfo={infoSheet.open}
              themeColors={themeColors}
              isDark={isDark}
            />
          </div>
        </div>

        {/* ─── Additional insights ────────────────────── */}
        {analytics.additionalInsights &&
          analytics.additionalInsights.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles
                  size={14}
                  strokeWidth={2}
                  style={{ color: themeColors.green }}
                />
                <h2
                  className="text-[15px] font-bold tracking-[-0.01em]"
                  style={{ color: themeColors.charcoal }}
                >
                  More insights
                </h2>
              </div>

              <div className="space-y-2.5">
                {analytics.additionalInsights.map((insight) => (
                  <AdditionalInsightCard
                    key={insight.key}
                    insight={insight}
                    themeColors={themeColors}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          )}

        <div className="h-4" />
      </div>

      {/* ───────── Info Bottom Sheet ───────── */}
      <BottomSheet
        isOpen={infoSheet.activeSheet !== null}
        onClose={infoSheet.close}
        title={
          infoSheet.activeSheet
            ? INFO_CONTENT[infoSheet.activeSheet].title
            : ''
        }
        icon={<Info size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={infoSheet.close}
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
        <p
          className="text-[13px] leading-[1.6]"
          style={{ color: themeColors.mid }}
        >
          {infoSheet.activeSheet
            ? INFO_CONTENT[infoSheet.activeSheet].body
            : ''}
        </p>
      </BottomSheet>
    </AppLayout>
  )
}

// ─── Primary Insight Card ─────────────────────────────
function PrimaryInsightCard({
  insight,
  themeColors,
  isDark,
}: {
  insight: AiInsight
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
}) {
  const { accent, bg, border, Icon } = toneStyles(
    insight.tone,
    themeColors,
    isDark
  )

  return (
    <div
      className="relative overflow-hidden rounded-[18px] border p-4"
      style={{
        backgroundColor: bg,
        borderColor: border,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: isDark
              ? `${accent}25`
              : `${accent}15`,
            color: accent,
          }}
        >
          <Icon size={17} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-[14px] font-semibold leading-tight"
            style={{ color: themeColors.charcoal }}
          >
            {insight.headline}
          </p>
          <p
            className="mt-1 text-[12px] leading-[1.55]"
            style={{ color: themeColors.mid }}
          >
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Additional Insight Card ──────────────────────────
function AdditionalInsightCard({
  insight,
  themeColors,
  isDark,
}: {
  insight: AiInsight
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
}) {
  const { accent, Icon } = toneStyles(insight.tone, themeColors, isDark)

  return (
    <div
      className="flex items-start gap-3 rounded-[14px] border p-3.5"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: isDark ? `${accent}20` : `${accent}12`,
          color: accent,
        }}
      >
        <Icon size={13} strokeWidth={2.2} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] font-semibold leading-tight"
          style={{ color: themeColors.charcoal }}
        >
          {insight.headline}
        </p>
        <p
          className="mt-1 text-[11.5px] leading-[1.55]"
          style={{ color: themeColors.mid }}
        >
          {insight.body}
        </p>
      </div>
    </div>
  )
}

// ─── Metric Tile ──────────────────────────────────────
function MetricTile({
  label,
  value,
  icon,
  accent,
  infoKey,
  onInfo,
  themeColors,
  isDark,
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent: string
  infoKey: InfoKey
  onInfo: (key: InfoKey) => void
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
}) {
  return (
    <div
      className="rounded-[14px] border p-3.5"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span style={{ color: accent }}>{icon}</span>
          <span
            className="text-[11px] font-medium"
            style={{ color: themeColors.mid }}
          >
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onInfo(infoKey)}
          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
          style={{
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.04)',
            color: themeColors.mid,
          }}
          aria-label="More information"
        >
          <Info size={11} strokeWidth={2.4} />
        </button>
      </div>
      <p
        className="mt-1.5 text-[15px] font-bold tabular-nums"
        style={{
          color: themeColors.charcoal,
          fontFamily:
            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {value}
      </p>
    </div>
  )
}