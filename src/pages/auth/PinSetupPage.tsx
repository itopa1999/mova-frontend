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

// =========================================================
// TYPES
// =========================================================

type KeypadKey =
  | number
  | null
  | 'delete'

// =========================================================
// COMPONENT
// =========================================================

export default function PinSetupPage() {
  const navigate = useNavigate()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  // =======================================================
  // CHECK AUTHENTICATION
  // =======================================================

  const isEmailVerified = sessionStorage.getItem('isEmailVerified') === 'true'
  
  useEffect(() => {
    if (!isEmailVerified) {
      navigate('/dashboard')
    }
  }, [isEmailVerified, navigate])

  // =======================================================
  // STATE
  // =======================================================

  const [pin, setPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =======================================================
  // CONSTANTS
  // =======================================================

  const MAX_PIN_LENGTH = 6

  // =======================================================
  // KEYPAD
  // =======================================================

  const keypadKeys: KeypadKey[] = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    null,
    0,
    'delete',
  ]

  // =======================================================
  // ADD NUMBER TO PIN
  // =======================================================

  function handleNumberPress(
    number: number,
  ) {
    if (isSubmitting) {
      return
    }

    if (pin.length >= MAX_PIN_LENGTH) {
      return
    }

    setError(null)

    setPin(
      (currentPin) =>
        `${currentPin}${number}`,
    )
  }

  // =======================================================
  // DELETE LAST DIGIT
  // =======================================================

  function handleDelete() {
    if (isSubmitting) {
      return
    }

    if (pin.length === 0) {
      return
    }

    setError(null)

    setPin(
      (currentPin) =>
        currentPin.slice(0, -1),
    )
  }

  // =======================================================
  // SET PIN
  // =======================================================

  async function handleSetPin() {
    if (isSubmitting) {
      return
    }

    setError(null)

    // PIN must contain exactly 6 digits
    if (!/^\d{6}$/.test(pin)) {
      setError(
        'Please enter a 6-digit PIN.',
      )

      return
    }

    setIsSubmitting(true)

    try {
      const response = await setupPin({
        pin: pin,
        platform: 'web',
      })

      if (response.is_success) {
        sessionStorage.removeItem('isEmailVerified')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <AuthLayout>
      <section
        className="flex min-h-[calc(100vh-150px)] flex-col"
        style={{
          color: themeColors.charcoal,
        }}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="px-6 pt-10 text-center">
          {/* Icon */}

          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[16px]"
            style={{
              backgroundColor:
                themeColors.greenLight,
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

          {/* Step */}

          <p
            className="mb-1 text-[13px]"
            style={{
              color: themeColors.mid,
            }}
          >
            Step 2 of 3
          </p>

          {/* Heading */}

          <h1
            className="mb-2 text-[24px] font-extrabold tracking-[-0.03em]"
            style={{
              color: themeColors.charcoal,
            }}
          >
            Create your MOVA PIN
          </h1>

          {/* Description */}

          <p
            className="mx-auto mb-8 max-w-[360px] text-[14px] leading-[1.5]"
            style={{
              color: themeColors.mid,
            }}
          >
            Your PIN is an additional layer of
            protection for your account and
            transactions.
          </p>

          {/* =================================================
              PIN DOTS
          ================================================= */}

          <div className="mb-3 flex items-center justify-center gap-4">
            {Array.from({
              length: MAX_PIN_LENGTH,
            }).map((_, index) => {
              const isFilled =
                index < pin.length

              return (
                <div
                  key={index}
                  className="h-4 w-4 rounded-full transition-all duration-150"
                  style={{
                    backgroundColor:
                      isFilled
                        ? themeColors.green
                        : themeColors.border,
                    transform: isFilled
                      ? 'scale(1)'
                      : 'scale(0.9)',
                  }}
                />
              )
            })}
          </div>

          {/* PIN STATUS */}

          <p
            className="text-[13px]"
            style={{
              color: themeColors.mid,
            }}
          >
            {pin.length === MAX_PIN_LENGTH
              ? 'PIN complete'
              : 'Enter a 6-digit PIN'}
          </p>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="mx-auto mt-4 max-w-[360px] rounded-[12px] px-4 py-3 text-[13px]"
              style={{
                color: themeColors.red,
                backgroundColor:
                  themeColors.redBackground,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* ===================================================
            KEYPAD
        =================================================== */}

        <div className="mx-auto grid w-full max-w-[380px] flex-1 grid-cols-3 content-center gap-3 px-10 py-8">
          {keypadKeys.map(
            (key, index) => {
              // =================================================
              // EMPTY KEY
              // =================================================

              if (key === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="h-[58px]"
                  />
                )
              }

              // =================================================
              // DELETE KEY
              // =================================================

              if (key === 'delete') {
                return (
                  <button
                    key="delete"
                    type="button"
                    onClick={
                      handleDelete
                    }
                    disabled={
                      isSubmitting ||
                      pin.length === 0
                    }
                    className="flex h-[58px] items-center justify-center rounded-[16px] transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      backgroundColor:
                        themeColors.background,
                      color:
                        themeColors.charcoal,
                    }}
                    aria-label="Delete last digit"
                  >
                    <Delete
                      size={22}
                      strokeWidth={2}
                    />
                  </button>
                )
              }

              // =================================================
              // NUMBER KEY
              // =================================================

              return (
                <button
                  key={`number-${key}`}
                  type="button"
                  onClick={() =>
                    handleNumberPress(
                      key,
                    )
                  }
                  disabled={
                    isSubmitting ||
                    pin.length >=
                      MAX_PIN_LENGTH
                  }
                  className="flex h-[58px] items-center justify-center rounded-[16px] text-[22px] font-bold tracking-[-0.02em] transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor:
                      themeColors.background,
                    color:
                      themeColors.charcoal,
                  }}
                >
                  {key}
                </button>
              )
            },
          )}
        </div>

        {/* ===================================================
            ACTION
        =================================================== */}

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