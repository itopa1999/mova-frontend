import {
  ArrowLeft,
  BellOff,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Shield,
  Settings,
  CheckCheck,
  Circle,
  User,
  Frown,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationItem,
} from '../../services/app/notifications'

type NotificationType =
  | 'deposit'
  | 'release'
  | 'wallet'
  | 'security'
  | 'system'
  | 'account'

type FilterTab = 'all' | 'unread'

const NOTIFICATION_ICONS: Record<
  NotificationType,
  { icon: typeof Wallet; color: string; bg: string }
> = {
  deposit: {
    icon: ArrowDownRight,
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.10)',
  },
  release: {
    icon: ArrowUpRight,
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.10)',
  },
  wallet: {
    icon: Wallet,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.10)',
  },
  security: {
    icon: Shield,
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.10)',
  },
  system: {
    icon: Settings,
    color: '#9CA3AF',
    bg: 'rgba(156, 163, 175, 0.10)',
  },
  account: {
    icon: User,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.10)',
  },
}

const resolveType = (rawType: string): NotificationType => {
  const normalized = rawType?.toLowerCase() ?? 'system'

  if (normalized in NOTIFICATION_ICONS) {
    return normalized as NotificationType
  }

  return 'system'
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    setHasError(false)

    try {
      const response = await getNotifications(false)

      if (response.is_success && response.data) {
        setNotifications(response.data)
      } else {
        setHasError(true)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notification: NotificationItem) => {
    // Optimistic update
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      )

      try {
        const response = await markNotificationAsRead(notification.id)

        if (!response.is_success) {
          // Roll back on failure
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, isRead: false } : n
            )
          )
        }
      } catch (err) {
        console.error('Failed to mark notification as read:', err)

        // Roll back
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: false } : n
          )
        )
      }
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  const handleMarkAllAsRead = async () => {
    const previous = notifications

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

    try {
      const response = await markAllNotificationsAsRead()

      if (!response.is_success) {
        // Roll back on failure
        setNotifications(previous)
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      setNotifications(previous)
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return '—'

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications

  const renderEmptyState = () => {
    const isUnreadTab = activeTab === 'unread'

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: isDark
              ? 'rgba(15, 185, 110, 0.15)'
              : 'rgba(15, 185, 110, 0.08)',
            color: themeColors.mid,
          }}
        >
          {isUnreadTab ? (
            <CheckCheck size={32} strokeWidth={1.5} />
          ) : (
            <BellOff size={32} strokeWidth={1.5} />
          )}
        </div>
        <p
          className="mt-4 text-[15px] font-semibold"
          style={{ color: themeColors.charcoal }}
        >
          {isUnreadTab ? "You're all caught up" : 'No notifications yet'}
        </p>
        <p
          className="mt-1 max-w-[260px] text-[13px]"
          style={{ color: themeColors.mid }}
        >
          {isUnreadTab
            ? 'You have no unread notifications. Check back later.'
            : 'Updates about your wallets, deposits, and account will appear here.'}
        </p>
      </div>
    )
  }

  const renderErrorState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
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
          Failed to load notifications
        </p>
        <p
          className="mt-1 max-w-[260px] text-[13px]"
          style={{ color: themeColors.mid }}
        >
          We couldn't fetch your notifications. Please try again.
        </p>
        <button
          type="button"
          onClick={fetchNotifications}
          className="mt-5 cursor-pointer rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: themeColors.green,
            color: '#FFFFFF',
          }}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:opacity-70 active:scale-95"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.card,
              }}
              aria-label="Back"
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>
            <div>
              <h1
                className="text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-[12px]" style={{ color: themeColors.mid }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all hover:opacity-80 active:scale-95"
              style={{
                backgroundColor: isDark
                  ? 'rgba(15, 185, 110, 0.15)'
                  : 'rgba(15, 185, 110, 0.08)',
                color: themeColors.green,
              }}
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div
          className="mb-4 flex border-b"
          style={{ borderColor: themeColors.border }}
        >
          {(['all', 'unread'] as FilterTab[]).map((tab) => {
            const isActive = activeTab === tab
            const label = tab === 'all' ? 'All' : 'Unread'
            const count =
              tab === 'unread' ? unreadCount : notifications.length

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="relative flex-1 cursor-pointer py-3 text-center text-[13px] font-semibold transition-all duration-200"
                style={{
                  color: isActive ? themeColors.green : themeColors.mid,
                  borderBottom: isActive
                    ? `2px solid ${themeColors.green}`
                    : '2px solid transparent',
                }}
              >
                {label}
                {count > 0 && (
                  <span
                    className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: isActive
                        ? themeColors.green
                        : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.05)',
                      color: isActive ? '#FFFFFF' : themeColors.mid,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-4"
              style={{
                borderColor: themeColors.green,
                borderTopColor: 'transparent',
              }}
            />
          </div>
        ) : hasError ? (
          renderErrorState()
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => {
              const resolvedType = resolveType(notification.type)
              const config = NOTIFICATION_ICONS[resolvedType]
              const Icon = config.icon

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkAsRead(notification)}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-[14px] border p-4 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
                  style={{
                    backgroundColor: notification.isRead
                      ? themeColors.card
                      : isDark
                        ? 'rgba(15, 185, 110, 0.06)'
                        : 'rgba(15, 185, 110, 0.04)',
                    borderColor: notification.isRead
                      ? themeColors.border
                      : isDark
                        ? 'rgba(15, 185, 110, 0.2)'
                        : 'rgba(15, 185, 110, 0.15)',
                    borderLeftWidth: notification.isRead ? '1px' : '3px',
                    borderLeftColor: notification.isRead
                      ? themeColors.border
                      : themeColors.green,
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
                    style={{
                      backgroundColor: config.bg,
                      color: config.color,
                    }}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-[14px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <Circle
                          size={8}
                          fill={themeColors.green}
                          style={{
                            color: themeColors.green,
                            flexShrink: 0,
                            marginTop: 5,
                          }}
                        />
                      )}
                    </div>
                    <p
                      className="mt-0.5 text-[12px] leading-relaxed"
                      style={{ color: themeColors.mid }}
                    >
                      {notification.message}
                    </p>
                    <p
                      className="mt-1.5 text-[11px]"
                      style={{ color: themeColors.light }}
                    >
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </AppLayout>
  )
}