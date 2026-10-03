import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Wallet,
  CheckCircle,
  AlertCircle,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Copy,
  Check,
  Lock,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'

import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

import {
  getDepositHistory,
  fundAccount,
  getFundingMethod,
  type FundingMethod,
  type DepositTransaction,
} from '../../services/app/fund'
import {
  formatAmount,
  formatCurrency,
  formatDate,
  formatTime,
} from '../../utils/formatting'

type Gateway = 'monnify' | 'paystack' | 'flutterwave' | null
type TabType = 'deposit' | 'history'

const HISTORY_NOTE_SEEN_KEY = 'mova_history_note_seen'

const ALL_GATEWAYS = [
  {
    id: 'monnify' as const,
    name: 'Monnify',
    icon: Banknote,
    description: 'Pay with bank transfer or card',
    color: '#4A6CF7',
  },
  {
    id: 'paystack' as const,
    name: 'Paystack',
    icon: CreditCard,
    description: 'Pay with card or USSD',
    color: '#39B54A',
  },
  {
    id: 'flutterwave' as const,
    name: 'Flutterwave',
    icon: Wallet,
    description: 'Pay with card, bank or mobile money',
    color: '#F5A623',
  },
]

export default function AddFundsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const historySheet = useBottomSheet<'historyNote'>()

  const [activeTab, setActiveTab] = useState<TabType>('deposit')
  const [amount, setAmount] = useState('')
  const [selectedGateway, setSelectedGateway] = useState<Gateway>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<DepositTransaction[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const [fundingMethod, setFundingMethod] = useState<FundingMethod | null>(null)
  const [isLoadingFunding, setIsLoadingFunding] = useState(true)
  const [isAccountCopied, setIsAccountCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'history') {
      setActiveTab('history')
    }
  }, [location.search])

  useEffect(() => {
    fetchFundingMethod()
  }, [])

  useEffect(() => {
    if (activeTab === 'history') {
      fetchDepositHistory()

      const seen = localStorage.getItem(HISTORY_NOTE_SEEN_KEY)
      if (!seen) {
        const t = setTimeout(() => {
          historySheet.open('historyNote')
          localStorage.setItem(HISTORY_NOTE_SEEN_KEY, '1')
        }, 600)
        return () => clearTimeout(t)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchFundingMethod = async () => {
    setIsLoadingFunding(true)
    try {
      const response = await getFundingMethod()
      if (response.is_success && response.data) {
        setFundingMethod(response.data)

        if (response.data.allowedGateways.length > 0) {
          const first = response.data.allowedGateways[0].toLowerCase() as Gateway
          setSelectedGateway(first)
        }
      }
    } catch (error) {
      console.error('Error fetching funding method:', error)
    } finally {
      setIsLoadingFunding(false)
    }
  }

  const fetchDepositHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await getDepositHistory()
      if (response.is_success && response.data) {
        setTransactions(response.data)
      }
    } catch (error) {
      console.error('Error fetching deposit history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const allowedGateways = ALL_GATEWAYS.filter((g) =>
    fundingMethod?.allowedGateways?.some(
      (name: string) => name.toLowerCase() === g.id.toLowerCase()
    )
  )

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setAmount(numericValue)
    setError(null)
  }

  const handleGatewaySelect = (gatewayId: Gateway) => {
    setSelectedGateway(gatewayId)
    setError(null)
  }

  const handleCopyAccount = async () => {
    const accountNumber = fundingMethod?.accountDetails?.accountNumber
    if (!accountNumber) return

    try {
      await navigator.clipboard.writeText(accountNumber)
      setIsAccountCopied(true)

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'success', message: 'Account number copied.' },
        })
      )

      setTimeout(() => setIsAccountCopied(false), 2000)
    } catch {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: 'Failed to copy. Please copy manually.',
          },
        })
      )
    }
  }

  const handleSubmit = async () => {
    if (!amount || parseInt(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (parseInt(amount) < 1000) {
      setError('Minimum funding amount is ₦1,000')
      return
    }

    if (!selectedGateway) {
      setError('Please select a payment gateway')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fundAccount({
        amount: parseInt(amount),
        provider: selectedGateway,
      })

      if (!response.is_success || !response.data?.authorizationUrl) {
        setError(response.message || 'Unable to initialize payment. Please try again.')
        return
      }

      const authorizationUrl = response.data.authorizationUrl

      window.location.href = authorizationUrl

      setAmount('')
      setSelectedGateway(null)
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return themeColors.green
      case 'pending':
        return '#F59E0B'
      case 'processing':
        return '#60A5FA'
      case 'failed':
        return '#EF4444'
      case 'refill':
        return '#8B5CF6'
      case 'reversed':
        return '#9CA3AF'
      default:
        return themeColors.mid
    }
  }

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status)
    return (
      <span
        className="rounded-full px-2 py-0.5 text-[9px] font-medium uppercase"
        style={{
          backgroundColor: color + '20',
          color: color,
        }}
      >
        {status}
      </span>
    )
  }

  const getTotalDeposits = () => {
    return transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const pendingCount = transactions.filter(
    t => t.status === 'pending' || t.status === 'processing'
  ).length

  const isDepositDisabled = fundingMethod ? !fundingMethod.isDepositAllowed : false

  return (
    <AppLayout>
      <div className="py-5">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <h1
            className="text-[20px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Add Funds
          </h1>
        </div>

        <div className="mb-6 flex border-b" style={{ borderColor: themeColors.border }}>
          <button
            type="button"
            onClick={() => setActiveTab('deposit')}
            className="flex-1 cursor-pointer py-3 text-center text-[13px] font-semibold transition-all duration-200"
            style={{
              color: activeTab === 'deposit' ? themeColors.green : themeColors.mid,
              borderBottom: activeTab === 'deposit' ? `2px solid ${themeColors.green}` : 'none',
            }}
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className="flex-1 cursor-pointer py-3 text-center text-[13px] font-semibold transition-all duration-200"
            style={{
              color: activeTab === 'history' ? themeColors.green : themeColors.mid,
              borderBottom: activeTab === 'history' ? `2px solid ${themeColors.green}` : 'none',
            }}
          >
            History
          </button>
        </div>

        {activeTab === 'deposit' && (
          <>
            {isLoadingFunding ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-4"
                  style={{
                    borderColor: themeColors.green,
                    borderTopColor: 'transparent',
                  }}
                />
              </div>
            ) : isDepositDisabled ? (
              <div
                className="rounded-[16px] border p-6 text-center"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(245, 158, 11, 0.08)',
                  }}
                >
                  <Lock size={24} strokeWidth={2} style={{ color: '#F59E0B' }} />
                </div>
                <p
                  className="mt-4 text-[15px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Deposits are currently disabled
                </p>
                <p
                  className="mt-1 text-[12px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  We're performing maintenance on our deposit channels. Please
                  check back shortly.
                </p>
              </div>
            ) : (
              <>
                {fundingMethod?.accountDetails ? (
                  <div
                    className="mb-4 rounded-[16px] border p-4"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(15, 185, 110, 0.15)'
                            : 'rgba(15, 185, 110, 0.08)',
                          color: themeColors.green,
                        }}
                      >
                        <Banknote size={18} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          Transfer to your dedicated account
                        </p>
                        <p
                          className="mt-0.5 text-[11px] leading-[1.5]"
                          style={{ color: themeColors.mid }}
                        >
                          Send money from any bank app. Your balance updates
                          automatically.
                        </p>
                      </div>
                    </div>

                    <div
                      className="mt-4 flex items-center justify-between gap-4 rounded-[14px] px-4 py-4"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(15, 185, 110, 0.06)'
                          : 'rgba(15, 185, 110, 0.04)',
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: themeColors.mid }}
                        >
                          {fundingMethod.accountDetails.bankName}
                        </p>
                        <p
                          className="mt-1.5 text-[26px] font-extrabold leading-none tracking-tight"
                          style={{
                            color: themeColors.charcoal,
                            fontFamily:
                              "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {fundingMethod.accountDetails.accountNumber}
                        </p>
                        <p
                          className="mt-2 text-[13px] font-bold uppercase tracking-wide"
                          style={{ color: themeColors.charcoal }}
                        >
                          {fundingMethod.accountDetails.accountName}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all hover:opacity-80 active:scale-95"
                        style={{
                          backgroundColor: isAccountCopied
                            ? themeColors.green
                            : isDark
                            ? 'rgba(15, 185, 110, 0.15)'
                            : 'rgba(15, 185, 110, 0.08)',
                          color: isAccountCopied ? '#FFFFFF' : themeColors.green,
                        }}
                        aria-label="Copy account number"
                      >
                        {isAccountCopied ? (
                          <Check size={18} strokeWidth={2.5} />
                        ) : (
                          <Copy size={18} strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="mb-4 rounded-[16px] border p-4"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'rgba(245, 158, 11, 0.05)',
                      borderColor: isDark
                        ? 'rgba(245, 158, 11, 0.25)'
                        : 'rgba(245, 158, 11, 0.15)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={16}
                        style={{ color: '#F59E0B', marginTop: 2 }}
                        className="shrink-0"
                      />
                      <div>
                        <p
                          className="text-[12px] font-medium"
                          style={{ color: '#F59E0B' }}
                        >
                          No dedicated account yet
                        </p>
                        <p
                          className="mt-0.5 text-[11px] leading-[1.5]"
                          style={{ color: themeColors.mid }}
                        >
                          Contact support to get your dedicated account, or
                          use a gateway below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {allowedGateways.length > 0 && (
                  <>
                    <div
                      className="mb-3 flex items-center gap-3"
                      style={{ color: themeColors.mid }}
                    >
                      <div
                        className="h-px flex-1"
                        style={{ backgroundColor: themeColors.border }}
                      />
                      <span className="text-[11px] font-medium">
                        or pay with a gateway
                      </span>
                      <div
                        className="h-px flex-1"
                        style={{ backgroundColor: themeColors.border }}
                      />
                    </div>

                    <div className="mb-6">
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
                          borderColor: error ? themeColors.red : themeColors.border,
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
                          onChange={(e) => handleAmountChange(e.target.value)}
                          placeholder="0.00"
                          className="ml-2 w-full bg-transparent text-[20px] font-bold outline-none"
                          style={{ color: themeColors.charcoal }}
                        />
                      </div>
                      {amount && (
                        <p
                          className="mt-1 text-right text-[12px]"
                          style={{ color: themeColors.mid }}
                        >
                          ₦{formatAmount(amount)}
                        </p>
                      )}
                      {error && (
                        <p
                          className="mt-1 text-[12px]"
                          style={{ color: themeColors.red }}
                        >
                          {error}
                        </p>
                      )}
                    </div>

                    <div className="mb-8">
                      <label
                        className="mb-3 block text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        Select Payment Gateway
                      </label>
                      <div className="space-y-3">
                        {allowedGateways.map((gateway) => {
                          const Icon = gateway.icon
                          const isSelected = selectedGateway === gateway.id

                          return (
                            <button
                              key={gateway.id}
                              type="button"
                              onClick={() => handleGatewaySelect(gateway.id)}
                              className="flex w-full cursor-pointer items-center gap-4 rounded-[14px] border p-4 transition-all duration-200 hover:opacity-80"
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
                              <div
                                className="flex h-12 w-12 items-center justify-center rounded-[12px]"
                                style={{
                                  backgroundColor: isSelected
                                    ? themeColors.green
                                    : themeColors.background,
                                  color: isSelected ? '#FFFFFF' : gateway.color,
                                }}
                              >
                                <Icon size={22} strokeWidth={2} />
                              </div>

                              <div className="flex-1 text-left">
                                <p
                                  className="text-[14px] font-semibold"
                                  style={{ color: themeColors.charcoal }}
                                >
                                  {gateway.name}
                                </p>
                                <p
                                  className="text-[12px]"
                                  style={{ color: themeColors.mid }}
                                >
                                  {gateway.description}
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
                    </div>

                    <Button
                      type="button"
                      onClick={handleSubmit}
                      loading={isSubmitting}
                      loadingText="Opening gateway..."
                      disabled={
                        !amount || parseInt(amount) < 1000 || !selectedGateway
                      }
                    >
                      Continue to Payment
                    </Button>

                    <p
                      className="mt-4 text-center text-[11px]"
                      style={{ color: themeColors.light }}
                    >
                      You will be redirected to the selected payment gateway to
                      complete your transaction.
                    </p>
                  </>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Deposit History
              </p>

              <button
                type="button"
                onClick={() => historySheet.open('historyNote')}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-all hover:opacity-70 active:scale-90"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(0,0,0,0.04)',
                  color: themeColors.mid,
                }}
                aria-label="What does this history show?"
              >
                <Info size={14} strokeWidth={2.4} />
              </button>
            </div>

            {pendingCount > 0 && (
              <div
                className="mb-4 rounded-[16px] border p-3.5"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(245, 158, 11, 0.05)',
                  borderColor: isDark
                    ? 'rgba(245, 158, 11, 0.25)'
                    : 'rgba(245, 158, 11, 0.15)',
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={16}
                    style={{ color: '#F59E0B' }}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p
                      className="text-[12px] font-medium"
                      style={{ color: '#F59E0B' }}
                    >
                      {pendingCount} transaction
                      {pendingCount > 1 ? 's' : ''} awaiting settlement
                    </p>
                    <p
                      className="mt-0.5 text-[11px] leading-[1.5]"
                      style={{ color: themeColors.mid }}
                    >
                      Deposits that are still pending or processing
                      will be confirmed shortly. You don&apos;t need
                      to do anything.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div
              className="mb-4 rounded-[16px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px]" style={{ color: themeColors.mid }}>
                    Total Deposits
                  </p>
                  <p
                    className="text-[20px] font-bold"
                    style={{
                      color: themeColors.green,
                      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    {formatCurrency(getTotalDeposits())}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px]" style={{ color: themeColors.mid }}>
                    Transactions
                  </p>
                  <p
                    className="text-[20px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {transactions.length}
                  </p>
                </div>
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-4"
                  style={{
                    borderColor: themeColors.green,
                    borderTopColor: 'transparent',
                  }}
                />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const isDeposit = transaction.type === 'deposit'
                  const isFailed = transaction.status === 'failed'
                  return (
                    <div
                      key={transaction.id}
                      className="rounded-[16px] border p-4"
                      style={{
                        backgroundColor: themeColors.card,
                        borderColor: isFailed
                          ? isDark
                            ? 'rgba(239, 68, 68, 0.35)'
                            : 'rgba(239, 68, 68, 0.25)'
                          : themeColors.border,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: isDeposit
                                ? isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(15, 151, 61, 0.1)'
                                : isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                              color: isDeposit ? themeColors.green : '#EF4444',
                            }}
                          >
                            {isDeposit ? (
                              <ArrowDownRight size={18} strokeWidth={2} />
                            ) : (
                              <ArrowUpRight size={18} strokeWidth={2} />
                            )}
                          </div>
                          <div>
                            <p
                              className="text-[14px] font-medium"
                              style={{ color: themeColors.charcoal }}
                            >
                              {transaction.title}
                            </p>
                            <p
                              className="text-[11px]"
                              style={{ color: themeColors.mid }}
                            >
                              {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
                            </p>
                            <p
                              className="mt-0.5 text-[10px]"
                              style={{ color: themeColors.light }}
                            >
                              Ref: {transaction.reference}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-[15px] font-bold"
                            style={{
                              color: isDeposit ? themeColors.green : '#EF4444',
                              fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                            }}
                          >
                            {isDeposit ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>

                      {isFailed && transaction.failureReason && (
                        <div
                          className="mt-3 flex items-start gap-2 rounded-[10px] px-3 py-2"
                          style={{
                            backgroundColor: isDark
                              ? 'rgba(239, 68, 68, 0.08)'
                              : 'rgba(239, 68, 68, 0.05)',
                            borderColor: isDark
                              ? 'rgba(239, 68, 68, 0.25)'
                              : 'rgba(239, 68, 68, 0.15)',
                            borderWidth: 1,
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
                          <p
                            className="text-[11px] leading-snug"
                            style={{ color: '#EF4444' }}
                          >
                            {transaction.failureReason}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                style={{ color: themeColors.mid }}
              >
                <History size={32} strokeWidth={1.5} />
                <p className="mt-3 text-[14px] font-medium">No transactions yet</p>
                <p className="mt-1 text-[12px]">Your deposit history will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={historySheet.activeSheet !== null}
        onClose={historySheet.close}
        title="About this history"
        icon={<History size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={historySheet.close}
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
            This page shows your{' '}
            <strong style={{ color: themeColors.charcoal }}>
              deposit transactions only
            </strong>{' '}
            — every time you add money into your main balance.
          </p>

          <div className="mt-4 space-y-3">
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
                <ArrowDownRight size={15} strokeWidth={2.2} />
              </div>
              <div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Deposits you made
                </p>
                <p className="mt-0.5 text-[12px] leading-[1.55]">
                  Every top-up into your main account appears here with its
                  status, reference, and amount.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(156, 163, 175, 0.15)'
                    : 'rgba(156, 163, 175, 0.08)',
                  color: themeColors.mid,
                }}
              >
                <ArrowUpRight size={15} strokeWidth={2.2} />
              </div>
              <div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Withdrawals, releases, and transfers
                </p>
                <p className="mt-0.5 text-[12px] leading-[1.55]">
                  These are tied to specific wallets. Open a wallet to see
                  every release, transfer, and payout linked to it.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-[1.55] italic">
            To see all of your activity in one place, use the{' '}
            <strong>Wallets</strong> page — that shows everything coming out
            of your wallets.
          </p>
        </div>
      </BottomSheet>
    </AppLayout>
  )
}