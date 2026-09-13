import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface ProfileData {
  firstName: string
  lastName: string
  otherName: string
  fullName: string
  email: string
  phone: string
  hasPinSet: boolean
}

export const getProfile = async (): Promise<ApiResponse<ProfileData>> => {
  try {
    const response = await authApi.get<ApiResponse<ProfileData>>(
      '/auth/profile'
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
      const errorData = error.response.data as ApiResponse<ProfileData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to load profile. Please try again.',
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


export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export const changePassword = async (
  payload: ChangePasswordRequest
): Promise<ApiResponse<null>> => {
  try {
    console.log(payload)
    const response = await authApi.post<ApiResponse<null>>(
      '/auth/change-password',
      payload
    )

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: response.data.message,
        },
      })
      window.dispatchEvent(errorEvent)
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<null>

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            errorData.message ||
            'Failed to change password. Please try again.',
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