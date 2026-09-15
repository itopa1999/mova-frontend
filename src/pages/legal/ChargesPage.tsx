import {
  ArrowLeft,
  Info,
  Wallet,
  Percent,
  Zap,
  CheckCircle,
  HelpCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

interface ChargeItem {
  label: string
  amount: string
  note: string
}

interface ChargeGroup {
  icon: typeof Wallet
  title: string
  description: string
  items: ChargeItem[]
}

export default function ChargesPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const groups: ChargeGroup[] = [
    {
      icon: Wallet,
      title: 'Creating a wallet',
      description:
        'When you create a wallet, we charge a one-time fee to set it up and start the schedule.',
      items: [
        {
          label: 'Wallet creation fee',
          amount: '₦0',
          note: 'Free. MOVA does not charge to create a wallet.',
        },
      ],
    },
    {
      icon: Zap,
      title: 'Releasing money',
      description:
        'Every time MOVA releases money from your wallet to your linked bank account, the release is free.',
      items: [
        {
          label: 'Scheduled release',
          amount: '₦0',
          note: 'Free. You only pay for the transfer below if one applies.',
        },
      ],
    },
    {
      icon: Percent,
      title: 'Breaking a wallet',
      description:
        'Breaking a wallet means pulling the full balance out before the schedule finishes. We charge a small break fee on the locked amount to cover the cost of unwinding the schedule.',
      items: [
        {
          label: 'Break fee',
          amount: '2% of locked amount',
          note: 'Only applies when you break a wallet early. Waived if the wallet has already completed.',
        },
      ],
    },
    {
      icon: Zap,
      title: 'Bank transfers',
      description:
        'When MOVA moves money to your linked bank account, your bank may charge its own fees. MOVA does not add any margin on top.',
      items: [
        {
          label: 'Transfer to your bank',
          amount: '₦0 from MOVA',
          note: 'Standard bank transfer charges may apply from your bank. Your bank sets those, not MOVA.',
        },
      ],
    },
  ]

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>

          <div>
            <h1
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Our Charges
            </h1>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              Every fee MOVA takes, in one place
            </p>
          </div>
        </div>

        {/* Intro */}
        <div
          className="mb-6 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.greenLight,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle
              size={18}
              style={{ color: themeColors.green, marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <p
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                No hidden fees
              </p>
              <p
                className="mt-1 text-[12px] leading-[1.6]"
                style={{ color: themeColors.mid }}
              >
                MOVA only charges for one thing: breaking a wallet early.
                Everything else is free. If we ever add a new charge, we
                will tell you before it applies to your account.
              </p>
            </div>
          </div>
        </div>

        {/* Charge groups */}
        <div className="space-y-5">
          {groups.map((group) => {
            const Icon = group.icon
            return (
              <div
                key={group.title}
                className="overflow-hidden rounded-[16px] border"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                {/* Header */}
                <div className="flex items-start gap-3 p-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: themeColors.greenLight }}
                  >
                    <Icon size={18} strokeWidth={2} color={themeColors.green} />
                  </div>

                  <div className="flex-1">
                    <p
                      className="text-[15px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {group.title}
                    </p>
                    <p
                      className="mt-1 text-[12px] leading-[1.6]"
                      style={{ color: themeColors.mid }}
                    >
                      {group.description}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div
                  className="border-t"
                  style={{ borderColor: themeColors.border }}
                >
                  {group.items.map((item, index) => (
                    <div
                      key={item.label}
                      className="px-4 py-3.5"
                      style={{
                        borderTop:
                          index > 0
                            ? `1px solid ${themeColors.border}`
                            : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className="text-[13px] font-medium"
                          style={{ color: themeColors.charcoal }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="shrink-0 text-[14px] font-bold"
                          style={{
                            color: themeColors.green,
                            fontFamily:
                              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}
                        >
                          {item.amount}
                        </p>
                      </div>
                      <p
                        className="mt-1 text-[11px] leading-[1.5]"
                        style={{ color: themeColors.mid }}
                      >
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Worked example */}
        <div className="mt-8">
          <h2
            className="text-[16px] font-bold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            A worked example
          </h2>

          <p
            className="mt-1 text-[12px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            Say you set up a ₦30,000 wallet with a ₦1,000 daily release. Two
            weeks in, you decide to break it.
          </p>

          <div
            className="mt-4 overflow-hidden rounded-[16px] border"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Target amount
                  </span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    ₦30,000
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className="text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Already released (14 days × ₦1,000)
                  </span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    ₦14,000
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className="text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Still locked
                  </span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    ₦16,000
                  </span>
                </div>

                <div
                  className="flex items-center justify-between border-t pt-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <span
                    className="text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Break fee (2% of ₦16,000)
                  </span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: themeColors.red }}
                  >
                    −₦320
                  </span>
                </div>

                <div
                  className="flex items-center justify-between border-t pt-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    You receive
                  </span>
                  <span
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.green }}
                  >
                    ₦15,680
                  </span>
                </div>
              </div>
            </div>

            <div
              className="border-t px-4 py-3"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.background,
              }}
            >
              <p
                className="text-[11px] leading-[1.5]"
                style={{ color: themeColors.mid }}
              >
                The ₦14,000 that was already released stays with you. The
                break fee only applies to the ₦16,000 that was still locked
                when you broke the wallet.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ-ish notes */}
        <div className="mt-8">
          <h2
            className="text-[16px] font-bold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            Things people ask
          </h2>

          <div className="mt-3 space-y-3">
            <div
              className="rounded-[14px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-start gap-3">
                <HelpCircle
                  size={16}
                  style={{
                    color: themeColors.green,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Do I pay anything to keep a wallet running?
                  </p>
                  <p
                    className="mt-1 text-[12px] leading-[1.6]"
                    style={{ color: themeColors.mid }}
                  >
                    No. Wallets run in the background for free. You only pay
                    when you break one early.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-[14px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-start gap-3">
                <HelpCircle
                  size={16}
                  style={{
                    color: themeColors.green,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    What if my wallet completes on its own?
                  </p>
                  <p
                    className="mt-1 text-[12px] leading-[1.6]"
                    style={{ color: themeColors.mid }}
                  >
                    No break fee. If every release fires on schedule and the
                    wallet completes naturally, MOVA takes nothing.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-[14px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-start gap-3">
                <HelpCircle
                  size={16}
                  style={{
                    color: themeColors.green,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Are there fees from my bank?
                  </p>
                  <p
                    className="mt-1 text-[12px] leading-[1.6]"
                    style={{ color: themeColors.mid }}
                  >
                    Your bank may charge for transfers into your account.
                    That&rsquo;s between you and your bank &mdash; MOVA does
                    not add any fees on top.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div
          className="mt-8 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-start gap-3">
            <Info
              size={16}
              style={{
                color: themeColors.mid,
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <div>
              <p
                className="text-[12px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                If anything changes
              </p>
              <p
                className="mt-1 text-[11px] leading-[1.6]"
                style={{ color: themeColors.mid }}
              >
                We&rsquo;ll email you before any new charge is added. Nothing
                changes retroactively &mdash; your existing wallets keep the
                terms they were created with.
              </p>
            </div>
          </div>
        </div>

        {/* Support link */}
        <div
          className="mt-6 rounded-[14px] border p-4 text-center"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <p
            className="text-[12px]"
            style={{ color: themeColors.mid }}
          >
            Still confused about a charge?{' '}
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="cursor-pointer font-semibold underline"
              style={{ color: themeColors.green }}
            >
              Talk to us
            </button>
            .
          </p>
        </div>

        <div className="h-6" />
      </div>
    </AppLayout>
  )
}