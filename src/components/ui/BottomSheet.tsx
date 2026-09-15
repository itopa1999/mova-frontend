import { X } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  maxWidth?: number
  hideCloseButton?: boolean
  disableBackdropClose?: boolean
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = 480,
  hideCloseButton = false,
  disableBackdropClose = false,
}: BottomSheetProps) {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [isMounted, setIsMounted] = useState(isOpen)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsAnimatingOut(false)
      setIsMounted(true)
    } else if (isMounted) {
      setIsAnimatingOut(true)
      closeTimeoutRef.current = setTimeout(() => {
        setIsMounted(false)
        setIsAnimatingOut(false)
      }, 250)
    }

    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isMounted) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isMounted])

  useEffect(() => {
    if (!isMounted) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isMounted, onClose])

  if (!isMounted) return null

  const handleBackdropClick = () => {
    if (!disableBackdropClose) onClose()
  }

  return (
    <>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          animation: isAnimatingOut
            ? 'bsFadeOut 0.25s ease-in forwards'
            : 'bsFadeIn 0.2s ease-out forwards',
        }}
        aria-hidden="true"
      />

      <div
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Bottom sheet'}
      >
        <div
          className="w-full rounded-t-[20px] border-t"
          style={{
            maxWidth,
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
            animation: isAnimatingOut
              ? 'bsSlideDown 0.25s ease-in forwards'
              : 'bsSlideUp 0.25s ease-out forwards',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div
              className="h-1 w-10 rounded-full"
              style={{ backgroundColor: themeColors.border }}
            />
          </div>

          {(title || !hideCloseButton) && (
            <div className="flex items-start justify-between gap-3 px-5 pt-2 pb-3">
              <div className="flex items-center gap-2.5">
                {icon && (
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(15, 185, 110, 0.15)'
                        : 'rgba(15, 185, 110, 0.08)',
                      color: themeColors.green,
                    }}
                  >
                    {icon}
                  </div>
                )}
                {title && (
                  <p
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {title}
                  </p>
                )}
              </div>

              {!hideCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
                  style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.mid,
                  }}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          <div className="overflow-y-auto px-5 pb-4">{children}</div>

          {footer && (
            <div
              className="border-t px-5 py-4"
              style={{ borderColor: themeColors.border }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bsFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bsFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes bsSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes bsSlideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
      `}</style>
    </>
  )
}