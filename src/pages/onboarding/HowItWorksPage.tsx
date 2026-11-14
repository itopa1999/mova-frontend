
import {
  Clock,
  Shield,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Wallet,
  Wand2,
  RefreshCw,
  Info,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import BackButton from '../../components/ui/BackButton'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'

export default function HowItWorksPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      question: 'What is MOVA?',
      answer:
        'MOVA helps you control when money you set aside becomes available. Create a wallet, choose your release rules and schedule, and MOVA follows them.',
    },
    {
      question: 'Is MOVA free?',
      answer:
        'Creating an account is free. When you create a wallet, a one-time MOVA fee is charged to cover setup and the delivery of each release. Enabling automation is free — you only pay when a refill actually runs successfully.',
    },
    {
      question: 'Where can I learn about account security?',
      answer:
        'Review the Privacy Policy and Terms of Service for information about your account and personal data.',
    },
    {
      question: 'What are Templates?',
      answer:
        'Templates are pre-filled wallet setups, such as Transport Allowance, Rent, and Weekly Groceries. Review the amount and schedule, adjust them to suit you, then create the wallet.',
    },
    {
      question: 'How does automation work?',
      answer:
        'When enabled, automation can refill a wallet from your main balance according to the settings you choose. Review the available refill rules and any fees before confirming.',
    },
    {
      question: 'Can I change my release schedule?',
      answer:
        "You can edit a wallet's release amount and schedule from its settings. Check the wallet for the options available to you.",
    },
    {
      question: 'What if I need money urgently?',
      answer:
        "Check the wallet's available actions. Your money remains yours, and the options shown in the app determine what you can do with it before a scheduled release.",
    },
    {
      question: 'What is a Trustee Wallet?',
      answer:
        'A Trustee Wallet is designed for setting money aside for another person. The wallet creator defines the target, purpose, release amount and schedule, and assigns a trustee to the arrangement. The trustee role is governed by the permissions configured for that wallet.',
    },
    {
      question: 'Who can use a Trustee Wallet?',
      answer:
        'It can support arrangements such as a parent setting aside an allowance for a child, a sponsor supporting a student, or an employer allocating funds for staff. The creator defines the arrangement and the beneficiary receives the money according to its release rules.',
    },
    {
      question: 'What is Circle (AJo)?',
      answer:
        'Circle, also called AJo, is a group contribution arrangement. Members contribute according to agreed rules, and members receive payouts in an agreed rotation or cycle.',
    },
    {
      question: 'How do people join a Circle?',
      answer:
        'The Circle moderator creates the group and adds eligible members. Those members receive invitations and must accept before joining. An invitation code alone does not give an unapproved person permission to join.',
    },
    {
      question: 'What happens if a Circle member misses a contribution?',
      answer:
        'Contribution status and missed payments can affect the Circle cycle. Members should review the contribution rules and responsibilities before accepting an invitation. Any applicable handling of missed contributions will be shown in the Circle rules.',
    },
  ]

  return (
    <AuthLayout>
      <section className="flex flex-col py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} variant="subtle" />
          <h1
            className="text-xl font-bold"
            style={{ color: themeColors.charcoal }}
          >
            How It Works
          </h1>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              When all your money is available at once, money meant for later
              can get spent early. MOVA helps you set money aside and choose
              when it becomes available.
            </p>
          </div>

          {/* The problem */}
          <div
            className="rounded-[18px] px-5 py-5"
            style={{ backgroundColor: themeColors.background }}
          >
            <h2
              className="mb-3 text-lg font-bold"
              style={{ color: themeColors.charcoal }}
            >
              The problem: money can go too soon
            </h2>

            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              Meet John. He gets paid once a month, but everyday spending can
              leave him short before upcoming expenses are due. The money he
              meant to keep for later is still easy to reach today.
            </p>

            <div className="mt-3 space-y-2">
              <p
                className="text-sm font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                What gets in the way:
              </p>

              <ul className="space-y-1.5">
                {[
                  'All his money is available at once',
                  'Unplanned spending',
                  'Money meant for later gets spent early',
                  'Less money left when expenses are due',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: themeColors.mid }}
                  >
                    <XCircle
                      size={16}
                      style={{ color: themeColors.red }}
                      className="mt-0.5 shrink-0"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-4 rounded-[12px] px-4 py-3"
              style={{ backgroundColor: themeColors.greenLight }}
            >
              <p
                className="text-xs font-medium"
                style={{ color: themeColors.green }}
              >
                The issue is timing: money for later is available to spend now.
              </p>
            </div>
          </div>

          {/* Step 0 - Templates */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              <Wand2 size={16} strokeWidth={2.2} />
            </div>

            <div>
              <h2
                className="mb-1 text-base font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Start with a Template
              </h2>

              <p
                className="text-sm leading-relaxed"
                style={{ color: themeColors.mid }}
              >
                John wanted a starting point for his wallet rules. He picked
                from the{' '}
                <span
                  className="font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Templates library
                </span>{' '}
                — presets like Transport Allowance, Food, and Rent. The amount
                and release schedule were prefilled. He adjusted them to match
                when he wanted his money available.
              </p>

              <p
                className="mt-1 text-sm"
                style={{ color: themeColors.mid }}
              >
                He can review the details and choose when his money becomes
                available.
              </p>
            </div>
          </div>

          {/* Step 1 */}
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
              <h2
                className="mb-1 text-base font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Set Money Aside
              </h2>

              <p
                className="text-sm leading-relaxed"
                style={{ color: themeColors.mid }}
              >
                John moved money into wallets for{' '}
                <span
                  className="font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  transport
                </span>
                ,{' '}
                <span
                  className="font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  food
                </span>
                , and expenses due later in the month.
              </p>

              <p
                className="mt-1 text-sm"
                style={{ color: themeColors.mid }}
              >
                Money set aside for later is separate from what he keeps in
                his main balance.
              </p>
            </div>
          </div>

          {/* Step 2 */}
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
              <h2
                className="mb-1 text-base font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Control Your Spending
              </h2>

              <p
                className="text-sm leading-relaxed"
                style={{ color: themeColors.mid }}
              >
                John set a{' '}
                <span
                  className="font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  daily release of ₦1,300
                </span>{' '}
                for transportation and a{' '}
                <span
                  className="font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  weekly release of ₦15,000
                </span>{' '}
                for food.
              </p>

              <p
                className="mt-1 text-sm"
                style={{ color: themeColors.mid }}
              >
                The amounts and schedule decide when transport and food money
                become available.
              </p>
            </div>
          </div>

          {/* Step 3 */}
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
              <h2
                className="mb-1 text-base font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Get Your Money When You Need It
              </h2>

              <p
                className="text-sm leading-relaxed"
                style={{ color: themeColors.mid }}
              >
                Money was released automatically: ₦1,300 daily at 6:00 AM for
                transport, ₦15,000 weekly for food, and ₦80,000 on the 25th
                for rent.
              </p>

              <p
                className="mt-1 text-sm"
                style={{ color: themeColors.mid }}
              >
                MOVA follows the schedule and sends each release to the
                destination he selected.
              </p>
            </div>
          </div>

          {/* Wallet automation */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              <RefreshCw size={16} strokeWidth={2.2} />
            </div>

            <div>
              <h2
                className="mb-1 text-base font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Optional: Wallet Automation
              </h2>

              <p
                className="text-sm leading-relaxed"
                style={{ color: themeColors.mid }}
              >
                John may enable wallet automation. If enabled, MOVA can refill
                from his main balance according to the rules he selects.
              </p>

              <p
                className="mt-1 text-sm"
                style={{ color: themeColors.mid }}
              >
                While automation is on, MOVA can refill the wallet using the
                rules he selected.
              </p>
            </div>
          </div>

          {/* Trustee Wallet */}
          <div
            className="rounded-[18px] px-5 py-5"
            style={{ backgroundColor: themeColors.background }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                <UserCheck size={20} />
              </div>

              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Trustee Wallet
                </h2>
                <p
                  className="text-xs"
                  style={{ color: themeColors.mid }}
                >
                  Set money aside for someone else
                </p>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              Sometimes, you want to manage money for someone else's needs
              without giving them unrestricted access to the entire amount.
              A Trustee Wallet is designed for this.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  1
                </span>
                <p
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  The creator sets the amount, purpose, release schedule and
                  beneficiary.
                </p>
              </div>

              <div className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  2
                </span>
                <p
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  A trustee is assigned to the arrangement according to the
                  wallet's configured permissions.
                </p>
              </div>

              <div className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  3
                </span>
                <p
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  The beneficiary receives money according to the wallet's
                  release rules.
                </p>
              </div>
            </div>

            <div
              className="mt-4 rounded-xl px-4 py-3"
              style={{ backgroundColor: themeColors.greenLight }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{ color: themeColors.green }}
              >
                For example: a parent can set aside money for a child's
                allowance, or a sponsor can arrange scheduled support for a
                student.
              </p>
            </div>
          </div>

          {/* Circle / AJo */}
          <div
            className="rounded-[18px] px-5 py-5"
            style={{ backgroundColor: themeColors.background }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                <UsersRound size={20} />
              </div>

              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Circle (AJo)
                </h2>
                <p
                  className="text-xs"
                  style={{ color: themeColors.mid }}
                >
                  Contribute together, receive payouts in turns
                </p>
              </div>
            </div>

            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              Circle, also known as AJo, brings people together to contribute
              money towards a shared rotating payout arrangement. Members
              contribute according to agreed rules, and payouts follow the
              group's agreed cycle.
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  1
                </span>
                <p
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  A moderator creates the Circle and defines its contribution
                  rules and payout arrangement.
                </p>
              </div>

              <div className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  2
                </span>
                <p
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  The moderator adds eligible members and sends invitations.
                  Invited members must accept before joining.
                </p>
              </div>

              <div className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  3
                </span>
                <p
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  Members contribute according to the agreed amount and
                  deadlines.
                </p>
              </div>

              <div className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: themeColors.greenLight,
                    color: themeColors.green,
                  }}
                >
                  4
                </span>
                <p
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  The Circle follows its payout cycle, with members receiving
                  their turns according to the agreed arrangement.
                </p>
              </div>
            </div>

            <div
              className="mt-4 rounded-xl px-4 py-3"
              style={{ backgroundColor: themeColors.greenLight }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{ color: themeColors.green }}
              >
                Members can follow contributions, upcoming deadlines, payout
                turns and Circle progress in one place.
              </p>
            </div>
          </div>

          {/* Outcome */}
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
              <h2
                className="mb-1 text-base font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                More Control Over When Money Is Available
              </h2>

              <p
                className="text-sm leading-relaxed"
                style={{ color: themeColors.mid }}
              >
                Setting release rules lets John keep money meant for later
                from being available all at once. MOVA follows his schedule,
                giving him more say in when it becomes available.
              </p>
            </div>
          </div>

          {/* Before vs After */}
          <div
            className="rounded-[18px] px-5 py-5"
            style={{ backgroundColor: themeColors.background }}
          >
            <h2
              className="mb-4 text-base font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              What Changes With MOVA
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.red }}
                >
                  Before
                </p>

                <ul className="space-y-1.5">
                  {[
                    'Money for later is easy to spend now',
                    'Less available when expenses are due',
                    'Relying on willpower',
                    'No release schedule',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs"
                      style={{ color: themeColors.mid }}
                    >
                      <XCircle
                        size={12}
                        className="mt-0.5 shrink-0"
                        style={{ color: themeColors.red }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.green }}
                >
                  With MOVA
                </p>

                <ul className="space-y-1.5">
                  {[
                    'Set money aside in wallets',
                    'Choose how much to release',
                    'Set when money becomes available',
                    'MOVA follows the rules you set',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs"
                      style={{ color: themeColors.mid }}
                    >
                      <CheckCircle
                        size={12}
                        className="mt-0.5 shrink-0"
                        style={{ color: themeColors.green }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Why MOVA */}
          <div
            className="rounded-[18px] px-5 py-5"
            style={{ backgroundColor: themeColors.background }}
          >
            <h2
              className="mb-4 text-base font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Why MOVA?
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield size={16} style={{ color: themeColors.green }} />
                <span
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  Choose your release amount and schedule
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: themeColors.green }} />
                <span
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  Set money aside in separate wallets
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Wand2 size={16} style={{ color: themeColors.green }} />
                <span
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  MOVA follows the rules you set
                </span>
              </div>

              <div className="flex items-center gap-3">
                <RefreshCw size={16} style={{ color: themeColors.green }} />
                <span
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  See when money is due to be released
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Users size={16} style={{ color: themeColors.green }} />
                <span
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  Manage shared contribution arrangements
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Wallet size={16} style={{ color: themeColors.green }} />
                <span
                  className="text-sm"
                  style={{ color: themeColors.mid }}
                >
                  You stay in control of your release rules
                </span>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2
              className="mb-4 text-lg font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Frequently Asked Questions
            </h2>

            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="mb-3 overflow-hidden rounded-[14px]"
                style={{ border: `1px solid ${themeColors.border}` }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:opacity-80"
                  style={{ backgroundColor: themeColors.background }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    {faq.question}
                  </span>

                  {openFaq === index ? (
                    <ChevronUp
                      size={18}
                      className="shrink-0"
                      style={{ color: themeColors.mid }}
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="shrink-0"
                      style={{ color: themeColors.mid }}
                    />
                  )}
                </button>

                {openFaq === index && (
                  <div
                    className="px-4 pb-4"
                    style={{ backgroundColor: themeColors.background }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: themeColors.mid }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/about')}
            className="group flex cursor-pointer items-center justify-center gap-2 text-[14px] font-medium transition-all hover:gap-3"
            style={{ color: themeColors.green }}
          >
            <Info size={16} />
            <span>About Mova</span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </section>
    </AuthLayout>
  )
}
