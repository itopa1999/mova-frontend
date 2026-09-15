import { useEffect, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

const LOGO_URL =
  'https://res.cloudinary.com/et0r3out/image/upload/v1789426234/9.png'

const TOTAL_DURATION = 26000
const TRANSITION_DURATION = 1000

const BEATS = [
  {
    text: 'The money was there.',
    duration: 3200,
    mood: 'dim',
  },
  {
    text: "And then it wasn't.",
    duration: 3200,
    mood: 'dim',
  },
  {
    text: 'Not stolen. Not lost. Just spent.',
    duration: 3400,
    mood: 'dim',
  },
  {
    text: 'MOVA puts it out of easy reach.',
    duration: 3200,
    mood: 'green',
  },
  {
    text: 'Set a rule. Money releases on schedule.',
    duration: 3400,
    mood: 'green',
  },
  {
    text: 'You stop deciding in the moment.',
    duration: 3200,
    mood: 'full',
  },
  {
    text: 'Your money lasts the way you planned.',
    duration: 3400,
    mood: 'full',
  },
]

const TEXT_DURATION = BEATS.reduce(
  (total, beat) => total + beat.duration,
  0
)

const MOOD_COLORS: Record<string, { light: string; dark: string }> = {
  dim: {
    light: '#F3F4F6',
    dark: '#0F1115',
  },
  green: {
    light: '#E8F8F0',
    dark: '#0A1F17',
  },
  full: {
    light: '#DCF4E8',
    dark: '#062B1C',
  },
  logo: {
    light: '#FFFFFF',
    dark: '#000000',
  },
}

interface SplashScreenProps {
  onFinish?: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    let elapsed = 0

    BEATS.forEach((beat, index) => {
      if (index === BEATS.length - 1) {
        return
      }

      elapsed += beat.duration

      const timer = setTimeout(() => {
        setPreviousIndex(index)
        setCurrentIndex(index + 1)
        setIsTransitioning(true)

        const transitionTimer = setTimeout(() => {
          setPreviousIndex(null)
          setIsTransitioning(false)
        }, TRANSITION_DURATION)

        timers.push(transitionTimer)
      }, elapsed)

      timers.push(timer)
    })

    // Show the MOVA logo after all statements have finished.
    const logoTimer = setTimeout(() => {
      setPreviousIndex(null)
      setIsTransitioning(false)
      setShowLogo(true)
    }, TEXT_DURATION)

    timers.push(logoTimer)

    // Start the final fade before the splash finishes.
    const leaveTimer = setTimeout(() => {
      setIsLeaving(true)
    }, TOTAL_DURATION - 700)

    timers.push(leaveTimer)

    const finishTimer = setTimeout(() => {
      onFinish?.()
    }, TOTAL_DURATION)

    timers.push(finishTimer)

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [onFinish])

  const currentBeat = BEATS[currentIndex]

  const previousBeat =
    previousIndex !== null
      ? BEATS[previousIndex]
      : null

  const activeMood = showLogo
    ? 'logo'
    : currentBeat?.mood ?? 'full'

  const moodColor = MOOD_COLORS[activeMood]

  const backgroundColor = isDark
    ? moodColor.dark
    : moodColor.light

  return (
    <div
      className={`mova-splash ${
        isLeaving ? 'mova-splash-leaving' : ''
      }`}
      style={{
        backgroundColor,
      }}
    >
      <div
        className={`mova-splash-glow ${
          showLogo ? 'mova-glow-hidden' : ''
        }`}
        style={{
          background: `radial-gradient(
            circle at center,
            ${themeColors.green}20 0%,
            transparent 68%
          )`,
        }}
      />

      <div className="mova-stage">
        {!showLogo && currentBeat && (
          <div className="mova-text-stage">
            {isTransitioning && previousBeat && (
              <div className="mova-statement mova-statement-out">
                <p style={{ color: themeColors.charcoal }}>
                  {previousBeat.text}
                </p>
              </div>
            )}

            <div
              key={currentIndex}
              className={`mova-statement ${
                isTransitioning
                  ? 'mova-statement-in'
                  : 'mova-statement-visible'
              }`}
            >
              <p style={{ color: themeColors.charcoal }}>
                {currentBeat.text}
              </p>
            </div>
          </div>
        )}

        {showLogo && (
          <div className="mova-logo-container">
            <div className="mova-logo-mark">
              <img
                src={LOGO_URL}
                alt="MOVA"
                draggable={false}
              />
            </div>

            <h1
              className="mova-logo-wordmark"
              style={{
                color: themeColors.green,
              }}
            >
              MOVA
            </h1>

            <p
              className="mova-logo-tagline"
              style={{
                color: themeColors.mid,
              }}
            >
              Control when your money is available
            </p>
          </div>
        )}
      </div>

      {!showLogo && (
        <div className="mova-progress">
          <div
            className="mova-progress-track"
            style={{
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.06)',
            }}
          >
            <div
              key={currentIndex}
              className="mova-progress-fill"
              style={{
                backgroundColor: themeColors.green,
                animationDuration: `${currentBeat.duration}ms`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}