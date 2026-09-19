// src/components/ui/ScrollToTop.tsx

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

interface ScrollToTopProps {
  /** Show after this many pixels of scroll. Default: 300 */
  threshold?: number
}

export default function ScrollToTop({
  threshold = 300,
}: ScrollToTopProps) {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    // Fixed wrapper — centers the button inside the same 480px column
    <div className="pointer-events-none fixed inset-0 z-40 flex justify-center">
      <div className="relative h-full w-full max-w-[480px]">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="pointer-events-auto absolute flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95"
          style={{
            bottom: '84px',
            right: '20px',

            // 👇 Transparent green so content behind stays visible
            backgroundColor: isDark
              ? 'rgba(74, 222, 128, 0.55)'
              : 'rgba(27, 107, 58, 0.55)',
            color: '#FFFFFF',

            // 👇 Backdrop blur to keep it readable over text
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',

            // 👇 Soft border to keep it visible on same-colored backgrounds
            border: isDark
              ? '1px solid rgba(74, 222, 128, 0.35)'
              : '1px solid rgba(255, 255, 255, 0.35)',

            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? 'translateY(0) scale(1)'
              : 'translateY(12px) scale(0.85)',

            boxShadow: isDark
              ? '0 6px 16px rgba(0,0,0,0.35)'
              : '0 6px 16px rgba(0,0,0,0.12)',
          }}
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}