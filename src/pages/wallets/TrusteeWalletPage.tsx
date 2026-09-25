import {
  ArrowLeft,
  Clock,
  Mail,
  Shield,
  Lock,
  Bell,
  CheckCircle,
  XCircle,
  Sparkles,
  Info,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

export default function TrusteeWalletComingSoonPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <AuthLayout>
      <section className="flex flex-col py-10">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 flex cursor-pointer items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: themeColors.mid }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Coming Soon badge */}
        <div
          className="mb-4 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <Sparkles size={13} strokeWidth={2.4} style={{ color: themeColors.green }} />
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: themeColors.green }}
          >
            Coming Soon
          </span>
        </div>

        {/* Header */}
        <h1
          className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em]"
          style={{ color: themeColors.charcoal }}
        >
          Trustee Wallets
        </h1>

        <p
          className="mt-3 text-[15px] leading-[1.65]"
          style={{ color: themeColors.mid }}
        >
          A new kind of wallet that puts someone you trust between your
          money and your spending. Every release needs their approval
          before it happens — no exceptions.
        </p>

        {/* Hero card */}
        <div
          className="mt-8 rounded-[18px] p-5"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: themeColors.green }}
          >
            Why this exists
          </p>

          <p
            className="mt-2 text-[15px] font-semibold leading-[1.5]"
            style={{ color: themeColors.charcoal }}
          >
            Sometimes you don't want to be the only person who can say
            yes. A trustee wallet makes every release a shared decision
            — so the money stays yours, but the timing is theirs too.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-10">
          <h2
            className="text-[18px] font-bold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            How it will work
          </h2>

          <div className="mt-5 space-y-5">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                1
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Create a trustee wallet
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  Fund it like any other wallet. But instead of setting a
                  release schedule, you'll add the email of someone you
                  trust — your trustee. They don't need a Mova account.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                2
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Request a release when you need it
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  No schedule runs on its own. You decide when to ask.
                  Tap "Request Release," enter the amount, and choose
                  where it should go — bank, main balance, or wallet
                  balance.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                3
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Your trustee gets an email
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  They see who asked, how much, and which wallet it's
                  from. One tap on Approve or Reject — no login, no
                  account, no app download. The link is single-use and
                  expires automatically.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                4
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Money moves only on approval
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  If the trustee approves, the money leaves the wallet
                  and goes where you asked. If they reject, nothing
                  moves — and you'll see why.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                5
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Three hours to respond
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  Each request has a 3-hour window. If the trustee doesn't
                  act in time, the request expires and you wait another 3
                  hours before trying again. No rushing, no surprises.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-10">
          <h2
            className="text-[18px] font-bold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            What you'll get
          </h2>

          <div className="mt-5 space-y-4">
            {/* Feature 1 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <Shield size={16} strokeWidth={2} style={{ color: themeColors.green }} />
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  A real second signature
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  Your money stays in your wallet. Nothing moves without
                  the trustee saying yes. Even you can't bypass it.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <Mail size={16} strokeWidth={2} style={{ color: themeColors.green }} />
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  No account needed for the trustee
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  They approve directly from an email. No signup, no
                  password to remember, no Mova app required.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <Clock size={16} strokeWidth={2} style={{ color: themeColors.green }} />
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Strict 3-hour decision window
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  Every request is a fresh decision. Stale approvals
                  never linger — they expire on their own.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <Bell size={16} strokeWidth={2} style={{ color: themeColors.green }} />
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Both sides stay informed
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  You're notified when a request is approved, rejected,
                  or expires. Your trustee is reminded before the window
                  closes.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.greenLight }}
              >
                <Lock size={16} strokeWidth={2} style={{ color: themeColors.green }} />
              </div>
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Full history of every decision
                </p>
                <p
                  className="mt-0.5 text-[12px] leading-[1.6]"
                  style={{ color: themeColors.mid }}
                >
                  Every request, every approval, every rejection — logged
                  and visible. Nothing disappears, nothing is hidden.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who it's for */}
        <div
          className="mt-10 rounded-[18px] border p-5"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <h2
            className="text-[16px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Who it's for
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle
                size={14}
                strokeWidth={2.2}
                style={{ color: themeColors.green, marginTop: 3, flexShrink: 0 }}
              />
              <p
                className="text-[13px] leading-[1.6]"
                style={{ color: themeColors.mid }}
              >
                <strong style={{ color: themeColors.charcoal }}>
                  Parents supporting a child in school
                </strong>{' '}
                — approve each term's fees release, but not a cent more.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle
                size={14}
                strokeWidth={2.2}
                style={{ color: themeColors.green, marginTop: 3, flexShrink: 0 }}
              />
              <p
                className="text-[13px] leading-[1.6]"
                style={{ color: themeColors.mid }}
              >
                <strong style={{ color: themeColors.charcoal }}>
                  Business partners sharing a joint fund
                </strong>{' '}
                — no single person can pull money out alone.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle
                size={14}
                strokeWidth={2.2}
                style={{ color: themeColors.green, marginTop: 3, flexShrink: 0 }}
              />
              <p
                className="text-[13px] leading-[1.6]"
                style={{ color: themeColors.mid }}
              >
                <strong style={{ color: themeColors.charcoal }}>
                  Anyone with a spending habit they want to break
                </strong>{' '}
                — make a friend the gatekeeper of your own money.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle
                size={14}
                strokeWidth={2.2}
                style={{ color: themeColors.green, marginTop: 3, flexShrink: 0 }}
              />
              <p
                className="text-[13px] leading-[1.6]"
                style={{ color: themeColors.mid }}
              >
                <strong style={{ color: themeColors.charcoal }}>
                  Trusts and estates managed by a trustee
                </strong>{' '}
                — distribute funds only when they say yes.
              </p>
            </div>
          </div>
        </div>

        {/* What it's NOT */}
        <div
          className="mt-6 rounded-[18px] border p-5"
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-start gap-3">
            <Info
              size={16}
              strokeWidth={2.2}
              style={{ color: themeColors.mid, marginTop: 2, flexShrink: 0 }}
            />
            <div>
              <p
                className="text-[14px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                What it's not
              </p>

              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2">
                  <XCircle
                    size={13}
                    strokeWidth={2.2}
                    style={{ color: '#EF4444', marginTop: 3, flexShrink: 0 }}
                  />
                  <p
                    className="text-[12px] leading-[1.6]"
                    style={{ color: themeColors.mid }}
                  >
                    Not a transfer to someone else. The money never leaves
                    your ownership.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <XCircle
                    size={13}
                    strokeWidth={2.2}
                    style={{ color: '#EF4444', marginTop: 3, flexShrink: 0 }}
                  />
                  <p
                    className="text-[12px] leading-[1.6]"
                    style={{ color: themeColors.mid }}
                  >
                    Not a replacement for your PIN. Your PIN still confirms
                    every action; the trustee just adds a second layer.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <XCircle
                    size={13}
                    strokeWidth={2.2}
                    style={{ color: '#EF4444', marginTop: 3, flexShrink: 0 }}
                  />
                  <p
                    className="text-[12px] leading-[1.6]"
                    style={{ color: themeColors.mid }}
                  >
                    Not automatic. You ask, they answer. Every time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing */}
        <div
          className="mt-10 rounded-[18px] p-5 text-center"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <p
            className="text-[14px] font-semibold leading-[1.5]"
            style={{ color: themeColors.charcoal }}
          >
            We're building this now. Want early access?
          </p>

          <p
            className="mt-2 text-[12px]"
            style={{ color: themeColors.mid }}
          >
            Reach out and we'll let you know the moment it's live.
          </p>

          <a
            href="mailto:hello@mova.app?subject=Trustee%20Wallet%20Early%20Access"
            className="mt-4 inline-block cursor-pointer rounded-[12px] px-6 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Request Early Access
          </a>
        </div>

        <div className="h-10" />
      </section>
    </AuthLayout>
  )
}