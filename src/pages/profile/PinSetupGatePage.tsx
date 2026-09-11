import {
  Delete,
  LockKeyhole,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { useTheme } from '../../hooks/useTheme'
import { setupPinGate, changePin, hasPinSetUp } from '../../services/app/pin'

// =========================================================
// TYPES
// =========================================================

type KeypadKey =
  | number
  | null
  | 'delete'

type PinStep = 'current' | 'new' | 'confirm'
type ScreenMode = 'intro' | 'keypad' | 'success'

// =========================================================
// COMPONENT
// =========================================================

export default function PinSetupGatePage() {
  const navigate = useNavigate()

  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  // =======================================================
  // STATE
  // =======================================================

  const [isChecking, setIsChecking] = useState(true)
  const [hasPinSet, setHasPinSet] = useState(false)
  const [screenMode, setScreenMode] = useState<ScreenMode>('intro')
  const [successMessage, setSuccessMessage] = useState('')
  const [step, setStep] = useState<PinStep>('new')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // =======================================================
  // CONSTANTS
  // =======================================================

  const MAX_PIN_LENGTH = 6

  // =======================================================
  // CHECK IF PIN IS ALREADY SET
  // =======================================================

  const checkPinStatus = async () => {
    try {
      const response = await hasPinSetUp()

      const pinExists =
        response.is_success && response.data?.hasPinSet === true

      setHasPinSet(pinExists)
      return pinExists
    } catch (err) {
      console.error('Error checking PIN status:', err)
      return false
    }
  }

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      await checkPinStatus()
      if (isMounted) {
        setIsChecking(false)
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  // =======================================================
  // CURRENT PIN GETTER (based on step)
  // =======================================================

  const getActivePin = (): string => {
    if (!hasPinSet) {
      if (step === 'new') return newPin
      if (step === 'confirm') return confirmPin
      return newPin
    }
    if (step === 'current') return currentPin
    if (step === 'new') return newPin
    return confirmPin
  }

  // =======================================================
  // KEYPAD
  // =======================================================

  const keypadKeys: KeypadKey[] = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    null, 0, 'delete',
  ]

  // =======================================================
  // START FLOWS
  // =======================================================

  function startSetupFlow() {
    setError(null)
    setScreenMode('keypad')
    setStep('new')
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
  }

  function startChangeFlow() {
    setError(null)
    setScreenMode('keypad')
    setStep('current')
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
  }

  function goBackToIntro() {
    setError(null)
    setScreenMode('intro')
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    setStep(hasPinSet ? 'current' : 'new')
  }

  // =======================================================
  // ADD NUMBER TO PIN
  // =======================================================

  function handleNumberPress(number: number) {
    if (isSubmitting) return

    const activePin = getActivePin()
    if (activePin.length >= MAX_PIN_LENGTH) return

    setError(null)

    if (!hasPinSet) {
      if (step === 'new') {
        setNewPin((p) => `${p}${number}`)
      } else {
        setConfirmPin((p) => `${p}${number}`)
      }
      return
    }

    if (step === 'current') {
      setCurrentPin((p) => `${p}${number}`)
    } else if (step === 'new') {
      setNewPin((p) => `${p}${number}`)
    } else {
      setConfirmPin((p) => `${p}${number}`)
    }
  }

  // =======================================================
  // DELETE LAST DIGIT
  // =======================================================

  function handleDelete() {
    if (isSubmitting) return

    const activePin = getActivePin()
    if (activePin.length === 0) return

    setError(null)

    if (!hasPinSet) {
      if (step === 'new') {
        setNewPin((p) => p.slice(0, -1))
      } else {
        setConfirmPin((p) => p.slice(0, -1))
      }
      return
    }

    if (step === 'current') {
      setCurrentPin((p) => p.slice(0, -1))
    } else if (step === 'new') {
      setNewPin((p) => p.slice(0, -1))
    } else {
      setConfirmPin((p) => p.slice(0, -1))
    }
  }

  // =======================================================
  // CONTINUE TO NEXT STEP
  // =======================================================

  function handleContinue() {
    setError(null)

    if (!hasPinSet) {
      if (step === 'new') {
        if (!/^\d{6}$/.test(newPin)) {
          setError('Please enter a 6-digit PIN.')
          return
        }
        setStep('confirm')
        return
      }

      if (step === 'confirm') {
        if (!/^\d{6}$/.test(confirmPin)) {
          setError('Please enter a 6-digit PIN.')
          return
        }
        if (newPin !== confirmPin) {
          setError('PINs do not match. Please try again.')
          setConfirmPin('')
          return
        }
        submitNewPin()
      }
      return
    }

    if (step === 'current') {
      if (!/^\d{6}$/.test(currentPin)) {
        setError('Please enter your current 6-digit PIN.')
        return
      }
      setStep('new')
      return
    }

    if (step === 'new') {
      if (!/^\d{6}$/.test(newPin)) {
        setError('Please enter a new 6-digit PIN.')
        return
      }
      if (newPin === currentPin) {
        setError('New PIN must be different from your current PIN.')
        return
      }
      setStep('confirm')
      return
    }

    if (!/^\d{6}$/.test(confirmPin)) {
      setError('Please enter a 6-digit PIN.')
      return
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match. Please try again.')
      setConfirmPin('')
      return
    }
    submitChangePin()
  }

  // =======================================================
  // SUBMIT — NEW PIN
  // =======================================================

  async function submitNewPin() {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await setupPinGate({
        pin: newPin,
        platform: 'web',
      })

      if (response.is_success) {
        sessionStorage.removeItem('isEmailVerified')

        setSuccessMessage('Your PIN has been set successfully.')
        setScreenMode('success')

        await checkPinStatus()

        setTimeout(() => {
          goBackToIntro()
        }, 1500)
      } else {
        setError(response.message || 'Failed to set PIN. Please try again.')
        resetToStep('new')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      )
      resetToStep('new')
    } finally {
      setIsSubmitting(false)
    }
  }

  // =======================================================
  // SUBMIT — CHANGE PIN
  // =======================================================

  async function submitChangePin() {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await changePin({
        currentPin,
        newPin,
        platform: 'web',
      })

      if (response.is_success) {
        setSuccessMessage('Your PIN has been changed successfully.')
        setScreenMode('success')

        setTimeout(() => {
          goBackToIntro()
        }, 1500)
      } else {
        setError(response.message || 'Failed to change PIN. Please try again.')
        if (
          response.message?.toLowerCase().includes('current') ||
          response.message?.toLowerCase().includes('incorrect')
        ) {
          resetToStep('current')
        } else {
          resetToStep('new')
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      )
      resetToStep('current')
    } finally {
      setIsSubmitting(false)
    }
  }

  // =======================================================
  // RESET HELPER
  // =======================================================

  function resetToStep(target: PinStep) {
    if (target === 'current') {
      setCurrentPin('')
    }
    if (target === 'new') {
      setNewPin('')
      setConfirmPin('')
    }
    setStep(target)
  }

  // =======================================================
  // DERIVED UI TEXT
  // =======================================================

  const activePin = getActivePin()

  const getHeading = (): string => {
    if (!hasPinSet) {
      return step === 'confirm' ? 'Confirm your PIN' : 'Create your MOVA PIN'
    }
    if (step === 'current') return 'Enter current PIN'
    if (step === 'new') return 'Create new PIN'
    return 'Confirm new PIN'
  }

  const getDescription = (): string => {
    if (!hasPinSet) {
      return step === 'confirm'
        ? 'Re-enter the 6-digit PIN you just created.'
        : 'Your PIN is an additional layer of protection for your account and transactions.'
    }
    if (step === 'current') {
      return 'Enter your existing PIN to continue.'
    }
    if (step === 'new') {
      return 'Choose a new 6-digit PIN for your account.'
    }
    return 'Re-enter your new PIN to confirm.'
  }

  const getButtonText = (): string => {
    if (isSubmitting) {
      if (hasPinSet) return 'Changing PIN...'
      return 'Setting PIN...'
    }
    if (!hasPinSet) {
      return step === 'confirm' ? 'Set PIN' : 'Continue'
    }
    if (step === 'current') return 'Continue'
    if (step === 'new') return 'Continue'
    return 'Change PIN'
  }

  const isButtonDisabled = (): boolean => {
    return activePin.length !== MAX_PIN_LENGTH || isSubmitting
  }

  // =======================================================
  // LOADING STATE (while checking PIN status)
  // =======================================================

  if (isChecking) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4"
            style={{
              borderColor: themeColors.green,
              borderTopColor: 'transparent',
            }}
          />
        </div>
      </AppLayout>
    )
  }

  // =======================================================
  // SUCCESS SCREEN
  // =======================================================

  if (screenMode === 'success') {
    return (
      <AppLayout>
        <section className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center px-6 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.greenLight }}
          >
            <CheckCircle
              size={40}
              strokeWidth={2}
              style={{ color: themeColors.green }}
            />
          </div>

          <h1
            className="mt-5 text-[22px] font-extrabold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            Success
          </h1>

          <p
            className="mt-2 max-w-[300px] text-[14px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            {successMessage}
          </p>
        </section>
      </AppLayout>
    )
  }

  // =======================================================
  // INTRO SCREEN
  // =======================================================

  if (screenMode === 'intro') {
    return (
      <AppLayout>
        <section
          className="flex min-h-[calc(100vh-150px)] flex-col px-2 py-6"
          style={{ color: themeColors.charcoal }}
        >
          {/* Back Button */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95"
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.charcoal,
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          {/* Icon */}

          <div className="flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-[20px]"
              style={{ backgroundColor: themeColors.greenLight }}
            >
              <LockKeyhole
                size={30}
                strokeWidth={2}
                style={{ color: themeColors.green }}
              />
            </div>
          </div>

          {/* Heading */}

          <h1
            className="mt-5 text-center text-[24px] font-extrabold tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            {hasPinSet ? 'Your MOVA PIN' : 'Secure your account'}
          </h1>

          <p
            className="mx-auto mt-2 max-w-[340px] text-center text-[14px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            {hasPinSet
              ? 'Your PIN protects sensitive actions like releasing funds, linking banks, and breaking wallets.'
              : 'Set a 6-digit PIN to protect your money and confirm sensitive actions.'}
          </p>

          {/* Why you need a PIN */}

          <div
            className="mt-7 rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Info size={16} style={{ color: themeColors.green }} />
              <p
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Why you need a PIN
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Protects your money',
                  desc: 'Nobody can move funds without your PIN.',
                },
                {
                  icon: KeyRound,
                  title: 'Confirms sensitive actions',
                  desc: 'Releasing, linking banks, breaking wallets.',
                },
                {
                  icon: LockKeyhole,
                  title: 'Only you know it',
                  desc: 'Never share your PIN with anyone.',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                      style={{
                        backgroundColor: themeColors.greenLight,
                        color: themeColors.green,
                      }}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div>
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="text-[12px] leading-[1.4]"
                        style={{ color: themeColors.mid }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}

          <div className="mt-auto space-y-3 pt-8">
            {hasPinSet ? (
              <>
                <Button
                  type="button"
                  onClick={startChangeFlow}
                >
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} strokeWidth={2} />
                    Change PIN
                  </span>
                </Button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full cursor-pointer rounded-[14px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-70"
                  style={{ color: themeColors.mid }}
                >
                  Maybe later
                </button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={startSetupFlow}
                >
                  <span className="flex items-center justify-center gap-2">
                    Set up PIN
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </span>
                </Button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full cursor-pointer rounded-[14px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-70"
                  style={{ color: themeColors.mid }}
                >
                  Maybe later
                </button>
              </>
            )}
          </div>
        </section>
      </AppLayout>
    )
  }

  // =======================================================
  // KEYPAD SCREEN
  // =======================================================

  return (
    <AppLayout>
      <section
        className="flex min-h-[calc(100vh-150px)] flex-col"
        style={{ color: themeColors.charcoal }}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="px-2 pt-6 text-center">
          {/* Back to intro */}

          <button
            type="button"
            onClick={goBackToIntro}
            className="mx-auto mb-4 block cursor-pointer text-[12px] font-semibold transition-all hover:opacity-70"
            style={{ color: themeColors.mid }}
          >
            ← Back
          </button>

          {/* Icon */}

          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[16px]"
            style={{ backgroundColor: themeColors.greenLight }}
          >
            <LockKeyhole
              size={26}
              strokeWidth={2}
              style={{ color: themeColors.green }}
            />
          </div>

          {/* Heading */}

          <h1
            className="mb-2 text-[24px] font-extrabold tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            {getHeading()}
          </h1>

          {/* Description */}

          <p
            className="mx-auto mb-8 max-w-[360px] text-[14px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            {getDescription()}
          </p>

          {/* =================================================
              STEP INDICATOR
          ================================================= */}

          {hasPinSet && (
            <div className="mb-6 flex items-center justify-center gap-2">
              {(['current', 'new', 'confirm'] as PinStep[]).map(
                (s, idx) => {
                  const isActive = step === s
                  const isDone =
                    (['current', 'new', 'confirm'] as PinStep[]).indexOf(
                      step,
                    ) > idx

                  return (
                    <div
                      key={s}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? '28px' : '12px',
                        backgroundColor:
                          isActive || isDone
                            ? themeColors.green
                            : themeColors.border,
                      }}
                    />
                  )
                },
              )}
            </div>
          )}

          {/* =================================================
              PIN DOTS
          ================================================= */}

          <div className="mb-3 flex items-center justify-center gap-4">
            {Array.from({ length: MAX_PIN_LENGTH }).map((_, index) => {
              const isFilled = index < activePin.length

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

          {/* PIN STATUS */}

          <p className="text-[13px]" style={{ color: themeColors.mid }}>
            {activePin.length === MAX_PIN_LENGTH
              ? 'PIN complete'
              : 'Enter a 6-digit PIN'}
          </p>

          {/* ERROR */}

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

        {/* ===================================================
            KEYPAD
        =================================================== */}

        <div className="mx-auto grid w-full max-w-[380px] flex-1 grid-cols-3 content-center gap-3 px-10 py-8">
          {keypadKeys.map((key, index) => {
            if (key === null) {
              return <div key={`empty-${index}`} className="h-[58px]" />
            }

            if (key === 'delete') {
              return (
                <button
                  key="delete"
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting || activePin.length === 0}
                  className="flex h-[58px] cursor-pointer items-center justify-center rounded-[16px] transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
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
                  isSubmitting || activePin.length >= MAX_PIN_LENGTH
                }
                className="flex h-[58px] cursor-pointer items-center justify-center rounded-[16px] text-[22px] font-bold tracking-[-0.02em] transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* ===================================================
            ACTION
        =================================================== */}

        <div className="w-full px-2 pb-8">
          <Button
            type="button"
            loading={isSubmitting}
            loadingText={getButtonText()}
            onClick={handleContinue}
            disabled={isButtonDisabled()}
          >
            {getButtonText()}
          </Button>
        </div>
      </section>
    </AppLayout>
  )
}