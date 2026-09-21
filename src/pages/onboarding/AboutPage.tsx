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
  Wand2,
  RefreshCw,
  Sparkles,
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
      body: 'Put money into a MOVA wallet and it stays out of reach until the rules you set say otherwise. You still own it — you just decide in advance when you can spend it.',
    },
    {
      icon: CalendarCheck,
      title: 'Your rules, followed automatically',
      body: 'Set how much becomes available and how often — daily, weekly, or on a schedule that fits you. MOVA follows your rules and releases the money on time, every time.',
    },
    {
      icon: Wallet,
      title: 'Money released to your bank',
      body: 'When a release is due, the money is moved to your linked bank account. No manual step, no remembering. It shows up when you said it should.',
    },
    {
      icon: Wand2,
      title: 'Start with a template',
      body: 'Not sure where to begin? Pick a preset — Transport Allowance, Rent Savings, Weekly Groceries, and more. Everything is prefilled for you. Tweak anything before you create it.',
    },
    {
      icon: RefreshCw,
      title: 'Automation keeps it running',
      body: 'Turn on automation and MOVA refills your wallet from your main balance whenever it runs low or completes a cycle. Same amount, same schedule, same destination — set it once and forget it.',
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
      body: 'Funds are held with regulated banking partners. MOVA never holds your money directly — it flows through licensed institutions from your account to your bank.',
    },
    {
      icon: Lock,
      title: 'PIN-protected actions',
      body: 'Every sensitive action — breaking a wallet, changing your PIN, moving money — requires your transaction PIN. No one can act on your account without it.',
    },
    {
      icon: Eye,
      title: 'Full visibility',
      body: 'Every release, fee, refill, and deposit is logged and visible. You can trace exactly where your money went, when, and why.',
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
            Most people don't have a saving problem — they have a
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
            available — using rules and a schedule you set
            yourself. And when you're ready, automation takes it
            from there.
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
            Two ways MOVA does the thinking for you
          </h2>

          <p
            className="mt-1 text-[13px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            Getting started and keeping it going — both handled.
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
              a preset. A library of ready-made configurations —
              Transport Allowance, Rent Savings, Weekly Groceries,
              School Fees, Emergency Fund, and more — each with a
              sensible target, release amount, and schedule already
              filled in.
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
                  Every field is prefilled — name, category, target,
                  schedule, everything.
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
                  Nothing is locked — edit any value before you
                  create the wallet.
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
                  Great for people who aren't sure where to start.
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
                  Set once, runs forever
                </p>
              </div>
            </div>

            <p
              className="text-[13px] leading-[1.65]"
              style={{ color: themeColors.mid }}
            >
              Once your wallet starts releasing money, it will
              eventually run dry. Without automation, you'd have to
              come back, create a new one, and start the whole
              thing over. With automation, MOVA handles it.
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
                  <strong>Refills automatically</strong> — when the
                  wallet runs low or completes a cycle, MOVA pulls
                  from your main balance and tops it back up.
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
                  <strong>You set the guardrails</strong> — keep a
                  minimum in your main balance, cap the number of
                  refills, or pause anytime.
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
                  <strong>Only charges when it works</strong> — the
                  fee is deducted at the moment of each successful
                  refill, not when you turn it on.
                </p>
              </div>
            </div>
          </div>

          <p
            className="mt-4 text-[12px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            Templates get you started. Automation keeps you going.
            Both are optional — you can always create wallets
            manually and skip automation entirely.
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
            You're handing us something serious — your money and
            your schedule. Here's what that means in practice.
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