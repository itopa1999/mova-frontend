// src/pages/app/TransactionsPage.tsx

import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Receipt,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'
import {
  getTransactions,
} from '../../services/app/transactions'
import type {
  TransactionItem,
  TransactionType,
  TransactionStatus,
  PaymentProvider,
  TransactionsFilter,
} from '../../services/app/transactions'

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

type SheetKey = 'filters'

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

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDateTime = (iso: string): string => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isCredit = (t: TransactionItem): boolean => {
    // Only deposits credit the balance.
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

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
              <div
                key={t.id}
                className="flex items-center justify-between rounded-[12px] border p-3"
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
                    <div className="mt-0.5 flex items-center gap-2">
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
              </div>
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