import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

// ─── Types ────────────────────────────────────────────

export type RenewalTriggerType = 'oncompletion' | 'onthreshold'
export type RefillAmountType = 'fixed' | 'custom'
export type RenewalResultType = 'Succeeded' | 'Skipped' | 'Failed'

export interface CreateRenewalPolicyRequest {
  triggerType: RenewalTriggerType
  triggerAmount: number
  refillAmountType: RefillAmountType
  refillAmount: number
  minMainBalance: number
  maxRenewals: number | null
  refillUntilMainBalanceExhausted: boolean
}

export interface CreateRenewalPolicyResponse {
  walletName: string
}

export interface RenewalPolicy {
  renewalPolicyId: number
  walletId: number
  walletName: string
  isEnabled: boolean

  status: string

  triggerType: string
  triggerAmount: number

  refillAmountType: string
  refillAmount: number
  refillAmountEffective: number

  minMainBalance: number

  maxRenewals: number | null
  renewalsCount: number
  renewalsRemaining: number | null

  /**
   * Echo of the flag the policy was created with. When true, the
   * backend will ignore `minMainBalance` and refill until the main
   * balance is empty.
   */
  refillUntilMainBalanceExhausted: boolean

  createdAt: string
  modifiedAt: string | null
}

export interface RenewalEvent {
  id: number
  occurredAt: string
  result: RenewalResultType
  reason: string | null
  amount: number
  transactionId: number | null
}

export interface RenewalEventsResponse {
  walletId: number
  walletName: string
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  events: RenewalEvent[]
}

// ─── API Calls ────────────────────────────────────────

export const createRenewalPolicy = async (
  walletId: number,
  payload: CreateRenewalPolicyRequest
): Promise<ApiResponse<CreateRenewalPolicyResponse>> => {
  try {
    const response = await authApi.post<ApiResponse<CreateRenewalPolicyResponse>>(
      `/wallets/${walletId}/automation`,
      payload
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
      const errorData = error.response.data as ApiResponse<CreateRenewalPolicyResponse>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to enable automation. Please try again.',
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

export const getRenewalPolicy = async (
  walletId: number
): Promise<ApiResponse<RenewalPolicy>> => {
  try {
    const response = await authApi.get<ApiResponse<RenewalPolicy>>(
      `/wallets/${walletId}/automation`
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<RenewalPolicy>
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

export const getRenewalEvents = async (
  walletId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<RenewalEventsResponse>> => {
  try {
    const response = await authApi.get<ApiResponse<RenewalEventsResponse>>(
      `/wallets/${walletId}/automation/events`,
      {
        params: { page, pageSize },
      }
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<RenewalEventsResponse>
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

// ─── Placeholder for later BE work (pause / resume / update / delete) ──

export interface ToggleRenewalResponse {
  status: string
  isEnabled: boolean
}

export const toggleRenewal = async (
  walletId: number
): Promise<ApiResponse<ToggleRenewalResponse>> => {
  try {
    const response = await authApi.put<ApiResponse<ToggleRenewalResponse>>(
      `/wallets/${walletId}/automation/toggle`
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: response.data.message },
        })
      )
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<ToggleRenewalResponse>
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: errorData.message || 'Failed to update automation.',
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

export const updateRenewalPolicy = async (
  walletId: number,
  payload: CreateRenewalPolicyRequest
): Promise<ApiResponse<CreateRenewalPolicyResponse>> => {
  try {
    const response = await authApi.put<ApiResponse<CreateRenewalPolicyResponse>>(
      `/wallets/${walletId}/automation`,
      payload
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: response.data.message },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<CreateRenewalPolicyResponse>
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: errorData.message || 'Failed to update automation.',
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