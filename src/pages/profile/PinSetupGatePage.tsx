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
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'

import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import {
  setupPinGate,
  changePin,
  hasPinSetUp,
  sendForgotPinOtp,
  verifyForgotPinOtp,
} from '../../services/app/pin'

type KeypadKey =
  | number
  | null
  | 'delete'

type PinStep = 'current' | 'new' | 'confirm'
type ScreenMode = 'intro' | 'keypad' | 'success' | 'forgot-otp' | 'forgot-new'

const TOUR_SEEN_KEY = 'mova_pin_intro_seen'

export default function PinSetupGatePage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  // Pin intro tour
  const infoSheet = useBottomSheet<'intro'>()

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

  // Forgot PIN flow
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  const MAX_PIN_LENGTH = 6
  const MAX_OTP_LENGTH = 6

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
      if (isMounted) setIsChecking(false)
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  // Auto-open PIN explanation on first visit
  useEffect(() => {
    if (isChecking) return
    const seen = localStorage.getItem(TOUR_SEEN_KEY)
    if (!seen) {
      const t = setTimeout(() => {
        infoSheet.open('intro')
        localStorage.setItem(TOUR_SEEN_KEY, '1')
      }, 700)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking])

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

  const keypadKeys: KeypadKey[] = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    null, 0, 'delete',
  ]

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
    setOtp('')
    setPassword('')
    setStep(hasPinSet ? 'current' : 'new')
  }

  // ─── Forgot PIN flow ─────────────────────────────
  function openForgotModal() {
    setError(null)
    setShowForgotModal(true)
  }

  function closeForgotModal() {
    if (isSendingOtp) return
    setShowForgotModal(false)
  }

  async function handleSendForgotOtp() {
    setIsSendingOtp(true)
    setError(null)

    try {
      const response = await sendForgotPinOtp({ platform: 'web' })

      if (!response.is_success) {
        throw new Error(
          response.message || 'Failed to send OTP. Please try again.'
        )
      }

      setShowForgotModal(false)
      setOtp('')
      setPassword('')
      setScreenMode('forgot-otp')

      const successEvent = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'A verification code has been sent to your email and phone.',
        },
      })
      window.dispatchEvent(successEvent)
    } catch (err) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            err instanceof Error
              ? err.message
              : 'Failed to send OTP. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)
    } finally {
      setIsSendingOtp(false)
    }
  }

  async function handleVerifyForgotOtp() {
    if (isVerifyingOtp) return

    if (!password) {
      setError('Please enter your account password.')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit code.')
      return
    }

    setIsVerifyingOtp(true)
    setError(null)

    try {
      const response = await verifyForgotPinOtp({
        password,
        otp,
        platform: 'web',
      })

      if (!response.is_success) {
        throw new Error(
          response.message || 'Invalid details. Please try again.'
        )
      }

      setOtp('')
      setPassword('')
      setNewPin('')
      setConfirmPin('')
      setStep('new')
      setScreenMode('keypad')

      const successEvent = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Verified. You can now set a new PIN.',
        },
      })
      window.dispatchEvent(successEvent)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid details. Please try again.'
      )
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  // ─── Keypad handlers ─────────────────────────────
  function handleNumberPress(number: number) {
    if (isSubmitting) return
    const activePin = getActivePin()
    if (activePin.length >= MAX_PIN_LENGTH) return

    setError(null)

    if (!hasPinSet) {
      if (step === 'new') setNewPin((p) => `${p}${number}`)
      else setConfirmPin((p) => `${p}${number}`)
      return
    }

    if (step === 'current') setCurrentPin((p) => `${p}${number}`)
    else if (step === 'new') setNewPin((p) => `${p}${number}`)
    else setConfirmPin((p) => `${p}${number}`)
  }

  function handleDelete() {
    if (isSubmitting) return
    const activePin = getActivePin()
    if (activePin.length === 0) return
    setError(null)

    if (!hasPinSet) {
      if (step === 'new') setNewPin((p) => p.slice(0, -1))
      else setConfirmPin((p) => p.slice(0, -1))
      return
    }

    if (step === 'current') setCurrentPin((p) => p.slice(0, -1))
    else if (step === 'new') setNewPin((p) => p.slice(0, -1))
    else setConfirmPin((p) => p.slice(0, -1))
  }

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
        // 👇 No auto-redirect — user clicks "Okay" on the success screen
      } else {
        setError(response.message || 'Failed to set PIN. Please try again.')
        resetToStep('new')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
      resetToStep('new')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        // 👇 No auto-redirect — user clicks "Okay" on the success screen
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
          : 'Something went wrong. Please try again.'
      )
      resetToStep('current')
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetToStep(target: PinStep) {
    if (target === 'current') setCurrentPin('')
    if (target === 'new') {
      setNewPin('')
      setConfirmPin('')
    }
    setStep(target)
  }

  // ─── Success → refresh the whole page ────────────
  function handleSuccessContinue() {
    window.location.reload()
  }

  const activePin = getActivePin()

  const getHeading = (): string => {
    if (screenMode === 'forgot-new') {
      return step === 'confirm' ? 'Confirm your new PIN' : 'Create a new PIN'
    }
    if (screenMode === 'forgot-otp') {
      return 'Verify your identity'
    }
    if (!hasPinSet) {
      return step === 'confirm' ? 'Confirm your PIN' : 'Create your MOVA PIN'
    }
    if (step === 'current') return 'Enter current PIN'
    if (step === 'new') return 'Create new PIN'
    return 'Confirm new PIN'
  }

  const getDescription = (): string => {
    if (screenMode === 'forgot-otp') {
      return 'Enter your account password and the 6-digit code we sent to your email and phone.'
    }
    if (screenMode === 'forgot-new') {
      return step === 'confirm'
        ? 'Re-enter the 6-digit PIN you just created.'
        : 'Choose a new 6-digit PIN for your account.'
    }
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
    if (screenMode === 'forgot-otp') {
      return isVerifyingOtp ? 'Verifying...' : 'Verify & Continue'
    }
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
    if (screenMode === 'forgot-otp') {
      return (
        otp.length !== MAX_OTP_LENGTH ||
        password.length === 0 ||
        isVerifyingOtp
      )
    }
    return activePin.length !== MAX_PIN_LENGTH || isSubmitting
  }

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

  // ─── Success screen ──────────────────────────────
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

          {/* Okay → refresh the page */}
          <div className="mt-8 w-full max-w-[380px]">
            <Button type="button" onClick={handleSuccessContinue}>
              Okay
            </Button>
          </div>
        </section>
      </AppLayout>
    )
  }

  // ─── Intro screen ────────────────────────────────
  if (screenMode === 'intro') {
    return (
      <AppLayout>
        <section
          className="flex min-h-[calc(100vh-150px)] flex-col px-2 py-6"
          style={{ color: themeColors.charcoal }}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95"
              style={{
                backgroundColor: themeColors.background,
                color: themeColors.charcoal,
              }}
              aria-label="Go back"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>

            {/* ⓘ — replay the PIN explanation anytime */}
            <button
              type="button"
              onClick={() => infoSheet.open('intro')}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.04)',
                color: themeColors.mid,
              }}
              aria-label="What is a PIN?"
            >
              <Info size={14} strokeWidth={2.4} />
            </button>
          </div>

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

          <div className="mt-auto space-y-3 pt-8">
            {hasPinSet ? (
              <>
                <Button type="button" onClick={startChangeFlow}>
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} strokeWidth={2} />
                    Change PIN
                  </span>
                </Button>

                <button
                  type="button"
                  onClick={openForgotModal}
                  className="w-full cursor-pointer rounded-[14px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-70"
                  style={{ color: themeColors.green }}
                >
                  Forgot PIN?
                </button>

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
                <Button type="button" onClick={startSetupFlow}>
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

        {/* ───────── PIN Explanation BottomSheet ───────── */}
        <BottomSheet
          isOpen={infoSheet.activeSheet !== null}
          onClose={infoSheet.close}
          title="Your MOVA PIN"
          icon={<LockKeyhole size={16} strokeWidth={2.4} />}
          footer={
            <button
              type="button"
              onClick={infoSheet.close}
              className="w-full cursor-pointer rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              Got it
            </button>
          }
        >
          <div style={{ color: themeColors.mid }}>
            <p className="text-[13px] leading-[1.65]">
              A PIN is a <strong>6-digit code</strong> that only you know.
              It's your extra layer of security on top of your login
              password — a second lock on your money.
            </p>

            <div className="mt-4 space-y-3">
              {/* Reason 1 */}
              <div className="flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.15)'
                      : 'rgba(15, 185, 110, 0.08)',
                    color: themeColors.green,
                  }}
                >
                  <ShieldCheck size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Protects every sensitive action
                  </p>
                  <p className="mt-0.5 text-[12px] leading-[1.55]">
                    Releasing funds, linking a bank account, changing your
                    PIN — anything important requires your PIN.
                  </p>
                </div>
              </div>

              {/* Reason 2 */}
              <div className="flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.15)'
                      : 'rgba(15, 185, 110, 0.08)',
                    color: themeColors.green,
                  }}
                >
                  <KeyRound size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Confirms you're really you
                  </p>
                  <p className="mt-0.5 text-[12px] leading-[1.55]">
                    Even if someone gets your password, they still can't move
                    your money without the PIN.
                  </p>
                </div>
              </div>

              {/* Reason 3 */}
              <div className="flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.15)'
                      : 'rgba(15, 185, 110, 0.08)',
                    color: themeColors.green,
                  }}
                >
                  <LockKeyhole size={15} strokeWidth={2.2} />
                </div>
                <div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Never share it with anyone
                  </p>
                  <p className="mt-0.5 text-[12px] leading-[1.55]">
                    Not even MOVA staff will ever ask for your PIN. Keep it
                    private — always.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[12px] leading-[1.55] italic">
              You can change your PIN anytime from Profile → PIN. If you
              ever forget it, use <strong>Forgot PIN?</strong> on the intro
              screen to reset it with a code sent to your email and phone.
            </p>
          </div>
        </BottomSheet>

        {/* Forgot PIN Confirmation Modal */}
        {showForgotModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={closeForgotModal}
          >
            <div
              className="w-full max-w-[380px] rounded-[20px] p-6"
              style={{
                backgroundColor: themeColors.card,
                border: `1px solid ${themeColors.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.15)'
                      : 'rgba(15, 185, 110, 0.08)',
                    color: themeColors.green,
                  }}
                >
                  <Mail size={26} strokeWidth={2} />
                </div>
              </div>

              <h2
                className="mt-4 text-center text-[18px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Reset your PIN?
              </h2>

              <p
                className="mt-2 text-center text-[13px] leading-relaxed"
                style={{ color: themeColors.mid }}
              >
                We'll send a 6-digit verification code to your registered
                email and phone number. You'll also need your account password.
              </p>

              <div
                className="mt-4 rounded-[12px] p-3"
                style={{ backgroundColor: themeColors.background }}
              >
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: themeColors.green }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.charcoal }}
                    >
                      A code will be sent to your email and phone
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: themeColors.green }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.charcoal }}
                    >
                      The code expires in 2 minutes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: themeColors.green }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.charcoal }}
                    >
                      You'll need your account password too
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSendForgotOtp}
                  disabled={isSendingOtp}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border-none px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: themeColors.green,
                    color: '#FFFFFF',
                  }}
                >
                  {isSendingOtp ? (
                    <>
                      <div
                        className="h-4 w-4 animate-spin rounded-full border-2"
                        style={{
                          borderColor: '#FFFFFF',
                          borderTopColor: 'transparent',
                        }}
                      />
                      Sending code...
                    </>
                  ) : (
                    'Send Code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeForgotModal}
                  disabled={isSendingOtp}
                  className="w-full cursor-pointer rounded-[14px] border px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: themeColors.border,
                    color: themeColors.charcoal,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    )
  }

  // ─── Forgot OTP screen ───────────────────────────
  if (screenMode === 'forgot-otp') {
    return (
      <AppLayout>
        <section
          className="flex min-h-[calc(100vh-150px)] flex-col px-2 py-6"
          style={{ color: themeColors.charcoal }}
        >
          <button
            type="button"
            onClick={goBackToIntro}
            className="mb-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-95"
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.charcoal,
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>

          <div className="flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-[20px]"
              style={{ backgroundColor: themeColors.greenLight }}
            >
              <Mail
                size={30}
                strokeWidth={2}
                style={{ color: themeColors.green }}
              />
            </div>
          </div>

          <h1
            className="mt-5 text-center text-[24px] font-extrabold tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            {getHeading()}
          </h1>

          <p
            className="mx-auto mt-2 max-w-[340px] text-center text-[14px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            {getDescription()}
          </p>

          <div className="mx-auto mt-8 w-full max-w-[380px] text-left">
            <div className="mb-4">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                Account password
              </label>

              <div
                className="flex items-center rounded-[12px] border px-3 transition-all"
                style={{
                  borderColor: error
                    ? themeColors.red
                    : password
                      ? themeColors.green
                      : themeColors.border,
                  backgroundColor: themeColors.card,
                }}
              >
                <LockKeyhole size={16} style={{ color: themeColors.mid }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  placeholder="Enter your account password"
                  className="w-full border-0 bg-transparent py-3 pl-2 text-[14px] outline-none"
                  style={{ color: themeColors.charcoal }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="cursor-pointer rounded-full p-1 transition-all hover:opacity-70"
                  style={{ color: themeColors.mid }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label
                className="mb-1.5 block text-[13px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                Verification code
              </label>

              <div
                className="flex items-center rounded-[12px] border px-3 transition-all"
                style={{
                  borderColor: error
                    ? themeColors.red
                    : otp.length === MAX_OTP_LENGTH
                      ? themeColors.green
                      : themeColors.border,
                  backgroundColor: themeColors.card,
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={MAX_OTP_LENGTH}
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setOtp(value)
                    setError(null)
                  }}
                  placeholder="000000"
                  className="w-full border-0 bg-transparent py-3 text-center text-[20px] font-bold tracking-[0.4em] outline-none"
                  style={{ color: themeColors.charcoal }}
                  autoFocus
                />
              </div>
            </div>
          </div>

          {error && (
            <div
              className="mx-auto mt-2 max-w-[380px] rounded-[12px] px-4 py-3 text-center text-[13px]"
              style={{
                color: themeColors.red,
                backgroundColor: themeColors.redBackground,
              }}
            >
              {error}
            </div>
          )}

          <div className="mt-auto w-full px-2 pt-8">
            <Button
              type="button"
              loading={isVerifyingOtp}
              loadingText="Verifying..."
              onClick={handleVerifyForgotOtp}
              disabled={isButtonDisabled()}
            >
              {getButtonText()}
            </Button>
          </div>
        </section>
      </AppLayout>
    )
  }

  // ─── Keypad screen ───────────────────────────────
  return (
    <AppLayout>
      <section
        className="flex min-h-[calc(100vh-150px)] flex-col"
        style={{ color: themeColors.charcoal }}
      >
        <div className="px-2 pt-6 text-center">
          <button
            type="button"
            onClick={goBackToIntro}
            className="mx-auto mb-4 block cursor-pointer text-[12px] font-semibold transition-all hover:opacity-70"
            style={{ color: themeColors.mid }}
          >
            ← Back
          </button>

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

          <h1
            className="mb-2 text-[24px] font-extrabold tracking-[-0.03em]"
            style={{ color: themeColors.charcoal }}
          >
            {getHeading()}
          </h1>

          <p
            className="mx-auto mb-8 max-w-[360px] text-[14px] leading-[1.5]"
            style={{ color: themeColors.mid }}
          >
            {getDescription()}
          </p>

          {hasPinSet && screenMode !== 'forgot-new' && (
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

          <p className="text-[13px]" style={{ color: themeColors.mid }}>
            {activePin.length === MAX_PIN_LENGTH
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