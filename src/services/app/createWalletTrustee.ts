// src/services/app/createWalletTrustee.ts

import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

/* ───────────── Verified trustees ───────────── */

export interface VerifiedTrustee {
  id: number
  email: string
  name: string | null
  walletCount: number
}

export interface ListVerifiedTrusteesData {
  items: VerifiedTrustee[]
  totalCount: number
}

export const getVerifiedTrustees = async (): Promise<
  ApiResponse<ListVerifiedTrusteesData>
> => {
  try {
    const response = await authApi.get<ApiResponse<ListVerifiedTrusteesData>>(
      '/trustee/wallets/list/verified/trustees'
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
      const errorData = error.response.data as ApiResponse<ListVerifiedTrusteesData>

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
      message: 'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

/* ───────────── Create trustee wallet ───────────── */

export interface CreateTrusteeWalletRequest {
  name: string
  description?: string
  categoryId: number
  targetAmount: number
  walletTrusteeId: number
  bankAccountId: number
}

export interface CreateTrusteeWalletResponse {
  walletId: number
  walletName: string
  fundedAmount: number
  totalCharges: number
  newMainBalance: number
  walletTrusteeId: number | null
}

export const createTrusteeWallet = async (
  payload: CreateTrusteeWalletRequest
): Promise<ApiResponse<CreateTrusteeWalletResponse>> => {
  try {
    const response = await authApi.post<
      ApiResponse<CreateTrusteeWalletResponse>
    >('/trustee/wallets/create', payload)

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to create wallet',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData =
        error.response.data as ApiResponse<CreateTrusteeWalletResponse>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to create wallet. Please try again.',
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