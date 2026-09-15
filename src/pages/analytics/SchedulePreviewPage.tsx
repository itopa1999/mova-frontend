import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  CalendarDays,
  Repeat,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  XCircle,
  List,
  Clock,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import { getSchedulePreview } from '../../services/app/preview'
import type {
  PreviewData,
  PreviewRequest,
} from '../../services/app/preview'
import UseScheduleCalendar from '../../components/ui/useScheduleCalendar'

// Frequency types with their string values for API
const FREQUENCY_TYPES = [
  { value: 'once', label: 'Once', icon: Calendar },
  { value: 'hourly', label: 'Hourly', icon: Clock },
  { value: 'daily', label: 'Daily', icon: Repeat },
  { value: 'weekly', label: 'Weekly', icon: CalendarDays },
  { value: 'monthly', label: 'Monthly', icon: Calendar },
  { value: 'quarterly', label: 'Quarterly', icon: Calendar },
  { value: 'yearly', label: 'Yearly', icon: Calendar },
  { value: 'custom', label: 'Custom', icon: Zap },
] as const

type ScheduleType = (typeof FREQUENCY_TYPES)[number]['value']

// Info explanations for each schedule type
const SCHEDULE_INFO: Record<
  ScheduleType,
  { title: string; body: string }
> = {
  once: {
    title: 'Once',
    body:
      'A single release at a specific date and time. Use this for one-off needs — like paying rent, settling a bill, or sending money to your bank on a chosen day.',
  },
  hourly: {
    title: 'Hourly',
    body:
      'Money is released every few hours, starting from your chosen start time. Use this when you want very frequent, controlled access to small amounts — ideal for daily spending without overspending.',
  },
  daily: {
    title: 'Daily',
    body:
      'Money is released once every day on the days you select. Perfect for a fixed daily allowance — like a daily transport budget or pocket money.',
  },
  weekly: {
    title: 'Weekly',
    body:
      'Money is released once every week on the days you select (e.g. every Monday and Friday). Great for weekly groceries, allowances, or scheduled transfers to your bank.',
  },
  monthly: {
    title: 'Monthly',
    body:
      'Money is released once a month on the dates you choose (e.g. the 1st, the 15th, or the last day of the month). Ideal for rent, subscriptions, or monthly bills.',
  },
  quarterly: {
    title: 'Quarterly',
    body:
      'Money is released every three months on the specific months and days you pick. Useful for quarterly bills, servicing fees, or planned savings milestones.',
  },
  yearly: {
    title: 'Yearly',
    body:
      'Money is released once a year on the month(s) and day(s) you choose. Great for annual commitments — like insurance premiums, renewals, or yearly savings goals.',
  },
  custom: {
    title: 'Custom',
    body:
      'Choose your own interval in days. Money is released every N days — for example, every 3 days, every 10 days, or every 21 days. Perfect for flexible schedules that don\'t match a standard pattern.',
  },
}

// Day of week mapping
const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
]

// Month mapping
const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
]

const getCurrentDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCurrentTime = (): string => {
  const now = new Date()
  now.setHours(now.getHours() + 2)
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

interface FrequencyConfig {
  type: string
  onceDate?: string
  daysOfWeek?: number[]
  datesOfMonth?: number[]
  isLastDayOfMonth?: boolean
  months?: number[]
  daysOfMonth?: number[]
  intervalDays?: number
  intervalHours?: number
  time: string
}

export default function SchedulePreview() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  // Schedule type info sheet
  const infoSheet = useBottomSheet<ScheduleType>()

  // Form state
  const [targetAmount, setTargetAmount] = useState<number>(30000)
  const [releaseAmount, setReleaseAmount] = useState<number>(7000)
  const [frequencyType, setFrequencyType] = useState<string>('once')
  const [startDate, setStartDate] = useState<string>(getCurrentDate())
  const [time, setTime] = useState<string>(getCurrentTime())

  const [onceDate, setOnceDate] = useState<string>(getCurrentDate())
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedDates, setSelectedDates] = useState<number[]>([])
  const [isLastDayOfMonth, setIsLastDayOfMonth] = useState<boolean>(false)
  const [selectedMonths, setSelectedMonths] = useState<number[]>([])
  const [intervalDays, setIntervalDays] = useState<number>(3)
  const [intervalHours, setIntervalHours] = useState<number>(1)

  // Response state
  const [response, setResponse] = useState<PreviewData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllReleases, setShowAllReleases] = useState<boolean>(false)
  const [hasPreviewed, setHasPreviewed] = useState<boolean>(false)
  const [scheduleView, setScheduleView] = useState<'list' | 'calendar'>('list')

  const buildFrequencyConfig = (): FrequencyConfig => {
    const config: FrequencyConfig = {
      type: frequencyType,
      time,
    }

    switch (frequencyType) {
      case 'once':
        config.onceDate = `${onceDate}T00:00:00`
        break
      case 'hourly':
        config.intervalHours = intervalHours
        break
      case 'daily':
      case 'weekly':
        config.daysOfWeek = selectedDays
        break
      case 'monthly':
        config.datesOfMonth = selectedDates
        config.isLastDayOfMonth = isLastDayOfMonth
        break
      case 'quarterly':
      case 'yearly':
        config.months = selectedMonths
        config.daysOfMonth = selectedDates
        break
      case 'custom':
        config.intervalDays = intervalDays
        break
    }

    return config
  }

  const handlePreview = async () => {
    setIsLoading(true)
    setError(null)
    setHasPreviewed(true)

    const frequencyConfig = buildFrequencyConfig()
    const formattedStartDate = `${startDate}T${time}:00+01:00`

    const payload: PreviewRequest = {
      targetAmount,
      releaseAmount,
      frequencyType,
      frequencyConfig: JSON.stringify(frequencyConfig),
      startDate: formattedStartDate,
      maxReleases: 50,
    }

    try {
      const result = await getSchedulePreview(payload)

      if (result.is_success && result.data) {
        setResponse(result.data)
        setScheduleView('list')
      } else {
        if (
          result.data &&
          result.data.errors &&
          result.data.errors.length > 0
        ) {
          setResponse(result.data)
          setScheduleView('list')
        } else {
          setError(result.message || 'Failed to generate preview')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateWithTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFrequencyLabel = (type: string): string => {
    const found = FREQUENCY_TYPES.find((f) => f.value === type)
    return found?.label || 'Unknown'
  }

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const toggleDate = (date: number) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    )
  }

  const displayedReleases = showAllReleases
    ? response?.sampleReleaseDates || []
    : response?.sampleReleaseDates?.slice(0, 5) || []

  const calendarSchedule = response
    ? {
        releases: response.sampleReleaseDates.map((release) => ({
          scheduledReleaseId: release.releaseNumber,
          scheduled_for: release.date,
          amount: release.amount,
          is_released: false,
          released_at: '',
          status: 'projected',
          is_projected: true,
        })),
      }
    : null

  const hasErrors = response?.errors && response.errors.length > 0
  const hasWarnings = response?.warnings && response.warnings.length > 0
  const hasIssues = hasErrors || hasWarnings

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>

          <div>
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Schedule Preview
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              Configure your release schedule and preview the timeline
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="rounded-[16px] border p-5"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div>
            <h3
              className="mb-4 text-[15px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Schedule Configuration
            </h3>

            {/* Row 1: Amounts */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-1.5 block text-[13px] font-medium"
                  style={{ color: themeColors.mid }}
                >
                  Target Amount
                </label>
                <div
                  className="flex items-center rounded-[12px] border px-3"
                  style={{
                    borderColor: themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <span
                    className="text-[15px] font-semibold"
                    style={{ color: themeColors.mid }}
                  >
                    ₦
                  </span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full border-0 bg-transparent py-2.5 pl-2 text-[15px] font-medium outline-none"
                    style={{ color: themeColors.charcoal }}
                    min={1000}
                    step={1000}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 block text-[13px] font-medium"
                  style={{ color: themeColors.mid }}
                >
                  Release Amount
                </label>
                <div
                  className="flex items-center rounded-[12px] border px-3"
                  style={{
                    borderColor: themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <span
                    className="text-[15px] font-semibold"
                    style={{ color: themeColors.mid }}
                  >
                    ₦
                  </span>
                  <input
                    type="number"
                    value={releaseAmount}
                    onChange={(e) => setReleaseAmount(Number(e.target.value))}
                    className="w-full border-0 bg-transparent py-2.5 pl-2 text-[15px] font-medium outline-none"
                    style={{ color: themeColors.charcoal }}
                    min={100}
                    step={500}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Schedule Type — with ⓘ badges */}
            <div className="mb-4">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: themeColors.mid }}
              >
                Schedule Type
              </label>

              <div className="grid grid-cols-3 gap-2">
                {FREQUENCY_TYPES.map((freq) => {
                  const Icon = freq.icon
                  const isActive = frequencyType === freq.value

                  return (
                    <div
                      key={freq.value}
                      className="relative"
                    >
                      {/* Main selectable button */}
                      <button
                        type="button"
                        onClick={() => setFrequencyType(freq.value)}
                        className="flex w-full flex-col items-center rounded-[10px] border py-2.5 transition-all"
                        style={{
                          borderColor: isActive
                            ? themeColors.green
                            : themeColors.border,
                          backgroundColor: isActive
                            ? isDark
                              ? 'rgba(15, 185, 110, 0.15)'
                              : 'rgba(15, 185, 110, 0.08)'
                            : 'transparent',
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color: isActive
                              ? themeColors.green
                              : themeColors.mid,
                          }}
                        />
                        <span
                          className="mt-1 text-[11px] font-medium"
                          style={{
                            color: isActive
                              ? themeColors.green
                              : themeColors.mid,
                          }}
                        >
                          {freq.label}
                        </span>
                      </button>

                      {/* ⓘ Info badge — top-right corner */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          infoSheet.open(freq.value as ScheduleType)
                        }}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border transition-all hover:opacity-80 active:scale-90"
                        style={{
                          backgroundColor: themeColors.card,
                          borderColor: themeColors.border,
                          color: themeColors.mid,
                        }}
                        aria-label={`About ${freq.label}`}
                      >
                        <Info size={10} strokeWidth={2.6} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Frequency-specific config */}
            <div className="mb-4">
              {/* Once: Release Date + Time */}
              {frequencyType === 'once' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.mid }}
                    >
                      Release Date
                    </label>
                    <input
                      type="date"
                      value={onceDate}
                      onChange={(e) => setOnceDate(e.target.value)}
                      className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                      style={{
                        borderColor: themeColors.border,
                        backgroundColor: isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',
                        color: themeColors.charcoal,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.mid }}
                    >
                      Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                      style={{
                        borderColor: themeColors.border,
                        backgroundColor: isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',
                        color: themeColors.charcoal,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Hourly */}
              {frequencyType === 'hourly' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.mid }}
                  >
                    Interval (hours)
                  </label>
                  <input
                    type="number"
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(Number(e.target.value))}
                    className="w-full max-w-xs rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                      color: themeColors.charcoal,
                    }}
                    min={1}
                    max={24}
                  />
                </div>
              )}

              {/* Daily / Weekly */}
              {(frequencyType === 'daily' || frequencyType === 'weekly') && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.mid }}
                  >
                    {frequencyType === 'daily'
                      ? 'Select Days'
                      : 'Select Days of Week'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = selectedDays.includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                          style={{
                            backgroundColor: isSelected
                              ? themeColors.green
                              : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#F3F4F6',
                            color: isSelected ? '#FFFFFF' : themeColors.mid,
                          }}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Monthly */}
              {frequencyType === 'monthly' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.mid }}
                  >
                    Dates of Month
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                      const isSelected = selectedDates.includes(date)
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => toggleDate(date)}
                          className="h-9 w-9 rounded-[8px] text-[12px] font-medium transition-all"
                          style={{
                            backgroundColor: isSelected
                              ? themeColors.green
                              : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#F3F4F6',
                            color: isSelected ? '#FFFFFF' : themeColors.mid,
                          }}
                        >
                          {date}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lastDay"
                      checked={isLastDayOfMonth}
                      onChange={(e) => setIsLastDayOfMonth(e.target.checked)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: themeColors.green }}
                    />
                    <label
                      htmlFor="lastDay"
                      className="text-[13px]"
                      style={{ color: themeColors.mid }}
                    >
                      Also release on last day of month
                    </label>
                  </div>
                </div>
              )}

              {/* Quarterly / Yearly */}
              {(frequencyType === 'quarterly' || frequencyType === 'yearly') && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.mid }}
                  >
                    Select Months
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MONTHS.map((month) => {
                      const isSelected = selectedMonths.includes(month.value)
                      return (
                        <button
                          key={month.value}
                          type="button"
                          onClick={() => toggleMonth(month.value)}
                          className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                          style={{
                            backgroundColor: isSelected
                              ? themeColors.green
                              : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#F3F4F6',
                            color: isSelected ? '#FFFFFF' : themeColors.mid,
                          }}
                        >
                          {month.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-3">
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.mid }}
                    >
                      Days of Month
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 3, 7, 10, 15, 20, 25].map((date) => {
                        const isSelected = selectedDates.includes(date)
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => toggleDate(date)}
                            className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                            style={{
                              backgroundColor: isSelected
                                ? themeColors.green
                                : isDark
                                ? 'rgba(255,255,255,0.08)'
                                : '#F3F4F6',
                              color: isSelected ? '#FFFFFF' : themeColors.mid,
                            }}
                          >
                            {date}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom */}
              {frequencyType === 'custom' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.mid }}
                  >
                    Interval (days)
                  </label>
                  <input
                    type="number"
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Number(e.target.value))}
                    className="w-full max-w-xs rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                      color: themeColors.charcoal,
                    }}
                    min={1}
                  />
                </div>
              )}

              {/* Start Date + Time (not shown for once) */}
              {frequencyType !== 'once' && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.mid }}
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                      style={{
                        borderColor: themeColors.border,
                        backgroundColor: isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',
                        color: themeColors.charcoal,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.mid }}
                    >
                      Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                      style={{
                        borderColor: themeColors.border,
                        backgroundColor: isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',
                        color: themeColors.charcoal,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Eye size={20} />
                    Preview Schedule
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mt-4 rounded-[12px] p-3 text-[13px]"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(239, 68, 68, 0.08)',
                  color: '#EF4444',
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          {hasPreviewed && (
            <div
              className="mt-6 border-t pt-6"
              style={{ borderColor: themeColors.border }}
            >
              <h3
                className="mb-4 text-[15px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Preview Results
              </h3>

              {response ? (
                <>
                  {/* Errors & Warnings */}
                  {hasIssues && (
                    <div className="mb-4 space-y-3">
                      {hasErrors && (
                        <div
                          className="rounded-[12px] border p-4"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(239, 68, 68, 0.1)'
                              : 'rgba(239, 68, 68, 0.05)',
                            borderColor: '#EF4444',
                          }}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <XCircle size={18} style={{ color: '#EF4444' }} />
                            <span
                              className="text-[14px] font-semibold"
                              style={{ color: '#EF4444' }}
                            >
                              {response.errors.length} Error
                              {response.errors.length > 1 ? 's' : ''} Found
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {response.errors.map((errorMsg, index) => (
                              <p
                                key={index}
                                className="flex items-start gap-2 text-[13px]"
                                style={{ color: '#EF4444' }}
                              >
                                <span className="mt-1">•</span>
                                <span>{errorMsg}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasWarnings && (
                        <div
                          className="rounded-[12px] border p-4"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(251, 191, 36, 0.1)'
                              : 'rgba(251, 191, 36, 0.05)',
                            borderColor: '#F59E0B',
                          }}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <AlertCircle
                              size={18}
                              style={{ color: '#F59E0B' }}
                            />
                            <span
                              className="text-[14px] font-semibold"
                              style={{ color: '#F59E0B' }}
                            >
                              {response.warnings.length} Warning
                              {response.warnings.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {response.warnings.map((warning, index) => (
                              <p
                                key={index}
                                className="flex items-start gap-2 text-[13px]"
                                style={{ color: '#D97706' }}
                              >
                                <span className="mt-1">•</span>
                                <span>{warning}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schedule details */}
                  {!hasErrors ? (
                    <>
                      {/* Summary Cards */}
                      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div
                          className="rounded-[12px] p-3 text-center"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.05)'
                              : '#F9FAFB',
                          }}
                        >
                          <p
                            className="text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            Total Releases
                          </p>
                          <p
                            className="text-[20px] font-bold"
                            style={{ color: themeColors.charcoal }}
                          >
                            {response.totalReleases}
                          </p>
                        </div>

                        <div
                          className="rounded-[12px] p-3 text-center"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.05)'
                              : '#F9FAFB',
                          }}
                        >
                          <p
                            className="text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            Total Amount
                          </p>
                          <p
                            className="text-[20px] font-bold"
                            style={{ color: themeColors.green }}
                          >
                            {formatCurrency(response.totalAmount)}
                          </p>
                        </div>

                        <div
                          className="rounded-[12px] p-3 text-center"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.05)'
                              : '#F9FAFB',
                          }}
                        >
                          <p
                            className="text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            First Release
                          </p>
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: themeColors.charcoal }}
                          >
                            {formatDate(response.firstReleaseDate)}
                          </p>
                        </div>

                        <div
                          className="rounded-[12px] p-3 text-center"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.05)'
                              : '#F9FAFB',
                          }}
                        >
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
                            {formatDate(response.computedEndDate)}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div
                        className="mb-4 rounded-[12px] p-3"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(15, 185, 110, 0.1)'
                            : 'rgba(15, 185, 110, 0.06)',
                          borderColor: isDark
                            ? 'rgba(15, 185, 110, 0.2)'
                            : 'rgba(15, 185, 110, 0.15)',
                          borderWidth: 1,
                        }}
                      >
                        <p className="flex items-start gap-2 text-[13px]">
                          <Info
                            size={16}
                            style={{
                              color: themeColors.green,
                              marginTop: 2,
                            }}
                          />
                          <span style={{ color: themeColors.charcoal }}>
                            {response.description}
                          </span>
                        </p>
                      </div>

                      {/* Frequency Info */}
                      <div className="mb-4 flex flex-wrap items-center gap-4 text-[13px]">
                        <span style={{ color: themeColors.mid }}>
                          Frequency:{' '}
                          <strong style={{ color: themeColors.charcoal }}>
                            {getFrequencyLabel(response.frequencyType)}
                          </strong>
                        </span>
                        <span style={{ color: themeColors.mid }}>
                          Regular Amount:{' '}
                          <strong style={{ color: themeColors.charcoal }}>
                            {formatCurrency(response.regularReleaseAmount)}
                          </strong>
                        </span>
                        {response.finalReleaseAmount !==
                          response.regularReleaseAmount && (
                          <span style={{ color: themeColors.mid }}>
                            Final Amount:{' '}
                            <strong style={{ color: themeColors.green }}>
                              {formatCurrency(response.finalReleaseAmount)}
                            </strong>
                          </span>
                        )}
                      </div>

                      {/* Release Schedule */}
                      {response.sampleReleaseDates.length > 0 && (
                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <p
                              className="text-[13px] font-medium"
                              style={{ color: themeColors.mid }}
                            >
                              Release Schedule
                            </p>

                            <div
                              className="flex items-center gap-1 rounded-[10px] border p-1"
                              style={{
                                borderColor: themeColors.border,
                                backgroundColor: isDark
                                  ? 'rgba(255,255,255,0.04)'
                                  : '#F9FAFB',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => setScheduleView('list')}
                                className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium transition-all"
                                style={{
                                  backgroundColor:
                                    scheduleView === 'list'
                                      ? themeColors.green
                                      : 'transparent',
                                  color:
                                    scheduleView === 'list'
                                      ? '#FFFFFF'
                                      : themeColors.mid,
                                }}
                              >
                                <List size={13} />
                                List
                              </button>
                              <button
                                type="button"
                                onClick={() => setScheduleView('calendar')}
                                className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium transition-all"
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
                                <CalendarDays size={13} />
                                Calendar
                              </button>
                            </div>
                          </div>

                          {scheduleView === 'list' && (
                            <>
                              {response.sampleReleaseDates.length > 5 && (
                                <div className="mb-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowAllReleases(!showAllReleases)
                                    }
                                    className="flex items-center gap-1 text-[12px] font-semibold transition-opacity hover:opacity-70"
                                    style={{ color: themeColors.green }}
                                  >
                                    {showAllReleases ? (
                                      <>
                                        Show Less <ChevronUp size={14} />
                                      </>
                                    ) : (
                                      <>
                                        Show All (
                                        {response.sampleReleaseDates.length})
                                        <ChevronDown size={14} />
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
                                {displayedReleases.map((release, index) => {
                                  const isFinal =
                                    index === displayedReleases.length - 1

                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between rounded-[10px] border p-3 transition-all"
                                      style={{
                                        borderColor: isFinal
                                          ? themeColors.green
                                          : themeColors.border,
                                        backgroundColor: isFinal
                                          ? isDark
                                            ? 'rgba(15, 185, 110, 0.1)'
                                            : 'rgba(15, 185, 110, 0.04)'
                                          : 'transparent',
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span
                                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                                          style={{
                                            backgroundColor: isFinal
                                              ? themeColors.green
                                              : isDark
                                              ? 'rgba(255,255,255,0.08)'
                                              : '#F3F4F6',
                                            color: isFinal
                                              ? '#FFFFFF'
                                              : themeColors.mid,
                                          }}
                                        >
                                          {release.releaseNumber}
                                        </span>
                                        <div>
                                          <p
                                            className="text-[13px] font-medium"
                                            style={{
                                              color: themeColors.charcoal,
                                            }}
                                          >
                                            {formatDateWithTime(release.date)}
                                          </p>
                                          <p
                                            className="text-[11px]"
                                            style={{ color: themeColors.mid }}
                                          >
                                            Cumulative:{' '}
                                            {formatCurrency(
                                              release.cumulativeAmount
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p
                                          className="text-[14px] font-semibold"
                                          style={{
                                            color: isFinal
                                              ? themeColors.green
                                              : themeColors.charcoal,
                                          }}
                                        >
                                          {formatCurrency(release.amount)}
                                        </p>
                                        {isFinal && (
                                          <p
                                            className="text-[10px] font-medium"
                                            style={{
                                              color: themeColors.green,
                                            }}
                                          >
                                            Final Release
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </>
                          )}

                          {scheduleView === 'calendar' && calendarSchedule && (
                            <UseScheduleCalendar schedule={calendarSchedule} />
                          )}
                        </div>
                      )}

                      {/* Valid Indicator */}
                      <div
                        className="mt-4 flex items-center gap-2 rounded-[12px] p-3"
                        style={{
                          backgroundColor: response.isValid
                            ? isDark
                              ? 'rgba(15, 185, 110, 0.1)'
                              : 'rgba(15, 185, 110, 0.06)'
                            : isDark
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(239, 68, 68, 0.06)',
                        }}
                      >
                        {response.isValid ? (
                          <>
                            <CheckCircle
                              size={18}
                              style={{ color: themeColors.green }}
                            />
                            <span
                              className="text-[13px] font-medium"
                              style={{ color: themeColors.green }}
                            >
                              Schedule is valid
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle
                              size={18}
                              style={{ color: '#EF4444' }}
                            />
                            <span
                              className="text-[13px] font-medium"
                              style={{ color: '#EF4444' }}
                            >
                              Schedule has errors
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-8 text-center"
                      style={{ color: themeColors.mid }}
                    >
                      <XCircle
                        size={48}
                        strokeWidth={1.5}
                        style={{ color: '#EF4444' }}
                      />
                      <p
                        className="mt-3 text-[14px] font-medium"
                        style={{ color: '#EF4444' }}
                      >
                        Please fix the errors above to see the schedule preview
                      </p>
                      <p className="mt-1 text-[12px]">
                        Adjust your configuration and click "Preview Schedule"
                        again
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-8 text-center"
                  style={{ color: themeColors.mid }}
                >
                  <Calendar size={40} strokeWidth={1.5} />
                  <p className="mt-3 text-[14px] font-medium">
                    No preview data available
                  </p>
                  <p className="mt-1 text-[12px]">
                    Configure your schedule and click "Preview Schedule"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ───────── Schedule Info Bottom Sheet ───────── */}
      <BottomSheet
        isOpen={infoSheet.activeSheet !== null}
        onClose={infoSheet.close}
        title={
          infoSheet.activeSheet
            ? SCHEDULE_INFO[infoSheet.activeSheet].title
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
          className="text-[13px] leading-[1.65]"
          style={{ color: themeColors.mid }}
        >
          {infoSheet.activeSheet
            ? SCHEDULE_INFO[infoSheet.activeSheet].body
            : ''}
        </p>
      </BottomSheet>
    </AppLayout>
  )
}