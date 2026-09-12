import type { ReactNode } from 'react'

import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({
  children,
  className = '',
}: CardProps) {
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  return (
    <div
      className={`rounded-[18px] border p-4 ${className}`}
      style={{
        backgroundColor:
          themeColors.card,
        borderColor:
          themeColors.border,
      }}
    >
      {children}
    </div>
  )
}