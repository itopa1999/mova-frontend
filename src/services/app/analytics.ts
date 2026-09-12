import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface AnalyticsData {
  month: string;
  moneyProtected: number;
  moneyReleased: number;
  moneySpent: number;
  remaining: number;
  protectedPercentage: number;
}

export const getAnalytics = async (
  year: number,
  month: number
): Promise<ApiResponse<AnalyticsData>> => {
  try {
    // Format date for request: YYYY-MM-01
    const dateString = `${year}-${String(month).padStart(2, '0')}-01`
    
    const response = await authApi.get<ApiResponse<AnalyticsData>>(
      '/wallets/analytics',
      {
        params: {
          date: dateString,
        },
      }
    );

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: response.data.message,
        },
      });
      window.dispatchEvent(errorEvent);
      return response.data;
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<AnalyticsData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load analytics. Please try again.',
        },
      });
      window.dispatchEvent(errorEvent);

      return errorData;
    }

    // Network error or other error
    const errorEvent = new CustomEvent('showToast', {
      detail: {
        type: 'error',
        message: 'Network error. Please check your connection.',
      },
    });
    window.dispatchEvent(errorEvent);

    return {
      request_id: '',
      message: 'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    };
  }
};