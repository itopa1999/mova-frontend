import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ThemeContext,
  type Theme,
} from '../../hooks/useTheme'

interface ThemeProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'mova-theme'

function getStoredTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
  }
  return null
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export default function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => getStoredTheme() ?? getSystemTheme(),
  )

  const [hasManualOverride, setHasManualOverride] = useState<boolean>(
    () => getStoredTheme() !== null,
  )

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [theme])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
      if (!hasManualOverride) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    if (mql.addEventListener) {
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }

    mql.addListener(handler)
    return () => mql.removeListener(handler)
  }, [hasManualOverride])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const next: Theme =
        currentTheme === 'light' ? 'dark' : 'light'

      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
      }

      return next
    })

    setHasManualOverride(true)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
    }),
    [theme, toggleTheme],
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}