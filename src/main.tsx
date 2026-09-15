import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './app/router'
import ThemeProvider from './components/providers/ThemeProvider'
import { MessageHandler } from './components/ui/MessageHandler'
import SplashScreen from './components/ui/SplashScreen'

function Root() {
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
      </MessageHandler>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)