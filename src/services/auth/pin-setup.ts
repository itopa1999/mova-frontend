import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export interface PinSetupRequest {
  pin: string
  platform: string
}

export type PinSetupData = null

export const setupPin = async (
  data: PinSetupRequest,
  navigate?: (path: string, options?: { replace?: boolean }) => void
): Promise<ApiResponse<PinSetupData>> => {
  try {
    const response = await authApi.post<ApiResponse<PinSetupData>>(
      '/security/pin/set',
      data
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message,
          },
        })
      )
      return response.data
    }

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: response.data.message || 'PIN set successfully!',
        },
      })
    )

    if (navigate) {
      navigate('/dashboard', { replace: true })
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<PinSetupData>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: errorData.message || 'PIN setup failed. Please try again.',
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