import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Target,
  FileText,
  Tag,
  ChevronRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  LayoutGrid,
  Plus,
  Info,
  Shield,
  Lock,
  Clock,
  Landmark,
  Building2,
  Wand2,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import BottomSheet from '../../components/ui/BottomSheet'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { useWalletFees } from '../../hooks/useWalletFees'
import { colors, darkColors } from '../../styles/tokens'
import { UseUserBalance } from '../../hooks/useUserBalance'
import { verifyPin } from '../../services/app/pin'
import { PinChallengeType } from '../../types/enums/pinChallengeType'
import { formatCurrency } from '../../utils/formatting'
import {
  getWalletCategories,
  getBankAccounts,
  type WalletCategory,
  type BankAccount,
  type WalletType,
} from '../../services/app/createwallet'
import {
  getVerifiedTrustees,
  createTrusteeWallet,
  type VerifiedTrustee,
} from '../../services/app/createWalletTrustee'

/* ───────────── Constants ───────────── */

const STEPS = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Category' },
  { id: 3, label: 'Trustee' },
  { id: 4, label: 'Bank' },
  { id: 5, label: 'Amount' },
  { id: 6, label: 'Review' },
]

const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber) return ''
  if (accountNumber.length <= 6) {
    return '•'.repeat(accountNumber.length)
  }
  const first = accountNumber.slice(0, 4)
  const last = accountNumber.slice(-2)
  const middleLength = accountNumber.length - 6
  const middle = '•'.repeat(middleLength)
  return `${first}${middle}${last}`
}

/* ───────────── Route state ───────────── */

interface TemplateRouteState {
  fromTemplateId: number
  template: {
    name: string
    description: string
    categoryId: number
    categoryIcon: string
    targetAmount: number
    releaseAmount: number
    frequency: string
    frequencyConfig: string
    payoutDestination: string
    walletType?: string
  }
}

/* ───────────── Tours ───────────── */

type TourKey =
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'step6'

interface StepTour {
  title: string
  body: string
  icon: typeof Target
}

const STEP_TOURS: Record<TourKey, StepTour> = {
  step1: {
    icon: FileText,
    title: 'Wallet Details',
    body:
      'Give this wallet a clear name (e.g. "Family Fund") and a short description. Next you\'ll pick a category, a trustee, and a bank account.',
  },
  step2: {
    icon: LayoutGrid,
    title: 'Choose a Category',
    body:
      'Pick the category that best fits this wallet — Rent, Family, Education, and more. Categories help you see where your money is going and personalize your dashboard.',
  },
  step3: {
    icon: Shield,
    title: 'Choose your trustee',
    body:
      'A trustee is someone you trust who approves every release from this wallet. They\'ll get an email whenever you request a withdrawal and have 3 hours to approve or reject it.\n\n' +
      'You must have at least one verified trustee to create a trustee wallet. If you don\'t have one yet, tap "Add a trustee" to invite someone.',
  },
  step4: {
    icon: Landmark,
    title: 'Where should approved money go?',
    body:
      'Pick the bank account that should receive your money when the trustee approves a withdrawal request. Every release from this wallet will be sent to this account.\n\n' +
      'Don\'t have one saved? Tap "Add another bank account" to link a new one, then come back here.',
  },
  step5: {
    icon: Target,
    title: 'Target Amount',
    body:
      'Choose how much to set aside in this wallet. This amount is locked from your main MOVA balance and stays in the wallet until it\'s released through an approved request.\n\n' +
      'A one-time MOVA fee is added to the total cost shown below.',
  },
  step6: {
    icon: CheckCircle,
    title: 'Review & Confirm',
    body:
      'Double-check everything here — the target amount, category, trustee, bank account, and total charge. If everything looks right, tap "Create Wallet" and enter your PIN. That\'s it!',
  },
}

const STEP_TOUR_SEEN_KEYS: Record<TourKey, string> = {
  step1: 'mova_tw_step1_seen',
  step2: 'mova_tw_step2_seen',
  step3: 'mova_tw_step3_seen',
  step4: 'mova_tw_step4_seen',
  step5: 'mova_tw_step5_seen',
  step6: 'mova_tw_step6_seen',
}

/* ───────────── Component ───────────── */

export default function CreateTrusteeWallet() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const { userBalance: availableBalance } = UseUserBalance()

  const routeState = location.state as TemplateRouteState | null
  const templateState = routeState?.template ?? null
  const cameFromTemplate = templateState !== null

  const [currentStep, setCurrentStep] = useState(1)
  const [maxStepReached, setMaxStepReached] = useState(1)

  const tourSheet = useBottomSheet<TourKey>()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  )
  const [selectedTrusteeId, setSelectedTrusteeId] = useState<number | null>(
    null
  )
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    number | null
  >(null)
  const [targetAmount, setTargetAmount] = useState('')

  const [categories, setCategories] = useState<WalletCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [verifiedTrustees, setVerifiedTrustees] = useState<VerifiedTrustee[]>(
    []
  )
  const [isLoadingTrustees, setIsLoadingTrustees] = useState(false)
  const [trusteesError, setTrusteesError] = useState<string | null>(null)

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [banksError, setBanksError] = useState<string | null>(null)

  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [createdWalletId, setCreatedWalletId] = useState<number | null>(null)
  const [createdCharges, setCreatedCharges] = useState<number>(0)
  const [createdNewBalance, setCreatedNewBalance] = useState<number>(0)

  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    categoryId?: string
    trusteeId?: string
    bankAccountId?: string
    targetAmount?: string
  }>({})

  /* ─── Derived ─── */

  const hasVerifiedTrustees = verifiedTrustees.length > 0

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const selectedTrustee = verifiedTrustees.find(
    (t) => t.id === selectedTrusteeId
  )
  const selectedBank = bankAccounts.find((b) => b.id === selectedBankAccountId)

  const parsedTarget = parseInt(targetAmount || '0', 10)

  const fees = useWalletFees({
    target: parsedTarget,
    release: parsedTarget,
    destination: 'trustee',
  })

  const walletFee = fees.totalMovaCharges
  const totalCost = fees.totalUpfrontCharge
  const exceedsBalance = parsedTarget > 0 && totalCost > availableBalance

  const trusteeDisplayName = (trustee: VerifiedTrustee) =>
    trustee.name && trustee.name.trim().length > 0
      ? trustee.name
      : trustee.email.split('@')[0]

  /* ─── Template prefill ─── */

  useEffect(() => {
    if (!templateState) return

    if (templateState.walletType?.toLowerCase() === 'scheduled') {
      navigate('/dashboard/create-wallet/scheduled/', {
        replace: true,
        state: {
          fromTemplateId: routeState?.fromTemplateId,
          template: templateState,
        },
      })
      return
    }

    setName(templateState.name)
    setDescription(templateState.description)
    setSelectedCategoryId(templateState.categoryId)

    if (templateState.targetAmount > 0) {
      setTargetAmount(String(templateState.targetAmount))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ─── Reset step tracking on template change ─── */

  useEffect(() => {
    setCurrentStep(1)
    setMaxStepReached(1)
  }, [templateState])

  /* ─── Data fetching ─── */

  const fetchCategories = async (walletType?: WalletType) => {
    setIsLoadingCategories(true)
    setCategoriesError(null)

    try {
      const response = await getWalletCategories(walletType)

      if (response.is_success && response.data) {
        setCategories(response.data)
      } else {
        setCategoriesError(response.message || 'Failed to load categories.')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategoriesError('Failed to load categories. Please try again.')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const fetchVerifiedTrustees = async () => {
    setIsLoadingTrustees(true)
    setTrusteesError(null)
    try {
      const response = await getVerifiedTrustees()
      if (response.is_success && response.data) {
        setVerifiedTrustees(response.data.items)
      } else {
        setTrusteesError(response.message || 'Failed to load trustees.')
      }
    } catch {
      setTrusteesError('Failed to load trustees. Please try again.')
    } finally {
      setIsLoadingTrustees(false)
    }
  }

  const fetchBankAccounts = async () => {
    setIsLoadingBanks(true)
    setBanksError(null)
    try {
      const response = await getBankAccounts()
      if (response.is_success && response.data) {
        setBankAccounts(response.data)
      } else {
        setBanksError(response.message || 'Failed to load bank accounts.')
      }
    } catch {
      setBanksError('Failed to load bank accounts. Please try again.')
    } finally {
      setIsLoadingBanks(false)
    }
  }

  useEffect(() => {
    if (currentStep === 2 && categories.length === 0 && !isLoadingCategories) {
      fetchCategories('Trustee')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  useEffect(() => {
    if (
      currentStep === 3 &&
      verifiedTrustees.length === 0 &&
      !isLoadingTrustees
    ) {
      fetchVerifiedTrustees()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  useEffect(() => {
    if (currentStep === 4) {
      fetchBankAccounts()
    }
  }, [currentStep])

  /* ─── Tour auto-open ─── */

  const currentTourKey = `step${currentStep}` as TourKey

  useEffect(() => {
    const seenKey = STEP_TOUR_SEEN_KEYS[currentTourKey]
    const seen = localStorage.getItem(seenKey)

    if (!seen) {
      const t = setTimeout(() => {
        tourSheet.open(currentTourKey)
        localStorage.setItem(seenKey, '1')
      }, 700)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTourKey])

  /* ─── Validators ─── */

  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Wallet name is required'
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    } else if (description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters'
    } else if (description.trim().length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: typeof errors = {}
    if (!selectedCategoryId) {
      newErrors.categoryId = 'Please select a category'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: typeof errors = {}
    if (!selectedTrusteeId) {
      newErrors.trusteeId = 'Please select a trustee to continue'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep4 = (): boolean => {
    const newErrors: typeof errors = {}
    if (!selectedBankAccountId) {
      newErrors.bankAccountId =
        'Please select the bank account that should receive approved releases'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep5 = (): boolean => {
    const newErrors: typeof errors = {}

    if (!targetAmount || parsedTarget <= 0) {
      newErrors.targetAmount = 'Target amount is required'
    } else if (parsedTarget < 2000) {
      newErrors.targetAmount = 'Minimum target amount is ₦2,000'
    } else if (totalCost > availableBalance) {
      newErrors.targetAmount = `Insufficient balance. You need ${formatCurrency(
        totalCost
      )}, but your balance is ${formatCurrency(availableBalance)}.`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ─── Handlers ─── */

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setTargetAmount(numericValue)
    if (errors.targetAmount) {
      setErrors((prev) => ({ ...prev, targetAmount: undefined }))
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    if (currentStep === 3 && !validateStep3()) return
    if (currentStep === 4 && !validateStep4()) return
    if (currentStep === 5 && !validateStep5()) return

    if (currentStep < STEPS.length) {
      const next = currentStep + 1
      setCurrentStep(next)
      setMaxStepReached((prev) => Math.max(prev, next))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate(-1)
    }
  }

  const handleStepClick = (stepId: number) => {
    if (stepId > maxStepReached || stepId === currentStep) return
    setCurrentStep(stepId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenPinModal = () => {
    if (
      !name.trim() ||
      !selectedCategoryId ||
      !selectedTrusteeId ||
      !selectedBankAccountId
    ) {
      setSubmitError('Please complete all steps before creating the wallet.')
      return
    }
    if (parsedTarget < 2000) {
      setSubmitError('Please enter a valid target amount.')
      return
    }
    if (exceedsBalance) {
      setSubmitError('Your total charge exceeds your available balance.')
      return
    }
    setSubmitError(null)
    setIsPinModalOpen(true)
  }

  const verifyPinAndCreate = async (pin: string) => {
    setIsVerifyingPin(true)
    setSubmitError(null)

    try {
      const pinResponse = await verifyPin({
        pin,
        platform: 'web',
        pinChallengeType: PinChallengeType.CreateWalletTrustee,
      })

      if (!pinResponse.is_success) {
        throw new Error(
          pinResponse.message || 'Invalid PIN. Please try again.'
        )
      }

      const response = await createTrusteeWallet({
        name: name.trim(),
        description: description.trim() || undefined,
        categoryId: selectedCategoryId as number,
        targetAmount: parsedTarget,
        walletTrusteeId: selectedTrusteeId as number,
        bankAccountId: selectedBankAccountId as number,
      })

      if (!response.is_success || !response.data) {
        throw new Error(
          response.message || 'Failed to create wallet. Please try again.'
        )
      }

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: `"${name}" trustee wallet created successfully!`,
          },
        })
      )

      setIsPinModalOpen(false)
      setCreatedWalletId(response.data.walletId)
      setCreatedCharges(response.data.totalCharges)
      setCreatedNewBalance(response.data.newMainBalance)
      setShowSuccess(true)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create wallet. Please try again.'

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message },
        })
      )

      setSubmitError(message)
      throw error
    } finally {
      setIsVerifyingPin(false)
    }
  }

  const handleBrowseTemplates = () => {
    navigate('/dashboard/templates', {
      state: { walletType: 'trustee' },
    })
  }

  const currentTour = STEP_TOURS[currentTourKey]

  const StepTourButton = () => (
    <button
      type="button"
      onClick={() => tourSheet.open(currentTourKey)}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        color: themeColors.mid,
      }}
      aria-label="Explain this step"
    >
      <Info size={14} strokeWidth={2.4} />
    </button>
  )

  /* ─── Success screen ─── */

  if (showSuccess && createdWalletId !== null) {
    return (
      <AppLayout>
        <div className="flex min-h-[75vh] flex-col items-center justify-center px-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: themeColors.trusteeLight,
            }}
          >
            <Shield
              size={40}
              strokeWidth={2.4}
              style={{ color: themeColors.trustee }}
            />
          </div>

          <h2
            className="mt-5 text-center text-[22px] font-bold leading-tight"
            style={{ color: themeColors.charcoal }}
          >
            Trustee wallet created
          </h2>

          <p
            className="mt-3 max-w-[320px] text-center text-[14px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>
              "{name}"
            </span>{' '}
            is now active. Every release will need{' '}
            <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>
              {selectedTrustee
                ? trusteeDisplayName(selectedTrustee)
                : 'your trustee'}
            </span>
            's approval within a 3-hour window.
          </p>

          <div
            className="mt-6 w-full max-w-[380px] rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Target amount
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(parsedTarget)}
              </span>
            </div>

            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                MOVA charges
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(createdCharges)}
              </span>
            </div>

            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                New main balance
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(createdNewBalance)}
              </span>
            </div>

            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Trustee
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {selectedTrustee ? trusteeDisplayName(selectedTrustee) : '—'}
              </span>
            </div>

            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Releases go to
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {selectedBank ? selectedBank.bankName : '—'}
              </span>
            </div>

            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Category
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {selectedCategory?.name ?? '—'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/dashboard/trustee/wallet/${createdWalletId}`, {
                replace: true,
              })
            }
            className="mt-6 flex w-full max-w-[380px] items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.trustee,
              color: '#FFFFFF',
            }}
          >
            <CheckCircle size={18} />
            View wallet
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/wallets', { replace: true })}
            className="mt-3 text-[13px] font-medium transition-all hover:opacity-70"
            style={{ color: themeColors.mid }}
          >
            Back to wallets
          </button>
        </div>
      </AppLayout>
    )
  }

  /* ─── Main wizard ─── */

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        <div className="mb-6 flex items-center gap-3">
          <BackButton onClick={handleBack} />
          <div>
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Create Trustee Wallet
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              Every release needs a second signature
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const canJump =
                step.id <= maxStepReached &&
                step.id !== currentStep &&
                !isVerifyingPin

              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!canJump}
                  onClick={() => handleStepClick(step.id)}
                  className="flex flex-1 cursor-pointer flex-col items-center transition-all disabled:cursor-default"
                  style={{
                    opacity: step.id > maxStepReached ? 0.45 : 1,
                  }}
                  aria-label={`Go to step ${step.id}: ${step.label}`}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor:
                        isCompleted || isActive
                          ? themeColors.trustee
                          : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : '#F3F4F6',
                      color:
                        isCompleted || isActive
                          ? '#FFFFFF'
                          : themeColors.mid,
                    }}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>

                  <span
                    className="mt-1 text-center text-[9px] font-medium leading-tight"
                    style={{
                      color: isActive ? themeColors.trustee : themeColors.mid,
                    }}
                  >
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: themeColors.border }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: themeColors.trustee,
                width: `${(currentStep / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Template entry / banner */}
        {currentStep === 1 && !cameFromTemplate && (
          <button
            type="button"
            onClick={handleBrowseTemplates}
            className="mb-4 flex w-full items-center gap-3 rounded-[16px] border p-4 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
            style={{
              backgroundColor: themeColors.trusteeLight,
              borderColor: themeColors.trusteeMid,
            }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: themeColors.trustee,
                color: '#FFFFFF',
              }}
            >
              <Wand2 size={20} strokeWidth={2.2} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Use a template
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: themeColors.trustee,
                    color: '#FFFFFF',
                  }}
                >
                  Faster
                </span>
              </div>
              <p
                className="mt-0.5 text-[11px] leading-[1.5]"
                style={{ color: themeColors.mid }}
              >
                Pick a preset trustee wallet — we'll prefill what we can. You
                can still edit.
              </p>
            </div>

            <ChevronRight
              size={18}
              style={{ color: themeColors.trustee, flexShrink: 0 }}
            />
          </button>
        )}

        {cameFromTemplate && currentStep === 1 && (
          <div
            className="mb-4 flex items-start gap-3 rounded-[14px] border p-3"
            style={{
              backgroundColor: themeColors.trusteeLight,
              borderColor: themeColors.trusteeMid,
            }}
          >
            <Wand2
              size={16}
              style={{
                color: themeColors.trustee,
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: themeColors.trustee,
                    color: '#FFFFFF',
                  }}
                >
                  Trustee template
                </span>
              </div>
              <p
                className="mt-1 text-[12px] leading-[1.5]"
                style={{ color: themeColors.charcoal }}
              >
                We've prefilled this from a template. Feel free to change
                anything — nothing is locked.
              </p>
            </div>
          </div>
        )}

        <div
          className="rounded-[16px] border p-5"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          {/* ─── STEP 1 — Details ─── */}
          {currentStep === 1 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Wallet Details
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Give this wallet a name and a short description
                  </p>
                </div>
                <StepTourButton />
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Tag size={14} style={{ color: themeColors.mid }} />
                  Wallet Name
                </label>

                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.name
                      ? '#EF4444'
                      : name
                      ? themeColors.trustee
                      : themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: undefined }))
                    }}
                    placeholder="e.g. Family Fund"
                    className="w-full border-0 bg-transparent py-3 text-[14px] outline-none"
                    style={{ color: themeColors.charcoal }}
                    maxLength={50}
                  />
                </div>

                {errors.name ? (
                  <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                    {errors.name}
                  </p>
                ) : (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    {name.length}/50 characters
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <FileText size={14} style={{ color: themeColors.mid }} />
                  Description
                </label>

                <div
                  className="rounded-[12px] border px-3 py-3 transition-all"
                  style={{
                    borderColor: errors.description
                      ? '#EF4444'
                      : description
                      ? themeColors.trustee
                      : themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      if (errors.description)
                        setErrors((prev) => ({
                          ...prev,
                          description: undefined,
                        }))
                    }}
                    placeholder="e.g. Shared money for family needs"
                    rows={3}
                    className="w-full resize-none border-0 bg-transparent text-[14px] outline-none"
                    style={{ color: themeColors.charcoal }}
                    maxLength={200}
                  />
                </div>

                {errors.description ? (
                  <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                    {errors.description}
                  </p>
                ) : (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    {description.length}/200 characters
                  </p>
                )}
              </div>

              <div
                className="flex items-start gap-3 rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.trusteeLight,
                  borderColor: themeColors.trusteeMid,
                }}
              >
                <Info
                  size={16}
                  style={{
                    color: themeColors.trustee,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[12px]"
                  style={{ color: themeColors.charcoal }}
                >
                  You'll pick a category, trustee, and bank account in the next
                  steps.
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP 2 — Category ─── */}
          {currentStep === 2 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Choose a Category
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Pick the category that best fits this wallet
                  </p>
                </div>
                <StepTourButton />
              </div>

              {isLoadingCategories ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: themeColors.trustee }}
                  />
                  <p
                    className="mt-3 text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Loading categories...
                  </p>
                </div>
              ) : categoriesError ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  style={{ color: themeColors.mid }}
                >
                  <AlertCircle
                    size={32}
                    strokeWidth={1.5}
                    style={{ color: '#EF4444' }}
                  />
                  <p className="mt-3 text-[14px] font-medium">
                    {categoriesError}
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchCategories('Trustee')}
                    className="mt-3 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                    style={{
                      backgroundColor: themeColors.trustee,
                      color: '#FFFFFF',
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : categories.length > 0 ? (
                <div className="max-h-[45vh] overflow-y-auto pr-1 pb-2">
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((category) => {
                      const Icon = getIcon(category.icon)
                      const isSelected = selectedCategoryId === category.id

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(category.id)
                            if (errors.categoryId)
                              setErrors((prev) => ({
                                ...prev,
                                categoryId: undefined,
                              }))
                          }}
                          className="relative flex flex-col items-center justify-center rounded-[14px] border p-3 transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
                          style={{
                            borderColor: isSelected
                              ? themeColors.trustee
                              : themeColors.border,
                            borderWidth: isSelected ? 2 : 1,
                            backgroundColor: isSelected
                              ? themeColors.trusteeLight
                              : isDark
                              ? 'rgba(255,255,255,0.03)'
                              : '#F9FAFB',
                          }}
                        >
                          {isSelected && (
                            <div
                              className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                              style={{ backgroundColor: themeColors.trustee }}
                            >
                              <CheckCircle
                                size={12}
                                style={{ color: '#FFFFFF' }}
                              />
                            </div>
                          )}

                          <div
                            className="mb-2 flex h-10 w-10 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: isSelected
                                ? themeColors.trustee
                                : themeColors.trusteeLight,
                              color: isSelected
                                ? '#FFFFFF'
                                : themeColors.trustee,
                            }}
                          >
                            <Icon size={18} strokeWidth={2} />
                          </div>

                          <span
                            className="text-center text-[11px] font-medium leading-tight"
                            style={{
                              color: isSelected
                                ? themeColors.trustee
                                : themeColors.charcoal,
                            }}
                          >
                            {category.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  style={{ color: themeColors.mid }}
                >
                  <LayoutGrid size={32} strokeWidth={1.5} />
                  <p className="mt-3 text-[14px] font-medium">
                    No categories available
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchCategories('Trustee')}
                    className="mt-3 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                    style={{
                      backgroundColor: themeColors.trustee,
                      color: '#FFFFFF',
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {errors.categoryId && (
                <div
                  className="mt-4 flex items-center gap-2 rounded-[10px] p-2.5"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(239, 68, 68, 0.06)',
                  }}
                >
                  <AlertCircle size={16} style={{ color: '#EF4444' }} />
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: '#EF4444' }}
                  >
                    {errors.categoryId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3 — Trustee ─── */}
          {currentStep === 3 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Who should approve releases?
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Every release needs their approval within 3 hours
                  </p>
                </div>
                <StepTourButton />
              </div>

              {isLoadingTrustees ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: themeColors.trustee }}
                  />
                  <p
                    className="mt-3 text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Loading trustees...
                  </p>
                </div>
              ) : trusteesError ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  style={{ color: themeColors.mid }}
                >
                  <AlertCircle
                    size={32}
                    strokeWidth={1.5}
                    style={{ color: '#EF4444' }}
                  />
                  <p className="mt-3 text-[14px] font-medium">
                    {trusteesError}
                  </p>
                  <button
                    type="button"
                    onClick={fetchVerifiedTrustees}
                    className="mt-3 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                    style={{
                      backgroundColor: themeColors.trustee,
                      color: '#FFFFFF',
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : !hasVerifiedTrustees ? (
                <div
                  className="rounded-[14px] border border-dashed p-5 text-center"
                  style={{
                    backgroundColor: themeColors.trusteeLight,
                    borderColor: themeColors.trusteeMid,
                  }}
                >
                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: themeColors.trusteeMid,
                      color: themeColors.trustee,
                    }}
                  >
                    <Shield size={26} strokeWidth={1.8} />
                  </div>

                  <p
                    className="mt-3 text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    No verified trustee yet
                  </p>

                  <p
                    className="mt-1.5 text-[12px] leading-[1.55]"
                    style={{ color: themeColors.mid }}
                  >
                    You need at least one verified trustee before you can
                    create a trustee wallet. Invite someone you trust — they'll
                    accept via email.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/trustees')}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      backgroundColor: themeColors.trustee,
                      color: '#FFFFFF',
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    Add a trustee
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {verifiedTrustees.map((trustee) => {
                    const isSelected = selectedTrusteeId === trustee.id
                    const displayName = trusteeDisplayName(trustee)

                    return (
                      <button
                        key={trustee.id}
                        type="button"
                        onClick={() => {
                          setSelectedTrusteeId(trustee.id)
                          if (errors.trusteeId)
                            setErrors((prev) => ({
                              ...prev,
                              trusteeId: undefined,
                            }))
                        }}
                        className="flex w-full items-center gap-3 rounded-[14px] border p-3.5 text-left transition-all hover:opacity-90 active:scale-[0.985]"
                        style={{
                          borderColor: isSelected
                            ? themeColors.trustee
                            : themeColors.border,
                          borderWidth: isSelected ? 2 : 1,
                          backgroundColor: isSelected
                            ? themeColors.trusteeLight
                            : isDark
                            ? 'rgba(255,255,255,0.03)'
                            : '#F9FAFB',
                        }}
                      >
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: themeColors.trusteeLight,
                            color: themeColors.trustee,
                          }}
                        >
                          <Shield size={20} strokeWidth={2} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className="truncate text-[14px] font-semibold"
                              style={{ color: themeColors.charcoal }}
                            >
                              {displayName}
                            </p>
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: themeColors.trustee,
                                color: '#FFFFFF',
                              }}
                            >
                              Verified
                            </span>
                          </div>
                          <p
                            className="mt-0.5 truncate text-[12px]"
                            style={{ color: themeColors.mid }}
                          >
                            {trustee.email}
                          </p>
                          <p
                            className="mt-0.5 text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            {trustee.walletCount === 0
                              ? 'Not used yet'
                              : `Used in ${trustee.walletCount} ${
                                  trustee.walletCount === 1
                                    ? 'wallet'
                                    : 'wallets'
                                }`}
                          </p>
                        </div>

                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                          style={{
                            borderColor: isSelected
                              ? themeColors.trustee
                              : themeColors.border,
                            backgroundColor: isSelected
                              ? themeColors.trustee
                              : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: '#FFFFFF' }}
                            />
                          )}
                        </div>
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/trustees')}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed py-3 text-[13px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
                    style={{
                      borderColor: themeColors.trustee,
                      color: themeColors.trustee,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    Invite another trustee
                  </button>

                  <div
                    className="mt-3 flex items-start gap-2.5 rounded-[12px] border p-3"
                    style={{
                      backgroundColor: themeColors.trusteeLight,
                      borderColor: themeColors.trusteeMid,
                    }}
                  >
                    <Lock
                      size={14}
                      style={{
                        color: themeColors.trustee,
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <p
                      className="text-[11.5px] leading-[1.55]"
                      style={{ color: themeColors.mid }}
                    >
                      You can't skip this step. A trustee is required — that's
                      the whole point of this wallet. No money moves without
                      their approval.
                    </p>
                  </div>
                </div>
              )}

              {errors.trusteeId && (
                <div
                  className="mt-3 flex items-center gap-2 rounded-[10px] p-2.5"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(239, 68, 68, 0.06)',
                  }}
                >
                  <AlertCircle size={16} style={{ color: '#EF4444' }} />
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: '#EF4444' }}
                  >
                    {errors.trusteeId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 4 — Bank ─── */}
          {currentStep === 4 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Where should approved money go?
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Pick the bank account that receives your releases
                  </p>
                </div>
                <StepTourButton />
              </div>

              {isLoadingBanks ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: themeColors.trustee }}
                  />
                  <p
                    className="mt-3 text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Loading bank accounts...
                  </p>
                </div>
              ) : banksError ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  style={{ color: themeColors.mid }}
                >
                  <AlertCircle
                    size={32}
                    strokeWidth={1.5}
                    style={{ color: '#EF4444' }}
                  />
                  <p className="mt-3 text-[14px] font-medium">{banksError}</p>
                  <button
                    type="button"
                    onClick={fetchBankAccounts}
                    className="mt-3 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                    style={{
                      backgroundColor: themeColors.trustee,
                      color: '#FFFFFF',
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : bankAccounts.length > 0 ? (
                <div className="space-y-2">
                  {bankAccounts.map((bank) => {
                    const isSelected = selectedBankAccountId === bank.id

                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          setSelectedBankAccountId(bank.id)
                          if (errors.bankAccountId)
                            setErrors((prev) => ({
                              ...prev,
                              bankAccountId: undefined,
                            }))
                        }}
                        className="flex w-full items-center gap-3 rounded-[14px] border p-3.5 text-left transition-all hover:opacity-90 active:scale-[0.985]"
                        style={{
                          borderColor: isSelected
                            ? themeColors.trustee
                            : themeColors.border,
                          borderWidth: isSelected ? 2 : 1,
                          backgroundColor: isSelected
                            ? themeColors.trusteeLight
                            : isDark
                            ? 'rgba(255,255,255,0.03)'
                            : '#F9FAFB',
                        }}
                      >
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.06)'
                              : '#FFFFFF',
                            border: `1px solid ${themeColors.border}`,
                          }}
                        >
                          {bank.bankImageUrl ? (
                            <img
                              src={bank.bankImageUrl}
                              alt={bank.bankName}
                              className="h-8 w-8 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <Building2
                              size={20}
                              style={{ color: themeColors.trustee }}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[14px] font-semibold"
                            style={{ color: themeColors.charcoal }}
                          >
                            {bank.bankName}
                          </p>
                          <p
                            className="mt-0.5 truncate text-[12px]"
                            style={{ color: themeColors.mid }}
                          >
                            {bank.accountName}
                          </p>
                          <p
                            className="mt-0.5 text-[11px] font-medium tracking-wider"
                            style={{ color: themeColors.mid }}
                          >
                            {maskAccountNumber(bank.accountNumber)}
                          </p>
                        </div>

                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                          style={{
                            borderColor: isSelected
                              ? themeColors.trustee
                              : themeColors.border,
                            backgroundColor: isSelected
                              ? themeColors.trustee
                              : 'transparent',
                          }}
                        >
                          {isSelected && (
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: '#FFFFFF' }}
                            />
                          )}
                        </div>
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/bank')}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed py-3 text-[13px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
                    style={{
                      borderColor: themeColors.trustee,
                      color: themeColors.trustee,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    Add another bank account
                  </button>
                </div>
              ) : (
                <div
                  className="rounded-[14px] border border-dashed p-5 text-center"
                  style={{
                    backgroundColor: themeColors.trusteeLight,
                    borderColor: themeColors.trusteeMid,
                  }}
                >
                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: themeColors.trusteeMid,
                      color: themeColors.trustee,
                    }}
                  >
                    <Landmark size={26} strokeWidth={1.8} />
                  </div>

                  <p
                    className="mt-3 text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    No bank accounts found
                  </p>

                  <p
                    className="mt-1.5 text-[12px] leading-[1.55]"
                    style={{ color: themeColors.mid }}
                  >
                    You need at least one linked bank account for this wallet.
                    Add one to continue.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/bank')}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      backgroundColor: themeColors.trustee,
                      color: '#FFFFFF',
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    Add a bank account
                  </button>
                </div>
              )}

              <div
                className="mt-4 flex items-start gap-2.5 rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.trusteeLight,
                  borderColor: themeColors.trusteeMid,
                }}
              >
                <Info
                  size={14}
                  style={{
                    color: themeColors.trustee,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[11.5px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  When the trustee approves a release request, MOVA sends the
                  money directly to this bank account. It must be an active
                  account you own.
                </p>
              </div>

              {errors.bankAccountId && (
                <div
                  className="mt-3 flex items-center gap-2 rounded-[10px] p-2.5"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(239, 68, 68, 0.06)',
                  }}
                >
                  <AlertCircle size={16} style={{ color: '#EF4444' }} />
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: '#EF4444' }}
                  >
                    {errors.bankAccountId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 5 — Amount ─── */}
          {currentStep === 5 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Target Amount
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    How much should this wallet hold?
                  </p>
                </div>
                <StepTourButton />
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Target size={14} style={{ color: themeColors.mid }} />
                  Target Amount
                </label>

                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor:
                      errors.targetAmount || exceedsBalance
                        ? '#EF4444'
                        : targetAmount
                        ? themeColors.trustee
                        : themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <span
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.mid }}
                  >
                    ₦
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span
                    className="text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    Available balance:
                  </span>
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {formatCurrency(availableBalance)}
                  </span>
                </div>

                {parsedTarget > 0 && (
                  <div
                    className="mt-3 space-y-1.5 rounded-[12px] border p-3"
                    style={{
                      backgroundColor: exceedsBalance
                        ? isDark
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(239, 68, 68, 0.05)'
                        : themeColors.trusteeLight,
                      borderColor: exceedsBalance
                        ? 'rgba(239, 68, 68, 0.25)'
                        : themeColors.trusteeMid,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        Wallet target
                      </span>
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {formatCurrency(parsedTarget)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[11px]"
                          style={{ color: themeColors.mid }}
                        >
                          MOVA Fee
                        </span>
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(245, 158, 11, 0.1)',
                            color: '#F59E0B',
                          }}
                        >
                          One-time
                        </span>
                      </div>
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: '#F59E0B' }}
                      >
                        + {formatCurrency(walletFee)}
                      </span>
                    </div>

                    <div
                      className="h-px w-full"
                      style={{ backgroundColor: themeColors.border }}
                    />

                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        Total deducted
                      </span>
                      <span
                        className="text-[13px] font-bold"
                        style={{
                          color: exceedsBalance
                            ? '#EF4444'
                            : themeColors.trustee,
                        }}
                      >
                        {formatCurrency(totalCost)}
                      </span>
                    </div>

                    {exceedsBalance && (
                      <p
                        className="mt-1 flex items-start gap-1.5 text-[11px]"
                        style={{ color: '#EF4444' }}
                      >
                        <AlertCircle size={12} className="mt-0.5 shrink-0" />
                        <span>
                          Not enough balance. Reduce the target or add funds
                          first.
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {errors.targetAmount && (
                  <p className="mt-2 text-[11px]" style={{ color: '#EF4444' }}>
                    {errors.targetAmount}
                  </p>
                )}
              </div>

              <div
                className="flex items-start gap-3 rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.trusteeLight,
                  borderColor: themeColors.trusteeMid,
                }}
              >
                <Info
                  size={16}
                  style={{
                    color: themeColors.trustee,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  This is a{' '}
                  <strong style={{ color: themeColors.charcoal }}>
                    one-time
                  </strong>{' '}
                  charge. Every release from this wallet arrives at its full
                  amount — nothing else is deducted.
                </p>
              </div>
            </div>
          )}

          {/* ─── STEP 6 — Review ─── */}
          {currentStep === 6 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Review & Confirm
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Check everything before creating your wallet
                  </p>
                </div>
                <StepTourButton />
              </div>

              <div
                className="mb-5 overflow-hidden rounded-[20px] border p-5 text-center"
                style={{
                  backgroundColor: themeColors.trusteeLight,
                  borderColor: themeColors.trusteeMid,
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Target size={16} style={{ color: themeColors.trustee }} />
                  <p
                    className="text-[12px] font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.trustee }}
                  >
                    Target Amount
                  </p>
                </div>

                <p
                  className="mt-2 text-[38px] font-bold leading-none"
                  style={{
                    color: themeColors.charcoal,
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: '-0.03em',
                  }}
                >
                  {formatCurrency(parsedTarget)}
                </p>

                <p
                  className="mt-2 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  held in this trustee wallet
                </p>
              </div>

              <div
                className="overflow-hidden rounded-[16px] border"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.02)'
                    : '#FAFBFC',
                  borderColor: themeColors.border,
                }}
              >
                <div
                  className="flex items-start justify-between border-b px-4 py-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex items-center gap-2">
                    <Tag size={14} style={{ color: themeColors.mid }} />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Wallet Name
                    </span>
                  </div>
                  <span
                    className="ml-3 max-w-[60%] truncate text-right text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {name}
                  </span>
                </div>

                <div
                  className="flex items-start justify-between border-b px-4 py-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: themeColors.mid }} />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Description
                    </span>
                  </div>
                  <span
                    className="ml-3 max-w-[60%] text-right text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    {description}
                  </span>
                </div>

                <div
                  className="flex items-start justify-between border-b px-4 py-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid
                      size={14}
                      style={{ color: themeColors.mid }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Category
                    </span>
                  </div>
                  <span
                    className="ml-3 max-w-[60%] truncate text-right text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {selectedCategory?.name}
                  </span>
                </div>

                <div
                  className="flex items-start justify-between border-b px-4 py-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex items-center gap-2">
                    <Shield size={14} style={{ color: themeColors.trustee }} />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Trustee
                    </span>
                  </div>
                  <div className="ml-3 text-right">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {selectedTrustee
                        ? trusteeDisplayName(selectedTrustee)
                        : '—'}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      {selectedTrustee?.email ?? ''}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-start justify-between border-b px-4 py-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex items-center gap-2">
                    <Landmark
                      size={14}
                      style={{ color: themeColors.trustee }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Releases go to
                    </span>
                  </div>
                  <div className="ml-3 text-right">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {selectedBank?.bankName ?? '—'}
                    </p>
                    <p
                      className="text-[11px] tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      {selectedBank
                        ? maskAccountNumber(selectedBank.accountNumber)
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: themeColors.mid }} />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Approval window
                    </span>
                  </div>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    3 hours per request
                  </span>
                </div>
              </div>

              <div
                className="mt-4 flex items-start gap-3 rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.trusteeLight,
                  borderColor: themeColors.trusteeMid,
                }}
              >
                <Lock
                  size={16}
                  style={{
                    color: themeColors.trustee,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  No money leaves this wallet without{' '}
                  <strong style={{ color: themeColors.charcoal }}>
                    {selectedTrustee
                      ? trusteeDisplayName(selectedTrustee)
                      : 'your trustee'}
                  </strong>
                  's approval. When they approve a request, MOVA sends the
                  money to{' '}
                  <strong style={{ color: themeColors.charcoal }}>
                    {selectedBank ? selectedBank.bankName : 'your bank'}
                  </strong>
                  .
                </p>
              </div>

              {submitError && (
                <div
                  className="mt-4 rounded-[12px] p-3 text-[13px]"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(239, 68, 68, 0.08)',
                    color: '#EF4444',
                  }}
                >
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isVerifyingPin}
              className="flex-1 rounded-[12px] border px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-70 disabled:opacity-60"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.card,
                color: themeColors.charcoal,
              }}
            >
              Back
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (currentStep === 2 && isLoadingCategories) ||
                (currentStep === 3 && !hasVerifiedTrustees) ||
                (currentStep === 3 && !selectedTrusteeId) ||
                (currentStep === 3 && isLoadingTrustees) ||
                (currentStep === 4 && isLoadingBanks) ||
                (currentStep === 4 && !selectedBankAccountId)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: themeColors.trustee,
                color: '#FFFFFF',
              }}
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenPinModal}
              disabled={isVerifyingPin || exceedsBalance}
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                backgroundColor: themeColors.trustee,
                color: '#FFFFFF',
              }}
            >
              {isVerifyingPin ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Create Wallet
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description="Enter your PIN to confirm creating this trustee wallet."
        onClose={() => setIsPinModalOpen(false)}
        onVerify={verifyPinAndCreate}
        isLoading={isVerifyingPin}
        maxLength={6}
      />

      <BottomSheet
        isOpen={tourSheet.activeSheet !== null}
        onClose={tourSheet.close}
        title={currentTour.title}
        icon={<currentTour.icon size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={tourSheet.close}
            className="w-full cursor-pointer rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.trustee,
              color: '#FFFFFF',
            }}
          >
            Got it
          </button>
        }
      >
        <div style={{ color: themeColors.mid }}>
          <div className="mb-3 flex items-center justify-center">
            <div
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: themeColors.trusteeLight,
                color: themeColors.trustee,
              }}
            >
              Step {currentStep} of {STEPS.length} ·{' '}
              {STEPS[currentStep - 1].label}
            </div>
          </div>

          <div className="space-y-2 text-[13px] leading-[1.65]">
            {currentTour.body.split('\n').map((line, i) => {
              if (line.startsWith('•')) {
                const [label, ...rest] = line.slice(1).trim().split('—')
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: themeColors.trustee }}
                    />
                    <p style={{ color: themeColors.mid }}>
                      <strong style={{ color: themeColors.charcoal }}>
                        {label.trim()}
                      </strong>
                      {rest.length > 0 && ` — ${rest.join('—').trim()}`}
                    </p>
                  </div>
                )
              }
              return (
                <p key={i} style={{ color: themeColors.mid }}>
                  {line}
                </p>
              )
            })}
          </div>
        </div>
      </BottomSheet>
    </AppLayout>
  )
}