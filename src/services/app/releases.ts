import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface ReleaseItem {
  scheduledReleaseId: number | null
  walletId: number
  walletName: string
  categoryIcon: string
  amount: number
  status: string
  scheduledFor: string
  releasedAt: string | null
  isProjected: boolean
}

export interface ReleasesData {
  todayReleased: ReleaseItem[]
  scheduled: ReleaseItem[]
  upcoming: ReleaseItem[]
}

export const getReleases = async (
  upcomingLimit = 10
): Promise<ApiResponse<ReleasesData>> => {
  try {
    const response = await authApi.get<ApiResponse<ReleasesData>>(
      `/wallets/releases?upcomingLimit=${upcomingLimit}`
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data as ApiResponse<ReleasesData>
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