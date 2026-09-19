import type { ReactNode } from 'react'
import { useEffect } from 'react'
import ScrollToTop from '../ui/ScrollToTop'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../services/app/logout'
import AppHeader from '../navigation/AppHeader'
import BottomNav from '../navigation/BottomNav'


import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

interface AppLayoutProps {
  children: ReactNode
}

// ---- Cookie helpers ----
const hasCookie = (name: string): boolean => {
  return document.cookie
    .split('; ')
    .some((row) => row.startsWith(`${name}=`))
}

const clearAllAuthData = (): void => {
  sessionStorage.removeItem('userData')
  localStorage.removeItem('userData')
  logoutUser()
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  useEffect(() => {
    const userData =
      sessionStorage.getItem('userData') ??
      localStorage.getItem('userData')

    const hasAccessToken = hasCookie('access_token')
    const hasRefreshToken = hasCookie('refresh_token')

    // Case 1: userData exists, but BOTH tokens are missing → wipe and go home
    if (!userData && (!hasAccessToken && !hasRefreshToken)) {
      clearAllAuthData()
      navigate('/')
      return
    }

    // Otherwise: user has userData AND at least one token → logged in
  }, [navigate])

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: themeColors.card,
        color: themeColors.charcoal,
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col">
        <AppHeader />

        <main className="min-h-0 flex-1 px-6">
          {children}
        </main>

        <BottomNav />
      </div>
      <ScrollToTop />
    </div>
  )
}