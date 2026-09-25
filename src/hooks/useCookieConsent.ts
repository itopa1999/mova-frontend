import { useCallback, useState } from 'react'

const CONSENT_KEY = 'mova_cookie_consent_v1'

interface ConsentRecord {
  status: 'accepted'
  decidedAt: string
}

function readConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as ConsentRecord
    if (parsed?.status === 'accepted') return parsed

    return null
  } catch {
    return null
  }
}

export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    return readConsent() !== null
  })

  const accept = useCallback(() => {
    const record: ConsentRecord = {
      status: 'accepted',
      decidedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record))
    } catch {
      // localStorage may be unavailable (private mode, quota) — ignore
    }

    setHasConsent(true)
  }, [])

  return { hasConsent, accept }
}