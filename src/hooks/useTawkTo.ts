import { useEffect } from 'react'

declare global {
  interface Window {
    Tawk_API?: {
      maximize?: () => void
      minimize?: () => void
      hideWidget?: () => void
      showWidget?: () => void
      onLoad?: () => void
    }
    Tawk_LoadStart?: Date
  }
}

const TAWK_SRC = 'https://embed.tawk.to/6502cdf70f2b18434fd87797/1ha9f95o4'
const SCRIPT_ID = 'tawkto-script'

export function useTawkTo() {
  useEffect(() => {
    const hideBubble = () => {
      window.Tawk_API?.hideWidget?.()
    }

    // If the script is already loaded, just ensure the bubble stays hidden.
    const existing = document.getElementById(SCRIPT_ID)
    if (existing) {
      hideBubble()
      // Tawk loads async — retry a few times in case it wasn't ready
      const retry = setInterval(hideBubble, 500)
      setTimeout(() => clearInterval(retry), 5000)
      return () => clearInterval(retry)
    }

    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = TAWK_SRC
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')

    const firstScript = document.getElementsByTagName('script')[0]
    firstScript.parentNode?.insertBefore(script, firstScript)

    // Hide the bubble as soon as Tawk finishes loading
    window.Tawk_API.onLoad = hideBubble

    // Belt-and-suspenders: also try immediately and on a short interval
    hideBubble()
    const retry = setInterval(hideBubble, 500)
    setTimeout(() => clearInterval(retry), 5000)

    return () => {
      clearInterval(retry)
    }
  }, [])
}