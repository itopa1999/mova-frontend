import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export type FeedbackExperience =
  | 'great'
  | 'good'
  | 'okay'
  | 'poor'
  | ''

export type FeedbackImprovement =
  | 'features'
  | 'design'
  | 'speed'
  | 'wallets'
  | 'support'
  | 'other'

export interface FeedbackRequest {
  rating: number
  experience: FeedbackExperience
  improvements: FeedbackImprovement[]
  message: string
}

export interface FeedbackData {
  acknowledgmentMessage: string
  notification: boolean
}

export const submitFeedback = async (
  payload: FeedbackRequest,
): Promise<ApiResponse<FeedbackData>> => {
  try {
    const response = await authApi.post<ApiResponse<FeedbackData>>(
      '/mova/feedback',
      payload,
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: response.data.message,
          },
        }),
      )
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<FeedbackData>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to send feedback. Please try again.',
          },
        }),
      )

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