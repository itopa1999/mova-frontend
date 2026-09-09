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
  Clock,
  Filter,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

import { useTheme } from '../../hooks/useTheme'
import {
  colors,
  darkColors,
} from '../../styles/tokens'

import { getDepositHistory } from '../../services/app/fund'

type Gateway = 'monnify' | 'paystack' | 'flutterwave' | null
type TabType = 'deposit' | 'history'

interface Transaction {
  id: number
  title: string
  amount: number
  type: 'deposit' | 'withdrawal'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed'
  reference: string
  completedAt: string
  createdAt: string
}

export default function AddFundsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()

  const themeColors = isDark
    ? darkColors
    : colors

  const [activeTab, setActiveTab] = useState<TabType>('deposit')
  const [amount, setAmount] = useState('')
  const [selectedGateway, setSelectedGateway] = useState<Gateway>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Read tab from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'history') {
      setActiveTab('history')
    }
  }, [location.search])

  // Fetch deposit history when history tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      fetchDepositHistory()
    }
  }, [activeTab])

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

  const gateways = [
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

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setAmount(numericValue)
    setError(null)
  }

  const handleGatewaySelect = (gatewayId: Gateway) => {
    setSelectedGateway(gatewayId)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!amount || parseInt(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!selectedGateway) {
      setError('Please select a payment gateway')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Adding funds:', {
        amount: parseInt(amount),
        gateway: selectedGateway,
      })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const successEvent = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: `₦${parseInt(amount).toLocaleString()} added to your balance successfully!`,
        },
      })
      window.dispatchEvent(successEvent)

      navigate('/dashboard')
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
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
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    })
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

  return (
    <AppLayout>
      <div className="py-5">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
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

        {/* Tabs */}
        <div className="mb-6 flex border-b" style={{ borderColor: themeColors.border }}>
          <button
            type="button"
            onClick={() => setActiveTab('deposit')}
            className="flex-1 py-3 text-center text-[13px] font-semibold transition-all duration-200"
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
            className="flex-1 py-3 text-center text-[13px] font-semibold transition-all duration-200"
            style={{
              color: activeTab === 'history' ? themeColors.green : themeColors.mid,
              borderBottom: activeTab === 'history' ? `2px solid ${themeColors.green}` : 'none',
            }}
          >
            History
          </button>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <>
            {/* Info Card */}
            <div
              className="mb-6 rounded-[16px] border p-4"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={18} style={{ color: themeColors.mid }} className="mt-0.5 shrink-0" />
                <div>
                  <p
                    className="text-[13px] font-medium"
                    style={{ color: themeColors.charcoal }}
                  >
                    Funds go to your available balance
                  </p>
                  <p
                    className="mt-0.5 text-[12px]"
                    style={{ color: themeColors.mid }}
                  >
                    Money added will be available in your main balance, not in controlled wallets. You can then allocate funds to specific wallets.
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
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

            {/* Gateway Selection */}
            <div className="mb-8">
              <label
                className="mb-3 block text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Select Payment Gateway
              </label>
              <div className="space-y-3">
                {gateways.map((gateway) => {
                  const Icon = gateway.icon
                  const isSelected = selectedGateway === gateway.id

                  return (
                    <button
                      key={gateway.id}
                      type="button"
                      onClick={() => handleGatewaySelect(gateway.id)}
                      className="flex w-full items-center gap-4 rounded-[14px] border p-4 transition-all duration-200 hover:opacity-80"
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
                        <CheckCircle size={20} style={{ color: themeColors.green }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText="Processing..."
              disabled={!amount || parseInt(amount) <= 0 || !selectedGateway}
            >
              Continue to Payment
            </Button>

            {/* Disclaimer */}
            <p
              className="mt-4 text-center text-[11px]"
              style={{ color: themeColors.light }}
            >
              You will be redirected to the selected payment gateway to complete your transaction.
            </p>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            {/* Summary */}
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

            {/* Transaction List */}
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
                  return (
                    <div
                      key={transaction.id}
                      className="rounded-[16px] border p-4"
                      style={{
                        backgroundColor: themeColors.card,
                        borderColor: themeColors.border,
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
    </AppLayout>
  )
}