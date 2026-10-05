import { AxiosError } from 'axios'
import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'

interface WithdrawalRequestBase {
  walletId: number
  amount: number
}

export interface BankWithdrawalRequest extends WithdrawalRequestBase {
  type: 'bank'
  bankAccountId: number
}

interface UtilityWithdrawalRequestBase extends WithdrawalRequestBase {
  type: 'utilities'
}

export type UtilityWithdrawalRequest =
  | (UtilityWithdrawalRequestBase & {
      utilityType: 'airtime'
      network: string
      phoneNumber: string
    })
  | (UtilityWithdrawalRequestBase & {
      utilityType: 'data'
      network: string
      phoneNumber: string
      planCode: string
    })
  | (UtilityWithdrawalRequestBase & {
      utilityType: 'cable'
      cableProvider: string
      smartcardNumber: string
      packageCode: string
    })
  | (UtilityWithdrawalRequestBase & {
      utilityType: 'electricity'
      disco: string
      meterNumber: string
      meterType: 'prepaid' | 'postpaid'
    })

export type WithdrawalRequest =
  | BankWithdrawalRequest
  | UtilityWithdrawalRequest

export interface WithdrawalResult {
  reference?: string
  status?: string
}

export const createWithdrawal = async (
  payload: WithdrawalRequest
): Promise<ApiResponse<WithdrawalResult>> => {
  try {
    const response = await authApi.post<ApiResponse<WithdrawalResult>>(
      '/bank-account/withdrawal',
      payload
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<WithdrawalResult>
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
