import { useState } from 'react'
import { Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { logoutUser } from '../../services/app/logout'

const LOGO_URL =
  'https://res.cloudinary.com/et0r3out/image/upload/v1789426234/9.png'

export default function ForbiddenPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      const response = await logoutUser()

      sessionStorage.removeItem('userData')

      if (response.is_success) {
        setTimeout(() => {
          navigate('/welcome')
        }, 1500)
      } else {
        setTimeout(() => {
          navigate('/welcome')
        }, 1500)
      }
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('userData')

      setTimeout(() => {
        navigate('/welcome')
      }, 1500)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
        {/* Shield Icon */}
        <div
          className="mb-7 flex h-22 w-22 items-center justify-center rounded-[28px]"
          style={{
            backgroundColor: themeColors.warningBackground,
            boxShadow: `0 0 0 12px ${themeColors.warningBackground}22`,
          }}
        >
          <Shield
            size={42}
            strokeWidth={1.8}
            style={{ color: themeColors.warning }}
          />
        </div>

        <p
          className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.08em]"
          style={{ color: themeColors.warning }}
        >
          403 Restricted
        </p>
        <h1
          className="mb-3 text-center text-[26px] font-extrabold tracking-[-0.03em]"
          style={{ color: themeColors.charcoal }}
        >
          Access restricted
        </h1>
        <p
          className="mb-3 text-center text-[15px] leading-relaxed"
          style={{ color: themeColors.mid }}
        >
          You don't have permission to access this resource.
        </p>
        <p
          className="mb-10 text-center text-[13px] leading-relaxed"
          style={{ color: themeColors.mid }}
        >
          If you believe this is a mistake, please contact our support team and
          we'll resolve it quickly.
        </p>

        <div className="flex w-full max-w-[300px] flex-col gap-2.5">
          <Button onClick={() => navigate('/dashboard')}>
            Go to Home
          </Button>

          <Button variant="secondary" onClick={() => navigate('/support')}>
            Contact Support
          </Button>
        </div>

        {/* Logout Button — same pattern as Settings */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-7 w-full max-w-[300px] cursor-pointer rounded-[14px] border-none px-4 py-3.5 text-[15px] font-semibold transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: '#FFF0F0',
            color: themeColors.red,
          }}
        >
          {isLoggingOut ? (
            <div className="flex items-center justify-center gap-2">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2"
                style={{
                  borderColor: themeColors.red,
                  borderTopColor: 'transparent',
                }}
              />
              Logging out...
            </div>
          ) : (
            'Log Out'
          )}
        </button>

        {/* Branding — logo image */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <img
            src={LOGO_URL}
            alt="MOVA"
            className="h-12 w-12 rounded-xl object-contain"
            draggable={false}
          />
          <span
            className="font-mono text-[13px] font-bold tracking-[-0.08em]"
            style={{ color: themeColors.light }}
          >
            MOVA
          </span>
        </div>
      </div>
    </AuthLayout>
  )
}