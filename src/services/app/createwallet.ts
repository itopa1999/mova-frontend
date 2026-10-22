// src/services/app/createwallet.ts

import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

/* ───────────── Core types ───────────── */

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

/* ───────────── Payout destinations ───────────── */

export type PayoutDestination = 'bank' | 'wallet' | 'main' | 'utilities'

/* ───────────── Utility config ───────────── */

export type UtilityType = 'airtime' | 'data' | 'cable' | 'electricity'

export type MobileNetwork = 'mtn' | 'airtel' | 'glo' | '9mobile'

export type CableProvider = 'DSTV' | 'GOtv' | 'Startimes'

export type MeterType = 'prepaid' | 'postpaid'

interface UtilityConfigBase {
  utilityType: UtilityType
}

export interface AirtimeConfig extends UtilityConfigBase {
  utilityType: 'airtime'
  network: MobileNetwork
  phoneNumber: string
}

export interface DataConfig extends UtilityConfigBase {
  utilityType: 'data'
  network: MobileNetwork
  phoneNumber: string
  planCode: string
}

export interface CableConfig extends UtilityConfigBase {
  utilityType: 'cable'
  cableProvider: CableProvider
  smartcardNumber: string
  packageCode: string
}

export interface ElectricityConfig extends UtilityConfigBase {
  utilityType: 'electricity'
  disco: string
  meterNumber: string
  meterType: MeterType
}

export type UtilityConfig =
  | AirtimeConfig
  | DataConfig
  | CableConfig
  | ElectricityConfig

/* ───────────── Requests / responses ───────────── */

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
  payoutDestination: PayoutDestination
  utilityConfig?: UtilityConfig
}

export interface CreateWalletResponse {
  walletId: number
  firstReleaseDate: string
  newMainBalance: number
}

export type WalletType = 'Scheduled' | 'Trustee' | 'Circle'

/* ───────────── Categories ───────────── */

export const getWalletCategories = async (
  walletType?: WalletType
): Promise<ApiResponse<WalletCategory[]>> => {
  try {
    const response = await authApi.get<ApiResponse<WalletCategory[]>>(
      '/wallets/categories',
      {
        params: walletType ? { walletType } : undefined,
      }
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message || 'Failed to load categories',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<WalletCategory[]>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load categories. Please try again.',
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

/* ───────────── Bank accounts ───────────── */

export const getBankAccounts = async (): Promise<
  ApiResponse<BankAccount[]>
> => {
  try {
    const response = await authApi.get<ApiResponse<BankAccount[]>>(
      '/bank-account'
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              response.data.message || 'Failed to load bank accounts',
          },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<BankAccount[]>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to load bank accounts. Please try again.',
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

/* ───────────── Create wallet ───────────── */

export const createWallet = async (
  payload: CreateWalletRequest
): Promise<ApiResponse<CreateWalletResponse>> => {
  try {
    const response = await authApi.post<ApiResponse<CreateWalletResponse>>(
      '/wallets/create',
      payload
    )

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
      const errorData = error.response.data as ApiResponse<CreateWalletResponse>

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