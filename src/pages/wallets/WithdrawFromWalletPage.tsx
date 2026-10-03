import {
  ArrowLeft,
  ArrowDownToLine,
  CheckCircle,
  AlertCircle,
  Landmark,
  Loader2,
  Info,
  Wallet,
  Lock,
  Coins,
  Plus,
  Banknote,
  Zap,
  ChevronRight,
  Clock,
  XCircle,
  Smartphone,
  Wifi,
  Tv,
  History,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { formatCurrency } from '../../utils/formatting'

/* ─── Types ─────────────────────────────────────────── */

interface SavedBank {
  id: number
  accountName: string
  accountNumber: string
  bankName: string
  bankImageUrl: string
}

interface WithdrawNavState {
  walletId: number
  walletName: string
  categoryIcon: string
  availableAmount: number
  lockedAmount: number
  targetAmount: number
  payoutDestination: 'bank' | 'wallet' | 'main'
}

type Screen =
  | 'home'
  | 'bank-amount'
  | 'bank-destination'
  | 'bank-review'
  | 'bank-success'
  | 'utilities'

type Method = 'bank' | 'utilities'

interface Receipt {
  amount: number
  reference: string
  bankName: string
  accountNumber: string
  date: string
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'reversed'
}

/* ─── Config ────────────────────────────────────────── */

const WITHDRAWAL_FEE = 0
const MIN_WITHDRAWAL = 100

// TODO: replace with getSavedBanks() from services/app/bank
const DUMMY_SAVED_BANKS: SavedBank[] = [
  {
    id: 1,
    accountName: 'Lucky Okafor',
    accountNumber: '0123456789',
    bankName: 'GTBank',
    bankImageUrl: '',
  },
  {
    id: 2,
    accountName: 'Lucky Okafor',
    accountNumber: '0987654321',
    bankName: 'Access Bank',
    bankImageUrl: '',
  },
  {
    id: 3,
    accountName: 'Lucky Okafor',
    accountNumber: '1122334455',
    bankName: 'Kuda',
    bankImageUrl: '',
  },
]

/* ─── Helpers ───────────────────────────────────────── */

const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber) return ''
  const last4 = accountNumber.slice(-4)
  const masked = '•'.repeat(Math.max(accountNumber.length - 4, 0))
  return `${masked}${last4}`
}

export default function WithdrawFromWalletPage() {
  const navigate = useNavigate()
  const { walletId } = useParams<{ walletId: string }>()
  const location = useLocation()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const state = (location.state ?? null) as WithdrawNavState | null

  const [screen, setScreen] = useState<Screen>('home')
  const [setMethod] = useState<Method>('bank')

  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([])
  const [isLoadingBanks, setIsLoadingBanks] = useState(true)
  const [selectedBank, setSelectedBank] = useState<SavedBank | null>(null)

  const [amount, setAmount] = useState('')
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  useEffect(() => {
    if (!state) {
      navigate(`/wallet/${walletId}`, { replace: true })
    }
  }, [state, navigate, walletId])

  // Load the user's saved banks (dummy for now)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setIsLoadingBanks(true)
      try {
        await new Promise((r) => setTimeout(r, 400))
        if (mounted) setSavedBanks(DUMMY_SAVED_BANKS)
      } finally {
        if (mounted) setIsLoadingBanks(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const availableAmount = state?.availableAmount ?? 0
  const lockedAmount = state?.lockedAmount ?? 0

  const parsedAmount = useMemo(
    () => parseInt(amount || '0', 10),
    [amount]
  )

  const totalWithdrawing = parsedAmount
  const totalToDebit = totalWithdrawing + WITHDRAWAL_FEE

  const exceedsAvailable = totalToDebit > availableAmount
  const belowMinimum =
    totalWithdrawing > 0 && totalWithdrawing < MIN_WITHDRAWAL

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '')
    setAmount(numeric)
    if (error) setError(null)
  }

  const handleWithdrawAll = () => {
    setAmount(String(Math.floor(availableAmount)))
    setError(null)
  }

  const resetFlow = () => {
    setAmount('')
    setSelectedBank(null)
    setError(null)
    setReceipt(null)
  }

  const goBack = () => {
    setError(null)
    if (screen === 'home') {
      navigate(`/wallet/${walletId}`)
      return
    }
    if (screen === 'bank-amount') {
      setScreen('home')
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
    if (screen === 'bank-success') {
      resetFlow()
      setScreen('home')
      return
    }
    if (screen === 'utilities') {
      setScreen('home')
      return
    }
    setScreen('home')
  }

  const handleBankContinue = () => {
    if (totalWithdrawing <= 0) {
      setError('Enter an amount to withdraw.')
      return
    }
    if (belowMinimum) {
      setError(`Minimum withdrawal is ${formatCurrency(MIN_WITHDRAWAL)}.`)
      return
    }
    if (exceedsAvailable) {
      setError('Amount exceeds your available balance.')
      return
    }
    setError(null)
    setScreen('bank-destination')
  }

  const handleDestinationContinue = () => {
    if (!selectedBank) {
      setError('Select a bank account to continue.')
      return
    }
    setError(null)
    setScreen('bank-review')
  }

  const handleOpenPinModal = () => {
    if (!selectedBank) {
      setError('Select a bank account first.')
      return
    }
    setError(null)
    setIsPinModalOpen(true)
  }

  const handlePinVerification = async (_pin: string) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: replace with real API call:
      // const res = await withdrawFromWallet({
      //   walletId: Number(walletId),
      //   amount: parsedAmount,
      //   bankAccountId: selectedBank!.id,
      // })
      // if (!res.is_success) throw new Error(res.message)

      await new Promise((resolve) => setTimeout(resolve, 1200))

      setReceipt({
        amount: totalWithdrawing,
        reference: `WDL-${Date.now().toString(36).toUpperCase()}`,
        bankName: selectedBank!.bankName,
        accountNumber: selectedBank!.accountNumber,
        date: new Date().toISOString(),
        status: 'completed',
      })

      setIsPinModalOpen(false)
      setScreen('bank-success')

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: 'Withdrawal initiated successfully.',
          },
        })
      )
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Withdrawal failed. Please try again.'

      setError(message)

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message },
        })
      )

      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUtilityTap = () => {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'info',
          message: 'Use the global Withdraw page to pay utilities.',
        },
      })
    )
    navigate('/withdraw')
  }

  /* ─── Loading guard ─────────────────────────────── */

  if (!state) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: themeColors.green }}
          />
        </div>
      </AppLayout>
    )
  }

  /* ─── Success screen ────────────────────────────── */

  if (screen === 'bank-success' && receipt) {
    return (
      <SuccessView
        receipt={receipt}
        walletName={state.walletName}
        themeColors={themeColors}
        isDark={isDark}
        onDone={() => navigate(`/wallet/${walletId}`)}
        onViewTransactions={() => navigate('/transactions')}
      />
    )
  }

  /* ─── Home ───────────────────────────────────────── */

  if (screen === 'home') {
    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: themeColors.background }}
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>
            <div className="flex-1">
              <h1
                className="text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Withdraws
              </h1>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                From {state.walletName}
              </p>
            </div>
          </div>

          <section
            className="mb-5 rounded-[20px] p-5"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(15, 185, 110, 0.22) 0%, rgba(15, 185, 110, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(15, 185, 110, 0.12) 0%, rgba(15, 185, 110, 0.02) 100%)',
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(15, 185, 110, 0.35)'
                : 'rgba(15, 185, 110, 0.22)',
            }}
          >
            <div className="flex items-center gap-2">
              <Wallet
                size={13}
                strokeWidth={2.4}
                style={{ color: themeColors.green }}
              />
              <p
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: themeColors.green }}
              >
                Available to use
              </p>
            </div>
            <p
              className="mt-2 text-[34px] font-bold leading-none"
              style={{
                color: themeColors.charcoal,
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.03em',
              }}
            >
              {formatCurrency(availableAmount)}
            </p>
            <p
              className="mt-2 text-[12px] leading-[1.5]"
              style={{ color: themeColors.mid }}
            >
              This is money already released from the schedule. You can use
              it or withdraw it now.
            </p>
          </section>

          <div className="mb-5 grid grid-cols-2 gap-2">
            <div
              className="rounded-[14px] border p-3"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-center gap-1.5">
                <Coins
                  size={11}
                  strokeWidth={2.4}
                  style={{ color: themeColors.green }}
                />
                <p
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: themeColors.green }}
                >
                  Available
                </p>
              </div>
              <p
                className="mt-1.5 text-[14px] font-bold leading-tight"
                style={{
                  color: themeColors.charcoal,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(availableAmount)}
              </p>
            </div>

            <div
              className="rounded-[14px] border p-3"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-center gap-1.5">
                <Lock
                  size={11}
                  strokeWidth={2.4}
                  style={{ color: themeColors.mid }}
                />
                <p
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  Locked
                </p>
              </div>
              <p
                className="mt-1.5 text-[14px] font-bold leading-tight"
                style={{
                  color: themeColors.charcoal,
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {formatCurrency(lockedAmount)}
              </p>
            </div>
          </div>

          <p
            className="mb-3 text-[15px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            What would you like to do?
          </p>

          <section className="mb-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMethod('bank')
                setScreen('bank-amount')
              }}
              disabled={availableAmount === 0}
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
              onClick={() => {
                setMethod('utilities')
                setScreen('utilities')
              }}
              disabled={availableAmount === 0}
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

          {lockedAmount > 0 && (
            <div
              className="rounded-[14px] border p-3.5"
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
                    {formatCurrency(lockedAmount)} still locked
                  </p>
                  <p
                    className="mt-0.5 text-[11px] leading-[1.5]"
                    style={{ color: themeColors.mid }}
                  >
                    This wallet has money waiting on its release schedule.
                    It'll become available automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    )
  }

  /* ─── Utilities screen ──────────────────────────── */

  if (screen === 'utilities') {
    const categories = [
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

    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: themeColors.background }}
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>
            <div className="flex-1">
              <h1
                className="text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Utilities
              </h1>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Pay for services with this wallet
              </p>
            </div>
          </div>

          <div
            className="mb-4 flex items-start gap-3 rounded-[14px] border p-3.5"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.08)'
                : 'rgba(96, 165, 250, 0.05)',
              borderColor: isDark
                ? 'rgba(96, 165, 250, 0.2)'
                : 'rgba(96, 165, 250, 0.15)',
            }}
          >
            <Info
              size={16}
              style={{ color: '#60A5FA', marginTop: 2, flexShrink: 0 }}
            />
            <p
              className="text-[12px] leading-[1.5]"
              style={{ color: themeColors.charcoal }}
            >
              Utility payments are handled on the global Withdraw page where
              you can pick any wallet as the source.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={handleUtilityTap}
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

          <button
            type="button"
            onClick={() => navigate('/withdraw')}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed py-3 text-[13px] font-semibold transition-all hover:opacity-80"
            style={{
              borderColor: themeColors.green,
              color: themeColors.green,
              backgroundColor: themeColors.card,
            }}
          >
            Open global Withdraw page
            <ChevronRight size={16} />
          </button>
        </div>
      </AppLayout>
    )
  }

  /* ─── Bank: amount ──────────────────────────────── */

  if (screen === 'bank-amount') {
    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: themeColors.background }}
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>
            <div className="flex-1">
              <h1
                className="text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Withdraw to bank
              </h1>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                From {state.walletName}
              </p>
            </div>
          </div>

          <div
            className="mb-4 rounded-[14px] border p-3.5"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <p className="text-[11px]" style={{ color: themeColors.mid }}>
              Source
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p
                className="text-[14px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {state.walletName}
              </p>
              <p
                className="text-[13px] font-bold"
                style={{ color: themeColors.green }}
              >
                {formatCurrency(availableAmount)} usable
              </p>
            </div>
          </div>

          <label
            className="mb-1.5 flex items-center justify-between text-[13px] font-medium"
            style={{ color: themeColors.charcoal }}
          >
            <span>Amount (₦)</span>
            <button
              type="button"
              onClick={handleWithdrawAll}
              className="text-[12px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: themeColors.green }}
            >
              Withdraw all
            </button>
          </label>

          <div
            className="flex items-center rounded-[12px] border px-3 transition-all"
            style={{
              borderColor: error
                ? '#EF4444'
                : parsedAmount > 0 && !exceedsAvailable
                ? themeColors.green
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
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="w-full border-0 bg-transparent py-3 pl-2 text-[16px] font-bold outline-none"
              style={{ color: themeColors.charcoal }}
              autoFocus
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {[1000, 5000, 10000].map((preset) => {
              const disabled = preset > availableAmount
              return (
                <button
                  key={preset}
                  type="button"
                  disabled={disabled}
                  onClick={() => setAmount(String(preset))}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.charcoal,
                    backgroundColor: themeColors.card,
                  }}
                >
                  {formatCurrency(preset)}
                </button>
              )
            })}
          </div>

          {error && (
            <div
              className="mt-4 flex items-start gap-2 rounded-[12px] p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.06)',
              }}
            >
              <AlertCircle
                size={16}
                style={{ color: '#EF4444', marginTop: 2, flexShrink: 0 }}
              />
              <p className="text-[12px]" style={{ color: '#EF4444' }}>
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleBankContinue}
            disabled={totalWithdrawing <= 0 || exceedsAvailable || belowMinimum}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Continue
          </button>
        </div>
      </AppLayout>
    )
  }

  /* ─── Bank: destination (list of saved banks) ───── */

  if (screen === 'bank-destination') {
    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: themeColors.background }}
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>
            <div className="flex-1">
              <h1
                className="text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Choose a bank
              </h1>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Where should we send {formatCurrency(totalWithdrawing)}?
              </p>
            </div>
          </div>

          {isLoadingBanks ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2
                size={24}
                className="animate-spin"
                style={{ color: themeColors.green }}
              />
              <p
                className="mt-3 text-[13px]"
                style={{ color: themeColors.mid }}
              >
                Loading your saved banks...
              </p>
            </div>
          ) : savedBanks.length === 0 ? (
            <div
              className="flex flex-col items-center rounded-[16px] border p-6 text-center"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(245, 158, 11, 0.08)',
                  color: '#F59E0B',
                }}
              >
                <AlertCircle size={22} strokeWidth={2} />
              </div>
              <p
                className="mt-3 text-[14px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                No saved banks yet
              </p>
              <p
                className="mt-1 text-[12px]"
                style={{ color: themeColors.mid }}
              >
                Add a bank to your profile so you can withdraw to it.
              </p>
              <button
                type="button"
                onClick={() => navigate('/bank')}
                className="mt-4 cursor-pointer rounded-full px-5 py-2 text-[13px] font-semibold"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                Add bank
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {savedBanks.map((bank) => {
                  const isSelected = selectedBank?.id === bank.id
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => {
                        setSelectedBank(bank)
                        setError(null)
                      }}
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
                      <div className="flex items-center gap-3">
                        {bank.bankImageUrl ? (
                          <img
                            src={bank.bankImageUrl}
                            alt={bank.bankName}
                            className="h-10 w-10 rounded-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: isDark
                                ? 'rgba(15, 185, 110, 0.2)'
                                : 'rgba(15, 185, 110, 0.1)',
                              color: themeColors.green,
                            }}
                          >
                            <Landmark size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p
                            className="truncate text-[14px] font-semibold"
                            style={{ color: themeColors.charcoal }}
                          >
                            {bank.bankName}
                          </p>
                          <p
                            className="mt-0.5 text-[12px]"
                            style={{ color: themeColors.mid }}
                          >
                            {maskAccountNumber(bank.accountNumber)} ·{' '}
                            {bank.accountName}
                          </p>
                        </div>
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
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] border-2 border-dashed py-3 text-[13px] font-semibold transition-all hover:opacity-80"
                style={{
                  borderColor: themeColors.green,
                  color: themeColors.green,
                  backgroundColor: themeColors.card,
                }}
              >
                <Plus size={16} strokeWidth={2.4} />
                Add a new bank
              </button>

              {error && (
                <div
                  className="mt-4 flex items-start gap-2 rounded-[12px] p-3"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(239, 68, 68, 0.06)',
                  }}
                >
                  <AlertCircle
                    size={16}
                    style={{ color: '#EF4444', marginTop: 2, flexShrink: 0 }}
                  />
                  <p className="text-[12px]" style={{ color: '#EF4444' }}>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleDestinationContinue}
                disabled={!selectedBank}
                className="mt-6 w-full rounded-[14px] px-4 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                Continue
              </button>
            </>
          )}
        </div>
      </AppLayout>
    )
  }

  /* ─── Bank: review ──────────────────────────────── */

  if (screen === 'bank-review') {
    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: themeColors.background }}
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>
            <div className="flex-1">
              <h1
                className="text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Review withdrawal
              </h1>
              <p className="text-[12px]" style={{ color: themeColors.mid }}>
                Confirm the details
              </p>
            </div>
          </div>

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
              value={state.walletName}
              themeColors={themeColors}
            />
            <ReviewRow
              label="Amount"
              value={formatCurrency(parsedAmount)}
              themeColors={themeColors}
            />
            <ReviewRow
              label="Fee"
              value={WITHDRAWAL_FEE === 0 ? 'Free' : formatCurrency(WITHDRAWAL_FEE)}
              themeColors={themeColors}
            />

            {selectedBank && (
              <ReviewRow
                label="Destination"
                value={`${selectedBank.bankName} · ${maskAccountNumber(
                  selectedBank.accountNumber
                )}`}
                themeColors={themeColors}
              />
            )}

            <div
              className="mt-3 border-t pt-3"
              style={{ borderColor: themeColors.border }}
            >
              <ReviewRow
                label="Total to bank"
                value={formatCurrency(totalWithdrawing)}
                themeColors={themeColors}
                bold
                highlight
              />
            </div>
          </div>

          {error && (
            <div
              className="mt-4 flex items-start gap-2 rounded-[12px] p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(239, 68, 68, 0.06)',
              }}
            >
              <AlertCircle
                size={16}
                style={{ color: '#EF4444', marginTop: 2, flexShrink: 0 }}
              />
              <p className="text-[12px]" style={{ color: '#EF4444' }}>
                {error}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpenPinModal}
            disabled={!selectedBank || isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            <ArrowDownToLine size={18} strokeWidth={2.2} />
            Confirm withdrawal
          </button>
        </div>

        <PinModal
          isOpen={isPinModalOpen}
          title="Verify PIN"
          description={`Enter your PIN to withdraw ${formatCurrency(
            totalWithdrawing
          )} to your bank account.`}
          onClose={() => setIsPinModalOpen(false)}
          onVerify={handlePinVerification}
          isLoading={isSubmitting}
          maxLength={6}
        />
      </AppLayout>
    )
  }

  return null
}

/* ─── Sub-components ────────────────────────────────── */

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

function SuccessView({
  receipt,
  walletName,
  themeColors,
  isDark,
  onDone,
  onViewTransactions,
}: {
  receipt: Receipt
  walletName: string
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
  onDone: () => void
  onViewTransactions: () => void
}) {
  const statusColor =
    receipt.status === 'completed'
      ? themeColors.green
      : receipt.status === 'pending' || receipt.status === 'processing'
      ? '#F59E0B'
      : receipt.status === 'reversed'
      ? '#9CA3AF'
      : '#EF4444'

  const StatusIcon =
    receipt.status === 'completed'
      ? CheckCircle
      : receipt.status === 'pending' || receipt.status === 'processing'
      ? Clock
      : receipt.status === 'reversed'
      ? XCircle
      : AlertCircle

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10" />
          <h1
            className="flex-1 text-center text-[20px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Withdrawal
          </h1>
          <div className="h-10 w-10" />
        </div>

        <section className="flex flex-col items-center py-8 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? `${statusColor}26` : `${statusColor}1A`,
            }}
          >
            <StatusIcon
              size={40}
              strokeWidth={2}
              style={{ color: statusColor }}
            />
          </div>

          <h2
            className="mt-5 text-[20px] font-extrabold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            Withdrawal successful
          </h2>

          <p
            className="mt-2 text-[13px] leading-[1.6]"
            style={{ color: themeColors.mid }}
          >
            {formatCurrency(receipt.amount)} sent from {walletName}
          </p>

          <div
            className="mt-5 w-full rounded-[14px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div className="space-y-2.5">
              <Row
                label="Destination"
                value={`${receipt.bankName} · ${maskAccountNumber(
                  receipt.accountNumber
                )}`}
                themeColors={themeColors}
              />
              <Row
                label="Reference"
                value={receipt.reference}
                themeColors={themeColors}
              />
              <Row
                label="Date"
                value={new Date(receipt.date).toLocaleString('en-NG', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
                themeColors={themeColors}
              />
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: themeColors.mid }}>
                  Status
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                  }}
                >
                  {receipt.status}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onDone}
            className="w-full rounded-[14px] px-4 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Done
          </button>

          <button
            type="button"
            onClick={onViewTransactions}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border py-3 text-[13px] font-semibold transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              color: themeColors.charcoal,
              backgroundColor: 'transparent',
            }}
          >
            <History size={14} />
            View transactions
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

function Row({
  label,
  value,
  themeColors,
}: {
  label: string
  value: string
  themeColors: { mid: string; charcoal: string }
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px]" style={{ color: themeColors.mid }}>
        {label}
      </span>
      <span
        className="text-right text-[12px] font-medium"
        style={{ color: themeColors.charcoal }}
      >
        {value}
      </span>
    </div>
  )
}