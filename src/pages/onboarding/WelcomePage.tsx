import {
  CalendarCheck,
  Lock,
  Wallet,
  HelpCircle,
} from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import AuthLayout from '../../components/layout/AuthLayout'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'
import { welcome } from '../../services/auth/welcome'

export default function WelcomePage() {
  useEffect(() => {
    welcome()
  }, [])

  const navigate = useNavigate()
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  return (
    <AuthLayout>
      {/* Main Content */}
      <section className="flex flex-col py-10">

        {/* Hero */}
        <div>

          {/* Badge */}
          <div className="mb-6">
            <div
              className="inline-block rounded-[12px] px-[14px] py-[7px]"
              style={{
                backgroundColor:
                  themeColors.greenLight,
              }}
            >
              <span
                className="text-[13px] font-semibold"
                style={{
                  color: themeColors.green,
                }}
              >
                Spend with a plan
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="mb-5 text-[36px] font-extrabold leading-[1.08] tracking-[-0.035em]"
            style={{
              color: themeColors.charcoal,
            }}
          >
            Put money aside.
            <br />
            Release it when needed.
          </h1>

          {/* Description */}
          <p
            className="max-w-[430px] text-[16px] leading-[1.65]"
            style={{
              color: themeColors.mid,
            }}
          >
            Set money aside for a specific purpose and
            decide how much becomes available at a time.
            MOVA helps you avoid spending everything at
            once.
          </p>

          {/* How it works link */}
          <button
            onClick={() => navigate('/how-it-works')}
            className="group mt-4 flex items-center gap-2 text-[14px] font-medium transition-all hover:gap-3"
            style={{ color: themeColors.green }}
          >
            <HelpCircle size={16} />
            <span>How it works</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>

          {/* Features */}
          <div className="mt-8 space-y-5">

            {/* Feature 1 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    themeColors.greenLight,
                }}
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
                  style={{
                    color: themeColors.charcoal,
                  }}
                >
                  Keep your money aside
                </p>

                <p
                  className="mt-0.5 text-[12px] leading-[1.5]"
                  style={{
                    color: themeColors.mid,
                  }}
                >
                  Separate money for the things you
                  need without spending it all at once.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    themeColors.greenLight,
                }}
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
                  style={{
                    color: themeColors.charcoal,
                  }}
                >
                  Control how much you can spend
                </p>

                <p
                  className="mt-0.5 text-[12px] leading-[1.5]"
                  style={{
                    color: themeColors.mid,
                  }}
                >
                  Set a daily, weekly, or scheduled amount
                  that becomes available to you.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    themeColors.greenLight,
                }}
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
                  style={{
                    color: themeColors.charcoal,
                  }}
                >
                  Get your money when you need it
                </p>

                <p
                  className="mt-0.5 text-[12px] leading-[1.5]"
                  style={{
                    color: themeColors.mid,
                  }}
                >
                  Choose when your money should be released
                  and let MOVA handle the schedule.
                </p>
              </div>
            </div>

          </div>

          {/* Example */}
          <div
            className="mt-8 rounded-[18px] px-5 py-5"
            style={{
              backgroundColor:
                themeColors.background,
            }}
          >
            <div className="mb-4 flex items-center justify-between">

              <div>
                <p
                  className="text-[12px] font-medium"
                  style={{
                    color: themeColors.mid,
                  }}
                >
                  Your transportation
                </p>

                <p
                  className="mt-1 text-[14px] font-semibold"
                  style={{
                    color: themeColors.charcoal,
                  }}
                >
                  ₦30,000 set aside
                </p>
              </div>

              <div
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor:
                    themeColors.greenLight,
                }}
              >
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    color: themeColors.green,
                  }}
                >
                  Active
                </span>
              </div>

            </div>

            <div
              className="flex items-center justify-between border-t pt-4"
              style={{
                borderColor:
                  themeColors.border,
              }}
            >
              <div>
                <p
                  className="text-[11px]"
                  style={{
                    color: themeColors.mid,
                  }}
                >
                  Daily release
                </p>

                <p
                  className="amount mt-1 text-[17px] font-medium"
                  style={{
                    color: themeColors.green,
                  }}
                >
                  ₦1,000
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-[11px]"
                  style={{
                    color: themeColors.mid,
                  }}
                >
                  Next release
                </p>

                <p
                  className="mt-1 text-[13px] font-semibold"
                  style={{
                    color: themeColors.charcoal,
                  }}
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

        <Button
          onClick={() => navigate('/register')}
        >
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