import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
    const userData = sessionStorage.getItem('userData') ?? localStorage.getItem('userData')
    
    const hasAccessToken = document.cookie
      .split('; ')
      .some(row => row.startsWith('access_token='))

    if (!userData && !hasAccessToken) {
      navigate('/')
    }

  }, [navigate])

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor:
          themeColors.card,
        color:
          themeColors.charcoal,
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col">
        <AppHeader />

        <main className="min-h-0 flex-1 px-6">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  )
}