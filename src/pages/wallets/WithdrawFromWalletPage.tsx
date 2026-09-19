// src/pages/wallets/WithdrawFromWalletPage.tsx

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
  Minus,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'

// ─── Types ─────────────────────────────────────────────

interface BankAccountState {
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
  unusedAmount: number
  lockedAmount: number
  targetAmount: number
  payoutDestination: 'bank' | 'wallet' | 'main'
  bankAccount: BankAccountState | null
}

type Step = 'form' | 'success'

// ─── Dummy withdrawal config ──────────────────────────
// Replace with real backend values later.

const WITHDRAWAL_FEE = 0 // flat naira; set to 0 for now
const MIN_WITHDRAWAL = 100

// ─── Helpers ──────────────────────────────────────────

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

  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [includeUnused, setIncludeUnused] = useState(false)
  const [receipt, setReceipt] = useState<{
    amount: number
    unusedIncluded: number
    reference: string
    bankName: string
    accountNumber: string
    date: string
  } | null>(null)

  // If state wasn't passed, bail back to the wallet page.
  useEffect(() => {
    if (!state) {
      navigate(`/wallet/${walletId}`, { replace: true })
    }
  }, [state, navigate, walletId])

  const availableAmount = state?.availableAmount ?? 0
  const unusedAmount = state?.unusedAmount ?? 0
  const bankAccount = state?.bankAccount ?? null

  const parsedAmount = useMemo(
    () => parseInt(amount || '0', 10),
    [amount]
  )

  // When the user opts in, the unused amount is added to the withdrawal.
  const unusedContribution = includeUnused ? unusedAmount : 0
  const totalWithdrawing = parsedAmount + unusedContribution
  const totalToDebit = totalWithdrawing + WITHDRAWAL_FEE

  const exceedsAvailable = totalToDebit > availableAmount + unusedAmount
  const belowMinimum =
    totalWithdrawing > 0 && totalWithdrawing < MIN_WITHDRAWAL

  const isFormValid =
    totalWithdrawing > 0 &&
    !exceedsAvailable &&
    !belowMinimum &&
    !!bankAccount

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const handleAmountChange = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, '')
    setAmount(numeric)
    if (error) setError(null)
  }

  const handleWithdrawAll = () => {
    setAmount(String(Math.floor(availableAmount)))
    setError(null)
  }

  const handleToggleUnused = () => {
    setIncludeUnused((prev) => !prev)
    if (error) setError(null)
  }

  const handleOpenPinModal = () => {
    if (!bankAccount) {
      setError('No bank account linked. Link one before withdrawing.')
      return
    }
    if (!isFormValid) {
      if (totalWithdrawing <= 0) setError('Enter an amount to withdraw.')
      else if (belowMinimum)
        setError(`Minimum withdrawal is ${formatCurrency(MIN_WITHDRAWAL)}.`)
      else if (exceedsAvailable)
        setError('Amount exceeds your available balance.')
      else setError('Please check your inputs.')
      return
    }
    setError(null)
    setIsPinModalOpen(true)
  }

  // ─── Dummy submit — replace with real API call ───────
  const handlePinVerification = async (_pin: string) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: replace with real API call:
      // const res = await withdrawFromWallet({
      //   walletId: Number(walletId),
      //   amount: parsedAmount,
      //   includeUnused,
      //   bankAccountId: bankAccount!.id,
      // })
      // if (!res.is_success) throw new Error(res.message)

      await new Promise((resolve) => setTimeout(resolve, 1200))

      const simulateFailure = false
      if (simulateFailure) {
        throw new Error('Withdrawal failed. Please try again.')
      }

      setReceipt({
        amount: totalWithdrawing,
        unusedIncluded: unusedContribution,
        reference: `WDL-${Date.now().toString(36).toUpperCase()}`,
        bankName: bankAccount!.bankName,
        accountNumber: bankAccount!.accountNumber,
        date: new Date().toISOString(),
      })

      setIsPinModalOpen(false)
      setStep('success')

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

  // ─── Loading guard ───────────────────────────────────
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

  // ─── Success screen ─────────────────────────────────
  if (step === 'success' && receipt) {
    return (
      <AppLayout>
        <div className="py-5" style={{ color: themeColors.charcoal }}>
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/wallet/${walletId}`)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ backgroundColor: themeColors.background }}
            >
              <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
            </button>
            <h1
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Withdrawal
            </h1>
          </div>

          <div
            className="rounded-[20px] border p-6 text-center"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(15, 185, 110, 0.15)'
                  : 'rgba(15, 185, 110, 0.08)',
                color: themeColors.green,
              }}
            >
              <CheckCircle size={32} strokeWidth={2} />
            </div>

            <p
              className="mt-4 text-[13px]"
              style={{ color: themeColors.mid }}
            >
              You withdrew
            </p>
            <p
              className="mt-1 text-[32px] font-bold leading-none"
              style={{
                color: themeColors.charcoal,
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {formatCurrency(receipt.amount)}
            </p>

            <p
              className="mt-3 text-[12px]"
              style={{ color: themeColors.mid }}
            >
              from {state.walletName}
            </p>
          </div>

          <div
            className="mt-4 space-y-3 rounded-[16px] border p-4"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <Row
              label="Destination"
              value={`${receipt.bankName} · ${maskAccountNumber(
                receipt.accountNumber
              )}`}
              themeColors={themeColors}
            />

            {receipt.unusedIncluded > 0 && (
              <Row
                label="Unused included"
                value={formatCurrency(receipt.unusedIncluded)}
                themeColors={themeColors}
              />
            )}

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
          </div>

          <div
            className="mt-4 flex items-start gap-2 rounded-[12px] p-3"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.1)'
                : 'rgba(96, 165, 250, 0.06)',
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(96, 165, 250, 0.2)'
                : 'rgba(96, 165, 250, 0.15)',
            }}
          >
            <Info
              size={14}
              style={{
                color: '#60A5FA',
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <p
              className="text-[12px] leading-[1.55]"
              style={{ color: themeColors.charcoal }}
            >
              Your withdrawal is being processed. Funds should land in your
              bank account within a few minutes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/wallet/${walletId}`)}
            className="mt-6 w-full rounded-[14px] px-4 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Back to wallet
          </button>
        </div>
      </AppLayout>
    )
  }

  // ─── Form screen ─────────────────────────────────────
  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/wallet/${walletId}`)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: themeColors.background }}
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <div>
            <h1
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Withdraw Funds
            </h1>
            <p
              className="text-[12px]"
              style={{ color: themeColors.mid }}
            >
              From {state.walletName}
            </p>
          </div>
        </div>

        {/* Available amount card */}
        <div
          className="rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div className="flex items-center gap-2">
            <Wallet size={14} style={{ color: themeColors.mid }} />
            <p
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.mid }}
            >
              Available to withdraw
            </p>
          </div>
          <p
            className="mt-1 text-[28px] font-bold leading-none"
            style={{
              color: themeColors.charcoal,
              fontFamily:
                "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {formatCurrency(availableAmount)}
          </p>
          <p
            className="mt-2 text-[11px]"
            style={{ color: themeColors.mid }}
          >
            This is the money released into this wallet that you haven't
            withdrawn yet.
          </p>
        </div>

        {/* Amount input */}
        <div className="mt-4">
          <label
            className="mb-1.5 flex items-center justify-between text-[13px] font-medium"
            style={{ color: themeColors.charcoal }}
          >
            <span>Amount to withdraw</span>
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
            />
          </div>

          {/* Quick-fill chips */}
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
        </div>

        {/* ─── Unused amount opt-in ─────────────────────── */}
        {unusedAmount > 0 && (
          <div className="mt-5">
            <button
              type="button"
              onClick={handleToggleUnused}
              className="flex w-full items-start gap-3 rounded-[14px] border p-4 text-left transition-all hover:opacity-90"
              style={{
                backgroundColor: includeUnused
                  ? isDark
                    ? 'rgba(15, 185, 110, 0.08)'
                    : 'rgba(15, 185, 110, 0.05)'
                  : themeColors.card,
                borderColor: includeUnused
                  ? themeColors.green
                  : themeColors.border,
                borderWidth: includeUnused ? 2 : 1,
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: includeUnused
                    ? themeColors.green
                    : isDark
                    ? 'rgba(15, 185, 110, 0.15)'
                    : 'rgba(15, 185, 110, 0.08)',
                  color: includeUnused ? '#FFFFFF' : themeColors.green,
                }}
              >
                <Coins size={18} strokeWidth={2} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Also withdraw unused money
                  </p>
                  {includeUnused ? (
                    <Plus size={14} style={{ color: themeColors.green }} />
                  ) : (
                    <Minus size={14} style={{ color: themeColors.mid }} />
                  )}
                </div>
                <p
                  className="mt-0.5 text-[12px] leading-[1.5]"
                  style={{ color: themeColors.mid }}
                >
                  You have{' '}
                  <strong style={{ color: themeColors.charcoal }}>
                    {formatCurrency(unusedAmount)}
                  </strong>{' '}
                  unused from previous releases. Add it to this withdrawal
                  and send everything to your bank.
                </p>
              </div>

              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: includeUnused
                    ? themeColors.green
                    : themeColors.border,
                  backgroundColor: includeUnused
                    ? themeColors.green
                    : 'transparent',
                }}
              >
                {includeUnused && (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: '#FFFFFF' }}
                  />
                )}
              </div>
            </button>
          </div>
        )}

        {/* Destination */}
        <div className="mt-4">
          <p
            className="mb-2 text-[13px] font-medium"
            style={{ color: themeColors.charcoal }}
          >
            Withdraw to
          </p>

          {bankAccount ? (
            <div
              className="flex items-center gap-3 rounded-[14px] border p-4"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              {bankAccount.bankImageUrl ? (
                <img
                  src={bankAccount.bankImageUrl}
                  alt={bankAccount.bankName}
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
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  {bankAccount.accountName}
                </p>
                <p
                  className="mt-0.5 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  {bankAccount.bankName} ·{' '}
                  {maskAccountNumber(bankAccount.accountNumber)}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-[14px] border py-6 text-center"
              style={{
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
              }}
            >
              <Lock size={24} style={{ color: themeColors.mid }} />
              <p
                className="mt-3 text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                No bank account linked
              </p>
              <p
                className="mt-1 max-w-[260px] text-[11px]"
                style={{ color: themeColors.mid }}
              >
                Link a bank account from the wallet's Bank tab to withdraw.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/wallet/${walletId}`)}
                className="mt-4 rounded-[10px] px-4 py-2 text-[12px] font-semibold"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                Go to wallet
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        {totalWithdrawing > 0 && (
          <div
            className="mt-4 space-y-2 rounded-[14px] border p-4"
            style={{
              backgroundColor: isDark
                ? 'rgba(15, 185, 110, 0.06)'
                : 'rgba(15, 185, 110, 0.03)',
              borderColor: isDark
                ? 'rgba(15, 185, 110, 0.2)'
                : 'rgba(15, 185, 110, 0.15)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[12px]"
                style={{ color: themeColors.mid }}
              >
                Wallet available
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(parsedAmount)}
              </span>
            </div>

            {includeUnused && unusedAmount > 0 && (
              <div className="flex items-center justify-between">
                <span
                  className="text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  Unused money
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: themeColors.green }}
                >
                  + {formatCurrency(unusedAmount)}
                </span>
              </div>
            )}

            {WITHDRAWAL_FEE > 0 && (
              <div className="flex items-center justify-between">
                <span
                  className="text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  Fee
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: '#F59E0B' }}
                >
                  + {formatCurrency(WITHDRAWAL_FEE)}
                </span>
              </div>
            )}

            <div
              className="h-px w-full"
              style={{ backgroundColor: themeColors.border }}
            />

            <div className="flex items-center justify-between">
              <span
                className="text-[12px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Total to bank
              </span>
              <span
                className="text-[14px] font-bold"
                style={{
                  color: exceedsAvailable
                    ? '#EF4444'
                    : themeColors.green,
                }}
              >
                {formatCurrency(totalWithdrawing)}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
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
            <p
              className="text-[12px]"
              style={{ color: '#EF4444' }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleOpenPinModal}
          disabled={!bankAccount || isSubmitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: themeColors.green,
            color: '#FFFFFF',
          }}
        >
          <ArrowDownToLine size={18} strokeWidth={2.2} />
          Withdraw{' '}
          {totalWithdrawing > 0 ? formatCurrency(totalWithdrawing) : ''}
        </button>

        <p
          className="mt-3 text-center text-[11px]"
          style={{ color: themeColors.mid }}
        >
          {includeUnused && unusedAmount > 0
            ? 'Includes your unused money. Funds will be sent to your linked bank account.'
            : 'Funds will be sent to your linked bank account. You\u2019ll be asked for your PIN to confirm.'}
        </p>
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

// ─── Small helper row ─────────────────────────────────

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