import {
  Activity,
  Home,
  User,
  Wallet,
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
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    path: '/dashboard',
    icon: Home,
  },
  {
    label: 'Wallets',
    path: '/wallets',
    icon: Wallet,
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: Activity,
  },
  {
    label: 'Profile',
    path: '/profile',
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

  return (
    <nav
      className="sticky bottom-0 z-40 shrink-0 border-t px-3 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]"
      style={{
        backgroundColor:
          themeColors.card,
        borderColor:
          themeColors.border,
      }}
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon

          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(
              `${item.path}/`,
            )

          return (
            <button
              key={item.path}
              type="button"
              onClick={() =>
                navigate(item.path)
              }
              aria-label={item.label}
              aria-current={
                isActive
                  ? 'page'
                  : undefined
              }
              className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-[14px] transition-all duration-200 active:scale-[0.97]"
              style={{
                color: isActive
                  ? themeColors.green
                  : themeColors.mid,
              }}
            >
              <Icon
                size={21}
                strokeWidth={
                  isActive ? 2.3 : 1.8
                }
              />

              <span className="text-[11px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}