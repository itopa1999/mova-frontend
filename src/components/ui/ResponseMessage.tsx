import StatusMessage from './StatusMessage'
import type { ToastType } from '../../utils/notifications'

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
  return (
    <StatusMessage
      type={type}
      message={message}
      onClose={onClose}
      className="mb-5"
      animation="responseMessageIn 280ms ease-out"
    />
  )
}