import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface ResetPasswordRequest {
  userPublicId: string;
  newPassword: string;
}

export type ResetPasswordData = null;

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ApiResponse<ResetPasswordData>> => {
  try {
    const response = await authApi.post<ApiResponse<ResetPasswordData>>(
      '/auth/reset-password',
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
        message: response.data.message || 'Password reset successfully!',
      },
    });
    window.dispatchEvent(successEvent);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<ResetPasswordData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Password reset failed. Please try again.',
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