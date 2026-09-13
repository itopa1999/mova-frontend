import {
  Lock,
  Bell,
} from 'lucide-react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useEffect, useState } from 'react'

import { useTheme } from '../../hooks/useTheme'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

export default function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/wallets': 'Your Wallet',
    '/analytics': 'Monthly Analytics',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/wallet': 'Wallet',
    '/notifications': 'Notifications',
  }

  // Get user initial from session
  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}')
  const fullName = userData.fullName || 'User'
  const initial = fullName.charAt(0).toUpperCase()

  const title =
    pageTitles[location.pathname] ?? 'MOVA'

  // Read the initial badge state from sessionStorage so it survives navigation
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState<boolean>(
    () => sessionStorage.getItem('hasUnreadNotifications') === 'true'
  )

  // Listen for the global event fired by the API interceptor
  useEffect(() => {
    const handleNotification = () => {
      setHasUnreadNotifications(true)
      sessionStorage.setItem('hasUnreadNotifications', 'true')
    }

    window.addEventListener('notificationReceived', handleNotification)

    return () => {
      window.removeEventListener('notificationReceived', handleNotification)
    }
  }, [])

  useEffect(() => {
    if (location.pathname === '/notifications') {
      setHasUnreadNotifications(false)
      sessionStorage.removeItem('hasUnreadNotifications')
    }
  }, [location.pathname])

  return (
    <header
      className="sticky top-0 z-40 shrink-0 border-b"
      style={{
        backgroundColor:
          themeColors.card,
        borderColor:
          themeColors.border,
      }}
    >
      <div className="mx-auto flex h-[64px] w-full max-w-[480px] items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Logo Icon */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex cursor-pointer items-center gap-2.5 transition-opacity duration-200 hover:opacity-80 active:scale-[0.98]"
            aria-label="Go to Home"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[9px]"
              style={{
                backgroundColor:
                  themeColors.green,
              }}
            >
              <Lock
                size={15}
                strokeWidth={2.4}
                color="#FFFFFF"
              />
            </div>
          </button>

          {/* Page Title */}
          <h1
            className="truncate text-[17px] font-semibold tracking-[-0.01em]"
            style={{
              color:
                themeColors.charcoal,
            }}
          >
            {title}
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.charcoal,
            }}
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={2} />

            {/* Red dot badge */}
            {hasUnreadNotifications && (
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: '#EF4444',
                  boxShadow: `0 0 0 2px ${themeColors.background}`,
                }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
            aria-label="Settings"
          >
            <span className="text-[15px] font-bold">
              {initial}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}