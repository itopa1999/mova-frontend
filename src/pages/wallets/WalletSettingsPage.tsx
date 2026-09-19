// src/pages/app/WalletSettingsPage.tsx

import {
  ChevronLeft,
  Info,
  AlertTriangle,
  Coins,
  Calendar,
  Clock,
  Repeat,
  CalendarDays,
  Zap,
  Lock,
  Landmark,
  Banknote,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { colors, darkColors } from '../../styles/tokens'

// ─── Types ─────────────────────────────────────────────
type UnusedOption = 'return' | 'keep'

interface WalletSettingsState {
  walletId: number
  walletName: string
  categoryIcon: string
  walletStatus: string
  walletRules: string
  unusedAmount: number
  lockedAmount: number
  targetAmount: number
}

interface ParsedWalletRules {
  type: string
  time: string
  onceDate?: string
  daysOfWeek?: number[]
  datesOfMonth?: number[]
  isLastDayOfMonth?: boolean
  months?: number[]
  daysOfMonth?: number[]
  intervalDays?: number
  intervalHours?: number
}

// ─── Constants ─────────────────────────────────────────
const FREQUENCY_TYPES = [
  { value: 'once', label: 'Once', icon: Calendar },
  { value: 'hourly', label: 'Hourly', icon: Clock },
  { value: 'daily', label: 'Daily', icon: Repeat },
  { value: 'weekly', label: 'Weekly', icon: CalendarDays },
  { value: 'monthly', label: 'Monthly', icon: Calendar },
  { value: 'quarterly', label: 'Quarterly', icon: Calendar },
  { value: 'yearly', label: 'Yearly', icon: Calendar },
  { value: 'custom', label: 'Custom', icon: Zap },
]

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
]

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

const UNUSED_OPTIONS: {
  id: UnusedOption
  icon: LucideIcon
  title: string
  desc: string
}[] = [
  {
    id: 'return',
    icon: Landmark,
    title: 'Move to Main Account',
    desc: 'Transfer unused money into your main account wallet.',
  },
  {
    id: 'keep',
    icon: Banknote,
    title: 'Keep Available',
    desc: 'Leave unused money in your spending balance.',
  },
]

// ─── Tour ──────────────────────────────────────────────
type TourKey = 'intro'
interface TourStep {
  title: string
  body: string
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Wallet Settings',
    body:
      'Two things you can control here, each with its own Save button: (1) how often this wallet releases money, and (2) what happens to any money you don\u2019t spend.',
  },
  {
    title: 'Edit the Schedule',
    body:
      'You can change the frequency between Hourly, Daily, Weekly, Monthly, Quarterly, Yearly, or Custom at any time. Note: once a wallet is on a recurring schedule, it cannot be changed back to "Once" — this keeps your money committed and prevents early spending.',
  },
  {
    title: 'Unused Money rule',
    body:
      'Every time a release lands, whatever you don\u2019t spend by end of day is handled based on your choice: Move to Main Account, or Keep Available.',
  },
  {
    title: 'Move to Main Account',
    body:
      'Unused money is transferred into your main account wallet. Best when you want to stay disciplined — the leftover returns to your controlled pool instead of sitting loose.',
  },
  {
    title: 'Keep Available',
    body:
      'Unused money stays in your main balance for you to spend freely. Use this if you trust yourself to manage the leftover.',
  },
]

const TOUR_SEEN_KEY = 'mova_wallet_settings_tour_seen'

// ─── Parse walletRules JSON safely ─────────────────────
const parseWalletRules = (raw: string): ParsedWalletRules => {
  try {
    const parsed = JSON.parse(raw)
    return {
      type: parsed.type ?? 'once',
      time: parsed.time ?? '12:00',
      onceDate: parsed.onceDate,
      daysOfWeek: parsed.daysOfWeek ?? [],
      datesOfMonth: parsed.datesOfMonth ?? [],
      isLastDayOfMonth: parsed.isLastDayOfMonth ?? false,
      months: parsed.months ?? [],
      daysOfMonth: parsed.daysOfMonth ?? [],
      intervalDays: parsed.intervalDays ?? 3,
      intervalHours: parsed.intervalHours ?? 1,
    }
  } catch {
    return {
      type: 'once',
      time: '12:00',
      daysOfWeek: [],
      datesOfMonth: [],
      isLastDayOfMonth: false,
      months: [],
      daysOfMonth: [],
      intervalDays: 3,
      intervalHours: 1,
    }
  }
}

export default function WalletSettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const state = location.state as WalletSettingsState | undefined

  // ─── Parse walletRules from state ────────────────────
  const initialRules = useMemo<ParsedWalletRules>(() => {
    if (!state?.walletRules) {
      return {
        type: 'once',
        time: '12:00',
        daysOfWeek: [],
        datesOfMonth: [],
        isLastDayOfMonth: false,
        months: [],
        daysOfMonth: [],
        intervalDays: 3,
        intervalHours: 1,
      }
    }
    return parseWalletRules(state.walletRules)
  }, [state?.walletRules])

  // 👇 Whether the ORIGINAL wallet is a recurring schedule.
  //    If yes, the "Once" option is locked in the picker.
  const originalIsRecurring = initialRules.type !== 'once'

  // ─── Stage 1: Schedule state ─────────────────────────
  const [frequencyType, setFrequencyType] = useState<string>(
    initialRules.type
  )
  const [time, setTime] = useState<string>(initialRules.time)
  const [onceDate, setOnceDate] = useState<string>(
    initialRules.onceDate?.slice(0, 10) ?? ''
  )
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialRules.daysOfWeek ?? []
  )
  const [selectedDates, setSelectedDates] = useState<number[]>(
    initialRules.datesOfMonth ?? initialRules.daysOfMonth ?? []
  )
  const [isLastDayOfMonth, setIsLastDayOfMonth] = useState<boolean>(
    initialRules.isLastDayOfMonth ?? false
  )
  const [selectedMonths, setSelectedMonths] = useState<number[]>(
    initialRules.months ?? []
  )
  const [intervalDays, setIntervalDays] = useState<number>(
    initialRules.intervalDays ?? 3
  )
  const [intervalHours, setIntervalHours] = useState<number>(
    initialRules.intervalHours ?? 1
  )

  const [isSavingSchedule, setIsSavingSchedule] = useState(false)

  // Sync state if walletRules change
  useEffect(() => {
    setFrequencyType(initialRules.type)
    setTime(initialRules.time)
    setOnceDate(initialRules.onceDate?.slice(0, 10) ?? '')
    setSelectedDays(initialRules.daysOfWeek ?? [])
    setSelectedDates(
      initialRules.datesOfMonth ?? initialRules.daysOfMonth ?? []
    )
    setIsLastDayOfMonth(initialRules.isLastDayOfMonth ?? false)
    setSelectedMonths(initialRules.months ?? [])
    setIntervalDays(initialRules.intervalDays ?? 3)
    setIntervalHours(initialRules.intervalHours ?? 1)
  }, [initialRules])

  // ─── Stage 2: Unused money state ─────────────────────
  const [unusedChoice, setUnusedChoice] =
    useState<UnusedOption>('return')
  const [isSavingUnused, setIsSavingUnused] = useState(false)

  // ─── Tour ────────────────────────────────────────────
  const tourSheet = useBottomSheet<TourKey>()
  const [tourStep, setTourStep] = useState(0)

  // Guard
  useEffect(() => {
    if (!state) {
      navigate('/wallets', { replace: true })
    }
  }, [state, navigate])

  // Auto-open tour
  useEffect(() => {
    if (!state) return
    const seen = localStorage.getItem(TOUR_SEEN_KEY)
    if (!seen) {
      const t = setTimeout(() => {
        setTourStep(0)
        tourSheet.open('intro')
        localStorage.setItem(TOUR_SEEN_KEY, '1')
      }, 700)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  if (!state) return null

  const { walletId, walletName, categoryIcon, walletStatus } = state
  const Icon = getIcon(categoryIcon)
  const isPaused = walletStatus?.toLowerCase() === 'paused'

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const toggleDay = (day: number) =>
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    )

  const toggleDate = (date: number) =>
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    )

  const toggleMonth = (month: number) =>
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month]
    )

  // 👇 Whether the user can pick "Once" right now.
  //    Locked only when the original wallet was recurring.
  const canPickOnce = !originalIsRecurring

  const handleFrequencyClick = (value: string) => {
    // Policy: block switching from a recurring schedule → once
    if (value === 'once' && originalIsRecurring) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            'Once a wallet is on a recurring schedule, it can\u2019t be switched back to "Once". Choose another frequency or break the wallet.',
        },
      })
      window.dispatchEvent(errorEvent)
      return
    }

    setFrequencyType(value)
  }

  const buildFrequencyConfig = () => {
    const config: Record<string, unknown> = {
      type: frequencyType,
      time,
    }

    switch (frequencyType) {
      case 'once':
        config.onceDate = onceDate ? `${onceDate}T00:00:00` : ''
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

  // ─── Save Stage 1 — Schedule only ────────────────────
  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true)

    const frequencyConfig = buildFrequencyConfig()

    try {
      // TODO: replace with real API call to update wallet rules
      console.log('Save SCHEDULE for wallet', walletId, {
        frequency: frequencyType,
        frequencyConfig: JSON.stringify(frequencyConfig),
      })

      await new Promise((r) => setTimeout(r, 400))

      const successEvent = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Schedule updated.',
        },
      })
      window.dispatchEvent(successEvent)
    } finally {
      setIsSavingSchedule(false)
    }
  }

  // ─── Save Stage 2 — Unused money only ────────────────
  const handleSaveUnused = async () => {
    setIsSavingUnused(true)

    try {
      // TODO: replace with real API call
      console.log('Save UNUSED MONEY for wallet', walletId, {
        unusedMoneyRule: unusedChoice,
      })

      await new Promise((r) => setTimeout(r, 400))

      const successEvent = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Unused money rule saved.',
        },
      })
      window.dispatchEvent(successEvent)
    } finally {
      setIsSavingUnused(false)
    }
  }

  // Tour controls
  const openTour = () => {
    setTourStep(0)
    tourSheet.open('intro')
  }

  const nextTourStep = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep((s) => s + 1)
    } else {
      tourSheet.close()
    }
  }

  const skipTour = () => tourSheet.close()

  const currentStep = TOUR_STEPS[tourStep]
  const isLastStep = tourStep === TOUR_STEPS.length - 1

  return (
    <AppLayout>
      <div
        className="flex min-h-full flex-col py-5"
        style={{ color: themeColors.charcoal }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
          >
            <ChevronLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1
                className="text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Wallet Settings
              </h1>
              <button
                type="button"
                onClick={openTour}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                  color: themeColors.mid,
                }}
                aria-label="Explain this page"
              >
                <Info size={14} strokeWidth={2.4} />
              </button>
            </div>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              {walletName}
            </p>
          </div>
        </div>

        {/* Wallet pill */}
        <div
          className="mb-6 flex items-center gap-3 rounded-[14px] border p-3"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px]"
            style={{
              backgroundColor: isDark
                ? 'rgba(15, 185, 110, 0.15)'
                : 'rgba(15, 185, 110, 0.08)',
              color: themeColors.green,
            }}
          >
            <Icon size={18} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="truncate text-[14px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              {walletName}
            </p>
            <p
              className="text-[11px] capitalize"
              style={{ color: themeColors.mid }}
            >
              {isPaused ? 'Paused' : walletStatus}
            </p>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase"
            style={{
              backgroundColor: isPaused
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(15, 185, 110, 0.15)',
              color: isPaused ? '#F59E0B' : themeColors.green,
            }}
          >
            {isPaused ? 'Paused' : 'Active'}
          </span>
        </div>

        {/* ════════════════════════════════════════════════
            STAGE 1 — Edit Schedule
            ════════════════════════════════════════════════ */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              1
            </div>
            <div>
              <h2
                className="text-[16px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Edit the Schedule
              </h2>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Change how often money is released from this wallet
              </p>
            </div>
          </div>

          <div
            className="rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: themeColors.charcoal }}
            >
              Schedule Type
            </label>

            <div className="grid grid-cols-3 gap-2">
              {FREQUENCY_TYPES.map((freq) => {
                const FreqIcon = freq.icon
                const isActive = frequencyType === freq.value

                // 👇 Once is locked when the original wallet is recurring
                const isLocked =
                  freq.value === 'once' && !canPickOnce

                return (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => handleFrequencyClick(freq.value)}
                    disabled={isLocked}
                    className="relative flex flex-col items-center rounded-[10px] border py-2.5 transition-all"
                    style={{
                      borderColor: isActive
                        ? themeColors.green
                        : themeColors.border,
                      backgroundColor: isActive
                        ? isDark
                          ? 'rgba(15, 185, 110, 0.15)'
                          : 'rgba(15, 185, 110, 0.08)'
                        : 'transparent',
                      opacity: isLocked ? 0.4 : 1,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLocked ? (
                      <Lock size={18} style={{ color: themeColors.mid }} />
                    ) : (
                      <FreqIcon
                        size={18}
                        style={{
                          color: isActive
                            ? themeColors.green
                            : themeColors.mid,
                        }}
                      />
                    )}
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

                    {isLocked && (
                      <span
                        className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(255,255,255,0.1)'
                            : '#F3F4F6',
                          color: themeColors.mid,
                        }}
                      >
                        <Lock size={8} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Policy info banner — only shown when Once is locked */}
            {originalIsRecurring && (
              <div
                className="mt-3 flex items-start gap-2 rounded-[10px] p-2.5"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(245, 158, 11, 0.06)',
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(245, 158, 11, 0.25)'
                    : 'rgba(245, 158, 11, 0.15)',
                }}
              >
                <Lock
                  size={12}
                  style={{
                    color: '#F59E0B',
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[11px] leading-[1.5]"
                  style={{ color: '#D97706' }}
                >
                  <strong>Once is locked.</strong> Once a wallet is
                  committed to a recurring schedule, you can't switch it
                  back to a single release. This protects you from
                  impulsive early spending. To end it, use{' '}
                  <strong>Break Wallet</strong> from the wallet detail
                  page.
                </p>
              </div>
            )}

            {/* Frequency-specific fields */}
            <div className="mt-4">
              {frequencyType === 'once' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
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
                      style={{ color: themeColors.charcoal }}
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

              {frequencyType === 'hourly' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    Interval (hours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={intervalHours}
                    onChange={(e) =>
                      setIntervalHours(Number(e.target.value))
                    }
                    className="w-full max-w-xs rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: isDark
                        ? 'rgba(0,0,0,0.3)'
                        : '#F9FAFB',
                      color: themeColors.charcoal,
                    }}
                  />
                </div>
              )}

              {(frequencyType === 'daily' ||
                frequencyType === 'weekly') && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
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
                            color: isSelected
                              ? '#FFFFFF'
                              : themeColors.mid,
                          }}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {frequencyType === 'monthly' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    Dates of Month
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(
                      (date) => {
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
                              color: isSelected
                                ? '#FFFFFF'
                                : themeColors.mid,
                            }}
                          >
                            {date}
                          </button>
                        )
                      }
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lastDay"
                      checked={isLastDayOfMonth}
                      onChange={(e) =>
                        setIsLastDayOfMonth(e.target.checked)
                      }
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

              {(frequencyType === 'quarterly' ||
                frequencyType === 'yearly') && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    Select Months
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MONTHS.map((month) => {
                      const isSelected = selectedMonths.includes(
                        month.value
                      )
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
                            color: isSelected
                              ? '#FFFFFF'
                              : themeColors.mid,
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
                      style={{ color: themeColors.charcoal }}
                    >
                      Days of Month
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 3, 7, 10, 15, 20, 25].map((date) => {
                        const isSelected =
                          selectedDates.includes(date)
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
                              color: isSelected
                                ? '#FFFFFF'
                                : themeColors.mid,
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

              {frequencyType === 'custom' && (
                <div>
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    Interval (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={intervalDays}
                    onChange={(e) =>
                      setIntervalDays(Number(e.target.value))
                    }
                    className="w-full max-w-xs rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: isDark
                        ? 'rgba(0,0,0,0.3)'
                        : '#F9FAFB',
                      color: themeColors.charcoal,
                    }}
                  />
                </div>
              )}

              {frequencyType !== 'once' && (
                <div className="mt-3">
                  <label
                    className="mb-1.5 block text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full max-w-xs rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: isDark
                        ? 'rgba(0,0,0,0.3)'
                        : '#F9FAFB',
                      color: themeColors.charcoal,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Stage 1 info note */}
            <div
              className="mt-4 flex items-start gap-2 rounded-[12px] p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(96, 165, 250, 0.1)'
                  : 'rgba(96, 165, 250, 0.06)',
                borderColor: isDark
                  ? 'rgba(96, 165, 250, 0.2)'
                  : 'rgba(96, 165, 250, 0.15)',
                borderWidth: 1,
              }}
            >
              <Info
                size={14}
                style={{
                  color: '#60A5FA',
                  marginTop: 2,
                  flexShrink: 0,
                }}
              />
              <p
                className="text-[11px] leading-[1.55]"
                style={{ color: themeColors.charcoal }}
              >
                Changes apply to <strong>future releases only</strong>.
                Already scheduled or completed releases stay as they
                are.
              </p>
            </div>

            {/* Stage 1 Save button */}
            <div className="mt-4">
              <Button
                onClick={handleSaveSchedule}
                loading={isSavingSchedule}
                loadingText="Saving..."
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════
            STAGE 2 — Unused Money rule
            ════════════════════════════════════════════════ */}
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              2
            </div>
            <div>
              <h2
                className="text-[16px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Unused Money
              </h2>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                What happens to leftover money after each release
              </p>
            </div>
          </div>

          {/* Summary card */}
          <div
            className="mb-4 rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Coins size={14} style={{ color: themeColors.green }} />
              <p
                className="text-[12px] font-semibold uppercase tracking-wider"
                style={{ color: themeColors.mid }}
              >
                Current unused amount
              </p>
            </div>

            <p
              className="mb-4 text-[26px] font-bold leading-none"
              style={{
                color: themeColors.charcoal,
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(state.unusedAmount ?? 0)}
            </p>

            <p
              className="mb-3 text-[11px]"
              style={{ color: themeColors.mid }}
            >
              Example — a ₦1,000 release:
            </p>

            <div className="flex gap-3">
              <div
                className="flex-1 rounded-[12px] p-3 text-center"
                style={{ backgroundColor: themeColors.background }}
              >
                <p
                  className="mb-0.5 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Released
                </p>
                <p
                  className="text-[16px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  {formatCurrency(1000)}
                </p>
              </div>
              <div
                className="flex-1 rounded-[12px] p-3 text-center"
                style={{ backgroundColor: themeColors.redBackground }}
              >
                <p
                  className="mb-0.5 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Spent
                </p>
                <p
                  className="text-[16px] font-bold"
                  style={{ color: themeColors.red }}
                >
                  {formatCurrency(700)}
                </p>
              </div>
              <div
                className="flex-1 rounded-[12px] p-3 text-center"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <p
                  className="mb-0.5 text-[11px] font-semibold"
                  style={{ color: themeColors.green }}
                >
                  Remaining
                </p>
                <p
                  className="text-[16px] font-bold"
                  style={{ color: themeColors.green }}
                >
                  {formatCurrency(300)}
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {UNUSED_OPTIONS.map((o) => {
              const isSelected = unusedChoice === o.id
              const OptionIcon = o.icon
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setUnusedChoice(o.id)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-[16px] border-2 p-4 text-left transition-all duration-150"
                  style={{
                    backgroundColor: isSelected
                      ? themeColors.greenLight
                      : themeColors.background,
                    borderColor: isSelected
                      ? themeColors.green
                      : 'transparent',
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? themeColors.green
                        : isDark
                        ? 'rgba(15, 185, 110, 0.15)'
                        : 'rgba(15, 185, 110, 0.08)',
                      color: isSelected
                        ? '#FFFFFF'
                        : themeColors.green,
                    }}
                  >
                    <OptionIcon size={18} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-[15px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {o.title}
                    </p>
                    <p
                      className="mt-0.5 text-[12px] leading-[1.45]"
                      style={{ color: themeColors.mid }}
                    >
                      {o.desc}
                    </p>
                  </div>
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: isSelected
                        ? themeColors.green
                        : themeColors.border,
                      backgroundColor: isSelected
                        ? themeColors.green
                        : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Stage 2 info note */}
          <div
            className="mt-4 flex items-start gap-2 rounded-[12px] p-3"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.1)'
                : 'rgba(96, 165, 250, 0.06)',
              borderColor: isDark
                ? 'rgba(96, 165, 250, 0.2)'
                : 'rgba(96, 165, 250, 0.15)',
              borderWidth: 1,
            }}
          >
            <AlertTriangle
              size={14}
              style={{
                color: '#60A5FA',
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <p
              className="text-[11px] leading-[1.55]"
              style={{ color: themeColors.charcoal }}
            >
              This preference applies to every future release of this
              wallet. You can change it anytime.
            </p>
          </div>

          {/* Stage 2 Save button */}
          <div className="mt-4">
            <Button
              onClick={handleSaveUnused}
              loading={isSavingUnused}
              loadingText="Saving..."
            >
              Save Unused Money Rule
            </Button>
          </div>
        </section>
      </div>

      {/* ───────── Tour BottomSheet ───────── */}
      <BottomSheet
        isOpen={tourSheet.activeSheet !== null}
        onClose={skipTour}
        title={currentStep.title}
        icon={<Info size={16} strokeWidth={2.4} />}
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
              {isLastStep ? 'Got it!' : 'Next'}
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
  )
}