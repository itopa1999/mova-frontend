import { useNavigate, useRouteError } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

export default function RouteErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const themeColors = isDark ? darkColors : colors

  console.error('Route error:', error)

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
          <AlertTriangle
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
          We couldn't load this screen. This is usually temporary — try
          again, or head back to where you were.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ backgroundColor: themeColors.green }}
          >
            <RefreshCw size={17} strokeWidth={2.4} />
            <span>Try again</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/welcome')}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border px-6 py-3.5 text-[15px] font-semibold transition-transform active:scale-[0.98]"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
              color: themeColors.charcoal,
            }}
          >
            <ArrowLeft size={17} strokeWidth={2.4} />
            <span>Back to welcome</span>
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