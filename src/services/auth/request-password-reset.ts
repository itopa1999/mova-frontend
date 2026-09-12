import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetData {
  userPublicId: string;
  data: string;
}

export const requestPasswordReset = async (
  data: RequestPasswordResetRequest
): Promise<ApiResponse<RequestPasswordResetData>> => {
  try {
    console.log(data)
    const response = await authApi.post<ApiResponse<RequestPasswordResetData>>(
      '/auth/forgot-password',
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
        message: response.data.message || 'Password reset code sent successfully!',
      },
    });
    window.dispatchEvent(successEvent);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<RequestPasswordResetData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to send reset code. Please try again.',
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