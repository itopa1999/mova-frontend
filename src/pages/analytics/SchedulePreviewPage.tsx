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
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { getSchedulePreview } from '../../services/app/preview'
import type {
  PreviewData,
  PreviewRequest,
} from '../../services/app/preview'
import UseScheduleCalendar from '../../components/ui/useScheduleCalendar'

// Frequency types with their string values for API
const FREQUENCY_TYPES = [
  {
    value: 'once',
    label: 'Once',
    icon: Calendar,
  },
  {
    value: 'daily',
    label: 'Daily',
    icon: Repeat,
  },
  {
    value: 'weekly',
    label: 'Weekly',
    icon: CalendarDays,
  },
  {
    value: 'monthly',
    label: 'Monthly',
    icon: Calendar,
  },
  {
    value: 'quarterly',
    label: 'Quarterly',
    icon: Calendar,
  },
  {
    value: 'yearly',
    label: 'Yearly',
    icon: Calendar,
  },
  {
    value: 'custom',
    label: 'Custom',
    icon: Zap,
  },
]

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

// Get current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get current time in HH:mm format
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
  time: string
}

export default function SchedulePreview() {
  const navigate = useNavigate()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  // Form state - defaults to current date/time
  const [targetAmount, setTargetAmount] =
    useState<number>(30000)

  const [releaseAmount, setReleaseAmount] =
    useState<number>(7000)

  const [frequencyType, setFrequencyType] =
    useState<string>('once')

  const [startDate, setStartDate] =
    useState<string>(getCurrentDate())

  const [time, setTime] =
    useState<string>(getCurrentTime())

  // Frequency config state - no pre-selected values
  const [onceDate, setOnceDate] =
    useState<string>(getCurrentDate())

  const [selectedDays, setSelectedDays] =
    useState<number[]>([])

  const [selectedDates, setSelectedDates] =
    useState<number[]>([])

  const [isLastDayOfMonth, setIsLastDayOfMonth] =
    useState<boolean>(false)

  const [selectedMonths, setSelectedMonths] =
    useState<number[]>([])

  const [intervalDays, setIntervalDays] =
    useState<number>(3)

  // Response state
  const [response, setResponse] =
    useState<PreviewData | null>(null)

  const [isLoading, setIsLoading] =
    useState<boolean>(false)

  const [error, setError] =
    useState<string | null>(null)

  const [showAllReleases, setShowAllReleases] =
    useState<boolean>(false)

  const [hasPreviewed, setHasPreviewed] =
    useState<boolean>(false)

  // List / Calendar view
  const [scheduleView, setScheduleView] =
    useState<'list' | 'calendar'>('list')

  // Build frequency config based on type
  const buildFrequencyConfig =
    (): FrequencyConfig => {
      const config: FrequencyConfig = {
        type: frequencyType,
        time,
      }

      switch (frequencyType) {
        case 'once':
          config.onceDate =
            `${onceDate}T00:00:00`
          break

        case 'daily':
        case 'weekly':
          config.daysOfWeek =
            selectedDays
          break

        case 'monthly':
          config.datesOfMonth =
            selectedDates

          config.isLastDayOfMonth =
            isLastDayOfMonth
          break

        case 'quarterly':
        case 'yearly':
          config.months =
            selectedMonths

          config.daysOfMonth =
            selectedDates
          break

        case 'custom':
          config.intervalDays =
            intervalDays
          break
      }

      return config
    }

  // Submit preview request
  const handlePreview =
    async () => {
      setIsLoading(true)

      setError(null)

      setHasPreviewed(true)

      const frequencyConfig =
        buildFrequencyConfig()

      // Format start date with timezone
      const formattedStartDate =
        `${startDate}T${time}:00+01:00`

      const payload: PreviewRequest = {
        targetAmount,
        releaseAmount,
        frequencyType,
        frequencyConfig:
          JSON.stringify(
            frequencyConfig
          ),
        startDate:
          formattedStartDate,
        maxReleases: 50,
      }

      try {
        const result =
          await getSchedulePreview(
            payload
          )

        if (
          result.is_success &&
          result.data
        ) {
          setResponse(
            result.data
          )

          // Always return to list
          // after generating a new preview.
          setScheduleView('list')
        } else {
          // If the response has data
          // with errors, show them.
          if (
            result.data &&
            result.data.errors &&
            result.data.errors.length >
              0
          ) {
            setResponse(
              result.data
            )

            setScheduleView('list')
          } else {
            setError(
              result.message ||
                'Failed to generate preview'
            )
          }
        }
      } catch (err) {
        setError(
          'An unexpected error occurred. Please try again.'
        )
      } finally {
        setIsLoading(false)
      }
    }

  const formatCurrency = (
    amount: number
  ): string => {
    return new Intl.NumberFormat(
      'en-NG',
      {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    ).format(amount)
  }

  const formatDate = (
    dateString: string
  ): string => {
    const date =
      new Date(dateString)

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    )
  }

  const formatDateWithTime = (
    dateString: string
  ): string => {
    const date =
      new Date(dateString)

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  const getFrequencyLabel = (
    type: string
  ): string => {
    const found =
      FREQUENCY_TYPES.find(
        (f) => f.value === type
      )

    return (
      found?.label ||
      'Unknown'
    )
  }

  const toggleDay = (
    day: number
  ) => {
    setSelectedDays(
      (prev) =>
        prev.includes(day)
          ? prev.filter(
              (d) => d !== day
            )
          : [
              ...prev,
              day,
            ]
    )
  }

  const toggleDate = (
    date: number
  ) => {
    setSelectedDates(
      (prev) =>
        prev.includes(date)
          ? prev.filter(
              (d) => d !== date
            )
          : [
              ...prev,
              date,
            ]
    )
  }

  const toggleMonth = (
    month: number
  ) => {
    setSelectedMonths(
      (prev) =>
        prev.includes(month)
          ? prev.filter(
              (m) => m !== month
            )
          : [
              ...prev,
              month,
            ]
    )
  }

  const displayedReleases =
    showAllReleases
      ? response?.sampleReleaseDates ||
        []
      : response?.sampleReleaseDates?.slice(
          0,
          5
        ) || []

  // Convert the preview response
  // into the structure expected by
  // UseScheduleCalendar.
  const calendarSchedule =
    response
      ? {
          releases:
            response.sampleReleaseDates.map(
              (release) => ({
                scheduledReleaseId:
                  release.releaseNumber,

                scheduled_for:
                  release.date,

                amount:
                  release.amount,

                is_released:
                  false,

                released_at:
                  '',

                status:
                  'projected',

                is_projected:
                  true,
              })
            ),
        }
      : null

  // Check if there are any errors
  // or warnings.
  const hasErrors =
    response?.errors &&
    response.errors.length > 0

  const hasWarnings =
    response?.warnings &&
    response.warnings.length > 0

  const hasIssues =
    hasErrors ||
    hasWarnings

  return (
    <AppLayout>
      <div
        className="py-5"
        style={{
          color:
            themeColors.charcoal,
        }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor:
                themeColors.border,

              backgroundColor:
                themeColors.card,
            }}
          >
            <ArrowLeft
              size={20}
              style={{
                color:
                  themeColors.charcoal,
              }}
            />
          </button>

          <div>
            <h2
              className="text-[20px] font-bold"
              style={{
                color:
                  themeColors.charcoal,
              }}
            >
              Schedule Preview
            </h2>

            <p
              className="text-[13px]"
              style={{
                color:
                  themeColors.mid,
              }}
            >
              Configure your release
              schedule and preview
              the timeline
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="rounded-[16px] border p-5"
          style={{
            backgroundColor:
              themeColors.card,

            borderColor:
              themeColors.border,
          }}
        >
          {/* Configuration Section */}
          <div>
            <h3
              className="mb-4 text-[15px] font-semibold"
              style={{
                color:
                  themeColors.charcoal,
              }}
            >
              Schedule Configuration
            </h3>

            {/* Row 1 */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              {/* Target Amount */}
              <div>
                <label
                  className="mb-1.5 block text-[13px] font-medium"
                  style={{
                    color:
                      themeColors.mid,
                  }}
                >
                  Target Amount
                </label>

                <div
                  className="flex items-center rounded-[12px] border px-3"
                  style={{
                    borderColor:
                      themeColors.border,

                    backgroundColor:
                      isDark
                        ? 'rgba(0,0,0,0.3)'
                        : '#F9FAFB',
                  }}
                >
                  <span
                    className="text-[15px] font-semibold"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    ₦
                  </span>

                  <input
                    type="number"
                    value={
                      targetAmount
                    }
                    onChange={(e) =>
                      setTargetAmount(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full border-0 bg-transparent py-2.5 pl-2 text-[15px] font-medium outline-none"
                    style={{
                      color:
                        themeColors.charcoal,
                    }}
                    min={1000}
                    step={1000}
                  />
                </div>
              </div>

              {/* Release Amount */}
              <div>
                <label
                  className="mb-1.5 block text-[13px] font-medium"
                  style={{
                    color:
                      themeColors.mid,
                  }}
                >
                  Release Amount
                </label>

                <div
                  className="flex items-center rounded-[12px] border px-3"
                  style={{
                    borderColor:
                      themeColors.border,

                    backgroundColor:
                      isDark
                        ? 'rgba(0,0,0,0.3)'
                        : '#F9FAFB',
                  }}
                >
                  <span
                    className="text-[15px] font-semibold"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    ₦
                  </span>

                  <input
                    type="number"
                    value={
                      releaseAmount
                    }
                    onChange={(e) =>
                      setReleaseAmount(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full border-0 bg-transparent py-2.5 pl-2 text-[15px] font-medium outline-none"
                    style={{
                      color:
                        themeColors.charcoal,
                    }}
                    min={100}
                    step={500}
                  />
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="mb-4">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{
                  color:
                    themeColors.mid,
                }}
              >
                Schedule Type
              </label>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
                {FREQUENCY_TYPES.map(
                  (freq) => {
                    const Icon =
                      freq.icon

                    const isActive =
                      frequencyType ===
                      freq.value

                    return (
                      <button
                        type="button"
                        key={
                          freq.value
                        }
                        onClick={() =>
                          setFrequencyType(
                            freq.value
                          )
                        }
                        className="flex flex-col items-center rounded-[10px] border py-2.5 transition-all"
                        style={{
                          borderColor:
                            isActive
                              ? themeColors.green
                              : themeColors.border,

                          backgroundColor:
                            isActive
                              ? isDark
                                ? 'rgba(15, 185, 110, 0.15)'
                                : 'rgba(15, 185, 110, 0.08)'
                              : 'transparent',
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color:
                              isActive
                                ? themeColors.green
                                : themeColors.mid,
                          }}
                        />

                        <span
                          className="mt-1 text-[11px] font-medium"
                          style={{
                            color:
                              isActive
                                ? themeColors.green
                                : themeColors.mid,
                          }}
                        >
                          {
                            freq.label
                          }
                        </span>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Frequency-specific config */}
            <div className="mb-4">
              {/* Once */}
              {frequencyType ===
                'once' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    Release Date
                  </label>

                  <input
                    type="date"
                    value={
                      onceDate
                    }
                    onChange={(e) =>
                      setOnceDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor:
                        themeColors.border,

                      backgroundColor:
                        isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',

                      color:
                        themeColors.charcoal,
                    }}
                  />
                </div>
              )}

              {/* Daily / Weekly */}
              {(frequencyType ===
                'daily' ||
                frequencyType ===
                  'weekly') && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    {frequencyType ===
                    'daily'
                      ? 'Select Days'
                      : 'Select Days of Week'}
                  </label>

                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map(
                      (day) => {
                        const isSelected =
                          selectedDays.includes(
                            day.value
                          )

                        return (
                          <button
                            type="button"
                            key={
                              day.value
                            }
                            onClick={() =>
                              toggleDay(
                                day.value
                              )
                            }
                            className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                            style={{
                              backgroundColor:
                                isSelected
                                  ? themeColors.green
                                  : isDark
                                  ? 'rgba(255,255,255,0.08)'
                                  : '#F3F4F6',

                              color:
                                isSelected
                                  ? '#FFFFFF'
                                  : themeColors.mid,
                            }}
                          >
                            {
                              day.label
                            }
                          </button>
                        )
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Monthly */}
              {frequencyType ===
                'monthly' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    Dates of Month
                  </label>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(
                      {
                        length: 31,
                      },
                      (_, i) =>
                        i + 1
                    ).map(
                      (date) => {
                        const isSelected =
                          selectedDates.includes(
                            date
                          )

                        return (
                          <button
                            type="button"
                            key={date}
                            onClick={() =>
                              toggleDate(
                                date
                              )
                            }
                            className="h-9 w-9 rounded-[8px] text-[12px] font-medium transition-all"
                            style={{
                              backgroundColor:
                                isSelected
                                  ? themeColors.green
                                  : isDark
                                  ? 'rgba(255,255,255,0.08)'
                                  : '#F3F4F6',

                              color:
                                isSelected
                                  ? '#FFFFFF'
                                  : themeColors.mid,
                            }}
                          >
                            {
                              date
                            }
                          </button>
                        )
                      }
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lastDay"
                      checked={
                        isLastDayOfMonth
                      }
                      onChange={(e) =>
                        setIsLastDayOfMonth(
                          e.target
                            .checked
                        )
                      }
                      className="h-4 w-4 rounded"
                      style={{
                        accentColor:
                          themeColors.green,
                      }}
                    />

                    <label
                      htmlFor="lastDay"
                      className="text-[13px]"
                      style={{
                        color:
                          themeColors.mid,
                      }}
                    >
                      Also release on last
                      day of month
                    </label>
                  </div>
                </div>
              )}

              {/* Quarterly / Yearly */}
              {(frequencyType ===
                'quarterly' ||
                frequencyType ===
                  'yearly') && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    Select Months
                  </label>

                  <div className="flex flex-wrap gap-1.5">
                    {MONTHS.map(
                      (month) => {
                        const isSelected =
                          selectedMonths.includes(
                            month.value
                          )

                        return (
                          <button
                            type="button"
                            key={
                              month.value
                            }
                            onClick={() =>
                              toggleMonth(
                                month.value
                              )
                            }
                            className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                            style={{
                              backgroundColor:
                                isSelected
                                  ? themeColors.green
                                  : isDark
                                  ? 'rgba(255,255,255,0.08)'
                                  : '#F3F4F6',

                              color:
                                isSelected
                                  ? '#FFFFFF'
                                  : themeColors.mid,
                            }}
                          >
                            {
                              month.label
                            }
                          </button>
                        )
                      }
                    )}
                  </div>

                  <div className="mt-3">
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{
                        color:
                          themeColors.mid,
                      }}
                    >
                      Days of Month
                    </label>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        1,
                        3,
                        7,
                        10,
                        15,
                        20,
                        25,
                      ].map(
                        (date) => {
                          const isSelected =
                            selectedDates.includes(
                              date
                            )

                          return (
                            <button
                              type="button"
                              key={date}
                              onClick={() =>
                                toggleDate(
                                  date
                                )
                              }
                              className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                              style={{
                                backgroundColor:
                                  isSelected
                                    ? themeColors.green
                                    : isDark
                                    ? 'rgba(255,255,255,0.08)'
                                    : '#F3F4F6',

                                color:
                                  isSelected
                                    ? '#FFFFFF'
                                    : themeColors.mid,
                              }}
                            >
                              {
                                date
                              }
                            </button>
                          )
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom */}
              {frequencyType ===
                'custom' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    Interval (days)
                  </label>

                  <input
                    type="number"
                    value={
                      intervalDays
                    }
                    onChange={(e) =>
                      setIntervalDays(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full max-w-xs rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor:
                        themeColors.border,

                      backgroundColor:
                        isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',

                      color:
                        themeColors.charcoal,
                    }}
                    min={1}
                  />
                </div>
              )}

              {/* Start Date & Time */}
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={
                      startDate
                    }
                    onChange={(e) =>
                      setStartDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor:
                        themeColors.border,

                      backgroundColor:
                        isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',

                      color:
                        themeColors.charcoal,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{
                      color:
                        themeColors.mid,
                    }}
                  >
                    Time
                  </label>

                  <input
                    type="time"
                    value={time}
                    onChange={(e) =>
                      setTime(
                        e.target.value
                      )
                    }
                    className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor:
                        themeColors.border,

                      backgroundColor:
                        isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',

                      color:
                        themeColors.charcoal,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Preview Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={
                  handlePreview
                }
                disabled={
                  isLoading
                }
                className="flex w-full items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{
                  backgroundColor:
                    themeColors.green,

                  color:
                    '#FFFFFF',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    Generating
                    Preview...
                  </>
                ) : (
                  <>
                    <Eye
                      size={20}
                    />

                    Preview
                    Schedule
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mt-4 rounded-[12px] p-3 text-[13px]"
                style={{
                  backgroundColor:
                    isDark
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(239, 68, 68, 0.08)',

                  color:
                    '#EF4444',
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
              style={{
                borderColor:
                  themeColors.border,
              }}
            >
              <h3
                className="mb-4 text-[15px] font-semibold"
                style={{
                  color:
                    themeColors.charcoal,
                }}
              >
                Preview Results
              </h3>

              {response ? (
                <>
                  {/* Errors & Warnings */}
                  {hasIssues && (
                    <div className="mb-4 space-y-3">
                      {/* Errors */}
                      {hasErrors && (
                        <div
                          className="rounded-[12px] border p-4"
                          style={{
                            backgroundColor:
                              isDark
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(239, 68, 68, 0.05)',

                            borderColor:
                              '#EF4444',
                          }}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <XCircle
                              size={18}
                              style={{
                                color:
                                  '#EF4444',
                              }}
                            />

                            <span
                              className="text-[14px] font-semibold"
                              style={{
                                color:
                                  '#EF4444',
                              }}
                            >
                              {
                                response
                                  .errors
                                  .length
                              }{' '}
                              Error
                              {response.errors
                                .length >
                              1
                                ? 's'
                                : ''}{' '}
                              Found
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {response.errors.map(
                              (
                                errorMsg,
                                index
                              ) => (
                                <p
                                  key={
                                    index
                                  }
                                  className="flex items-start gap-2 text-[13px]"
                                  style={{
                                    color:
                                      '#EF4444',
                                  }}
                                >
                                  <span className="mt-1">
                                    •
                                  </span>

                                  <span>
                                    {
                                      errorMsg
                                    }
                                  </span>
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Warnings */}
                      {hasWarnings && (
                        <div
                          className="rounded-[12px] border p-4"
                          style={{
                            backgroundColor:
                              isDark
                                ? 'rgba(251, 191, 36, 0.1)'
                                : 'rgba(251, 191, 36, 0.05)',

                            borderColor:
                              '#F59E0B',
                          }}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <AlertCircle
                              size={18}
                              style={{
                                color:
                                  '#F59E0B',
                              }}
                            />

                            <span
                              className="text-[14px] font-semibold"
                              style={{
                                color:
                                  '#F59E0B',
                              }}
                            >
                              {
                                response
                                  .warnings
                                  .length
                              }{' '}
                              Warning
                              {response.warnings
                                .length >
                              1
                                ? 's'
                                : ''}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {response.warnings.map(
                              (
                                warning,
                                index
                              ) => (
                                <p
                                  key={
                                    index
                                  }
                                  className="flex items-start gap-2 text-[13px]"
                                  style={{
                                    color:
                                      '#D97706',
                                  }}
                                >
                                  <span className="mt-1">
                                    •
                                  </span>

                                  <span>
                                    {
                                      warning
                                    }
                                  </span>
                                </p>
                              )
                            )}
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
                        {/* Total Releases */}
                        <div
                          className="rounded-[12px] p-3 text-center"
                          style={{
                            backgroundColor:
                              isDark
                                ? 'rgba(255,255,255,0.05)'
                                : '#F9FAFB',
                          }}
                        >
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                themeColors.mid,
                            }}
                          >
                            Total Releases
                          </p>

                          <p
                            className="text-[20px] font-bold"
                            style={{
                              color:
                                themeColors.charcoal,
                            }}
                          >
                            {
                              response.totalReleases
                            }
                          </p>
                        </div>

                        {/* Total Amount */}
                        <div
                          className="rounded-[12px] p-3 text-center"
                          style={{
                            backgroundColor:
                              isDark
                                ? 'rgba(255,255,255,0.05)'
                                : '#F9FAFB',
                          }}
                        >
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                themeColors.mid,
                            }}
                          >
                            Total Amount
                          </p>

                          <p
                            className="text-[20px] font-bold"
                            style={{
                              color:
                                themeColors.green,
                            }}
                          >
                            {formatCurrency(
                              response.totalAmount
                            )}
                          </p>
                        </div>

                        {/* First Release */}
                        <div
                          className="rounded-[12px] p-3 text-center"
                          style={{
                            backgroundColor:
                              isDark
                                ? 'rgba(255,255,255,0.05)'
                                : '#F9FAFB',
                          }}
                        >
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                themeColors.mid,
                            }}
                          >
                            First Release
                          </p>

                          <p
                            className="text-[13px] font-semibold"
                            style={{
                              color:
                                themeColors.charcoal,
                            }}
                          >
                            {formatDate(
                              response.firstReleaseDate
                            )}
                          </p>
                        </div>

                        {/* End Date */}
                        <div
                          className="rounded-[12px] p-3 text-center"
                          style={{
                            backgroundColor:
                              isDark
                                ? 'rgba(255,255,255,0.05)'
                                : '#F9FAFB',
                          }}
                        >
                          <p
                            className="text-[11px]"
                            style={{
                              color:
                                themeColors.mid,
                            }}
                          >
                            End Date
                          </p>

                          <p
                            className="text-[13px] font-semibold"
                            style={{
                              color:
                                themeColors.charcoal,
                            }}
                          >
                            {formatDate(
                              response.computedEndDate
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div
                        className="mb-4 rounded-[12px] p-3"
                        style={{
                          backgroundColor:
                            isDark
                              ? 'rgba(15, 185, 110, 0.1)'
                              : 'rgba(15, 185, 110, 0.06)',

                          borderColor:
                            isDark
                              ? 'rgba(15, 185, 110, 0.2)'
                              : 'rgba(15, 185, 110, 0.15)',

                          borderWidth: 1,
                        }}
                      >
                        <p className="flex items-start gap-2 text-[13px]">
                          <Info
                            size={16}
                            style={{
                              color:
                                themeColors.green,
                              marginTop: 2,
                            }}
                          />

                          <span
                            style={{
                              color:
                                themeColors.charcoal,
                            }}
                          >
                            {
                              response.description
                            }
                          </span>
                        </p>
                      </div>

                      {/* Frequency Info */}
                      <div className="mb-4 flex flex-wrap items-center gap-4 text-[13px]">
                        <span
                          style={{
                            color:
                              themeColors.mid,
                          }}
                        >
                          Frequency:{' '}
                          <strong
                            style={{
                              color:
                                themeColors.charcoal,
                            }}
                          >
                            {getFrequencyLabel(
                              response.frequencyType
                            )}
                          </strong>
                        </span>

                        <span
                          style={{
                            color:
                              themeColors.mid,
                          }}
                        >
                          Regular Amount:{' '}
                          <strong
                            style={{
                              color:
                                themeColors.charcoal,
                            }}
                          >
                            {formatCurrency(
                              response.regularReleaseAmount
                            )}
                          </strong>
                        </span>

                        {response.finalReleaseAmount !==
                          response.regularReleaseAmount && (
                          <span
                            style={{
                              color:
                                themeColors.mid,
                            }}
                          >
                            Final Amount:{' '}
                            <strong
                              style={{
                                color:
                                  themeColors.green,
                              }}
                            >
                              {formatCurrency(
                                response.finalReleaseAmount
                              )}
                            </strong>
                          </span>
                        )}
                      </div>

                      {/* Release Schedule */}
                      {response
                        .sampleReleaseDates
                        .length >
                        0 && (
                        <div>
                          {/* Schedule Header */}
                          <div className="mb-3 flex items-center justify-between">
                            <p
                              className="text-[13px] font-medium"
                              style={{
                                color:
                                  themeColors.mid,
                              }}
                            >
                              Release Schedule
                            </p>

                            {/* View Toggle */}
                            <div
                              className="flex items-center gap-1 rounded-[10px] border p-1"
                              style={{
                                borderColor:
                                  themeColors.border,

                                backgroundColor:
                                  isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : '#F9FAFB',
                              }}
                            >
                              {/* List */}
                              <button
                                type="button"
                                onClick={() =>
                                  setScheduleView(
                                    'list'
                                  )
                                }
                                className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium transition-all"
                                style={{
                                  backgroundColor:
                                    scheduleView ===
                                    'list'
                                      ? themeColors.green
                                      : 'transparent',

                                  color:
                                    scheduleView ===
                                    'list'
                                      ? '#FFFFFF'
                                      : themeColors.mid,
                                }}
                              >
                                <List
                                  size={13}
                                />

                                List
                              </button>

                              {/* Calendar */}
                              <button
                                type="button"
                                onClick={() =>
                                  setScheduleView(
                                    'calendar'
                                  )
                                }
                                className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[11px] font-medium transition-all"
                                style={{
                                  backgroundColor:
                                    scheduleView ===
                                    'calendar'
                                      ? themeColors.green
                                      : 'transparent',

                                  color:
                                    scheduleView ===
                                    'calendar'
                                      ? '#FFFFFF'
                                      : themeColors.mid,
                                }}
                              >
                                <CalendarDays
                                  size={13}
                                />

                                Calendar
                              </button>
                            </div>
                          </div>

                          {/* List View */}
                          {scheduleView ===
                            'list' && (
                            <>
                              {/* Show All */}
                              {response
                                .sampleReleaseDates
                                .length >
                                5 && (
                                <div className="mb-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowAllReleases(
                                        !showAllReleases
                                      )
                                    }
                                    className="flex items-center gap-1 text-[12px] font-semibold transition-opacity hover:opacity-70"
                                    style={{
                                      color:
                                        themeColors.green,
                                    }}
                                  >
                                    {showAllReleases ? (
                                      <>
                                        Show Less
                                        <ChevronUp
                                          size={
                                            14
                                          }
                                        />
                                      </>
                                    ) : (
                                      <>
                                        Show All (
                                        {
                                          response
                                            .sampleReleaseDates
                                            .length
                                        }
                                        )
                                        <ChevronDown
                                          size={
                                            14
                                          }
                                        />
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
                                {displayedReleases.map(
                                  (
                                    release,
                                    index
                                  ) => {
                                    const isFinal =
                                      index ===
                                      displayedReleases.length -
                                        1

                                    return (
                                      <div
                                        key={
                                          index
                                        }
                                        className="flex items-center justify-between rounded-[10px] border p-3 transition-all"
                                        style={{
                                          borderColor:
                                            isFinal
                                              ? themeColors.green
                                              : themeColors.border,

                                          backgroundColor:
                                            isFinal
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
                                              backgroundColor:
                                                isFinal
                                                  ? themeColors.green
                                                  : isDark
                                                  ? 'rgba(255,255,255,0.08)'
                                                  : '#F3F4F6',

                                              color:
                                                isFinal
                                                  ? '#FFFFFF'
                                                  : themeColors.mid,
                                            }}
                                          >
                                            {
                                              release.releaseNumber
                                            }
                                          </span>

                                          <div>
                                            <p
                                              className="text-[13px] font-medium"
                                              style={{
                                                color:
                                                  themeColors.charcoal,
                                              }}
                                            >
                                              {formatDateWithTime(
                                                release.date
                                              )}
                                            </p>

                                            <p
                                              className="text-[11px]"
                                              style={{
                                                color:
                                                  themeColors.mid,
                                              }}
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
                                              color:
                                                isFinal
                                                  ? themeColors.green
                                                  : themeColors.charcoal,
                                            }}
                                          >
                                            {formatCurrency(
                                              release.amount
                                            )}
                                          </p>

                                          {isFinal && (
                                            <p
                                              className="text-[10px] font-medium"
                                              style={{
                                                color:
                                                  themeColors.green,
                                              }}
                                            >
                                              Final Release
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  }
                                )}
                              </div>
                            </>
                          )}

                          {/* Calendar View */}
                          {scheduleView ===
                            'calendar' &&
                            calendarSchedule && (
                              <UseScheduleCalendar
                                schedule={
                                  calendarSchedule
                                }
                              />
                            )}
                        </div>
                      )}

                      {/* Valid Indicator */}
                      <div
                        className="mt-4 flex items-center gap-2 rounded-[12px] p-3"
                        style={{
                          backgroundColor:
                            response.isValid
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
                              style={{
                                color:
                                  themeColors.green,
                              }}
                            />

                            <span
                              className="text-[13px] font-medium"
                              style={{
                                color:
                                  themeColors.green,
                              }}
                            >
                              Schedule is valid
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle
                              size={18}
                              style={{
                                color:
                                  '#EF4444',
                              }}
                            />

                            <span
                              className="text-[13px] font-medium"
                              style={{
                                color:
                                  '#EF4444',
                              }}
                            >
                              Schedule has errors
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Error State */
                    <div
                      className="flex flex-col items-center justify-center py-8 text-center"
                      style={{
                        color:
                          themeColors.mid,
                      }}
                    >
                      <XCircle
                        size={48}
                        strokeWidth={1.5}
                        style={{
                          color:
                            '#EF4444',
                        }}
                      />

                      <p
                        className="mt-3 text-[14px] font-medium"
                        style={{
                          color:
                            '#EF4444',
                        }}
                      >
                        Please fix the errors
                        above to see the
                        schedule preview
                      </p>

                      <p className="mt-1 text-[12px]">
                        Adjust your
                        configuration and
                        click "Preview
                        Schedule" again
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-8 text-center"
                  style={{
                    color:
                      themeColors.mid,
                  }}
                >
                  <Calendar
                    size={40}
                    strokeWidth={1.5}
                  />

                  <p className="mt-3 text-[14px] font-medium">
                    No preview data
                    available
                  </p>

                  <p className="mt-1 text-[12px]">
                    Configure your schedule
                    and click "Preview
                    Schedule"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}