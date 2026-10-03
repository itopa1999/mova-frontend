import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  AlertCircle,
  Info,
  Wallet,
  Lock,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  ChevronRight,
  XCircle,
  Clock,
  Plus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import PinModal from '../../components/ui/PinModal'

import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import { formatAmount, formatCurrency } from '../../utils/formatting'

/* ───────────── Types ───────────── */

interface WithdrawalSource {
  walletId: number
  walletName: string
  availableAmount: number
  lockedAmount: number
}

interface BankAccount {
  id: number
  bankName: string
  accountNumber: string
  accountName: string
}

interface DataPlan {
  code: string
  name: string
  amount: number
  validity: string
}

interface CablePackage {
  code: string
  name: string
  amount: number
}

interface Receipt {
  reference: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed'
  destination?: string
  description?: string
}

type Screen =
  | 'home'
  | 'bank-source'
  | 'bank-amount'
  | 'bank-destination'
  | 'bank-review'
  | 'bank-success'
  | 'utility-category'
  | 'utility-form'
  | 'utility-review'
  | 'utility-success'

type FlowType = 'bank' | 'airtime' | 'data' | 'cable' | 'electricity'

/* ───────────── Dummy data ───────────── */

const DUMMY_SOURCES: WithdrawalSource[] = [
  {
    walletId: 1,
    walletName: 'Emergency',
    availableAmount: 25000,
    lockedAmount: 0,
  },
  {
    walletId: 2,
    walletName: 'Salary',
    availableAmount: 40000,
    lockedAmount: 0,
  },
  {
    walletId: 3,
    walletName: 'Electricity',
    availableAmount: 15000,
    lockedAmount: 0,
  },
  {
    walletId: 4,
    walletName: 'Transport',
    availableAmount: 0,
    lockedAmount: 8000,
  },
  {
    walletId: 5,
    walletName: 'Rent',
    availableAmount: 0,
    lockedAmount: 120000,
  },
]

const DUMMY_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 1,
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'Lucky Okafor',
  },
  {
    id: 2,
    bankName: 'Access Bank',
    accountNumber: '0987654321',
    accountName: 'Lucky Okafor',
  },
  {
    id: 3,
    bankName: 'Kuda',
    accountNumber: '1122334455',
    accountName: 'Lucky Okafor',
  },
]

const DUMMY_DATA_PLANS: Record<string, DataPlan[]> = {
  mtn: [
    { code: 'mtn-1gb-1d', name: '1GB Daily', amount: 500, validity: '1 day' },
    { code: 'mtn-2gb-7d', name: '2GB Weekly', amount: 1500, validity: '7 days' },
    { code: 'mtn-10gb-30d', name: '10GB Monthly', amount: 5000, validity: '30 days' },
    { code: 'mtn-20gb-30d', name: '20GB Monthly', amount: 10000, validity: '30 days' },
  ],
  airtel: [
    { code: 'airtel-1gb-1d', name: '1GB Daily', amount: 500, validity: '1 day' },
    { code: 'airtel-3gb-7d', name: '3GB Weekly', amount: 2000, validity: '7 days' },
    { code: 'airtel-10gb-30d', name: '10GB Monthly', amount: 5000, validity: '30 days' },
  ],
  glo: [
    { code: 'glo-1gb-1d', name: '1GB Daily', amount: 450, validity: '1 day' },
    { code: 'glo-5gb-7d', name: '5GB Weekly', amount: 2500, validity: '7 days' },
    { code: 'glo-10gb-30d', name: '10GB Monthly', amount: 4500, validity: '30 days' },
  ],
  '9mobile': [
    { code: '9m-1gb-1d', name: '1GB Daily', amount: 500, validity: '1 day' },
    { code: '9m-2gb-7d', name: '2GB Weekly', amount: 1500, validity: '7 days' },
    { code: '9m-10gb-30d', name: '10GB Monthly', amount: 5000, validity: '30 days' },
  ],
}

const DUMMY_CABLE_PACKAGES: Record<string, CablePackage[]> = {
  DSTV: [
    { code: 'dstv-padi', name: 'Padi', amount: 4400 },
    { code: 'dstv-yanga', name: 'Yanga', amount: 6000 },
    { code: 'dstv-confam', name: 'Confam', amount: 11000 },
    { code: 'dstv-compact', name: 'Compact', amount: 19000 },
    { code: 'dstv-premium', name: 'Premium', amount: 44000 },
  ],
  GOtv: [
    { code: 'gotv-smallie', name: 'Smallie', amount: 1900 },
    { code: 'gotv-jinja', name: 'Jinja', amount: 3900 },
    { code: 'gotv-jolli', name: 'Jolli', amount: 5800 },
    { code: 'gotv-max', name: 'Max', amount: 8500 },
  ],
  Startimes: [
    { code: 'st-nova', name: 'Nova', amount: 1900 },
    { code: 'st-basic', name: 'Basic', amount: 3000 },
    { code: 'st-smart', name: 'Smart', amount: 4900 },
    { code: 'st-super', name: 'Super', amount: 9800 },
  ],
}

const NETWORKS = [
  { id: 'mtn', name: 'MTN', color: '#FFCB05' },
  { id: 'airtel', name: 'Airtel', color: '#E40000' },
  { id: 'glo', name: 'Glo', color: '#00A651' },
  { id: '9mobile', name: '9mobile', color: '#00A551' },
] as const

const ELECTRICITY_DISCOS = [
  'Ikeja Electric',
  'Eko Electricity',
  'Abuja Electricity',
  'Port Harcourt Electric',
  'Kano Electricity',
  'Enugu Electricity',
]

const UTILITY_CATEGORIES: {
  id: FlowType
  label: string
  description: string
  icon: typeof Smartphone
  color: string
}[] = [
  {
    id: 'airtime',
    label: 'Airtime',
    description: 'Top up any Nigerian network',
    icon: Smartphone,
    color: '#4ADE80',
  },
  {
    id: 'data',
    label: 'Data',
    description: 'Buy mobile data bundles',
    icon: Wifi,
    color: '#60A5FA',
  },
  {
    id: 'cable',
    label: 'Cable TV',
    description: 'DSTV, GOtv, Startimes',
    icon: Tv,
    color: '#A78BFA',
  },
  {
    id: 'electricity',
    label: 'Electricity',
    description: 'Pay any disco meter',
    icon: Zap,
    color: '#FBBF24',
  },
]

/* ───────────── Component ───────────── */

export default function WithdrawalPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const infoSheet = useBottomSheet<'lockedNote'>()

  const [screen, setScreen] = useState<Screen>('home')
  const [flowType, setFlowType] = useState<FlowType>('bank')

  const [selectedSource, setSelectedSource] = useState<WithdrawalSource | null>(null)
  const [amount, setAmount] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

  const [network, setNetwork] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null)
  const [cableProvider, setCableProvider] = useState('')
  const [smartcard, setSmartcard] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<CablePackage | null>(null)
  const [disco, setDisco] = useState('')
  const [meterNumber, setMeterNumber] = useState('')
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  // PIN state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pinAction, setPinAction] = useState<'bank' | 'utility' | null>(null)

  const sources = DUMMY_SOURCES
  const bankAccounts = DUMMY_BANK_ACCOUNTS

  const availableSources = useMemo(
    () => sources.filter((s) => s.availableAmount > 0),
    [sources]
  )

  const totalAvailable = useMemo(
    () => availableSources.reduce((sum, s) => sum + s.availableAmount, 0),
    [availableSources]
  )

  const lockedSources = useMemo(
    () => sources.filter((s) => s.availableAmount === 0 && s.lockedAmount > 0),
    [sources]
  )

  const resetFlow = () => {
    setSelectedSource(null)
    setAmount('')
    setSelectedAccount(null)
    setNetwork('')
    setPhone('')
    setSelectedPlan(null)
    setCableProvider('')
    setSmartcard('')
    setSelectedPackage(null)
    setDisco('')
    setMeterNumber('')
    setMeterType('prepaid')
    setError(null)
    setReceipt(null)
    setPinAction(null)
  }

  const goBack = () => {
    setError(null)
    if (screen === 'home') {
      navigate(-1)
      return
    }
    if (screen === 'bank-source' || screen === 'utility-category') {
      setScreen('home')
      return
    }
    if (screen === 'bank-amount') {
      setScreen('bank-source')
      return
    }
    if (screen === 'bank-destination') {
      setScreen('bank-amount')
      return
    }
    if (screen === 'bank-review') {
      setScreen('bank-destination')
      return
    }
    if (screen === 'utility-form') {
      setScreen('utility-category')
      return
    }
    if (screen === 'utility-review') {
      setScreen('utility-form')
      return
    }
    if (screen === 'bank-success' || screen === 'utility-success') {
      resetFlow()
      setScreen('home')
      return
    }
    setScreen('home')
  }

  const startBankFlow = () => {
    resetFlow()
    setFlowType('bank')
    setScreen('bank-source')
  }

  const startUtilityFlow = () => {
    resetFlow()
    setScreen('utility-category')
  }

  const pickUtility = (type: FlowType) => {
    setFlowType(type)
    setScreen('utility-form')
  }

  const amountNumeric = parseInt(amount || '0', 10)
  const exceedsAvailable =
    selectedSource !== null && amountNumeric > selectedSource.availableAmount

  const generateRef = () =>
    'MVA' + Math.random().toString(36).substring(2, 10).toUpperCase()

  /* ─── Transaction submission (called after PIN) ─── */

  const submitBank = async () => {
    if (!selectedSource || !selectedAccount) return

    await new Promise((r) => setTimeout(r, 1200))

    setReceipt({
      reference: generateRef(),
      amount: amountNumeric,
      status: 'completed',
      destination: `${selectedAccount.bankName} ••••${selectedAccount.accountNumber.slice(-4)}`,
    })
    setScreen('bank-success')
  }

  const submitUtility = async () => {
    if (!selectedSource) return

    await new Promise((r) => setTimeout(r, 1200))

    let description = ''
    let amt = amountNumeric

    if (flowType === 'airtime') {
      description = `${network.toUpperCase()} ₦${amountNumeric.toLocaleString()} to ${phone}`
    } else if (flowType === 'data' && selectedPlan) {
      description = `${network.toUpperCase()} ${selectedPlan.name} to ${phone}`
      amt = selectedPlan.amount
    } else if (flowType === 'cable' && selectedPackage) {
      description = `${cableProvider} ${selectedPackage.name} · ${smartcard.slice(-4)}`
      amt = selectedPackage.amount
    } else if (flowType === 'electricity') {
      description = `${disco} · meter ••••${meterNumber.slice(-4)}`
    }

    setReceipt({
      reference: generateRef(),
      amount: amt,
      status: 'completed',
      description,
    })
    setScreen('utility-success')
  }

  /* ─── Handlers that open the PIN modal ─── */

  const handleBankSubmit = () => {
    if (!selectedSource || !selectedAccount) return
    setError(null)
    setPinAction('bank')
    setIsPinModalOpen(true)
  }

  const handleUtilitySubmit = () => {
    if (!selectedSource) return
    setError(null)
    setPinAction('utility')
    setIsPinModalOpen(true)
  }

  /* ─── PIN verification → routes to the right submit ─── */

  const handlePinVerification = async (_pin: string) => {
    // TODO: replace with real PIN verification
    // const pinResponse = await verifyPin({ pin: _pin, platform: 'web' })
    // if (!pinResponse.is_success) {
    //   throw new Error(pinResponse.message || 'Invalid PIN. Please try again.')
    // }

    setIsSubmitting(true)
    setError(null)

    try {
      if (pinAction === 'bank') {
        await submitBank()
      } else if (pinAction === 'utility') {
        await submitUtility()
      }
      setIsPinModalOpen(false)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'

      setError(message)

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message },
        })
      )

      throw err
    } finally {
      setIsSubmitting(false)
      setPinAction(null)
    }
  }

  const fee = 0
  const totalDeducted = amountNumeric + fee

  // The amount shown in the PIN modal description
  const pinAmount =
    pinAction === 'utility'
      ? flowType === 'data' && selectedPlan
        ? selectedPlan.amount
        : flowType === 'cable' && selectedPackage
        ? selectedPackage.amount
        : amountNumeric
      : amountNumeric

  return (
    <AppLayout>
      <div className="py-5">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <div className="flex-1">
            <h1
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              {screen === 'home' ? 'Withdraw' : 'Money Out'}
            </h1>
            {screen === 'home' && (
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Use money that has become available
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => infoSheet.open('lockedNote')}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70"
            style={{
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.04)',
              color: themeColors.mid,
            }}
            aria-label="How availability works"
          >
            <Info size={14} strokeWidth={2.4} />
          </button>
        </div>

        {/* ───────────── HOME ───────────── */}
        {screen === 'home' && (
          <>
            <section
              className="mb-5 rounded-[20px] p-5"
              style={{ backgroundColor: themeColors.green, color: '#FFFFFF' }}
            >
              <p
                className="text-[12px]"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Total available to withdraw
              </p>
              <p
                className="mt-1 font-bold tracking-[-0.02em]"
                style={{
                  fontSize: '36px',
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(totalAvailable)}
              </p>
              <p
                className="mt-2 text-[12px]"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                Across {availableSources.length}{' '}
                {availableSources.length === 1 ? 'wallet' : 'wallets'}
              </p>
            </section>

            <section className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={startBankFlow}
                disabled={availableSources.length === 0}
                className="flex flex-col items-start rounded-[16px] border p-4 text-left transition-all hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.15)'
                      : 'rgba(15, 185, 110, 0.08)',
                    color: themeColors.green,
                  }}
                >
                  <Banknote size={22} strokeWidth={2} />
                </div>
                <p
                  className="text-[14px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Bank
                </p>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Transfer to your account
                </p>
              </button>

              <button
                type="button"
                onClick={startUtilityFlow}
                disabled={availableSources.length === 0}
                className="flex flex-col items-start rounded-[16px] border p-4 text-left transition-all hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(96, 165, 250, 0.15)'
                      : 'rgba(96, 165, 250, 0.08)',
                    color: '#60A5FA',
                  }}
                >
                  <Zap size={22} strokeWidth={2} />
                </div>
                <p
                  className="text-[14px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Utilities
                </p>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Airtime, data, bills
                </p>
              </button>
            </section>

            <section className="mb-5">
              <div className="mb-3 flex items-center justify-between">
                <p
                  className="text-[15px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  Money available
                </p>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.2)'
                      : 'rgba(15, 185, 110, 0.1)',
                    color: themeColors.green,
                  }}
                >
                  {availableSources.length}
                </span>
              </div>

              {availableSources.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-[16px] border p-8 text-center"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(156, 163, 175, 0.15)'
                        : 'rgba(156, 163, 175, 0.08)',
                      color: themeColors.mid,
                    }}
                  >
                    <Wallet size={22} strokeWidth={1.5} />
                  </div>
                  <p
                    className="mt-3 text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Nothing available yet
                  </p>
                  <p
                    className="mt-1 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Money from your wallets will show up here when released
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {availableSources.map((source) => (
                    <div
                      key={source.walletId}
                      className="flex items-center justify-between rounded-[14px] border p-3.5"
                      style={{
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(15, 185, 110, 0.15)'
                              : 'rgba(15, 185, 110, 0.08)',
                            color: themeColors.green,
                          }}
                        >
                          <Wallet size={18} strokeWidth={2} />
                        </div>
                        <div>
                          <p
                            className="text-[13px] font-semibold"
                            style={{ color: themeColors.charcoal }}
                          >
                            {source.walletName}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: themeColors.mid }}
                          >
                            Available
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-[15px] font-bold"
                        style={{
                          color: themeColors.green,
                          fontFamily:
                            "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                        }}
                      >
                        {formatCurrency(source.availableAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {lockedSources.length > 0 && (
              <section>
                <div
                  className="rounded-[16px] border p-4"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.06)'
                      : 'rgba(245, 158, 11, 0.04)',
                    borderColor: isDark
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(245, 158, 11, 0.12)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(245, 158, 11, 0.08)',
                        color: '#F59E0B',
                      }}
                    >
                      <Lock size={16} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        Still locked
                      </p>
                      <p
                        className="mt-0.5 text-[11px] leading-[1.5]"
                        style={{ color: themeColors.mid }}
                      >
                        {lockedSources.length}{' '}
                        {lockedSources.length === 1
                          ? 'wallet has'
                          : 'wallets have'}{' '}
                        money waiting on their release schedule. They'll appear
                        here automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* ───────────── BANK: SOURCE ───────────── */}
        {screen === 'bank-source' && (
          <>
            <p className="mb-3 text-[13px]" style={{ color: themeColors.mid }}>
              Which wallet should this come from?
            </p>
            <div className="space-y-2.5">
              {availableSources.map((source) => (
                <button
                  key={source.walletId}
                  type="button"
                  onClick={() => {
                    setSelectedSource(source)
                    setScreen('bank-amount')
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[14px] border p-4 transition-all hover:opacity-80 active:scale-[0.98]"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(15, 185, 110, 0.15)'
                          : 'rgba(15, 185, 110, 0.08)',
                        color: themeColors.green,
                      }}
                    >
                      <Wallet size={18} strokeWidth={2} />
                    </div>
                    <div className="text-left">
                      <p
                        className="text-[14px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {source.walletName}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        {formatCurrency(source.availableAmount)} available
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: themeColors.mid }} />
                </button>
              ))}
            </div>
          </>
        )}

        {/* ───────────── BANK: AMOUNT ───────────── */}
        {screen === 'bank-amount' && selectedSource && (
          <>
            <div
              className="mb-4 rounded-[14px] border p-3.5"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <p className="text-[11px]" style={{ color: themeColors.mid }}>
                From
              </p>
              <div className="mt-1 flex items-center justify-between">
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  {selectedSource.walletName}
                </p>
                <p
                  className="text-[13px] font-bold"
                  style={{ color: themeColors.green }}
                >
                  {formatCurrency(selectedSource.availableAmount)}
                </p>
              </div>
            </div>

            <label
              className="mb-2 block text-[13px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Amount (₦)
            </label>
            <div
              className="flex items-center rounded-[14px] border px-4 py-3"
              style={{
                backgroundColor: themeColors.card,
                borderColor: exceedsAvailable
                  ? themeColors.red
                  : themeColors.border,
              }}
            >
              <span
                className="text-[20px] font-bold"
                style={{ color: themeColors.mid }}
              >
                ₦
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^0-9]/g, ''))
                  setError(null)
                }}
                placeholder="0"
                className="ml-2 w-full bg-transparent text-[20px] font-bold outline-none"
                style={{ color: themeColors.charcoal }}
                autoFocus
              />
            </div>
            {amount && !exceedsAvailable && (
              <p
                className="mt-1 text-right text-[12px]"
                style={{ color: themeColors.mid }}
              >
                ₦{formatAmount(amount)}
              </p>
            )}
            {exceedsAvailable && (
              <p className="mt-2 text-[12px]" style={{ color: themeColors.red }}>
                Amount exceeds {formatCurrency(selectedSource.availableAmount)}{' '}
                available in this wallet.
              </p>
            )}

            <div className="mt-6">
              <Button
                type="button"
                disabled={!amount || amountNumeric <= 0 || exceedsAvailable}
                onClick={() => setScreen('bank-destination')}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* ───────────── BANK: DESTINATION ───────────── */}
        {screen === 'bank-destination' && (
          <>
            <p className="mb-3 text-[13px]" style={{ color: themeColors.mid }}>
              Where should we send the money?
            </p>

            <div className="space-y-2.5">
              {bankAccounts.map((account) => {
                const isSelected = selectedAccount?.id === account.id
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedAccount(account)}
                    className="flex w-full cursor-pointer items-center justify-between rounded-[14px] border p-4 text-left transition-all hover:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(74, 222, 128, 0.08)'
                          : 'rgba(15, 151, 61, 0.06)'
                        : themeColors.card,
                      borderColor: isSelected
                        ? themeColors.green
                        : themeColors.border,
                      borderWidth: isSelected ? '2px' : '1px',
                    }}
                  >
                    <div>
                      <p
                        className="text-[14px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {account.bankName}
                      </p>
                      <p
                        className="mt-0.5 text-[12px]"
                        style={{ color: themeColors.mid }}
                      >
                        ••••{account.accountNumber.slice(-4)} ·{' '}
                        {account.accountName}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle
                        size={20}
                        style={{ color: themeColors.green }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => navigate('/bank')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed py-3 text-[13px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.green,
                color: themeColors.green,
              }}
            >
              <Plus size={16} strokeWidth={2.4} />
              Add a new bank account
            </button>

            <div className="mt-6">
              <Button
                type="button"
                disabled={!selectedAccount}
                onClick={() => setScreen('bank-review')}
              >
                Review
              </Button>
            </div>
          </>
        )}

        {/* ───────────── BANK: REVIEW ───────────── */}
        {screen === 'bank-review' && selectedSource && selectedAccount && (
          <>
            <div
              className="rounded-[16px] border p-5"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(15, 185, 110, 0.15)'
                      : 'rgba(15, 185, 110, 0.08)',
                    color: themeColors.green,
                  }}
                >
                  <Banknote size={20} strokeWidth={2} />
                </div>
                <div>
                  <p
                    className="text-[15px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Withdraw to bank
                  </p>
                  <p className="text-[11px]" style={{ color: themeColors.mid }}>
                    Review before confirming
                  </p>
                </div>
              </div>

              <ReviewRow
                label="Source"
                value={selectedSource.walletName}
                themeColors={themeColors}
              />
              <ReviewRow
                label="Amount"
                value={formatCurrency(amountNumeric)}
                themeColors={themeColors}
              />
              <ReviewRow
                label="Fee"
                value={fee === 0 ? 'Free' : formatCurrency(fee)}
                themeColors={themeColors}
              />
              <ReviewRow
                label="Destination"
                value={`${selectedAccount.bankName} ••••${selectedAccount.accountNumber.slice(-4)}`}
                themeColors={themeColors}
              />
              <div
                className="mt-3 border-t pt-3"
                style={{ borderColor: themeColors.border }}
              >
                <ReviewRow
                  label="Total deducted"
                  value={formatCurrency(totalDeducted)}
                  themeColors={themeColors}
                  bold
                />
                <ReviewRow
                  label="You'll receive"
                  value={formatCurrency(amountNumeric - fee)}
                  themeColors={themeColors}
                  bold
                  highlight
                />
              </div>
            </div>

            {error && (
              <div
                className="mt-4 flex items-start gap-2 rounded-[12px] px-3.5 py-3"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(239, 68, 68, 0.06)',
                }}
              >
                <AlertCircle
                  size={14}
                  style={{ color: '#EF4444', marginTop: 1, flexShrink: 0 }}
                />
                <p className="text-[12px]" style={{ color: '#EF4444' }}>
                  {error}
                </p>
              </div>
            )}

            <div className="mt-6">
              <Button
                type="button"
                onClick={handleBankSubmit}
                loading={isSubmitting}
                loadingText="Processing..."
              >
                Confirm withdrawal
              </Button>
            </div>
          </>
        )}

        {/* ───────────── BANK: SUCCESS ───────────── */}
        {screen === 'bank-success' && receipt && (
          <SuccessView
            title="Withdrawal successful"
            subtitle={`${formatCurrency(receipt.amount)} sent to ${receipt.destination}`}
            reference={receipt.reference}
            status={receipt.status}
            themeColors={themeColors}
            isDark={isDark}
            onDone={() => {
              resetFlow()
              setScreen('home')
            }}
            onViewTransactions={() => navigate('/transactions')}
          />
        )}

        {/* ───────────── UTILITY: CATEGORY ───────────── */}
        {screen === 'utility-category' && (
          <>
            <p className="mb-3 text-[13px]" style={{ color: themeColors.mid }}>
              What would you like to pay for?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {UTILITY_CATEGORIES.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => pickUtility(cat.id)}
                    className="flex flex-col items-start rounded-[16px] border p-4 text-left transition-all hover:opacity-80 active:scale-[0.98]"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div
                      className="mb-3 flex h-11 w-11 items-center justify-center rounded-[12px]"
                      style={{
                        backgroundColor: isDark
                          ? `${cat.color}33`
                          : `${cat.color}1A`,
                        color: cat.color,
                      }}
                    >
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {cat.label}
                    </p>
                    <p
                      className="mt-0.5 text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      {cat.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ───────────── UTILITY: FORM ───────────── */}
        {screen === 'utility-form' && (
          <UtilityForm
            flowType={flowType}
            themeColors={themeColors}
            isDark={isDark}
            sources={availableSources}
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            network={network}
            setNetwork={setNetwork}
            phone={phone}
            setPhone={setPhone}
            amount={amount}
            setAmount={setAmount}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            cableProvider={cableProvider}
            setCableProvider={setCableProvider}
            smartcard={smartcard}
            setSmartcard={setSmartcard}
            selectedPackage={selectedPackage}
            setSelectedPackage={setSelectedPackage}
            disco={disco}
            setDisco={setDisco}
            meterNumber={meterNumber}
            setMeterNumber={setMeterNumber}
            meterType={meterType}
            setMeterType={setMeterType}
            error={error}
            setError={setError}
            onContinue={() => setScreen('utility-review')}
            formatCurrency={formatCurrency}
          />
        )}

        {/* ───────────── UTILITY: REVIEW ───────────── */}
        {screen === 'utility-review' && selectedSource && (
          <UtilityReview
            flowType={flowType}
            themeColors={themeColors}
            isDark={isDark}
            selectedSource={selectedSource}
            amount={
              flowType === 'data' && selectedPlan
                ? selectedPlan.amount
                : flowType === 'cable' && selectedPackage
                ? selectedPackage.amount
                : amountNumeric
            }
            network={network}
            phone={phone}
            selectedPlan={selectedPlan}
            cableProvider={cableProvider}
            smartcard={smartcard}
            selectedPackage={selectedPackage}
            disco={disco}
            meterNumber={meterNumber}
            meterType={meterType}
            fee={fee}
            isSubmitting={isSubmitting}
            onSubmit={handleUtilitySubmit}
            formatCurrency={formatCurrency}
          />
        )}

        {/* ───────────── UTILITY: SUCCESS ───────────── */}
        {screen === 'utility-success' && receipt && (
          <SuccessView
            title="Payment successful"
            subtitle={receipt.description ?? 'Your bill has been paid'}
            reference={receipt.reference}
            status={receipt.status}
            themeColors={themeColors}
            isDark={isDark}
            onDone={() => {
              resetFlow()
              setScreen('home')
            }}
            onViewTransactions={() => navigate('/transactions')}
          />
        )}
      </div>

      {/* ───────────── Info BottomSheet ───────────── */}
      <BottomSheet
        isOpen={infoSheet.activeSheet !== null}
        onClose={infoSheet.close}
        title="How availability works"
        icon={<Info size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={infoSheet.close}
            className="w-full cursor-pointer rounded-[12px] px-4 py-3 text-[14px] font-semibold"
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
            Only money that has been released from your MOVA wallets can be
            withdrawn or used to pay bills. Money still following a release
            schedule stays locked until its turn.
          </p>
          <div className="mt-4 space-y-3">
            <InfoRow
              icon={Wallet}
              title="Available"
              desc="Ready to withdraw or use right now."
              themeColors={themeColors}
              isDark={isDark}
            />
            <InfoRow
              icon={Clock}
              title="Scheduled"
              desc="Released on its own schedule — shows up here automatically."
              themeColors={themeColors}
              isDark={isDark}
            />
            <InfoRow
              icon={Lock}
              title="Locked"
              desc="Still being controlled by a MOVA rule and cannot be moved yet."
              themeColors={themeColors}
              isDark={isDark}
            />
          </div>
        </div>
      </BottomSheet>

      {/* ───────────── PIN Modal ───────────── */}
      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description={
          pinAction === 'bank'
            ? `Enter your PIN to withdraw ${formatCurrency(
                amountNumeric
              )} to your bank account.`
            : `Enter your PIN to confirm this payment of ${formatCurrency(
                pinAmount
              )}.`
        }
        onClose={() => {
          setIsPinModalOpen(false)
          setPinAction(null)
        }}
        onVerify={handlePinVerification}
        isLoading={isSubmitting}
        maxLength={6}
      />
    </AppLayout>
  )
}

/* ────────────────────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────────────────────── */

function ReviewRow({
  label,
  value,
  themeColors,
  bold,
  highlight,
}: {
  label: string
  value: string
  themeColors: typeof colors | typeof darkColors
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[12px]" style={{ color: themeColors.mid }}>
        {label}
      </span>
      <span
        className={bold ? 'text-[14px] font-bold' : 'text-[13px] font-semibold'}
        style={{
          color: highlight ? themeColors.green : themeColors.charcoal,
          fontFamily: bold
            ? "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
            : undefined,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  title,
  desc,
  themeColors,
  isDark,
}: {
  icon: typeof Wallet
  title: string
  desc: string
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
}) {
  return (
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
        <Icon size={15} strokeWidth={2.2} />
      </div>
      <div>
        <p
          className="text-[13px] font-semibold"
          style={{ color: themeColors.charcoal }}
        >
          {title}
        </p>
        <p className="mt-0.5 text-[12px] leading-[1.55]">{desc}</p>
      </div>
    </div>
  )
}

function SuccessView({
  title,
  subtitle,
  reference,
  status,
  themeColors,
  isDark,
  onDone,
  onViewTransactions,
}: {
  title: string
  subtitle: string
  reference: string
  status: string
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
  onDone: () => void
  onViewTransactions: () => void
}) {
  const statusColor =
    status === 'completed'
      ? themeColors.green
      : status === 'pending' || status === 'processing'
      ? '#F59E0B'
      : status === 'reversed'
      ? '#9CA3AF'
      : '#EF4444'

  const StatusIcon =
    status === 'completed'
      ? CheckCircle
      : status === 'pending' || status === 'processing'
      ? Clock
      : status === 'reversed'
      ? XCircle
      : AlertCircle

  return (
    <>
      <section className="flex flex-col items-center py-8 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            backgroundColor: isDark ? `${statusColor}26` : `${statusColor}1A`,
          }}
        >
          <StatusIcon size={40} strokeWidth={2} style={{ color: statusColor }} />
        </div>

        <h2
          className="mt-5 text-[20px] font-extrabold tracking-[-0.02em]"
          style={{ color: themeColors.charcoal }}
        >
          {title}
        </h2>

        <p
          className="mt-2 max-w-[320px] text-[13px] leading-[1.6]"
          style={{ color: themeColors.mid }}
        >
          {subtitle}
        </p>

        <div
          className="mt-5 w-full max-w-[340px] rounded-[14px] border p-3"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: themeColors.mid }}>
              Reference
            </span>
            <span
              className="text-[12px] font-semibold"
              style={{ color: themeColors.charcoal, fontFamily: 'monospace' }}
            >
              {reference}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px]" style={{ color: themeColors.mid }}>
              Status
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
              }}
            >
              {status}
            </span>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <Button type="button" onClick={onDone}>
          Done
        </Button>
        <button
          type="button"
          onClick={onViewTransactions}
          className="w-full cursor-pointer rounded-[14px] border py-3 text-[13px] font-semibold transition-all hover:opacity-70"
          style={{
            borderColor: themeColors.border,
            color: themeColors.charcoal,
            backgroundColor: 'transparent',
          }}
        >
          View transaction history
        </button>
      </div>
    </>
  )
}

/* ─────────── Utility Form ─────────── */

function UtilityForm(props: {
  flowType: FlowType
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
  sources: WithdrawalSource[]
  selectedSource: WithdrawalSource | null
  setSelectedSource: (s: WithdrawalSource) => void
  network: string
  setNetwork: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  amount: string
  setAmount: (v: string) => void
  selectedPlan: DataPlan | null
  setSelectedPlan: (p: DataPlan) => void
  cableProvider: string
  setCableProvider: (v: string) => void
  smartcard: string
  setSmartcard: (v: string) => void
  selectedPackage: CablePackage | null
  setSelectedPackage: (p: CablePackage) => void
  disco: string
  setDisco: (v: string) => void
  meterNumber: string
  setMeterNumber: (v: string) => void
  meterType: 'prepaid' | 'postpaid'
  setMeterType: (v: 'prepaid' | 'postpaid') => void
  error: string | null
  setError: (v: string | null) => void
  onContinue: () => void
  formatCurrency: (n: number) => string
}) {
  const {
    flowType,
    themeColors,
    isDark,
    sources,
    selectedSource,
    setSelectedSource,
    network,
    setNetwork,
    phone,
    setPhone,
    amount,
    setAmount,
    selectedPlan,
    setSelectedPlan,
    cableProvider,
    setCableProvider,
    smartcard,
    setSmartcard,
    selectedPackage,
    setSelectedPackage,
    disco,
    setDisco,
    meterNumber,
    setMeterNumber,
    meterType,
    setMeterType,
    error,
    setError,
    onContinue,
    formatCurrency,
  } = props

  const dataPlans = network ? DUMMY_DATA_PLANS[network] ?? [] : []
  const cablePackages = cableProvider
    ? DUMMY_CABLE_PACKAGES[cableProvider] ?? []
    : []

  const amountNumeric = parseInt(amount || '0', 10)
  const exceedsAvailable =
    selectedSource !== null && amountNumeric > selectedSource.availableAmount

  const canContinue = (() => {
    if (!selectedSource) return false
    if (flowType === 'airtime')
      return !!network && /^\d{11}$/.test(phone) && amountNumeric >= 50
    if (flowType === 'data')
      return !!network && /^\d{11}$/.test(phone) && !!selectedPlan
    if (flowType === 'cable')
      return !!cableProvider && smartcard.length >= 6 && !!selectedPackage
    if (flowType === 'electricity')
      return !!disco && meterNumber.length >= 6 && amountNumeric >= 500
    return false
  })()

  const inputStyle = {
    backgroundColor: themeColors.card,
    borderColor: themeColors.border,
  }
  const textStyle = { color: themeColors.charcoal }

  return (
    <>
      {error && (
        <div
          className="mb-4 flex items-start gap-2 rounded-[12px] px-3.5 py-3"
          style={{
            backgroundColor: isDark
              ? 'rgba(239, 68, 68, 0.1)'
              : 'rgba(239, 68, 68, 0.06)',
            color: themeColors.red,
          }}
        >
          <AlertCircle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
          <p className="text-[12px] leading-[1.5]">{error}</p>
        </div>
      )}

      {/* Network (airtime / data) */}
      {(flowType === 'airtime' || flowType === 'data') && (
        <div className="mb-4">
          <label
            className="mb-2 block text-[13px] font-semibold"
            style={textStyle}
          >
            Network
          </label>
          <div className="grid grid-cols-4 gap-2">
            {NETWORKS.map((n) => {
              const isSelected = network === n.id
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setNetwork(n.id)
                    setSelectedPlan(null as unknown as DataPlan)
                    setError(null)
                  }}
                  className="rounded-[10px] border py-2 text-[12px] font-bold transition-all hover:opacity-80"
                  style={{
                    backgroundColor: isSelected
                      ? n.color + '20'
                      : themeColors.card,
                    borderColor: isSelected ? n.color : themeColors.border,
                    borderWidth: isSelected ? '2px' : '1px',
                    color: isSelected ? n.color : themeColors.charcoal,
                  }}
                >
                  {n.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Phone (airtime / data) */}
      {(flowType === 'airtime' || flowType === 'data') && (
        <div className="mb-4">
          <label
            className="mb-2 block text-[13px] font-semibold"
            style={textStyle}
          >
            Phone number
          </label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, ''))
              setError(null)
            }}
            placeholder="0801 234 5678"
            className="w-full rounded-[12px] border px-4 py-3 text-[15px] outline-none"
            style={{ ...inputStyle, ...textStyle }}
          />
        </div>
      )}

      {/* Data plan */}
      {flowType === 'data' && network && (
        <div className="mb-4">
          <label
            className="mb-2 block text-[13px] font-semibold"
            style={textStyle}
          >
            Data plan
          </label>
          <div className="space-y-2">
            {dataPlans.map((plan) => {
              const isSelected = selectedPlan?.code === plan.code
              return (
                <button
                  key={plan.code}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[12px] border px-4 py-3 text-left transition-all hover:opacity-80"
                  style={{
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(74, 222, 128, 0.08)'
                        : 'rgba(15, 151, 61, 0.06)'
                      : themeColors.card,
                    borderColor: isSelected
                      ? themeColors.green
                      : themeColors.border,
                    borderWidth: isSelected ? '2px' : '1px',
                  }}
                >
                  <div>
                    <p className="text-[13px] font-semibold" style={textStyle}>
                      {plan.name}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      {plan.validity}
                    </p>
                  </div>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: themeColors.green }}
                  >
                    {formatCurrency(plan.amount)}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Cable */}
      {flowType === 'cable' && (
        <>
          <div className="mb-4">
            <label
              className="mb-2 block text-[13px] font-semibold"
              style={textStyle}
            >
              Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['DSTV', 'GOtv', 'Startimes'].map((p) => {
                const isSelected = cableProvider === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setCableProvider(p)
                      setSelectedPackage(null as unknown as CablePackage)
                    }}
                    className="rounded-[10px] border py-2 text-[12px] font-bold transition-all hover:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(74, 222, 128, 0.08)'
                          : 'rgba(15, 151, 61, 0.06)'
                        : themeColors.card,
                      borderColor: isSelected
                        ? themeColors.green
                        : themeColors.border,
                      borderWidth: isSelected ? '2px' : '1px',
                      color: isSelected
                        ? themeColors.green
                        : themeColors.charcoal,
                    }}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-[13px] font-semibold"
              style={textStyle}
            >
              Smartcard / IUC number
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={smartcard}
              onChange={(e) => {
                setSmartcard(e.target.value.replace(/\D/g, ''))
                setError(null)
              }}
              placeholder="Enter your card number"
              className="w-full rounded-[12px] border px-4 py-3 text-[15px] outline-none"
              style={{ ...inputStyle, ...textStyle }}
            />
          </div>

          {cableProvider && cablePackages.length > 0 && (
            <div className="mb-4">
              <label
                className="mb-2 block text-[13px] font-semibold"
                style={textStyle}
              >
                Package
              </label>
              <div className="space-y-2">
                {cablePackages.map((pkg) => {
                  const isSelected = selectedPackage?.code === pkg.code
                  return (
                    <button
                      key={pkg.code}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-[12px] border px-4 py-3 text-left transition-all hover:opacity-80"
                      style={{
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(74, 222, 128, 0.08)'
                            : 'rgba(15, 151, 61, 0.06)'
                          : themeColors.card,
                        borderColor: isSelected
                          ? themeColors.green
                          : themeColors.border,
                        borderWidth: isSelected ? '2px' : '1px',
                      }}
                    >
                      <p className="text-[13px] font-semibold" style={textStyle}>
                        {pkg.name}
                      </p>
                      <p
                        className="text-[14px] font-bold"
                        style={{ color: themeColors.green }}
                      >
                        {formatCurrency(pkg.amount)}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Electricity */}
      {flowType === 'electricity' && (
        <>
          <div className="mb-4">
            <label
              className="mb-2 block text-[13px] font-semibold"
              style={textStyle}
            >
              Electricity provider
            </label>
            <select
              value={disco}
              onChange={(e) => {
                setDisco(e.target.value)
                setError(null)
              }}
              className="w-full rounded-[12px] border px-4 py-3 text-[15px] outline-none"
              style={{ ...inputStyle, ...textStyle }}
            >
              <option value="">Select your disco</option>
              {ELECTRICITY_DISCOS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-[13px] font-semibold"
              style={textStyle}
            >
              Meter type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['prepaid', 'postpaid'] as const).map((t) => {
                const isSelected = meterType === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMeterType(t)}
                    className="rounded-[10px] border py-2 text-[12px] font-bold capitalize transition-all hover:opacity-80"
                    style={{
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(74, 222, 128, 0.08)'
                          : 'rgba(15, 151, 61, 0.06)'
                        : themeColors.card,
                      borderColor: isSelected
                        ? themeColors.green
                        : themeColors.border,
                      borderWidth: isSelected ? '2px' : '1px',
                      color: isSelected
                        ? themeColors.green
                        : themeColors.charcoal,
                    }}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block text-[13px] font-semibold"
              style={textStyle}
            >
              Meter number
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={meterNumber}
              onChange={(e) => {
                setMeterNumber(e.target.value.replace(/\D/g, ''))
                setError(null)
              }}
              placeholder="Enter your meter number"
              className="w-full rounded-[12px] border px-4 py-3 text-[15px] outline-none"
              style={{ ...inputStyle, ...textStyle }}
            />
          </div>
        </>
      )}

      {/* Amount (airtime / electricity) */}
      {(flowType === 'airtime' || flowType === 'electricity') && (
        <div className="mb-4">
          <label
            className="mb-2 block text-[13px] font-semibold"
            style={textStyle}
          >
            Amount (₦)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9]/g, ''))
              setError(null)
            }}
            placeholder="0"
            className="w-full rounded-[12px] border px-4 py-3 text-[15px] font-bold outline-none"
            style={{
              ...inputStyle,
              borderColor: exceedsAvailable
                ? themeColors.red
                : themeColors.border,
              ...textStyle,
            }}
          />
          {exceedsAvailable && (
            <p
              className="mt-1.5 text-[11px]"
              style={{ color: themeColors.red }}
            >
              Exceeds available in {selectedSource?.walletName}
            </p>
          )}
        </div>
      )}

      {/* Source selector */}
      <div className="mb-4">
        <label
          className="mb-2 block text-[13px] font-semibold"
          style={textStyle}
        >
          Source wallet
        </label>
        <div className="space-y-2">
          {sources.map((s) => {
            const isSelected = selectedSource?.walletId === s.walletId
            return (
              <button
                key={s.walletId}
                type="button"
                onClick={() => setSelectedSource(s)}
                className="flex w-full cursor-pointer items-center justify-between rounded-[12px] border px-4 py-3 text-left transition-all hover:opacity-80"
                style={{
                  backgroundColor: isSelected
                    ? isDark
                      ? 'rgba(74, 222, 128, 0.08)'
                      : 'rgba(15, 151, 61, 0.06)'
                    : themeColors.card,
                  borderColor: isSelected
                    ? themeColors.green
                    : themeColors.border,
                  borderWidth: isSelected ? '2px' : '1px',
                }}
              >
                <div>
                  <p className="text-[13px] font-semibold" style={textStyle}>
                    {s.walletName}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    {formatCurrency(s.availableAmount)} available
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle size={18} style={{ color: themeColors.green }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <Button type="button" disabled={!canContinue} onClick={onContinue}>
        Review
      </Button>
    </>
  )
}

/* ─────────── Utility Review ─────────── */

function UtilityReview(props: {
  flowType: FlowType
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
  selectedSource: WithdrawalSource
  amount: number
  network: string
  phone: string
  selectedPlan: DataPlan | null
  cableProvider: string
  smartcard: string
  selectedPackage: CablePackage | null
  disco: string
  meterNumber: string
  meterType: 'prepaid' | 'postpaid'
  fee: number
  isSubmitting: boolean
  onSubmit: () => void
  formatCurrency: (n: number) => string
}) {
  const {
    flowType,
    themeColors,
    selectedSource,
    amount,
    network,
    phone,
    selectedPlan,
    cableProvider,
    smartcard,
    selectedPackage,
    disco,
    meterNumber,
    meterType,
    fee,
    isSubmitting,
    onSubmit,
    formatCurrency,
  } = props

  const labels: Record<FlowType, string> = {
    bank: 'Withdraw',
    airtime: 'Buy Airtime',
    data: 'Buy Data',
    cable: 'Pay Cable TV',
    electricity: 'Pay Electricity',
  }

  return (
    <>
      <div
        className="rounded-[16px] border p-5"
        style={{
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
        }}
      >
        <p
          className="mb-4 text-[15px] font-bold"
          style={{ color: themeColors.charcoal }}
        >
          {labels[flowType]}
        </p>

        <ReviewRow
          label="Source"
          value={selectedSource.walletName}
          themeColors={themeColors}
        />

        {flowType === 'airtime' && (
          <>
            <ReviewRow
              label="Network"
              value={network.toUpperCase()}
              themeColors={themeColors}
            />
            <ReviewRow label="Phone" value={phone} themeColors={themeColors} />
          </>
        )}

        {flowType === 'data' && selectedPlan && (
          <>
            <ReviewRow
              label="Network"
              value={network.toUpperCase()}
              themeColors={themeColors}
            />
            <ReviewRow label="Phone" value={phone} themeColors={themeColors} />
            <ReviewRow
              label="Plan"
              value={selectedPlan.name}
              themeColors={themeColors}
            />
          </>
        )}

        {flowType === 'cable' && selectedPackage && (
          <>
            <ReviewRow
              label="Provider"
              value={cableProvider}
              themeColors={themeColors}
            />
            <ReviewRow
              label="Smartcard"
              value={`••••${smartcard.slice(-4)}`}
              themeColors={themeColors}
            />
            <ReviewRow
              label="Package"
              value={selectedPackage.name}
              themeColors={themeColors}
            />
          </>
        )}

        {flowType === 'electricity' && (
          <>
            <ReviewRow
              label="Provider"
              value={disco}
              themeColors={themeColors}
            />
            <ReviewRow
              label="Meter"
              value={`••••${meterNumber.slice(-4)} (${meterType})`}
              themeColors={themeColors}
            />
          </>
        )}

        <ReviewRow
          label="Amount"
          value={formatCurrency(amount)}
          themeColors={themeColors}
        />
        <ReviewRow
          label="Fee"
          value={fee === 0 ? 'Free' : formatCurrency(fee)}
          themeColors={themeColors}
        />

        <div
          className="mt-3 border-t pt-3"
          style={{ borderColor: themeColors.border }}
        >
          <ReviewRow
            label="Total deducted"
            value={formatCurrency(amount + fee)}
            themeColors={themeColors}
            bold
            highlight
          />
        </div>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          onClick={onSubmit}
          loading={isSubmitting}
          loadingText="Processing..."
        >
          Confirm Payment
        </Button>
      </div>
    </>
  )
}