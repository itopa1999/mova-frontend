import { ArrowLeft } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

interface BackButtonProps {
  onClick: () => void
  size?: 'small' | 'medium'
  variant?: 'subtle' | 'outlined' | 'text'
  showLabel?: boolean
  className?: string
}

export default function BackButton({
  onClick,
  size = 'medium',
  variant = 'outlined',
  showLabel = false,
  className = '',
}: BackButtonProps) {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const dimension = size === 'small' ? 36 : 40

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 cursor-pointer items-center justify-center transition-all hover:opacity-70 active:scale-95 ${
        showLabel
          ? 'gap-2 text-[13px] font-medium'
          : 'rounded-full'
      } ${className}`}
      style={{
        width: showLabel ? undefined : dimension,
        height: showLabel ? undefined : dimension,
        backgroundColor:
          variant === 'outlined'
            ? themeColors.card
            : variant === 'subtle'
              ? themeColors.background
              : 'transparent',
        border:
          variant === 'outlined'
            ? `1px solid ${themeColors.border}`
            : '1px solid transparent',
        color: variant === 'text' ? themeColors.mid : themeColors.charcoal,
      }}
      aria-label="Go back"
    >
      <ArrowLeft size={showLabel ? 16 : size === 'small' ? 19 : 20} />
      {showLabel && <span>Back</span>}
    </button>
  )
}
