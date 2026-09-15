import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  Home,
  History,
  Search,
  Info,
  Wallet,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'

import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { colors, darkColors } from '../../styles/tokens'

type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Reversed'
  | 'NotFound'

type StatusConfig = {
  icon: typeof CheckCircle
  title: string
  description: string
  color: string
  bgLight: string
  bgDark: string
  ctaPrimary: string
  ctaSecondary: string
}

// ─── Info sheet content ────────────────────────────────
type PaymentInfoKey = 'mainAccount' | 'pendingReassurance'

const PAYMENT_INFO: Record<
  PaymentInfoKey,
  { title: string; body: React.ReactNode }
> = {
  mainAccount: {
    title: 'Settled in your main account',
    body: (
      <>
        <p className="text-[13px] leading-[1.65]">
          This payment was credited to your{' '}
          <strong>main balance</strong>, not a controlled wallet.
        </p>
        <p className="mt-3 text-[13px] leading-[1.65]">
          Your main balance is spendable at any time. To protect your money
          from impulse spending, create a wallet and allocate the amount —
          funds stay locked until your schedule releases them.
        </p>
        <p className="mt-3 text-[13px] leading-[1.65]">
          You can also leave it as-is if you need it available right away.
        </p>
      </>
    ),
  },
  pendingReassurance: {
    title: 'Where will the money go?',
    body: (
      <>
        <p className="text-[13px] leading-[1.65]">
          Once this payment settles, the money will land in your{' '}
          <strong>main account balance</strong> — not in a controlled wallet.
        </p>
        <p className="mt-3 text-[13px] leading-[1.65]">
          From there, you can allocate it to any wallet you like. That's the
          normal flow — payments always settle into your main balance first.
        </p>
      </>
    ),
  },
}

const STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  Pending: {
    icon: Clock,
    title: 'Payment Pending',
    description:
      "We're waiting to receive your payment. This can take a moment — please don't close this page.",
    color: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.10)',
    bgDark: 'rgba(245, 158, 11, 0.18)',
    ctaPrimary: 'Back to Add Funds',
    ctaSecondary: 'View history',
  },
  Processing: {
    icon: Loader2,
    title: 'Payment Processing',
    description:
      'Your payment is being confirmed by the gateway. This usually takes a few seconds.',
    color: '#60A5FA',
    bgLight: 'rgba(96, 165, 250, 0.10)',
    bgDark: 'rgba(96, 165, 250, 0.18)',
    ctaPrimary: 'Back to Add Funds',
    ctaSecondary: 'View history',
  },
  Completed: {
    icon: CheckCircle,
    title: 'Payment Successful',
    description:
      'Your main account has been credited. You can now allocate these funds to a wallet of your choice.',
    color: '#22C55E',
    bgLight: 'rgba(34, 197, 94, 0.10)',
    bgDark: 'rgba(34, 197, 94, 0.18)',
    ctaPrimary: 'Back to Add Funds',
    ctaSecondary: 'View history',
  },
  Failed: {
    icon: XCircle,
    title: 'Payment Failed',
    description:
      "Your payment didn't go through. You can try again with a different payment method.",
    color: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.10)',
    bgDark: 'rgba(239, 68, 68, 0.18)',
    ctaPrimary: 'Back to Add Funds',
    ctaSecondary: 'View history',
  },
  Reversed: {
    icon: AlertTriangle,
    title: 'Payment Reversed',
    description:
      'This payment was reversed and the funds have been returned. If you were charged, contact support.',
    color: '#9CA3AF',
    bgLight: 'rgba(156, 163, 175, 0.10)',
    bgDark: 'rgba(156, 163, 175, 0.18)',
    ctaPrimary: 'Back to Add Funds',
    ctaSecondary: 'View history',
  },
  NotFound: {
    icon: Search,
    title: 'Payment Not Found',
    description:
      "We couldn't find a payment matching this reference. If you were charged, please contact support with your reference number.",
    color: '#9CA3AF',
    bgLight: 'rgba(156, 163, 175, 0.10)',
    bgDark: 'rgba(156, 163, 175, 0.18)',
    ctaPrimary: 'Back to Add Funds',
    ctaSecondary: 'View history',
  },
}

export default function PaymentConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const reference = searchParams.get('reference') ?? ''
  const amountParam = searchParams.get('amount')
  const createdAt = searchParams.get('createdAt')
  const rawStatus = searchParams.get('status') ?? 'Processing'

  const status: PaymentStatus =
    rawStatus in STATUS_CONFIG
      ? (rawStatus as PaymentStatus)
      : 'Processing'

  const config = STATUS_CONFIG[status]
  const StatusIcon = config.icon

  const [copied, setCopied] = useState(false)

  // 👇 Bottom sheet for the info explanations
  const infoSheet = useBottomSheet<PaymentInfoKey>()

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)

  const formatDateTime = (value: string): string => {
    try {
      return new Date(value).toLocaleString('en-NG', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return value
    }
  }

  const handleCopyReference = async () => {
    if (!reference) return
    try {
      await navigator.clipboard.writeText(reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handlePrimaryCta = () => {
    navigate('/add-funds')
  }

  const handleSecondaryCta = () => {
    navigate('/add-funds?tab=history')
  }

  const parsedAmount =
    amountParam && !isNaN(Number(amountParam)) ? Number(amountParam) : null

  const isCompleted = status === 'Completed'
  const isPendingOrProcessing =
    status === 'Pending' || status === 'Processing'

  return (
    <AppLayout>
      <div className="py-5">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/add-funds')}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all hover:opacity-70 active:scale-95"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.card,
            }}
            aria-label="Back"
          >
            <ArrowLeft size={20} style={{ color: themeColors.charcoal }} />
          </button>
          <h1
            className="text-[20px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Payment Status
          </h1>
        </div>

        {/* Status Hero */}
        <div
          className="rounded-[20px] border p-6 text-center"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark ? config.bgDark : config.bgLight,
            }}
          >
            <StatusIcon
              size={40}
              strokeWidth={2}
              style={{ color: config.color }}
              className={status === 'Processing' ? 'animate-spin' : ''}
            />
          </div>

          <h2
            className="mt-5 text-[20px] font-extrabold tracking-[-0.02em]"
            style={{ color: themeColors.charcoal }}
          >
            {config.title}
          </h2>

          <p
            className="mx-auto mt-2 max-w-[320px] text-[13px] leading-[1.55]"
            style={{ color: themeColors.mid }}
          >
            {config.description}
          </p>

          {parsedAmount !== null && (
            <p
              className="mt-5 text-[28px] font-bold"
              style={{
                color: config.color,
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {formatCurrency(parsedAmount)}
            </p>
          )}
        </div>

        {/* 💡 Completed-only tappable banner → opens BottomSheet */}
        {isCompleted && (
          <button
            type="button"
            onClick={() => infoSheet.open('mainAccount')}
            className="mt-4 flex w-full cursor-pointer items-start gap-3 rounded-[14px] border p-4 text-left transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              backgroundColor: isDark
                ? 'rgba(34, 197, 94, 0.08)'
                : 'rgba(34, 197, 94, 0.05)',
              borderColor: isDark
                ? 'rgba(34, 197, 94, 0.25)'
                : 'rgba(34, 197, 94, 0.2)',
            }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: config.color,
                color: '#FFFFFF',
              }}
            >
              <Wallet size={18} strokeWidth={2.2} />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Settled in your main account
              </p>
              <p
                className="mt-0.5 text-[12px] leading-[1.55]"
                style={{ color: themeColors.mid }}
              >
                Credited to your{' '}
                <strong style={{ color: themeColors.charcoal }}>
                  main balance
                </strong>
                , not a controlled wallet. Tap to learn more.
              </p>
            </div>

            <ChevronRight
              size={18}
              style={{
                color: themeColors.mid,
                flexShrink: 0,
                marginTop: 6,
              }}
            />
          </button>
        )}

        {/* Details Card */}
        <div
          className="mt-4 rounded-[16px] border p-4"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          }}
        >
          <p
            className="mb-3 text-[13px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            Payment details
          </p>

          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Status
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase"
                style={{
                  backgroundColor: isDark ? config.bgDark : config.bgLight,
                  color: config.color,
                }}
              >
                {status}
              </span>
            </div>

            {/* Date */}
            {createdAt && (
              <div className="flex items-center justify-between">
                <span
                  className="text-[12px]"
                  style={{ color: themeColors.mid }}
                >
                  Date
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  {formatDateTime(createdAt)}
                </span>
              </div>
            )}

            {/* Reference */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Reference
              </span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="flex max-w-[200px] cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 transition-all hover:opacity-70"
                style={{ backgroundColor: themeColors.background }}
                disabled={!reference}
              >
                <span
                  className="truncate font-mono text-[11px]"
                  style={{ color: themeColors.charcoal }}
                >
                  {reference || 'N/A'}
                </span>
                {copied ? (
                  <Check size={12} style={{ color: config.color }} />
                ) : (
                  <Copy size={12} style={{ color: themeColors.mid }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 💡 Pending/Processing tappable banner → opens BottomSheet */}
        {isPendingOrProcessing && (
          <button
            type="button"
            onClick={() => infoSheet.open('pendingReassurance')}
            className="mt-4 flex w-full cursor-pointer items-start gap-2 rounded-[12px] p-3 text-left transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.08)'
                : 'rgba(96, 165, 250, 0.05)',
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
            <div className="min-w-0 flex-1">
              <p
                className="text-[12px] leading-[1.55]"
                style={{ color: themeColors.mid }}
              >
                Once settled, this payment will land in your{' '}
                <strong style={{ color: themeColors.charcoal }}>
                  main account balance
                </strong>{' '}
                — not in a wallet.
              </p>
            </div>
            <ChevronRight
              size={14}
              style={{
                color: themeColors.mid,
                flexShrink: 0,
                marginTop: 2,
              }}
            />
          </button>
        )}

        {/* CTAs */}
        <div className="mt-6 space-y-3">
          <Button type="button" onClick={handlePrimaryCta}>
            <span className="flex items-center justify-center gap-2">
              <Home size={16} />
              {config.ctaPrimary}
            </span>
          </Button>

          <button
            type="button"
            onClick={handleSecondaryCta}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
              color: themeColors.charcoal,
            }}
          >
            <History size={16} />
            {config.ctaSecondary}
          </button>
        </div>

        {/* Footer note */}
        <p
          className="mt-6 text-center text-[11px]"
          style={{ color: themeColors.light }}
        >
          Need help? Contact support with your reference number.
        </p>
      </div>

      {/* ───────── Info Bottom Sheet ───────── */}
      <BottomSheet
        isOpen={infoSheet.activeSheet !== null}
        onClose={infoSheet.close}
        title={
          infoSheet.activeSheet
            ? PAYMENT_INFO[infoSheet.activeSheet].title
            : ''
        }
        icon={<Info size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={infoSheet.close}
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
          {infoSheet.activeSheet
            ? PAYMENT_INFO[infoSheet.activeSheet].body
            : null}
        </div>
      </BottomSheet>
    </AppLayout>
  )
}