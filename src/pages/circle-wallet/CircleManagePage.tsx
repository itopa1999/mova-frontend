import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  Settings,
  Save,
  Calendar,
  Users,
  Shield,
  Loader2,
  Lock,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import { useTheme } from '../../hooks/useTheme'
import { colors, darkColors } from '../../styles/tokens'
import {
  getCircleDetails,
  updateCircleDetails,
  type CircleDetailsResponse,
} from '../../services/app/circleDetails'

type ThemeColors = typeof colors | typeof darkColors

export default function CircleManagePage() {
  const navigate = useNavigate()
  const { circleId } = useParams<{ circleId: string }>()
  const walletId = Number(circleId)
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors

  const location = useLocation()
  const passedDetails = location.state?.initialDetails as
    | CircleDetailsResponse
    | undefined

  const [details, setDetails] = useState<CircleDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Get today's date in YYYY-MM-DD format (local time)
  const todayStr = useMemo(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    startPolicy: '',
    moderatorStartsCircle: false,
    frequency: '',
    frequencyConfig: '',
    rotationStrategy: '',
    allowPenalty: false,
    penaltyAmount: 0,
    penaltySource: '',
    gracePeriodHours: 24,
    memberCount: 3,
  })

  useEffect(() => {
    const loadData = async () => {
      let dataToUse = passedDetails

      if (!dataToUse) {
        if (!walletId) return
        setIsLoading(true)
        try {
          const res = await getCircleDetails(walletId)
          if (res.is_success && res.data) {
            dataToUse = res.data
          }
        } finally {
          setIsLoading(false)
        }
      }

      if (dataToUse) {
        setDetails(dataToUse)
        const { circleDetails, rulesAndSchedule, financialStats, memberStats } =
          dataToUse

        setForm({
          name: circleDetails.name,
          description: circleDetails.description || '',
          startDate: rulesAndSchedule.startDate.split('T')[0],
          startPolicy: rulesAndSchedule.startPolicy,
          moderatorStartsCircle: rulesAndSchedule.moderatorStartsCircle,
          frequency: rulesAndSchedule.frequency,
          frequencyConfig: '{"type":"weekly","daysOfWeek":[1,4]}',
          rotationStrategy: rulesAndSchedule.rotationStrategy,
          allowPenalty: rulesAndSchedule.penaltyAmount > 0,
          penaltyAmount: financialStats.contributionAmount,
          penaltySource: rulesAndSchedule.penaltySource,
          gracePeriodHours: rulesAndSchedule.gracePeriodHours,
          memberCount: memberStats.memberCount,
        })
        setIsLoading(false)
      }
    }
    loadData()
  }, [walletId, passedDetails])

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!walletId) return

    const isDraft = details?.circleDetails.status === 'Draft'

    // Validate: Start date cannot be in the past for Draft circles
    if (isDraft && form.startDate < todayStr) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: 'The start date cannot be in the past.',
          },
        })
      )
      return
    }

    setIsSaving(true)
    try {
      const res = await updateCircleDetails(walletId, {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        startPolicy: form.startPolicy,
        moderatorStartsCircle: form.moderatorStartsCircle,
        rotationStrategy: form.rotationStrategy,
        allowPenalty: form.allowPenalty,
        penaltyAmount: form.penaltyAmount,
        penaltySource: form.penaltySource,
        gracePeriodHours: form.gracePeriodHours,
        memberCount: form.memberCount,
      })

      if (res.is_success) {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { type: 'success', message: 'Circle updated successfully' },
          })
        )
        navigate(`/dashboard/circles/details/${circleId}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] items-center justify-center py-5">
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: themeColors.circle }}
          />
        </div>
      </AppLayout>
    )
  }

  if (!details) return null

  // ─── ORGANIZER GUARD ───
  if (!details.accessState.isOrganizer) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center py-5 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: isDark
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(239, 68, 68, 0.08)',
            }}
          >
            <Lock size={32} style={{ color: '#EF4444' }} />
          </div>
          <h2
            className="mt-4 text-[18px] font-bold"
            style={{ color: themeColors.charcoal }}
          >
            Access Denied
          </h2>
          <p
            className="mt-1 max-w-[280px] text-[13px]"
            style={{ color: themeColors.mid }}
          >
            Only the circle organizer can access the manage settings.
          </p>
          <button
            onClick={() => navigate(`/dashboard/circles/details/${circleId}`)}
            className="mt-6 rounded-[12px] px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: themeColors.circle }}
          >
            Back to Circle
          </button>
        </div>
      </AppLayout>
    )
  }

  const isDraft = details.circleDetails.status === 'Draft'
  const activeMemberCount = details.memberStats.activeMemberCount
  const minCapacity = Math.max(3, activeMemberCount)

  return (
    <AppLayout>
      <div className="py-5 pb-24" style={{ color: themeColors.charcoal }}>
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <BackButton onClick={() => navigate(-1)} />
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-[18px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Manage Circle
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: isDraft
                    ? `${themeColors.warning}22`
                    : `${themeColors.green}22`,
                  color: isDraft ? themeColors.warning : themeColors.green,
                }}
              >
                {details.circleDetails.status}
              </span>
              <span className="text-[11px]" style={{ color: themeColors.mid }}>
                {details.circleDetails.name}
              </span>
            </div>
          </div>
        </div>

        {/* Warning for Active Circles */}
        {!isDraft && (
          <div
            className="mb-4 flex items-start gap-2 rounded-[12px] border p-3"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.1)'
                : 'rgba(96, 165, 250, 0.05)',
              borderColor: isDark
                ? 'rgba(96, 165, 250, 0.2)'
                : 'rgba(96, 165, 250, 0.15)',
            }}
          >
            <Lock
              size={14}
              style={{ color: '#60A5FA', marginTop: 1, flexShrink: 0 }}
            />
            <p
              className="text-[11.5px] leading-[1.5]"
              style={{ color: themeColors.mid }}
            >
              This circle has already started. Rules, schedule, and financial
              settings are locked. You can only update the description.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* ─── Basic Info ─── */}
          <Section title="Basic Info" icon={Settings} themeColors={themeColors}>
            <Field label="Circle Name" themeColors={themeColors}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={!isDraft}
                className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none disabled:opacity-60"
                style={{
                  backgroundColor: !isDraft
                    ? themeColors.background
                    : themeColors.card,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              />
            </Field>
            <Field label="Description" themeColors={themeColors}>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                  resize: 'none',
                }}
              />
            </Field>
          </Section>

          {/* ─── Schedule & Start ─── */}
          <Section
            title="Schedule & Start"
            icon={Calendar}
            themeColors={themeColors}
          >
            <Field label="Start Date" themeColors={themeColors}>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                disabled={!isDraft}
                min={todayStr} // 👈 Prevents picking a past date in the native picker
                className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none disabled:opacity-60"
                style={{
                  backgroundColor: !isDraft
                    ? themeColors.background
                    : themeColors.card,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              />
            </Field>

            <Field label="Start Policy" themeColors={themeColors}>
              <select
                value={form.startPolicy}
                onChange={(e) => handleChange('startPolicy', e.target.value)}
                disabled={!isDraft}
                className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none disabled:opacity-60"
                style={{
                  backgroundColor: !isDraft
                    ? themeColors.background
                    : themeColors.card,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              >
                <option value="WaitForAll">Wait for all members</option>
                <option value="StartWithJoined">Start with joined members</option>
              </select>
            </Field>

            <div className="flex items-center justify-between py-1">
              <div>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  Manual Start
                </p>
                <p className="text-[11px]" style={{ color: themeColors.mid }}>
                  Wait for moderator to start
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleChange(
                    'moderatorStartsCircle',
                    !form.moderatorStartsCircle
                  )
                }
                disabled={!isDraft}
                className="relative h-6 w-11 rounded-full transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: form.moderatorStartsCircle
                    ? themeColors.circle
                    : themeColors.border,
                }}
              >
                <span
                  className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                  style={{
                    transform: form.moderatorStartsCircle
                      ? 'translateX(20px)'
                      : 'translateX(0)',
                  }}
                />
              </button>
            </div>
          </Section>

          {/* ─── Rules & Rotation ─── */}
          <Section
            title="Rules & Rotation"
            icon={Shield}
            themeColors={themeColors}
          >
            <Field label="Rotation Strategy" themeColors={themeColors}>
              <select
                value={form.rotationStrategy}
                onChange={(e) =>
                  handleChange('rotationStrategy', e.target.value)
                }
                disabled={!isDraft}
                className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none disabled:opacity-60"
                style={{
                  backgroundColor: !isDraft
                    ? themeColors.background
                    : themeColors.card,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              >
                <option value="FixedOrder">Fixed Order</option>
                <option value="RandomDraw">Random Draw</option>
                <option value="ModeratorSet">Moderator Sets Order</option>
              </select>
            </Field>

            <Field label="Grace Period (Hours)" themeColors={themeColors}>
              <input
                type="number"
                value={form.gracePeriodHours}
                onChange={(e) =>
                  handleChange(
                    'gracePeriodHours',
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={!isDraft}
                className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none disabled:opacity-60"
                style={{
                  backgroundColor: !isDraft
                    ? themeColors.background
                    : themeColors.card,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              />
            </Field>

            <div
              className="flex items-center justify-between py-1 border-t mt-2 pt-3"
              style={{ borderColor: themeColors.border }}
            >
              <div>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  Enable Penalties
                </p>
                <p className="text-[11px]" style={{ color: themeColors.mid }}>
                  Charge late members
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('allowPenalty', !form.allowPenalty)}
                disabled={!isDraft}
                className="relative h-6 w-11 rounded-full transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: form.allowPenalty
                    ? themeColors.circle
                    : themeColors.border,
                }}
              >
                <span
                  className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                  style={{
                    transform: form.allowPenalty
                      ? 'translateX(20px)'
                      : 'translateX(0)',
                  }}
                />
              </button>
            </div>

            {form.allowPenalty && (
              <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-top-2">
                <Field label="Penalty Amount (₦)" themeColors={themeColors}>
                  <input
                    type="number"
                    value={form.penaltyAmount}
                    onChange={(e) =>
                      handleChange(
                        'penaltyAmount',
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={!isDraft}
                    className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none disabled:opacity-60"
                    style={{
                      backgroundColor: !isDraft
                        ? themeColors.background
                        : themeColors.card,
                      borderColor: themeColors.border,
                      color: themeColors.charcoal,
                    }}
                  />
                </Field>
                <Field label="Deduct From" themeColors={themeColors}>
                  <select
                    value={form.penaltySource}
                    onChange={(e) =>
                      handleChange('penaltySource', e.target.value)
                    }
                    disabled={!isDraft}
                    className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none disabled:opacity-60"
                    style={{
                      backgroundColor: !isDraft
                        ? themeColors.background
                        : themeColors.card,
                      borderColor: themeColors.border,
                      color: themeColors.charcoal,
                    }}
                  >
                    <option value="Deposit">Security Deposit</option>
                    <option value="Round">Round Contribution</option>
                  </select>
                </Field>
              </div>
            )}
          </Section>

          {/* ─── Capacity ─── */}
          <Section title="Capacity" icon={Users} themeColors={themeColors}>
            <Field label="Total Member Slots" themeColors={themeColors}>
              <input
                type="number"
                value={form.memberCount}
                onChange={(e) =>
                  handleChange('memberCount', parseInt(e.target.value) || 0)
                }
                disabled={!isDraft}
                min={minCapacity}
                className="w-full rounded-[10px] border px-3 py-2.5 text-[13px] outline-none disabled:opacity-60"
                style={{
                  backgroundColor: !isDraft
                    ? themeColors.background
                    : themeColors.card,
                  borderColor: themeColors.border,
                  color: themeColors.charcoal,
                }}
              />
              {isDraft && (
                <p
                  className="mt-1 text-[10px]"
                  style={{ color: themeColors.mid }}
                >
                  Cannot be less than 3 or the {activeMemberCount} members
                  already joined.
                </p>
              )}
            </Field>
          </Section>
        </div>

        {/* Save Button */}
        <div className="mt-8 mb-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3.5 text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
            style={{ backgroundColor: themeColors.circle }}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

/* ───────────── Sub-components ───────────── */

function Section({
  title,
  icon: Icon,
  children,
  themeColors,
}: {
  title: string
  icon: any
  children: React.ReactNode
  themeColors: ThemeColors
}) {
  return (
    <div
      className="rounded-[16px] border p-4"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      <div
        className="mb-3 flex items-center gap-2 border-b pb-3"
        style={{ borderColor: themeColors.border }}
      >
        <Icon size={16} style={{ color: themeColors.circle }} />
        <h2
          className="text-[13px] font-bold"
          style={{ color: themeColors.charcoal }}
        >
          {title}
        </h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({
  label,
  children,
  themeColors,
}: {
  label: string
  children: React.ReactNode
  themeColors: ThemeColors
}) {
  return (
    <div>
      <label
        className="mb-1 block text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: themeColors.mid }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}