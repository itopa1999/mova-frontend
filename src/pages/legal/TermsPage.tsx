// src/pages/legal/TermsPage.tsx

import {
  HelpCircle,
  Info,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import BackButton from '../../components/ui/BackButton'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'
import {
  TERMS_SECTIONS,
  TERMS_VERSION,
} from '../../content/legal/terms'

export default function TermsPage() {
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
            Terms & Conditions
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
              Important information
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              Please read these terms carefully before using MOVA.
              You must be at least 18 years old to create an account
              or use our services.
            </p>
          </div>
        </div>

        <p
          className="mb-6 text-sm"
          style={{ color: themeColors.mid }}
        >
          Version {TERMS_VERSION}
        </p>

        <div className="space-y-6">
          {TERMS_SECTIONS.map((section, index) => (
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
              onClick={() => navigate('/legal/privacy')}
              className="group flex w-full items-center justify-between text-left text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: themeColors.charcoal }}
            >
              <span className="flex items-center gap-2">
                <FileCheck2
                  size={16}
                  style={{ color: themeColors.green }}
                />
                Privacy Policy
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