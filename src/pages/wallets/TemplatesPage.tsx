import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  X,
  Loader2,
  Frown,
  Sparkles,
  Wallet,
  ArrowRight,
  Calendar,
  Target,
  Banknote,
  Landmark,
  Lock,
  Tag,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import * as Icons from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BottomSheet from '../../components/ui/BottomSheet'
import BackButton from '../../components/ui/BackButton'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import { getWalletTemplates } from '../../services/app/walletTemplates'
import type { WalletTemplate } from '../../services/app/walletTemplates'
import {
  formatCompactCurrency,
  formatCurrency,
} from '../../utils/formatting'

type IconLookup = Record<string, LucideIcon | undefined>

type TypeFilter = 'all' | 'scheduled' | 'trustee'

interface TemplatesRouteState {
  walletType?: string
}

const resolveIcon = (name: string): LucideIcon => {
  const icon = (Icons as unknown as IconLookup)[name]
  return icon ?? Wallet
}

const isTrusteeTemplate = (template: WalletTemplate): boolean => {
  const resolved = (
    template.walletType ??
    template.categoryType ??
    'scheduled'
  ).toLowerCase()
  return resolved === 'trustee'
}

const describeFrequency = (frequency: string): string => {
  switch (frequency.toLowerCase()) {
    case 'once':
      return 'Once'
    case 'hourly':
      return 'Hourly'
    case 'daily':
      return 'Daily'
    case 'weekly':
      return 'Weekly'
    case 'monthly':
      return 'Monthly'
    case 'quarterly':
      return 'Quarterly'
    case 'yearly':
      return 'Yearly'
    case 'custom':
      return 'Custom'
    default:
      return frequency
  }
}

const describeDestination = (destination: string): string => {
  switch (destination.toLowerCase()) {
    case 'bank':
      return 'Sent to bank account'
    case 'wallet':
      return 'Kept in wallet balance'
    case 'main':
      return 'Added to main MOVA balance'
    default:
      return 'Wallet balance'
  }
}

function TemplateCard({
  template,
  onClick,
  themeColors,
  isDark,
}: {
  template: WalletTemplate
  onClick: () => void
  themeColors: typeof colors | typeof darkColors
  isDark: boolean
}) {
  const Icon = resolveIcon(template.iconName)
  const trustee = isTrusteeTemplate(template)

  const accent = trustee ? '#60A5FA' : themeColors.green

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-start rounded-[16px] border p-3.5 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
        boxShadow: isDark
          ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
          : '0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)',
      }}
    >
      <span
        className="absolute right-2 top-2 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide"
        style={{
          backgroundColor: isDark ? `${accent}33` : `${accent}1A`,
          color: accent,
        }}
      >
        {trustee ? (
          <Shield size={9} strokeWidth={2.5} />
        ) : (
          <Calendar size={9} strokeWidth={2.5} />
        )}
        {trustee ? 'Trustee' : 'Scheduled'}
      </span>

      <div
        className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-[12px]"
        style={{
          backgroundColor: isDark ? `${accent}33` : `${accent}1A`,
          color: accent,
        }}
      >
        <Icon size={20} strokeWidth={2} />
      </div>

      <p
        className="text-[13px] font-semibold leading-tight"
        style={{ color: themeColors.charcoal }}
      >
        {template.name}
      </p>

      <p
        className="mt-1 text-[10px] leading-[1.4]"
        style={{ color: themeColors.mid }}
      >
        {template.description}
      </p>

      <div
        className="mt-3 w-full space-y-1 border-t pt-2.5"
        style={{ borderColor: themeColors.border }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px]" style={{ color: themeColors.mid }}>
            Target
          </span>
          <span
            className="text-[11px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            {formatCompactCurrency(template.defaultTargetAmount)}
          </span>
        </div>

        {trustee ? (
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: themeColors.mid }}>
              Approval
            </span>
            <span className="text-[10px] font-medium" style={{ color: accent }}>
              Trustee required
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: themeColors.mid }}>
                Per release
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                {formatCompactCurrency(template.defaultReleaseAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: themeColors.mid }}>
                Frequency
              </span>
              <span
                className="text-[10px] font-medium"
                style={{ color: accent }}
              >
                {describeFrequency(template.defaultFrequency)}
              </span>
            </div>
          </>
        )}
      </div>
    </button>
  )
}

export default function TemplatesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const routeState = location.state as TemplatesRouteState | null
  const routeWalletType = (() => {
    const raw = routeState?.walletType?.toLowerCase()
    return raw === 'scheduled' || raw === 'trustee' ? raw : null
  })()

  const [activeType, setActiveType] = useState<TypeFilter>(
    () => routeWalletType ?? 'all'
  )
  const [templates, setTemplates] = useState<WalletTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<WalletTemplate | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (routeWalletType) setActiveType(routeWalletType)
  }, [routeWalletType])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      const walletTypeParam =
        activeType === 'scheduled'
          ? 'Scheduled'
          : activeType === 'trustee'
          ? 'Trustee'
          : undefined

      const res = await getWalletTemplates(
        1,
        100,
        undefined,
        undefined,
        walletTypeParam
      )

      if (cancelled) return

      if (res.is_success && res.data) {
        setTemplates(res.data.items)
      } else {
        setLoadError(res.message || 'Failed to load templates.')
      }

      setIsLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [activeType, reloadToken])

  const visibleTemplates = useMemo(() => {
    if (!searchTerm.trim()) return templates
    const term = searchTerm.trim().toLowerCase()
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.categoryName.toLowerCase().includes(term) ||
        t.tags.some((tag) => tag.toLowerCase().includes(term))
    )
  }, [templates, searchTerm])

  const handleUseTemplate = () => {
    if (!selected) return

    const trustee = isTrusteeTemplate(selected)

    const targetRoute = trustee
      ? '/dashboard/create-wallet/trustee'
      : '/dashboard/create-wallet/scheduled'

    navigate(targetRoute, {
      state: {
        fromTemplateId: selected.id,
        template: {
          name: selected.name,
          description: selected.description,
          categoryId: selected.categoryId,
          categoryIcon: selected.categoryIcon,
          targetAmount: selected.defaultTargetAmount,
          releaseAmount: selected.defaultReleaseAmount,
          frequency: selected.defaultFrequency,
          frequencyConfig: selected.defaultFrequencyConfig,
          payoutDestination: selected.defaultPayoutDestination,
          walletType: trustee ? 'Trustee' : 'Scheduled',
        },
      },
    })
  }

  const handleCreateFromScratch = () => {
    if (activeType === 'trustee') {
      navigate('/dashboard/create-wallet/trustee')
    } else {
      navigate('/dashboard/create-wallet')
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: themeColors.green }}
          />
          <p className="mt-3 text-[13px]" style={{ color: themeColors.mid }}>
            Loading templates...
          </p>
        </div>
      </AppLayout>
    )
  }

  if (loadError) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <Frown size={32} strokeWidth={1.5} style={{ color: themeColors.mid }} />
          <p
            className="mt-3 text-[15px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            Couldn't load templates
          </p>
          <p className="mt-1 text-[13px]" style={{ color: themeColors.mid }}>
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => setReloadToken((n) => n + 1)}
            className="mt-5 rounded-full px-6 py-2.5 text-[14px] font-semibold"
            style={{
              backgroundColor: themeColors.green,
              color: '#FFFFFF',
            }}
          >
            Try again
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        <div className="mb-5 flex items-center gap-3">
          <BackButton onClick={() => navigate(-1)} />

          <div>
            <h2
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Templates
            </h2>
            <p className="text-[13px]" style={{ color: themeColors.mid }}>
              Pick a preset and start in seconds
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Wallet type filter"
          className="mb-4 flex items-center gap-1 rounded-[12px] border p-1"
          style={{ borderColor: themeColors.border }}
        >
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'trustee', label: 'Trustee' },
            ] as { key: TypeFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeType === tab.key}
              onClick={() => setActiveType(tab.key)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12.5px] font-semibold transition-all"
              style={{
                backgroundColor:
                  activeType === tab.key ? themeColors.green : 'transparent',
                color:
                  activeType === tab.key ? '#FFFFFF' : themeColors.mid,
              }}
            >
              {tab.key === 'trustee' && (
                <Shield size={12} strokeWidth={2.4} />
              )}
              {tab.key === 'scheduled' && (
                <Calendar size={12} strokeWidth={2.4} />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className="mb-4 flex items-center gap-2 rounded-[12px] border px-3 py-2 transition-all duration-200"
          style={{
            backgroundColor: themeColors.card,
            borderColor: searchTerm ? themeColors.green : themeColors.border,
          }}
        >
          <Search
            size={18}
            style={{
              color: searchTerm ? themeColors.green : themeColors.mid,
            }}
          />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-[14px] outline-none"
            style={{ color: themeColors.charcoal }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="rounded-full p-0.5 transition-all hover:opacity-70"
              style={{ color: themeColors.mid }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {visibleTemplates.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {visibleTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => setSelected(template)}
                themeColors={themeColors}
                isDark={isDark}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-10 text-center"
            style={{
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            }}
          >
            <Search size={28} strokeWidth={1.5} style={{ color: themeColors.mid }} />
            <p
              className="mt-3 text-[14px] font-medium"
              style={{ color: themeColors.charcoal }}
            >
              {searchTerm
                ? `No templates match "${searchTerm}"`
                : `No ${activeType === 'all' ? '' : activeType} templates available`}
            </p>
            <p className="mt-1 text-[12px]" style={{ color: themeColors.mid }}>
              {searchTerm ? 'Try a different keyword' : 'Check back later'}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleCreateFromScratch}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-dashed py-4 transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
          style={{
            backgroundColor: themeColors.card,
            borderColor: themeColors.green,
            color: themeColors.green,
          }}
        >
          <Sparkles size={18} strokeWidth={2} />
          <span className="text-[14px] font-semibold">
            {activeType === 'trustee'
              ? 'Start a trustee wallet from scratch'
              : 'Start from scratch instead'}
          </span>
        </button>
      </div>

      <BottomSheet
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        icon={
          selected
            ? (() => {
                const Icon = resolveIcon(selected.iconName)
                return <Icon size={16} strokeWidth={2.4} />
              })()
            : undefined
        }
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex-1 rounded-[12px] border px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-70"
              style={{
                borderColor: themeColors.border,
                backgroundColor: themeColors.card,
                color: themeColors.charcoal,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUseTemplate}
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: themeColors.green,
                color: '#FFFFFF',
              }}
            >
              Use template
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        }
      >
        {selected && (
          <div style={{ color: themeColors.mid }}>
            <div className="mb-3">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: isTrusteeTemplate(selected)
                    ? isDark
                      ? 'rgba(96, 165, 250, 0.2)'
                      : 'rgba(96, 165, 250, 0.1)'
                    : isDark
                    ? 'rgba(15, 185, 110, 0.2)'
                    : 'rgba(15, 185, 110, 0.1)',
                  color: isTrusteeTemplate(selected)
                    ? '#60A5FA'
                    : themeColors.green,
                }}
              >
                {isTrusteeTemplate(selected) ? (
                  <Shield size={10} strokeWidth={2.5} />
                ) : (
                  <Calendar size={10} strokeWidth={2.5} />
                )}
                {isTrusteeTemplate(selected) ? 'Trustee wallet' : 'Scheduled wallet'}
              </span>
            </div>

            <p className="text-[13px] leading-[1.6]">{selected.description}</p>

            <div
              className="mt-4 rounded-[12px] border p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.02)'
                  : '#FAFBFC',
                borderColor: themeColors.border,
              }}
            >
              <DetailRow
                icon={<Tag size={13} />}
                label="Category"
                value={selected.categoryName}
                themeColors={themeColors}
              />
              <Divider themeColors={themeColors} />
              <DetailRow
                icon={
                  (selected.categoryType ?? 'scheduled').toLowerCase() ===
                  'trustee' ? (
                    <Shield size={13} />
                  ) : (
                    <Calendar size={13} />
                  )
                }
                label="Category group"
                value={
                  (selected.categoryType ?? 'scheduled').toLowerCase() ===
                  'trustee'
                    ? 'Trustee'
                    : 'Scheduled'
                }
                themeColors={themeColors}
              />
              <Divider themeColors={themeColors} />
              <DetailRow
                icon={<Target size={13} />}
                label="Target amount"
                value={formatCurrency(selected.defaultTargetAmount)}
                valueBold
                themeColors={themeColors}
              />

              {isTrusteeTemplate(selected) ? (
                <>
                  <Divider themeColors={themeColors} />
                  <DetailRow
                    icon={<Shield size={13} />}
                    label="Approval"
                    value="Trustee required for every release"
                    themeColors={themeColors}
                  />
                  <Divider themeColors={themeColors} />
                  <DetailRow
                    icon={<Lock size={13} />}
                    label="Decision window"
                    value="3 hours per request"
                    themeColors={themeColors}
                  />
                </>
              ) : (
                <>
                  <Divider themeColors={themeColors} />
                  <DetailRow
                    icon={<Banknote size={13} />}
                    label="Per release"
                    value={formatCurrency(selected.defaultReleaseAmount)}
                    themeColors={themeColors}
                  />
                  <Divider themeColors={themeColors} />
                  <DetailRow
                    icon={<Calendar size={13} />}
                    label="Frequency"
                    value={describeFrequency(selected.defaultFrequency)}
                    themeColors={themeColors}
                  />
                  <Divider themeColors={themeColors} />
                  <DetailRow
                    icon={
                      selected.defaultPayoutDestination === 'bank' ? (
                        <Landmark size={13} />
                      ) : selected.defaultPayoutDestination === 'main' ? (
                        <Lock size={13} />
                      ) : (
                        <Wallet size={13} />
                      )
                    }
                    label="Releases go to"
                    value={describeDestination(selected.defaultPayoutDestination)}
                    themeColors={themeColors}
                  />
                </>
              )}
            </div>

            {selected.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(15, 185, 110, 0.15)'
                        : 'rgba(15, 185, 110, 0.08)',
                      color: themeColors.green,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p
              className="mt-4 text-center text-[11px] leading-[1.5]"
              style={{ color: themeColors.mid }}
            >
              You can edit every field after picking this template.
            </p>
          </div>
        )}
      </BottomSheet>
    </AppLayout>
  )
}

function DetailRow({
  icon,
  label,
  value,
  valueBold = false,
  themeColors,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueBold?: boolean
  themeColors: typeof colors | typeof darkColors
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span style={{ color: themeColors.mid }}>{icon}</span>
        <span className="text-[12px]" style={{ color: themeColors.mid }}>
          {label}
        </span>
      </div>
      <span
        className="text-[13px]"
        style={{
          color: themeColors.charcoal,
          fontWeight: valueBold ? 700 : 600,
        }}
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