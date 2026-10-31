import {
  Activity,
  Home,
  User,
  Wallet,
  LayoutGrid,
} from 'lucide-react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useTheme } from '../../hooks/useTheme'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

type NavItem = {
  label: string
  path: string
  icon: typeof Home
  isCenter?: boolean
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    path: '/dashboard',
    icon: Home,
  },
  {
    label: 'Analytics',
    path: '/dashboard/analytics',
    icon: Activity,
  },
  {
    label: 'Wallets',
    path: '/dashboard/wallets',
    icon: Wallet,
    isCenter: true,
  },
  {
    label: 'Services',
    path: '/dashboard/services',
    icon: LayoutGrid,
  },
  {
    label: 'Me',
    path: '/dashboard/settings',
    icon: User,
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const isItemActive = (path: string) => {
    if (location.pathname === path) return true

    if (path === '/dashboard') return false

    return location.pathname.startsWith(`${path}/`)
  }

  return (
    <nav
      className="sticky bottom-0 z-40 shrink-0 border-t px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.04)]"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-5 gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isItemActive(item.path)

          // ─── Center item — raised circular button ───
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex min-h-[54px] cursor-pointer flex-col items-center justify-center"
              >
                <div
                  className="-mt-4 flex h-12 w-12 items-center justify-center rounded-full border-[3px] transition-all duration-200 active:scale-[0.95]"
                  style={{
                    backgroundColor: themeColors.green,
                    borderColor: themeColors.card,
                    boxShadow: isActive
                      ? `0 4px 10px ${themeColors.green}55`
                      : `0 2px 6px ${themeColors.green}33`,
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={2.3}
                    style={{ color: '#FFFFFF' }}
                  />
                </div>

                <span
                  className="mt-1 text-[10px] font-semibold leading-none"
                  style={{
                    color: isActive
                      ? themeColors.green
                      : themeColors.mid,
                  }}
                >
                  {item.label}
                </span>
              </button>
            )
          }

          // ─── Regular items ───
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[14px] transition-all duration-200 active:scale-[0.97]"
              style={{
                color: isActive
                  ? themeColors.green
                  : themeColors.mid,
                backgroundColor: isActive
                  ? themeColors.greenLight
                  : 'transparent',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.3 : 1.8}
              />

              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}