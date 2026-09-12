import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'

export default function PrivacyPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <AuthLayout>
      {/* Main Content */}
      <section className="flex flex-col py-10">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <h1
            className="text-xl font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Privacy Policy
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
                Information We Collect
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                We collect personal information such as your name, email address, phone number, and financial information to provide our services.
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
                How We Use Your Information
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                We use your information to process transactions, provide customer support, improve our services, and comply with legal obligations.
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
                Data Protection
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                We implement industry-standard security measures to protect your personal data from unauthorized access, alteration, or disclosure.
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
                Third-Party Sharing
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                We do not sell your personal information. We may share your data with trusted partners who help us deliver our services, subject to strict confidentiality agreements.
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
                Your Rights
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                You have the right to access, modify, or delete your personal information at any time. Contact us to exercise these rights.
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
                Cookies
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                We use cookies to improve your experience on our platform. You can manage your cookie preferences in your browser settings.
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
                Data Retention
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                We retain your personal data only as long as necessary to provide our services and comply with legal requirements.
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
                Contact Us
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: themeColors.mid }}>
                If you have any privacy-related questions, please contact us at privacy@mova.com.
              </p>
            </div>
          </div>
        </div>

        {/* Link to Terms & Conditions */}
        <div className="mt-8 border-t pt-6" style={{ borderColor: themeColors.border }}>
          <p className="text-center text-sm" style={{ color: themeColors.mid }}>
            Read our{' '}
            <button
              onClick={() => navigate('/terms')}
              className="font-semibold transition-opacity hover:opacity-70"
              style={{ color: themeColors.green }}
            >
              Terms & Conditions
            </button>
          </p>
        </div>
      </section>
    </AuthLayout>
  )
}