import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Users,
  Trophy,
  Clock,
  CheckCircle,
  UserPlus,
  ChevronRight,
  Calendar,
  Crown,
  User,
  AlertTriangle,
  XCircle,
  Info,
  Settings,
  Play,
  ChevronDown,
  ChevronUp,
  Lock,
  Repeat,
  Loader2,
  Banknote,
  Copy,
  Check,
  UserCheck,
  Shuffle,
  KeyRound,
  Sparkles,
  Phone,
  Coins,
  Receipt,
  ListChecks,
  History,
  RefreshCw,
  Shield,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import { useTheme } from '../../hooks/useTheme'
import { useCategoryIcon } from '../../hooks/useCategoryIcon'
import { colors, darkColors } from '../../styles/tokens'
import { formatCurrency, formatUSDate } from '../../utils/formatting'
import {
  getCircleDetails,
  getCircleMembers,
  getCircleRounds,
  type CircleDetailsResponse,
  type CircleMembersResponse,
  type CircleMemberItem,
  type CircleRoundsResponse,
  type CircleRoundItem,
} from '../../services/app/circleDetails'

type TabType =
  | 'overview'
  | 'members'
  | 'rounds'
  | 'contributions'
  | 'activities'

type ThemeColors = typeof colors | typeof darkColors

/* ───────────── Enum-aware helpers ─────────────
 *
 * BE enums (returned as strings):
 *   SavingsCircleStatus : Draft | Active | Completed | Cancelled | Suspended
 *   CircleMemberStatus  : Invited | Active | Defaulted | Exited | Completed
 *   ContributionStatus  : Pending | Collected | Failed | Waived
 *   CircleRoundStatus   : Pending | Collecting | Collected | PaidOut | Failed
 *   RotationStrategy    : FixedOrder | RandomDraw | ModeratorSet
 *   StartPolicy         : WaitForAll | StartWithJoined
 *   PenaltyAmountFrom   : Round | Deposit
 */

const statusColor = (status: string, c: ThemeColors): string => {
  switch ((status ?? '').toLowerCase()) {
    case 'active':
      return c.green
    case 'draft':
      return c.warning
    case 'completed':
      return c.trustee
    case 'cancelled':
    case 'suspended':
      return c.red
    default:
      return c.mid
  }
}

const memberStatusColor = (status: string, c: ThemeColors): string => {
  switch ((status ?? '').toLowerCase()) {
    case 'active':
      return c.green
    case 'invited':
      return c.warning
    case 'defaulted':
      return c.red
    case 'exited':
      return c.light
    case 'completed':
      return c.trustee
    default:
      return c.mid
  }
}

const contributionStatusColor = (status: string, c: ThemeColors): string => {
  switch ((status ?? '').toLowerCase()) {
    case 'collected':
    case 'paid':
      return c.green
    case 'pending':
      return c.warning
    case 'failed':
      return c.red
    case 'waived':
      return c.light
    case 'notstarted':
    case 'not_started':
      return c.light
    default:
      return c.mid
  }
}

const roundStateColor = (state: string, c: ThemeColors): string => {
  switch ((state ?? '').toLowerCase()) {
    case 'paidout':
      return c.green
    case 'collected':
      return c.trustee
    case 'collecting':
      return c.circle
    case 'pending':
      return c.warning
    case 'failed':
      return c.red
    default:
      return c.mid
  }
}

const formatTimeLeft = (date: string | null): string => {
  if (!date) return '—'
  const ms = new Date(date).getTime() - Date.now()
  if (ms <= 0) return 'Due now'
  const days = Math.floor(ms / 864e5)
  if (days > 0) return `In ${days} ${days === 1 ? 'day' : 'days'}`
  const hours = Math.floor(ms / 36e5)
  if (hours > 0) return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`
  const minutes = Math.floor(ms / 6e4)
  return `In ${minutes} min`
}

const formatRotation = (strategy: string): string => {
  switch (strategy) {
    case 'FixedOrder':
      return 'Fixed order'
    case 'RandomDraw':
      return 'Random draw'
    case 'ModeratorSet':
      return 'Moderator sets order'
    default:
      return strategy
  }
}

const formatStartPolicy = (policy: string): string => {
  switch (policy) {
    case 'WaitForAll':
      return 'When all members have joined'
    case 'StartWithJoined':
      return 'When enough members have joined'
    default:
      return policy
  }
}

const contributionStatusLabel = (status: string): string => {
  switch ((status ?? '').toLowerCase()) {
    case 'collected':
    case 'paid':
      return 'Paid'
    case 'pending':
      return 'Due'
    case 'failed':
      return 'Failed'
    case 'waived':
      return 'Waived'
    case 'notstarted':
    case 'not_started':
      return ''
    default:
      return status
  }
}

/* ───────────── Sub-components ───────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  themeColors,
}: {
  icon: typeof Calendar
  label: string
  value: string
  hint?: string
  themeColors: ThemeColors
}) {
  return (
    <div
      className="rounded-[14px] border p-3"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
      }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: themeColors.mid }} />
        <p
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: themeColors.mid }}
        >
          {label}
        </p>
      </div>
      <p
        className="mt-1.5 text-[15px] font-bold leading-tight"
        style={{ color: themeColors.charcoal }}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-[10.5px]" style={{ color: themeColors.mid }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function RuleRow({
  icon: Icon,
  label,
  value,
  themeColors,
}: {
  icon: typeof Calendar
  label: string
  value: string
  themeColors: ThemeColors
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon size={12} style={{ color: themeColors.mid }} />
        <span className="text-[12px]" style={{ color: themeColors.mid }}>
          {label}
        </span>
      </div>
      <span
        className="max-w-[60%] text-right text-[12.5px] font-semibold"
        style={{ color: themeColors.charcoal }}
      >
        {value}
      </span>
    </div>
  )
}

function MemberRow({
  member,
  index,
  currentRound,
  themeColors,
  isDark,
}: {
  member: CircleMemberItem
  index: number
  currentRound: number
  themeColors: ThemeColors
  isDark: boolean
}) {
  const memberColor = memberStatusColor(member.status, themeColors)
  const contribColor = contributionStatusColor(
    member.contributionStatusThisRound,
    themeColors
  )
  const contribLabel = contributionStatusLabel(
    member.contributionStatusThisRound
  )

  const showContrib =
    member.status === 'Active' &&
    currentRound > 0 &&
    member.contributionStatusThisRound &&
    member.contributionStatusThisRound !== 'NotStarted' &&
    member.contributionStatusThisRound !== 'Not_Started' &&
    contribLabel.length > 0

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        borderTop: index === 0 ? 'none' : `1px solid ${themeColors.border}`,
        backgroundColor: member.isYou ? themeColors.circleLight : 'transparent',
      }}
    >
      <div className="relative shrink-0">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold"
          style={{
            backgroundColor:
              member.isOrganizer || member.isYou
                ? themeColors.circle
                : isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.05)',
            color:
              member.isOrganizer || member.isYou
                ? '#FFFFFF'
                : themeColors.charcoal,
          }}
        >
          {member.displayName.charAt(0).toUpperCase()}
        </div>
        {member.rotationPosition !== null && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold"
            style={{
              backgroundColor: themeColors.circle,
              color: '#FFFFFF',
              border: `1.5px solid ${themeColors.card}`,
            }}
          >
            {member.rotationPosition}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className="truncate text-[13px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            {member.displayName}
          </p>
          {member.isYou && (
            <span
              className="text-[10px] font-normal"
              style={{ color: themeColors.mid }}
            >
              (you)
            </span>
          )}
          {member.isOrganizer && (
            <Crown size={10} style={{ color: themeColors.circle }} />
          )}
        </div>
        {member.phone && (
          <p
            className="mt-0.5 flex items-center gap-1 text-[11px]"
            style={{ color: themeColors.mid }}
          >
            <Phone size={10} /> {member.phone}
          </p>
        )}
        {member.hasReceivedPayout && (
          <p
            className="mt-0.5 flex items-center gap-1 text-[10px]"
            style={{ color: themeColors.green }}
          >
            <CheckCircle size={9} /> Received payout
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: `${memberColor}22`,
            color: memberColor,
          }}
        >
          {member.status}
        </span>
        {showContrib && (
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: `${contribColor}22`,
              color: contribColor,
            }}
          >
            {contribLabel}
          </span>
        )}
        {member.isRecipientThisRound && (
          <Trophy size={12} style={{ color: themeColors.circle }} />
        )}
      </div>
    </div>
  )
}

function RoundCard({
  round,
  themeColors,
  isDark,
}: {
  round: CircleRoundItem
  themeColors: ThemeColors
  isDark: boolean
}) {
  const stateColor = roundStateColor(round.state, themeColors)

  const stateIcon = (() => {
    switch (round.state) {
      case 'PaidOut':
      case 'Collected':
        return <CheckCircle size={16} />
      case 'Collecting':
        return <Clock size={16} />
      case 'Failed':
        return <XCircle size={16} />
      case 'Pending':
      default:
        return <Calendar size={16} />
    }
  })()

    const subtitle = (() => {
    switch (round.state) {
      case 'PaidOut':
        return round.paidOutAt
          ? `Paid out ${formatUSDate(round.paidOutAt)}`
          : 'Paid out'
      case 'Collected':
        return `Collected · pays out ${formatUSDate(round.payoutDate)}`
      case 'Collecting':
        return `Collecting · due ${formatUSDate(round.payoutDate)}`
      case 'Failed':
        return 'Round failed'
      case 'Pending':
      default:
        return `Scheduled for ${formatUSDate(round.payoutDate)}`
    }
  })()

  return (
    <div
      className="rounded-[14px] border p-3.5"
      style={{
        backgroundColor: themeColors.card,
        borderColor: themeColors.border,
        opacity: round.state === 'Pending' ? 0.72 : 1,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${stateColor}22`,
              color: stateColor,
            }}
          >
            {stateIcon}
          </div>
          <div>
            <p
              className="text-[13px] font-semibold"
              style={{ color: themeColors.charcoal }}
            >
              Round {round.roundNumber}
            </p>
            <p className="text-[10px]" style={{ color: themeColors.mid }}>
              {subtitle}
            </p>
          </div>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: `${stateColor}22`,
            color: stateColor,
          }}
        >
          {round.state}
        </span>
      </div>

      {round.recipient && (
        <div
          className="mt-3 flex items-center gap-2 rounded-[10px] p-2.5"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
          }}
        >
          <UserCheck size={12} style={{ color: themeColors.circle }} />
          <p
            className="text-[11.5px]"
            style={{ color: themeColors.charcoal }}
          >
            <strong>{round.recipient.displayName}</strong>
            {round.isRecipient && (
              <span
                className="ml-1 text-[10px] font-normal"
                style={{ color: themeColors.circle }}
              >
                (you)
              </span>
            )}
            <span style={{ color: themeColors.mid }}> receives this round</span>
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div>
          <p
            className="text-[9px] uppercase tracking-wide"
            style={{ color: themeColors.mid }}
          >
            Target
          </p>
          <p
            className="text-[12px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            {formatCurrency(round.poolTarget)}
          </p>
        </div>
        <div>
          <p
            className="text-[9px] uppercase tracking-wide"
            style={{ color: themeColors.mid }}
          >
            Collected
          </p>
          <p
            className="text-[12px] font-semibold"
            style={{
              color:
                round.state === 'PaidOut' || round.state === 'Collected'
                  ? themeColors.green
                  : themeColors.charcoal,
            }}
          >
            {formatCurrency(round.pooledAmount)}
          </p>
        </div>
        <div>
          <p
            className="text-[9px] uppercase tracking-wide"
            style={{ color: themeColors.mid }}
          >
            Paid
          </p>
          <p
            className="text-[12px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            {round.contributedCount}
          </p>
        </div>
      </div>

      {round.myContributionStatus &&
        round.myContributionStatus !== 'NotStarted' &&
        round.myContributionStatus !== 'Not_Started' && (
          <p
            className="mt-2 flex items-center gap-1 text-[10px]"
            style={{
              color: contributionStatusColor(
                round.myContributionStatus,
                themeColors
              ),
            }}
          >
            <Info size={9} /> Your contribution:{' '}
            {contributionStatusLabel(round.myContributionStatus)}
          </p>
        )}
    </div>
  )
}

/* ───────────── Page ───────────── */

export default function CircleDetailPage() {
  const navigate = useNavigate()
  const { circleId } = useParams<{ circleId: string }>()
  const walletId = Number(circleId)
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const getIcon = useCategoryIcon()

  const [details, setDetails] = useState<CircleDetailsResponse | null>(null)
  const [members, setMembers] = useState<CircleMembersResponse | null>(null)
  const [rounds, setRounds] = useState<CircleRoundsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [membersFilter, setMembersFilter] = useState<string>('all')
  const [roundsFilter, setRoundsFilter] = useState<string>('all')
  const [copiedCode, setCopiedCode] = useState(false)
  const [showAllRounds, setShowAllRounds] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      if (!walletId || Number.isNaN(walletId)) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const [detailsRes, membersRes, roundsRes] = await Promise.allSettled([
          getCircleDetails(walletId),
          getCircleMembers(walletId),
          getCircleRounds(walletId),
        ])

        if (detailsRes.status === 'fulfilled' && detailsRes.value.is_success) {
          setDetails(detailsRes.value.data)
        }
        if (membersRes.status === 'fulfilled' && membersRes.value.is_success) {
          setMembers(membersRes.value.data)
        }
        if (roundsRes.status === 'fulfilled' && roundsRes.value.is_success) {
          setRounds(roundsRes.value.data)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [walletId])

  const handleCopyCode = async () => {
    if (!details?.inviteInfo.inviteCode) return
    try {
      await navigator.clipboard.writeText(details.inviteInfo.inviteCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'success', message: 'Invite code copied' },
        })
      )
    } catch {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: 'Could not copy code' },
        })
      )
    }
  }

  const handleContribute = () => {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'info',
          message: 'Contribution flow is coming soon.',
        },
      })
    )
  }

  const handleStartCircle = () => {
    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'info',
          message: 'Start-circle flow is coming soon.',
        },
      })
    )
  }

  const handleManage = () => {
    navigate(`/dashboard/circles/${circleId}/manage`)
  }

  const handleRefresh = async () => {
    if (!walletId || Number.isNaN(walletId)) return
    setIsLoading(true)
    try {
      const [detailsRes, membersRes, roundsRes] = await Promise.allSettled([
        getCircleDetails(walletId),
        getCircleMembers(walletId),
        getCircleRounds(walletId),
      ])
      if (detailsRes.status === 'fulfilled' && detailsRes.value.is_success) {
        setDetails(detailsRes.value.data)
      }
      if (membersRes.status === 'fulfilled' && membersRes.value.is_success) {
        setMembers(membersRes.value.data)
      }
      if (roundsRes.status === 'fulfilled' && roundsRes.value.is_success) {
        setRounds(roundsRes.value.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Manage tab removed — only these five tabs remain
  const visibleTabs: TabType[] = useMemo(
    () => ['overview', 'members', 'rounds', 'contributions', 'activities'],
    []
  )

  const filteredMembers = useMemo(() => {
    if (!members) return []
    if (membersFilter === 'all') return members.members
    return members.members.filter(
      (m) => m.status.toLowerCase() === membersFilter.toLowerCase()
    )
  }, [members, membersFilter])

  const filteredRounds = useMemo(() => {
    if (!rounds) return []
    if (roundsFilter === 'all') return rounds.rounds
    if (roundsFilter === 'past')
      return rounds.rounds.filter(
        (r) => r.state === 'PaidOut' || r.state === 'Failed'
      )
    if (roundsFilter === 'current')
      return rounds.rounds.filter(
        (r) => r.state === 'Collecting' || r.state === 'Collected'
      )
    if (roundsFilter === 'future')
      return rounds.rounds.filter((r) => r.state === 'Pending')
    return rounds.rounds
  }, [rounds, roundsFilter])

  const visibleRounds = useMemo(() => {
    if (showAllRounds) return filteredRounds
    return filteredRounds.slice(0, 6)
  }, [filteredRounds, showAllRounds])

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

  if (!details) {
    return (
      <AppLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center py-5 text-center">
          <AlertTriangle size={32} style={{ color: themeColors.mid }} />
          <p
            className="mt-4 text-[15px] font-semibold"
            style={{ color: themeColors.charcoal }}
          >
            Circle not found
          </p>
          <p className="mt-1 text-[12px]" style={{ color: themeColors.mid }}>
            The circle may have been removed or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/dashboard/wallets')}
            className="mt-5 rounded-full px-6 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: themeColors.circle, color: '#FFFFFF' }}
          >
            Back to wallets
          </button>
        </div>
      </AppLayout>
    )
  }

  const {
    circleDetails,
    myMembership,
    roundInfo,
    financialStats,
    rulesAndSchedule,
    memberStats,
    inviteInfo,
    accessState,
  } = details

  const CircleIcon = getIcon(circleDetails.categoryIcon || 'Users')
  const status = circleDetails.status
  const isActive = status === 'Active'
  const isDraft = status === 'Draft'
  const isCompleted = status === 'Completed'
  const isCancelled = status === 'Cancelled' || status === 'Suspended'
  const statusAccent = statusColor(status, themeColors)

  const hasStarted = roundInfo.currentRound > 0

  const progressPct =
    memberStats.memberCount > 0
      ? Math.min(
          100,
          Math.round(
            (roundInfo.roundCollectedCount / memberStats.memberCount) * 100
          )
        )
      : 0
  const joinedPct =
    memberStats.memberCount > 0
      ? Math.min(
          100,
          Math.round(
            (memberStats.activeMemberCount / memberStats.memberCount) * 100
          )
        )
      : 0

  const myContributionDue =
    isActive &&
    hasStarted &&
    accessState.canContribute &&
    !accessState.hasPaidThisRound &&
    myMembership.status === 'Active'

  const pastRoundsCount =
    rounds?.rounds.filter((r) => r.state === 'PaidOut').length ?? 0
  const upcomingRoundsCount =
    rounds?.rounds.filter((r) => r.state === 'Pending').length ?? 0
  const failedRoundsCount =
    rounds?.rounds.filter((r) => r.state === 'Failed').length ?? 0
  const collectingRoundsCount =
    rounds?.rounds.filter(
      (r) => r.state === 'Collecting' || r.state === 'Collected'
    ).length ?? 0

  // Invite code visible to everyone while the circle is still filling up
  // OR the circle hasn't started yet.
  const showInviteCard =
    !isCompleted &&
    !isCancelled &&
    (memberStats.slotsRemaining > 0 || !hasStarted)

  return (
    <AppLayout>
      <div className="py-5" style={{ color: themeColors.charcoal }}>
        {/* ────────── Header ────────── */}
        <div className="mb-4 flex items-start gap-3">
          <BackButton onClick={() => navigate(-1)} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="truncate text-[18px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {circleDetails.name}
              </h1>
              {accessState.isOrganizer ? (
                <span
                  className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: themeColors.circle,
                    color: '#FFFFFF',
                  }}
                >
                  <Crown size={10} strokeWidth={2.5} />
                  Organizer
                </span>
              ) : (
                <span
                  className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)',
                    color: themeColors.mid,
                  }}
                >
                  <User size={10} strokeWidth={2.5} />
                  Member
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${statusAccent}22`,
                  color: statusAccent,
                }}
              >
                {status}
              </span>
              <span className="text-[11px]" style={{ color: themeColors.mid }}>
                <CircleIcon size={10} className="mr-0.5 inline" />
                {circleDetails.categoryName || '—'}
              </span>
              <span className="text-[11px]" style={{ color: themeColors.mid }}>
                · By {circleDetails.organizerName}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {accessState.isOrganizer && (
              <button
                type="button"
                onClick={handleManage}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
                style={{
                  backgroundColor: themeColors.circle,
                  color: '#FFFFFF',
                }}
              >
                <Settings size={12} strokeWidth={2.4} />
                Manage
              </button>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{
                backgroundColor: themeColors.card,
                color: themeColors.mid,
              }}
              aria-label="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ────────── Contextual alerts ────────── */}
        {isActive && myContributionDue && (
          <div
            className="mb-4 flex items-start gap-3 rounded-[14px] border p-3.5"
            style={{
              backgroundColor: themeColors.circleLight,
              borderColor: themeColors.circleMid,
            }}
          >
            <Clock
              size={16}
              style={{
                color: themeColors.circle,
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <div className="flex-1">
              <p
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Your contribution is due
              </p>
              <p
                className="mt-0.5 text-[11.5px] leading-[1.55]"
                style={{ color: themeColors.mid }}
              >
                Round {roundInfo.currentRound} ·{' '}
                {formatCurrency(financialStats.contributionAmount)}.
                {rulesAndSchedule.penaltyAmount > 0 && (
                  <>
                    {' '}
                    Late payment adds{' '}
                    {formatCurrency(rulesAndSchedule.penaltyAmount)} penalty.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {isDraft && accessState.canStartCircle && (
          <div
            className="mb-4 flex items-start gap-3 rounded-[14px] border p-3.5"
            style={{
              backgroundColor: themeColors.circleLight,
              borderColor: themeColors.circleMid,
            }}
          >
            <Play
              size={16}
              style={{
                color: themeColors.circle,
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <div className="flex-1">
              <p
                className="text-[13px] font-semibold"
                style={{ color: themeColors.charcoal }}
              >
                Ready to start
              </p>
              <p
                className="mt-0.5 text-[11.5px] leading-[1.55]"
                style={{ color: themeColors.mid }}
              >
                All {memberStats.memberCount} members have joined. Start round
                1 to begin contributions.
              </p>
              <button
                type="button"
                onClick={handleStartCircle}
                className="mt-2 flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12px] font-semibold"
                style={{
                  backgroundColor: themeColors.circle,
                  color: '#FFFFFF',
                }}
              >
                <Play size={12} strokeWidth={2.5} />
                Start circle
              </button>
            </div>
          </div>
        )}

        {/* ────────── Hero ────────── */}
        {isActive && (
          <div
            className="mb-4 overflow-hidden rounded-[18px] border p-4"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.02) 100%)',
              borderColor: themeColors.circleMid,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: themeColors.circle,
                    color: '#FFFFFF',
                  }}
                >
                  Round {roundInfo.currentRound} of {roundInfo.totalRounds}
                </span>
                {myMembership.isRecipientThisRound && (
                  <span
                    className="flex items-center gap-1 text-[11px] font-semibold"
                    style={{ color: themeColors.circle }}
                  >
                    <Trophy size={11} /> Your turn
                  </span>
                )}
                {myMembership.isNextRecipient &&
                  !myMembership.isRecipientThisRound && (
                    <span
                      className="flex items-center gap-1 text-[11px] font-semibold"
                      style={{ color: themeColors.circle }}
                    >
                      <Sparkles size={11} /> You're next
                    </span>
                  )}
              </div>
              <span
                className="text-[12px] font-bold"
                style={{ color: themeColors.circle }}
              >
                {progressPct}%
              </span>
            </div>

            <p
              className="mt-2 text-[24px] font-bold leading-tight"
              style={{
                color: themeColors.charcoal,
                fontFamily:
                  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(roundInfo.roundCollected)}{' '}
              <span
                className="text-[13px] font-normal"
                style={{ color: themeColors.mid }}
              >
                of {formatCurrency(financialStats.roundPool)}
              </span>
            </p>

            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.06)',
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: themeColors.circle,
                  width: `${progressPct}%`,
                }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span style={{ color: themeColors.mid }}>
                {roundInfo.roundCollectedCount} of {memberStats.memberCount}{' '}
                paid
              </span>
              {roundInfo.currentRecipient && (
                <span
                  className="flex items-center gap-1"
                  style={{ color: themeColors.mid }}
                >
                  <Trophy size={10} style={{ color: themeColors.circle }} />
                  {roundInfo.currentRecipient.displayName}
                </span>
              )}
            </div>

            {roundInfo.nextCollectionDate && (
              <div
                className="mt-3 flex items-center justify-between border-t pt-2.5"
                style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}
              >
                <span
                  className="text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Next collection
                </span>
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  {formatTimeLeft(roundInfo.nextCollectionDate)}
                </span>
              </div>
            )}

            {myContributionDue && (
              <button
                type="button"
                onClick={handleContribute}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  backgroundColor: themeColors.circle,
                  color: '#FFFFFF',
                }}
              >
                <Banknote size={16} strokeWidth={2.2} />
                Contribute {formatCurrency(financialStats.contributionAmount)}
              </button>
            )}
          </div>
        )}

        {isDraft && (
          <div
            className="mb-4 rounded-[18px] border p-4"
            style={{
              backgroundColor: themeColors.circleLight,
              borderColor: themeColors.circleMid,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: themeColors.warning,
                  color: '#FFFFFF',
                }}
              >
                Draft
              </span>
              <Users size={16} style={{ color: themeColors.circle }} />
            </div>
            <p
              className="mt-2 text-[24px] font-bold leading-tight"
              style={{ color: themeColors.charcoal }}
            >
              {memberStats.activeMemberCount} of {memberStats.memberCount}{' '}
              <span
                className="text-[13px] font-normal"
                style={{ color: themeColors.mid }}
              >
                joined
              </span>
            </p>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.06)',
              }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: themeColors.circle,
                  width: `${joinedPct}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px]" style={{ color: themeColors.mid }}>
              Starts {formatUSDate(rulesAndSchedule.startDate)} ·{' '}
              {memberStats.slotsRemaining} slot
              {memberStats.slotsRemaining === 1 ? '' : 's'} remaining
            </p>
          </div>
        )}

        {(isCompleted || isCancelled) && (
          <div
            className="mb-4 rounded-[18px] border p-4"
            style={{
              backgroundColor: isCompleted
                ? isDark
                  ? 'rgba(96, 165, 250, 0.1)'
                  : 'rgba(96, 165, 250, 0.06)'
                : isDark
                ? 'rgba(156, 163, 175, 0.1)'
                : 'rgba(156, 163, 175, 0.06)',
              borderColor: isCompleted
                ? isDark
                  ? 'rgba(96, 165, 250, 0.3)'
                  : 'rgba(96, 165, 250, 0.2)'
                : themeColors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: isCompleted
                    ? themeColors.trustee
                    : themeColors.light,
                  color: '#FFFFFF',
                }}
              >
                {status}
              </span>
              {isCompleted ? (
                <CheckCircle size={16} style={{ color: themeColors.trustee }} />
              ) : (
                <XCircle size={16} style={{ color: themeColors.light }} />
              )}
            </div>
            <p
              className="mt-2 text-[24px] font-bold leading-tight"
              style={{ color: themeColors.charcoal }}
            >
              {formatCurrency(
                financialStats.roundPool * memberStats.memberCount
              )}{' '}
              <span
                className="text-[13px] font-normal"
                style={{ color: themeColors.mid }}
              >
                total pooled
              </span>
            </p>
            <p className="mt-1 text-[11px]" style={{ color: themeColors.mid }}>
              {isCompleted
                ? `${roundInfo.totalRounds} rounds completed`
                : 'This circle was cancelled'}
            </p>
          </div>
        )}

        {/* ────────── Stats grid (always visible) ────────── */}
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          <StatCard
            icon={Banknote}
            label="Contribution"
            value={formatCurrency(financialStats.contributionAmount)}
            hint={rulesAndSchedule.frequencyDisplay}
            themeColors={themeColors}
          />
          <StatCard
            icon={Trophy}
            label="Round pool"
            value={formatCurrency(financialStats.roundPool)}
            hint="One member receives this"
            themeColors={themeColors}
          />
          <StatCard
            icon={Users}
            label="Members"
            value={`${memberStats.activeMemberCount} of ${memberStats.memberCount}`}
            hint={`${memberStats.slotsRemaining} slot${
              memberStats.slotsRemaining === 1 ? '' : 's'
            } open`}
            themeColors={themeColors}
          />
          <StatCard
            icon={Calendar}
            label={isDraft ? 'Starts' : 'Next collection'}
            value={
              isDraft
                ? formatTimeLeft(rulesAndSchedule.startDate)
                : formatTimeLeft(roundInfo.nextCollectionDate)
            }
            hint={
              isDraft
                ? formatUSDate(rulesAndSchedule.startDate)
                : roundInfo.nextCollectionDate
                ? formatUSDate(roundInfo.nextCollectionDate)
                : 'Not scheduled'
            }
            themeColors={themeColors}
          />
        </div>

        {/* ────────── Tabs (Manage tab removed) ────────── */}
        <div
          className="mb-4 flex overflow-x-auto border-b"
          style={{ borderColor: themeColors.border }}
        >
          <div className="flex min-w-full">
            {visibleTabs.map((tab) => {
              const isActiveTab = activeTab === tab
              const label =
                tab === 'rounds'
                  ? 'Rounds'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="relative shrink-0 whitespace-nowrap px-4 py-3 text-center text-[13px] font-semibold capitalize transition-all"
                  style={{
                    color: isActiveTab ? themeColors.circle : themeColors.mid,
                    borderBottom: isActiveTab
                      ? `2px solid ${themeColors.circle}`
                      : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ────────── Tab content ────────── */}
        <div className="mt-2">
          {/* ─── OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* My membership */}
              <div
                className="rounded-[14px] border p-4"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck
                      size={14}
                      style={{ color: themeColors.circle }}
                    />
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: themeColors.mid }}
                    >
                      Your position
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase"
                    style={{
                      backgroundColor: `${memberStatusColor(
                        myMembership.status,
                        themeColors
                      )}22`,
                      color: memberStatusColor(
                        myMembership.status,
                        themeColors
                      ),
                    }}
                  >
                    {myMembership.status}
                  </span>
                </div>

                <p
                  className="mt-1 text-[20px] font-bold"
                  style={{ color: themeColors.charcoal }}
                >
                  {myMembership.rotationPosition
                    ? `#${myMembership.rotationPosition}`
                    : 'Pending'}{' '}
                  <span
                    className="text-[13px] font-normal"
                    style={{ color: themeColors.mid }}
                  >
                    of {memberStats.memberCount}
                  </span>
                </p>

                <div className="mt-2">
                  {!hasStarted ? (
                    <p
                      className="flex items-center gap-1.5 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      <Clock size={12} /> Payouts begin once the circle starts
                    </p>
                  ) : myMembership.isRecipientThisRound ? (
                    <p
                      className="flex items-center gap-1.5 text-[12px] font-semibold"
                      style={{ color: themeColors.circle }}
                    >
                      <Trophy size={12} /> You're receiving this round
                    </p>
                  ) : myMembership.isNextRecipient ? (
                    <p
                      className="flex items-center gap-1.5 text-[12px] font-semibold"
                      style={{ color: themeColors.circle }}
                    >
                      <Sparkles size={12} /> You're next — get ready!
                    </p>
                  ) : myMembership.payoutReceivedAt ? (
                    <p
                      className="flex items-center gap-1.5 text-[12px]"
                      style={{ color: themeColors.green }}
                    >
                      <CheckCircle size={12} /> You received your payout ·{' '}
                      {formatUSDate(myMembership.payoutReceivedAt)}
                    </p>
                  ) : myMembership.roundsUntilMyTurn !== null ? (
                    <p
                      className="flex items-center gap-1.5 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      <Clock size={12} /> Your payout is in{' '}
                      {myMembership.roundsUntilMyTurn} round
                      {myMembership.roundsUntilMyTurn === 1 ? '' : 's'}
                    </p>
                  ) : (
                    <p
                      className="flex items-center gap-1.5 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      <Clock size={12} /> Your payout is upcoming
                    </p>
                  )}
                </div>

                <div
                  className="mt-3 grid grid-cols-2 gap-2 border-t pt-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <div>
                    <p
                      className="text-[10px]"
                      style={{ color: themeColors.mid }}
                    >
                      Contributed
                    </p>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(myMembership.totalContributed)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px]"
                      style={{ color: themeColors.mid }}
                    >
                      Received
                    </p>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(myMembership.totalReceived)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Invite code card (everyone, while filling up or not started) ── */}
              {showInviteCard && (
                <div
                  className="rounded-[14px] border p-4"
                  style={{
                    backgroundColor: themeColors.circleLight,
                    borderColor: themeColors.circleMid,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <UserPlus size={14} style={{ color: themeColors.circle }} />
                    <p
                      className="text-[12px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      Invite more members
                    </p>
                  </div>
                  <p
                    className="mt-1 text-[11.5px] leading-[1.5]"
                    style={{ color: themeColors.mid }}
                  >
                    {memberStats.slotsRemaining > 0 ? (
                      <>
                        {memberStats.slotsRemaining} slot
                        {memberStats.slotsRemaining === 1 ? '' : 's'} left.
                        Share the invite code with people you trust.
                      </>
                    ) : (
                      <>
                        All members have joined. The circle starts on{' '}
                        {formatUSDate(rulesAndSchedule.startDate)} — share the
                        code if anyone still needs it.
                      </>
                    )}
                  </p>
                  <div
                    className="mt-2 flex items-center gap-2 rounded-[10px] border p-2.5"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <KeyRound size={14} style={{ color: themeColors.mid }} />
                    <span
                      className="flex-1 font-mono text-[14px] font-bold tracking-[0.1em]"
                      style={{ color: themeColors.charcoal }}
                    >
                      {inviteInfo.inviteCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all hover:opacity-90"
                      style={{
                        backgroundColor: copiedCode
                          ? themeColors.circle
                          : themeColors.circleLight,
                        color: copiedCode ? '#FFFFFF' : themeColors.circle,
                      }}
                    >
                      {copiedCode ? (
                        <>
                          <Check size={10} strokeWidth={3} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={10} strokeWidth={2.4} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Rules */}
              <div
                className="rounded-[14px] border p-4"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <p
                  className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  Rules & Schedule
                </p>
                <div className="space-y-2.5">
                  <RuleRow
                    icon={Repeat}
                    label="Frequency"
                    value={rulesAndSchedule.frequencyDisplay}
                    themeColors={themeColors}
                  />
                  {financialStats.depositAmount > 0 && (
                    <RuleRow
                      icon={Lock}
                      label="Security deposit"
                      value={formatCurrency(financialStats.depositAmount)}
                      themeColors={themeColors}
                    />
                  )}
                  {rulesAndSchedule.penaltyAmount > 0 && (
                    <RuleRow
                      icon={AlertTriangle}
                      label="Late penalty"
                      value={`${formatCurrency(
                        rulesAndSchedule.penaltyAmount
                      )} · ${
                        rulesAndSchedule.penaltySource === 'Round'
                          ? 'added to contribution'
                          : 'from deposit'
                      }`}
                      themeColors={themeColors}
                    />
                  )}
                  <RuleRow
                    icon={Clock}
                    label="Grace period"
                    value={`${rulesAndSchedule.gracePeriodHours} hours`}
                    themeColors={themeColors}
                  />
                  <RuleRow
                    icon={Shuffle}
                    label="Rotation"
                    value={formatRotation(rulesAndSchedule.rotationStrategy)}
                    themeColors={themeColors}
                  />
                  <RuleRow
                    icon={Calendar}
                    label="Start date"
                    value={formatUSDate(rulesAndSchedule.startDate)}
                    themeColors={themeColors}
                  />
                  {isDraft && rulesAndSchedule.startPolicy && (
                    <RuleRow
                      icon={Play}
                      label="Starts"
                      value={formatStartPolicy(rulesAndSchedule.startPolicy)}
                      themeColors={themeColors}
                    />
                  )}
                </div>
              </div>

              {/* Organizer manage CTA (navigates to manage page) */}
              {accessState.isOrganizer && (
                <button
                  type="button"
                  onClick={handleManage}
                  className="flex w-full items-center justify-between rounded-[14px] border p-4 transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: themeColors.circleLight,
                        color: themeColors.circle,
                      }}
                    >
                      <Settings size={16} strokeWidth={2.2} />
                    </div>
                    <div className="text-left">
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        Manage this circle
                      </p>
                      <p
                        className="mt-0.5 text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        Edit rules, invite members, or cancel the circle
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: themeColors.mid }} />
                </button>
              )}
            </div>
          )}

          {/* ─── MEMBERS ─── */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  {filteredMembers.length} member
                  {filteredMembers.length === 1 ? '' : 's'} joined ·{' '}
                  {memberStats.slotsRemaining} slot
                  {memberStats.slotsRemaining === 1 ? '' : 's'} open
                </p>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'active', label: 'Active' },
                    { key: 'invited', label: 'Invited' },
                    { key: 'exited', label: 'Exited' },
                    { key: 'defaulted', label: 'Defaulted' },
                  ].map((f) => {
                    const isFilterActive = membersFilter === f.key
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setMembersFilter(f.key)}
                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all"
                        style={{
                          backgroundColor: isFilterActive
                            ? themeColors.circle
                            : themeColors.card,
                          color: isFilterActive
                            ? '#FFFFFF'
                            : themeColors.mid,
                          border: `1px solid ${
                            isFilterActive
                              ? themeColors.circle
                              : themeColors.border
                          }`,
                        }}
                      >
                        {f.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Invite shortcut for everyone while circle is still filling */}
              {showInviteCard && memberStats.slotsRemaining > 0 && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex w-full items-center justify-between rounded-[12px] border px-3 py-2.5 transition-all hover:opacity-90 active:scale-[0.99]"
                  style={{
                    backgroundColor: themeColors.circleLight,
                    borderColor: themeColors.circleMid,
                  }}
                >
                  <span className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: themeColors.circle }}>
                    <UserPlus size={13} />
                    Invite members ·{' '}
                    {memberStats.slotsRemaining} slot
                    {memberStats.slotsRemaining === 1 ? '' : 's'} left
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: copiedCode
                        ? themeColors.circle
                        : themeColors.card,
                      color: copiedCode ? '#FFFFFF' : themeColors.circle,
                    }}
                  >
                    {copiedCode ? (
                      <>
                        <Check size={10} strokeWidth={3} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={10} strokeWidth={2.4} /> Copy code
                      </>
                    )}
                  </span>
                </button>
              )}

              {filteredMembers.length > 0 ? (
                <div
                  className="overflow-hidden rounded-[14px] border"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  {filteredMembers.map((m, i) => (
                    <MemberRow
                      key={`${m.userPublicId}-${i}`}
                      member={m}
                      index={i}
                      currentRound={roundInfo.currentRound}
                      themeColors={themeColors}
                      isDark={isDark}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-[14px] border py-10 text-center"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <Users
                    size={28}
                    style={{ color: themeColors.mid, margin: '0 auto' }}
                  />
                  <p
                    className="mt-2 text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    No members match this filter
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: themeColors.mid }}>
                    Try selecting “All” to see everyone.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── ROUNDS ─── */}
          {activeTab === 'rounds' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div
                  className="rounded-[12px] border px-2 py-2 text-center"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: themeColors.mid }}
                  >
                    Current
                  </p>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {rounds?.currentRound ?? 0}
                    <span
                      className="text-[11px] font-normal"
                      style={{ color: themeColors.mid }}
                    >
                      /{rounds?.totalRounds ?? 0}
                    </span>
                  </p>
                </div>
                <div
                  className="rounded-[12px] border px-2 py-2 text-center"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: themeColors.mid }}
                  >
                    Completed
                  </p>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: themeColors.green }}
                  >
                    {pastRoundsCount}
                  </p>
                </div>
                <div
                  className="rounded-[12px] border px-2 py-2 text-center"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: themeColors.mid }}
                  >
                    Upcoming
                  </p>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: themeColors.circle }}
                  >
                    {upcomingRoundsCount}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'current', label: 'Current' },
                  { key: 'past', label: 'Past' },
                  { key: 'future', label: 'Upcoming' },
                ].map((f) => {
                  const isRoundFilterActive = roundsFilter === f.key
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => {
                        setRoundsFilter(f.key)
                        setShowAllRounds(false)
                      }}
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all"
                      style={{
                        backgroundColor: isRoundFilterActive
                          ? themeColors.circle
                          : themeColors.card,
                        color: isRoundFilterActive
                          ? '#FFFFFF'
                          : themeColors.mid,
                        border: `1px solid ${
                          isRoundFilterActive
                            ? themeColors.circle
                            : themeColors.border
                        }`,
                      }}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>

              {visibleRounds.length > 0 ? (
                <div className="space-y-2">
                  {visibleRounds.map((r) => (
                    <RoundCard
                      key={r.roundNumber}
                      round={r}
                      themeColors={themeColors}
                      isDark={isDark}
                    />
                  ))}
                </div>
              ) : isDraft && !hasStarted ? (
                <div
                  className="rounded-[14px] border p-6 text-center"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <Calendar
                    size={28}
                    style={{ color: themeColors.circle, margin: '0 auto' }}
                  />
                  <p
                    className="mt-3 text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Rounds haven't been created yet
                  </p>
                  <p
                    className="mt-1 text-[11px] leading-[1.55]"
                    style={{ color: themeColors.mid }}
                  >
                    Once the circle starts on{' '}
                    {formatUSDate(rulesAndSchedule.startDate)},{' '}
                    {roundInfo.totalRounds} rounds will be scheduled.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-[14px] border py-10 text-center"
                  style={{
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  }}
                >
                  <Calendar
                    size={28}
                    style={{ color: themeColors.mid, margin: '0 auto' }}
                  />
                  <p
                    className="mt-2 text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    No rounds in this filter
                  </p>
                </div>
              )}

              {filteredRounds.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllRounds((v) => !v)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-[10px] border py-2.5 text-[12px] font-semibold"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.charcoal,
                    backgroundColor: 'transparent',
                  }}
                >
                  {showAllRounds ? (
                    <>
                      Show less <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      Show {filteredRounds.length - 6} more{' '}
                      <ChevronDown size={12} />
                    </>
                  )}
                </button>
              )}

              {(failedRoundsCount > 0 || collectingRoundsCount > 0) && (
                <p
                  className="text-center text-[10.5px]"
                  style={{ color: themeColors.mid }}
                >
                  {collectingRoundsCount > 0 && (
                    <>
                      {collectingRoundsCount} round
                      {collectingRoundsCount === 1 ? '' : 's'} collecting
                    </>
                  )}
                  {collectingRoundsCount > 0 && failedRoundsCount > 0 && ' · '}
                  {failedRoundsCount > 0 && (
                    <>
                      {failedRoundsCount} failed
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* ─── CONTRIBUTIONS (placeholder) ─── */}
          {activeTab === 'contributions' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <StatCard
                  icon={Coins}
                  label="Your contributed"
                  value={formatCurrency(myMembership.totalContributed)}
                  hint="Across all rounds"
                  themeColors={themeColors}
                />
                <StatCard
                  icon={Receipt}
                  label="Missed"
                  value={`${myMembership.missedContributions}`}
                  hint={
                    myMembership.missedContributions === 0
                      ? 'You are on track'
                      : 'Consider paying early'
                  }
                  themeColors={themeColors}
                />
              </div>

              <div
                className="rounded-[14px] border p-6 text-center"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <ListChecks
                  size={30}
                  style={{ color: themeColors.circle, margin: '0 auto' }}
                />
                <p
                  className="mt-3 text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Contribution history coming soon
                </p>
                <p
                  className="mt-1 text-[12px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  A full round-by-round ledger of your contributions, penalties
                  and confirmations will appear here. For now, the Rounds tab
                  shows your status for every round.
                </p>
              </div>

              {hasStarted &&
                myMembership.contributionStatusThisRound &&
                myMembership.contributionStatusThisRound !== 'NotStarted' &&
                myMembership.contributionStatusThisRound !== 'Not_Started' && (
                  <div
                    className="rounded-[14px] border p-3.5"
                    style={{
                      backgroundColor: themeColors.card,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-[10px] font-semibold uppercase tracking-wider"
                          style={{ color: themeColors.mid }}
                        >
                          This round
                        </p>
                        <p
                          className="mt-0.5 text-[13px] font-semibold"
                          style={{ color: themeColors.charcoal }}
                        >
                          Round {roundInfo.currentRound} contribution
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: `${contributionStatusColor(
                            myMembership.contributionStatusThisRound,
                            themeColors
                          )}22`,
                          color: contributionStatusColor(
                            myMembership.contributionStatusThisRound,
                            themeColors
                          ),
                        }}
                      >
                        {contributionStatusLabel(
                          myMembership.contributionStatusThisRound
                        )}
                      </span>
                    </div>
                  </div>
                )}

              {!hasStarted && (
                <p
                  className="text-center text-[11px]"
                  style={{ color: themeColors.mid }}
                >
                  Contributions begin once the circle starts on{' '}
                  {formatUSDate(rulesAndSchedule.startDate)}.
                </p>
              )}
            </div>
          )}

          {/* ─── ACTIVITIES (placeholder) ─── */}
          {activeTab === 'activities' && (
            <div className="space-y-3">
              <div
                className="rounded-[14px] border p-6 text-center"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <History
                  size={30}
                  style={{ color: themeColors.circle, margin: '0 auto' }}
                />
                <p
                  className="mt-3 text-[14px] font-semibold"
                  style={{ color: themeColors.charcoal }}
                >
                  Activity feed coming soon
                </p>
                <p
                  className="mt-1 text-[12px] leading-[1.55]"
                  style={{ color: themeColors.mid }}
                >
                  Joins, contributions, payouts, penalty notes and other circle
                  events will show up here.
                </p>
              </div>

              <div
                className="rounded-[14px] border p-4"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <p
                  className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.mid }}
                >
                  Circle at a glance
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-2 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      <Users size={12} /> Members joined
                    </span>
                    <span
                      className="text-[12.5px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {memberStats.activeMemberCount} /{' '}
                      {memberStats.memberCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-2 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      <Trophy size={12} /> Rounds completed
                    </span>
                    <span
                      className="text-[12.5px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {pastRoundsCount} / {roundInfo.totalRounds}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-2 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      <Banknote size={12} /> Total contributed
                    </span>
                    <span
                      className="text-[12.5px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(financialStats.totalContributedAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="flex items-center gap-2 text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      <Shield size={12} /> Deposits held
                    </span>
                    <span
                      className="text-[12.5px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(financialStats.totalDepositsHeld)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}