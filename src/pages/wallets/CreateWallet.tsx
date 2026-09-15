// src/pages/app/CreateWallet.tsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Target,
  FileText,
  Tag,
  ChevronRight,
  Info,
  CheckCircle,
  Loader2,
  AlertCircle,
  LayoutGrid,
  Building2,
  Plus,
  Calendar,
  CalendarDays,
  Repeat,
  Zap,
  Eye,
  XCircle,
  List,
  ChevronDown,
  ChevronUp,
  Landmark,
  Clock,
  ArrowRight,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import {
  getWalletCategories,
  createWallet,
} from '../../services/app/createwallet'
import type {
  WalletCategory,
  CreateWalletRequest,
} from '../../services/app/createwallet'
import { getBankAccounts } from '../../services/app/bank'
import type { SavedBank } from '../../services/app/bank'
import { getSchedulePreview } from '../../services/app/preview'
import type {
  PreviewData,
  PreviewRequest,
} from '../../services/app/preview'
import UseScheduleCalendar from '../../components/ui/useScheduleCalendar'
import PinModal from '../../components/ui/PinModal'
import { verifyPin } from '../../services/app/pin'

const STEPS = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Category' },
  { id: 3, label: 'Bank' },
  { id: 4, label: 'Schedule' },
  { id: 5, label: 'Review' },
]

const FREQUENCY_TYPES = [
  { value: 'once', label: 'Once', icon: Calendar },
  { value: 'hourly', label: 'Hourly', icon: Clock },
  { value: 'daily', label: 'Daily', icon: Repeat },
  { value: 'weekly', label: 'Weekly', icon: CalendarDays },
  { value: 'monthly', label: 'Monthly', icon: Calendar },
  { value: 'quarterly', label: 'Quarterly', icon: Calendar },
  { value: 'yearly', label: 'Yearly', icon: Calendar },
  { value: 'custom', label: 'Custom', icon: Zap },
]

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
]

const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
]

// ─── Per-step tours ────────────────────────────────────
type TourKey = 'step1' | 'step2' | 'step3' | 'step4' | 'step5'

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
      'Give your wallet a clear name (e.g. "Rent Savings") and a short description. Then set the total target amount you want to protect inside this wallet. This is the pool of money that will be released on your schedule.',
  },
  step2: {
    icon: LayoutGrid,
    title: 'Choose a Category',
    body:
      'Pick the category that best fits this wallet — Food, Transport, Rent, Health, and more. Categories help you see where your money is going and personalize your dashboard.',
  },
  step3: {
    icon: Building2,
    title: 'Link a Bank Account',
    body:
      'Choose the bank account where you want the released money to land. Every release will be sent to this account on the day it becomes available.',
  },
  step4: {
    icon: Zap,
    title: 'Set the Schedule',
    body:
      'Choose how often money should be released — once, daily, weekly, monthly, or on a custom rhythm. Tap any schedule type to see exactly how it works. Use the Preview button to see the full timeline before moving on.',
  },
  step5: {
    icon: CheckCircle,
    title: 'Review & Confirm',
    body:
      'Double-check everything here — the target amount, category, bank, schedule, and start date. If everything looks right, tap "Create Wallet" and enter your PIN. That\'s it!',
  },
}

const STEP_TOUR_SEEN_KEYS: Record<TourKey, string> = {
  step1: 'mova_cw_step1_seen',
  step2: 'mova_cw_step2_seen',
  step3: 'mova_cw_step3_seen',
  step4: 'mova_cw_step4_seen',
  step5: 'mova_cw_step5_seen',
}

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

const getCurrentDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getCurrentTime = (): string => {
  const now = new Date()
  now.setHours(now.getHours() + 2)
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

interface FrequencyConfig {
  type: string
  onceDate?: string
  daysOfWeek?: number[]
  datesOfMonth?: number[]
  isLastDayOfMonth?: boolean
  months?: number[]
  daysOfMonth?: number[]
  intervalDays?: number
  intervalHours?: number
  time: string
}

export default function CreateWallet() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const [currentStep, setCurrentStep] = useState(1)

  // Step tours
  const stepSheet = useBottomSheet<TourKey>()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')

  const [categories, setCategories] = useState<WalletCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] =
    useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | null
  >(null)

  const [bankAccounts, setBankAccounts] = useState<SavedBank[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    number | null
  >(null)

  const [releaseAmount, setReleaseAmount] = useState('')
  const [frequencyType, setFrequencyType] = useState<string>('once')
  const [startDate, setStartDate] = useState<string>(getCurrentDate())
  const [time, setTime] = useState<string>(getCurrentTime())
  const [onceDate, setOnceDate] = useState<string>(getCurrentDate())
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedDates, setSelectedDates] = useState<number[]>([])
  const [isLastDayOfMonth, setIsLastDayOfMonth] =
    useState<boolean>(false)
  const [selectedMonths, setSelectedMonths] = useState<number[]>([])
  const [intervalDays, setIntervalDays] = useState<number>(3)
  const [intervalHours, setIntervalHours] = useState<number>(1)

  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(
    null
  )
  const [hasPreviewed, setHasPreviewed] = useState(false)
  const [scheduleView, setScheduleView] = useState<
    'list' | 'calendar'
  >('list')
  const [showAllReleases, setShowAllReleases] = useState(false)

  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    targetAmount?: string
    categoryId?: string
    bankAccountId?: string
    releaseAmount?: string
  }>({})

  useEffect(() => {
    if (currentStep === 2 && categories.length === 0) {
      fetchCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  useEffect(() => {
    if (currentStep === 3 && bankAccounts.length === 0) {
      fetchBankAccounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // Auto-open the tour for the current step (once per step)
  useEffect(() => {
    const tourKey = `step${currentStep}` as TourKey
    const seenKey = STEP_TOUR_SEEN_KEYS[tourKey]
    const seen = localStorage.getItem(seenKey)

    if (!seen) {
      const t = setTimeout(() => {
        stepSheet.open(tourKey)
        localStorage.setItem(seenKey, '1')
      }, 700)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await getWalletCategories()
      if (response.is_success && response.data) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const fetchBankAccounts = async () => {
    setIsLoadingBanks(true)
    try {
      const response = await getBankAccounts()
      if (response.is_success && response.data) {
        setBankAccounts(response.data)
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
    } finally {
      setIsLoadingBanks(false)
    }
  }

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setTargetAmount(numericValue)
    if (errors.targetAmount) {
      setErrors((prev) => ({ ...prev, targetAmount: undefined }))
    }
  }

  const handleReleaseAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setReleaseAmount(numericValue)
    if (errors.releaseAmount) {
      setErrors((prev) => ({ ...prev, releaseAmount: undefined }))
    }
  }

  const formatAmount = (value: string) => {
    if (!value) return '0'
    return parseInt(value).toLocaleString()
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateWithTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFrequencyLabel = (type: string): string => {
    const found = FREQUENCY_TYPES.find((f) => f.value === type)
    return found?.label || 'Unknown'
  }

  const selectedCategory = categories.find(
    (c) => c.id === selectedCategoryId
  )

  const selectedBank = bankAccounts.find(
    (b) => b.id === selectedBankAccountId
  )

  const getFrequencyDescription = (): string => {
    switch (frequencyType) {
      case 'once':
        return `Once on ${formatDate(onceDate)}`
      case 'hourly':
        return intervalHours === 1
          ? 'Every hour'
          : `Every ${intervalHours} hours`
      case 'daily':
        if (selectedDays.length === 0) return 'Daily'
        if (selectedDays.length === 7) return 'Every day'
        return `Daily on ${selectedDays
          .map((d) => DAYS_OF_WEEK.find((x) => x.value === d)?.label)
          .join(', ')}`
      case 'weekly':
        return `Weekly on ${selectedDays
          .map((d) => DAYS_OF_WEEK.find((x) => x.value === d)?.label)
          .join(', ')}`
      case 'monthly':
        return `Monthly on ${selectedDates.join(', ')}${
          isLastDayOfMonth ? ' and last day' : ''
        }`
      case 'quarterly':
        return `Quarterly in ${selectedMonths
          .map((m) => MONTHS.find((x) => x.value === m)?.label)
          .join(', ')} on ${selectedDates.join(', ')}`
      case 'yearly':
        return `Yearly in ${selectedMonths
          .map((m) => MONTHS.find((x) => x.value === m)?.label)
          .join(', ')} on ${selectedDates.join(', ')}`
      case 'custom':
        return `Every ${intervalDays} days`
      default:
        return ''
    }
  }

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    )
  }

  const toggleDate = (date: number) => {
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date]
    )
  }

  const toggleMonth = (month: number) => {
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month]
    )
  }

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
      newErrors.description =
        'Description must be at least 5 characters'
    } else if (description.trim().length > 200) {
      newErrors.description =
        'Description must be less than 200 characters'
    }

    if (!targetAmount || parseInt(targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount is required'
    } else if (parseInt(targetAmount) < 2000) {
      newErrors.targetAmount = 'Minimum target amount is ₦2,000'
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
    if (!selectedBankAccountId) {
      newErrors.bankAccountId = 'Please select a bank account'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep4 = (): boolean => {
    const newErrors: typeof errors = {}

    if (!releaseAmount || parseInt(releaseAmount) <= 0) {
      newErrors.releaseAmount = 'Release amount is required'
    } else if (parseInt(releaseAmount) < 1000) {
      newErrors.releaseAmount = 'Minimum release amount is ₦1,000'
    } else if (
      parseInt(releaseAmount) > parseInt(targetAmount || '0')
    ) {
      newErrors.releaseAmount =
        'Release amount cannot exceed target amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildFrequencyConfig = (): FrequencyConfig => {
    const config: FrequencyConfig = {
      type: frequencyType,
      time,
    }

    switch (frequencyType) {
      case 'once':
        config.onceDate = `${onceDate}T00:00:00`
        break
      case 'hourly':
        config.intervalHours = intervalHours
        break
      case 'daily':
      case 'weekly':
        config.daysOfWeek = selectedDays
        break
      case 'monthly':
        config.datesOfMonth = selectedDates
        config.isLastDayOfMonth = isLastDayOfMonth
        break
      case 'quarterly':
      case 'yearly':
        config.months = selectedMonths
        config.daysOfMonth = selectedDates
        break
      case 'custom':
        config.intervalDays = intervalDays
        break
    }

    return config
  }

  const handlePreviewSchedule = async () => {
    if (!validateStep4()) return

    setIsPreviewing(true)
    setPreviewError(null)
    setHasPreviewed(true)

    const frequencyConfig = buildFrequencyConfig()
    const formattedStartDate = `${startDate}T${time}:00+01:00`

    const payload: PreviewRequest = {
      targetAmount: parseInt(targetAmount),
      releaseAmount: parseInt(releaseAmount),
      frequencyType,
      frequencyConfig: JSON.stringify(frequencyConfig),
      startDate: formattedStartDate,
      maxReleases: 50,
    }

    try {
      const result = await getSchedulePreview(payload)

      if (result.is_success && result.data) {
        setPreview(result.data)
        setScheduleView('list')
      } else {
        if (
          result.data &&
          result.data.errors &&
          result.data.errors.length > 0
        ) {
          setPreview(result.data)
          setScheduleView('list')
        } else {
          setPreviewError(
            result.message || 'Failed to generate preview'
          )
        }
      }
    } catch {
      setPreviewError(
        'An unexpected error occurred. Please try again.'
      )
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleOpenPinModal = () => {
    if (!name.trim() || !selectedCategoryId || !selectedBankAccountId) {
      setSubmitError(
        'Please complete all steps before creating the wallet.'
      )
      return
    }
    if (!releaseAmount || parseInt(releaseAmount) < 1000) {
      setSubmitError('Please enter a valid release amount.')
      return
    }
    setSubmitError(null)
    setIsPinModalOpen(true)
  }

  const verifyPinAndCreateWallet = async (pin: string) => {
    setIsVerifyingPin(true)
    setSubmitError(null)

    try {
      const pinResponse = await verifyPin({ pin, platform: 'web' })

      if (!pinResponse.is_success) {
        throw new Error(
          pinResponse.message || 'Invalid PIN. Please try again.'
        )
      }

      const frequencyConfig = buildFrequencyConfig()
      const formattedStartDate = `${startDate}T${time}:00+01:00`

      const payload: CreateWalletRequest = {
        name: name.trim(),
        description: description.trim(),
        categoryId: selectedCategoryId || 0,
        bankAccountId: selectedBankAccountId || 0,
        targetAmount: parseInt(targetAmount),
        frequency: frequencyType,
        frequencyConfig: JSON.stringify(frequencyConfig),
        amountToBeReleased: parseInt(releaseAmount),
        startDate: formattedStartDate,
      }

      const result = await createWallet(payload)

      if (result.is_success && result.data) {
        const successEvent = new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: `"${name}" wallet created successfully!`,
          },
        })
        window.dispatchEvent(successEvent)

        setIsPinModalOpen(false)
        navigate(`/wallet/${result.data.walletId}`)
        return
      }

      throw new Error(
        result.message || 'Failed to create wallet. Please try again.'
      )
    } catch (error) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create wallet. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)

      throw error
    } finally {
      setIsVerifyingPin(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    if (currentStep === 3 && !validateStep3()) return
    if (currentStep === 4 && !validateStep4()) return

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
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

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId)
    if (errors.categoryId) {
      setErrors((prev) => ({ ...prev, categoryId: undefined }))
    }
  }

  const handleBankSelect = (bankId: number) => {
    setSelectedBankAccountId(bankId)
    if (errors.bankAccountId) {
      setErrors((prev) => ({ ...prev, bankAccountId: undefined }))
    }
  }

  const displayedReleases = showAllReleases
    ? preview?.sampleReleaseDates || []
    : preview?.sampleReleaseDates?.slice(0, 5) || []

  const hasPreviewErrors =
    preview?.errors && preview.errors.length > 0
  const hasPreviewWarnings =
    preview?.warnings && preview.warnings.length > 0
  const hasPreviewIssues = hasPreviewErrors || hasPreviewWarnings

  const calendarSchedule = preview
    ? {
        releases: preview.sampleReleaseDates.map((release) => ({
          scheduledReleaseId: release.releaseNumber,
          scheduled_for: release.date,
          amount: release.amount,
          is_released: false,
          released_at: '',
          status: 'projected',
          is_projected: true,
        })),
      }
    : null

  // Current step tour key
  const currentTourKey = `step${currentStep}` as TourKey
  const currentTour = STEP_TOURS[currentTourKey]

  // Reopen button helper — reused across every step
  const StepTourButton = () => (
    <button
      type="button"
      onClick={() => stepSheet.open(currentTourKey)}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
      style={{
        backgroundColor: isDark
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.04)',
        color: themeColors.mid,
      }}
      aria-label="Explain this step"
    >
      <Info size={14} strokeWidth={2.4} />
    </button>
  )

  return (
    <AppLayout>
      <div
        className="py-5"
        style={{ color: themeColors.charcoal }}
      >
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
          >
            <ArrowLeft
              size={20}
              style={{ color: themeColors.charcoal }}
            />
          </button>

          <div>
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Create Wallet
            </h2>
            <p
              className="text-[13px]"
              style={{ color: themeColors.mid }}
            >
              Set up a controlled wallet in 5 steps
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div
                  key={step.id}
                  className="flex flex-1 flex-col items-center"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-all"
                    style={{
                      backgroundColor: isCompleted
                        ? themeColors.green
                        : isActive
                        ? themeColors.green
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
                    className="mt-1.5 text-center text-[10px] font-medium"
                    style={{
                      color: isActive
                        ? themeColors.green
                        : themeColors.mid,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
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
                backgroundColor: themeColors.green,
                width: `${
                  (currentStep / STEPS.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <div
          className="rounded-[16px] border p-5"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          {/* STEP 1 */}
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
                    Give your wallet a name and set a target amount
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
                      ? themeColors.green
                      : themeColors.border,
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.3)'
                      : '#F9FAFB',
                  }}
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) {
                        setErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }))
                      }
                    }}
                    placeholder="e.g. Rent Savings"
                    className="w-full border-0 bg-transparent py-3 text-[14px] outline-none"
                    style={{ color: themeColors.charcoal }}
                    maxLength={50}
                  />
                </div>

                {errors.name ? (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: '#EF4444' }}
                  >
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
                  <FileText
                    size={14}
                    style={{ color: themeColors.mid }}
                  />
                  Description
                </label>

                <div
                  className="rounded-[12px] border px-3 py-3 transition-all"
                  style={{
                    borderColor: errors.description
                      ? '#EF4444'
                      : description
                      ? themeColors.green
                      : themeColors.border,
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.3)'
                      : '#F9FAFB',
                  }}
                >
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      if (errors.description) {
                        setErrors((prev) => ({
                          ...prev,
                          description: undefined,
                        }))
                      }
                    }}
                    placeholder="e.g. Save for monthly rent payment"
                    rows={3}
                    className="w-full resize-none border-0 bg-transparent text-[14px] outline-none"
                    style={{ color: themeColors.charcoal }}
                    maxLength={200}
                  />
                </div>

                {errors.description ? (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: '#EF4444' }}
                  >
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

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Target
                    size={14}
                    style={{ color: themeColors.mid }}
                  />
                  Target Amount
                </label>

                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.targetAmount
                      ? '#EF4444'
                      : targetAmount
                      ? themeColors.green
                      : themeColors.border,
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.3)'
                      : '#F9FAFB',
                  }}
                >
                  <span
                    className="text-[18px] font-bold"
                    style={{ color: themeColors.mid }}
                  >
                    ₦
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetAmount}
                    onChange={(e) =>
                      handleAmountChange(e.target.value)
                    }
                    placeholder="0"
                    className="w-full border-0 bg-transparent py-3 pl-2 text-[18px] font-bold outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                </div>

                {errors.targetAmount ? (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: '#EF4444' }}
                  >
                    {errors.targetAmount}
                  </p>
                ) : (
                  targetAmount && (
                    <p
                      className="mt-1 text-right text-[12px] font-medium"
                      style={{ color: themeColors.green }}
                    >
                      ₦{formatAmount(targetAmount)}
                    </p>
                  )
                )}
              </div>

              <div
                className="mt-5 flex items-start gap-3 rounded-[12px] p-3"
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
                <Info
                  size={16}
                  style={{
                    color: '#60A5FA',
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[12px]"
                  style={{ color: themeColors.charcoal }}
                >
                  The target amount is the total you want to
                  control in this wallet. Funds will be released
                  in smaller amounts based on your schedule.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2 */}
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
                    Select the category that best fits this wallet
                  </p>
                </div>
                <StepTourButton />
              </div>

              {isLoadingCategories ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: themeColors.green }}
                  />
                  <p
                    className="mt-3 text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Loading categories...
                  </p>
                </div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((category) => {
                    const Icon = getIcon(category.icon)
                    const isSelected =
                      selectedCategoryId === category.id

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          handleCategorySelect(category.id)
                        }
                        className="relative flex flex-col items-center justify-center rounded-[14px] border p-3 transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
                        style={{
                          borderColor: isSelected
                            ? themeColors.green
                            : themeColors.border,
                          borderWidth: isSelected ? 2 : 1,
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(15, 185, 110, 0.12)'
                              : 'rgba(15, 185, 110, 0.06)'
                            : isDark
                            ? 'rgba(255,255,255,0.03)'
                            : '#F9FAFB',
                        }}
                      >
                        {isSelected && (
                          <div
                            className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                            style={{
                              backgroundColor:
                                themeColors.green,
                            }}
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
                              ? themeColors.green
                              : isDark
                              ? 'rgba(15, 185, 110, 0.15)'
                              : 'rgba(15, 185, 110, 0.08)',
                            color: isSelected
                              ? '#FFFFFF'
                              : themeColors.green,
                          }}
                        >
                          <Icon size={18} strokeWidth={2} />
                        </div>

                        <span
                          className="text-center text-[11px] font-medium leading-tight"
                          style={{
                            color: isSelected
                              ? themeColors.green
                              : themeColors.charcoal,
                          }}
                        >
                          {category.name}
                        </span>
                      </button>
                    )
                  })}
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
                    onClick={fetchCategories}
                    className="mt-3 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                    style={{
                      backgroundColor: themeColors.green,
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
                  <AlertCircle
                    size={16}
                    style={{ color: '#EF4444' }}
                  />
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

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Select Bank Account
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Choose the account that will fund this wallet
                  </p>
                </div>
                <StepTourButton />
              </div>

              {isLoadingBanks ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: themeColors.green }}
                  />
                  <p
                    className="mt-3 text-[13px]"
                    style={{ color: themeColors.mid }}
                  >
                    Loading bank accounts...
                  </p>
                </div>
              ) : bankAccounts.length > 0 ? (
                <div className="space-y-2">
                  {bankAccounts.map((bank) => {
                    const isSelected =
                      selectedBankAccountId === bank.id

                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() =>
                          handleBankSelect(bank.id)
                        }
                        className="flex w-full items-center gap-3 rounded-[14px] border p-3.5 transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
                        style={{
                          borderColor: isSelected
                            ? themeColors.green
                            : themeColors.border,
                          borderWidth: isSelected ? 2 : 1,
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(15, 185, 110, 0.12)'
                              : 'rgba(15, 185, 110, 0.06)'
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
                                const target =
                                  e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <Building2
                              size={20}
                              style={{
                                color: themeColors.green,
                              }}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                          <p
                            className="text-[14px] font-semibold"
                            style={{
                              color: themeColors.charcoal,
                            }}
                          >
                            {bank.bankName}
                          </p>
                          <p
                            className="mt-0.5 truncate text-[12px]"
                            style={{
                              color: themeColors.mid,
                            }}
                          >
                            {bank.accountName}
                          </p>
                          <p
                            className="mt-0.5 text-[11px] font-medium tracking-wider"
                            style={{
                              color: themeColors.mid,
                            }}
                          >
                            {maskAccountNumber(
                              bank.accountNumber
                            )}
                          </p>
                        </div>

                        {isSelected && (
                          <CheckCircle
                            size={20}
                            style={{
                              color: themeColors.green,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center"
                  style={{ color: themeColors.mid }}
                >
                  <Building2 size={32} strokeWidth={1.5} />
                  <p className="mt-3 text-[14px] font-medium">
                    No bank accounts found
                  </p>
                  <p className="mt-1 text-[12px]">
                    Add a bank account to continue
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/bank')}
                    className="mt-4 flex items-center gap-2 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                    style={{
                      backgroundColor: themeColors.green,
                      color: '#FFFFFF',
                    }}
                  >
                    <Plus size={14} />
                    Add Bank Account
                  </button>
                </div>
              )}

              {errors.bankAccountId && (
                <div
                  className="mt-4 flex items-center gap-2 rounded-[10px] p-2.5"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(239, 68, 68, 0.06)',
                  }}
                >
                  <AlertCircle
                    size={16}
                    style={{ color: '#EF4444' }}
                  />
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

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Schedule Configuration
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Set how and when funds will be released
                  </p>
                </div>
                <StepTourButton />
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Target
                    size={14}
                    style={{ color: themeColors.mid }}
                  />
                  Target Amount
                </label>

                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.targetAmount
                      ? '#EF4444'
                      : targetAmount
                      ? themeColors.green
                      : themeColors.border,
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.3)'
                      : '#F9FAFB',
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
                    onChange={(e) =>
                      handleAmountChange(e.target.value)
                    }
                    placeholder="0"
                    className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Zap
                    size={14}
                    style={{ color: themeColors.mid }}
                  />
                  Release Amount (per release)
                </label>

                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.releaseAmount
                      ? '#EF4444'
                      : releaseAmount
                      ? themeColors.green
                      : themeColors.border,
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.3)'
                      : '#F9FAFB',
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
                    value={releaseAmount}
                    onChange={(e) =>
                      handleReleaseAmountChange(e.target.value)
                    }
                    placeholder="0"
                    className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                </div>

                {errors.releaseAmount ? (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: '#EF4444' }}
                  >
                    {errors.releaseAmount}
                  </p>
                ) : (
                  releaseAmount && (
                    <p
                      className="mt-1 text-right text-[12px] font-medium"
                      style={{ color: themeColors.green }}
                    >
                      ₦{formatAmount(releaseAmount)}
                    </p>
                  )
                )}
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 block text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  Schedule Type
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCY_TYPES.map((freq) => {
                    const Icon = freq.icon
                    const isActive =
                      frequencyType === freq.value

                    return (
                      <button
                        key={freq.value}
                        type="button"
                        onClick={() => {
                          setFrequencyType(freq.value)
                          setPreview(null)
                          setHasPreviewed(false)
                        }}
                        className="flex flex-col items-center rounded-[10px] border py-2.5 transition-all"
                        style={{
                          borderColor: isActive
                            ? themeColors.green
                            : themeColors.border,
                          backgroundColor: isActive
                            ? isDark
                              ? 'rgba(15, 185, 110, 0.15)'
                              : 'rgba(15, 185, 110, 0.08)'
                            : 'transparent',
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color: isActive
                              ? themeColors.green
                              : themeColors.mid,
                          }}
                        />
                        <span
                          className="mt-1 text-[11px] font-medium"
                          style={{
                            color: isActive
                              ? themeColors.green
                              : themeColors.mid,
                          }}
                        >
                          {freq.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mb-4">
                {frequencyType === 'once' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="mb-1.5 block text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        Release Date
                      </label>
                      <input
                        type="date"
                        value={onceDate}
                        onChange={(e) => {
                          setOnceDate(e.target.value)
                          setPreview(null)
                          setHasPreviewed(false)
                        }}
                        className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                        style={{
                          borderColor: themeColors.border,
                          backgroundColor: isDark
                            ? 'rgba(0,0,0,0.3)'
                            : '#F9FAFB',
                          color: themeColors.charcoal,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="mb-1.5 block text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        Time
                      </label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          setTime(e.target.value)
                          setPreview(null)
                          setHasPreviewed(false)
                        }}
                        className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                        style={{
                          borderColor: themeColors.border,
                          backgroundColor: isDark
                            ? 'rgba(0,0,0,0.3)'
                            : '#F9FAFB',
                          color: themeColors.charcoal,
                        }}
                      />
                    </div>
                  </div>
                )}

                {frequencyType === 'hourly' && (
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      Interval (hours)
                    </label>
                    <input
                      type="number"
                      value={intervalHours}
                      onChange={(e) => {
                        setIntervalHours(
                          Number(e.target.value)
                        )
                        setPreview(null)
                        setHasPreviewed(false)
                      }}
                      className="w-full max-w-xs rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                      style={{
                        borderColor: themeColors.border,
                        backgroundColor: isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',
                        color: themeColors.charcoal,
                      }}
                      min={1}
                      max={24}
                    />
                  </div>
                )}

                {(frequencyType === 'daily' ||
                  frequencyType === 'weekly') && (
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      {frequencyType === 'daily'
                        ? 'Select Days'
                        : 'Select Days of Week'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected =
                          selectedDays.includes(day.value)
                        return (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              toggleDay(day.value)
                              setPreview(null)
                              setHasPreviewed(false)
                            }}
                            className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                            style={{
                              backgroundColor: isSelected
                                ? themeColors.green
                                : isDark
                                ? 'rgba(255,255,255,0.08)'
                                : '#F3F4F6',
                              color: isSelected
                                ? '#FFFFFF'
                                : themeColors.mid,
                            }}
                          >
                            {day.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {frequencyType === 'monthly' && (
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      Dates of Month
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(
                        { length: 31 },
                        (_, i) => i + 1
                      ).map((date) => {
                        const isSelected =
                          selectedDates.includes(date)
                        return (
                          <button
                            key={date}
                            type="button"
                            onClick={() => {
                              toggleDate(date)
                              setPreview(null)
                              setHasPreviewed(false)
                            }}
                            className="h-9 w-9 rounded-[8px] text-[12px] font-medium transition-all"
                            style={{
                              backgroundColor: isSelected
                                ? themeColors.green
                                : isDark
                                ? 'rgba(255,255,255,0.08)'
                                : '#F3F4F6',
                              color: isSelected
                                ? '#FFFFFF'
                                : themeColors.mid,
                            }}
                          >
                            {date}
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="lastDay"
                        checked={isLastDayOfMonth}
                        onChange={(e) => {
                          setIsLastDayOfMonth(e.target.checked)
                          setPreview(null)
                          setHasPreviewed(false)
                        }}
                        className="h-4 w-4 rounded"
                        style={{
                          accentColor: themeColors.green,
                        }}
                      />
                      <label
                        htmlFor="lastDay"
                        className="text-[13px]"
                        style={{ color: themeColors.mid }}
                      >
                        Also release on last day of month
                      </label>
                    </div>
                  </div>
                )}

                {(frequencyType === 'quarterly' ||
                  frequencyType === 'yearly') && (
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      Select Months
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {MONTHS.map((month) => {
                        const isSelected =
                          selectedMonths.includes(month.value)
                        return (
                          <button
                            key={month.value}
                            type="button"
                            onClick={() => {
                              toggleMonth(month.value)
                              setPreview(null)
                              setHasPreviewed(false)
                            }}
                            className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                            style={{
                              backgroundColor: isSelected
                                ? themeColors.green
                                : isDark
                                ? 'rgba(255,255,255,0.08)'
                                : '#F3F4F6',
                              color: isSelected
                                ? '#FFFFFF'
                                : themeColors.mid,
                            }}
                          >
                            {month.label}
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-3">
                      <label
                        className="mb-1.5 block text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        Days of Month
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[1, 3, 7, 10, 15, 20, 25].map((date) => {
                          const isSelected =
                            selectedDates.includes(date)
                          return (
                            <button
                              key={date}
                              type="button"
                              onClick={() => {
                                toggleDate(date)
                                setPreview(null)
                                setHasPreviewed(false)
                              }}
                              className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-all"
                              style={{
                                backgroundColor:
                                  isSelected
                                    ? themeColors.green
                                    : isDark
                                    ? 'rgba(255,255,255,0.08)'
                                    : '#F3F4F6',
                                color: isSelected
                                  ? '#FFFFFF'
                                  : themeColors.mid,
                              }}
                            >
                              {date}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {frequencyType === 'custom' && (
                  <div>
                    <label
                      className="mb-1.5 block text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      Interval (days)
                    </label>
                    <input
                      type="number"
                      value={intervalDays}
                      onChange={(e) => {
                        setIntervalDays(
                          Number(e.target.value)
                        )
                        setPreview(null)
                        setHasPreviewed(false)
                      }}
                      className="w-full max-w-xs rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                      style={{
                        borderColor: themeColors.border,
                        backgroundColor: isDark
                          ? 'rgba(0,0,0,0.3)'
                          : '#F9FAFB',
                        color: themeColors.charcoal,
                      }}
                      min={1}
                    />
                  </div>
                )}

                {frequencyType !== 'once' && (
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="mb-1.5 block text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value)
                          setPreview(null)
                          setHasPreviewed(false)
                        }}
                        className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                        style={{
                          borderColor: themeColors.border,
                          backgroundColor: isDark
                            ? 'rgba(0,0,0,0.3)'
                            : '#F9FAFB',
                          color: themeColors.charcoal,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        className="mb-1.5 block text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        Time
                      </label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          setTime(e.target.value)
                          setPreview(null)
                          setHasPreviewed(false)
                        }}
                        className="w-full rounded-[12px] border px-3 py-2.5 text-[14px] outline-none"
                        style={{
                          borderColor: themeColors.border,
                          backgroundColor: isDark
                            ? 'rgba(0,0,0,0.3)'
                            : '#F9FAFB',
                          color: themeColors.charcoal,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePreviewSchedule}
                disabled={isPreviewing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] border-2 px-6 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(15, 185, 110, 0.1)'
                    : 'rgba(15, 185, 110, 0.06)',
                  borderColor: themeColors.green,
                  color: themeColors.green,
                }}
              >
                {isPreviewing ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Eye size={18} />
                    {hasPreviewed
                      ? 'Regenerate Preview'
                      : 'Preview Schedule'}
                  </>
                )}
              </button>

              {previewError && (
                <div
                  className="mt-3 rounded-[12px] p-3 text-[13px]"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(239, 68, 68, 0.08)',
                    color: '#EF4444',
                  }}
                >
                  {previewError}
                </div>
              )}

              {hasPreviewed && preview && (
                <div
                  className="mt-4 rounded-[14px] border p-4"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : '#FAFBFC',
                    borderColor: themeColors.border,
                  }}
                >
                  {hasPreviewIssues && (
                    <div className="mb-4 space-y-2">
                      {hasPreviewErrors && (
                        <div
                          className="rounded-[10px] border p-3"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(239, 68, 68, 0.1)'
                              : 'rgba(239, 68, 68, 0.05)',
                            borderColor: '#EF4444',
                          }}
                        >
                          <div className="mb-1.5 flex items-center gap-2">
                            <XCircle
                              size={14}
                              style={{ color: '#EF4444' }}
                            />
                            <span
                              className="text-[12px] font-semibold"
                              style={{ color: '#EF4444' }}
                            >
                              {preview.errors.length} Error
                              {preview.errors.length > 1
                                ? 's'
                                : ''}{' '}
                              Found
                            </span>
                          </div>
                          <div className="space-y-1">
                            {preview.errors.map(
                              (errorMsg, index) => (
                                <p
                                  key={index}
                                  className="flex items-start gap-1.5 text-[11px]"
                                  style={{ color: '#EF4444' }}
                                >
                                  <span className="mt-0.5">
                                    •
                                  </span>
                                  <span>{errorMsg}</span>
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {hasPreviewWarnings && (
                        <div
                          className="rounded-[10px] border p-3"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(251, 191, 36, 0.1)'
                              : 'rgba(251, 191, 36, 0.05)',
                            borderColor: '#F59E0B',
                          }}
                        >
                          <div className="mb-1.5 flex items-center gap-2">
                            <AlertCircle
                              size={14}
                              style={{ color: '#F59E0B' }}
                            />
                            <span
                              className="text-[12px] font-semibold"
                              style={{ color: '#F59E0B' }}
                            >
                              {preview.warnings.length} Warning
                              {preview.warnings.length > 1
                                ? 's'
                                : ''}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {preview.warnings.map(
                              (warning, index) => (
                                <p
                                  key={index}
                                  className="flex items-start gap-1.5 text-[11px]"
                                  style={{ color: '#D97706' }}
                                >
                                  <span className="mt-0.5">
                                    •
                                  </span>
                                  <span>{warning}</span>
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!hasPreviewErrors && (
                    <>
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        <div
                          className="rounded-[10px] p-2.5 text-center"
                          style={{
                            backgroundColor: themeColors.card,
                          }}
                        >
                          <p
                            className="text-[10px]"
                            style={{
                              color: themeColors.mid,
                            }}
                          >
                            Total Releases
                          </p>
                          <p
                            className="text-[16px] font-bold"
                            style={{
                              color: themeColors.charcoal,
                            }}
                          >
                            {preview.totalReleases}
                          </p>
                        </div>
                        <div
                          className="rounded-[10px] p-2.5 text-center"
                          style={{
                            backgroundColor: themeColors.card,
                          }}
                        >
                          <p
                            className="text-[10px]"
                            style={{
                              color: themeColors.mid,
                            }}
                          >
                            Total Amount
                          </p>
                          <p
                            className="text-[16px] font-bold"
                            style={{
                              color: themeColors.green,
                            }}
                          >
                            {formatCurrency(
                              preview.totalAmount
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className="mb-3 flex items-start gap-2 rounded-[10px] p-2.5"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(15, 185, 110, 0.1)'
                            : 'rgba(15, 185, 110, 0.06)',
                          borderWidth: 1,
                          borderColor: isDark
                            ? 'rgba(15, 185, 110, 0.2)'
                            : 'rgba(15, 185, 110, 0.15)',
                        }}
                      >
                        <Info
                          size={14}
                          style={{
                            color: themeColors.green,
                            marginTop: 2,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          className="text-[12px]"
                          style={{
                            color: themeColors.charcoal,
                          }}
                        >
                          {preview.description}
                        </span>
                      </div>

                      {preview.sampleReleaseDates.length > 0 && (
                        <div className="mb-2 flex items-center justify-between">
                          <p
                            className="text-[12px] font-medium"
                            style={{
                              color: themeColors.mid,
                            }}
                          >
                            Release Schedule
                          </p>

                          <div
                            className="flex items-center gap-1 rounded-[8px] border p-0.5"
                            style={{
                              borderColor:
                                themeColors.border,
                              backgroundColor: isDark
                                ? 'rgba(255,255,255,0.04)'
                                : '#F9FAFB',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setScheduleView('list')
                              }
                              className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[10px] font-medium transition-all"
                              style={{
                                backgroundColor:
                                  scheduleView === 'list'
                                    ? themeColors.green
                                    : 'transparent',
                                color:
                                  scheduleView === 'list'
                                    ? '#FFFFFF'
                                    : themeColors.mid,
                              }}
                            >
                              <List size={11} />
                              List
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setScheduleView('calendar')
                              }
                              className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[10px] font-medium transition-all"
                              style={{
                                backgroundColor:
                                  scheduleView ===
                                  'calendar'
                                    ? themeColors.green
                                    : 'transparent',
                                color:
                                  scheduleView ===
                                  'calendar'
                                    ? '#FFFFFF'
                                    : themeColors.mid,
                              }}
                            >
                              <CalendarDays size={11} />
                              Calendar
                            </button>
                          </div>
                        </div>
                      )}

                      {scheduleView === 'list' && (
                        <>
                          {preview.sampleReleaseDates.length >
                            5 && (
                            <div className="mb-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAllReleases(
                                    !showAllReleases
                                  )
                                }
                                className="flex items-center gap-1 text-[11px] font-semibold"
                                style={{
                                  color: themeColors.green,
                                }}
                              >
                                {showAllReleases ? (
                                  <>
                                    Show Less
                                    <ChevronUp size={12} />
                                  </>
                                ) : (
                                  <>
                                    Show All (
                                    {
                                      preview
                                        .sampleReleaseDates
                                        .length
                                    }
                                    )
                                    <ChevronDown
                                      size={12}
                                    />
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          <div className="max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
                            {displayedReleases.map(
                              (release, index) => {
                                const isFinal =
                                  index ===
                                  displayedReleases.length -
                                    1
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between rounded-[8px] border p-2.5"
                                    style={{
                                      borderColor: isFinal
                                        ? themeColors.green
                                        : themeColors.border,
                                      backgroundColor:
                                        isFinal
                                          ? isDark
                                            ? 'rgba(15, 185, 110, 0.08)'
                                            : 'rgba(15, 185, 110, 0.04)'
                                          : themeColors.card,
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
                                        style={{
                                          backgroundColor:
                                            isFinal
                                              ? themeColors.green
                                              : isDark
                                              ? 'rgba(255,255,255,0.08)'
                                              : '#F3F4F6',
                                          color: isFinal
                                            ? '#FFFFFF'
                                            : themeColors.mid,
                                        }}
                                      >
                                        {
                                          release.releaseNumber
                                        }
                                      </span>
                                      <div>
                                        <p
                                          className="text-[11px] font-medium"
                                          style={{
                                            color:
                                              themeColors.charcoal,
                                          }}
                                        >
                                          {formatDateWithTime(
                                            release.date
                                          )}
                                        </p>
                                        <p
                                          className="text-[9px]"
                                          style={{
                                            color:
                                              themeColors.mid,
                                          }}
                                        >
                                          Cum:{' '}
                                          {formatCurrency(
                                            release.cumulativeAmount
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <p
                                      className="text-[12px] font-semibold"
                                      style={{
                                        color: isFinal
                                          ? themeColors.green
                                          : themeColors.charcoal,
                                      }}
                                    >
                                      {formatCurrency(
                                        release.amount
                                      )}
                                    </p>
                                  </div>
                                )
                              }
                            )}
                          </div>
                        </>
                      )}

                      {scheduleView === 'calendar' &&
                        calendarSchedule && (
                          <UseScheduleCalendar
                            schedule={calendarSchedule}
                          />
                        )}

                      <div
                        className="mt-3 flex items-center gap-2 rounded-[8px] p-2.5"
                        style={{
                          backgroundColor: preview.isValid
                            ? isDark
                              ? 'rgba(15, 185, 110, 0.1)'
                              : 'rgba(15, 185, 110, 0.06)'
                            : isDark
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(239, 68, 68, 0.06)',
                        }}
                      >
                        {preview.isValid ? (
                          <>
                            <CheckCircle
                              size={14}
                              style={{
                                color: themeColors.green,
                              }}
                            />
                            <span
                              className="text-[11px] font-medium"
                              style={{
                                color: themeColors.green,
                              }}
                            >
                              Schedule is valid
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle
                              size={14}
                              style={{ color: '#EF4444' }}
                            />
                            <span
                              className="text-[11px] font-medium"
                              style={{ color: '#EF4444' }}
                            >
                              Schedule has errors
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
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
                className="mb-5 overflow-hidden rounded-[20px] p-5 text-center"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(15, 185, 110, 0.25) 0%, rgba(15, 185, 110, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(15, 185, 110, 0.12) 0%, rgba(15, 185, 110, 0.04) 100%)',
                  border: `1px solid ${
                    isDark
                      ? 'rgba(15, 185, 110, 0.3)'
                      : 'rgba(15, 185, 110, 0.2)'
                  }`,
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Target
                    size={16}
                    style={{ color: themeColors.green }}
                  />
                  <p
                    className="text-[12px] font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.green }}
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
                  {formatCurrency(parseInt(targetAmount || '0'))}
                </p>

                <p
                  className="mt-2 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  will be controlled in this wallet
                </p>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div
                  className="rounded-[16px] border p-3"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.03)'
                      : '#F9FAFB',
                    borderColor: themeColors.border,
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.mid }}
                  >
                    Category
                  </p>

                  {selectedCategory ? (
                    <div className="mt-2 flex items-center gap-2">
                      {(() => {
                        const Icon = getIcon(
                          selectedCategory.icon
                        )
                        return (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: isDark
                                ? 'rgba(15, 185, 110, 0.15)'
                                : 'rgba(15, 185, 110, 0.08)',
                              color: themeColors.green,
                            }}
                          >
                            <Icon size={16} />
                          </div>
                        )
                      })()}
                      <p
                        className="truncate text-[13px] font-semibold"
                        style={{
                          color: themeColors.charcoal,
                        }}
                      >
                        {selectedCategory.name}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="mt-2 text-[13px]"
                      style={{ color: themeColors.mid }}
                    >
                      Not selected
                    </p>
                  )}
                </div>

                <div
                  className="rounded-[16px] border p-3"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.03)'
                      : '#F9FAFB',
                    borderColor: themeColors.border,
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.mid }}
                  >
                    Bank
                  </p>

                  {selectedBank ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(255,255,255,0.06)'
                            : '#FFFFFF',
                          border: `1px solid ${themeColors.border}`,
                        }}
                      >
                        {selectedBank.bankImageUrl ? (
                          <img
                            src={selectedBank.bankImageUrl}
                            alt={selectedBank.bankName}
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <Landmark
                            size={14}
                            style={{
                              color: themeColors.green,
                            }}
                          />
                        )}
                      </div>
                      <p
                        className="truncate text-[13px] font-semibold"
                        style={{
                          color: themeColors.charcoal,
                        }}
                      >
                        {selectedBank.bankName}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="mt-2 text-[13px]"
                      style={{ color: themeColors.mid }}
                    >
                      Not selected
                    </p>
                  )}
                </div>
              </div>

              <div
                className="mb-3 overflow-hidden rounded-[16px] border"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.02)'
                    : '#FAFBFC',
                  borderColor: themeColors.border,
                }}
              >
                <div
                  className="flex items-start justify-between border-b px-4 py-3"
                  style={{
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Tag
                      size={14}
                      style={{ color: themeColors.mid }}
                    />
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
                  style={{
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      size={14}
                      style={{ color: themeColors.mid }}
                    />
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

                {selectedBank && (
                  <div
                    className="flex items-start justify-between border-b px-4 py-3"
                    style={{
                      borderColor: themeColors.border,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Building2
                        size={14}
                        style={{ color: themeColors.mid }}
                      />
                      <span
                        className="text-[12px]"
                        style={{ color: themeColors.mid }}
                      >
                        Account
                      </span>
                    </div>
                    <div className="ml-3 text-right">
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {selectedBank.accountName}
                      </p>
                      <p
                        className="text-[11px] tracking-wider"
                        style={{ color: themeColors.mid }}
                      >
                        {maskAccountNumber(
                          selectedBank.accountNumber
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div
                  className="flex items-center justify-between border-b px-4 py-3"
                  style={{
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Zap
                      size={14}
                      style={{ color: themeColors.mid }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Release Amount
                    </span>
                  </div>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.green }}
                  >
                    {formatCurrency(
                      parseInt(releaseAmount || '0')
                    )}
                  </span>
                </div>

                <div
                  className="flex items-start justify-between border-b px-4 py-3"
                  style={{
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Repeat
                      size={14}
                      style={{ color: themeColors.mid }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Frequency
                    </span>
                  </div>
                  <span
                    className="ml-3 max-w-[60%] text-right text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {getFrequencyLabel(frequencyType)}
                  </span>
                </div>

                <div
                  className="flex items-start justify-between border-b px-4 py-3"
                  style={{
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      style={{ color: themeColors.mid }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Schedule
                    </span>
                  </div>
                  <span
                    className="ml-3 max-w-[60%] text-right text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    {getFrequencyDescription()}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={14}
                      style={{ color: themeColors.mid }}
                    />
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Start Date
                    </span>
                  </div>
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {formatDate(startDate)} at {time}
                  </span>
                </div>
              </div>

              {preview && (
                <div
                  className="mb-4 rounded-[16px] border p-4"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.08)'
                      : 'rgba(15, 185, 110, 0.04)',
                    borderColor: isDark
                      ? 'rgba(15, 185, 110, 0.2)'
                      : 'rgba(15, 185, 110, 0.15)',
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle
                      size={16}
                      style={{ color: themeColors.green }}
                    />
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.green }}
                    >
                      Schedule Preview
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: themeColors.mid }}
                      >
                        Total Releases
                      </p>
                      <p
                        className="mt-0.5 text-[16px] font-bold"
                        style={{
                          color: themeColors.charcoal,
                        }}
                      >
                        {preview.totalReleases}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: themeColors.mid }}
                      >
                        Total Amount
                      </p>
                      <p
                        className="mt-0.5 text-[16px] font-bold"
                        style={{ color: themeColors.green }}
                      >
                        {formatCurrency(preview.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <p
                    className="mt-3 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    {preview.description}
                  </p>
                </div>
              )}

              <div
                className="flex items-start gap-3 rounded-[12px] p-3"
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
                <Info
                  size={16}
                  style={{
                    color: '#60A5FA',
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[12px]"
                  style={{ color: themeColors.charcoal }}
                >
                  Once created, funds will be released into
                  your available balance based on the schedule
                  above. You can pause or cancel anytime.
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
                isLoadingCategories ||
                isLoadingBanks ||
                (currentStep === 4 &&
                  (!preview || !preview.isValid))
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                backgroundColor: themeColors.green,
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
              disabled={isVerifyingPin}
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              {isVerifyingPin ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
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
        description="Enter your PIN to confirm creating this wallet."
        onClose={() => setIsPinModalOpen(false)}
        onVerify={verifyPinAndCreateWallet}
        isLoading={isVerifyingPin}
        maxLength={6}
      />

      {/* ───────── Per-step Tour BottomSheet ───────── */}
      <BottomSheet
        isOpen={stepSheet.activeSheet !== null}
        onClose={stepSheet.close}
        title={currentTour.title}
        icon={<currentTour.icon size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={stepSheet.close}
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
          <div className="mb-3 flex items-center justify-center">
            <div
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: isDark
                  ? 'rgba(15, 185, 110, 0.15)'
                  : 'rgba(15, 185, 110, 0.08)',
                color: themeColors.green,
              }}
            >
              Step {currentStep} of {STEPS.length} · {STEPS[currentStep - 1].label}
            </div>
          </div>

          <p className="text-[13px] leading-[1.65]">{currentTour.body}</p>
        </div>
      </BottomSheet>
    </AppLayout>
  )
}