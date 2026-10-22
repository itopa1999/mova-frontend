import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Banknote,
  Shield,
  Clock,
  Repeat,
  Check,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Info,
  Sparkles,
  Tag,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
  Lock,
  LayoutGrid,
  Search,
  Plus,
  X,
  Mail,
  Smartphone,
  Hash,
  Trash2,
  UserPlus,
  Shuffle,
  Wallet,
  Hourglass,
  PlayCircle,
  Copy,
  Link2,
  KeyRound,
  type LucideIcon,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import BottomSheet from '../../components/ui/BottomSheet'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { colors, darkColors } from '../../styles/tokens'
import { formatCurrency } from '../../utils/formatting'
import {
  getWalletCategories,
  type WalletCategory,
} from '../../services/app/createwallet'

/* ───────────── Types ───────────── */

type Frequency = 'Daily' | 'Weekly' | 'Monthly'
type RotationStrategy = 'FixedOrder' | 'RandomDraw' | 'ModeratorSet'
type PenaltySource = 'deposit' | 'round'
type StartPolicy = 'wait_for_all' | 'start_with_joined'

interface AddedMember {
  tempId: string
  identifier: string
  identifierType: 'email' | 'phone' | 'publicId'
  displayName: string
  addedAt: number
  payoutPosition: number | null
}

interface MemberSearchResult {
  found: boolean
  identifier: string
  identifierType: 'email' | 'phone' | 'publicId'
  displayName: string
  alreadyAdded: boolean
}

interface CircleForm {
  name: string
  description: string
  categoryId: number | null
  contributionAmount: string
  frequency: Frequency
  daysOfWeek: number[]
  datesOfMonth: number[]
  isLastDayOfMonth: boolean
  memberCount: number
  depositAmount: string
  enablePenalty: boolean
  penaltyAmount: string
  penaltySource: PenaltySource
  gracePeriodHours: number
  rotationStrategy: RotationStrategy
  startDate: string
  /** true = only invited people can join; false = anyone with the code can join */
  inviteOnly: boolean
}

const STEPS = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Category' },
  { id: 3, label: 'Contribution' },
  { id: 4, label: 'Rules' },
  { id: 5, label: 'Members' },
  { id: 6, label: 'Review' },
] as const

const MIN_MEMBERS = 3
const MAX_MEMBERS = 50
const MEMBER_LIST_PREVIEW_COUNT = 3

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
]

/* ───────────── Info hint seen keys ───────────── */

const CIRCLE_INFO_SEEN_KEYS = {
  step1Intro: 'mova_circle_info_step1_seen',
  step5RotationFixed: 'mova_circle_info_step5_rotation_fixed_seen',
  step5RotationRandom: 'mova_circle_info_step5_rotation_random_seen',
  step5RotationModerator: 'mova_circle_info_step5_rotation_moderator_seen',
  step5InviteInfo: 'mova_circle_info_step5_invite_seen',
} as const

type InfoHintKey = keyof typeof CIRCLE_INFO_SEEN_KEYS

/* ───────────── Info hint component ───────────── */

function DismissibleHint({
  hintKey,
  icon: Icon,
  themeColors,
  className,
  children,
}: {
  hintKey: InfoHintKey
  icon: LucideIcon
  themeColors: typeof colors | typeof darkColors
  className?: string
  children: ReactNode
}) {
  const storageKey = CIRCLE_INFO_SEEN_KEYS[hintKey]

  const [visible, setVisible] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(storageKey)
    } catch {
      return true
    }
  })

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, '1')
    } catch {
      /* storage unavailable */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className={`flex items-start gap-3 rounded-[12px] border p-3 ${
        className ?? ''
      }`}
      style={{
        backgroundColor: themeColors.circleLight,
        borderColor: themeColors.circleMid,
      }}
    >
      <Icon
        size={16}
        style={{
          color: themeColors.circle,
          marginTop: 2,
          flexShrink: 0,
        }}
      />
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={dismiss}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70 active:scale-90"
        style={{ color: themeColors.mid }}
        aria-label="Dismiss hint"
      >
        <X size={14} strokeWidth={2.4} />
      </button>
    </div>
  )
}

/* ───────────── Tours ───────────── */

type TourKey = 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6'

interface StepTour {
  title: string
  body: string
  icon: typeof FileText
}

const STEP_TOURS: Record<TourKey, StepTour> = {
  step1: {
    icon: FileText,
    title: 'Circle Details',
    body:
      'Give your circle a clear name and a short description. Members see this when they join, and it helps everyone remember what the group is saving for.',
  },
  step2: {
    icon: LayoutGrid,
    title: 'Choose a Category',
    body:
      'Pick the category that best fits this circle — Rent, Family, Education, Business, and more. Categories help you see where your money is going and personalize your dashboard.',
  },
  step3: {
    icon: Banknote,
    title: 'Contribution & Pool',
    body:
      'Each member contributes the same amount every round. The "round pool" is what one person receives per round — contribution × members.\n\n' +
      'For Daily or Weekly circles, you can also pick specific days of the week. For Monthly, pick specific dates of the month.',
  },
  step4: {
    icon: Shield,
    title: 'Rules & Security',
    body:
      'Set the security deposit (held from each member until the circle completes), penalty for missed contributions, grace period, and rotation order.\n\n' +
      'Fixed order is simplest. Random draw is fairer for large groups. Moderator-set lets you hand-pick who goes first.',
  },
  step5: {
    icon: Users,
    title: 'Invite Members',
    body:
      'You can choose how members join — invite-only (strict, you control who joins) or share a link/code with anyone you trust.\n\n' +
      'If you choose invite-only, add members by email, phone, or public ID. Each gets an email invite they must accept.\n\n' +
      'If you choose link-based, you can share a code with anyone — the circle fills up to the member limit.',
  },
  step6: {
    icon: CheckCircle,
    title: 'Review & Create',
    body:
      'Double-check everything — contribution, category, penalties, rotation, invite mode, and start date. Tap "Create circle" and enter your PIN.\n\n' +
      'After creation, you\'ll get an invite code and link you can share with members.',
  },
}

const STEP_TOUR_SEEN_KEYS: Record<TourKey, string> = {
  step1: 'mova_circle_v6_step1_seen',
  step2: 'mova_circle_v6_step2_seen',
  step3: 'mova_circle_v6_step3_seen',
  step4: 'mova_circle_v6_step4_seen',
  step5: 'mova_circle_v6_step5_seen',
  step6: 'mova_circle_v6_step6_seen',
}

/* ───────────── Helpers ───────────── */

const formatNaira = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-NG')
}

const parseNaira = (formatted: string) =>
  Number(formatted.replace(/\D/g, '') || 0)

const classifyIdentifier = (
  raw: string
): { type: 'email' | 'phone' | 'publicId' | 'invalid'; value: string } => {
  const v = raw.trim()
  if (!v) return { type: 'invalid', value: '' }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    return { type: 'email', value: v.toLowerCase() }
  }
  if (/^\d{10,11}$/.test(v)) {
    return { type: 'phone', value: v }
  }
  if (/^[a-zA-Z0-9_-]{4,}$/.test(v)) {
    return { type: 'publicId', value: v }
  }
  return { type: 'invalid', value: v }
}

const formatIdentifierLabel = (type: AddedMember['identifierType']) => {
  switch (type) {
    case 'email':
      return 'email'
    case 'phone':
      return 'phone'
    case 'publicId':
      return 'ID'
  }
}

const identifierIcon = (type: AddedMember['identifierType']) => {
  switch (type) {
    case 'email':
      return Mail
    case 'phone':
      return Smartphone
    case 'publicId':
      return Hash
  }
}

/** Generates a shareable invite code. Avoids confusing chars (0/O, 1/I/L). */
const generateInviteCode = (): string => {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `MOVA-${code}`
}

// Generates a unique circle public ID. Kept at module scope so the React
// Compiler doesn't treat the impure Date.now() call as part of the render.
const generateCirclePublicId = (): string => `circle_${Date.now()}`

/* ───────────── Component ───────────── */

export default function CreateCircle() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const [currentStep, setCurrentStep] = useState(1)
  const [maxStepReached, setMaxStepReached] = useState(1)
  const tourSheet = useBottomSheet<TourKey>()

  const [form, setForm] = useState<CircleForm>(() => ({
    name: '',
    description: '',
    categoryId: null,
    contributionAmount: '',
    frequency: 'Weekly',
    daysOfWeek: [],
    datesOfMonth: [],
    isLastDayOfMonth: false,
    memberCount: 5,
    depositAmount: '',
    enablePenalty: true,
    penaltyAmount: '',
    penaltySource: 'deposit',
    gracePeriodHours: 24,
    rotationStrategy: 'FixedOrder',
    startDate: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    inviteOnly: true,
  }))

  const [startPolicy, setStartPolicy] = useState<StartPolicy>('wait_for_all')

  const [categories, setCategories] = useState<WalletCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [members, setMembers] = useState<AddedMember[]>([])
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [memberSearchResult, setMemberSearchResult] =
    useState<MemberSearchResult | null>(null)
  const [isSearchingMember, setIsSearchingMember] = useState(false)
  const [memberSearchError, setMemberSearchError] = useState<string | null>(
    null
  )
  const [orderDrawn, setOrderDrawn] = useState(false)
  const [showAllMembers, setShowAllMembers] = useState(false)

  const [errors, setErrors] = useState<{
    name?: string
    description?: string
    categoryId?: string
    contributionAmount?: string
    memberCount?: string
    penaltyAmount?: string
    startDate?: string
    daysSelection?: string
  }>({})

  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [showSuccess, setShowSuccess] = useState(false)
  const [createdCircle, setCreatedCircle] = useState<{
    publicId: string
    name: string
    categoryName: string
    memberCount: number
    contributionAmount: number
    totalRounds: number
    invitesSent: number
    inviteCode: string
    inviteLink: string
    inviteOnly: boolean
  } | null>(null)

  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null)

  const update = <K extends keyof CircleForm>(
    key: K,
    value: CircleForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  const contribution = parseNaira(form.contributionAmount)
  const deposit = parseNaira(form.depositAmount)
  const penalty = parseNaira(form.penaltyAmount)
  const totalPool = contribution * form.memberCount
  const selectedCategory = categories.find((c) => c.id === form.categoryId)

  const effectivePerDefault =
    form.penaltySource === 'round' && form.enablePenalty
      ? contribution + penalty
      : contribution

  const canReorder =
    form.rotationStrategy === 'ModeratorSet' ||
    form.rotationStrategy === 'FixedOrder'

  const rotationHintKey: InfoHintKey =
    form.rotationStrategy === 'FixedOrder'
      ? 'step5RotationFixed'
      : form.rotationStrategy === 'RandomDraw'
      ? 'step5RotationRandom'
      : 'step5RotationModerator'

  /* ─── Copy handler ─── */

  const handleCopy = async (
    field: 'code' | 'link',
    value: string
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: field === 'code' ? 'Invite code copied' : 'Invite link copied',
          },
        })
      )
    } catch {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: 'Could not copy. Please try again.' },
        })
      )
    }
  }

  /* ─── Categories loader ─── */

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    setCategoriesError(null)
    try {
      const response = await getWalletCategories()
      if (response.is_success && response.data) {
        setCategories(response.data)
      } else {
        setCategoriesError(response.message || 'Failed to load categories.')
      }
    } catch {
      setCategoriesError('Failed to load categories. Please try again.')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  useEffect(() => {
    if (currentStep === 2 && categories.length === 0 && !isLoadingCategories) {
      fetchCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!form.name.trim()) {
      newErrors.name = 'Circle name is required'
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    } else if (form.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters'
    }
    if (form.description.trim().length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: typeof errors = {}
    if (!form.categoryId) newErrors.categoryId = 'Please select a category'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = (): boolean => {
    const newErrors: typeof errors = {}

    if (!form.contributionAmount || contribution <= 0) {
      newErrors.contributionAmount = 'Contribution amount is required'
    } else if (contribution < 500) {
      newErrors.contributionAmount = 'Minimum contribution is ₦500'
    }

    if (form.memberCount < MIN_MEMBERS) {
      newErrors.memberCount = `At least ${MIN_MEMBERS} members are required`
    } else if (form.memberCount > MAX_MEMBERS) {
      newErrors.memberCount = `Maximum ${MAX_MEMBERS} members`
    }

    if (
      (form.frequency === 'Daily' || form.frequency === 'Weekly') &&
      form.daysOfWeek.length === 0
    ) {
      newErrors.daysSelection = `Select at least one ${form.frequency.toLowerCase()} day`
    }
    if (
      form.frequency === 'Monthly' &&
      form.datesOfMonth.length === 0 &&
      !form.isLastDayOfMonth
    ) {
      newErrors.daysSelection = 'Select at least one date of the month'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep4 = (): boolean => {
    const newErrors: typeof errors = {}
    if (form.enablePenalty) {
      if (!form.penaltyAmount || penalty <= 0) {
        newErrors.penaltyAmount = 'Penalty amount is required when enabled'
      } else if (form.penaltySource === 'round' && penalty > contribution) {
        newErrors.penaltyAmount =
          'Penalty cannot exceed the base contribution'
      }
    }
    if (!form.startDate) {
      newErrors.startDate = 'Start date is required'
    } else if (new Date(form.startDate) < new Date(new Date().toDateString())) {
      newErrors.startDate = 'Start date cannot be in the past'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ─── Handlers ─── */

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    if (currentStep === 3 && !validateStep3()) return
    if (currentStep === 4 && !validateStep4()) return
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

  /* ─── Day / month pickers ─── */

  const toggleDay = (day: number) => {
    update(
      'daysOfWeek',
      form.daysOfWeek.includes(day)
        ? form.daysOfWeek.filter((d) => d !== day)
        : [...form.daysOfWeek, day]
    )
  }

  const toggleDate = (date: number) => {
    update(
      'datesOfMonth',
      form.datesOfMonth.includes(date)
        ? form.datesOfMonth.filter((d) => d !== date)
        : [...form.datesOfMonth, date]
    )
  }

  /* ─── Member search + add ─── */

  const handleSearchMember = async () => {
    const raw = memberSearchQuery.trim()
    if (!raw) {
      setMemberSearchError('Enter an email, phone number, or public ID')
      return
    }
    const classified = classifyIdentifier(raw)
    if (classified.type === 'invalid') {
      setMemberSearchError(
        'Enter a valid email, 10-11 digit phone number, or MOVA public ID'
      )
      return
    }

    setMemberSearchError(null)
    setIsSearchingMember(true)
    setMemberSearchResult(null)

    try {
      await new Promise((r) => setTimeout(r, 500))

      const alreadyAdded = members.some(
        (m) =>
          m.identifier.toLowerCase() === classified.value.toLowerCase() &&
          m.identifierType === classified.type
      )

      const displayName =
        classified.type === 'email'
          ? classified.value.split('@')[0]
          : classified.type === 'phone'
          ? `User ••• ${classified.value.slice(-4)}`
          : `User ${classified.value.slice(0, 8)}`

      setMemberSearchResult({
        found: true,
        identifier: classified.value,
        identifierType: classified.type,
        displayName,
        alreadyAdded,
      })
    } catch {
      setMemberSearchError('Could not search right now. Please try again.')
    } finally {
      setIsSearchingMember(false)
    }
  }

  const handleAddMember = () => {
    if (!memberSearchResult || !memberSearchResult.found) return
    if (memberSearchResult.alreadyAdded) return
    if (members.length >= form.memberCount) {
      setMemberSearchError(
        `This circle is capped at ${form.memberCount} members. Increase the member count or remove someone first.`
      )
      return
    }

    const nextPosition =
      form.rotationStrategy === 'RandomDraw' ? null : members.length + 1

    const newMember: AddedMember = {
      tempId: `m_${Date.now()}`,
      identifier: memberSearchResult.identifier,
      identifierType: memberSearchResult.identifierType,
      displayName: memberSearchResult.displayName,
      addedAt: Date.now(),
      payoutPosition: nextPosition,
    }

    setMembers((prev) => [...prev, newMember])
    setMemberSearchQuery('')
    setMemberSearchResult(null)
    setMemberSearchError(null)
    setOrderDrawn(false)
  }

  const handleRemoveMember = (tempId: string) => {
    setMembers((prev) => {
      const next = prev.filter((m) => m.tempId !== tempId)
      if (form.rotationStrategy !== 'RandomDraw') {
        return next.map((m, i) => ({ ...m, payoutPosition: i + 1 }))
      }
      return next
    })
    setOrderDrawn(false)
  }

  const moveMemberUp = (index: number) => {
    if (index <= 0) return
    setMembers((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next.map((m, i) => ({ ...m, payoutPosition: i + 1 }))
    })
    setOrderDrawn(false)
  }

  const moveMemberDown = (index: number) => {
    if (index >= members.length - 1) return
    setMembers((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next.map((m, i) => ({ ...m, payoutPosition: i + 1 }))
    })
    setOrderDrawn(false)
  }

  const handleDrawOrder = () => {
    const shuffled = [...members].sort(() => Math.random() - 0.5)
    const withPositions = shuffled.map((m, i) => ({
      ...m,
      payoutPosition: i + 1,
    }))
    setMembers(withPositions)
    setOrderDrawn(true)
  }

  /* ─── Create ─── */

  const handleOpenPinModal = () => {
    if (
      !validateStep1() ||
      !validateStep2() ||
      !validateStep3() ||
      !validateStep4()
    ) {
      setSubmitError('Please complete all steps before creating the circle.')
      return
    }
    setSubmitError(null)
    setIsPinModalOpen(true)
  }

  const verifyPinAndCreate = async (pin: string) => {
    setIsVerifyingPin(true)
    setSubmitError(null)

    try {
      await new Promise((r) => setTimeout(r, 800))
      if (pin.length !== 6) throw new Error('Invalid PIN. Please try again.')

      const frequencyConfig: Record<string, unknown> = {
        type: form.frequency.toLowerCase(),
      }
      if (form.frequency === 'Daily' || form.frequency === 'Weekly') {
        frequencyConfig.daysOfWeek = form.daysOfWeek
      }
      if (form.frequency === 'Monthly') {
        frequencyConfig.datesOfMonth = form.datesOfMonth
        frequencyConfig.isLastDayOfMonth = form.isLastDayOfMonth
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId as number,
        contributionAmount: contribution,
        frequency: form.frequency,
        frequencyConfig: JSON.stringify(frequencyConfig),
        memberCount: form.memberCount,
        depositAmount: deposit > 0 ? deposit : undefined,
        enablePenalty: form.enablePenalty,
        penaltyAmount: form.enablePenalty ? penalty : undefined,
        penaltySource: form.penaltySource,
        gracePeriodHours: form.gracePeriodHours,
        startPolicy,
        rotationStrategy: form.rotationStrategy,
        startDate: form.startDate,
        inviteOnly: form.inviteOnly,
        invites: members.map((m) => ({
          identifier: m.identifier,
          identifierType: m.identifierType,
          displayName: m.displayName,
          payoutPosition: m.payoutPosition,
        })),
      }
      console.log('[DUMMY] Circle payload →', payload)

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: `"${form.name}" circle created${
              members.length > 0
                ? ` — ${members.length} invite${members.length === 1 ? '' : 's'} sent`
                : ''
            }!`,
          },
        })
      )

      const publicId = generateCirclePublicId()
      setIsPinModalOpen(false)
      setCreatedCircle({
        publicId,
        name: form.name,
        categoryName: selectedCategory?.name ?? '—',
        memberCount: form.memberCount,
        contributionAmount: contribution,
        totalRounds: form.memberCount,
        invitesSent: members.length,
        inviteCode: generateInviteCode(),
        inviteLink: `https://mova.app/circles/join/${publicId}`,
        inviteOnly: form.inviteOnly,
      })
      setShowSuccess(true)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create circle. Please try again.'

      window.dispatchEvent(
        new CustomEvent('showToast', { detail: { type: 'error', message } })
      )
      setSubmitError(message)
      throw error
    } finally {
      setIsVerifyingPin(false)
    }
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

  if (showSuccess && createdCircle) {
    return (
      <AppLayout>
        <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.circleLight }}
          >
            <Users
              size={40}
              strokeWidth={2.4}
              style={{ color: themeColors.circle }}
            />
          </div>

          <h2
            className="mt-5 text-center text-[22px] font-bold leading-tight"
            style={{ color: themeColors.charcoal }}
          >
            Circle created
          </h2>

          <p
            className="mt-3 max-w-[320px] text-center text-[14px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            <span style={{ color: themeColors.charcoal, fontWeight: 600 }}>
              "{createdCircle.name}"
            </span>{' '}
            is now a draft.{' '}
            {createdCircle.invitesSent > 0
              ? `${createdCircle.invitesSent} invite${createdCircle.invitesSent === 1 ? '' : 's'} sent. `
              : ''}
            {createdCircle.inviteOnly
              ? 'Only the people you invited can join.'
              : 'Anyone with the invite code can join until the circle is full.'}
          </p>

          {/* Summary card */}
          <div
            className="mt-6 w-full max-w-[380px] rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Category
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {createdCircle.categoryName}
              </span>
            </div>
            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Contribution
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(createdCircle.contributionAmount)}
              </span>
            </div>
            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Members
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {createdCircle.memberCount}
              </span>
            </div>
            <div
              className="my-2.5 h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Round pool
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(
                  createdCircle.contributionAmount * createdCircle.memberCount
                )}
              </span>
            </div>
          </div>

          {/* Organizer note */}
          <div
            className="mt-4 flex w-full max-w-[380px] items-start gap-3 rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.circleLight,
              borderColor: themeColors.circleMid,
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: themeColors.circle,
                color: '#FFFFFF',
              }}
            >
              <Wallet size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  You're member #1
                </p>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: themeColors.circle,
                    color: '#FFFFFF',
                  }}
                >
                  Organizer
                </span>
              </div>
              <p
                className="mt-1 text-[11.5px] leading-[1.55]"
                style={{ color: themeColors.mid }}
              >
                A dedicated wallet has been created for this circle. Your
                contributions and payouts flow through it — separate from your
                main MOVA balance and other wallets.
              </p>
            </div>
          </div>

          {/* ═══════════ INVITE CODE CARD ═══════════ */}
          <div
            className="mt-4 w-full max-w-[380px] overflow-hidden rounded-[18px] border"
            style={{
              backgroundColor: themeColors.circleLight,
              borderColor: themeColors.circleMid,
            }}
          >
            <div className="p-4">
              <div className="mb-3 flex items-start gap-2">
                <KeyRound
                  size={16}
                  style={{
                    color: themeColors.circle,
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                />
                <div className="flex-1">
                  <p
                    className="text-[12px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {createdCircle.inviteOnly
                      ? 'Share this code with your invited members'
                      : 'Share this code with anyone you trust'}
                  </p>
                  <p
                    className="mt-0.5 text-[11px] leading-[1.55]"
                    style={{ color: themeColors.mid }}
                  >
                    {createdCircle.inviteOnly
                      ? 'Only people you explicitly invited can use this code. Anyone else will be rejected.'
                      : `Anyone with this code can join until the circle hits ${createdCircle.memberCount} members.`}
                  </p>
                </div>
              </div>

              {/* Invite code display */}
              <button
                type="button"
                onClick={() =>
                  handleCopy('code', createdCircle.inviteCode)
                }
                className="flex w-full items-center justify-between gap-2 rounded-[12px] border px-3 py-3 transition-all hover:opacity-90 active:scale-[0.99]"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center gap-2">
                  <Lock
                    size={14}
                    style={{ color: themeColors.mid }}
                  />
                  <span
                    className="font-mono text-[16px] font-bold tracking-[0.12em]"
                    style={{ color: themeColors.charcoal }}
                  >
                    {createdCircle.inviteCode}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{
                    backgroundColor: copiedField === 'code'
                      ? themeColors.circle
                      : themeColors.circleLight,
                    color: copiedField === 'code'
                      ? '#FFFFFF'
                      : themeColors.circle,
                  }}
                >
                  {copiedField === 'code' ? (
                    <>
                      <Check size={10} strokeWidth={3} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={10} strokeWidth={2.4} />
                      Copy
                    </>
                  )}
                </div>
              </button>

              {/* Invite link display */}
              <button
                type="button"
                onClick={() =>
                  handleCopy('link', createdCircle.inviteLink)
                }
                className="mt-2 flex w-full items-center justify-between gap-2 rounded-[12px] border px-3 py-2.5 transition-all hover:opacity-90 active:scale-[0.99]"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Link2
                    size={14}
                    style={{ color: themeColors.mid, flexShrink: 0 }}
                  />
                  <span
                    className="truncate text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    {createdCircle.inviteLink}
                  </span>
                </div>
                <div
                  className="flex shrink-0 items-center gap-1 text-[10px] font-semibold"
                  style={{ color: themeColors.circle }}
                >
                  {copiedField === 'link' ? (
                    <>
                      <Check size={10} strokeWidth={3} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={10} strokeWidth={2.4} />
                      Copy
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Info footer */}
            <div
              className="flex items-start gap-2 px-4 py-2.5"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.5)',
                borderTop: `1px solid ${themeColors.circleMid}`,
              }}
            >
              <Info
                size={12}
                style={{
                  color: themeColors.circle,
                  marginTop: 1.5,
                  flexShrink: 0,
                }}
              />
              <p
                className="text-[10.5px] leading-[1.55]"
                style={{ color: themeColors.mid }}
              >
                The circle can only start once{' '}
                {createdCircle.inviteOnly
                  ? 'all invited members have accepted'
                  : `at least ${MIN_MEMBERS} members have joined`}{' '}
                and the start date arrives.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/dashboard/circles/${createdCircle.publicId}`, {
                replace: true,
              })
            }
            className="mt-6 flex w-full max-w-[380px] items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: themeColors.circle, color: '#FFFFFF' }}
          >
            <CheckCircle size={18} />
            View circle
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/circles', { replace: true })}
            className="mt-3 text-[13px] font-medium transition-all hover:opacity-70"
            style={{ color: themeColors.mid }}
          >
            Back to circles
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
              New circle
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              Save together. Each round, one member receives the pot.
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
                  style={{ opacity: step.id > maxStepReached ? 0.45 : 1 }}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor:
                        isCompleted || isActive
                          ? themeColors.circle
                          : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : '#F3F4F6',
                      color:
                        isCompleted || isActive ? '#FFFFFF' : themeColors.mid,
                    }}
                  >
                    {isCompleted ? '✓' : step.id}
                  </div>
                  <span
                    className="mt-1 text-center text-[9px] font-medium leading-tight"
                    style={{
                      color: isActive ? themeColors.circle : themeColors.mid,
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
                backgroundColor: themeColors.circle,
                width: `${(currentStep / STEPS.length) * 100}%`,
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
          {/* ─── STEP 1 — Details ─── */}
          {currentStep === 1 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Circle Details
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Give this circle a name and a short description
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
                  Circle name
                </label>
                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.name
                      ? '#EF4444'
                      : form.name
                      ? themeColors.circle
                      : themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="e.g. Lagos Rent Circle 2026"
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
                    {form.name.length}/50 characters
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <FileText size={14} style={{ color: themeColors.mid }} />
                  Description{' '}
                  <span style={{ color: themeColors.mid, fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <div
                  className="rounded-[12px] border px-3 py-3 transition-all"
                  style={{
                    borderColor: errors.description
                      ? '#EF4444'
                      : form.description
                      ? themeColors.circle
                      : themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="What is this circle saving for?"
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
                    {form.description.length}/200 characters
                  </p>
                )}
              </div>

              <DismissibleHint
                hintKey="step1Intro"
                icon={Info}
                themeColors={themeColors}
              >
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  You'll pick a category, contribution, rules, and members in
                  the next steps.
                </p>
              </DismissibleHint>
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
                    Pick the category that best fits this circle
                  </p>
                </div>
                <StepTourButton />
              </div>

              {isLoadingCategories ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: themeColors.circle }}
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
                    onClick={fetchCategories}
                    className="mt-3 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                    style={{
                      backgroundColor: themeColors.circle,
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
                      const isSelected = form.categoryId === category.id
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => update('categoryId', category.id)}
                          className="relative flex flex-col items-center justify-center rounded-[14px] border p-3 transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
                          style={{
                            borderColor: isSelected
                              ? themeColors.circle
                              : themeColors.border,
                            borderWidth: isSelected ? 2 : 1,
                            backgroundColor: isSelected
                              ? themeColors.circleLight
                              : isDark
                              ? 'rgba(255,255,255,0.03)'
                              : '#F9FAFB',
                          }}
                        >
                          {isSelected && (
                            <div
                              className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                              style={{ backgroundColor: themeColors.circle }}
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
                                ? themeColors.circle
                                : themeColors.circleLight,
                              color: isSelected
                                ? '#FFFFFF'
                                : themeColors.circle,
                            }}
                          >
                            <Icon size={18} strokeWidth={2} />
                          </div>
                          <span
                            className="text-center text-[11px] font-medium leading-tight"
                            style={{
                              color: isSelected
                                ? themeColors.circle
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
                    onClick={fetchCategories}
                    className="mt-3 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                    style={{
                      backgroundColor: themeColors.circle,
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

          {/* ─── STEP 3 — Contribution ─── */}
          {currentStep === 3 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Contribution & Pool
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    How much each member pays, and how many are in the circle
                  </p>
                </div>
                <StepTourButton />
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Banknote size={14} style={{ color: themeColors.mid }} />
                  Contribution amount
                </label>
                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.contributionAmount
                      ? '#EF4444'
                      : form.contributionAmount
                      ? themeColors.circle
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
                    value={form.contributionAmount}
                    onChange={(e) =>
                      update('contributionAmount', formatNaira(e.target.value))
                    }
                    placeholder="0"
                    className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                </div>
                {errors.contributionAmount ? (
                  <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                    {errors.contributionAmount}
                  </p>
                ) : (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    Minimum ₦500 per contribution
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Clock size={14} style={{ color: themeColors.mid }} />
                  Frequency
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Daily', 'Weekly', 'Monthly'] as Frequency[]).map((f) => {
                    const selected = form.frequency === f
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          update('frequency', f)
                          update('daysOfWeek', [])
                          update('datesOfMonth', [])
                          update('isLastDayOfMonth', false)
                        }}
                        className="rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95"
                        style={{
                          backgroundColor: selected
                            ? themeColors.circle
                            : isDark
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.04)',
                          color: selected ? '#FFFFFF' : themeColors.charcoal,
                          border: `1px solid ${
                            selected ? themeColors.circle : themeColors.border
                          }`,
                        }}
                      >
                        {f}
                      </button>
                    )
                  })}
                </div>
              </div>

              {(form.frequency === 'Daily' || form.frequency === 'Weekly') && (
                <div className="mb-4">
                  <label
                    className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    <Calendar size={14} style={{ color: themeColors.mid }} />
                    {form.frequency === 'Daily'
                      ? 'Only on these days'
                      : 'On these days'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const selected = form.daysOfWeek.includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className="rounded-[8px] px-3 py-2 text-[12px] font-medium transition-all active:scale-95"
                          style={{
                            backgroundColor: selected
                              ? themeColors.circle
                              : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#F3F4F6',
                            color: selected ? '#FFFFFF' : themeColors.mid,
                          }}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                  {form.daysOfWeek.length === 0 ? (
                    <p
                      className="mt-1.5 text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      {form.frequency === 'Daily'
                        ? 'Leave empty to run every day. Tap specific days to restrict.'
                        : 'Select at least one day for weekly contributions.'}
                    </p>
                  ) : (
                    <p
                      className="mt-1.5 text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Every {form.frequency.toLowerCase()} on{' '}
                      {form.daysOfWeek
                        .sort((a, b) => a - b)
                        .map(
                          (d) => DAYS_OF_WEEK.find((x) => x.value === d)?.label
                        )
                        .join(', ')}
                    </p>
                  )}
                </div>
              )}

              {form.frequency === 'Monthly' && (
                <div className="mb-4">
                  <label
                    className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    <Calendar size={14} style={{ color: themeColors.mid }} />
                    Dates of the month
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                      const selected = form.datesOfMonth.includes(date)
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => toggleDate(date)}
                          className="h-9 w-9 rounded-[8px] text-[12px] font-medium transition-all active:scale-95"
                          style={{
                            backgroundColor: selected
                              ? themeColors.circle
                              : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#F3F4F6',
                            color: selected ? '#FFFFFF' : themeColors.mid,
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
                      id="circleLastDay"
                      checked={form.isLastDayOfMonth}
                      onChange={(e) =>
                        update('isLastDayOfMonth', e.target.checked)
                      }
                      className="h-4 w-4 rounded"
                      style={{ accentColor: themeColors.circle }}
                    />
                    <label
                      htmlFor="circleLastDay"
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Also release on the last day of the month
                    </label>
                  </div>
                </div>
              )}

              {errors.daysSelection && (
                <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                  {errors.daysSelection}
                </p>
              )}

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Users size={14} style={{ color: themeColors.mid }} />
                  Number of members
                </label>
                <div
                  className="flex items-center justify-between rounded-[12px] border px-2 py-1"
                  style={{
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                    borderColor: themeColors.border,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        'memberCount',
                        Math.max(MIN_MEMBERS, form.memberCount - 1)
                      )
                    }
                    disabled={form.memberCount <= MIN_MEMBERS}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[20px] font-bold transition-opacity active:opacity-60 disabled:opacity-30"
                    style={{ color: themeColors.charcoal }}
                  >
                    −
                  </button>
                  <span
                    className="text-[18px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {form.memberCount}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        'memberCount',
                        Math.min(MAX_MEMBERS, form.memberCount + 1)
                      )
                    }
                    disabled={form.memberCount >= MAX_MEMBERS}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[20px] font-bold transition-opacity active:opacity-60 disabled:opacity-30"
                    style={{ color: themeColors.charcoal }}
                  >
                    +
                  </button>
                </div>
                {errors.memberCount ? (
                  <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                    {errors.memberCount}
                  </p>
                ) : (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    Min {MIN_MEMBERS} · Max {MAX_MEMBERS} · You +{' '}
                    {form.memberCount - 1} others · {form.memberCount} rounds
                  </p>
                )}
              </div>

              {contribution > 0 && (
                <div
                  className="rounded-[12px] border p-3.5"
                  style={{
                    backgroundColor: themeColors.circleLight,
                    borderColor: themeColors.circleMid,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      You pay
                    </span>
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(contribution)} /{' '}
                      {form.frequency.toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Round pool
                    </span>
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(totalPool)}
                    </span>
                  </div>
                  <p
                    className="mt-2 text-[11.5px] leading-[1.55]"
                    style={{ color: themeColors.mid }}
                  >
                    Each round pools{' '}
                    <strong style={{ color: themeColors.charcoal }}>
                      {formatCurrency(totalPool)}
                    </strong>{' '}
                    and pays one member. Over {form.memberCount} rounds,
                    everyone receives it once.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 4 — Rules ─── */}
          {currentStep === 4 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Rules & Security
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Protections against default, plus rotation order
                  </p>
                </div>
                <StepTourButton />
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Lock size={14} style={{ color: themeColors.mid }} />
                  Security deposit{' '}
                  <span style={{ color: themeColors.mid, fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <div
                  className="flex items-center rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: form.depositAmount
                      ? themeColors.circle
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
                    value={form.depositAmount}
                    onChange={(e) =>
                      update('depositAmount', formatNaira(e.target.value))
                    }
                    placeholder="0"
                    className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                    style={{ color: themeColors.charcoal }}
                  />
                </div>
                <p
                  className="mt-1 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Held from each member until the circle completes. Refunded at
                  the end. Set 0 to skip.
                </p>
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Shield size={14} style={{ color: themeColors.mid }} />
                  Penalty for missed contribution
                </label>
                <button
                  type="button"
                  onClick={() => update('enablePenalty', !form.enablePenalty)}
                  className="flex w-full items-center justify-between rounded-[12px] border px-4 py-3.5"
                  style={{
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                    borderColor: themeColors.border,
                  }}
                >
                  <span
                    className="text-[14px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    Apply a penalty
                  </span>
                  <div
                    className="relative h-6 w-11 rounded-full transition-colors"
                    style={{
                      backgroundColor: form.enablePenalty
                        ? themeColors.circle
                        : isDark
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.15)',
                    }}
                  >
                    <div
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                      style={{
                        transform: `translateX(${
                          form.enablePenalty ? 22 : 2
                        }px)`,
                      }}
                    />
                  </div>
                </button>
              </div>

              {form.enablePenalty && (
                <div className="mb-4">
                  <label
                    className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    <Shield size={14} style={{ color: themeColors.mid }} />
                    Penalty amount
                  </label>
                  <div
                    className="flex items-center rounded-[12px] border px-3 transition-all"
                    style={{
                      borderColor: errors.penaltyAmount
                        ? '#EF4444'
                        : form.penaltyAmount
                        ? themeColors.circle
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
                      value={form.penaltyAmount}
                      onChange={(e) =>
                        update('penaltyAmount', formatNaira(e.target.value))
                      }
                      placeholder="0"
                      className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
                      style={{ color: themeColors.charcoal }}
                    />
                  </div>
                  {errors.penaltyAmount && (
                    <p
                      className="mt-1 text-[11px]"
                      style={{ color: '#EF4444' }}
                    >
                      {errors.penaltyAmount}
                    </p>
                  )}
                </div>
              )}

              {form.enablePenalty && (
                <div className="mb-4">
                  <label
                    className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    <Wallet size={14} style={{ color: themeColors.mid }} />
                    Where does the penalty come from?
                  </label>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => update('penaltySource', 'deposit')}
                      className="flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition-all"
                      style={{
                        backgroundColor:
                          form.penaltySource === 'deposit'
                            ? themeColors.circleLight
                            : isDark
                            ? 'rgba(255,255,255,0.03)'
                            : '#F9FAFB',
                        borderColor:
                          form.penaltySource === 'deposit'
                            ? themeColors.circle
                            : themeColors.border,
                        borderWidth: form.penaltySource === 'deposit' ? 2 : 1,
                      }}
                    >
                      <div
                        className="mt-0.5 shrink-0"
                        style={{
                          color:
                            form.penaltySource === 'deposit'
                              ? themeColors.circle
                              : themeColors.mid,
                        }}
                      >
                        <Lock size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className="text-[14px] font-semibold"
                            style={{ color: themeColors.charcoal }}
                          >
                            From the security deposit
                          </p>
                          {form.penaltySource === 'deposit' && (
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full"
                              style={{ backgroundColor: themeColors.circle }}
                            >
                              <Check size={12} strokeWidth={3} color="#FFFFFF" />
                            </div>
                          )}
                        </div>
                        <p
                          className="mt-0.5 text-[12px] leading-[1.5]"
                          style={{ color: themeColors.mid }}
                        >
                          If a member misses, MOVA deducts the penalty from
                          their held deposit. Their regular contribution stays
                          the same.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => update('penaltySource', 'round')}
                      className="flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition-all"
                      style={{
                        backgroundColor:
                          form.penaltySource === 'round'
                            ? themeColors.circleLight
                            : isDark
                            ? 'rgba(255,255,255,0.03)'
                            : '#F9FAFB',
                        borderColor:
                          form.penaltySource === 'round'
                            ? themeColors.circle
                            : themeColors.border,
                        borderWidth: form.penaltySource === 'round' ? 2 : 1,
                      }}
                    >
                      <div
                        className="mt-0.5 shrink-0"
                        style={{
                          color:
                            form.penaltySource === 'round'
                              ? themeColors.circle
                              : themeColors.mid,
                        }}
                      >
                        <Banknote size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className="text-[14px] font-semibold"
                            style={{ color: themeColors.charcoal }}
                          >
                            Added to their contribution
                          </p>
                          {form.penaltySource === 'round' && (
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full"
                              style={{ backgroundColor: themeColors.circle }}
                            >
                              <Check size={12} strokeWidth={3} color="#FFFFFF" />
                            </div>
                          )}
                        </div>
                        <p
                          className="mt-0.5 text-[12px] leading-[1.5]"
                          style={{ color: themeColors.mid }}
                        >
                          If a member misses, they must pay contribution +
                          penalty. The extra goes into the pool as compensation
                          for that round's recipient.
                        </p>
                      </div>
                    </button>
                  </div>

                  {form.penaltySource === 'round' &&
                    contribution > 0 &&
                    penalty > 0 && (
                      <div
                        className="mt-2 rounded-[10px] border p-2.5"
                        style={{
                          backgroundColor: themeColors.circleLight,
                          borderColor: themeColors.circleMid,
                        }}
                      >
                        <p
                          className="text-[11px] leading-[1.55]"
                          style={{ color: themeColors.mid }}
                        >
                          On a miss, they pay{' '}
                          <strong style={{ color: themeColors.charcoal }}>
                            {formatCurrency(effectivePerDefault)}
                          </strong>{' '}
                          ({formatCurrency(contribution)} +{' '}
                          {formatCurrency(penalty)}).
                        </p>
                      </div>
                    )}
                </div>
              )}

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Clock size={14} style={{ color: themeColors.mid }} />
                  Grace period
                </label>
                <div className="flex flex-wrap gap-2">
                  {[6, 12, 24, 48].map((h) => {
                    const selected = form.gracePeriodHours === h
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => update('gracePeriodHours', h)}
                        className="rounded-full px-4 py-2 text-[13px] font-semibold transition-all active:scale-95"
                        style={{
                          backgroundColor: selected
                            ? themeColors.circle
                            : isDark
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.04)',
                          color: selected ? '#FFFFFF' : themeColors.charcoal,
                          border: `1px solid ${
                            selected ? themeColors.circle : themeColors.border
                          }`,
                        }}
                      >
                        {h}h
                      </button>
                    )
                  })}
                </div>
                <p
                  className="mt-1.5 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  How long before a missed payment counts as default
                </p>
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Repeat size={14} style={{ color: themeColors.mid }} />
                  Rotation order
                </label>
                <div className="space-y-2">
                  {(
                    [
                      {
                        key: 'FixedOrder' as const,
                        icon: Repeat,
                        title: 'Fixed order',
                        desc: 'Members receive in the order they joined. Simple and predictable.',
                      },
                      {
                        key: 'RandomDraw' as const,
                        icon: Sparkles,
                        title: 'Random draw',
                        desc: 'Order is drawn when the circle starts. Fair, but less predictable.',
                      },
                      {
                        key: 'ModeratorSet' as const,
                        icon: Shuffle,
                        title: 'Moderator sets order',
                        desc: 'You decide who goes first, second, etc. Useful when trust or seniority determines the order.',
                      },
                    ]
                  ).map(({ key, icon: Icon, title, desc }) => {
                    const selected = form.rotationStrategy === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => update('rotationStrategy', key)}
                        className="flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition-all"
                        style={{
                          backgroundColor: selected
                            ? themeColors.circleLight
                            : isDark
                            ? 'rgba(255,255,255,0.03)'
                            : '#F9FAFB',
                          borderColor: selected
                            ? themeColors.circle
                            : themeColors.border,
                          borderWidth: selected ? 2 : 1,
                        }}
                      >
                        <div
                          className="mt-0.5 shrink-0"
                          style={{
                            color: selected
                              ? themeColors.circle
                              : themeColors.mid,
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className="text-[14px] font-semibold"
                              style={{ color: themeColors.charcoal }}
                            >
                              {title}
                            </p>
                            {selected && (
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded-full"
                                style={{ backgroundColor: themeColors.circle }}
                              >
                                <Check
                                  size={12}
                                  strokeWidth={3}
                                  color="#FFFFFF"
                                />
                              </div>
                            )}
                          </div>
                          <p
                            className="mt-0.5 text-[12px] leading-[1.5]"
                            style={{ color: themeColors.mid }}
                          >
                            {desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Calendar size={14} style={{ color: themeColors.mid }} />
                  Start date
                </label>
                <div
                  className="rounded-[12px] border px-3 transition-all"
                  style={{
                    borderColor: errors.startDate
                      ? '#EF4444'
                      : themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                  }}
                >
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update('startDate', e.target.value)}
                    className="w-full border-0 bg-transparent py-3 text-[14px] outline-none"
                    style={{
                      color: themeColors.charcoal,
                      colorScheme: isDark ? 'dark' : 'light',
                    }}
                  />
                </div>
                {errors.startDate ? (
                  <p className="mt-1 text-[11px]" style={{ color: '#EF4444' }}>
                    {errors.startDate}
                  </p>
                ) : (
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    The circle starts once all members have joined and this date
                    arrives
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ─── STEP 5 — Members ─── */}
          {currentStep === 5 && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3
                    className="text-[16px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Invite Members
                  </h3>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Choose how members join, then add who you want
                  </p>
                </div>
                <StepTourButton />
              </div>

              {/* ═══════════ ORGANIZER NOTICE ═══════════ */}
              <div
                className="mb-5 flex items-start gap-3 rounded-[14px] border p-3.5"
                style={{
                  backgroundColor: themeColors.circleLight,
                  borderColor: themeColors.circleMid,
                }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: themeColors.circle,
                    color: '#FFFFFF',
                  }}
                >
                  <Wallet size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      You're member #1
                    </p>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: themeColors.circle,
                        color: '#FFFFFF',
                      }}
                    >
                      Organizer
                    </span>
                  </div>
                  <p
                    className="mt-1 text-[11.5px] leading-[1.55]"
                    style={{ color: themeColors.mid }}
                  >
                    You're automatically included in the {form.memberCount}{' '}
                    members. A separate circle wallet will be created for you —
                    separate from your main MOVA balance. You're also included
                    in the payout rotation.
                  </p>
                </div>
              </div>

              {/* ═══════════ INVITE MODE ═══════════ */}
              <div className="mb-5">
                <label
                  className="mb-2 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <KeyRound size={14} style={{ color: themeColors.mid }} />
                  Who can join this circle?
                </label>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => update('inviteOnly', true)}
                    className="flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition-all"
                    style={{
                      backgroundColor: form.inviteOnly
                        ? themeColors.circleLight
                        : isDark
                        ? 'rgba(255,255,255,0.03)'
                        : '#F9FAFB',
                      borderColor: form.inviteOnly
                        ? themeColors.circle
                        : themeColors.border,
                      borderWidth: form.inviteOnly ? 2 : 1,
                    }}
                  >
                    <div
                      className="mt-0.5 shrink-0"
                      style={{
                        color: form.inviteOnly
                          ? themeColors.circle
                          : themeColors.mid,
                      }}
                    >
                      <Lock size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          Invite only{' '}
                          <span
                            className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                            style={{
                              backgroundColor: themeColors.circleLight,
                              color: themeColors.circle,
                            }}
                          >
                            Recommended
                          </span>
                        </p>
                        {form.inviteOnly && (
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-full"
                            style={{ backgroundColor: themeColors.circle }}
                          >
                            <Check size={12} strokeWidth={3} color="#FFFFFF" />
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-0.5 text-[12px] leading-[1.5]"
                        style={{ color: themeColors.mid }}
                      >
                        Strictly only people you invite here can join. Anyone
                        else is rejected. Safest for a trusted group.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => update('inviteOnly', false)}
                    className="flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition-all"
                    style={{
                      backgroundColor: !form.inviteOnly
                        ? themeColors.circleLight
                        : isDark
                        ? 'rgba(255,255,255,0.03)'
                        : '#F9FAFB',
                      borderColor: !form.inviteOnly
                        ? themeColors.circle
                        : themeColors.border,
                      borderWidth: !form.inviteOnly ? 2 : 1,
                    }}
                  >
                    <div
                      className="mt-0.5 shrink-0"
                      style={{
                        color: !form.inviteOnly
                          ? themeColors.circle
                          : themeColors.mid,
                      }}
                    >
                      <Link2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          Anyone with the link
                        </p>
                        {!form.inviteOnly && (
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-full"
                            style={{ backgroundColor: themeColors.circle }}
                          >
                            <Check size={12} strokeWidth={3} color="#FFFFFF" />
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-0.5 text-[12px] leading-[1.5]"
                        style={{ color: themeColors.mid }}
                      >
                        Share the invite code with anyone you trust. Anyone with
                        the code can join until the circle is full.
                      </p>
                    </div>
                  </button>
                </div>

                {!form.inviteOnly && (
                  <div
                    className="mt-2 flex items-start gap-2 rounded-[10px] border p-2.5"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'rgba(245, 158, 11, 0.04)',
                      borderColor: isDark
                        ? 'rgba(245, 158, 11, 0.25)'
                        : 'rgba(245, 158, 11, 0.15)',
                    }}
                  >
                    <AlertCircle
                      size={12}
                      style={{
                        color: '#F59E0B',
                        marginTop: 1,
                        flexShrink: 0,
                      }}
                    />
                    <p className="text-[11px]" style={{ color: '#D97706' }}>
                      Anyone with the code can join. Only share it with people
                      you trust. Invites still work — you can add specific
                      people here too.
                    </p>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div
                className="mb-4 rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.circleLight,
                  borderColor: themeColors.circleMid,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    Members so far
                  </span>
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {members.length + 1} of {form.memberCount}
                  </span>
                </div>
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: themeColors.circle,
                      width: `${Math.min(
                        ((members.length + 1) / form.memberCount) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p
                  className="mt-2 text-[10.5px]"
                  style={{ color: themeColors.mid }}
                >
                  You + {members.length} invite
                  {members.length === 1 ? '' : 's'} ·{' '}
                  {Math.max(form.memberCount - 1 - members.length, 0)} slot
                  {form.memberCount - 1 - members.length === 1 ? '' : 's'} left
                </p>
              </div>

              {/* Search */}
              <div className="mb-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Search size={14} style={{ color: themeColors.mid }} />
                  {form.inviteOnly
                    ? 'Add members to invite'
                    : 'Add specific members (optional)'}
                </label>

                <div className="flex gap-2">
                  <div
                    className="flex flex-1 items-center rounded-[12px] border px-3 transition-all"
                    style={{
                      borderColor: memberSearchError
                        ? '#EF4444'
                        : memberSearchQuery
                        ? themeColors.circle
                        : themeColors.border,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                    }}
                  >
                    <input
                      type="text"
                      value={memberSearchQuery}
                      onChange={(e) => {
                        setMemberSearchQuery(e.target.value)
                        setMemberSearchResult(null)
                        setMemberSearchError(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearchMember()
                        }
                      }}
                      placeholder="Email, phone, or public ID"
                      className="w-full border-0 bg-transparent py-3 text-[14px] outline-none"
                      style={{ color: themeColors.charcoal }}
                    />
                    {memberSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setMemberSearchQuery('')
                          setMemberSearchResult(null)
                          setMemberSearchError(null)
                        }}
                        className="rounded-full p-1 transition-opacity hover:opacity-70"
                        style={{ color: themeColors.mid }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchMember}
                    disabled={isSearchingMember || !memberSearchQuery.trim()}
                    className="rounded-[12px] px-4 py-2 text-[13px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                    style={{
                      backgroundColor: themeColors.circle,
                      color: '#FFFFFF',
                    }}
                  >
                    {isSearchingMember ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>

                {memberSearchError && (
                  <div
                    className="mt-2 flex items-start gap-2 rounded-[10px] p-2.5"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(239, 68, 68, 0.06)',
                    }}
                  >
                    <AlertCircle
                      size={14}
                      style={{
                        color: '#EF4444',
                        marginTop: 1,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: '#EF4444' }}
                    >
                      {memberSearchError}
                    </span>
                  </div>
                )}

                {memberSearchResult && memberSearchResult.found && (
                  <div
                    className="mt-2 rounded-[12px] border p-3"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.circle,
                      borderWidth: 1.5,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold"
                        style={{
                          backgroundColor: themeColors.circleLight,
                          color: themeColors.circle,
                        }}
                      >
                        {memberSearchResult.displayName
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          {memberSearchResult.displayName}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          {(() => {
                            const Icon = identifierIcon(
                              memberSearchResult.identifierType
                            )
                            return (
                              <Icon
                                size={11}
                                style={{ color: themeColors.mid }}
                              />
                            )
                          })()}
                          <p
                            className="truncate text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            {memberSearchResult.identifier} ·{' '}
                            {formatIdentifierLabel(
                              memberSearchResult.identifierType
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        disabled={memberSearchResult.alreadyAdded}
                        className="flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                          backgroundColor: themeColors.circle,
                          color: '#FFFFFF',
                        }}
                      >
                        {memberSearchResult.alreadyAdded ? (
                          <>
                            <Check size={12} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={12} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <DismissibleHint
                hintKey={rotationHintKey}
                icon={Shuffle}
                themeColors={themeColors}
                className="mb-4"
              >
                <p
                  className="text-[12px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  {form.rotationStrategy === 'FixedOrder'
                    ? 'Fixed order'
                    : form.rotationStrategy === 'RandomDraw'
                    ? 'Random draw'
                    : 'Moderator sets order'}
                </p>
                <p
                  className="mt-0.5 text-[11px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  {form.rotationStrategy === 'FixedOrder' &&
                    'Positions are assigned in the order members joined the circle. Use the arrows to reorder if you want a different sequence.'}
                  {form.rotationStrategy === 'RandomDraw' &&
                    'Positions are drawn randomly when the circle starts.'}
                  {form.rotationStrategy === 'ModeratorSet' &&
                    'Use the arrows on each member to set the payout order yourself.'}
                </p>
              </DismissibleHint>

              {members.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-[12px] border border-dashed py-10 text-center"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.mid,
                  }}
                >
                  <UserPlus size={32} strokeWidth={1.5} />
                  <p className="mt-3 text-[13px] font-medium">
                    No members added yet
                  </p>
                  <p className="mt-1 max-w-[260px] text-[11px]">
                    {form.inviteOnly
                      ? "You'll be able to add members after creating the circle via the invite code."
                      : "You'll get an invite code after creating the circle to share with anyone you trust."}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p
                      className="text-[12px] font-semibold uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Rotation order
                    </p>
                    {form.rotationStrategy === 'RandomDraw' &&
                      members.length > 1 &&
                      !orderDrawn && (
                        <button
                          type="button"
                          onClick={handleDrawOrder}
                          className="flex items-center gap-1 text-[11px] font-semibold"
                          style={{ color: themeColors.circle }}
                        >
                          <Shuffle size={12} /> Draw order
                        </button>
                      )}
                  </div>

                  <div className="space-y-2">
                    {members
                      .slice(
                        0,
                        showAllMembers
                          ? members.length
                          : MEMBER_LIST_PREVIEW_COUNT
                      )
                      .map((m, visibleIndex) => {
                        const index = visibleIndex
                        const Icon = identifierIcon(m.identifierType)
                        const position =
                          form.rotationStrategy === 'RandomDraw' && !orderDrawn
                            ? '?'
                            : m.payoutPosition ?? index + 1

                        return (
                          <div
                            key={m.tempId}
                            className="flex items-center gap-2 rounded-[12px] border p-3"
                            style={{
                              backgroundColor: themeColors.card,
                              borderColor: themeColors.border,
                            }}
                          >
                            {canReorder ? (
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => moveMemberUp(index)}
                                  disabled={index === 0}
                                  className="flex h-5 w-6 items-center justify-center transition-opacity active:opacity-50 disabled:opacity-25"
                                  style={{ color: themeColors.circle }}
                                  aria-label="Move up"
                                >
                                  <ChevronUp size={14} strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveMemberDown(index)}
                                  disabled={index === members.length - 1}
                                  className="flex h-5 w-6 items-center justify-center transition-opacity active:opacity-50 disabled:opacity-25"
                                  style={{ color: themeColors.circle }}
                                  aria-label="Move down"
                                >
                                  <ChevronDown size={14} strokeWidth={2.5} />
                                </button>
                              </div>
                            ) : (
                              <div className="w-6" />
                            )}

                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                              style={{
                                backgroundColor: themeColors.circle,
                                color: '#FFFFFF',
                              }}
                            >
                              {position}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-[13.5px] font-semibold"
                                style={{ color: themeColors.charcoal }}
                              >
                                {m.displayName}
                              </p>
                              <div className="mt-0.5 flex items-center gap-1">
                                <Icon
                                  size={10}
                                  style={{ color: themeColors.mid }}
                                />
                                <p
                                  className="truncate text-[11px]"
                                  style={{ color: themeColors.mid }}
                                >
                                  {m.identifier}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.tempId)}
                              className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                              style={{ color: '#EF4444' }}
                              aria-label="Remove member"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )
                      })}
                  </div>

                  {members.length > MEMBER_LIST_PREVIEW_COUNT && (
                    <button
                      type="button"
                      onClick={() => setShowAllMembers((v) => !v)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[10px] border py-2.5 text-[12px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
                      style={{
                        borderColor: themeColors.border,
                        color: themeColors.charcoal,
                        backgroundColor: 'transparent',
                      }}
                    >
                      {showAllMembers ? (
                        <>
                          Show less
                          <ChevronUp size={12} />
                        </>
                      ) : (
                        <>
                          Show all {members.length} members
                          <ChevronDown size={12} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              <DismissibleHint
                hintKey="step5InviteInfo"
                icon={Mail}
                themeColors={themeColors}
                className="mt-4"
              >
                <p
                  className="text-[11.5px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  {form.inviteOnly
                    ? 'Each added member will receive an email invite. They must click the link and accept before the circle can start. Only they can join — the invite code is locked to the members you invite.'
                    : 'You can still add specific members here — they get an email invite. Everyone else can join by using the invite code you share after creating the circle.'}
                </p>
              </DismissibleHint>

              {members.length > 0 &&
                members.length < form.memberCount - 1 && (
                  <div
                    className="mt-2 flex items-start gap-2 rounded-[10px] p-2.5"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(245, 158, 11, 0.05)',
                    }}
                  >
                    <Info
                      size={12}
                      style={{
                        color: '#F59E0B',
                        marginTop: 1,
                        flexShrink: 0,
                      }}
                    />
                    <p className="text-[11px]" style={{ color: '#D97706' }}>
                      You can add{' '}
                      {form.memberCount - 1 - members.length} more member
                      {form.memberCount - 1 - members.length === 1 ? '' : 's'}
                      {form.inviteOnly
                        ? ', or create the circle now and invite more later.'
                        : ' — or let others join with the invite code.'}
                    </p>
                  </div>
                )}

              {/* Start policy */}
              <div className="mt-4">
                <label
                  className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  <Hourglass size={14} style={{ color: themeColors.mid }} />
                  When the start date arrives
                </label>
                <p
                  className="mb-2 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  What if not everyone has accepted their invite yet?
                </p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setStartPolicy('wait_for_all')}
                    className="flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition-all"
                    style={{
                      backgroundColor:
                        startPolicy === 'wait_for_all'
                          ? themeColors.circleLight
                          : isDark
                          ? 'rgba(255,255,255,0.03)'
                          : '#F9FAFB',
                      borderColor:
                        startPolicy === 'wait_for_all'
                          ? themeColors.circle
                          : themeColors.border,
                      borderWidth: startPolicy === 'wait_for_all' ? 2 : 1,
                    }}
                  >
                    <div
                      className="mt-0.5 shrink-0"
                      style={{
                        color:
                          startPolicy === 'wait_for_all'
                            ? themeColors.circle
                            : themeColors.mid,
                      }}
                    >
                      <Hourglass size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          Wait until everyone joins
                        </p>
                        {startPolicy === 'wait_for_all' && (
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-full"
                            style={{ backgroundColor: themeColors.circle }}
                          >
                            <Check size={12} strokeWidth={3} color="#FFFFFF" />
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-0.5 text-[12px] leading-[1.5]"
                        style={{ color: themeColors.mid }}
                      >
                        The first round is delayed until all {form.memberCount}{' '}
                        members have joined. Nobody pays or receives anything
                        in the meantime.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStartPolicy('start_with_joined')}
                    className="flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition-all"
                    style={{
                      backgroundColor:
                        startPolicy === 'start_with_joined'
                          ? themeColors.circleLight
                          : isDark
                          ? 'rgba(255,255,255,0.03)'
                          : '#F9FAFB',
                      borderColor:
                        startPolicy === 'start_with_joined'
                          ? themeColors.circle
                          : themeColors.border,
                      borderWidth: startPolicy === 'start_with_joined' ? 2 : 1,
                    }}
                  >
                    <div
                      className="mt-0.5 shrink-0"
                      style={{
                        color:
                          startPolicy === 'start_with_joined'
                            ? themeColors.circle
                            : themeColors.mid,
                      }}
                    >
                      <PlayCircle size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          Start with joined members
                        </p>
                        {startPolicy === 'start_with_joined' && (
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-full"
                            style={{ backgroundColor: themeColors.circle }}
                          >
                            <Check size={12} strokeWidth={3} color="#FFFFFF" />
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-0.5 text-[12px] leading-[1.5]"
                        style={{ color: themeColors.mid }}
                      >
                        The circle runs with whoever has joined by the start
                        date. Members who accept later are added to the tail of
                        the rotation.
                      </p>
                    </div>
                  </button>
                </div>

                {startPolicy === 'start_with_joined' && (
                  <div
                    className="mt-2 flex items-start gap-2 rounded-[10px] border p-2.5"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'rgba(245, 158, 11, 0.04)',
                      borderColor: isDark
                        ? 'rgba(245, 158, 11, 0.25)'
                        : 'rgba(245, 158, 11, 0.15)',
                    }}
                  >
                    <AlertCircle
                      size={12}
                      style={{
                        color: '#F59E0B',
                        marginTop: 1,
                        flexShrink: 0,
                      }}
                    />
                    <p className="text-[11px]" style={{ color: '#D97706' }}>
                      If fewer than {MIN_MEMBERS} members have joined by the
                      start date, the circle will not start — MOVA will wait for
                      the minimum to be reached.
                    </p>
                  </div>
                )}
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
                    Check everything before creating your circle
                  </p>
                </div>
                <StepTourButton />
              </div>

              <div
                className="mb-5 overflow-hidden rounded-[20px] border p-5 text-center"
                style={{
                  backgroundColor: themeColors.circleLight,
                  borderColor: themeColors.circleMid,
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Banknote size={16} style={{ color: themeColors.circle }} />
                  <p
                    className="text-[12px] font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.circle }}
                  >
                    Round pool
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
                  {formatCurrency(totalPool)}
                </p>
                <p
                  className="mt-2 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  Each round, one member receives this
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
                <ReviewRow
                  icon={Tag}
                  label="Circle name"
                  value={form.name || '—'}
                  themeColors={themeColors}
                  showDivider
                />
                <ReviewRow
                  icon={LayoutGrid}
                  label="Category"
                  value={selectedCategory?.name ?? '—'}
                  themeColors={themeColors}
                  showDivider
                />
                {form.description && (
                  <ReviewRow
                    icon={FileText}
                    label="Description"
                    value={form.description}
                    themeColors={themeColors}
                    showDivider
                  />
                )}
                <ReviewRow
                  icon={Banknote}
                  label="Contribution"
                  value={`${formatCurrency(
                    contribution
                  )} / ${form.frequency.toLowerCase()}`}
                  themeColors={themeColors}
                  showDivider
                />
                {(form.frequency === 'Daily' ||
                  form.frequency === 'Weekly') &&
                  form.daysOfWeek.length > 0 && (
                    <ReviewRow
                      icon={Calendar}
                      label="Days"
                      value={form.daysOfWeek
                        .sort((a, b) => a - b)
                        .map(
                          (d) => DAYS_OF_WEEK.find((x) => x.value === d)?.label
                        )
                        .join(', ')}
                      themeColors={themeColors}
                      showDivider
                    />
                  )}
                {form.frequency === 'Monthly' &&
                  (form.datesOfMonth.length > 0 || form.isLastDayOfMonth) && (
                    <ReviewRow
                      icon={Calendar}
                      label="Dates"
                      value={[
                        ...form.datesOfMonth.sort((a, b) => a - b).map(String),
                        form.isLastDayOfMonth ? 'last day' : null,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                      themeColors={themeColors}
                      showDivider
                    />
                  )}
                <ReviewRow
                  icon={Users}
                  label="Members"
                  value={`${form.memberCount} total (you + ${
                    form.memberCount - 1
                  }) · ${form.memberCount} rounds`}
                  themeColors={themeColors}
                  showDivider
                />
                <ReviewRow
                  icon={Lock}
                  label="Security deposit"
                  value={deposit > 0 ? formatCurrency(deposit) : 'None'}
                  themeColors={themeColors}
                  showDivider
                />
                <ReviewRow
                  icon={Shield}
                  label="Penalty"
                  value={
                    form.enablePenalty && penalty > 0
                      ? `${formatCurrency(penalty)} · ${
                          form.penaltySource === 'deposit'
                            ? 'from deposit'
                            : 'added to contribution'
                        }`
                      : 'None'
                  }
                  themeColors={themeColors}
                  showDivider
                />
                <ReviewRow
                  icon={Clock}
                  label="Grace period"
                  value={`${form.gracePeriodHours}h`}
                  themeColors={themeColors}
                  showDivider
                />
                <ReviewRow
                  icon={Repeat}
                  label="Rotation"
                  value={
                    form.rotationStrategy === 'FixedOrder'
                      ? 'Fixed order'
                      : form.rotationStrategy === 'RandomDraw'
                      ? 'Random draw'
                      : 'Moderator sets order'
                  }
                  themeColors={themeColors}
                  showDivider
                />
                <ReviewRow
                  icon={form.inviteOnly ? Lock : Link2}
                  label="Join method"
                  value={
                    form.inviteOnly
                      ? 'Invite only'
                      : 'Anyone with link'
                  }
                  themeColors={themeColors}
                  showDivider
                />
                <ReviewRow
                  icon={Calendar}
                  label="Start date"
                  value={new Date(form.startDate).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  themeColors={themeColors}
                  showDivider
                />
                <ReviewRow
                  icon={Hourglass}
                  label="If not all joined by then"
                  value={
                    startPolicy === 'wait_for_all'
                      ? 'Wait until everyone joins'
                      : 'Start with joined members'
                  }
                  themeColors={themeColors}
                />
              </div>

              <div className="mt-4">
                <p
                  className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  Members invited ({members.length} of {form.memberCount - 1})
                </p>

                <div
                  className="overflow-hidden rounded-[16px] border"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.02)'
                      : '#FAFBFC',
                    borderColor: themeColors.border,
                  }}
                >
                  {/* Organizer row — always first */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 border-b"
                    style={{ borderColor: themeColors.border }}
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: themeColors.circle,
                        color: '#FFFFFF',
                      }}
                    >
                      1
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        You
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        Organizer · circle wallet auto-created
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(15, 185, 110, 0.15)'
                          : 'rgba(15, 185, 110, 0.1)',
                        color: themeColors.circle,
                      }}
                    >
                      Active
                    </span>
                  </div>

                  {members.length === 0 ? (
                    <div className="px-4 py-3 text-center">
                      <p
                        className="text-[12px]"
                        style={{ color: themeColors.mid }}
                      >
                        No other members yet — you'll get an invite code after
                        creating the circle to{' '}
                        {form.inviteOnly ? 'send to invitees' : 'share'}.
                      </p>
                    </div>
                  ) : (
                    <>
                      {members
                        .slice(
                          0,
                          showAllMembers
                            ? members.length
                            : MEMBER_LIST_PREVIEW_COUNT
                        )
                        .map((m, i) => {
                          const Icon = identifierIcon(m.identifierType)
                          const position =
                            form.rotationStrategy === 'RandomDraw' &&
                            !orderDrawn
                              ? '?'
                              : m.payoutPosition ?? i + 2
                          const visibleCount = showAllMembers
                            ? members.length
                            : Math.min(
                                members.length,
                                MEMBER_LIST_PREVIEW_COUNT
                              )
                          return (
                            <div
                              key={m.tempId}
                              className={`flex items-center gap-3 px-4 py-3 ${
                                i < visibleCount - 1 ? 'border-b' : ''
                              }`}
                              style={
                                i < visibleCount - 1
                                  ? { borderColor: themeColors.border }
                                  : undefined
                              }
                            >
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                                style={{
                                  backgroundColor: themeColors.circleLight,
                                  color: themeColors.circle,
                                }}
                              >
                                {position}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-[13px] font-semibold"
                                  style={{ color: themeColors.charcoal }}
                                >
                                  {m.displayName}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1">
                                  <Icon
                                    size={10}
                                    style={{ color: themeColors.mid }}
                                  />
                                  <p
                                    className="truncate text-[11px]"
                                    style={{ color: themeColors.mid }}
                                  >
                                    {m.identifier}
                                  </p>
                                </div>
                              </div>
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                                style={{
                                  backgroundColor: isDark
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : 'rgba(245, 158, 11, 0.1)',
                                  color: '#F59E0B',
                                }}
                              >
                                Invite pending
                              </span>
                            </div>
                          )
                        })}

                      {members.length > MEMBER_LIST_PREVIEW_COUNT && (
                        <button
                          type="button"
                          onClick={() => setShowAllMembers((v) => !v)}
                          className="flex w-full items-center justify-center gap-1.5 border-t py-2 text-[12px] font-semibold transition-all hover:opacity-80"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.charcoal,
                            backgroundColor: 'transparent',
                          }}
                        >
                          {showAllMembers
                            ? 'Show less'
                            : `Show all ${members.length} members`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div
                className="mt-4 flex items-start gap-3 rounded-[12px] border p-3"
                style={{
                  backgroundColor: themeColors.circleLight,
                  borderColor: themeColors.circleMid,
                }}
              >
                <Info
                  size={16}
                  style={{
                    color: themeColors.circle,
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-[12px] leading-[1.55]"
                  style={{ color: themeColors.charcoal }}
                >
                  Your circle will be created as a <strong>draft</strong>. A
                  separate circle wallet will be created for you, since you're
                  member #1. After creation you'll get an invite code to share.{' '}
                  {form.inviteOnly
                    ? 'Only members you invited can join.'
                    : 'Anyone with the code can join until the circle is full.'}{' '}
                  {startPolicy === 'wait_for_all'
                    ? 'The first round starts only after everyone has joined and the start date arrives.'
                    : 'The first round starts on the start date with whoever has joined.'}
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
                (currentStep === 2 && !form.categoryId) ||
                (currentStep === 2 && categories.length === 0)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: themeColors.circle,
                color: '#FFFFFF',
              }}
            >
              {currentStep === 5 && members.length === 0
                ? form.inviteOnly
                  ? 'Skip for now'
                  : 'Continue'
                : 'Continue'}
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenPinModal}
              disabled={isVerifyingPin}
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-6 py-3 text-[15px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{
                backgroundColor: themeColors.circle,
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
                  Create circle
                  {members.length > 0 &&
                    ` · send ${members.length} invite${
                      members.length === 1 ? '' : 's'
                    }`}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description="Enter your PIN to confirm creating this savings circle."
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
              backgroundColor: themeColors.circle,
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
                backgroundColor: themeColors.circleLight,
                color: themeColors.circle,
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
                      style={{ backgroundColor: themeColors.circle }}
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

/* ─────────── Review row helper ─────────── */

function ReviewRow({
  icon: Icon,
  label,
  value,
  themeColors,
  showDivider,
}: {
  icon: typeof Tag
  label: string
  value: string
  themeColors: typeof colors | typeof darkColors
  showDivider?: boolean
}) {
  return (
    <div
      className={`flex items-start justify-between px-4 py-3 ${
        showDivider ? 'border-b' : ''
      }`}
      style={showDivider ? { borderColor: themeColors.border } : undefined}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: themeColors.mid }} />
        <span className="text-[12px]" style={{ color: themeColors.mid }}>
          {label}
        </span>
      </div>
      <span
        className="ml-3 max-w-[60%] truncate text-right text-[13px] font-semibold"
        style={{ color: themeColors.charcoal }}
      >
        {value}
      </span>
    </div>
  )
}