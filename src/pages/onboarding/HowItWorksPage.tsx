import { ArrowLeft, Clock, Shield, Users, ChevronDown, ChevronUp, CheckCircle, XCircle, Wallet, Wand2, RefreshCw, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'

export default function HowItWorksPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <AuthLayout>
      <section className="flex flex-col py-6">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <h1
            className="text-xl font-bold"
            style={{ color: themeColors.charcoal }}
          >
            How It Works
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-8">

          {/* Introduction */}
          <div>
            <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
              When all your money is available at once, money meant for later can get spent early. MOVA helps you set money aside and choose when it becomes available.
            </p>
          </div>

          {/* Meet John Doe Section */}
          <div className="rounded-[18px] px-5 py-5" style={{ backgroundColor: themeColors.background }}>
            <h2 className="mb-3 text-lg font-bold" style={{ color: themeColors.charcoal }}>
              The problem: money can go too soon
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
              Meet John. He gets paid once a month, but everyday spending can leave him short before upcoming expenses are due. The money he meant to keep for later is still easy to reach today.
            </p>

            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold" style={{ color: themeColors.charcoal }}>
                What gets in the way:
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-sm" style={{ color: themeColors.mid }}>
                  <XCircle size={16} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <span>All his money is available at once</span>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: themeColors.mid }}>
                  <XCircle size={16} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <span>Unplanned spending</span>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: themeColors.mid }}>
                  <XCircle size={16} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <span>Money meant for later gets spent early</span>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: themeColors.mid }}>
                  <XCircle size={16} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <span>Less money left when expenses are due</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-[12px] px-4 py-3" style={{ backgroundColor: themeColors.greenLight }}>
              <p className="text-xs font-medium" style={{ color: themeColors.green }}>
                The issue is timing: money for later is available to spend now.
              </p>
            </div>
          </div>

          {/* Step 0 - Start with a Template (Optional) */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              <Wand2 size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="mb-1 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Start with a Template
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                John wanted a starting point for his wallet rules. He picked from the{' '}
                <span className="font-semibold" style={{ color: themeColors.charcoal }}>Templates library</span> — presets
                like "Transport Allowance," "Food," and "Rent." The amount and release schedule were prefilled. He adjusted them to match when he wanted his money available.
              </p>
              <p className="mt-1 text-sm" style={{ color: themeColors.mid }}>
                He can review the details and choose when his money becomes available.
              </p>
            </div>
          </div>

          {/* Step 1 - Set Money Aside */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              1
            </div>
            <div>
              <h2 className="mb-1 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Set Money Aside
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                John moved money into wallets for <span className="font-semibold" style={{ color: themeColors.charcoal }}>transport</span>,
                <span className="font-semibold" style={{ color: themeColors.charcoal }}> food</span>, and expenses due later in the month.
              </p>
              <p className="mt-1 text-sm" style={{ color: themeColors.mid }}>
                Money set aside for later is separate from what he keeps in his main balance.
              </p>
            </div>
          </div>

          {/* Step 2 - Control Your Spending */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              2
            </div>
            <div>
              <h2 className="mb-1 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Control Your Spending
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                John set a <span className="font-semibold" style={{ color: themeColors.charcoal }}>daily release of ₦1,300</span> for transportation
                and a <span className="font-semibold" style={{ color: themeColors.charcoal }}>weekly release of ₦15,000</span> for food.
              </p>
              <p className="mt-1 text-sm" style={{ color: themeColors.mid }}>
                The amounts and schedule decide when transport and food money become available.
              </p>
            </div>
          </div>

          {/* Step 3 - Get Your Money When You Need It */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              3
            </div>
            <div>
              <h2 className="mb-1 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Get Your Money When You Need It
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                Money was released automatically: ₦1,300 daily at 6:00 AM for transport, ₦15,000 weekly for food,
                and ₦80,000 on the 25th for rent.
              </p>
              <p className="mt-1 text-sm" style={{ color: themeColors.mid }}>
                MOVA follows the schedule and sends each release to the destination he selected.
              </p>
            </div>
          </div>

          {/* Optional automation */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              <RefreshCw size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="mb-1 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Optional: wallet automation
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                John may enable wallet automation. If enabled, MOVA can refill from his main balance according to the rules he selects.
              </p>
              <p className="mt-1 text-sm" style={{ color: themeColors.mid }}>
                While automation is on, MOVA can refill the wallet using the rules he selected.
              </p>
            </div>
          </div>

          {/* Outcome: more control over timing */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              4
            </div>
            <div>
              <h2 className="mb-1 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                More control over when money is available
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                Setting release rules lets John keep money meant for later from being available all at once. MOVA follows his schedule, giving him more say in when it becomes available.
              </p>
            </div>
          </div>

          {/* Before vs After Comparison */}
          <div className="rounded-[18px] px-5 py-5" style={{ backgroundColor: themeColors.background }}>
            <h2 className="mb-4 text-base font-semibold" style={{ color: themeColors.charcoal }}>
              What changes with MOVA
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.red }}>
                  Before
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <XCircle size={12} style={{ color: themeColors.red }} />
                    Money for later is easy to spend now
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <XCircle size={12} style={{ color: themeColors.red }} />
                    Less available when expenses are due
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <XCircle size={12} style={{ color: themeColors.red }} />
                    Relying on willpower
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <XCircle size={12} style={{ color: themeColors.red }} />
                    No release schedule
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.green }}>
                  With MOVA
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <CheckCircle size={12} style={{ color: themeColors.green }} />
                    Set money aside in wallets
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <CheckCircle size={12} style={{ color: themeColors.green }} />
                    Choose how much to release
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <CheckCircle size={12} style={{ color: themeColors.green }} />
                    Set when money becomes available
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <CheckCircle size={12} style={{ color: themeColors.green }} />
                    MOVA follows the rules you set
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why MOVA */}
          <div className="rounded-[18px] px-5 py-5" style={{ backgroundColor: themeColors.background }}>
            <h2 className="mb-4 text-base font-semibold" style={{ color: themeColors.charcoal }}>
              Why MOVA?
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>Choose your release amount and schedule</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>Set money aside in separate wallets</span>
              </div>
              <div className="flex items-center gap-3">
                <Wand2 size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>MOVA follows the rules you set</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>See when money is due to be released</span>
              </div>
              <div className="flex items-center gap-3">
                <Users size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>Money becomes available on your schedule</span>
              </div>
              <div className="flex items-center gap-3">
                <Wallet size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>You stay in control of your release rules</span>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h2 className="mb-4 text-lg font-bold" style={{ color: themeColors.charcoal }}>
              Frequently Asked Questions
            </h2>

            {/* FAQ 1 */}
            <div className="mb-3 rounded-[14px] overflow-hidden" style={{ border: `1px solid ${themeColors.border}` }}>
              <button
                onClick={() => toggleFaq(0)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: themeColors.background }}
              >
                <span className="text-sm font-medium" style={{ color: themeColors.charcoal }}>
                  What is MOVA?
                </span>
                {openFaq === 0 ? (
                  <ChevronUp size={18} style={{ color: themeColors.mid }} />
                ) : (
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                )}
              </button>
              {openFaq === 0 && (
                <div className="px-4 pb-4" style={{ backgroundColor: themeColors.background }}>
                  <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                    MOVA helps you control when money you set aside becomes available. Create a wallet, choose your release rules and schedule, and MOVA follows them.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="mb-3 rounded-[14px] overflow-hidden" style={{ border: `1px solid ${themeColors.border}` }}>
              <button
                onClick={() => toggleFaq(1)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: themeColors.background }}
              >
                <span className="text-sm font-medium" style={{ color: themeColors.charcoal }}>
                  Is MOVA free?
                </span>
                {openFaq === 1 ? (
                  <ChevronUp size={18} style={{ color: themeColors.mid }} />
                ) : (
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                )}
              </button>
              {openFaq === 1 && (
                <div className="px-4 pb-4" style={{ backgroundColor: themeColors.background }}>
                  <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                    Creating an account is free. When you create a wallet, a one-time MOVA fee is charged to cover
                    setup and the delivery of each release. Enabling automation is free — you only pay when a refill
                    actually runs successfully.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="mb-3 rounded-[14px] overflow-hidden" style={{ border: `1px solid ${themeColors.border}` }}>
              <button
                onClick={() => toggleFaq(2)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: themeColors.background }}
              >
                <span className="text-sm font-medium" style={{ color: themeColors.charcoal }}>
                  Where can I learn about account security?
                </span>
                {openFaq === 2 ? (
                  <ChevronUp size={18} style={{ color: themeColors.mid }} />
                ) : (
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                )}
              </button>
              {openFaq === 2 && (
                <div className="px-4 pb-4" style={{ backgroundColor: themeColors.background }}>
                  <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                    Review the Privacy Policy and Terms of Service for information about your account and personal data.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 4 - Templates */}
            <div className="mb-3 rounded-[14px] overflow-hidden" style={{ border: `1px solid ${themeColors.border}` }}>
              <button
                onClick={() => toggleFaq(3)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: themeColors.background }}
              >
                <span className="text-sm font-medium" style={{ color: themeColors.charcoal }}>
                  What are Templates?
                </span>
                {openFaq === 3 ? (
                  <ChevronUp size={18} style={{ color: themeColors.mid }} />
                ) : (
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                )}
              </button>
              {openFaq === 3 && (
                <div className="px-4 pb-4" style={{ backgroundColor: themeColors.background }}>
                  <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                    Templates are pre-filled wallet setups, such as "Transport Allowance," "Rent," and "Weekly Groceries."
                    Review the amount and schedule, adjust them to suit you, then create the wallet.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 5 - Automation */}
            <div className="mb-3 rounded-[14px] overflow-hidden" style={{ border: `1px solid ${themeColors.border}` }}>
              <button
                onClick={() => toggleFaq(4)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: themeColors.background }}
              >
                <span className="text-sm font-medium" style={{ color: themeColors.charcoal }}>
                  How does automation work?
                </span>
                {openFaq === 4 ? (
                  <ChevronUp size={18} style={{ color: themeColors.mid }} />
                ) : (
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                )}
              </button>
              {openFaq === 4 && (
                <div className="px-4 pb-4" style={{ backgroundColor: themeColors.background }}>
                  <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                    When enabled, automation can refill a wallet from your main balance according to the settings you
                    choose. Review the available refill rules and any fees before confirming.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 6 */}
            <div className="mb-3 rounded-[14px] overflow-hidden" style={{ border: `1px solid ${themeColors.border}` }}>
              <button
                onClick={() => toggleFaq(5)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: themeColors.background }}
              >
                <span className="text-sm font-medium" style={{ color: themeColors.charcoal }}>
                  Can I change my release schedule?
                </span>
                {openFaq === 5 ? (
                  <ChevronUp size={18} style={{ color: themeColors.mid }} />
                ) : (
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                )}
              </button>
              {openFaq === 5 && (
                <div className="px-4 pb-4" style={{ backgroundColor: themeColors.background }}>
                  <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                    You can edit a wallet's release amount and schedule from its settings. Check the wallet for the options available to you.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ 7 */}
            <div className="rounded-[14px] overflow-hidden" style={{ border: `1px solid ${themeColors.border}` }}>
              <button
                onClick={() => toggleFaq(6)}
                className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left transition-colors hover:opacity-80"
                style={{ backgroundColor: themeColors.background }}
              >
                <span className="text-sm font-medium" style={{ color: themeColors.charcoal }}>
                  What if I need money urgently?
                </span>
                {openFaq === 6 ? (
                  <ChevronUp size={18} style={{ color: themeColors.mid }} />
                ) : (
                  <ChevronDown size={18} style={{ color: themeColors.mid }} />
                )}
              </button>
              {openFaq === 6 && (
                <div className="px-4 pb-4" style={{ backgroundColor: themeColors.background }}>
                  <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                    Check the wallet's available actions. Your money remains yours, and the options shown in the app determine what you can do with it before a scheduled release.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => navigate('/about')}
            className="group flex cursor-pointer items-center justify-center gap-2 text-[14px] font-medium transition-all hover:gap-3"
            style={{ color: themeColors.green }}
          >
            <Info size={16} />
            <span>About Mova</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </section>
    </AuthLayout>
  )
}