// src/services/auth/verify-email.ts

import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'
import { stepToRoute } from './registration-steps'

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
  profilePicture: string
  balance: number
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  nextStep: string
}

export const verifyEmail = async (
  data: VerifyEmailRequest,
  navigate?: (path: string, options?: { replace?: boolean }) => void
): Promise<ApiResponse<VerifyEmailData>> => {
  try {
    const response = await authApi.post<ApiResponse<VerifyEmailData>>(
      '/auth/verify-account',
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

    if (payload) {
      if (import.meta.env.DEV) {
        console.log('[verifyEmail] nextStep from BE:', payload.nextStep)
        console.log(
          '[verifyEmail] stepToRoute keys:',
          Object.keys(stepToRoute)
        )
      }

      sessionStorage.setItem(
        'userData',
        JSON.stringify({
          userPublicId: payload.userPublicId,
          email: payload.email,
          phone: payload.phone,
          fullName: payload.fullName,
          platform: payload.platform,
          profilePicture: payload.profilePicture,
          balance: payload.balance,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          accessTokenExpiresAt: payload.accessTokenExpiresAt,
        })
      )

      sessionStorage.removeItem('registrationData')

      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: {
            type: 'success',
            message: 'Email verified successfully!',
          },
        })
      )

      if (navigate) {
        const route = stepToRoute[payload.nextStep]

        if (import.meta.env.DEV) {
          console.log('[verifyEmail] resolved route:', route)
        }

        if (!route) {
          if (import.meta.env.DEV) {
            console.warn(
              `[verifyEmail] No route mapped for nextStep: "${payload.nextStep}". ` +
                `Falling back to /pin-setup.`
            )
          }

          navigate('/pin-setup', { replace: true })
        } else {
          navigate(route, { replace: true })
        }
      }
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