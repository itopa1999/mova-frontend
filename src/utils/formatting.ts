const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', CURRENCY_FORMAT_OPTIONS).format(amount)
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}k`
  }
  return `₦${amount}`
}

export function formatAmount(value: number | string): string {
  if (value === '') return '0'
  const amount = typeof value === 'number' ? value : parseInt(value, 10)
  return amount.toLocaleString()
}

function toValidDate(value: string): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(
  value: string,
  locale = 'en-NG',
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
): string {
  const date = toValidDate(value)
  return date ? date.toLocaleDateString(locale, options) : '—'
}

export function formatTime(
  value: string,
  locale = 'en-NG',
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  const date = toValidDate(value)
  return date ? date.toLocaleTimeString(locale, options) : '—'
}

export function formatDateTime(
  value: string,
  locale = 'en-NG',
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  const date = toValidDate(value)
  return date ? date.toLocaleString(locale, options) : '—'
}

export function formatUSDate(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
): string {
  return formatDate(value, 'en-US', options)
}

export function formatLongDate(value: string): string {
  return formatDate(value, 'en-NG', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatUSTime(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
): string {
  return formatTime(value, 'en-US', options)
}

export function formatUSDateTime(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  },
): string {
  return formatDateTime(value, 'en-US', options)
}

export function formatRelativeDate(
  value: string,
  now = new Date(),
): string {
  const date = toValidDate(value)
  if (!date) return '—'

  const elapsedMs = now.getTime() - date.getTime()
  const elapsedMinutes = Math.floor(elapsedMs / 60_000)
  const elapsedHours = Math.floor(elapsedMs / 3_600_000)
  const elapsedDays = Math.floor(elapsedMs / 86_400_000)

  if (elapsedMinutes < 1) return 'Just now'
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`
  if (elapsedHours < 24) return `${elapsedHours}h`
  if (elapsedDays < 7) return `${elapsedDays}d`

  return formatDate(value, 'en-NG', {
    month: 'short',
    day: 'numeric',
  })
}
