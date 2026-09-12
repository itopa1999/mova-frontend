import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface VerifyResetTokenRequest {
  userPublicId: string;
  token: string;
}

export interface VerifyResetTokenData {
  userPublicId: string;
  isVerified: boolean;
}

export const verifyResetToken = async (
  data: VerifyResetTokenRequest
): Promise<ApiResponse<VerifyResetTokenData>> => {
  try {
    const response = await authApi.post<ApiResponse<VerifyResetTokenData>>(
      '/auth/verify-forgot-password',
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

    const successEvent = new CustomEvent('showToast', {
      detail: {
        type: 'success',
        message: response.data.message || 'Token verified successfully!',
      },
    });
    window.dispatchEvent(successEvent);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<VerifyResetTokenData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Verification failed. Please try again.',
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