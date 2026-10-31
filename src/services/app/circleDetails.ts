import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

/* ───────────── Types ───────────── */

export interface CircleAccessState {
  isOrganizer: boolean
  isActiveMember: boolean
  hasReceivedPayout: boolean
  hasPaidThisRound: boolean
  isRecipientThisRound: boolean
  isNextRecipient: boolean
  canContribute: boolean
  canStartCircle: boolean
  canManageMembers: boolean
  canCancelCircle: boolean
}

export interface CircleInfo {
  circleId: number
  walletId: number
  name: string
  description: string
  status: string
  organizerPublicId: string
  organizerName: string
  categoryId: number | null
  categoryName: string | null
  categoryIcon: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

export interface CircleMyMembership {
  memberId: number
  displayName: string
  status: string
  rotationPosition: number | null
  joinedAt: string
  acceptedAt: string | null
  totalContributed: number
  totalReceived: number
  depositHeld: number
  missedContributions: number
  payoutReceivedAt: string | null
  contributionStatusThisRound: string
  isRecipientThisRound: boolean
  isNextRecipient: boolean
  roundsUntilMyTurn: number | null
}

export interface CircleMyWallet {
  walletId: number
  availableAmount: number
  lockedAmount: number
  targetAmount: number
  fundedAmount: number
  totalReleasedAmount: number
  totalWithdrawnAmount: number
}

export interface CircleFinancialStats {
  contributionAmount: number
  roundPool: number
  depositAmount: number
  totalDepositsHeld: number
  totalContributedAmount: number
}

export interface CircleCurrentRecipient {
  memberId: number
  displayName: string
  rotationPosition: number | null
}

export interface CircleRoundInfo {
  currentRound: number
  totalRounds: number
  roundCollected: number
  roundCollectedCount: number
  nextCollectionDate: string | null
  nextPayoutDate: string | null
  currentRecipient: CircleCurrentRecipient | null
}

export interface CircleRulesAndSchedule {
  frequency: string
  frequencyDisplay: string
  penaltyAmount: number
  penaltySource: string
  gracePeriodHours: number
  rotationStrategy: string
  startDate: string
  startPolicy: string
  moderatorStartsCircle: boolean
}

export interface CircleMemberStats {
  memberCount: number
  activeMemberCount: number
  slotsRemaining: number
  paidThisRound: number
}

export interface CircleInviteInfo {
  inviteCode: string
  inviteOnly: boolean
}

export interface CircleDetailsResponse {
  accessState: CircleAccessState
  circleDetails: CircleInfo
  myMembership: CircleMyMembership
  myWallet: CircleMyWallet
  financialStats: CircleFinancialStats
  roundInfo: CircleRoundInfo
  rulesAndSchedule: CircleRulesAndSchedule
  memberStats: CircleMemberStats
  inviteInfo: CircleInviteInfo
}

export interface CircleRoundRecipient {
  memberId: number
  userPublicId: string
  displayName: string
  rotationPosition: number | null
  status: string
}

export interface CircleRoundItem {
  roundNumber: number
  state: string
  recipient: CircleRoundRecipient | null
  poolTarget: number
  pooledAmount: number
  paidOutAmount: number
  contributedCount: number
  collectionDate: string
  payoutDate: string
  paidOutAt: string | null
  myContributionStatus: string
  isRecipient: boolean
}

export interface CircleRoundsResponse {
  currentRound: number
  totalRounds: number
  rounds: CircleRoundItem[]
}

export interface CircleMemberItem {
  userPublicId: string
  displayName: string
  phone: string | null
  status: string
  isOrganizer: boolean
  isYou: boolean
  rotationPosition: number | null
  joinedAt: string
  acceptedAt: string | null
  totalContributed: number
  totalReceived: number
  depositHeld: number
  missedContributions: number
  hasReceivedPayout: boolean
  payoutReceivedAt: string | null
  isRecipientThisRound: boolean
  contributionStatusThisRound: string
}

export interface CircleMembersResponse {
  members: CircleMemberItem[]
}

/* ───────────── Service calls ───────────── */

export const getCircleDetails = async (
  walletId: number
): Promise<ApiResponse<CircleDetailsResponse>> => {
  try {
    const response = await authApi.get<ApiResponse<CircleDetailsResponse>>(
      `/circle/details/${walletId}`
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to load circle details',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<CircleDetailsResponse>
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load circle details. Please try again.',
          },
        })
      )
      return errorData
    }

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Network error. Please check your connection.',
        },
      })
    )

    return {
      request_id: '',
      message: 'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

export const getCircleMembers = async (
  walletId: number,
  status?: string
): Promise<ApiResponse<CircleMembersResponse>> => {
  try {
    const url = status && status !== 'all'
      ? `/circle/details/${walletId}/members?status=${encodeURIComponent(status)}`
      : `/circle/details/${walletId}/members`

    const response = await authApi.get<ApiResponse<CircleMembersResponse>>(url)

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to load circle members',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<CircleMembersResponse>
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load circle members. Please try again.',
          },
        })
      )
      return errorData
    }

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Network error. Please check your connection.',
        },
      })
    )

    return {
      request_id: '',
      message: 'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

export const getCircleRounds = async (
  walletId: number
): Promise<ApiResponse<CircleRoundsResponse>> => {
  try {
    const response = await authApi.get<ApiResponse<CircleRoundsResponse>>(
      `/circle/details/${walletId}/rounds`
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to load circle rounds',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<CircleRoundsResponse>
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load circle rounds. Please try again.',
          },
        })
      )
      return errorData
    }

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Network error. Please check your connection.',
        },
      })
    )

    return {
      request_id: '',
      message: 'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}