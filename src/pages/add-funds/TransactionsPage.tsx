// src/pages/app/TransactionsPage.tsx

import {
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Receipt,
  Copy,
  Check,
  Calendar,
  Tag,
  Hash,
  Wallet,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import BackButton from '../../components/ui/BackButton'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import { getTransactions } from '../../services/app/transactions'
import type {
  TransactionItem,
  TransactionType,
  TransactionStatus,
  PaymentProvider,
  TransactionsFilter,
} from '../../services/app/transactions'
import {
  formatCurrency,
  formatUSDateTime as formatDateTime,
} from '../../utils/formatting'

const PAGE_SIZE = 20

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'Deposit', label: 'Deposit' },
  { value: 'Release', label: 'Release' },
  { value: 'Fee', label: 'Fee' },
  { value: 'Withdrawal', label: 'Withdrawal' },
  { value: 'Payout', label: 'Payout' },
  { value: 'BillPayment', label: 'Bill Payment' },
  { value: 'Reversal', label: 'Reversal' },
]

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Reversed', label: 'Reversed' },
]

const PROVIDER_OPTIONS: { value: PaymentProvider; label: string }[] = [
  { value: 'Paystack', label: 'Paystack' },
  { value: 'Monnify', label: 'Monnify' },
  { value: 'Flutterwave', label: 'Flutterwave' },
]

type SheetKey = 'filters' | 'details'

export default function TransactionsPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const sheet = useBottomSheet<SheetKey>()

  const [items, setItems] = useState<TransactionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Filters
  const [type, setType] = useState<TransactionType | null>(null)
  const [status, setStatus] = useState<TransactionStatus | null>(null)
  const [provider, setProvider] = useState<PaymentProvider | null>(null)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Details
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionItem | null>(null)
  const [copied, setCopied] = useState(false)

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (type) n++
    if (status) n++
    if (provider) n++
    if (fromDate) n++
    if (toDate) n++
    return n
  }, [type, status, provider, fromDate, toDate])

  const buildFilter = (): TransactionsFilter => ({
    page,
    pageSize: PAGE_SIZE,
    type: type ?? undefined,
    status: status ?? undefined,
    provider: provider ?? undefined,
    fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
    toDate: toDate
      ? new Date(`${toDate}T23:59:59.999Z`).toISOString()
      : undefined,
    search: search.trim() ? search.trim() : undefined,
  })

  const load = async (targetPage: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await getTransactions({
        ...buildFilter(),
        page: targetPage,
      })

      if (res.is_success && res.data) {
        setItems(res.data.items)
        setPage(res.data.page)
        setTotalPages(res.data.totalPages || 1)
        setTotalItems(res.data.totalItems)
      } else {
        setError(res.message || 'Failed to load transactions.')
        setItems([])
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, status, provider, fromDate, toDate])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      load(1)
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const clearAllFilters = () => {
    setType(null)
    setStatus(null)
    setProvider(null)
    setFromDate('')
    setToDate('')
    setSearch('')
  }

  const isCredit = (t: TransactionItem): boolean => {
    return t.type.toLowerCase() === 'deposit'
  }

  const getStatusColor = (s: string): string => {
    switch (s.toLowerCase()) {
      case 'completed':
        return themeColors.green
      case 'processing':
        return '#60A5FA'
      case 'pending':
        return '#F59E0B'
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

  const handleRowClick = (transaction: TransactionItem) => {
    setSelectedTransaction(transaction)
    setCopied(false)
    sheet.open('details')
  }

  const handleCloseDetails = () => {
    sheet.close()
    // Slight delay so the close animation finishes before clearing
    setTimeout(() => {
      setSelectedTransaction(null)
      setCopied(false)
    }, 200)
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'success', message: 'Copied to clipboard.' },
        })
      )
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: 'Failed to copy.' },
        })
      )
    }
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} variant="subtle" />
          <div className="flex-1">
            <h1
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Transactions
            </h1>
            <p className="text-[12px]" style={{ color: themeColors.mid }}>
              {totalItems} total
            </p>
          </div>
          <button
            type="button"
            onClick={() => sheet.open('filters')}
            className="relative flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-opacity hover:opacity-70"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
              color: themeColors.charcoal,
            }}
          >
            <Filter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                style={{
                  backgroundColor: themeColors.green,
                  color: '#FFFFFF',
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div
          className="mb-4 flex items-center rounded-[12px] border px-3"
          style={{
            borderColor: themeColors.border,
            backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
          }}
        >
          <Search size={16} style={{ color: themeColors.mid }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or reference"
            className="w-full border-0 bg-transparent py-3 pl-2 text-[14px] outline-none"
            style={{ color: themeColors.charcoal }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="transition-opacity hover:opacity-70"
              aria-label="Clear search"
            >
              <X size={16} style={{ color: themeColors.mid }} />
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {type && (
              <FilterChip
                label={type}
                onRemove={() => setType(null)}
                themeColors={themeColors}
                isDark={isDark}
              />
            )}
            {status && (
              <FilterChip
                label={status}
                onRemove={() => setStatus(null)}
                themeColors={themeColors}
                isDark={isDark}
              />
            )}
            {provider && (
              <FilterChip
                label={provider}
                onRemove={() => setProvider(null)}
                themeColors={themeColors}
                isDark={isDark}
              />
            )}
            {fromDate && (
              <FilterChip
                label={`From ${fromDate}`}
                onRemove={() => setFromDate('')}
                themeColors={themeColors}
                isDark={isDark}
              />
            )}
            {toDate && (
              <FilterChip
                label={`To ${toDate}`}
                onRemove={() => setToDate('')}
                themeColors={themeColors}
                isDark={isDark}
              />
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{ color: '#EF4444' }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: themeColors.green }}
            />
            <p className="mt-3 text-[13px]" style={{ color: themeColors.mid }}>
              Loading transactions...
            </p>
          </div>
        ) : error ? (
          <div
            className="rounded-[12px] p-4 text-[13px]"
            style={{
              backgroundColor: isDark
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(239, 68, 68, 0.06)',
              color: '#EF4444',
            }}
          >
            {error}
          </div>
        ) : items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            style={{ color: themeColors.mid }}
          >
            <Receipt size={32} strokeWidth={1.5} />
            <p className="mt-3 text-[14px] font-medium">
              No transactions found
            </p>
            <p className="mt-1 text-[12px]">
              {activeFilterCount > 0 || search
                ? 'Try adjusting your filters or search.'
                : "You haven't made any transactions yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleRowClick(t)}
                className="flex w-full items-center justify-between rounded-[12px] border p-3 text-left transition-all hover:opacity-90 active:scale-[0.99]"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isCredit(t)
                        ? 'rgba(15, 151, 61, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                      color: isCredit(t) ? themeColors.green : '#EF4444',
                    }}
                  >
                    {isCredit(t) ? (
                      <ArrowDownRight size={16} strokeWidth={2} />
                    ) : (
                      <ArrowUpRight size={16} strokeWidth={2} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[14px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      {t.title || t.type}
                    </p>

                    {/* Wallet name — only when it exists and differs from the title */}
                    {t.walletName && (
                      <p
                        className="mt-0.5 flex items-center gap-1 truncate text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        <Wallet
                          size={10}
                          strokeWidth={2.4}
                          style={{ flexShrink: 0 }}
                        />
                        <span className="truncate">{t.walletName}</span>
                      </p>
                    )}

                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                        style={{
                          backgroundColor: getStatusColor(t.status) + '20',
                          color: getStatusColor(t.status),
                        }}
                      >
                        {t.status}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        {formatDateTime(t.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <p
                  className="ml-3 text-[14px] font-bold"
                  style={{
                    color: isCredit(t) ? themeColors.green : '#EF4444',
                    fontFamily:
                      "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  {isCredit(t) ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && items.length > 0 && totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              className="flex items-center gap-1 rounded-[10px] border px-3 py-2 text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.card,
                color: themeColors.charcoal,
              }}
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <span className="text-[12px]" style={{ color: themeColors.mid }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
              className="flex items-center gap-1 rounded-[10px] border px-3 py-2 text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.card,
                color: themeColors.charcoal,
              }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ─── Filters Bottom Sheet ─────────────────────────── */}
      <BottomSheet
        isOpen={sheet.activeSheet === 'filters'}
        onClose={sheet.close}
        title="Filter Transactions"
        icon={<Filter size={16} strokeWidth={2.4} />}
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                clearAllFilters()
                sheet.close()
              }}
              className="flex-1 rounded-[12px] border px-4 py-3 text-[14px] font-semibold"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.card,
                color: themeColors.charcoal,
              }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => sheet.close()}
              className="flex-1 rounded-[12px] px-4 py-3 text-[14px] font-semibold"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              Apply
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Type */}
          <div>
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.mid }}
            >
              Type
            </p>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setType(type === opt.value ? null : opt.value)
                  }
                  className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={{
                    borderColor:
                      type === opt.value
                        ? themeColors.green
                        : themeColors.border,
                    backgroundColor:
                      type === opt.value
                        ? isDark
                          ? 'rgba(15, 185, 110, 0.15)'
                          : 'rgba(15, 185, 110, 0.08)'
                        : 'transparent',
                    color:
                      type === opt.value
                        ? themeColors.green
                        : themeColors.charcoal,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.mid }}
            >
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setStatus(status === opt.value ? null : opt.value)
                  }
                  className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={{
                    borderColor:
                      status === opt.value
                        ? themeColors.green
                        : themeColors.border,
                    backgroundColor:
                      status === opt.value
                        ? isDark
                          ? 'rgba(15, 185, 110, 0.15)'
                          : 'rgba(15, 185, 110, 0.08)'
                        : 'transparent',
                    color:
                      status === opt.value
                        ? themeColors.green
                        : themeColors.charcoal,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Provider */}
          <div>
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.mid }}
            >
              Provider
            </p>
            <div className="flex flex-wrap gap-2">
              {PROVIDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setProvider(provider === opt.value ? null : opt.value)
                  }
                  className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={{
                    borderColor:
                      provider === opt.value
                        ? themeColors.green
                        : themeColors.border,
                    backgroundColor:
                      provider === opt.value
                        ? isDark
                          ? 'rgba(15, 185, 110, 0.15)'
                          : 'rgba(15, 185, 110, 0.08)'
                        : 'transparent',
                    color:
                      provider === opt.value
                        ? themeColors.green
                        : themeColors.charcoal,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: themeColors.mid }}
            >
              Date range
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="mb-1 block text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  From
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-[10px] border px-3 py-2 text-[13px] outline-none"
                  style={{
                    borderColor: themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                    color: themeColors.charcoal,
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  To
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-[10px] border px-3 py-2 text-[13px] outline-none"
                  style={{
                    borderColor: themeColors.border,
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F9FAFB',
                    color: themeColors.charcoal,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* ─── Transaction Details Bottom Sheet ─────────────── */}
      <BottomSheet
        isOpen={sheet.activeSheet === 'details' && selectedTransaction !== null}
        onClose={handleCloseDetails}
        title="Transaction Details"
        icon={<Receipt size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={handleCloseDetails}
            className="w-full rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Done
          </button>
        }
      >
        {selectedTransaction && (
          <div className="space-y-4">
            {/* Hero: amount + status */}
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isCredit(selectedTransaction)
                    ? 'rgba(15, 151, 61, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  color: isCredit(selectedTransaction)
                    ? themeColors.green
                    : '#EF4444',
                }}
              >
                {isCredit(selectedTransaction) ? (
                  <ArrowDownRight size={24} strokeWidth={2} />
                ) : (
                  <ArrowUpRight size={24} strokeWidth={2} />
                )}
              </div>

              <p
                className="mt-3 text-[28px] font-bold leading-none"
                style={{
                  color: isCredit(selectedTransaction)
                    ? themeColors.green
                    : '#EF4444',
                  fontFamily:
                    "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: '-0.02em',
                }}
              >
                {isCredit(selectedTransaction) ? '+' : '-'}
                {formatCurrency(selectedTransaction.amount)}
              </p>

              <p
                className="mt-2 text-[13px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                {selectedTransaction.title || selectedTransaction.type}
              </p>

              {selectedTransaction.walletName && (
                <p
                  className="mt-1 flex items-center gap-1.5 text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  <Wallet size={12} strokeWidth={2.4} />
                  {selectedTransaction.walletName}
                </p>
              )}

              <span
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor:
                    getStatusColor(selectedTransaction.status) + '20',
                  color: getStatusColor(selectedTransaction.status),
                }}
              >
                {selectedTransaction.status.toLowerCase() === 'completed' && (
                  <CheckCircle size={11} strokeWidth={2.5} />
                )}
                {selectedTransaction.status.toLowerCase() === 'failed' && (
                  <AlertCircle size={11} strokeWidth={2.5} />
                )}
                {selectedTransaction.status.toLowerCase() === 'pending' && (
                  <Clock size={11} strokeWidth={2.5} />
                )}
                {selectedTransaction.status.toLowerCase() === 'processing' && (
                  <Loader2
                    size={11}
                    strokeWidth={2.5}
                    className="animate-spin"
                  />
                )}
                {selectedTransaction.status}
              </span>
            </div>

            {/* Failure reason (only when failed) */}
            {selectedTransaction.status.toLowerCase() === 'failed' &&
              selectedTransaction.failureReason && (
                <div
                  className="flex items-start gap-3 rounded-[12px] border p-3.5"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'rgba(239, 68, 68, 0.05)',
                    borderColor: isDark
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <AlertCircle
                    size={16}
                    style={{ color: '#EF4444', marginTop: 1, flexShrink: 0 }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: '#EF4444' }}
                    >
                      Failure reason
                    </p>
                    <p
                      className="mt-1 text-[12px] leading-[1.5]"
                      style={{ color: themeColors.charcoal }}
                    >
                      {selectedTransaction.failureReason}
                    </p>
                  </div>
                </div>
              )}

            {/* Details list */}
            <div
              className="rounded-[12px] border"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.02)'
                  : '#FAFBFC',
                borderColor: themeColors.border,
              }}
            >
              <DetailRow
                icon={<Tag size={13} />}
                label="Type"
                value={selectedTransaction.type}
                themeColors={themeColors}
              />
              <Divider themeColors={themeColors} />

              <DetailRow
                icon={<CreditCard size={13} />}
                label="Provider"
                value={selectedTransaction.provider ?? '—'}
                themeColors={themeColors}
              />
              <Divider themeColors={themeColors} />

              {selectedTransaction.walletName && (
                <>
                  <DetailRow
                    icon={<Wallet size={13} />}
                    label="Wallet"
                    value={selectedTransaction.walletName}
                    themeColors={themeColors}
                  />
                  <Divider themeColors={themeColors} />
                </>
              )}

              <DetailRow
                icon={<Clock size={13} />}
                label="Created"
                value={formatDateTime(selectedTransaction.createdAt)}
                themeColors={themeColors}
              />

              {selectedTransaction.completedAt && (
                <>
                  <Divider themeColors={themeColors} />
                  <DetailRow
                    icon={<CheckCircle size={13} />}
                    label="Completed"
                    value={formatDateTime(selectedTransaction.completedAt)}
                    themeColors={themeColors}
                  />
                </>
              )}

              {selectedTransaction.reference && (
                <>
                  <Divider themeColors={themeColors} />
                  <div className="flex items-start justify-between gap-3 px-3 py-3">
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-0.5"
                        style={{ color: themeColors.mid }}
                      >
                        <Hash size={13} />
                      </span>
                      <span
                        className="text-[12px]"
                        style={{ color: themeColors.mid }}
                      >
                        Reference
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                      <span
                        className="truncate text-right text-[12px] font-semibold"
                        style={{
                          color: themeColors.charcoal,
                          fontFamily: 'monospace',
                        }}
                      >
                        {selectedTransaction.reference}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(selectedTransaction.reference ?? '')
                        }
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)',
                          color: themeColors.mid,
                        }}
                        aria-label="Copy reference"
                      >
                        {copied ? (
                          <Check
                            size={11}
                            strokeWidth={2.5}
                            style={{ color: themeColors.green }}
                          />
                        ) : (
                          <Copy size={11} strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Divider themeColors={themeColors} />
              <DetailRow
                icon={<Calendar size={13} />}
                label="Transaction ID"
                value={`#${selectedTransaction.id}`}
                themeColors={themeColors}
              />
            </div>

            {/* Hint */}
            <p
              className="text-center text-[11px] leading-[1.5]"
              style={{ color: themeColors.mid }}
            >
              If you need help with this transaction, share the reference with
              support.
            </p>
          </div>
        )}
      </BottomSheet>
    </AppLayout>
  )
}

// ─── Small filter chip component ──────────────────────

function FilterChip({
  label,
  onRemove,
  themeColors,
  isDark,
}: {
  label: string
  onRemove: () => void
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
}) {
  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
      style={{
        backgroundColor: isDark
          ? 'rgba(15, 185, 110, 0.15)'
          : 'rgba(15, 185, 110, 0.08)',
        color: themeColors.green,
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full transition-opacity hover:opacity-70"
        aria-label={`Remove ${label} filter`}
      >
        <X size={11} strokeWidth={2.5} />
      </button>
    </span>
  )
}

// ─── Detail row component ─────────────────────────────

function DetailRow({
  icon,
  label,
  value,
  themeColors,
}: {
  icon: React.ReactNode
  label: string
  value: string
  themeColors: typeof colors | typeof darkColors
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <div className="flex items-center gap-2">
        <span style={{ color: themeColors.mid }}>{icon}</span>
        <span className="text-[12px]" style={{ color: themeColors.mid }}>
          {label}
        </span>
      </div>
      <span
        className="text-[13px] font-semibold"
        style={{ color: themeColors.charcoal }}
      >
        {value}
      </span>
    </div>
  )
}

function Divider({
  themeColors,
}: {
  themeColors: typeof colors | typeof darkColors
}) {
  return (
    <div
      className="h-px w-full"
      style={{ backgroundColor: themeColors.border }}
    />
  )
}