import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import Root from './app/Root'

const APP_VERSION = '2'

async function selfHealServiceWorker() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  const storedVersion = sessionStorage.getItem('mova-app-version')

  if (storedVersion === APP_VERSION) return

  sessionStorage.setItem('mova-app-version', APP_VERSION)

  try {
    const regs = await navigator.serviceWorker.getRegistrations()

    if (regs.length === 0) return

    await Promise.all(regs.map((r) => r.unregister()))

    const cacheKeys = await caches.keys()
    await Promise.all(cacheKeys.map((k) => caches.delete(k)))
 
    window.location.reload()
  } catch {
    // Ignore errors, we don't want to block the app from loading
  }
}

selfHealServiceWorker()

const updateSW = registerSW({
  immediate: true,

  onRegisteredSW(_swUrl, registration) {
    if (!registration) return

    setInterval(
      () => {
        registration.update().catch(() => {})
      },
      60 * 60 * 1000,
    )
  },

  onNeedRefresh() {
    updateSW(true)
  },
})

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)