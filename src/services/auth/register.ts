import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  password: string;
}

export interface RegisterData {
  userPublicId: string;
  email: string;
  phone: string;
  fullName: string;
  data: string;
  nextStep: string;
}

export const registerUser = async (
  data: RegisterRequest,
  navigate: (path: string) => void
): Promise<ApiResponse<RegisterData>> => {
  try {
    const response = await authApi.post<ApiResponse<RegisterData>>(
      '/auth/register',
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

    sessionStorage.setItem('registrationData', JSON.stringify({
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      phone: response.data.data?.phone,
      userPublicId: response.data.data?.userPublicId,
    }));

    const successEvent = new CustomEvent('showToast', {
      detail: {
        type: 'success',
        message: 'Registration successful! Please verify your email.',
      },
    });
    window.dispatchEvent(successEvent);

    setTimeout(() => {
      navigate('/verify-email');
    }, 3000);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<RegisterData>;
      
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Registration failed. Please try again.',
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