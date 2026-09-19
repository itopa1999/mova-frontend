// src/services/app/createwallet.ts

import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export interface WalletCategory {
  id: number
  name: string
  icon: string
}

export interface BankAccount {
  id: number
  accountNumber: string
  accountName: string
  bankName: string
  bankImageUrl: string
}

export interface CreateWalletRequest {
  name: string
  description: string
  categoryId: number
  bankAccountId: number
  targetAmount: number
  frequency: string
  frequencyConfig: string
  amountToBeReleased: number
  startDate: string
  payoutDestination: 'bank' | 'wallet' | 'main'
}

export interface CreateWalletResponse {
  walletId: number
  firstReleaseDate: string
  newMainBalance: number
}

// ===== Categories =====
export const getWalletCategories = async (): Promise<
  ApiResponse<WalletCategory[]>
> => {
  try {
    const response = await authApi.get<
      ApiResponse<WalletCategory[]>
    >('/wallets/categories')

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            response.data.message ||
            'Failed to load categories',
        },
      })
      window.dispatchEvent(errorEvent)
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response
        .data as ApiResponse<WalletCategory[]>

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            errorData.message ||
            'Failed to load categories. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)

      return errorData
    }

    const errorEvent = new CustomEvent('showToast', {
      detail: {
        type: 'error',
        message:
          'Network error. Please check your connection.',
      },
    })
    window.dispatchEvent(errorEvent)

    return {
      request_id: '',
      message:
        'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

// ===== Bank Accounts =====
export const getBankAccounts = async (): Promise<
  ApiResponse<BankAccount[]>
> => {
  try {
    const response = await authApi.get<
      ApiResponse<BankAccount[]>
    >('/bank-account')

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            response.data.message ||
            'Failed to load bank accounts',
        },
      })
      window.dispatchEvent(errorEvent)
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response
        .data as ApiResponse<BankAccount[]>

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            errorData.message ||
            'Failed to load bank accounts. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)

      return errorData
    }

    const errorEvent = new CustomEvent('showToast', {
      detail: {
        type: 'error',
        message:
          'Network error. Please check your connection.',
      },
    })
    window.dispatchEvent(errorEvent)

    return {
      request_id: '',
      message:
        'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

// ===== Create Wallet =====
export const createWallet = async (
  payload: CreateWalletRequest
): Promise<ApiResponse<CreateWalletResponse>> => {
  try {
    const response = await authApi.post<
      ApiResponse<CreateWalletResponse>
    >('/wallets/create', payload)

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            response.data.message ||
            'Failed to create wallet',
        },
      })
      window.dispatchEvent(errorEvent)
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response
        .data as ApiResponse<CreateWalletResponse>

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            errorData.message ||
            'Failed to create wallet. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)

      return errorData
    }

    const errorEvent = new CustomEvent('showToast', {
      detail: {
        type: 'error',
        message:
          'Network error. Please check your connection.',
      },
    })
    window.dispatchEvent(errorEvent)

    return {
      request_id: '',
      message:
        'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}