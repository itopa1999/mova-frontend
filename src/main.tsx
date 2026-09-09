import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './app/router'
import ThemeProvider from './components/providers/ThemeProvider'
import { MessageHandler } from './components/ui/MessageHandler'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <MessageHandler>
        <RouterProvider router={router} />
      </MessageHandler>
    </ThemeProvider>
  </StrictMode>,
)