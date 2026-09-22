import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export type NotificationKey =
  | 'login'
  | 'release'
  | 'updates'
  | 'promotions'

export interface NotificationPreferences {
  login: boolean
  release: boolean
  updates: boolean
  promotions: boolean
}

export interface ProfileData {
  firstName: string
  lastName: string
  otherName: string
  fullName: string
  email: string
  phone: string
  profilePicture: string | null
  balance: number
  hasPinSet: boolean
  notifications: NotificationPreferences
}

export const getProfile = async (): Promise<ApiResponse<ProfileData>> => {
  try {
    const response = await authApi.get<ApiResponse<ProfileData>>(
      '/auth/profile'
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

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<ProfileData>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message || 'Failed to load profile. Please try again.',
          },
        })
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

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export const changePassword = async (
  payload: ChangePasswordRequest
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.post<ApiResponse<null>>(
      '/auth/change-password',
      payload
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
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<null>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to change password. Please try again.',
          },
        })
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
export const updateNotificationPreference = async (
  key: NotificationKey,
  enabled: boolean
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.put<ApiResponse<null>>(
      '/auth/notification-preferences',
      { key, enabled }
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

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<null>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message:
              errorData.message ||
              'Failed to update preference. Please try again.',
          },
        })
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