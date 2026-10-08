import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import ThemeProvider from '../components/providers/ThemeProvider'
import { MessageHandler } from '../components/ui/MessageHandler'
import SplashScreen from '../components/ui/SplashScreen'
import CookieBanner from '../components/ui/CookieBanner'

export default function Root() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('mova-splash-seen')
  })

  const handleSplashFinish = () => {
    sessionStorage.setItem('mova-splash-seen', '1')
    setShowSplash(false)
  }

  return (
    <ThemeProvider>
      <MessageHandler>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <RouterProvider router={router} />
        <CookieBanner />
      </MessageHandler>
    </ThemeProvider>
  )
}