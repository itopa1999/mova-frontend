// src/pages/app/CircleConsentPage.tsx

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Users,
  User,
  Calendar,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Lock,
  Repeat,
  ChevronRight,
  Info,
  UserPlus,
  Wallet,
  Plus,
} from 'lucide-react'

import AppLayout from '../../components/layout/AppLayout'
import BackButton from '../../components/ui/BackButton'
import BottomSheet from '../../components/ui/BottomSheet'
import PinModal from '../../components/ui/PinModal'
import { useTheme } from '../../hooks/useTheme'
import { useBottomSheet } from '../../hooks/useBottomSheet'
import { useWalletFees } from '../../hooks/useWalletFees'
import { UseUserBalance } from '../../hooks/useUserBalance'
import { colors, darkColors } from '../../styles/tokens'
import {
  formatCurrency,
  formatUSDate as formatDate,
} from '../../utils/formatting'
import type { CircleInviteDetailsResponse } from '../../services/app/createCircle'

type SheetKey = 'confirm-join'

interface ConsentLocationState {
  inviteCode?: string
  circleDetails?: CircleInviteDetailsResponse
}

export default function CircleConsentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const themeColors = isDark ? darkColors : colors
  const sheet = useBottomSheet<SheetKey>()

  const { userBalance: availableBalance } = UseUserBalance()

  const state = (location.state ?? {}) as ConsentLocationState
  const data = state.circleDetails ?? null

  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const safeContribution = data?.financialStats.contributionAmount ?? 0
  const safeMemberCount = data?.memberStats.memberCount ?? 1

  const fees = useWalletFees({
    target: safeContribution * safeMemberCount,
    release: safeContribution * safeMemberCount,
    destination: 'circle',
    overrideReleases: 1,
  })
  const movaFee = fees.totalMovaCharges

  useEffect(() => {
    if (!data) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: 'Invalid invite. Please try again.',
          },
        })
      )
      navigate('/dashboard/create-wallet', { replace: true })
    }
  }, [data, navigate])

  if (!data) return null

  const {
    accessState,
    circleDetails,
    financialStats,
    rulesAndSchedule,
    memberStats,
    members,
  } = data

  const frequencyDisplay = rulesAndSchedule.frequencyDisplay ?? ''

  const totalUpfront =
    financialStats.contributionAmount + financialStats.depositAmount + movaFee
  const remainingBalance = availableBalance - totalUpfront
  const exceedsBalance = totalUpfront > availableBalance

  const progressPercent =
    memberStats.memberCount > 0
      ? (memberStats.activeMemberCount / memberStats.memberCount) * 100
      : 0

  const openPinSheet = () => {
    if (exceedsBalance) {
      setSubmitError(
        'Your contribution, deposit and MOVA fee exceed your available balance.'
      )
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: 'Add funds to continue.',
          },
        })
      )
      return
    }
    setSubmitError(null)
    sheet.open('confirm-join')
  }

  const handleJoinCircle = () => {
    if (exceedsBalance) {
      setIsPinModalOpen(false)
      setSubmitError(
        'Your contribution, deposit and MOVA fee exceed your available balance.'
      )
      throw new Error('Insufficient balance. Please add funds to continue.')
    }

    setIsJoining(true)
    setTimeout(() => {
      setIsJoining(false)
      setIsPinModalOpen(false)
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: 'Successfully joined the circle!',
          },
        })
      )
      navigate(`/dashboard/circles/details/${circleDetails.circleId}`)
    }, 1500)
  }

  return (
    <AppLayout>
      <div
        className="flex min-h-screen flex-col"
        style={{ color: themeColors.charcoal }}
      >
        <div className="mb-5 flex items-center gap-3 px-4 pt-5">
          <BackButton onClick={() => navigate(-1)} variant="subtle" />
          <div>
            <h1
              className="text-[20px] font-bold"
              style={{ color: themeColors.charcoal }}
            >
              Circle Invite
            </h1>
            <p className="text-[12px]" style={{ color: themeColors.mid }}>
              Review the details before joining
            </p>
          </div>
        </div>

        <div className="flex-1 px-4 pb-6">
          {accessState.alreadyJoined ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.circleLight }}
              >
                <CheckCircle size={40} style={{ color: themeColors.circle }} />
              </div>
              <h2
                className="mt-4 text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                You're already a member!
              </h2>
              <p className="mt-2 text-[14px]" style={{ color: themeColors.mid }}>
                You are part of "{circleDetails.name}". Ready to jump back in?
              </p>
              <button
                onClick={() =>
                  navigate(
                    `/dashboard/circles/details/${circleDetails.circleId}`
                  )
                }
                className="mt-6 flex items-center gap-2 rounded-[12px] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: themeColors.circle }}
              >
                Go to Circle Dashboard
                <ChevronRight size={16} />
              </button>
            </div>
          ) : !accessState.canJoin ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.circleLight }}
              >
                <AlertCircle size={40} style={{ color: themeColors.circle }} />
              </div>
              <h2
                className="mt-4 text-[20px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                {accessState.hasPendingInvite
                  ? 'Your invite is pending'
                  : 'Cannot join this circle'}
              </h2>
              <p
                className="mt-2 max-w-[280px] text-[14px]"
                style={{ color: themeColors.mid }}
              >
                {accessState.hasPendingInvite
                  ? 'The organizer needs to approve your request before you can join.'
                  : 'This circle is not accepting new members right now.'}
              </p>
              <button
                onClick={() => navigate('/dashboard/create-wallet')}
                className="mt-6 rounded-[12px] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: themeColors.circle }}
              >
                Back
              </button>
            </div>
          ) : (
            <>
              <div
                className="mb-4 rounded-[20px] border p-5 shadow-sm"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[14px]"
                      style={{
                        backgroundColor: themeColors.circleLight,
                        color: themeColors.circle,
                      }}
                    >
                      <Users size={24} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2
                        className="text-[18px] font-bold leading-tight"
                        style={{ color: themeColors.charcoal }}
                      >
                        {circleDetails.name}
                      </h2>
                      <p
                        className="mt-0.5 flex items-center gap-1 text-[12px]"
                        style={{ color: themeColors.mid }}
                      >
                        <User size={12} /> Organizer:{' '}
                        {circleDetails.organizerName}
                      </p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: themeColors.border,
                      color: themeColors.mid,
                    }}
                  >
                    {circleDetails.status}
                  </span>
                </div>
                {circleDetails.description && (
                  <p
                    className="mt-4 text-[13px] leading-[1.6]"
                    style={{ color: themeColors.mid }}
                  >
                    {circleDetails.description}
                  </p>
                )}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div
                  className="rounded-[16px] border p-4"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.03)'
                      : '#F9FAFB',
                    borderColor: themeColors.border,
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.mid }}
                  >
                    Contribution
                  </p>
                  <p
                    className="mt-1 text-[18px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {formatCurrency(financialStats.contributionAmount)}
                  </p>
                  <p
                    className="mt-0.5 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    per {rulesAndSchedule.frequency.toLowerCase()}
                  </p>
                </div>
                <div
                  className="rounded-[16px] border p-4"
                  style={{
                    backgroundColor: themeColors.circleLight,
                    borderColor: themeColors.circleMid,
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.circle }}
                  >
                    Round Pool
                  </p>
                  <p
                    className="mt-1 text-[18px] font-bold"
                    style={{ color: themeColors.charcoal }}
                  >
                    {formatCurrency(financialStats.roundPool)}
                  </p>
                  <p
                    className="mt-0.5 text-[11px]"
                    style={{ color: themeColors.mid }}
                  >
                    one member receives this
                  </p>
                </div>
              </div>

              <div
                className="mb-4 rounded-[16px] border"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div
                  className="flex items-center gap-2 border-b px-4 py-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <Shield size={16} style={{ color: themeColors.mid }} />
                  <h3
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Rules & Schedule
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Start Date
                    </p>
                    <p
                      className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      <Calendar size={13} />{' '}
                      {formatDate(rulesAndSchedule.startDate)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Rotation
                    </p>
                    <p
                      className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium capitalize"
                      style={{ color: themeColors.charcoal }}
                    >
                      <Repeat size={13} />{' '}
                      {rulesAndSchedule.rotationStrategy
                        .replace(/([A-Z])/g, ' $1')
                        .trim()}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Penalty
                    </p>
                    <p
                      className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      <AlertCircle size={13} />{' '}
                      {formatCurrency(rulesAndSchedule.penaltyAmount)}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: themeColors.mid }}
                    >
                      {rulesAndSchedule.penaltySource === 'Round'
                        ? 'Added to contribution'
                        : 'From deposit'}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[11px]"
                      style={{ color: themeColors.mid }}
                    >
                      Grace Period
                    </p>
                    <p
                      className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium"
                      style={{ color: themeColors.charcoal }}
                    >
                      <Clock size={13} />{' '}
                      {rulesAndSchedule.gracePeriodHours}h
                    </p>
                  </div>
                  {frequencyDisplay && (
                    <div
                      className="col-span-2 border-t pt-3"
                      style={{ borderColor: themeColors.border }}
                    >
                      <p
                        className="text-[11px]"
                        style={{ color: themeColors.mid }}
                      >
                        Contribution Schedule
                      </p>
                      <p
                        className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium capitalize"
                        style={{ color: themeColors.charcoal }}
                      >
                        <Calendar size={13} /> {frequencyDisplay}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="mb-4 flex items-start gap-3 rounded-[14px] border p-3.5"
                style={{
                  backgroundColor: themeColors.circleLight,
                  borderColor: themeColors.circleMid,
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: themeColors.circle,
                    color: '#FFFFFF',
                  }}
                >
                  <Wallet size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    When it's your turn
                  </p>
                  <p
                    className="mt-0.5 text-[11.5px] leading-[1.55]"
                    style={{ color: themeColors.mid }}
                  >
                    The full round pool of{' '}
                    <strong style={{ color: themeColors.charcoal }}>
                      {formatCurrency(financialStats.roundPool)}
                    </strong>{' '}
                    will be sent directly to your circle wallet. Your position
                    in the rotation will be shown on the members list once
                    accepted.
                  </p>
                </div>
              </div>

              <div
                className="mb-4 rounded-[16px] border p-4"
                style={{
                  backgroundColor: exceedsBalance
                    ? isDark
                      ? 'rgba(239, 68, 68, 0.06)'
                      : 'rgba(239, 68, 68, 0.03)'
                    : themeColors.card,
                  borderColor: exceedsBalance
                    ? isDark
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(239, 68, 68, 0.2)'
                    : themeColors.border,
                }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Wallet size={16} style={{ color: themeColors.circle }} />
                  <h3
                    className="text-[13px] font-semibold"
                    style={{ color: themeColors.charcoal }}
                  >
                    Upfront cost breakdown
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 pr-3">
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        Available balance
                      </p>
                      <p
                        className="mt-0.5 text-[11px] leading-[1.45]"
                        style={{ color: themeColors.mid }}
                      >
                        Your current MOVA wallet balance.
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(availableBalance)}
                    </p>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 pr-3">
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        1st contribution
                      </p>
                      <p
                        className="mt-0.5 text-[11px] leading-[1.45]"
                        style={{ color: themeColors.mid }}
                      >
                        Your first{' '}
                        {rulesAndSchedule.frequency.toLowerCase()} payment into
                        the circle. Every member pays this on each round.
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(financialStats.contributionAmount)}
                    </p>
                  </div>

                  {financialStats.depositAmount > 0 && (
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 pr-3">
                        <p
                          className="flex items-center gap-1.5 text-[13px] font-medium"
                          style={{ color: themeColors.charcoal }}
                        >
                          Security deposit <Lock size={10} />
                        </p>
                        <p
                          className="mt-0.5 text-[11px] leading-[1.45]"
                          style={{ color: themeColors.mid }}
                        >
                          Held safely and fully refunded when the circle
                          completes without you defaulting.
                        </p>
                      </div>
                      <p
                        className="shrink-0 text-[13px] font-semibold"
                        style={{ color: themeColors.charcoal }}
                      >
                        {formatCurrency(financialStats.depositAmount)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 pr-3">
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: themeColors.charcoal }}
                      >
                        MOVA fee
                      </p>
                      <p
                        className="mt-0.5 text-[11px] leading-[1.45]"
                        style={{ color: themeColors.mid }}
                      >
                        One-time fee, calculated on the{' '}
                        <strong style={{ color: themeColors.charcoal }}>
                          {formatCurrency(financialStats.roundPool)} round pool
                        </strong>{' '}
                        (not on your individual contribution). You pay this
                        only once when you join.
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      {formatCurrency(movaFee)}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-between border-t pt-3"
                    style={{ borderColor: themeColors.border }}
                  >
                    <div>
                      <p
                        className="text-[14px] font-bold"
                        style={{ color: themeColors.charcoal }}
                      >
                        Total upfront
                      </p>
                      <p
                        className="text-[10.5px]"
                        style={{ color: themeColors.mid }}
                      >
                        Charged once when you tap Join Circle
                      </p>
                    </div>
                    <p
                      className="text-[16px] font-bold"
                      style={{
                        color: exceedsBalance
                          ? '#EF4444'
                          : themeColors.circle,
                      }}
                    >
                      {formatCurrency(totalUpfront)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Remaining after
                    </span>
                    <span
                      className="text-[13px] font-semibold"
                      style={{
                        color: exceedsBalance
                          ? '#EF4444'
                          : themeColors.charcoal,
                      }}
                    >
                      {formatCurrency(Math.max(remainingBalance, 0))}
                    </span>
                  </div>

                  {exceedsBalance && (
                    <p
                      className="flex items-start gap-1.5 text-[11px]"
                      style={{ color: '#EF4444' }}
                    >
                      <AlertCircle size={12} className="mt-0.5 shrink-0" />
                      <span>
                        Not enough balance. Add funds to cover the{' '}
                        {formatCurrency(totalUpfront - availableBalance)}{' '}
                        shortfall before joining.
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div
                className="mb-4 rounded-[16px] border"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div
                  className="flex items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: themeColors.border }}
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: themeColors.mid }} />
                    <h3
                      className="text-[13px] font-semibold"
                      style={{ color: themeColors.charcoal }}
                    >
                      Members ({memberStats.activeMemberCount}/
                      {memberStats.memberCount})
                    </h3>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: themeColors.circleLight,
                      color: themeColors.circle,
                    }}
                  >
                    {memberStats.slotsRemaining} slots left
                  </span>
                </div>

                <div className="px-4 pt-3 pb-1">
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: themeColors.border }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: themeColors.circle,
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="max-h-[240px] overflow-y-auto px-4 pb-3">
                  {members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-bold"
                          style={{
                            backgroundColor: themeColors.circle,
                            color: '#FFFFFF',
                          }}
                          title={`Rotation position ${member.rotationPosition}`}
                        >
                          {member.rotationPosition}
                        </div>
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                          style={{
                            backgroundColor: themeColors.background,
                            color: themeColors.charcoal,
                          }}
                        >
                          {member.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className="text-[13px] font-medium"
                          style={{ color: themeColors.charcoal }}
                        >
                          {member.displayName}
                        </span>
                        {member.isOrganizer && (
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: themeColors.greenLight,
                              color: themeColors.green,
                            }}
                          >
                            Organizer
                          </span>
                        )}
                      </div>
                      <span
                        className="text-[11px] font-medium"
                        style={{
                          color:
                            member.status === 'Active'
                              ? themeColors.green
                              : themeColors.mid,
                        }}
                      >
                        {member.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[16px] border p-4"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span
                      className="text-[12px]"
                      style={{ color: themeColors.mid }}
                    >
                      Total upfront cost
                    </span>
                    <p
                      className="text-[10px]"
                      style={{ color: themeColors.mid }}
                    >
                      Contribution + deposit + one-time fee
                    </p>
                  </div>
                  <span
                    className="text-[16px] font-bold"
                    style={{
                      color: exceedsBalance ? '#EF4444' : themeColors.charcoal,
                    }}
                  >
                    {formatCurrency(totalUpfront)}
                  </span>
                </div>

                {submitError && (
                  <div
                    className="mb-3 rounded-[10px] p-2.5 text-[11.5px]"
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(239, 68, 68, 0.08)',
                      color: '#EF4444',
                    }}
                  >
                    {submitError}
                  </div>
                )}

                {exceedsBalance ? (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/add-funds')}
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: themeColors.circle }}
                  >
                    <Plus size={18} />
                    Add funds
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openPinSheet}
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: themeColors.circle }}
                  >
                    <UserPlus size={18} />
                    Accept & Join Circle
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={sheet.activeSheet === 'confirm-join'}
        onClose={sheet.close}
        title="Confirm Joining"
        icon={<CheckCircle size={16} strokeWidth={2.4} />}
        footer={
          <button
            type="button"
            onClick={() => {
              if (exceedsBalance) {
                sheet.close()
                setSubmitError(
                  'Your contribution, deposit and MOVA fee exceed your available balance.'
                )
                return
              }
              sheet.close()
              setIsPinModalOpen(true)
            }}
            disabled={exceedsBalance}
            className="w-full rounded-[12px] px-4 py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: themeColors.circle, color: '#FFFFFF' }}
          >
            {exceedsBalance ? 'Insufficient balance' : 'Proceed to PIN'}
          </button>
        }
      >
        <div className="space-y-4">
          <div
            className="rounded-[12px] p-4"
            style={{
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.03)'
                : '#F9FAFB',
            }}
          >
            <div className="flex justify-between py-1">
              <span className="text-[13px]" style={{ color: themeColors.mid }}>
                Available balance
              </span>
              <span
                className="text-[13px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(availableBalance)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[13px]" style={{ color: themeColors.mid }}>
                1st Contribution
              </span>
              <span
                className="text-[13px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(financialStats.contributionAmount)}
              </span>
            </div>
            {financialStats.depositAmount > 0 && (
              <div className="flex justify-between py-1">
                <span
                  className="flex items-center gap-1 text-[13px]"
                  style={{ color: themeColors.mid }}
                >
                  Security Deposit <Lock size={10} />
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: themeColors.charcoal }}
                >
                  {formatCurrency(financialStats.depositAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-[13px]" style={{ color: themeColors.mid }}>
                MOVA Fee
              </span>
              <span
                className="text-[13px] font-medium"
                style={{ color: themeColors.charcoal }}
              >
                {formatCurrency(movaFee)}
              </span>
            </div>
            <p
              className="mt-1 text-[10.5px] leading-[1.5]"
              style={{ color: themeColors.mid }}
            >
              The MOVA fee is calculated on the{' '}
              <strong style={{ color: themeColors.charcoal }}>
                {formatCurrency(financialStats.roundPool)} round pool
              </strong>
              , not on your individual contribution. It's charged once, only
              when you join.
            </p>
            <div
              className="mt-2 flex justify-between border-t pt-2"
              style={{ borderColor: themeColors.border }}
            >
              <span
                className="text-[14px] font-bold"
                style={{ color: themeColors.charcoal }}
              >
                Total
              </span>
              <span
                className="text-[16px] font-bold"
                style={{
                  color: exceedsBalance ? '#EF4444' : themeColors.circle,
                }}
              >
                {formatCurrency(totalUpfront)}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[12px]" style={{ color: themeColors.mid }}>
                Remaining after
              </span>
              <span
                className="text-[12px] font-medium"
                style={{
                  color: exceedsBalance ? '#EF4444' : themeColors.charcoal,
                }}
              >
                {formatCurrency(Math.max(remainingBalance, 0))}
              </span>
            </div>
          </div>

          {exceedsBalance && (
            <div
              className="flex items-start gap-2 rounded-[10px] p-3"
              style={{
                backgroundColor: isDark
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(239, 68, 68, 0.06)',
              }}
            >
              <AlertCircle
                size={16}
                style={{ color: '#EF4444', marginTop: 1, flexShrink: 0 }}
              />
              <p
                className="text-[11px] leading-[1.55]"
                style={{ color: '#EF4444' }}
              >
                You need{' '}
                <strong>
                  {formatCurrency(totalUpfront - availableBalance)}
                </strong>{' '}
                more to join. Add funds to your MOVA wallet and try again.
              </p>
            </div>
          )}

          <div
            className="flex items-start gap-2 rounded-[10px] p-3"
            style={{
              backgroundColor: isDark
                ? 'rgba(96, 165, 250, 0.1)'
                : 'rgba(96, 165, 250, 0.06)',
            }}
          >
            <Info
              size={16}
              style={{ color: '#60A5FA', marginTop: 1, flexShrink: 0 }}
            />
            <p
              className="text-[11px] leading-[1.55]"
              style={{ color: themeColors.charcoal }}
            >
              By joining, you agree to the circle rules. The Security Deposit
              is refundable upon successful completion of the circle.
            </p>
          </div>
        </div>
      </BottomSheet>

      <PinModal
        isOpen={isPinModalOpen}
        title="Verify PIN"
        description="Enter your PIN to confirm joining this circle."
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handleJoinCircle}
        isLoading={isJoining}
        maxLength={6}
      />
    </AppLayout>
  )
}