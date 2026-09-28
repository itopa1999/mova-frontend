// src/pages/auth/RegisterPage.tsx

import {
  Check,
  UserPlus,
} from 'lucide-react'

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'

import { useNavigate } from 'react-router-dom'

import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { useTheme } from '../../hooks/useTheme'

import {
  checkRegistrationAvailability,
} from '../../services/auth/check-availability'

import {
  stepToRoute,
} from '../../services/auth/registration-steps'

import {
  resendVerificationCode,
} from '../../services/auth/resend-verification'

import {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
  validatePhone,
} from '../../utils/validation'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface TouchedFields {
  firstName: boolean
  lastName: boolean
  email: boolean
  phone: boolean
  password: boolean
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const [form, setForm] =
    useState<FormData>({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    })

  const [touched, setTouched] =
    useState<TouchedFields>({
      firstName: false,
      lastName: false,
      email: false,
      phone: false,
      password: false,
    })

  const [agreedToTerms, setAgreedToTerms] =
    useState(false)

  const [termsTouched, setTermsTouched] =
    useState(false)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [isResending, setIsResending] = useState(false)

  const [serverErrors, setServerErrors] = useState<{
    email?: string
    phone?: string
  }>({})

  const [submitError, setSubmitError] = useState<string | null>(null)

  const errors = {
    firstName: validateFirstName(
      form.firstName,
    ),

    lastName: validateLastName(
      form.lastName,
    ),

    email:
      serverErrors.email ??
      validateEmail(form.email),

    phone:
      serverErrors.phone ??
      validatePhone(form.phone),

    password: validatePassword(
      form.password,
    ),
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const {
      name,
      value,
    } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    if (name === 'email' && serverErrors.email) {
      setServerErrors((prev) => ({ ...prev, email: undefined }))
    }
    if (name === 'phone' && serverErrors.phone) {
      setServerErrors((prev) => ({ ...prev, phone: undefined }))
    }
    if (submitError) setSubmitError(null)
  }

  function handleBlur(
    field: keyof TouchedFields,
  ) {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }))
  }

  function handleTermsChange() {
    setTermsTouched(true)

    setAgreedToTerms(
      (current) => !current,
    )
  }

  async function handleResendVerification() {
    const emailError = validateEmail(form.email)
    if (emailError) {
      setTouched((prev) => ({ ...prev, email: true }))
      return
    }

    if (!form.firstName.trim()) {
      setTouched((prev) => ({ ...prev, firstName: true }))
      return
    }

    setIsResending(true)

    try {
      const response = await resendVerificationCode({
        email: form.email,
        platform: 'web',
        purpose: 'account-verification',
      })

      if (response.is_success) {
        sessionStorage.removeItem('registrationData')
        sessionStorage.setItem(
          'registrationData',
          JSON.stringify({
            firstName: form.firstName,
            email: form.email,
          })
        )

        navigate('/verify-email')
      }
    } finally {
      setIsResending(false)
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
    })

    setTermsTouched(true)

    const hasErrors =
      Object.values(errors).some(
        (error) => !!error,
      )

    if (hasErrors) {
      return
    }

    if (!agreedToTerms) {
      return
    }

    setIsSubmitting(true)
    setServerErrors({})
    setSubmitError(null)

    try {
      const result = await checkRegistrationAvailability({
        email: form.email.trim(),
        phonenumber: form.phone.trim(),
      })

      if (!result.is_success || !result.data) {
        setIsSubmitting(false)
        return
      }

      const {
        emailAvailable,
        phoneAvailable,
        canProceed,
        nextStep,
      } = result.data

      if (!canProceed) {
        const nextServerErrors: {
          email?: string
          phone?: string
        } = {}

        if (!emailAvailable) {
          nextServerErrors.email = 'This email is already registered.'
        }

        if (!phoneAvailable) {
          nextServerErrors.phone =
            'This phone number is already registered.'
        }

        setServerErrors(nextServerErrors)

        setTouched((prev) => ({
          ...prev,
          email: true,
          phone: true,
        }))

        setIsSubmitting(false)
        return
      }

      const route = stepToRoute[nextStep]

      if (!route) {
        if (import.meta.env.DEV) {
          console.warn(
            `[RegisterPage] No route mapped for nextStep: "${nextStep}"`
          )
        }

        setSubmitError(
          'We could not determine the next step. Please try again.'
        )
        setIsSubmitting(false)
        return
      }

      navigate(route, {
        state: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        },
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const termsInvalid =
    termsTouched && !agreedToTerms

  function handleTermsClick() {
    navigate('/terms')
  }

  function handlePrivacyClick() {
    navigate('/privacy')
  }

  return (
    <AuthLayout>
      <section className="pt-10">

        <div
          className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-[17px]"
          style={{
            backgroundColor:
              themeColors.greenLight,
          }}
        >
          <UserPlus
            size={32}
            strokeWidth={2}
            style={{
              color:
                themeColors.green,
            }}
          />
        </div>

        <h1
          className="mb-5 text-[36px] font-extrabold leading-[1.08] tracking-[-0.035em]"
          style={{
            color:
              themeColors.charcoal,
          }}
        >
          Create your
          <br />
          MOVA account
        </h1>

        <p
          className="max-w-[430px] text-[16px] leading-[1.65]"
          style={{
            color:
              themeColors.mid,
          }}
        >
          Start taking control of your
          spending today. It only takes a
          minute to create your account.
        </p>

      </section>

      <section className="py-8">

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-2 gap-3">

            <Input
              label="First name"
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              onBlur={() => handleBlur('firstName')}
              error={errors.firstName}
              touched={touched.firstName}
              required
              autoComplete="given-name"
            />

            <Input
              label="Last name"
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              onBlur={() => handleBlur('lastName')}
              error={errors.lastName}
              touched={touched.lastName}
              required
              autoComplete="family-name"
            />

          </div>

          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            touched={touched.email}
            required
            autoComplete="email"
          />

          <Input
            label="Phone number"
            name="phone"
            type="tel"
            placeholder="+234 800 000 0000"
            value={form.phone}
            onChange={handleChange}
            onBlur={() => handleBlur('phone')}
            error={errors.phone}
            touched={touched.phone}
            required
            autoComplete="tel"
          />

          <Input
            label="Create password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            error={errors.password}
            touched={touched.password}
            required
            autoComplete="new-password"
          />

          <div className="mb-5 mt-1">

            <div className="flex items-start gap-3">

              <button
                type="button"
                onClick={handleTermsChange}
                className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all duration-300"
                style={{
                  backgroundColor:
                    agreedToTerms
                      ? themeColors.green
                      : termsInvalid
                        ? themeColors.redBackground
                        : themeColors.background,

                  borderColor:
                    agreedToTerms
                      ? themeColors.green
                      : termsInvalid
                        ? themeColors.red
                        : themeColors.border,
                }}
                aria-label="Agree to terms and conditions"
                aria-checked={agreedToTerms}
                role="checkbox"
              >
                {agreedToTerms && (
                  <Check
                    size={11}
                    strokeWidth={2.5}
                    color="#FFFFFF"
                  />
                )}
              </button>

              <span
                className="text-[12px] leading-[1.5]"
                style={{
                  color:
                    termsInvalid
                      ? themeColors.red
                      : themeColors.mid,
                }}
              >
                I agree to the{' '}

                <button
                  type="button"
                  onClick={handleTermsClick}
                  className="font-semibold transition-opacity duration-200 hover:opacity-75 cursor-pointer"
                  style={{
                    color:
                      termsInvalid
                        ? themeColors.red
                        : themeColors.green,
                  }}
                >
                  Terms & Conditions
                </button>

                {' '}and{' '}

                <button
                  type="button"
                  onClick={handlePrivacyClick}
                  className="font-semibold transition-opacity duration-200 hover:opacity-75 cursor-pointer"
                  style={{
                    color:
                      termsInvalid
                        ? themeColors.red
                        : themeColors.green,
                  }}
                >
                  Privacy Policy
                </button>
              </span>

            </div>

            {termsInvalid && (
              <p
                className="mt-1.5 ml-[30px] text-[12px]"
                style={{
                  color:
                    themeColors.red,
                }}
              >
                You must accept the Terms &
                Conditions and Privacy Policy
              </p>
            )}

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
              <p className="text-[12px]" style={{ color: '#EF4444' }}>
                {submitError}
              </p>
            </div>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            loadingText="Checking availability..."
          >
            Continue
          </Button>

          <p
            className="mt-5 text-center text-[13px]"
            style={{
              color:
                themeColors.mid,
            }}
          >
            Already registered but didn't
            receive the email?{' '}
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="font-semibold transition-opacity duration-200 hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                color: isResending ? themeColors.mid : themeColors.green,
                cursor: isResending ? 'not-allowed' : 'pointer',
              }}
            >
              {isResending ? 'Resending...' : 'Resend verification email'}
            </button>
          </p>

          <p
            className="mt-4 pb-4 text-center text-[13px]"
            style={{
              color:
                themeColors.mid,
            }}
          >
            Already have an account?{' '}

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-semibold transition-opacity duration-200 hover:opacity-75"
              style={{
                color:
                  themeColors.green,
              }}
            >
              Log in
            </button>
          </p>

        </form>

      </section>
    </AuthLayout>
  )
}