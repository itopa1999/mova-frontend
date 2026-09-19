import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';
import { UseUserBalance } from '../../hooks/useUserBalance'

export interface Balance {
  userBalance: number;
  totalAvailableAmount: number;
  totalLockedAmount: number;
}

export interface TodayRelease {
  walletName: string;
  releasedAmount: number;
  releasedAt: string;
}

export interface WalletItem {
  id: number;
  walletName: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  targetAmount: number;
}

export interface lockedAmountHistory {
  label: string;
  value: number;
}

export interface DashboardData {
  balance: Balance;
  todayReleased: TodayRelease[];
  wallets: WalletItem[];
  lockedAmountHistory: lockedAmountHistory[];

}

export const getDashboard = async (): Promise<ApiResponse<DashboardData>> => {
  try {
    const response = await authApi.get<ApiResponse<DashboardData>>(
      '/mova/home'
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

    if (response.data.data?.balance?.userBalance !== undefined) {
      const { updateBalance } = UseUserBalance()
      updateBalance(response.data.data.balance.userBalance)
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<DashboardData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load dashboard. Please try again.',
        },
      });
      window.dispatchEvent(errorEvent);

      return errorData;
    }

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