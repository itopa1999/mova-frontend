import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Lock,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

interface AuthLayoutProps {
  children: ReactNode
}

// Pages that don't require authentication
const PUBLIC_PAGES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/pin-setup',
  '/terms',
  '/privacy',
  '/how-it-works',
]

// Pages that should NOT redirect to dashboard even if userData exists
const EXCLUDED_REDIRECT_PAGES = [
  '/terms',
  '/privacy',
]

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const currentYear = new Date().getFullYear()

  const {
    isDark,
    toggleTheme,
  } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  // Check if user has data in sessionStorage or localStorage
  const userData = sessionStorage.getItem('userData') ?? localStorage.getItem('userData')

  useEffect(() => {
    const currentPath = location.pathname
    const isPublicPage = PUBLIC_PAGES.includes(currentPath)
    const isExcludedRedirect = EXCLUDED_REDIRECT_PAGES.includes(currentPath)

    // If no userData and not on a public page, redirect to home
    if (!userData && !isPublicPage) {
      navigate('/')
      return
    }

    // If userData exists and on a public page (except landing and excluded pages), redirect to dashboard
    if (userData && isPublicPage && currentPath !== '/' && !isExcludedRedirect) {
      navigate('/dashboard')
      return
    }

    // If on landing page and userData exists, redirect to dashboard
    if (userData && currentPath === '/') {
      navigate('/dashboard')
    }
  }, [userData, location.pathname, navigate])

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: themeColors.card,
        color: themeColors.charcoal,
      }}
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
        }}
      >
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-6 py-5">

          {/* =================================================
              LOGO
              ================================================= */}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80 active:scale-[0.98]"
            aria-label="Go to Home"
          >
            {/* Logo Icon */}
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

            {/* Logo Text */}
            <span
              className="font-mono text-[20px] font-bold tracking-[-0.07em]"
              style={{
                color: themeColors.green,
              }}
            >
              MOVA
            </span>
          </button>

          {/* =================================================
              THEME TOGGLE
              ================================================= */}

          <button
            type="button"
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:opacity-80 active:scale-95"
            style={{
              backgroundColor:
                themeColors.background,
              color: themeColors.charcoal,
            }}
            aria-label={
              isDark
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            title={
              isDark
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
          >
            {/* Sun */}
            <span
              className="absolute flex items-center justify-center transition-all duration-300 ease-in-out"
              style={{
                transform: isDark
                  ? 'rotate(0deg) scale(1)'
                  : 'rotate(-90deg) scale(0)',
                opacity: isDark ? 1 : 0,
              }}
            >
              <Sun
                size={18}
                strokeWidth={2}
              />
            </span>

            {/* Moon */}
            <span
              className="absolute flex items-center justify-center transition-all duration-300 ease-in-out"
              style={{
                transform: isDark
                  ? 'rotate(90deg) scale(0)'
                  : 'rotate(0deg) scale(1)',
                opacity: isDark ? 0 : 1,
              }}
            >
              <Moon
                size={18}
                strokeWidth={2}
              />
            </span>
          </button>

        </div>
      </header>

      {/* =====================================================
          BODY
          ===================================================== */}

      <section
        style={{
          backgroundColor: themeColors.card,
        }}
      >
        <div className="mx-auto w-full max-w-[480px] px-6">
          {children}
        </div>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer
        style={{
          backgroundColor: themeColors.card,
        }}
      >
        <div className="mx-auto w-full max-w-[480px] px-6 py-5">
          <p
            className="text-center text-[11px]"
            style={{
              color: themeColors.light,
            }}
          >
            MOVA v1 @ {currentYear}
          </p>
        </div>
      </footer>
    </main>
  )
}