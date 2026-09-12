import {
  Delete,
  LockKeyhole,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

type KeypadKey = number | null | 'delete'

export interface PinModalProps {
  isOpen: boolean
  title?: string
  description?: string
  onClose: () => void
  onVerify: (pin: string) => Promise<void> | void
  isLoading?: boolean
  maxLength?: number
}

export default function PinModal({
  isOpen,
  title = 'Enter PIN',
  description = 'Please enter your 6-digit PIN to continue.',
  onClose,
  onVerify,
  isLoading = false,
  maxLength = 6,
}: PinModalProps) {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setPin('')
      setError(null)
      setIsVerifying(false)
    }
  }, [isOpen])

  const keypadKeys: KeypadKey[] = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    null, 0, 'delete',
  ]

  const handleNumberPress = (number: number) => {
    if (isVerifying || isLoading) return
    if (pin.length >= maxLength) return
    setError(null)
    setPin((current) => `${current}${number}`)
  }

  const handleDelete = () => {
    if (isVerifying || isLoading) return
    if (pin.length === 0) return
    setError(null)
    setPin((current) => current.slice(0, -1))
  }

  const handleVerify = async () => {
    if (isVerifying || isLoading) return
    if (pin.length !== maxLength) {
      setError(`Please enter a ${maxLength}-digit PIN.`)
      return
    }

    setError(null)
    setIsVerifying(true)

    try {
      await onVerify(pin)
      // If successful, the parent component will close the modal
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid PIN. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClose = () => {
    if (pin.length > 0 && !isVerifying) {
      if (!confirm('Are you sure you want to cancel? Your progress will be lost.')) {
        return
      }
    }
    onClose()
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, pin, isVerifying])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVerifying || isLoading) return
      
      if (e.key >= '0' && e.key <= '9') {
        handleNumberPress(parseInt(e.key))
      } else if (e.key === 'Backspace') {
        handleDelete()
      } else if (e.key === 'Enter') {
        handleVerify()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, pin, isVerifying, isLoading])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-[400px] rounded-[24px] p-6 shadow-xl"
        style={{ backgroundColor: themeColors.card }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[12px]"
              style={{ backgroundColor: themeColors.greenLight }}
            >
              <LockKeyhole size={20} style={{ color: themeColors.green }} />
            </div>
            <h2
              className="text-[18px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 transition-all hover:opacity-70"
            style={{ color: themeColors.mid }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p
          className="mb-6 text-[13px] leading-relaxed"
          style={{ color: themeColors.mid }}
        >
          {description}
        </p>

        {/* PIN Dots */}
        <div className="mb-3 flex items-center justify-center gap-4">
          {Array.from({ length: maxLength }).map((_, index) => {
            const isFilled = index < pin.length
            return (
              <div
                key={index}
                className="h-4 w-4 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: isFilled
                    ? themeColors.green
                    : themeColors.border,
                  transform: isFilled ? 'scale(1)' : 'scale(0.9)',
                }}
              />
            )
          })}
        </div>

        {/* PIN Status */}
        <p
          className="mb-4 text-center text-[12px]"
          style={{ color: themeColors.mid }}
        >
          {pin.length === maxLength ? 'PIN complete' : `Enter ${maxLength}-digit PIN`}
        </p>

        {/* Error */}
        {error && (
          <div
            className="mb-4 rounded-[12px] px-4 py-2.5 text-center text-[13px]"
            style={{
              color: themeColors.red,
              backgroundColor: themeColors.redBackground,
            }}
          >
            {error}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {keypadKeys.map((key, index) => {
            if (key === null) {
              return <div key={`empty-${index}`} className="h-[52px]" />
            }

            if (key === 'delete') {
              return (
                <button
                  key="delete"
                  type="button"
                  onClick={handleDelete}
                  disabled={isVerifying || isLoading || pin.length === 0}
                  className="flex h-[52px] items-center justify-center rounded-[14px] transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.charcoal,
                  }}
                >
                  <Delete size={20} strokeWidth={2} />
                </button>
              )
            }

            return (
              <button
                key={`number-${key}`}
                type="button"
                onClick={() => handleNumberPress(key)}
                disabled={isVerifying || isLoading || pin.length >= maxLength}
                className="flex h-[52px] items-center justify-center rounded-[14px] text-[20px] font-bold tracking-[-0.02em] transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.charcoal,
                }}
              >
                {key}
              </button>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-[14px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
            style={{
              backgroundColor: 'transparent',
              border: `1px solid ${themeColors.border}`,
              color: themeColors.mid,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || isLoading || pin.length !== maxLength}
            className="flex-1 rounded-[14px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            {isVerifying || isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2"
                  style={{
                    borderColor: '#FFFFFF',
                    borderTopColor: 'transparent',
                  }}
                />
                Verifying...
              </div>
            ) : (
              'Verify'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}