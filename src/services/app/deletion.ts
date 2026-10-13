import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export interface AccountDeletionEligibility {
  accountStatus: string | null
  accountStatusLabel: string | null
  accountStatusDescription: string | null

  walletBalance: number
  walletBalanceNeedsResolution: boolean

  walletAvailableBalance: number
  availableBalanceNeedsResolution: boolean

  hasPendingScheduleRelease: boolean
  scheduleReleaseNeedsResolution: boolean

  hasActiveWallet: boolean
  activeWalletNeedsResolution: boolean

  isTransactionActive: boolean
  isUserActionActive: boolean
  userActionNeedsResolution: boolean

  canRequestAccountDeletion: boolean
}

export const getAccountDeletionEligibility = async (): Promise<
  ApiResponse<AccountDeletionEligibility>
> => {
  try {
    const response = await authApi.get<ApiResponse<AccountDeletionEligibility>>(
      '/auth/account-deletion'
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message,
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<AccountDeletionEligibility>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load account status. Please try again.',
          },
        })
      )

      return errorData
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

export const requestAccountDeletion = async (
  reason?: string
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.delete<ApiResponse<null>>(
      '/auth/account-deletion',
      {
        data: { reason: reason ?? null },
      }
    )

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<null>

      return (
        errorData ?? {
          request_id: '',
          message: 'Failed to submit account deletion request.',
          is_success: false,
          status_code: 'error',
          timestamp: new Date().toISOString(),
          data: null,
        }
      )
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