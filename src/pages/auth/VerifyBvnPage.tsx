// src/pages/auth/VerifyBvnPage.tsx

import {
  ShieldCheck,
  Lock,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { useTheme } from '../../hooks/useTheme'

import {
  registerUser,
} from '../../services/auth/register'

interface RegisterNavState {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export default function VerifyBvnPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()

  const themeColors = isDark ? darkColors : colors

  const state = location.state as RegisterNavState | null

  const [bvn, setBvn] = useState('')
  const [bvnTouched, setBvnTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (!state) {
    return (
      <AuthLayout>
        <div className="flex min-h-[300px] flex-col items-center justify-center py-10 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
            }}
          >
            <AlertCircle size={32} strokeWidth={1.5} />
          </div>
          <p
            className="mt-4 text-[15px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            Session expired
          </p>
          <p
            className="mt-1 max-w-[320px] text-[13px]"
            style={{ color: themeColors.mid }}
          >
            We lost your registration details. Please start again.
          </p>
          <button
            type="button"
            onClick={() => navigate('/register', { replace: true })}
            className="mt-5 rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Back to register
          </button>
        </div>
      </AuthLayout>
    )
  }

  const { firstName, lastName, email, phone, password } = state

  const bvnError =
    bvn.length > 0 && !/^\d{11}$/.test(bvn)
      ? 'BVN must be exactly 11 digits.'
      : ''

  const isFormValid = /^\d{11}$/.test(bvn)

  function handleBvnChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
    setBvn(digits)
    if (submitError) setSubmitError(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (isSubmitting) return

    setBvnTouched(true)

    if (!isFormValid) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await registerUser(
        {
          firstname: firstName,
          lastname: lastName,
          email,
          phonenumber: phone,
          bvn,
          password,
        },
        navigate
      )
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <section className="pt-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:opacity-70"
          style={{
            borderColor: themeColors.border,
            backgroundColor: themeColors.card,
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
        </button>

        <div
          className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-[17px]"
          style={{ backgroundColor: themeColors.greenLight }}
        >
          <ShieldCheck
            size={32}
            strokeWidth={2}
            style={{ color: themeColors.green }}
          />
        </div>

        <h1
          className="mb-5 text-[32px] font-extrabold leading-[1.1] tracking-[-0.035em]"
          style={{ color: themeColors.charcoal }}
        >
          One last step,
          <br />
          {firstName}
        </h1>

        <p
          className="max-w-[430px] text-[15px] leading-[1.65]"
          style={{ color: themeColors.mid }}
        >
          We need your BVN to verify your identity and unlock instant
          transfers on your MOVA account.
        </p>
      </section>

      <section className="py-8">
        <form onSubmit={handleSubmit}>
          <Input
            label="BVN"
            name="bvn"
            type="tel"
            inputMode="numeric"
            placeholder="Enter your 11-digit BVN"
            value={bvn}
            onChange={handleBvnChange}
            onBlur={() => setBvnTouched(true)}
            error={bvnError}
            touched={bvnTouched}
            required
            maxLength={11}
            autoComplete="off"
          />

          <div
            className="mb-5 mt-3 flex items-start gap-3 rounded-[12px] p-3"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.1)'
                : 'rgba(96, 165, 250, 0.06)',
              borderColor: isDark
                ? 'rgba(96, 165, 250, 0.2)'
                : 'rgba(96, 165, 250, 0.15)',
              borderWidth: 1,
            }}
          >
            <Lock
              size={16}
              style={{
                color: '#60A5FA',
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <p
              className="text-[12px] leading-[1.55]"
              style={{ color: themeColors.charcoal }}
            >
              Your BVN is hashed and stored securely. We never share it
              and it is only used to verify your identity.
            </p>
          </div>

          {submitError && (
            <div
              className="mb-4 flex items-start gap-2 rounded-[12px] p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.06)',
              }}
            >
              <AlertCircle
                size={16}
                style={{ color: '#EF4444', marginTop: 2, flexShrink: 0 }}
              />
              <p className="text-[12px]" style={{ color: '#EF4444' }}>
                {submitError}
              </p>
            </div>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Creating your account..."
          >
            Create Account
          </Button>

          <p
            className="mt-5 pb-4 text-center text-[12px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            By continuing, you agreed to our{' '}
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="font-semibold transition-opacity duration-200 hover:opacity-75"
              style={{ color: themeColors.green }}
            >
              Terms & Conditions
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="font-semibold transition-opacity duration-200 hover:opacity-75"
              style={{ color: themeColors.green }}
            >
              Privacy Policy
            </button>
            .
          </p>
        </form>
      </section>
    </AuthLayout>
  )
}