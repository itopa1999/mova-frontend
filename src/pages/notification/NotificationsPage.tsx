import {
  ArrowLeft,
  BellOff,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Shield,
  Settings,
  CheckCheck,
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
  { icon: typeof Wallet; color: string }
> = {
  deposit: { icon: ArrowDownRight, color: '#16A34A' },
  release: { icon: ArrowUpRight, color: '#2563EB' },
  wallet: { icon: Wallet, color: '#D97706' },
  security: { icon: Shield, color: '#DC2626' },
  system: { icon: Settings, color: '#6B7280' },
  account: { icon: User, color: '#7C3AED' },
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
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      )

      try {
        const response = await markNotificationAsRead(notification.id)
        if (!response.is_success) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, isRead: false } : n
            )
          )
        }
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
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
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

    try {
      const response = await markAllNotificationsAsRead()
      if (!response.is_success) {
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
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`

    return date.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BellOff size={28} strokeWidth={1.5} style={{ color: themeColors.mid }} />
        <p
          className="mt-4 text-[14px] font-medium"
          style={{ color: themeColors.charcoal }}
        >
          {isUnreadTab ? "You're all caught up" : 'No notifications'}
        </p>
        <p
          className="mt-1 max-w-[240px] text-[12px] leading-relaxed"
          style={{ color: themeColors.mid }}
        >
          {isUnreadTab
            ? 'Nothing unread right now.'
            : 'Updates about your wallets, deposits, and account will appear here.'}
        </p>
      </div>
    )
  }

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Frown size={28} strokeWidth={1.5} style={{ color: themeColors.mid }} />
      <p
        className="mt-4 text-[14px] font-medium"
        style={{ color: themeColors.charcoal }}
      >
        Couldn't load notifications
      </p>
      <p className="mt-1 text-[12px]" style={{ color: themeColors.mid }}>
        Something went wrong. Try again.
      </p>
      <button
        type="button"
        onClick={fetchNotifications}
        className="mt-5 cursor-pointer text-[13px] font-semibold"
        style={{ color: themeColors.green }}
      >
        Retry
      </button>
    </div>
  )

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: themeColors.background }}
              aria-label="Back"
            >
              <ArrowLeft size={19} style={{ color: themeColors.charcoal }} />
            </button>
            <h1
              className="text-[19px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Notifications
            </h1>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex cursor-pointer items-center gap-1 text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: themeColors.mid }}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div
          className="mb-4 flex gap-5 border-b"
          style={{ borderColor: themeColors.border }}
        >
          {(['all', 'unread'] as FilterTab[]).map((tab) => {
            const isActive = activeTab === tab
            const label = tab === 'all' ? 'All' : 'Unread'
            const count = tab === 'unread' ? unreadCount : notifications.length

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="relative cursor-pointer pb-3 text-[13px] font-medium transition-colors"
                style={{
                  color: isActive ? themeColors.charcoal : themeColors.mid,
                }}
              >
                {label}
                {count > 0 && (
                  <span
                    className="ml-1.5 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    {count}
                  </span>
                )}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: themeColors.charcoal }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div
              className="h-7 w-7 animate-spin rounded-full border-[3px]"
              style={{
                borderColor: themeColors.border,
                borderTopColor: themeColors.green,
              }}
            />
          </div>
        ) : hasError ? (
          renderErrorState()
        ) : filteredNotifications.length > 0 ? (
          <div
            className="overflow-hidden rounded-[12px] border"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            {filteredNotifications.map((notification, index) => {
              const resolvedType = resolveType(notification.type)
              const config = NOTIFICATION_ICONS[resolvedType]
              const Icon = config.icon
              const isLast = index === filteredNotifications.length - 1

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMarkAsRead(notification)}
                  className="flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  style={{
                    borderBottom: isLast
                      ? 'none'
                      : `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ color: config.color }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p
                        className="truncate text-[13px] font-medium leading-snug"
                        style={{ color: themeColors.charcoal }}
                      >
                        {notification.title}
                      </p>
                      <span
                        className="shrink-0 text-[11px] tabular-nums"
                        style={{ color: themeColors.mid }}
                      >
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p
                      className="mt-0.5 text-[12px] leading-relaxed"
                      style={{ color: themeColors.mid }}
                    >
                      {notification.message}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: themeColors.green }}
                    />
                  )}
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