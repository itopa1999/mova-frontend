import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertOctagon, ArrowLeft, RefreshCw } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { colors, darkColors } from '../styles/tokens'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

function ErrorFallback() {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: themeColors.card }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center px-6 py-12">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <AlertOctagon
            size={36}
            strokeWidth={2}
            color={themeColors.green}
          />
        </div>

        <h1
          className="mt-6 text-center text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em]"
          style={{ color: themeColors.charcoal }}
        >
          Something went wrong
        </h1>

        <p
          className="mt-3 max-w-[340px] text-center text-[14px] leading-[1.6]"
          style={{ color: themeColors.mid }}
        >
          An unexpected error stopped this screen from loading. Try again,
          or go back to the home screen.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ backgroundColor: themeColors.green }}
          >
            <RefreshCw size={17} strokeWidth={2.4} />
            <span>Try again</span>
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border px-6 py-3.5 text-[15px] font-semibold transition-transform active:scale-[0.98]"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
              color: themeColors.charcoal,
            }}
          >
            <ArrowLeft size={17} strokeWidth={2.4} />
            <span>Back to home</span>
          </button>
        </div>

        <p
          className="mt-10 text-center text-[11px]"
          style={{ color: themeColors.light }}
        >
          If this keeps happening, please contact MOVA support.
        </p>
      </div>
    </main>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error caught by boundary:', error, info)

    // Optional: send to Sentry
    // import * as Sentry from '@sentry/react'
    // Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }

    return this.props.children
  }
}