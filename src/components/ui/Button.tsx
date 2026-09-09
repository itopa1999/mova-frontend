import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
}

export default function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
}: ButtonProps) {
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const isPrimary = variant === 'primary'
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className="flex w-full items-center justify-center gap-2 rounded-[14px] px-4 text-[16px] font-semibold tracking-[-0.01em] transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        backgroundColor: isPrimary
          ? themeColors.green
          : 'transparent',
        color: isPrimary
          ? '#FFFFFF'
          : themeColors.green,
        border: isPrimary
          ? 'none'
          : `1.5px solid ${themeColors.border}`,
        paddingTop: isPrimary ? 16 : 14,
        paddingBottom: isPrimary ? 16 : 14,
      }}
    >
      {loading && (
        <LoaderCircle
          size={18}
          strokeWidth={2}
          className="animate-spin"
        />
      )}

      <span>
        {loading ? loadingText : children}
      </span>
    </button>
  )
}