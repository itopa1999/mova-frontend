import {
  useEffect,
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

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(STORAGE_KEY)

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }

  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches

  return prefersDark ? 'dark' : 'light'
}

export default function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    getInitialTheme,
  )

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle('dark', theme === 'dark')

    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'light'
        ? 'dark'
        : 'light',
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}