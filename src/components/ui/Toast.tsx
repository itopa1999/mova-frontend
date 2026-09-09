import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { colors } from '../../styles/tokens'

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'

interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose: () => void
}

export default function Toast({
  type,
  message,
  duration = 4000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const config = {
    success: {
      icon: CheckCircle2,
      background: colors.greenLight,
      iconColor: colors.green,
    },
    error: {
      icon: AlertCircle,
      background: colors.redBackground,
      iconColor: colors.red,
    },
    warning: {
      icon: AlertCircle,
      background: colors.warningBackground,
      iconColor: colors.warning,
    },
    info: {
      icon: Info,
      background: colors.background,
      iconColor: colors.charcoal,
    },
  }[type]

  const Icon = config.icon

  return (
    <div
      className="flex w-full items-center gap-3 rounded-[16px] border px-4 py-3.5 shadow-lg"
      style={{
        backgroundColor: config.background,
        borderColor: colors.border,
        animation: 'toastIn 250ms ease-out, toastOut 300ms ease-in 3.7s forwards',
      }}
    >
      <Icon
        size={20}
        strokeWidth={2}
        style={{
          color: config.iconColor,
        }}
      />

      <p
        className="flex-1 text-[13px] font-medium leading-[1.4]"
        style={{
          color: colors.charcoal,
        }}
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="shrink-0"
        aria-label="Close notification"
      >
        <X
          size={17}
          strokeWidth={1.8}
          style={{
            color: colors.mid,
          }}
        />
      </button>
    </div>
  )
}