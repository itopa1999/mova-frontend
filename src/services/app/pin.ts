import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface VerifyPinRequest {
  pin: string;
  platform?: string;
}

export type VerifyPinData = null;

export const verifyPin = async (data: VerifyPinRequest): Promise<ApiResponse<VerifyPinData>> => {
  try {
    const response = await authApi.post<ApiResponse<VerifyPinData>>(
      '/security/pin/verify',
      {
        pin: data.pin,
        platform: data.platform || 'web',
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
      const errorData = error.response.data as ApiResponse<VerifyPinData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'PIN verification failed. Please try again.',
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


export interface HasPinSetResponse {
    hasPinSet: boolean
}

export async function hasPinSetUp(): Promise<ApiResponse<HasPinSetResponse>> {
  const response = await authApi.get<ApiResponse<HasPinSetResponse>>('/security/pin/has-pin-setup')
  return response.data
}




export interface PinSetupRequest {
  pin: string;
  platform: string;
}

export type PinSetupData = null;

export const setupPinGate = async (data: PinSetupRequest): Promise<ApiResponse<PinSetupData>> => {
  try {
    const response = await authApi.post<ApiResponse<PinSetupData>>(
      '/security/pin/set',
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
        message: response.data.message || 'PIN set successfully!',
      },
    });
    window.dispatchEvent(successEvent);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<PinSetupData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'PIN setup failed. Please try again.',
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


export interface ChangePinRequest {
  currentPin: string
  newPin: string
  platform: string
}

export type ChangePinResponse = null;


export async function changePin(
  payload: ChangePinRequest,
): Promise<ApiResponse<ChangePinResponse>> {
  try {
    const response = await authApi.put<ApiResponse<ChangePinResponse>>(
    '/security/pin/change',
    payload,
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
        message: response.data.message || 'PIN changed successfully!',
      },
    });
    window.dispatchEvent(successEvent);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<PinSetupData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'PIN setup failed. Please try again.',
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

