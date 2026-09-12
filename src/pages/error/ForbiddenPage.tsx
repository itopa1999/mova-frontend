import { Lock, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

export default function ForbiddenPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

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
          <Shield size={42} strokeWidth={1.8} style={{ color: themeColors.warning }} />
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
          <Button variant="secondary" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>

        {/* Branding */}
        <div className="mt-10 flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-[6px]"
            style={{ backgroundColor: themeColors.green }}
          >
            <Lock size={10} color="#FFFFFF" />
          </div>
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