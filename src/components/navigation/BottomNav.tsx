import {
  Activity,
  Home,
  User,
  Wallet,
  MoreHorizontal,
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
    path: '/analytics',
    icon: Activity,
  },
  {
    label: 'Wallets',
    path: '/wallets',
    icon: Wallet,
    isCenter: true,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
  },
  {
    label: 'More',
    path: '/settings',
    icon: MoreHorizontal,
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const isItemActive = (path: string) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`)

  return (
    <nav
      className="sticky bottom-0 z-40 shrink-0 border-t px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]"
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
                  className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full border-4 transition-all duration-200 active:scale-[0.95]"
                  style={{
                    backgroundColor: themeColors.green,
                    borderColor: themeColors.card,
                    boxShadow: isActive
                      ? `0 6px 16px ${themeColors.green}66`
                      : `0 4px 12px ${themeColors.green}33`,
                  }}
                >
                  <Icon
                    size={24}
                    strokeWidth={2.4}
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
              className="flex min-h-[54px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[12px] transition-all duration-200 active:scale-[0.97]"
              style={{
                color: isActive
                  ? themeColors.green
                  : themeColors.mid,
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