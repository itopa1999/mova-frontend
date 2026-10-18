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