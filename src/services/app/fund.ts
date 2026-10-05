import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface DepositTransaction {
  id: number
  title: string
  amount: number
  type: 'deposit' | 'withdrawal'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed'
  reference: string
  failureReason?: string | null
  completedAt: string
  createdAt: string
}

export const getDepositHistory = async (): Promise<ApiResponse<DepositTransaction[]>> => {
  try {
    const response = await authApi.get<ApiResponse<DepositTransaction[]>>(
      '/bank-account/deposits'
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
      const errorData = error.response.data as ApiResponse<DepositTransaction[]>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load deposit history. Please try again.',
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

export interface AvailableWithdrawalWallet {
  walletId: number;
  walletName: string;
  availableAmount: number;
}

export interface AvailableWithdrawalBalance {
  totalAvailableAmount: number;
  wallets: AvailableWithdrawalWallet[];
}

export const getAvailableWithdrawalBalance = async (): Promise<
  ApiResponse<AvailableWithdrawalBalance>
> => {
  try {
    const response = await authApi.get<ApiResponse<AvailableWithdrawalBalance>>(
      '/bank-account/withdrawal/available-balance'
    );

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: response.data.message,
        },
      });
      window.dispatchEvent(errorEvent);
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<AvailableWithdrawalBalance>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            errorData.message ||
            'Failed to load available withdrawal balance. Please try again.',
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

export interface FundAccountRequest {
  amount: number;
  provider: 'Paystack' | 'Monnify' | 'Flutterwave';
}

export interface FundAccountResponse {
  authorizationUrl: string;
}

export const fundAccount = async (
  payload: FundAccountRequest
): Promise<ApiResponse<FundAccountResponse>> => {
  try {
    const response = await authApi.post<ApiResponse<FundAccountResponse>>(
      '/bank-account/fund-account',
      payload
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
      const errorData = error.response.data as ApiResponse<FundAccountResponse>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to initialize payment. Please try again.',
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

export const retryDeposit = async (
  transactionId: number
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.post<ApiResponse<null>>(
      `/bank-account/retry/${transactionId}/deposit`
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
      const errorData = error.response.data as ApiResponse<null>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to check transaction status. Please try again.',
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

export interface AccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  gateway: string;
}

export interface FundingMethod {
  accountDetails: AccountDetails | null;
  allowedGateways: string[];
  isDepositAllowed: boolean;
}

export const getFundingMethod = async (): Promise<ApiResponse<FundingMethod>> => {
  try {
    const response = await authApi.get<ApiResponse<FundingMethod>>(
      '/bank-account/funding-method'
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
      const errorData = error.response.data as ApiResponse<FundingMethod>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load funding method. Please try again.',
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