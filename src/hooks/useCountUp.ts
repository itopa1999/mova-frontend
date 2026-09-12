import { useEffect, useRef, useState } from 'react'

export function useCountUp(
  target: number,
  duration: number = 1200,
  start: boolean = true
): number {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!start) return

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)

      setValue(target * eased)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setValue(target)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
      startTimeRef.current = null
    }
  }, [target, duration, start])

  return value
}