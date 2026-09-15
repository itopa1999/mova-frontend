// src/pages/app/Releases.tsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  CalendarDays,
  Frown,
  Coins,
  Loader2,
  ChevronDown,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { getReleases } from '../../services/app/releases'
import type { ReleaseItem } from '../../services/app/releases'

const UPCOMING_OPTIONS = [3, 5, 10, 15] as const
type UpcomingLimit = (typeof UPCOMING_OPTIONS)[number]

export default function ReleasesPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const [todayReleased, setTodayReleased] = useState<ReleaseItem[]>([])
  const [scheduled, setScheduled] = useState<ReleaseItem[]>([])
  const [upcoming, setUpcoming] = useState<ReleaseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const [upcomingLimit, setUpcomingLimit] = useState<UpcomingLimit>(3)
  const [isLimitOpen, setIsLimitOpen] = useState(false)

  useEffect(() => {
    const fetchReleases = async () => {
      setIsLoading(true)
      setHasError(false)
      try {
        const response = await getReleases(upcomingLimit)
        if (response.is_success && response.data) {
          setTodayReleased(response.data.todayReleased ?? [])
          setScheduled(response.data.scheduled ?? [])
          setUpcoming(response.data.upcoming ?? [])
        } else {
          setHasError(true)
        }
      } catch (error) {
        console.error('Error fetching releases:', error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReleases()
  }, [upcomingLimit])

  // Today = released today + scheduled that fall within today
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const scheduledToday = scheduled.filter((r) => {
    const d = new Date(r.scheduledFor)
    return d >= startOfToday && d <= endOfToday
  })

  const scheduledFuture = scheduled.filter((r) => {
    const d = new Date(r.scheduledFor)
    return d > endOfToday
  })

  const todaysReleases = [...todayReleased, ...scheduledToday].sort(
    (a, b) =>
      new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  )

  const totalToday = todaysReleases.reduce((s, r) => s + r.amount, 0)
  const releasedToday = todayReleased.reduce((s, r) => s + r.amount, 0)
  const pendingToday = totalToday - releasedToday
  const countToday = todaysReleases.length

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatTime = (iso: string): string =>
    new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

  const formatDay = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

  const normalizeStatus = (
    status: string,
    isProjected: boolean
  ):
    | 'released'
    | 'scheduled'
    | 'projected'
    | 'failed'
    | 'processing'
    | 'paused' => {
    if (isProjected) return 'projected'
    const s = status?.toLowerCase() ?? ''
    if (s === 'released') return 'released'
    if (s === 'scheduled') return 'scheduled'
    if (s === 'failed') return 'failed'
    if (s === 'processing') return 'processing'
    if (s === 'paused') return 'paused'
    return 'scheduled'
  }

  const getStatusPill = (status: ReturnType<typeof normalizeStatus>) => {
    const map: Record<
      typeof status,
      { label: string; color: string; bg: string }
    > = {
      released: {
        label: 'Released',
        color: themeColors.green,
        bg: isDark
          ? 'rgba(15, 185, 110, 0.15)'
          : 'rgba(15, 185, 110, 0.08)',
      },
      scheduled: {
        label: 'Scheduled',
        color: '#60A5FA',
        bg: isDark
          ? 'rgba(96, 165, 250, 0.15)'
          : 'rgba(96, 165, 250, 0.08)',
      },
      projected: {
        label: 'Projected',
        color: '#9CA3AF',
        bg: isDark
          ? 'rgba(156, 163, 175, 0.15)'
          : 'rgba(156, 163, 175, 0.08)',
      },
      failed: {
        label: 'Failed',
        color: '#EF4444',
        bg: isDark
          ? 'rgba(239, 68, 68, 0.15)'
          : 'rgba(239, 68, 68, 0.08)',
      },
      processing: {
        label: 'Processing',
        color: '#F59E0B',
        bg: isDark
          ? 'rgba(245, 158, 11, 0.15)'
          : 'rgba(245, 158, 11, 0.08)',
      },
      paused: {
        label: 'Paused',
        color: '#F59E0B',
        bg: isDark
          ? 'rgba(245, 158, 11, 0.15)'
          : 'rgba(245, 158, 11, 0.08)',
      },
    }

    const c = map[status]

    return (
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
        style={{ backgroundColor: c.bg, color: c.color }}
      >
        {c.label}
      </span>
    )
  }

  const getStatusIcon = (status: ReturnType<typeof normalizeStatus>) => {
    switch (status) {
      case 'released':
        return (
          <CheckCircle size={16} style={{ color: themeColors.green }} />
        )
      case 'scheduled':
        return <Clock size={16} style={{ color: '#60A5FA' }} />
      case 'projected':
        return <CalendarDays size={16} style={{ color: '#9CA3AF' }} />
      case 'failed':
        return <AlertCircle size={16} style={{ color: '#EF4444' }} />
      case 'processing':
        return <Clock size={16} style={{ color: '#F59E0B' }} />
      case 'paused':
        return <AlertCircle size={16} style={{ color: '#F59E0B' }} />
    }
  }

  // Reusable row renderer
  const renderReleaseRow = (
    release: ReleaseItem,
    opts?: { isToday?: boolean }
  ) => {
    const statusKey = normalizeStatus(release.status, release.isProjected)
    const Icon = getIcon(release.categoryIcon)

    return (
      <div
        key={`${release.scheduledReleaseId ?? 'p'}-${release.walletId}-${release.scheduledFor}`}
        className="flex items-center justify-between rounded-[14px] border p-3.5"
        style={{
          backgroundColor: themeColors.card,
          borderColor:
            statusKey === 'released'
              ? themeColors.green
              : themeColors.border,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                statusKey === 'released'
                  ? isDark
                    ? 'rgba(15, 185, 110, 0.15)'
                    : 'rgba(15, 185, 110, 0.08)'
                  : statusKey === 'projected'
                  ? isDark
                    ? 'rgba(156, 163, 175, 0.15)'
                    : 'rgba(156, 163, 175, 0.08)'
                  : isDark
                  ? 'rgba(96, 165, 250, 0.15)'
                  : 'rgba(96, 165, 250, 0.08)',
            }}
          >
            {opts?.isToday && statusKey === 'released' ? (
              <Icon
                size={18}
                strokeWidth={2}
                style={{ color: themeColors.green }}
              />
            ) : (
              <Icon
                size={18}
                strokeWidth={2}
                style={{ color: themeColors.charcoal }}
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p
                className="text-[14px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {release.walletName}
              </p>
              {getStatusPill(statusKey)}
            </div>

            <p
              className="mt-0.5 flex items-center gap-1 text-[11px]"
              style={{ color: themeColors.mid }}
            >
              {opts?.isToday ? (
                <>
                  <Clock size={11} />
                  {formatTime(release.scheduledFor)}
                </>
              ) : (
                <>
                  {formatDay(release.scheduledFor)} ·{' '}
                  {formatTime(release.scheduledFor)}
                </>
              )}
            </p>
          </div>
        </div>

        <p
          className="text-[15px] font-bold"
          style={{
            color:
              statusKey === 'released'
                ? themeColors.green
                : themeColors.charcoal,
            fontFamily:
              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {formatCurrency(release.amount)}
        </p>
      </div>
    )
  }

  // ---------------- LOADING ----------------
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: themeColors.green }}
            />
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              Loading releases...
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // ---------------- ERROR ----------------
  if (hasError) {
    return (
      <AppLayout>
        <div className="py-5">
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
                Releases
              </h2>
              <p className="text-[13px]" style={{ color: themeColors.mid }}>
                What's coming out of your wallets
              </p>
            </div>
          </div>

          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
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
              Couldn't load releases
            </p>
            <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
              Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // ---------------- MAIN ----------------
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
              Releases
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              What's coming out of your wallets
            </p>
          </div>
        </div>

        {/* Summary card */}
        <div
          className="mb-5 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-[11px] uppercase tracking-wider"
                style={{ color: themeColors.mid }}
              >
                Today's Releases
              </p>
              <p
                className="mt-1 text-[22px] font-bold leading-none"
                style={{
                  color: themeColors.charcoal,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(totalToday)}
              </p>
              <p
                className="mt-1.5 text-[12px]"
                style={{ color: themeColors.mid }}
              >
                {countToday} release{countToday === 1 ? '' : 's'} scheduled
              </p>
            </div>

            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(15, 185, 110, 0.15)'
                  : 'rgba(15, 185, 110, 0.08)',
                color: themeColors.green,
              }}
            >
              <Coins size={22} strokeWidth={2} />
            </div>
          </div>

          {countToday > 0 && (
            <>
              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: themeColors.border }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: themeColors.green,
                    width: `${
                      totalToday > 0
                        ? Math.min(100, (releasedToday / totalToday) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span
                  className="text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  {formatCurrency(releasedToday)} released
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  {formatCurrency(pendingToday)} pending
                </span>
              </div>
            </>
          )}
        </div>

        {/* ============ TODAY ============ */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(15, 185, 110, 0.15)'
                  : 'rgba(15, 185, 110, 0.08)',
                color: themeColors.green,
              }}
            >
              <Clock size={14} strokeWidth={2} />
            </div>
            <h3
              className="text-[15px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Today
            </h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                color: themeColors.mid,
              }}
            >
              {todaysReleases.length}
            </span>
          </div>

          {todaysReleases.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[14px] border py-10 text-center"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <CalendarDays
                size={28}
                strokeWidth={1.5}
                style={{ color: themeColors.mid }}
              />
              <p
                className="mt-2 text-[13px] font-medium"
                style={{ color: themeColors.mid }}
              >
                No releases today
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaysReleases.map((r) => renderReleaseRow(r, { isToday: true }))}
            </div>
          )}
        </div>

        {/* ============ SCHEDULED (future pending) ============ */}
        {scheduledFuture.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(96, 165, 250, 0.15)'
                    : 'rgba(96, 165, 250, 0.08)',
                  color: '#60A5FA',
                }}
              >
                <Clock size={14} strokeWidth={2} />
              </div>
              <h3
                className="text-[15px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Scheduled
              </h3>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : '#F3F4F6',
                  color: themeColors.mid,
                }}
              >
                {scheduledFuture.length}
              </span>
            </div>

            <div className="space-y-2">
              {scheduledFuture.map((r) => renderReleaseRow(r))}
            </div>
          </div>
        )}

        {/* ============ UPCOMING ============ */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(156, 163, 175, 0.15)'
                    : 'rgba(156, 163, 175, 0.08)',
                  color: '#9CA3AF',
                }}
              >
                <CalendarDays size={14} strokeWidth={2} />
              </div>
              <h3
                className="text-[15px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Upcoming
              </h3>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : '#F3F4F6',
                  color: themeColors.mid,
                }}
              >
                {upcoming.length}
              </span>
            </div>

            {/* Limit dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLimitOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[11px] font-semibold transition-all hover:opacity-80"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.04)'
                    : '#F9FAFB',
                  color: themeColors.charcoal,
                }}
              >
                Show {upcomingLimit}
                <ChevronDown
                  size={12}
                  style={{
                    transform: isLimitOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {isLimitOpen && (
                <div
                  className="absolute right-0 top-full z-10 mt-1 min-w-[100px] overflow-hidden rounded-[10px] border shadow-lg"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  {UPCOMING_OPTIONS.map((opt) => {
                    const isActive = opt === upcomingLimit
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setUpcomingLimit(opt)
                          setIsLimitOpen(false)
                        }}
                        className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-[12px] font-medium transition-all hover:opacity-80"
                        style={{
                          backgroundColor: isActive
                            ? isDark
                              ? 'rgba(15, 185, 110, 0.12)'
                              : 'rgba(15, 185, 110, 0.08)'
                            : 'transparent',
                          color: isActive
                            ? themeColors.green
                            : themeColors.charcoal,
                        }}
                      >
                        {opt}
                        {isActive && (
                          <CheckCircle
                            size={12}
                            style={{ color: themeColors.green }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {upcoming.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-[14px] border py-10 text-center"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <CalendarDays
                size={28}
                strokeWidth={1.5}
                style={{ color: themeColors.mid }}
              />
              <p
                className="mt-2 text-[13px] font-medium"
                style={{ color: themeColors.mid }}
              >
                No upcoming releases
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((r) => renderReleaseRow(r))}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop to close dropdown when clicking outside */}
      {isLimitOpen && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setIsLimitOpen(false)}
        />
      )}
    </AppLayout>
  )
}