import {
  LogIn,
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

import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

import {
  validateRequired,
} from '../../utils/validation'

import { loginUser } from '../../services/auth/login'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const [touched, setTouched] = useState({
    identifier: false,
    password: false,
  })

  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const identifierError =
    touched.identifier
      ? validateRequired(
          identifier,
          'Email or phone number',
        )
      : undefined

  const passwordError =
    touched.password
      ? validateRequired(
          password,
          'Password',
        )
      : undefined

  function handleIdentifierChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setIdentifier(event.target.value)
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setPassword(event.target.value)
  }

  function handleIdentifierBlur() {
    setTouched((current) => ({
      ...current,
      identifier: true,
    }))
  }

  function handlePasswordBlur() {
    setTouched((current) => ({
      ...current,
      password: true,
    }))
  }

  function handleForgotPassword() {
    navigate('/forgot-password')
  }

  function handleCreateAccount() {
    navigate('/register')
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setTouched({
      identifier: true,
      password: true,
    })

    if (
      !identifier.trim() ||
      !password.trim()
    ) {
      return
    }

    setIsLoggingIn(true)

    try {
      await loginUser({
        emailOrPhone: identifier.trim(),
        password: password.trim(),
        platform: 'web',
      }, navigate)
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex min-h-full flex-col">

        {/* =================================================
            LOGIN CONTENT
            ================================================= */}

        <div className="pt-20 sm:pt-24">

          {/* =================================================
              LOGIN ICON
              ================================================= */}

          <div
            className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-[17px]"
            style={{
              backgroundColor:
                themeColors.greenLight,
            }}
          >
            <LogIn
              size={32}
              strokeWidth={2}
              style={{
                color:
                  themeColors.green,
              }}
            />
          </div>

          {/* =================================================
              INTRODUCTION
              ================================================= */}

          <div className="mb-9">

            <h1
              className="text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em]"
              style={{
                color:
                  themeColors.charcoal,
              }}
            >
              Welcome back
            </h1>

            <p
              className="mt-2 text-[14px] leading-6"
              style={{
                color:
                  themeColors.mid,
              }}
            >
              Log in to continue managing
              your money with MOVA.
            </p>

          </div>

          {/* =================================================
              FORM
              ================================================= */}

          <form
            onSubmit={handleSubmit}
            noValidate
          >

            <Input
              label="Email or phone number"
              name="identifier"
              type="text"
              placeholder="Enter your email or phone number"
              value={identifier}
              onChange={
                handleIdentifierChange
              }
              onBlur={handleIdentifierBlur}
              error={identifierError}
              touched={touched.identifier}
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={
                handlePasswordChange
              }
              onBlur={handlePasswordBlur}
              error={passwordError}
              touched={touched.password}
              required
              autoComplete="current-password"
            />

            {/* =================================================
                FORGOT PASSWORD
                ================================================= */}

            <div className="-mt-1 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="shrink-0 text-[13px] font-semibold transition-opacity duration-200 hover:opacity-70"
                style={{
                  color:
                    themeColors.green,
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* =================================================
                LOGIN BUTTON
                ================================================= */}

            <div className="mt-7">

              <Button
                type="submit"
                loading={isLoggingIn}
                loadingText="Logging in..."
                disabled={
                  !identifier.trim() ||
                  !password.trim()
                }
              >
                Log in
              </Button>

            </div>

          </form>

        </div>

        {/* =================================================
            CREATE ACCOUNT
            ================================================= */}

        <div className="mt-auto pb-6 pt-14 text-center">

          <p
            className="text-[13px]"
            style={{
              color:
                themeColors.mid,
            }}
          >
            Don't have an account?{' '}

            <button
              type="button"
              onClick={handleCreateAccount}
              className="font-semibold transition-opacity duration-200 hover:opacity-70"
              style={{
                color:
                  themeColors.green,
              }}
            >
              Create account
            </button>

          </p>

        </div>

      </div>
    </AuthLayout>
  )
}