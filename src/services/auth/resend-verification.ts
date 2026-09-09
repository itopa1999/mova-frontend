import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface ResendVerificationRequest {
  email: string;
  platform: string;
  purpose: string;
}

export interface ResendVerificationData {
  message: string;
  expiresIn: number;
}

export const resendVerificationCode = async (data: ResendVerificationRequest): Promise<ApiResponse<ResendVerificationData>> => {
  try {
    const response = await authApi.post<ApiResponse<ResendVerificationData>>(
      '/auth/resend-verification-token',
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
        message: 'Verification code sent successfully!',
      },
    });
    window.dispatchEvent(successEvent);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<ResendVerificationData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to resend code. Please try again.',
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