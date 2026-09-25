import { Cookie } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useCookieConsent } from '../../hooks/useCookieConsent'
import { colors, darkColors } from '../../styles/tokens'

export default function CookieBanner() {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const { hasConsent, accept } = useCookieConsent()

  if (hasConsent) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[200] flex justify-center px-3 pb-3"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="flex w-full max-w-[480px] items-start gap-3 rounded-[16px] border p-3.5 shadow-lg"
        style={{
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          pointerEvents: 'auto',
          boxShadow: isDark
            ? '0 8px 24px rgba(0,0,0,0.5)'
            : '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: isDark
              ? 'rgba(15, 185, 110, 0.15)'
              : 'rgba(15, 185, 110, 0.08)',
            color: themeColors.green,
          }}
        >
          <Cookie size={17} strokeWidth={2.2} />
        </div>

        <p
          className="flex-1 pt-1 text-[12px] leading-[1.5]"
          style={{ color: themeColors.mid }}
        >
          Mova uses cookies to keep you signed in and improve the app. By
          continuing you accept our Cookie Policy.
        </p>

        <button
          type="button"
          onClick={accept}
          className="shrink-0 cursor-pointer rounded-[10px] px-4 py-2 text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
          style={{
            backgroundColor: themeColors.green,
            color: '#FFFFFF',
          }}
        >
          Allow
        </button>
      </div>
    </div>
  )
}