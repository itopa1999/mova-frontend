import {
  Lock,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  Zap,
  ArrowLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

const LOGO_URL =
  'https://res.cloudinary.com/et0r3out/image/upload/v1789426234/9.png'

export default function AboutPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const pillars = [
    {
      icon: Lock,
      title: 'You decide when your money is available',
      body: 'Put money into a MOVA wallet and it stays out of reach until the rules you set say otherwise. You still own it  you just decide in advance when you can spend it.',
    },
    {
      icon: CalendarCheck,
      title: 'Your rules, followed automatically',
      body: 'Set how much becomes available and how often  daily, weekly, or on a schedule that fits you. MOVA follows your rules and releases the money on time, every time.',
    },
    {
      icon: Wallet,
      title: 'Money released to your bank',
      body: 'When a release is due, the money is moved to your linked bank account. No manual step, no remembering. It shows up when you said it should.',
    },
    {
      icon: ShieldCheck,
      title: 'Your money stays yours',
      body: 'Funds are held safely and released exactly according to the rules you set. Every release is logged and traceable.',
    },
    {
      icon: Zap,
      title: 'Simple to start, easy to stick to',
      body: 'Create a wallet, set your rules, and go about your day. MOVA keeps working in the background.',
    },
  ]

  return (
    <AuthLayout>
      <section className="py-10">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: themeColors.mid }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Logo */}
        <div className="mb-8">
          <img
            src={LOGO_URL}
            alt="Mova"
            className="h-28 w-28 rounded-full object-contain"
            draggable={false}
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            About Mova
          </h1>

          <p
            className="mt-3 text-[15px] leading-[1.65]"
            style={{ color: themeColors.mid }}
          >
            Most people don't have a saving problem  they have a
            spending-too-soon problem. Money meant for later gets
            spent now, and by the time you need it, it's gone.
          </p>
        </div>

        {/* Mission card */}
        <div
          className="mb-8 rounded-[18px] p-5"
          style={{
            backgroundColor: themeColors.greenLight,
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: themeColors.green }}
          >
            What Mova does
          </p>

          <p
            className="mt-2 text-[16px] font-semibold leading-[1.5]"
            style={{ color: themeColors.charcoal }}
          >
            MOVA lets you control when your money becomes
            available  using rules and a schedule you set
            yourself.
          </p>
        </div>

        {/* Pillars */}
        <div className="space-y-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="flex items-start gap-3"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: themeColors.greenLight }}
                >
                  <Icon
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
                    {pillar.title}
                  </p>
                  <p
                    className="mt-0.5 text-[12px] leading-[1.6]"
                    style={{ color: themeColors.mid }}
                  >
                    {pillar.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Closing */}
        <div
          className="mt-10 rounded-[18px] p-5"
          style={{
            backgroundColor: themeColors.background,
          }}
        >
          <p
            className="text-[13px] leading-[1.65]"
            style={{ color: themeColors.charcoal }}
          >
            Mova is built by a small team in Nigeria. We use it too.
            Everything we ship has to work for our own money before
            it works for yours.
          </p>

          <p
            className="mt-3 text-[12px]"
            style={{ color: themeColors.mid }}
          >
            Want to talk? Reach us at{' '}
            <a
              href="mailto:hello@mova.app"
              className="font-medium underline"
              style={{ color: themeColors.green }}
            >
              hello@mova.app
            </a>
          </p>
        </div>

        <div className="h-10" />
      </section>
    </AuthLayout>
  )
}