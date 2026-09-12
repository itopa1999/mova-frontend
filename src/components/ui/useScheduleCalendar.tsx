import { useMemo, useState } from 'react'
import {
  format,
  isSameDay,
  isValid,
} from 'date-fns'
import {
  DayPicker,
  DayButton,
} from 'react-day-picker'
import {
  Circle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import 'react-day-picker/dist/style.css'

import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

interface ScheduleRelease {
  scheduledReleaseId: number
  scheduled_for: string
  amount: number
  is_released: boolean
  released_at: string
  status: string
  is_projected: boolean
}

interface Schedule {
  releases: ScheduleRelease[]
}

interface UseScheduleCalendarProps {
  schedule: Schedule
}

export default function UseScheduleCalendar({
  schedule,
}: UseScheduleCalendarProps) {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [selectedDate, setSelectedDate] =
    useState<Date | undefined>(undefined)

  const parseReleaseDate = (
    value: string | null | undefined
  ): Date | null => {
    if (!value) return null

    const date = new Date(value)

    return isValid(date) ? date : null
  }

  /*
   * All valid release dates
   */
  const releaseDates = useMemo(() => {
    return schedule.releases
      .map((release) =>
        parseReleaseDate(release.scheduled_for)
      )
      .filter(
        (date): date is Date =>
          date !== null
      )
  }, [schedule.releases])

  /*
   * Completed release dates
   */
  const completedReleaseDates = useMemo(() => {
    return schedule.releases
      .filter(
        (release) => release.is_released
      )
      .map((release) =>
        parseReleaseDate(release.scheduled_for)
      )
      .filter(
        (date): date is Date =>
          date !== null
      )
  }, [schedule.releases])

  /*
   * Projected release dates
   */
  const projectedReleaseDates = useMemo(() => {
    return schedule.releases
      .filter(
        (release) => release.is_projected
      )
      .map((release) =>
        parseReleaseDate(release.scheduled_for)
      )
      .filter(
        (date): date is Date =>
          date !== null
      )
  }, [schedule.releases])

  /*
   * Format currency
   */
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

  /*
   * Get releases for selected date
   */
  const selectedReleases = useMemo(() => {
    if (!selectedDate) return []

    return schedule.releases.filter(
      (release) => {
        const releaseDate =
          parseReleaseDate(
            release.scheduled_for
          )

        if (!releaseDate) return false

        return isSameDay(
          releaseDate,
          selectedDate
        )
      }
    )
  }, [
    selectedDate,
    schedule.releases,
  ])

  /*
   * Status badge
   */
  const getStatusBadge = (
    status: string
  ) => {
    const normalizedStatus =
      status?.toLowerCase() ||
      'scheduled'

    const statusColors: Record<
      string,
      {
        bg: string
        text: string
      }
    > = {
      completed: {
        bg: isDark
          ? 'rgba(74, 222, 128, 0.14)'
          : 'rgba(15, 151, 61, 0.08)',
        text: themeColors.green,
      },

      scheduled: {
        bg: isDark
          ? 'rgba(96, 165, 250, 0.14)'
          : 'rgba(96, 165, 250, 0.08)',
        text: '#60A5FA',
      },

      projected: {
        bg: isDark
          ? 'rgba(156, 163, 175, 0.14)'
          : 'rgba(156, 163, 175, 0.08)',
        text: '#9CA3AF',
      },

      failed: {
        bg: isDark
          ? 'rgba(239, 68, 68, 0.14)'
          : 'rgba(239, 68, 68, 0.08)',
        text: '#EF4444',
      },
    }

    const color =
      statusColors[
        normalizedStatus
      ] ||
      statusColors.scheduled

    return (
      <span
        className="rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-wide"
        style={{
          backgroundColor:
            color.bg,
          color: color.text,
        }}
      >
        {normalizedStatus}
      </span>
    )
  }

  return (
    <div className="w-full">
      {/* Calendar Card */}
      <div
        className="w-full overflow-hidden rounded-[20px] border"
        style={{
          backgroundColor:
            themeColors.card,
          borderColor:
            themeColors.border,
        }}
      >
        {/* Header */}
        <div
          className="border-b px-4 py-4"
          style={{
            borderColor:
              themeColors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-[15px] font-semibold"
                style={{
                  color:
                    themeColors.charcoal,
                }}
              >
                Release Schedule
              </p>

              <p
                className="mt-0.5 text-[11px]"
                style={{
                  color:
                    themeColors.mid,
                }}
              >
                Track your scheduled releases
              </p>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-2">
              {/* Scheduled */}
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    isDark
                      ? 'rgba(96, 165, 250, 0.12)'
                      : 'rgba(96, 165, 250, 0.08)',
                }}
              >
                <Circle
                  size={10}
                  fill="#60A5FA"
                  color="#60A5FA"
                />
              </div>

              {/* Completed */}
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    isDark
                      ? 'rgba(74, 222, 128, 0.12)'
                      : 'rgba(15, 151, 61, 0.08)',
                }}
              >
                <CheckCircle
                  size={12}
                  style={{
                    color:
                      themeColors.green,
                  }}
                />
              </div>

              {/* Projected */}
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    isDark
                      ? 'rgba(156, 163, 175, 0.12)'
                      : 'rgba(156, 163, 175, 0.08)',
                }}
              >
                <Clock
                  size={12}
                  style={{
                    color:
                      themeColors.mid,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="w-full px-2 pb-5 pt-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date)
            }}
            showOutsideDays
            className="w-full"
            styles={{
              root: {
                width: '100%',
                color:
                  themeColors.charcoal,
              },

              months: {
                width: '100%',
              },

              month: {
                width: '100%',
              },

              month_grid: {
                width: '100%',
                borderCollapse:
                  'separate',
                borderSpacing:
                  '0 5px',
              },

              weekdays: {
                width: '100%',
              },

              weekday: {
                color:
                  themeColors.mid,
                fontSize: '10px',
                fontWeight: 600,
                textTransform:
                  'uppercase',
                letterSpacing:
                  '0.03em',
                height: '26px',
              },

              week: {
                width: '100%',
              },

              day: {
                width: '14.285%',
                height: '52px',
                padding: '2px',
                textAlign: 'center',
              },

              day_button: {
                width: '44px',
                height: '44px',
                borderRadius:
                  '9999px',
                color:
                  themeColors.charcoal,
              },

              today: {
                fontWeight: 700,
              },

              disabled: {
                color:
                  themeColors.mid,
                opacity: 0.35,
              },

              outside: {
                color:
                  themeColors.mid,
                opacity: 0.35,
              },

              month_caption: {
                paddingBottom: '10px',
              },

              caption_label: {
                color:
                  themeColors.charcoal,
                fontSize: '16px',
                fontWeight: 700,
              },

              nav: {
                gap: '5px',
              },

              button_previous: {
                width: '34px',
                height: '34px',
                borderRadius:
                  '9999px',
                color:
                  themeColors.charcoal,
                border: `1px solid ${themeColors.border}`,
              },

              button_next: {
                width: '34px',
                height: '34px',
                borderRadius:
                  '9999px',
                color:
                  themeColors.charcoal,
                border: `1px solid ${themeColors.border}`,
              },
            }}
            components={{
              /*
               * Previous month
               */
              PreviousMonthButton:
                (props) => (
                  <button
                    {...props}
                    type="button"
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-opacity hover:opacity-70 active:scale-95"
                    style={{
                      color:
                        themeColors.charcoal,
                      border: `1px solid ${themeColors.border}`,
                      backgroundColor:
                        'transparent',
                    }}
                  >
                    <ChevronLeft
                      size={16}
                    />
                  </button>
                ),

              /*
               * Next month
               */
              NextMonthButton:
                (props) => (
                  <button
                    {...props}
                    type="button"
                    className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-opacity hover:opacity-70 active:scale-95"
                    style={{
                      color:
                        themeColors.charcoal,
                      border: `1px solid ${themeColors.border}`,
                      backgroundColor:
                        'transparent',
                    }}
                  >
                    <ChevronRight
                      size={16}
                    />
                  </button>
                ),

              /*
               * Calendar day
               */
              DayButton: ({
                day,
                modifiers,
                ...props
              }) => {
                const date =
                  day.date

                const isReleaseDay =
                  releaseDates.some(
                    (releaseDate) =>
                      isSameDay(
                        releaseDate,
                        date
                      )
                  )

                const isCompleted =
                  completedReleaseDates.some(
                    (releaseDate) =>
                      isSameDay(
                        releaseDate,
                        date
                      )
                  )

                const isProjected =
                  projectedReleaseDates.some(
                    (releaseDate) =>
                      isSameDay(
                        releaseDate,
                        date
                      )
                  )

                let statusIcon = null

                let statusColor : string =
                  themeColors.mid

                if (isCompleted) {
                  statusIcon = (
                    <CheckCircle
                      size={10}
                      strokeWidth={
                        2.4
                      }
                    />
                  )

                  statusColor =
                    themeColors.green
                } else if (
                  isProjected
                ) {
                  statusIcon = (
                    <Clock
                      size={10}
                      strokeWidth={
                        2.2
                      }
                    />
                  )

                  statusColor =
                    themeColors.mid
                } else if (
                  isReleaseDay
                ) {
                  statusIcon = (
                    <Circle
                      size={9}
                      strokeWidth={2}
                      fill="#60A5FA"
                      color="#60A5FA"
                    />
                  )

                  statusColor =
                    '#60A5FA'
                }

                return (
                  <DayButton
                    day={day}
                    modifiers={
                      modifiers
                    }
                    {...props}
                    type="button"
                    className="relative flex h-11 w-11 flex-col items-center justify-center rounded-full transition-all active:scale-95"
                    style={{
                      color:
                        modifiers.selected
                          ? '#FFFFFF'
                          : modifiers.outside
                          ? themeColors.mid
                          : themeColors.charcoal,

                      backgroundColor:
                        modifiers.selected
                          ? themeColors.green
                          : 'transparent',

                      opacity:
                        modifiers.outside
                          ? 0.35
                          : 1,
                    }}
                  >
                    {/* Date */}
                    <span className="text-[14px] font-medium leading-none">
                      {format(
                        date,
                        'd'
                      )}
                    </span>

                    {/* Release indicator */}
                    {isReleaseDay && (
                      <span
                        className="mt-[3px] flex h-[10px] items-center justify-center"
                        style={{
                          color:
                            modifiers.selected
                              ? '#FFFFFF'
                              : statusColor,
                        }}
                      >
                        {statusIcon}
                      </span>
                    )}
                  </DayButton>
                )
              },
            }}
          />
        </div>
      </div>

      {/* Selected date releases */}
      {selectedDate &&
        isValid(selectedDate) &&
        selectedReleases.length >
          0 && (
          <div
            className="mt-3 overflow-hidden rounded-[20px] border"
            style={{
              backgroundColor:
                themeColors.card,
              borderColor:
                themeColors.border,
            }}
          >
            {/* Selected date header */}
            <div
              className="border-b px-4 py-3"
              style={{
                borderColor:
                  themeColors.border,
              }}
            >
              <p
                className="text-[13px] font-semibold"
                style={{
                  color:
                    themeColors.charcoal,
                }}
              >
                {format(
                  selectedDate,
                  'MMMM d, yyyy'
                )}
              </p>

              <p
                className="mt-0.5 text-[10px]"
                style={{
                  color:
                    themeColors.mid,
                }}
              >
                {
                  selectedReleases.length
                }{' '}
                {selectedReleases.length ===
                1
                  ? 'release'
                  : 'releases'}{' '}
                scheduled
              </p>
            </div>

            {/* Releases */}
            <div className="space-y-2 p-3">
              {selectedReleases.map(
                (release) => (
                  <div
                    key={
                      release.scheduledReleaseId
                    }
                    className="flex items-center justify-between rounded-[14px] p-3"
                    style={{
                      backgroundColor:
                        themeColors.background,
                    }}
                  >
                    {/* Left */}
                    <div className="flex min-w-0 items-center gap-3">
                      {/* Status icon */}
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor:
                            release.is_released
                              ? isDark
                                ? 'rgba(74, 222, 128, 0.12)'
                                : 'rgba(15, 151, 61, 0.08)'
                              : release.is_projected
                              ? isDark
                                ? 'rgba(156, 163, 175, 0.12)'
                                : 'rgba(156, 163, 175, 0.08)'
                              : isDark
                              ? 'rgba(96, 165, 250, 0.12)'
                              : 'rgba(96, 165, 250, 0.08)',
                        }}
                      >
                        {release.is_released ? (
                          <CheckCircle
                            size={15}
                            style={{
                              color:
                                themeColors.green,
                            }}
                          />
                        ) : release.is_projected ? (
                          <Clock
                            size={15}
                            style={{
                              color:
                                themeColors.mid,
                            }}
                          />
                        ) : (
                          <Circle
                            size={13}
                            fill="#60A5FA"
                            color="#60A5FA"
                          />
                        )}
                      </div>

                      {/* Release information */}
                      <div className="min-w-0">
                        <p
                          className="text-[14px] font-semibold"
                          style={{
                            color:
                              themeColors.charcoal,
                          }}
                        >
                          {formatCurrency(
                            release.amount
                          )}
                        </p>

                        <p
                          className="mt-0.5 text-[10px]"
                          style={{
                            color:
                              themeColors.mid,
                          }}
                        >
                          {release.is_released
                            ? 'Money released'
                            : release.is_projected
                            ? 'Projected release'
                            : 'Scheduled release'}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    {getStatusBadge(
                      release.status
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  )
}