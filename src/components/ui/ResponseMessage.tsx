import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react'
import { colors } from '../../styles/tokens'
import type { ToastType } from './Toast'

interface ResponseMessageProps {
  type: ToastType
  message: string
  onClose?: () => void
}

export default function ResponseMessage({
  type,
  message,
  onClose,
}: ResponseMessageProps) {
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
      className="mb-5 flex items-start gap-3 rounded-[14px] border px-4 py-3.5"
      style={{
        backgroundColor: config.background,
        borderColor: colors.border,
        animation: 'responseMessageIn 280ms ease-out',
      }}
      role="alert"
    >
      <Icon
        size={19}
        strokeWidth={2}
        className="mt-0.5 shrink-0"
        style={{
          color: config.iconColor,
        }}
      />

      <p
        className="flex-1 text-[13px] font-medium leading-[1.45]"
        style={{
          color: colors.charcoal,
        }}
      >
        {message}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0"
          aria-label="Close message"
        >
          <X
            size={17}
            strokeWidth={1.8}
            style={{
              color: colors.mid,
            }}
          />
        </button>
      )}
    </div>
  )
}