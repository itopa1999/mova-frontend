import type { ReactNode } from 'react'

import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

interface BadgeProps {
  children: ReactNode
  variant?: 'green' | 'warning' | 'red' | 'neutral'
}

export default function Badge({
  children,
  variant = 'green',
}: BadgeProps) {
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const styles = {
    green: {
      backgroundColor:
        themeColors.greenLight,
      color: themeColors.green,
    },
    warning: {
      backgroundColor:
        themeColors.warningBackground,
      color: themeColors.warning,
    },
    red: {
      backgroundColor:
        themeColors.redBackground,
      color: themeColors.red,
    },
    neutral: {
      backgroundColor:
        themeColors.background,
      color: themeColors.mid,
    },
  }

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={styles[variant]}
    >
      {children}
    </span>
  )
}