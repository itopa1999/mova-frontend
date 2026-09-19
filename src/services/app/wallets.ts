import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface WalletItem {
  walletId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  targetAmount: number;
  lockedAmount: number;
  progressPercentage: number;
  status: string;
  frequency: string;
  scheduleDescription: string;
  nextRelease: string;
}

export interface WalletsData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: WalletItem[];
  totalControlledAmount: number;
  activeWalletCount: number;
}

export const getWallets = async (
  page: number = 0, // 0-based from frontend
  pageSize: number = 10,
  search: string = ''
): Promise<ApiResponse<WalletsData>> => {
  try {
    // Convert from 0-based to 1-based for API
    const apiPage = page + 1;
    
    const response = await authApi.get<ApiResponse<WalletsData>>(
      '/wallets',
      {
        params: {
          page: apiPage, // API expects 1-based page
          pageSize: pageSize,
          search: search || undefined,
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
      const errorData = error.response.data as ApiResponse<WalletsData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load wallets. Please try again.',
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