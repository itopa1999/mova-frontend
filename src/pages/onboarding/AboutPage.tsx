import {
  Lock,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  Zap,
  Landmark,
  FileCheck2,
  Headphones,
  Eye,
  ArrowRight,
  Wand2,
  RefreshCw,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import BackButton from '../../components/ui/BackButton'
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
      body: 'Set money aside in a wallet instead of keeping it all available to spend at once. Choose the rules for when that money becomes available.',
    },
    {
      icon: CalendarCheck,
      title: 'Your rules, followed automatically',
      body: 'Choose how much becomes available and how often. MOVA follows the release schedule you set.',
    },
    {
      icon: Wallet,
      title: 'Choose where releases go',
      body: 'Choose the release destination for your wallet. When a release is due, MOVA sends the money to that destination.',
    },
    {
      icon: Wand2,
      title: 'Start with a template',
      body: 'Start with a preset wallet setup, such as Transport, Rent, or Groceries. Review the details and adjust the release amount and schedule before you create it.',
    },
    {
      icon: RefreshCw,
      title: 'Automation keeps it running',
      body: 'If you enable wallet automation, MOVA can refill it from your main balance based on the refill rules you choose.',
    },
    {
      icon: ShieldCheck,
      title: 'Your money stays yours',
      body: 'Your wallet activity shows money held and released, so you can review how your release rules are working.',
    },
    {
      icon: Zap,
      title: 'A schedule you choose',
      body: 'Create a wallet, set your release rules, and let MOVA follow the schedule you choose.',
    },
  ]

  const trustPoints = [
    {
      icon: Landmark,
      title: 'Choose a release destination',
      body: 'Select the destination available for your wallet so releases go where you expect.',
    },
    {
      icon: Lock,
      title: 'Confirm account actions',
      body: 'Some money and account actions ask you to confirm with your transaction PIN.',
    },
    {
      icon: Eye,
      title: 'Review your wallet activity',
      body: 'Review wallet activity and scheduled releases to see when money was held or made available.',
    },
    {
      icon: FileCheck2,
      title: 'Account information',
      body: 'See the information associated with your account and manage your details in your profile and settings.',
    },
    {
      icon: Headphones,
      title: 'Real support',
      body: 'If you need help with a wallet, a release, or your account, contact our support team.',
    },
  ]

  return (
    <AuthLayout>
      <section className="py-10">
        {/* Back */}
        <BackButton
          onClick={() => navigate(-1)}
          variant="text"
          showLabel
          className="mb-6"
        />

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
            When all your money is available at once, it is easy to
            spend money meant for later. By the time an expense is
            due, there may be less left than you planned.
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
            Set money aside in MOVA wallets. Choose your release
            rules and schedule, and MOVA makes that money available
            when it is due.
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

        {/* Templates + Automation deep dive */}
        <div className="mt-10">
          <h2
            className="text-[18px] font-bold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            Set your rules. MOVA follows the schedule.
          </h2>

          <p
            className="mt-1 text-[13px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            Choose how much to set aside and when it becomes available.
          </p>

          {/* Templates card */}
          <div
            className="mt-5 overflow-hidden rounded-[18px] border p-5"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <Wand2
                  size={18}
                  strokeWidth={2}
                  color={themeColors.green}
                />
              </div>

              <div>
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Templates
                </p>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: themeColors.green }}
                >
                  Set up in seconds
                </p>
              </div>
            </div>

            <p
              className="text-[13px] leading-[1.65]"
              style={{ color: themeColors.mid }}
            >
              Instead of building a wallet from scratch, start with
              a preset wallet setup. Review the details, set the
              release amount and schedule you want, and adjust them
              before creating your wallet.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles
                  size={14}
                  strokeWidth={2.2}
                  color={themeColors.green}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  Presets can help you get started with wallet details.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles
                  size={14}
                  strokeWidth={2.2}
                  color={themeColors.green}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  Review and adjust the details before you create a wallet.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles
                  size={14}
                  strokeWidth={2.2}
                  color={themeColors.green}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  Choose a setup that fits how you want money released.
                </p>
              </div>
            </div>
          </div>

          {/* Automation card */}
          <div
            className="mt-4 overflow-hidden rounded-[18px] border p-5"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <RefreshCw
                  size={18}
                  strokeWidth={2}
                  color={themeColors.green}
                />
              </div>

              <div>
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Automation
                </p>
                <p
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: themeColors.green }}
                >
                  Refill while automation is enabled
                </p>
              </div>
            </div>

            <p
              className="text-[13px] leading-[1.65]"
              style={{ color: themeColors.mid }}
            >
              If you choose to use automation, MOVA can refill a
              wallet from your main balance using the refill rules
              you set.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles
                  size={14}
                  strokeWidth={2.2}
                  color={themeColors.green}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  <strong>Refills by your rules</strong> — MOVA uses
                  your chosen refill settings and main balance.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles
                  size={14}
                  strokeWidth={2.2}
                  color={themeColors.green}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  <strong>Restarts the schedule</strong> — same
                  amount, same frequency, same destination. The
                  cycle just keeps going.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles
                  size={14}
                  strokeWidth={2.2}
                  color={themeColors.green}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  <strong>You choose the settings</strong> — review
                  the available refill options before enabling automation.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles
                  size={14}
                  strokeWidth={2.2}
                  color={themeColors.green}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  Review any applicable fees in the app before you enable
                  automation.
                </p>
              </div>
            </div>
          </div>

          <p
            className="mt-4 text-[12px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            Presets and automation are optional. You can create a
            wallet and set its release rules yourself.
          </p>
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
            MOVA is built around the rules you choose for your money.
            Here is how to manage releases and your account.
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
            MOVA helps you decide when money set aside in a wallet
            becomes available. You choose the rules; MOVA follows
            the schedule.
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

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/how-it-works')}
            className="group mt-2 flex cursor-pointer items-center justify-center gap-2 text-[14px] font-medium transition-all hover:gap-3"
            style={{ color: themeColors.green }}
          >
            <HelpCircle size={16} />
            <span>How it works</span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

        <div className="h-10" />
      </section>
    </AuthLayout>
  )
}