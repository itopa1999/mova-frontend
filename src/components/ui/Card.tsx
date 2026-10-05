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
      className={`rounded-[20px] border p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)] transition-colors duration-200 ${className}`}
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