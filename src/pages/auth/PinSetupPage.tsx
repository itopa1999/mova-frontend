import {
  Delete,
  LockKeyhole,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import AuthLayout from '../../components/layout/AuthLayout'
import Button from '../../components/ui/Button'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { useTheme } from '../../hooks/useTheme'
import { setupPin } from '../../services/auth/pin-setup'

type KeypadKey =
  | number
  | null
  | 'delete'

export default function PinSetupPage() {
  const navigate = useNavigate()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const userDataRaw = sessionStorage.getItem('userData')
  const hasSession = !!userDataRaw

  useEffect(() => {
    if (!hasSession) {
      navigate('/login', { replace: true })
    }
  }, [hasSession, navigate])

  const [pin, setPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MAX_PIN_LENGTH = 6

  const keypadKeys: KeypadKey[] = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    null, 0, 'delete',
  ]

  function handleNumberPress(number: number) {
    if (isSubmitting) return
    if (pin.length >= MAX_PIN_LENGTH) return

    setError(null)
    setPin((currentPin) => `${currentPin}${number}`)
  }

  function handleDelete() {
    if (isSubmitting) return
    if (pin.length === 0) return

    setError(null)
    setPin((currentPin) => currentPin.slice(0, -1))
  }

  async function handleSetPin() {
    if (isSubmitting) return

    setError(null)

    if (!/^\d{6}$/.test(pin)) {
      setError('Please enter a 6-digit PIN.')
      return
    }

    setIsSubmitting(true)

    try {
      await setupPin(
        {
          pin,
          platform: 'web',
        },
        navigate
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'PIN setup failed. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <section
        className="flex min-h-[calc(100vh-150px)] flex-col"
        style={{
          color: themeColors.charcoal,
        }}
      >
        <div className="px-6 pt-10 text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[16px]"
            style={{
              backgroundColor: themeColors.greenLight,
            }}
          >
            <LockKeyhole
              size={26}
              strokeWidth={2}
              style={{
                color: themeColors.green,
              }}
            />
          </div>

          <p
            className="mb-1 text-[13px]"
            style={{ color: themeColors.mid }}
          >
            Step 3 of 3
          </p>

          <h1
            className="mb-2 text-[24px] font-extrabold tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            Create your MOVA PIN
          </h1>

          <p
            className="mx-auto mb-8 max-w-[360px] text-[14px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            Your PIN is an additional layer of protection for your account
            and transactions.
          </p>

          <div className="mb-3 flex items-center justify-center gap-4">
            {Array.from({ length: MAX_PIN_LENGTH }).map((_, index) => {
              const isFilled = index < pin.length

              return (
                <div
                  key={index}
                  className="h-4 w-4 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor: isFilled
                      ? themeColors.green
                      : themeColors.border,
                    transform: isFilled ? 'scale(1)' : 'scale(0.9)',
                  }}
                />
              )
            })}
          </div>

          <p
            className="text-[13px]"
            style={{ color: themeColors.mid }}
          >
            {pin.length === MAX_PIN_LENGTH
              ? 'PIN complete'
              : 'Enter a 6-digit PIN'}
          </p>

          {error && (
            <div
              className="mx-auto mt-4 max-w-[360px] rounded-[12px] px-4 py-3 text-[13px]"
              style={{
                color: themeColors.red,
                backgroundColor: themeColors.redBackground,
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div className="mx-auto grid w-full max-w-[380px] flex-1 grid-cols-3 content-center gap-3 px-10 py-8">
          {keypadKeys.map((key, index) => {
            if (key === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-[58px]"
                />
              )
            }

            if (key === 'delete') {
              return (
                <button
                  key="delete"
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting || pin.length === 0}
                  className="flex h-[58px] items-center justify-center rounded-[16px] transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundColor: themeColors.background,
                    color: themeColors.charcoal,
                  }}
                  aria-label="Delete last digit"
                >
                  <Delete size={22} strokeWidth={2} />
                </button>
              )
            }

            return (
              <button
                key={`number-${key}`}
                type="button"
                onClick={() => handleNumberPress(key)}
                disabled={
                  isSubmitting || pin.length >= MAX_PIN_LENGTH
                }
                className="flex h-[58px] items-center justify-center rounded-[16px] text-[22px] font-bold tracking-[-0.02em] transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.charcoal,
                }}
              >
                {key}
              </button>
            )
          })}
        </div>

        <div className="w-full px-6 pb-8">
          <Button
            type="button"
            loading={isSubmitting}
            loadingText="Setting PIN..."
            onClick={handleSetPin}
            disabled={pin.length !== MAX_PIN_LENGTH}
          >
            Set PIN
          </Button>
        </div>
      </section>
    </AuthLayout>
  )
}