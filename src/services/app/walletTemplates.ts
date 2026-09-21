import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

// ─── Types ────────────────────────────────────────────

export interface WalletTemplate {
  id: number
  name: string
  description: string
  categoryId: number
  categoryName: string
  categoryIcon: string
  defaultTargetAmount: number
  defaultReleaseAmount: number
  defaultFrequency: string
  defaultFrequencyConfig: string
  defaultPayoutDestination: string
  iconName: string
  tags: string[]
  sortOrder: number
  usageCount: number
}

export interface WalletTemplatesResponse {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  items: WalletTemplate[]
}

// ─── API ──────────────────────────────────────────────

export const getWalletTemplates = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  categoryId?: number
): Promise<ApiResponse<WalletTemplatesResponse>> => {
  try {
    const response = await authApi.get<ApiResponse<WalletTemplatesResponse>>(
      '/wallets/templates',
      {
        params: {
          page,
          pageSize,
          ...(search ? { search } : {}),
          ...(categoryId ? { categoryId } : {}),
        },
      }
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<WalletTemplatesResponse>
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