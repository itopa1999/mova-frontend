import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface WalletDetailData {
  walletId: number
  name: string
  description: string
  status: string
  categoryId: number
  categoryName: string
  categoryIcon: string
  targetAmount: number
  lockedAmount: number
  releasedAmount: number
  totalWithdrawnAmount: number
  availableAmount: number
  unusedAmount: number
  progressPercentage: number
  setAmountToBeRemoved: number
  frequency: string
  scheduleDescription: string
  startDate: string
  endDate: string
  releaseSummary: {
    totalReleases: number
    completedReleases: number
    scheduledReleases: number
    failedReleases: number
    projectedReleases: number
    totalReleasedAmount: number
    averageReleaseAmount: number
    remainingAmount: number
    allReleases: number
    remainingReleases: number
  }
  nextReleaseDate: string
  nextReleaseDisplay: string
  lastReleaseDate: string
  lastReleaseDisplay: string
  projectedEndDate: string
  projectedEndDateDisplay: string
  schedulePreview: Array<{
    scheduledReleaseId: number
    scheduledFor: string
    scheduledForDisplay: string
    amount: number
    status: string
    isReleased: boolean
    isProjected: boolean
    releasedAt: string
    releasedAtDisplay: string
  }>
  createdAt: string
  updatedAt: string
}

export interface ActivityItem {
  id: number
  type: string
  title: string
  subtitle: string
  amount: number
  isCredit: boolean
  date: string
}

export interface ActivityGroup {
  date: string
  activities: ActivityItem[]
}

export interface ScheduleData {
  walletId: number
  targetAmount: number
  totalReleasedAmount: number
  remainingLockedAmount: number
  releases: Array<{
    scheduledReleaseId: number
    scheduled_for: string
    amount: number
    is_released: boolean
    released_at: string
    status: string
    is_projected: boolean
  }>
}

export const getWalletDetails = async (walletId: number): Promise<ApiResponse<WalletDetailData>> => {
  try {
    const response = await authApi.get<ApiResponse<WalletDetailData>>(
      `/wallets/${walletId}/details`
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
      const errorData = error.response.data as ApiResponse<WalletDetailData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load wallet details. Please try again.',
        },
      });
      window.dispatchEvent(errorEvent);

      return errorData;
    }

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

export const getWalletActivities = async (walletId: number): Promise<ApiResponse<ActivityGroup[]>> => {
  try {
    const response = await authApi.get<ApiResponse<ActivityGroup[]>>(
      `/wallets/${walletId}/activities`
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
      const errorData = error.response.data as ApiResponse<ActivityGroup[]>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load activities. Please try again.',
        },
      });
      window.dispatchEvent(errorEvent);

      return errorData;
    }

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

export const getWalletSchedule = async (walletId: number): Promise<ApiResponse<ScheduleData>> => {
  try {
    const response = await authApi.get<ApiResponse<ScheduleData>>(
      `/wallets/${walletId}/schedule-preview`
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
      const errorData = error.response.data as ApiResponse<ScheduleData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load schedule. Please try again.',
        },
      });
      window.dispatchEvent(errorEvent);

      return errorData;
    }

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


export interface BankAccountData {
  id: number
  accountName: string
  accountNumber: string
  bankName: string
  bankImageUrl: string
}

export const getWalletBankAccount = async (walletId: number): Promise<ApiResponse<BankAccountData>> => {
  try {
    const response = await authApi.get<ApiResponse<BankAccountData>>(
      `/wallets/${walletId}/bank-account`
    )

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: response.data.message,
        },
      })
      window.dispatchEvent(errorEvent)
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<BankAccountData>

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load bank account. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)

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


export interface AvailableBank {
  id: number,
  accountNumber: string
  accountName: string
  bankName: string
  bankImageUrl: string
}

export const getAvailableBanks = async (): Promise<ApiResponse<AvailableBank[]>> => {
  try {
    const response = await authApi.get<ApiResponse<AvailableBank[]>>(
      '/bank-account'
    )

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: response.data.message,
        },
      })
      window.dispatchEvent(errorEvent)
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<AvailableBank[]>

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load banks. Please try again.',
        },
      })
      window.dispatchEvent(errorEvent)

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



export const linkBankToWallet = async (walletId: number, bankAccountId: number): Promise<ApiResponse<BankAccountData>> => {
  try {
    console.log('linkBankToWallet called with:', { walletId, bankAccountId })
    const response = await authApi.post<ApiResponse<BankAccountData>>(
      `/bank-account/${walletId}/bank-account`,
      {
        bankAccountId: bankAccountId,
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
      const errorData = error.response.data as ApiResponse<BankAccountData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to link bank account. Please try again.',
        },
      });
      window.dispatchEvent(errorEvent);

      return errorData;
    }

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