
import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

/* ───────────── Search circle invitee ───────────── */

export interface SearchCircleInviteeRequest {
  searchTerm: string
}

export interface SearchCircleInviteeResponse {
  found: boolean
  userPublicId: string | null
  email: string | null
  phone: string | null
  firstName: string | null
  lastName: string | null
}

export const searchCircleInvitee = async (
  payload: SearchCircleInviteeRequest
): Promise<ApiResponse<SearchCircleInviteeResponse>> => {
  try {
    const response = await authApi.post<ApiResponse<SearchCircleInviteeResponse>>(
      '/circle/invitees/search',
      payload
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to search invitee',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response
        .data as ApiResponse<SearchCircleInviteeResponse>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to search invitee. Please try again.',
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

/* ───────────── Create circle ───────────── */

export interface CreateCircleInvite {
  identifier: string
  userPublicId?: string
  phone?: string
  displayName?: string
  payoutPosition?: number
}

export interface CreateCircleRequest {
  name: string
  description?: string
  categoryId: number
  contributionAmount: number
  frequency: 'daily' | 'weekly' | 'monthly'
  frequencyConfig: string
  memberCount: number
  depositAmount?: number
  enablePenalty: boolean
  penaltyAmount?: number
  penaltySource: 'deposit' | 'round'
  gracePeriodHours: number
  startPolicy: 'waitForAll' | 'startWithJoined'
  moderatorStartsCircle: boolean
  rotationStrategy: 'fixedOrder' | 'randomDraw' | 'moderatorSet'
  startDate: string
  inviteOnly: boolean
  invites: CreateCircleInvite[]
}


export interface CreateCircleResponse {
  circleId: number
  totalRounds: number
  inviteCode: string
  inviteLink: string
}

export const createCircle = async (
  payload: CreateCircleRequest
): Promise<ApiResponse<CreateCircleResponse>> => {
  try {
    const response = await authApi.post<ApiResponse<CreateCircleResponse>>(
      '/circle/create',
      payload
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to create circle',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<CreateCircleResponse>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to create circle. Please try again.',
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