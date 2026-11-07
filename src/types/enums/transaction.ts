/**
 * Mirror of the backend transaction enums used across MOVA.
 * Keep these values aligned with the server contract so UI labels,
 * colors, and icons stay consistent everywhere they are rendered.
 */

export const TransactionType = {
  Deposit: 'Deposit',
  Release: 'Release',
  Withdrawal: 'Withdrawal',
  Refund: 'Refund',
  Reversal: 'Reversal',
  Fee: 'Fee',
  Refill: 'Refill',
  Debit: 'Debit',
  Payout: 'Payout',
  BillPayment: 'BillPayment',
} as const

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType]

export const TransactionStatus = {
  Pending: 'Pending',
  Processing: 'Processing',
  Completed: 'Completed',
  Failed: 'Failed',
  Reversed: 'Reversed',
  Abandoned: 'Abandoned',
  Refill: 'Refill',
} as const

export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus]

const normalizeText = (value?: string | null): string =>
  (value ?? '').trim().toLowerCase()

export const normalizeTransactionType = (
  value?: string | null
): TransactionType => {
  const normalized = normalizeText(value)

  switch (normalized) {
    case 'deposit':
      return TransactionType.Deposit
    case 'release':
      return TransactionType.Release
    case 'withdrawal':
    case 'withdraw':
    case 'cashout':
      return TransactionType.Withdrawal
    case 'refund':
      return TransactionType.Refund
    case 'reversal':
      return TransactionType.Reversal
    case 'fee':
    case 'servicefee':
      return TransactionType.Fee
    case 'refill':
      return TransactionType.Refill
    case 'debit':
      return TransactionType.Debit
    case 'payout':
      return TransactionType.Payout
    case 'billpayment':
    case 'bill payment':
    case 'utility':
    case 'utilities':
      return TransactionType.BillPayment
    default:
      return (value ?? TransactionType.Deposit) as TransactionType
  }
}

export const normalizeTransactionStatus = (
  value?: string | null
): TransactionStatus => {
  const normalized = normalizeText(value)

  switch (normalized) {
    case 'pending':
      return TransactionStatus.Pending
    case 'processing':
      return TransactionStatus.Processing
    case 'completed':
    case 'success':
      return TransactionStatus.Completed
    case 'failed':
    case 'error':
      return TransactionStatus.Failed
    case 'reversed':
      return TransactionStatus.Reversed
    case 'abandoned':
      return TransactionStatus.Abandoned
    case 'refill':
      return TransactionStatus.Refill
    default:
      return (value ?? TransactionStatus.Pending) as TransactionStatus
  }
}

export const getTransactionTypeLabel = (value?: string | null): string => {
  const type = normalizeTransactionType(value)

  switch (type) {
    case TransactionType.Deposit:
      return 'Deposit'
    case TransactionType.Release:
      return 'Release'
    case TransactionType.Withdrawal:
      return 'Withdrawal'
    case TransactionType.Refund:
      return 'Refund'
    case TransactionType.Reversal:
      return 'Reversal'
    case TransactionType.Fee:
      return 'Fee'
    case TransactionType.Refill:
      return 'Refill'
    case TransactionType.Debit:
      return 'Debit'
    case TransactionType.Payout:
      return 'Payout'
    case TransactionType.BillPayment:
      return 'Bill Payment'
    default:
      return value ?? 'Transaction'
  }
}

export const isTransactionCredit = (value?: string | null): boolean => {
  const type = normalizeTransactionType(value)

  return type === TransactionType.Deposit || type === TransactionType.Release || type === TransactionType.Refund || type === TransactionType.Refill
}

export const getTransactionStatusColor = (value?: string | null): string => {
  switch (normalizeTransactionStatus(value)) {
    case TransactionStatus.Completed:
      return '#10B981'
    case TransactionStatus.Processing:
      return '#60A5FA'
    case TransactionStatus.Pending:
      return '#F59E0B'
    case TransactionStatus.Failed:
      return '#EF4444'
    case TransactionStatus.Reversed:
    case TransactionStatus.Abandoned:
      return '#9CA3AF'
    case TransactionStatus.Refill:
      return '#8B5CF6'
    default:
      return '#64748B'
  }
}
