// src/pages/legal/PrivacyPage.tsx

import {
  HelpCircle,
  Info,
  FileText,
  ShieldCheck,
  Cookie,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import BackButton from '../../components/ui/BackButton'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'
import {
  PRIVACY_SECTIONS,
  PRIVACY_VERSION,
} from '../../content/legal/privacy'

export default function PrivacyPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  return (
    <AuthLayout>
      <section className="flex flex-col py-10">
        <div className="mb-6 flex items-center gap-3">
          <BackButton
            onClick={() => navigate(-1)}
            variant="subtle"
          />

          <h1
            className="text-xl font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Privacy Policy
          </h1>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border p-4">
          <ShieldCheck
            size={22}
            className="mt-0.5 shrink-0"
            style={{ color: themeColors.green }}
          />

          <div>
            <h2
              className="mb-1 text-sm font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Your privacy matters
            </h2>

            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              This policy explains how MOVA collects, uses, shares,
              protects, and retains personal information, including
              your choices about optional cookies and tracking.
            </p>
          </div>
        </div>

        <p
          className="mb-6 text-sm"
          style={{ color: themeColors.mid }}
        >
          Version {PRIVACY_VERSION}
        </p>

        <div className="space-y-6">
          {PRIVACY_SECTIONS.map((section, index) => (
            <div
              key={section.title}
              className="flex items-start gap-4"
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  backgroundColor: themeColors.greenLight,
                  color: themeColors.green,
                }}
              >
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  className="mb-2 text-base font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  {section.title}
                </h2>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: themeColors.mid }}
                >
                  {section.content}
                </p>

                {section.title === 'Cookie Consent and Your Choices' && (
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(
                        new Event('mova:open-cookie-settings'),
                      )
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                    style={{
                      color: themeColors.charcoal,
                      borderColor: themeColors.border,
                    }}
                  >
                    <Cookie
                      size={16}
                      style={{ color: themeColors.green }}
                    />
                    Manage cookie preferences
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

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
            <button
              type="button"
              onClick={() => navigate('/legal/terms')}
              className="group flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <span className="flex items-center gap-2">
                <FileText
                  size={16}
                  style={{ color: themeColors.green }}
                />
                Terms & Conditions
              </span>

              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: themeColors.mid }}
              >
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/how-it-works')}
              className="group flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <span className="flex items-center gap-2">
                <HelpCircle
                  size={16}
                  style={{ color: themeColors.green }}
                />
                How it works
              </span>

              <span
                className="transition-transform group-hover:translate-x-1"
                style={{ color: themeColors.mid }}
              >
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/about')}
              className="group flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <span className="flex items-center gap-2">
                <Info
                  size={16}
                  style={{ color: themeColors.green }}
                />
                About MOVA
              </span>

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