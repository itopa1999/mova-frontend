import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { LoaderCircle } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  fullWidth = true,
  className = '',
  ...buttonProps
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
      disabled={isDisabled}
      className={`flex ${fullWidth ? 'w-full' : 'w-auto'} cursor-pointer items-center justify-center gap-2 rounded-[15px] px-4 text-[15px] font-semibold tracking-[-0.01em] shadow-sm transition-all duration-200 hover:brightness-[0.97] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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
        paddingTop: isPrimary ? 15 : 13,
        paddingBottom: isPrimary ? 15 : 13,
      }}
      {...buttonProps}
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