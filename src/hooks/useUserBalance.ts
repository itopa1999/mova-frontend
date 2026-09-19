// src/hooks/useUserBalance.ts

import { useCallback, useEffect, useState } from 'react'

const SESSION_KEY = 'userData'
const UPDATE_EVENT = 'userBalanceUpdated'

const readBalanceFromSession = (): number => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return 0

    const parsed = JSON.parse(raw)
    const balance = parsed?.balance

    // Support both shapes that exist in the app:
    //   balance: 1234                          → bare number
    //   balance: { userBalance: 1234, ... }    → object
    if (typeof balance === 'number') return balance
    if (balance && typeof balance.userBalance === 'number') {
      return balance.userBalance
    }

    return 0
  } catch {
    return 0
  }
}

/**
 * Reads the user's main MOVA balance from sessionStorage and re-renders
 * whenever it changes. Also exposes `updateBalance` to write a new value
 * and notify all listeners.
 */
export const UseUserBalance = () => {
  const [userBalance, setUserBalance] = useState<number>(() =>
    readBalanceFromSession()
  )

  const refresh = useCallback(() => {
    setUserBalance(readBalanceFromSession())
  }, [])

  const updateBalance = useCallback((balance: number) => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      const parsed = raw ? JSON.parse(raw) : {}

      const next = {
        ...parsed,
        balance,
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setUserBalance(balance)

      window.dispatchEvent(
        new CustomEvent<number>(UPDATE_EVENT, { detail: balance })
      )
    } catch (err) {
      console.error('Failed to update balance in sessionStorage', err)
    }
  }, [])

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail
      setUserBalance(
        typeof detail === 'number' ? detail : readBalanceFromSession()
      )
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) refresh()
    }

    window.addEventListener(UPDATE_EVENT, handleUpdate)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [refresh])

  return { userBalance, updateBalance, refresh }
}

export default UseUserBalance