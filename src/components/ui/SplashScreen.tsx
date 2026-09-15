import { useEffect, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

const LOGO_URL =
  'https://res.cloudinary.com/et0r3out/image/upload/v1789426234/9.png'

const LOGO_FADE_IN_MS = 900
const TAGLINE_START_AT = 700
const TAGLINE_FADE_IN_MS = 900
const HOLD_MS = 1800
const FADE_OUT_MS = 700

const TOTAL_DURATION =
  TAGLINE_START_AT + TAGLINE_FADE_IN_MS + HOLD_MS + FADE_OUT_MS

interface SplashScreenProps {
  onFinish?: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [showTagline, setShowTagline] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(
      setTimeout(() => setShowTagline(true), TAGLINE_START_AT)
    )

    const leaveAt =
      TAGLINE_START_AT + TAGLINE_FADE_IN_MS + HOLD_MS

    timers.push(
      setTimeout(() => setIsLeaving(true), leaveAt)
    )

    timers.push(
      setTimeout(() => onFinish?.(), TOTAL_DURATION)
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [onFinish])

  return (
    <div
      className="mova-splash"
      style={{
        backgroundColor: '#FFFFFF',
        opacity: isLeaving ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms ease-out`,
      }}
    >
      <div className="mova-logo-container">
        <div
          className="mova-logo-mark"
          style={{ animationDuration: `${LOGO_FADE_IN_MS}ms` }}
        >
          <img
            src={LOGO_URL}
            alt="MOVA"
            draggable={false}
          />
        </div>

        {showTagline && (
          <p
            className="mova-logo-tagline"
            style={{
              color: themeColors.mid,
              animationDuration: `${TAGLINE_FADE_IN_MS}ms`,
            }}
          >
            Control when your money is available
          </p>
        )}
      </div>
    </div>
  )
}