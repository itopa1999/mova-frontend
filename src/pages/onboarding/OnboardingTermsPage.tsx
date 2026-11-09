// src/pages/onboarding/OnboardingTermsPage.tsx

import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCw,
  FileText,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import OnboardingGuard from '../../components/onboarding/OnboardingGuard'
import { colors, darkColors } from '../../styles/tokens'
import { useTheme } from '../../hooks/useTheme'
import { useOnboarding } from '../../hooks/useOnboarding'
import { OnboardingStage } from '../../types/onboarding'
import {
  acceptLegalDocument,
  getCurrentLegalDocument,
} from '../../services/app/legal'
import {
  TERMS_SECTIONS,
  TERMS_VERSION,
} from '../../content/legal/terms'

type ViewState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'drift'; backendVersion: string }
  | { kind: 'ready'; backendVersion: string }

function TermsContent() {
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const { applyStageFromResponse } = useOnboarding()

  const [state, setState] = useState<ViewState>({ kind: 'loading' })
  const [agreed, setAgreed] = useState(false)
  const [agreedTouched, setAgreedTouched] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptError, setAcceptError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setState({ kind: 'loading' })

      try {
        const res = await getCurrentLegalDocument('Terms')

        if (cancelled) return

        if (!res.is_success || !res.data || res.data.documents.length === 0) {
          setState({
            kind: 'error',
            message: res.message || 'The Terms of Service are not available right now.',
          })
          return
        }

        const backendVersion = res.data.documents[0].version

        if (backendVersion !== TERMS_VERSION) {
          setState({ kind: 'drift', backendVersion })
          return
        }

        setState({ kind: 'ready', backendVersion })
      } catch {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: 'Could not load the Terms of Service. Please try again.',
          })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleAccept = async () => {
    if (state.kind !== 'ready' || isAccepting) return

    setAgreedTouched(true)
    if (!agreed) return

    setIsAccepting(true)
    setAcceptError(null)

    try {
      const res = await acceptLegalDocument('Terms', TERMS_VERSION)

      if (!res.is_success || !res.data) {
        if (res.status_code === '409') {
          setAcceptError(
            'The Terms of Service were updated. Please refresh the page to see the latest version.',
          )
        } else {
          setAcceptError(
            res.message || 'Could not accept the Terms of Service. Please try again.',
          )
        }
        return
      }

      // Final legal doc — applyStageFromResponse detects Completed and navigates to /dashboard
      applyStageFromResponse(res.data)
    } catch {
      setAcceptError('Something went wrong. Please try again.')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleReload = () => window.location.reload()

  if (state.kind === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-150px)] items-center justify-center">
        <Loader2 size={28} className="animate-spin" style={{ color: themeColors.green }} />
      </div>
    )
  }

  if (state.kind === 'error') {
    return (
      <div className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center px-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
            color: '#EF4444',
          }}
        >
          <AlertCircle size={28} />
        </div>
        <p
          className="mt-4 text-[15px] font-semibold"
          style={{ color: themeColors.charcoal }}
        >
          Could not load the Terms of Service
        </p>
        <p
          className="mt-1 max-w-[320px] text-[13px]"
          style={{ color: themeColors.mid }}
        >
          {state.message}
        </p>
        <button
          type="button"
          onClick={handleReload}
          className="mt-6 rounded-[12px] px-6 py-2.5 text-[13px] font-semibold text-white"
          style={{ backgroundColor: themeColors.green }}
        >
          Try again
        </button>
      </div>
    )
  }

  if (state.kind === 'drift') {
    return (
      <div className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center px-6 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
            color: '#F59E0B',
          }}
        >
          <RefreshCw size={28} />
        </div>
        <p
          className="mt-4 text-[15px] font-semibold"
          style={{ color: themeColors.charcoal }}
        >
          The Terms of Service have been updated
        </p>
        <p
          className="mt-1 max-w-[340px] text-[13px] leading-[1.55]"
          style={{ color: themeColors.mid }}
        >
          We&apos;ve published a newer version of the Terms of Service. Please refresh
          the page to see the latest text before accepting.
        </p>
        <p className="mt-3 text-[11px]" style={{ color: themeColors.mid }}>
          Bundled: {TERMS_VERSION} · Current: {state.backendVersion}
        </p>
        <button
          type="button"
          onClick={handleReload}
          className="mt-6 flex items-center gap-2 rounded-[12px] px-6 py-2.5 text-[13px] font-semibold text-white"
          style={{ backgroundColor: themeColors.green }}
        >
          <RefreshCw size={14} />
          Refresh now
        </button>
      </div>
    )
  }

  return (
    <section className="flex h-[calc(100vh-80px)] flex-col">
      <div className="shrink-0 px-5 pt-6">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px]"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <FileText size={22} style={{ color: themeColors.green }} />
        </div>

        <p className="mb-1 text-[12px]" style={{ color: themeColors.mid }}>
          Step 5 of 5
        </p>

        <h1
          className="text-[22px] font-bold tracking-[-0.02em]"
          style={{ color: themeColors.charcoal }}
        >
          Terms of Service
        </h1>

        <p className="mt-1 text-[11px]" style={{ color: themeColors.mid }}>
          Version {TERMS_VERSION}
        </p>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-5 pb-4">
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <FileText
            size={22}
            className="mt-0.5 shrink-0"
            style={{ color: themeColors.green }}
          />
          <div>
            <h2
              className="mb-1 text-sm font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Your rights and responsibilities
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: themeColors.mid }}
            >
              These Terms explain the rules that apply when you use MOVA. They cover
              your account, transactions, wallet features, and how we resolve disputes.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {TERMS_SECTIONS.map((section, index) => (
            <div key={section.title} className="flex items-start gap-4">
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

        <div className="mt-8 mb-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => {
                setAgreedTouched(true)
                setAgreed((v) => !v)
                if (acceptError) setAcceptError(null)
              }}
              className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[6px] border transition-all duration-200"
              style={{
                backgroundColor: agreed
                  ? themeColors.green
                  : agreedTouched && !agreed
                    ? themeColors.redBackground
                    : themeColors.background,
                borderColor: agreed
                  ? themeColors.green
                  : agreedTouched && !agreed
                    ? themeColors.red
                    : themeColors.border,
              }}
              role="checkbox"
              aria-checked={agreed}
              aria-label="I have read and agree to the Terms of Service"
            >
              {agreed && <Check size={12} strokeWidth={3} color="#FFFFFF" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setAgreedTouched(true)
                setAgreed((v) => !v)
                if (acceptError) setAcceptError(null)
              }}
              className="text-left text-[13px] leading-[1.5]"
              style={{
                color: agreedTouched && !agreed ? themeColors.red : themeColors.charcoal,
              }}
            >
              I have read and agree to the <strong>Terms of Service</strong>.
            </button>
          </div>

          {agreedTouched && !agreed && (
            <p className="mt-2 ml-[32px] text-[12px]" style={{ color: themeColors.red }}>
              You must accept the Terms of Service to continue.
            </p>
          )}
        </div>
      </div>

      <div
        className="shrink-0 border-t px-5 py-4"
        style={{
          backgroundColor: themeColors.background,
          borderColor: themeColors.border,
        }}
      >
        {acceptError && (
          <div
            className="mb-3 flex items-start gap-2 rounded-[10px] p-2.5"
            style={{
              backgroundColor: isDark
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(239, 68, 68, 0.06)',
            }}
          >
            <AlertCircle
              size={14}
              style={{ color: '#EF4444', marginTop: 1, flexShrink: 0 }}
            />
            <p className="text-[12px]" style={{ color: '#EF4444' }}>
              {acceptError}
            </p>
          </div>
        )}

        <Button
          type="button"
          loading={isAccepting}
          loadingText="Finishing..."
          onClick={handleAccept}
          disabled={!agreed}
        >
          Finish Setup
        </Button>
      </div>
    </section>
  )
}

export default function OnboardingTermsPage() {
  return (
    <AuthLayout>
      <OnboardingGuard stage={OnboardingStage.Terms}>
        <TermsContent />
      </OnboardingGuard>
    </AuthLayout>
  )
}