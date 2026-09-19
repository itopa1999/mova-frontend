import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
  platform: string;
}

export interface VerifyEmailData {
  userPublicId: string;
  isAccountVerified: boolean;
  email: string,
  phone: string,
  fullName: string;
  platform: string;
  profilePicture: string;
  balance : number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

export const verifyEmail = async (data: VerifyEmailRequest): Promise<ApiResponse<VerifyEmailData>> => {
  try {
    console.log(data)
    const response = await authApi.post<ApiResponse<VerifyEmailData>>(
      '/auth/verify-account',
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
        balance: userData.balance,
        accessTokenExpiresAt: userData.accessTokenExpiresAt,
      }));
    }

    const successEvent = new CustomEvent('showToast', {
      detail: {
        type: 'success',
        message: 'Email verified successfully!',
      },
    });
    window.dispatchEvent(successEvent);
    
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<VerifyEmailData>;

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