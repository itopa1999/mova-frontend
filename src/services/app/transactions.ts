import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export type TransactionType =
  | 'Deposit'
  | 'Release'
  | 'Fee'
  | 'Withdrawal'
  | 'Payout'
  | 'BillPayment'
  | 'Reversal'

export type TransactionStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Reversed'

export type PaymentProvider = 'Paystack' | 'Monnify' | 'Flutterwave'

export interface TransactionItem {
  id: number
  title: string | null
  amount: number
  type: string
  status: string
  provider: string | null
  reference: string | null
  failureReason: string | null
  walletId: number | null
  completedAt: string | null
  createdAt: string
}

export interface PaginatedTransactions {
  items: TransactionItem[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface TransactionsFilter {
  page?: number
  pageSize?: number
  type?: TransactionType
  status?: TransactionStatus
  walletId?: number
  provider?: PaymentProvider
  fromDate?: string
  toDate?: string
  search?: string
}

export const getTransactions = async (
  filter: TransactionsFilter = {}
): Promise<ApiResponse<PaginatedTransactions>> => {
  try {
    const params: Record<string, string | number> = {}

    if (filter.page) params.page = filter.page
    if (filter.pageSize) params.pageSize = filter.pageSize
    if (filter.type) params.type = filter.type
    if (filter.status) params.status = filter.status
    if (filter.walletId) params.walletId = filter.walletId
    if (filter.provider) params.provider = filter.provider
    if (filter.fromDate) params.fromDate = filter.fromDate
    if (filter.toDate) params.toDate = filter.toDate
    if (filter.search) params.search = filter.search

    const response = await authApi.get<ApiResponse<PaginatedTransactions>>(
      '/bank-account/transactions',
      { params }
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
      const errorData = error.response.data as ApiResponse<PaginatedTransactions>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message || 'Failed to load transactions. Please try again.',
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