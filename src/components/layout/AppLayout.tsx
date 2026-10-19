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
    
    if (!userData) {
      throw new Error("Test error page");
      logoutUser()
      navigate('/welcome')
    }
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

        <main className="min-h-0 flex-1 overflow-y-auto px-3 sm:px-4 lg:px-0">
          {children}
        </main>

        <BottomNav />
      </div>
      <ScrollToTop />
    </div>
  )
}