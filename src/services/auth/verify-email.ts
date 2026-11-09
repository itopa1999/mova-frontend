import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export interface VerifyEmailRequest {
  email: string
  otpCode: string
  platform: string
}

export interface VerifyEmailData {
  userPublicId: string
  isAccountVerified: boolean
  email: string
  phone: string
  fullName: string
  platform: string
  profilePicture: string | null
  balance: number
  nextStep: string
  currentStage: string
  currentStageValue: number
  nextStage: string
}

export const verifyEmail = async (
  data: VerifyEmailRequest,
): Promise<ApiResponse<VerifyEmailData>> => {
  try {
    const response = await authApi.post<ApiResponse<VerifyEmailData>>(
      '/auth/verify-account',
      data,
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: response.data.message },
        }),
      )
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<VerifyEmailData>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message || 'Verification failed. Please try again.',
          },
        }),
      )
      return errorData
    }

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { type: 'error', message: 'Network error. Please check your connection.' },
      }),
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