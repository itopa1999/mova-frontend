import {
  CalendarCheck,
  Lock,
  Wallet,
  HelpCircle,
  Info,
} from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import AuthLayout from '../../components/layout/AuthLayout'
import { colors, darkColors } from '../../styles/tokens'
import RotatingTagline from '../../components/ui/RotatingTagline'
import { useTheme } from '../../hooks/useTheme'
import { welcome } from '../../services/auth/welcome'

export default function WelcomePage() {
  useEffect(() => {
    welcome()
  }, [])

  const navigate = useNavigate()
  const { isDark } = useTheme()

  const themeColors = isDark ? darkColors : colors

  return (
    <AuthLayout>
      <section className="flex flex-col py-10">
        <div>

          <RotatingTagline />

          {/* Heading */}
          <h1
              className="mb-5 text-[36px] font-extrabold leading-[1.08] tracking-[-0.035em]"
              style={{ color: themeColors.charcoal }}
            >
              Put <span style={{ color: themeColors.green }}>money</span> aside.
              <br />
              <span style={{ color: themeColors.green }}>Release</span> it when{' '}
              <span style={{ color: themeColors.green }}>needed</span>.
            </h1>

          {/* Description */}
          <p
            className="max-w-[430px] text-[16px] leading-[1.65]"
            style={{ color: themeColors.mid }}
          >
            When all your money is available at once, it's easy to
            spend on things you didn't plan for. MOVA lets you put
            money aside and decide when it becomes available — so
            your money lasts the way you intended.
          </p>

          {/* Links */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">

            <button
              onClick={() => navigate('/how-it-works')}
              className="group flex items-center gap-2 text-[14px] font-medium transition-all hover:gap-3"
              style={{ color: themeColors.green }}
            >
              <HelpCircle size={16} />
              <span>How it works</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>

            <button
              onClick={() => navigate('/about')}
              className="group flex items-center gap-2 text-[14px] font-medium transition-all hover:gap-3"
              style={{ color: themeColors.green }}
            >
              <Info size={16} />
              <span>About Mova</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>

          </div>

          {/* Features */}
          <div className="mt-8 space-y-5">

            {/* Feature 1 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <Lock
                  size={17}
                  strokeWidth={2}
                  color={themeColors.green}
                />
              </div>

              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Put money out of easy reach
                </p>

                <p
                  className="mt-0.5 text-[12px] leading-[1.5]"
                  style={{ color: themeColors.mid }}
                >
                  Move money into a wallet and it stays there —
                  until the rules you set say otherwise.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <Wallet
                  size={17}
                  strokeWidth={2}
                  color={themeColors.green}
                />
              </div>

              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Decide how much becomes available
                </p>

                <p
                  className="mt-0.5 text-[12px] leading-[1.5]"
                  style={{ color: themeColors.mid }}
                >
                  Set an amount and a schedule. MOVA follows your
                  rules — you don't have to think about it again.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <CalendarCheck
                  size={17}
                  strokeWidth={2}
                  color={themeColors.green}
                />
              </div>

              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Money lands in your bank on time
                </p>

                <p
                  className="mt-0.5 text-[12px] leading-[1.5]"
                  style={{ color: themeColors.mid }}
                >
                  When a release is due, MOVA sends it to your
                  linked bank account. Automatically.
                </p>
              </div>
            </div>

          </div>

          {/* Example */}
          <div
            className="mt-8 rounded-[18px] px-5 py-5"
            style={{ backgroundColor: themeColors.background }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p
                  className="text-[12px] font-medium"
                  style={{ color: themeColors.mid }}
                >
                  Your transportation
                </p>

                <p
                  className="mt-1 text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  ₦30,000 put aside
                </p>
              </div>

              <div
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: themeColors.green }}
                >
                  Active
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-between border-t pt-4"
              style={{ borderColor: themeColors.border }}
            >
              <div>
                <p
                  className="text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Releases daily
                </p>

                <p
                  className="amount mt-1 text-[17px] font-medium"
                  style={{ color: themeColors.green }}
                >
                  ₦1,000
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Next release
                </p>

                <p
                  className="mt-1 text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Tomorrow
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3 pb-8">
        <Button onClick={() => navigate('/register')}>
          Get Started
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate('/login')}
        >
          I already have an account
        </Button>
      </div>
    </AuthLayout>
  )
}