import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export interface TrusteeSummary {
  id: number
  email: string
  name: string | null
  status: 'Pending' | 'Verified' | string
  verifiedAt: string | null
}

export interface PendingReleaseSummary {
  id: number
  amount: number
  requestedAt: string
  expiresAt: string
  userNote: string | null
  payoutDestination: string
}

export interface ReleaseStats {
  totalRequests: number
  approvedCount: number
  rejectedCount: number
  expiredCount: number
}

export interface TrusteeWalletDetail {
  id: number
  name: string
  description: string | null
  categoryId: number
  categoryName: string
  categoryIcon: string
  targetAmount: number
  lockedAmount: number
  totalReleasedAmount: number
  availableAmount: number
  progressPercentage: number
  status: string
  type: string
  createdAt: string
  completedAt: string | null
  closedAt: string | null
  trustee: TrusteeSummary | null
  pendingRelease: PendingReleaseSummary | null
  stats: ReleaseStats
}

export interface ReleaseRequestItem {
  id: number
  amount: number
  destination: string
  status: string
  requestedAt: string
  expiresAt: string
  decidedAt: string | null
  decisionReason: string | null
  userNote: string | null
  decidedByTrusteeName: string | null
  decidedByTrusteeEmail: string | null
}

export interface ReleaseRequestsPage {
  walletId: number
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  expiredCount: number
  items: ReleaseRequestItem[]
}

export const getWalletReleaseRequests = async (
  walletId: number,
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<ApiResponse<ReleaseRequestsPage>> => {
  try {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('pageSize', String(pageSize))
    if (status) params.append('status', status)

    const response = await authApi.get<ApiResponse<ReleaseRequestsPage>>(
      `/trustee/wallets/${walletId}/release-requests?${params.toString()}`
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              response.data.message || 'Failed to load release requests',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData =
        error.response.data as ApiResponse<ReleaseRequestsPage>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load release requests. Please try again.',
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

export const getTrusteeWalletDetail = async (
  walletId: number
): Promise<ApiResponse<TrusteeWalletDetail>> => {
  try {
    const response = await authApi.get<ApiResponse<TrusteeWalletDetail>>(
      `/trustee/wallets/${walletId}`
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to load wallet',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<TrusteeWalletDetail>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load wallet. Please try again.',
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


/* ───────────── Release requests ───────────── */

export interface RequestReleasePayload {
  amount: number
  userNote?: string
}

export interface RequestReleaseResponse {
  requestId: number
  amount: number
  trusteeEmail: string
  trusteeName: string | null
  expiresAt: string
}

export interface ReleaseRequestConsentInfo {
  requestId: number
  walletName: string
  amount: number
  userNote: string | null
  bankName: string
  maskedAccountNumber: string
  requesterFirstName: string
  trusteeEmail: string
  trusteeName: string | null
  requestedAt: string
  expiresAt: string
}

export const requestRelease = async (
  walletId: number,
  payload: RequestReleasePayload
): Promise<ApiResponse<RequestReleaseResponse>> => {
  try {
    const response = await authApi.post<ApiResponse<RequestReleaseResponse>>(
      `/trustee/wallets/${walletId}/release-requests`,
      payload
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to submit request',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<RequestReleaseResponse>
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to submit request. Please try again.',
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

export const getReleaseRequestConsent = async (
  token: string
): Promise<ApiResponse<ReleaseRequestConsentInfo>> => {
  try {
    const response = await authApi.get<ApiResponse<ReleaseRequestConsentInfo>>(
      `/trustee/wallets/release/validate/${token}`
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<ReleaseRequestConsentInfo>
    }
    return {
      request_id: '',
      message: 'Network error.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

export const approveReleaseRequest = async (
  token: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.post<ApiResponse<null>>(
      `/trustee/wallets/release/${token}/approve`
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<null>
    }
    return {
      request_id: '',
      message: 'Network error.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

export const rejectReleaseRequest = async (
  token: string,
  reason?: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.post<ApiResponse<null>>(
      `/trustee/wallets/release/${token}/reject`,
      { reason }
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<null>
    }
    return {
      request_id: '',
      message: 'Network error.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}