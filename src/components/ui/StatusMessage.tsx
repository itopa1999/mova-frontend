import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import type { ToastType } from '../../utils/notifications'

interface StatusMessageProps {
  type: ToastType
  message: string
  onClose?: () => void
  className?: string
  closeLabel?: string
  animation?: string
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
}

export default function StatusMessage({
  type,
  message,
  onClose,
  className = '',
  closeLabel = 'Close message',
  animation,
}: StatusMessageProps) {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const Icon = ICONS[type]

  const color = {
    success: themeColors.green,
    error: themeColors.red,
    warning: themeColors.warning,
    info: themeColors.charcoal,
  }[type]

  const backgroundColor = {
    success: themeColors.greenLight,
    error: themeColors.redBackground,
    warning: themeColors.warningBackground,
    info: themeColors.background,
  }[type]

  return (
    <div
      className={`flex items-start gap-3 rounded-[14px] border px-4 py-3.5 ${className}`}
      style={{
        backgroundColor,
        borderColor: themeColors.border,
        animation,
      }}
      role="alert"
    >
      <Icon
        size={19}
        strokeWidth={2}
        className="mt-0.5 shrink-0"
        style={{ color }}
      />

      <p
        className="flex-1 text-[13px] font-medium leading-[1.45]"
        style={{ color: themeColors.charcoal }}
      >
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0"
          aria-label={closeLabel}
        >
          <X
            size={17}
            strokeWidth={1.8}
            style={{ color: themeColors.mid }}
          />
        </button>
      )}
    </div>
  )
}
