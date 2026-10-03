import { useEffect } from 'react'
import StatusMessage from './StatusMessage'
import type { ToastType } from '../../utils/notifications'

export type { ToastType } from '../../utils/notifications'

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

  return (
    <div
      className="w-full rounded-[16px] shadow-lg"
      style={{
        animation: `toastIn 250ms ease-out, toastOut 300ms ease-in ${Math.max(duration - 300, 0)}ms forwards`,
      }}
    >
      <StatusMessage
        type={type}
        message={message}
        onClose={onClose}
        closeLabel="Close notification"
      />
    </div>
  )
}