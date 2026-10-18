import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'


export interface TrusteeInviteConsentInfo {
  ownerFirstName: string
  ownerMaskedEmail: string
  trusteeEmail: string
  invitationExpiresAt: string
}

export const getTrusteeInviteConsent = async (
  token: string
): Promise<ApiResponse<TrusteeInviteConsentInfo>> => {
  try {
    const response = await authApi.get<ApiResponse<TrusteeInviteConsentInfo>>(
      `/trustee/wallets/validate/invitation/${token}`
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<TrusteeInviteConsentInfo>
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

export const acceptTrusteeInvite = async (
  token: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.post<ApiResponse<null>>(
      `/trustee/wallets/accept/invitation/${token}`
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

export const declineTrusteeInvite = async (
  token: string,
  reason?: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.post<ApiResponse<null>>(
      `/trustee/wallets/decline/invitation/${token}`,
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


export interface OwnerTrusteeItem {
  id: number
  publicId: string
  email: string
  name: string | null
  status: 'Pending' | 'Verified' | string
  invitedAt: string
  verifiedAt: string | null
  tokenExpiresAt: string | null
  walletCount: number
}

export interface ListOwnerTrusteesData {
  items: OwnerTrusteeItem[]
  pendingCount: number
  verifiedCount: number
}

export const listOwnerTrustees = async (): Promise<
  ApiResponse<ListOwnerTrusteesData>
> => {
  try {
    const response = await authApi.get<ApiResponse<ListOwnerTrusteesData>>(
      '/trustee/wallets/trustee'
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to load trustees',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData =
        error.response.data as ApiResponse<ListOwnerTrusteesData>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load trustees. Please try again.',
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
      message: 'Network error.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

export interface InviteTrusteePayload {
  trusteeEmail: string
  trusteeName?: string
}

export interface InviteTrusteeData {
  trusteeId: number
  trusteeEmail: string
  trusteeName: string | null
  invitationExpiresAt: string
}

export const inviteTrustee = async (
  payload: InviteTrusteePayload
): Promise<ApiResponse<InviteTrusteeData>> => {
  try {
    const response = await authApi.post<ApiResponse<InviteTrusteeData>>(
      '/trustee/wallets/invite',
      payload
    )

    if (!response.data.is_success) {
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<InviteTrusteeData>
    }

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

export interface ResendInvitationData {
  trusteeId: number
  trusteeEmail: string
  newExpiresAt: string
  sentAt: string
}

export const resendTrusteeInvitation = async (
  trusteeId: number
): Promise<ApiResponse<ResendInvitationData>> => {
  try {
    const response = await authApi.post<ApiResponse<ResendInvitationData>>(
      `/trustee/wallets/resend-invitation/${trusteeId}`
    )

    if (!response.data.is_success) {
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<ResendInvitationData>
    }

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
