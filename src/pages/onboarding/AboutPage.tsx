import {
  Lock,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Landmark,
  FileCheck2,
  Headphones,
  Eye,
  ArrowRight,
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

  const trustPoints = [
    {
      icon: Landmark,
      title: 'Licensed banking partners',
      body: 'Funds are held with regulated banking partners. MOVA never holds your money directly  it flows through licensed institutions from your account to your bank.',
    },
    {
      icon: Lock,
      title: 'PIN-protected actions',
      body: 'Every sensitive action  breaking a wallet, changing your PIN, moving money  requires your transaction PIN. No one can act on your account without it.',
    },
    {
      icon: Eye,
      title: 'Full visibility',
      body: 'Every release, fee, and deposit is logged and visible. You can trace exactly where your money went, when, and why.',
    },
    {
      icon: FileCheck2,
      title: 'Bank-grade encryption',
      body: 'All data is encrypted in transit and at rest. Sessions use httpOnly cookies, and account changes trigger email alerts.',
    },
    {
      icon: Headphones,
      title: 'Real support',
      body: 'Problems are handled by real people. If something goes wrong with a release or an account action, we are one message away.',
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

        {/* Why trust us */}
        <div className="mt-10">
          <h2
            className="text-[18px] font-bold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            Why trust us
          </h2>

          <p
            className="mt-1 text-[13px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            You're handing us something serious  your money and your
            schedule. Here's what that means in practice.
          </p>

          <div className="mt-5 space-y-5">
            {trustPoints.map((point) => {
              const Icon = point.icon
              return (
                <div
                  key={point.title}
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
                      {point.title}
                    </p>
                    <p
                      className="mt-0.5 text-[12px] leading-[1.6]"
                      style={{ color: themeColors.mid }}
                    >
                      {point.body}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legal links */}
        <div className="mt-10">
          <h2
            className="text-[18px] font-bold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            The fine print
          </h2>

          <p
            className="mt-1 text-[13px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            Read exactly what you're agreeing to when you use MOVA.
          </p>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="flex w-full cursor-pointer items-center justify-between rounded-[14px] border p-4 text-left transition-all hover:opacity-80 active:scale-[0.99]"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Terms of Service
                </p>
                <p
                  className="mt-0.5 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  The rules of using MOVA
                </p>
              </div>
              <ArrowRight
                size={16}
                style={{ color: themeColors.mid, flexShrink: 0 }}
              />
            </button>

            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="flex w-full cursor-pointer items-center justify-between rounded-[14px] border p-4 text-left transition-all hover:opacity-80 active:scale-[0.99]"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Privacy Policy
                </p>
                <p
                  className="mt-0.5 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  How we protect your data
                </p>
              </div>
              <ArrowRight
                size={16}
                style={{ color: themeColors.mid, flexShrink: 0 }}
              />
            </button>
          </div>
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