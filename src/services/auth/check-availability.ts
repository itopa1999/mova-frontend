import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export interface CheckAvailabilityRequest {
  email?: string
  phonenumber?: string
}

export interface CheckAvailabilityData {
  emailAvailable: boolean
  phoneAvailable: boolean
  canProceed: boolean
  message: string
  nextStep: string
}

export const checkRegistrationAvailability = async (
  payload: CheckAvailabilityRequest
): Promise<ApiResponse<CheckAvailabilityData>> => {
  try {
    const response = await authApi.post<ApiResponse<CheckAvailabilityData>>(
      '/auth/check-availability',
      payload
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: response.data.message },
        })
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<CheckAvailabilityData>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to check availability. Please try again.',
          },
        })
      )

      return errorData
    }

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Network error. Please check your connection.',
        },
      })
    )

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