import { Search, AlertCircle } from 'lucide-react'
import { useRouteError, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

const LOGO_URL =
  'https://res.cloudinary.com/et0r3out/image/upload/v1789426234/9.png'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const error = useRouteError() as { status?: number; statusText?: string; message?: string }
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const is404 = error?.status === 404 || error?.statusText === 'Not Found'
  const errorMessage = error?.message || 'The page you\'re looking for doesn\'t exist or may have been moved.'

  return (
    <AuthLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12">
        {/* Icon - changes based on error type */}
        <div
          className="relative mb-8 text-center"
        >
          <p
            className="select-none text-[96px] font-extrabold leading-none tracking-[-0.06em]"
            style={{ color: themeColors.border }}
          >
            {is404 ? '404' : 'Error'}
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex flex-col items-center gap-2 rounded-[24px] px-5 py-4"
              style={{ backgroundColor: themeColors.greenLight }}
            >
              {is404 ? (
                <Search size={36} strokeWidth={1.8} style={{ color: themeColors.green }} />
              ) : (
                <AlertCircle size={36} strokeWidth={1.8} style={{ color: themeColors.red }} />
              )}
              <p
                className="text-[20px] font-extrabold tracking-[-0.04em]"
                style={{ color: is404 ? themeColors.green : themeColors.red }}
              >
                {is404 ? '404' : 'Error'}
              </p>
            </div>
          </div>
        </div>

        <div
          className="mb-6 h-1 w-12 rounded-full"
          style={{ backgroundColor: is404 ? themeColors.green : themeColors.red }}
        />

        <h1
          className="mb-3 text-center text-[24px] font-extrabold tracking-[-0.03em]"
          style={{ color: themeColors.charcoal }}
        >
          {is404 ? "We couldn't find that page." : "Something went wrong."}
        </h1>
        <p
          className="mb-10 text-center text-[15px] leading-relaxed"
          style={{ color: themeColors.mid }}
        >
          {is404 
            ? "The page you're looking for doesn't exist or may have been moved."
            : errorMessage
          }
        </p>

        <div className="flex w-full max-w-[300px] flex-col gap-2.5">
          <Button onClick={() => navigate('/dashboard')}>
            Back to Home
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>

        {/* Branding */}
        <div className="mt-10 flex items-center gap-2">
          <img
            src={LOGO_URL}
            alt="Mova"
            className="h-6 w-6 rounded-full object-contain"
            draggable={false}
          />
          <span
            className="text-[13px] font-semibold tracking-[-0.02em]"
            style={{ color: themeColors.light }}
          >
            MOVA
          </span>
        </div>
      </div>
    </AuthLayout>
  )
}