import { useEffect, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

const TAGLINES = [
  'Your money lasts longer.',
  'Say no to your own impulses.',
  'Spend tomorrow on purpose.',
  'Money released on your terms.',
  'Set the rule once. MOVA keeps it.',
  'The money is yours. The timing is ours.',
  'Less willpower. Better schedule.',
  'You decide when, not if.',
  'Make the plan. Let it run.',
  'Stop spending what you saved for later.',
]

const HOLD_MS = 3000       // how long each line stays
const EXIT_MS = 400        // how long the "swipe up out" takes
const ENTER_MS = 400       // how long the "swipe up in" takes
const GAP_MS = 60          // tiny pause between exit and enter

type Phase = 'idle' | 'exiting' | 'entering'

export default function RotatingTagline() {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [index, setIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(1)
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (phase === 'idle') {
      // Hold, then start exiting
      timeout = setTimeout(() => {
        setNextIndex((index + 1) % TAGLINES.length)
        setPhase('exiting')
      }, HOLD_MS)
    } else if (phase === 'exiting') {
      // Current line is sliding up out; when done, swap and enter
      timeout = setTimeout(() => {
        setPhase('entering')
      }, EXIT_MS + GAP_MS)
    } else if (phase === 'entering') {
      // Next line is sliding up in; when done, commit index and idle
      timeout = setTimeout(() => {
        setIndex(nextIndex)
        setPhase('idle')
      }, ENTER_MS)
    }

    return () => clearTimeout(timeout)
  }, [phase, index, nextIndex])

  return (
    <div
      className="relative mb-5 overflow-hidden"
      style={{ height: '28px' }}
    >
      {/* Current line */}
      <span
        className="absolute left-0 top-0 text-[14px] font-semibold tracking-[-0.01em]"
        style={{
          color: themeColors.green,
          transform:
            phase === 'exiting'
              ? 'translateY(-100%)'
              : 'translateY(0)',
          opacity: phase === 'exiting' ? 0 : 1,
          transition:
            phase === 'exiting'
              ? `transform ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1), opacity ${EXIT_MS}ms ease-in`
              : 'none',
        }}
      >
        {TAGLINES[index]}
      </span>

      {/* Next line  only visible during the entering phase */}
      <span
        className="absolute left-0 top-0 text-[14px] font-semibold tracking-[-0.01em]"
        style={{
          color: themeColors.green,
          transform:
            phase === 'entering'
              ? 'translateY(0)'
              : 'translateY(100%)',
          opacity: phase === 'entering' ? 1 : 0,
          transition:
            phase === 'entering'
              ? `transform ${ENTER_MS}ms cubic-bezier(0, 0, 0.2, 1), opacity ${ENTER_MS}ms ease-out`
              : 'none',
        }}
      >
        {TAGLINES[nextIndex]}
      </span>
    </div>
  )
}