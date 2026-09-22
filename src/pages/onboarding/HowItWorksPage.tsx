import { ArrowLeft, Clock, Shield, Users, ChevronDown, ChevronUp, CheckCircle, XCircle, Wallet, Wand2, RefreshCw, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
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
              MOVA helps you take control of your spending by setting money aside and releasing it when you need it.
            </p>
          </div>

          {/* Meet John Doe Section */}
          <div className="rounded-[18px] px-5 py-5" style={{ backgroundColor: themeColors.background }}>
            <h2 className="mb-3 text-lg font-bold" style={{ color: themeColors.charcoal }}>
              Meet John Doe
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
              John is a young professional living in Lagos. Every month, he struggles with managing his money.
              He earns ₦300,000 monthly, but by mid-month, his money is already gone.
            </p>

            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold" style={{ color: themeColors.charcoal }}>
                His biggest challenges:
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-sm" style={{ color: themeColors.mid }}>
                  <XCircle size={16} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <span>No clear budget</span>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: themeColors.mid }}>
                  <XCircle size={16} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <span>Impulse spending</span>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: themeColors.mid }}>
                  <XCircle size={16} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <span>Running out of money before month-end</span>
                </li>
                <li className="flex items-start gap-2 text-sm" style={{ color: themeColors.mid }}>
                  <XCircle size={16} style={{ color: themeColors.red }} className="mt-0.5 shrink-0" />
                  <span>Borrowing money to survive</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-[12px] px-4 py-3" style={{ backgroundColor: themeColors.greenLight }}>
              <p className="text-xs font-medium" style={{ color: themeColors.green }}>
                💡 John's monthly income: ₦300,000 | Monthly expenses: ₦270,000 | Remaining: ₦30,000
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
                John didn't know what target amounts or schedules to pick. Instead of guessing, he picked from the{' '}
                <span className="font-semibold" style={{ color: themeColors.charcoal }}>Templates library</span> — presets
                like "Transport Allowance," "Food Fund," and "Rent Savings." Everything was prefilled — target amount,
                release amount, schedule. He just tweaked the numbers to match his budget and continued.
              </p>
              <p className="mt-1 text-sm italic" style={{ color: themeColors.mid }}>
                "I didn't have to figure out what to set. I just picked one and adjusted it to fit me."
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
                John created a <span className="font-semibold" style={{ color: themeColors.charcoal }}>"Transportation Fund"</span> with ₦40,000,
                a <span className="font-semibold" style={{ color: themeColors.charcoal }}>"Food Fund"</span> with ₦60,000, and
                a <span className="font-semibold" style={{ color: themeColors.charcoal }}>"Savings Fund"</span> with ₦30,000.
              </p>
              <p className="mt-1 text-sm italic" style={{ color: themeColors.mid }}>
                "Now I know exactly where my money is going. No more guessing!"
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
              <p className="mt-1 text-sm italic" style={{ color: themeColors.mid }}>
                "I can only spend ₦1,300 on transport today. No more spending my transport money on random things!"
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
              <p className="mt-1 text-sm italic" style={{ color: themeColors.mid }}>
                "I have money when I need it. No more borrowing until payday!"
              </p>
            </div>
          </div>

          {/* Step 4 - Turn on Automation */}
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
                Turn on Automation
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                John realized his Transportation Fund would run out after about 30 weekdays. Instead of
                remembering to come back and set it up again, he turned on{' '}
                <span className="font-semibold" style={{ color: themeColors.charcoal }}>automation</span>. He told MOVA to
                keep at least ₦10,000 in his main balance, then top the wallet back up whenever it ran low.
              </p>
              <p className="mt-1 text-sm italic" style={{ color: themeColors.mid }}>
                "It's been running for six months. Every weekday, ₦1,300 appears in my main balance — I haven't
                touched a thing since I set it up."
              </p>
            </div>
          </div>

          {/* Step 5 - Stay on Track */}
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
                Stay on Track
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                John tracked his spending and by month-end, he had saved <span className="font-semibold" style={{ color: themeColors.green }}>₦30,000</span>
                {' '}in his savings fund!
              </p>
              <p className="mt-1 text-sm italic" style={{ color: themeColors.mid }}>
                "I can't believe it! MOVA helped me save ₦30,000 in one month. I'm no longer stressing about money!"
              </p>
            </div>
          </div>

          {/* Before vs After Comparison */}
          <div className="rounded-[18px] px-5 py-5" style={{ backgroundColor: themeColors.background }}>
            <h2 className="mb-4 text-base font-semibold" style={{ color: themeColors.charcoal }}>
              John's Transformation
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.red }}>
                  Before MOVA
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <XCircle size={12} style={{ color: themeColors.red }} />
                    Broke by mid-month
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <XCircle size={12} style={{ color: themeColors.red }} />
                    Borrowing money
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <XCircle size={12} style={{ color: themeColors.red }} />
                    Stressed
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <XCircle size={12} style={{ color: themeColors.red }} />
                    No savings
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.green }}>
                  After MOVA
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <CheckCircle size={12} style={{ color: themeColors.green }} />
                    Money lasts all month
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <CheckCircle size={12} style={{ color: themeColors.green }} />
                    No more borrowing
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <CheckCircle size={12} style={{ color: themeColors.green }} />
                    Peace of mind
                  </li>
                  <li className="flex items-center gap-2 text-xs" style={{ color: themeColors.mid }}>
                    <CheckCircle size={12} style={{ color: themeColors.green }} />
                    ₦30,000 saved!
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
                <span className="text-sm" style={{ color: themeColors.mid }}>Safe and secure - Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>Flexible scheduling - Daily, weekly, monthly</span>
              </div>
              <div className="flex items-center gap-3">
                <Wand2 size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>Templates - Start with a preset, edit anything</span>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>Automation - Refills your wallet automatically</span>
              </div>
              <div className="flex items-center gap-3">
                <Users size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>Trusted by thousands of users</span>
              </div>
              <div className="flex items-center gap-3">
                <Wallet size={16} style={{ color: themeColors.green }} />
                <span className="text-sm" style={{ color: themeColors.mid }}>Simple pricing - only pay for what you use</span>
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
                    MOVA is a financial planning app that helps you set money aside and release it when you need it.
                    It prevents you from spending everything at once and helps you build better money habits.
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
                  Is my money safe?
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
                    Absolutely! MOVA uses bank-level encryption and security measures to protect your funds and personal information.
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
                    Templates are pre-built wallet configurations — things like "Transport Allowance," "Rent Savings,"
                    and "Weekly Groceries." Each one has a sensible target, release amount, and schedule already filled in.
                    You pick one, adjust anything you want, and create the wallet. Nothing is locked. It's the fastest
                    way to start if you're not sure what numbers to use.
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
                    Automation keeps your wallet topped up without you doing anything. You choose when it should
                    refill — when the wallet runs low, or when a full cycle completes — and MOVA pulls the money from
                    your main balance to restart it. You set the guardrails: keep at least ₦X in your main balance,
                    cap the number of refills, or pause anytime. You're notified every time a refill runs. The fee for
                    automation is only charged when a refill actually succeeds.
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
                    Yes! You can adjust your release amounts and schedules anytime from your dashboard.
                    Full flexibility to match your changing needs.
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
                    You can manually release additional funds from your set-aside money anytime.
                    MOVA encourages you to think twice before spending, but the control is always yours.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => navigate('/register')}>
            Get Started Now
          </Button>

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