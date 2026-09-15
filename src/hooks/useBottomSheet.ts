import { useCallback, useState } from 'react'

export function useBottomSheet<T extends string = string>() {
  const [activeSheet, setActiveSheet] = useState<T | null>(null)

  const open = useCallback((name: T) => setActiveSheet(name), [])
  const close = useCallback(() => setActiveSheet(null), [])
  const isOpen = useCallback(
    (name: T) => activeSheet === name,
    [activeSheet]
  )

  return { activeSheet, open, close, isOpen }
}