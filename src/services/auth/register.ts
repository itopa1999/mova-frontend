import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export interface RegisterRequest {
  firstname: string
  lastname: string
  email: string
  phonenumber: string
  bvn: string
  password: string
}

export interface RegisterData {
  userPublicId: string
  email: string
  phone: string
  fullName: string
  data: string
  nextStep: string
}

export interface RegistrationHandoff {
  firstName: string
  lastName: string
  email: string
  phone: string
  userPublicId: string
}

export const registerUser = async (
  data: RegisterRequest,
  navigate: (path: string, options?: { state?: unknown; replace?: boolean }) => void
): Promise<ApiResponse<RegisterData>> => {
  try {
    const response = await authApi.post<ApiResponse<RegisterData>>(
      '/auth/register',
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

    const payload = response.data.data

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Registration successful! Please verify your email.',
        },
      })
    )

    if (payload) {
      const handoff: RegistrationHandoff = {
        firstName: data.firstname,
        lastName: data.lastname,
        email: payload.email || data.email,
        phone: payload.phone || data.phonenumber,
        userPublicId: payload.userPublicId,
      }

      navigate('/verify-email', { state: handoff })
    }

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<RegisterData>

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: errorData.message || 'Registration failed. Please try again.',
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