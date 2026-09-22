import { ArrowLeft, HelpCircle, Info, FileCheck2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'

export default function TermsPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <AuthLayout>
      <section className="flex flex-col py-10">
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
            Terms & Conditions
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <p className="text-sm" style={{ color: themeColors.mid }}>
            Last updated: September 2026
          </p>

          {/* Section 1 */}
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
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Acceptance of Terms
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                By using MOVA, you agree to these Terms & Conditions. If you do not agree, please do not use our
                services.
              </p>
            </div>
          </div>

          {/* Section 2 */}
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
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Eligibility
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                You must be at least 18 years old and have the legal capacity to enter into a binding agreement to
                use MOVA.
              </p>
            </div>
          </div>

          {/* Section 3 */}
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
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Account Registration
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to
                provide accurate and complete information during registration.
              </p>
            </div>
          </div>

          {/* Section 4 */}
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
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Templates
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                Templates are suggested wallet configurations provided for convenience. Amounts, schedules, and
                categories are recommendations, not financial advice. You are responsible for reviewing and
                adjusting any template before creating a wallet. MOVA does not guarantee that a template's
                defaults are suitable for your circumstances.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              5
            </div>
            <div>
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Automation
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                Automation executes the rules you configure — refilling a wallet from your main balance when
                triggered. You authorize MOVA to debit your main balance and credit the wallet according to those
                rules. Automation is a convenience, not a guarantee: refills may be skipped if your main balance
                is insufficient, if your minimum-balance guardrail is not met, or if you have reached your renewal
                cap. You can pause, edit, or disable automation at any time. Fees for automation are charged only
                when a refill succeeds.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              6
            </div>
            <div>
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                User Conduct
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                You agree not to misuse MOVA's services, including but not limited to fraudulent activities,
                unauthorized access, or any action that violates applicable laws.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              7
            </div>
            <div>
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Limitation of Liability
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                MOVA provides its services "as is." We do not guarantee uninterrupted or error-free service. We are
                not liable for any direct, indirect, or consequential damages arising from your use of our
                platform, including any missed, delayed, or skipped automation refills.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              8
            </div>
            <div>
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Termination
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                We reserve the right to suspend or terminate your account if you violate these terms or engage in
                fraudulent activities.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              9
            </div>
            <div>
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Changes to Terms
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                We may update these Terms & Conditions from time to time. Continued use of MOVA constitutes
                acceptance of the updated terms.
              </p>
            </div>
          </div>

          {/* Section 10 */}
          <div className="flex gap-4">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: themeColors.greenLight,
                color: themeColors.green,
              }}
            >
              10
            </div>
            <div>
              <h2 className="mb-2 text-base font-semibold" style={{ color: themeColors.charcoal }}>
                Contact Us
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                If you have any questions about these terms, please contact us at support@mova.com.
              </p>
            </div>
          </div>
        </div>

        {/* Related links */}
        <div
          className="mt-8 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: themeColors.mid }}
          >
            Related
          </p>

          <div className="flex flex-col gap-3">
            {/* Privacy Policy */}
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="group flex cursor-pointer items-center justify-between text-[14px] font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <div className="flex items-center gap-2">
                <FileCheck2 size={16} style={{ color: themeColors.green }} />
                <span>Privacy Policy</span>
              </div>
              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: themeColors.mid }}
              >
                →
              </span>
            </button>

            {/* How it works */}
            <button
              type="button"
              onClick={() => navigate('/how-it-works')}
              className="group flex cursor-pointer items-center justify-between text-[14px] font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <div className="flex items-center gap-2">
                <HelpCircle size={16} style={{ color: themeColors.green }} />
                <span>How it works</span>
              </div>
              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: themeColors.mid }}
              >
                →
              </span>
            </button>

            {/* About Mova */}
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="group flex cursor-pointer items-center justify-between text-[14px] font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <div className="flex items-center gap-2">
                <Info size={16} style={{ color: themeColors.green }} />
                <span>About Mova</span>
              </div>
              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: themeColors.mid }}
              >
                →
              </span>
            </button>
          </div>
        </div>
      </section>
    </AuthLayout>
  )
}