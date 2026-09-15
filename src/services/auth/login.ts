import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
  platform: string;
}

export interface LoginData {
  userPublicId: string;
  email: string,
  phone: string,
  fullName: string;
  platform: string;
  profilePicture: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

export const loginUser = async (
  data: LoginRequest,
  navigate: (path: string) => void
): Promise<ApiResponse<LoginData>> => {
  try {
    const response = await authApi.post<ApiResponse<LoginData>>(
      '/auth/login',
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

    if (response.data.data) {
      const userData = response.data.data;
      sessionStorage.setItem('userData', JSON.stringify({
        email: userData.email,
        phone: userData.phone,
        fullName: userData.fullName,
        platform: userData.platform,
        profilePicture: userData.profilePicture,
        accessTokenExpiresAt: userData.accessTokenExpiresAt,
      }));
            
      const successEvent = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Login successful!',
        },
      });
      window.dispatchEvent(successEvent);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<LoginData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Login failed. Please try again.',
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