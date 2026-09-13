import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export interface NotificationItem {
  id: number
  type: string
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

export const getNotifications = async (
  unreadOnly = false
): Promise<ApiResponse<NotificationItem[]>> => {
  try {
    const response = await authApi.get<ApiResponse<NotificationItem[]>>(
      `/mova/get-notifications?unreadOnly=${unreadOnly}`
    )

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: response.data.message,
        },
      })
      window.dispatchEvent(errorEvent)
      return response.data
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<NotificationItem[]>

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message:
            errorData.message ||
            'Failed to load notifications. Please try again.',
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

export const markNotificationAsRead = async (
  id: number
): Promise<ApiResponse<null>> => {
  try {
    const response = await authApi.patch<ApiResponse<null>>(
      `/mova/${id}/read-notification`
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
            'Failed to mark notification as read.',
        },
      })
      window.dispatchEvent(errorEvent)

      return errorData
    }

    return {
      request_id: '',
      message: 'Network error.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

export const markAllNotificationsAsRead = async (): Promise<
  ApiResponse<null>
> => {
  try {
    const response = await authApi.patch<ApiResponse<null>>(
      '/mova/read-all-notifications'
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
            'Failed to mark all notifications as read.',
        },
      })
      window.dispatchEvent(errorEvent)

      return errorData
    }

    return {
      request_id: '',
      message: 'Network error.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}