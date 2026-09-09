import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface Bank {
  name: string
  slug: string
  code: string
  ussd: string
  logo: string
}

export interface BankSearchResponse {
  banks: Bank[]
}

export interface VerifyAccountRequest {
  accountNumber: string
  bankCode: string
}

export interface VerifyAccountResponse {
  accountNumber: string
  accountName: string
  bankInstitution: string
  bankCode: string
}

export interface SaveBankRequest {
  accountNumber: string
  bankCode: string
  consent: boolean
}

export interface SaveBankResponse {
  id: number
  accountNumber: string
  accountName: string
  bankCode: string
  bankInstitution: string
  isDefault: boolean
  status: string
}

export interface SavedBank {
  id: number
  accountNumber: string
  accountName: string
  bankCode: string
  bankInstitution: string
  isDefault: boolean
  status: string
}

export const searchBanks = async (query: string): Promise<ApiResponse<BankSearchResponse>> => {
  try {
    const response = await authApi.get<ApiResponse<BankSearchResponse>>(
      '/bank-account/banks',
      {
        params: {
          name: query,
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
      const errorData = error.response.data as ApiResponse<BankSearchResponse>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to search banks. Please try again.',
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

export const verifyBankAccount = async (data: VerifyAccountRequest): Promise<ApiResponse<VerifyAccountResponse>> => {
  try {
    const response = await authApi.post<ApiResponse<VerifyAccountResponse>>(
      '/bank-account/banks/verify',
      data
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
      const errorData = error.response.data as ApiResponse<VerifyAccountResponse>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Account verification failed. Please try again.',
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

export const saveBankAccount = async (data: SaveBankRequest): Promise<ApiResponse<SaveBankResponse>> => {
  try {
    const response = await authApi.post<ApiResponse<SaveBankResponse>>(
      '/bank-account',
      data
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
      const errorData = error.response.data as ApiResponse<SaveBankResponse>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to save bank account. Please try again.',
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

export const getBankAccounts = async (): Promise<ApiResponse<SavedBank[]>> => {
  try {
    const response = await authApi.get<ApiResponse<SavedBank[]>>(
      '/bank-account'
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
      const errorData = error.response.data as ApiResponse<SavedBank[]>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load bank accounts. Please try again.',
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

export const deleteBankAccount = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.delete<ApiResponse<null>>(
      `/bank-account/${id}`
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
          message: errorData.message || 'Failed to delete bank account. Please try again.',
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