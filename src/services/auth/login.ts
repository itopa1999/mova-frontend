import { authApi } from '../../types/api'
import { getOrCreateDeviceId } from '../../hooks/device'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'
import { setAuthUser } from '../../hooks/auth-session'

export interface LoginRequest {
  emailOrPhone: string
  password: string
  platform: string
}

export interface LoginData {
  userPublicId: string
  email: string
  phone: string
  fullName: string
  platform: string
  profilePicture: string | null
  balance: number
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: string
  isOnboardingComplete: boolean
  onboardingStage: string
  onboardingStageValue: number
  nextStage: string
}

export interface LoginBlockedData {
  userPublicId: string
  accountStatus: string
  statusLabel: string
  statusDescription: string
  restrictionReason: string | null
  restrictionReasonDetails: string | null
  restrictionExpiresAt: string | null
  lockoutEndsAt: string | null
}

interface LoginResultPayload {
  data: LoginData | null
  blocked: LoginBlockedData | null
}

export interface LoginResult {
  success: boolean
  statusCode: number
  message: string
  login?: LoginData
  blocked?: LoginBlockedData
}

export const loginUser = async (
  data: LoginRequest,
): Promise<LoginResult> => {
  try {
    const payload = {
      ...data,
      deviceId: getOrCreateDeviceId(),
    }

    const response = await authApi.post<ApiResponse<LoginResultPayload>>(
      '/auth/login',
      payload,
    )

    const envelope = response.data
    const body = envelope.data

    if (envelope.is_success && body?.data) {
      const user = body.data

      // Save user data including the onboarding stage
      setAuthUser({
        userPublicId: user.userPublicId,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        platform: user.platform,
        profilePicture: user.profilePicture ?? null,
        balance: user.balance,
        onboardingStage: user.onboardingStageValue,
      })

      return {
        success: true,
        statusCode: response.status,
        message: envelope.message || 'Login successful.',
        login: user,
      }
    }

    if (body?.blocked) {
      return {
        success: false,
        statusCode: response.status,
        message: envelope.message || 'Login blocked.',
        blocked: body.blocked,
      }
    }

    return {
      success: false,
      statusCode: response.status,
      message: envelope.message || 'Login failed. Please try again.',
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as
        | ApiResponse<LoginResultPayload>
        | undefined

      return {
        success: false,
        statusCode: error.response.status,
        message: errorData?.message || 'Login failed. Please try again.',
        blocked: errorData?.data?.blocked ?? undefined,
      }
    }

    return {
      success: false,
      statusCode: 0,
      message: 'Network error. Please check your connection.',
    }
  }
}