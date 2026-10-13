import { authApi } from '../../types/api'
import { getOrCreateDeviceId } from '../../hooks/device'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

// ─── Request ─────────────────────────────────────────

export interface LoginRequest {
  emailOrPhone: string
  password: string
  platform: string
}

// ─── Success payload ─────────────────────────────────

export interface LoginData {
  userPublicId: string
  email: string
  phone: string
  fullName: string
  platform: string
  profilePicture: string
  balance: number
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
}

// ─── Blocked payload ─────────────────────────────────

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

// ─── Backend envelope ─────────────────────────────────
// Server returns: { ...envelope, data: { data: LoginData | null, blocked: LoginBlockedData | null } }

interface LoginResultPayload {
  data: LoginData | null
  blocked: LoginBlockedData | null
}

// ─── Normalized result the page consumes ─────────────

export interface LoginResult {
  success: boolean
  statusCode: number
  message: string
  login?: LoginData
  blocked?: LoginBlockedData
}

// ─── Service ─────────────────────────────────────────

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

    // ── Success ──
    if (envelope.is_success && body?.data) {
      const user = body.data

      sessionStorage.setItem(
        'userData',
        JSON.stringify({
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          platform: user.platform,
          profilePicture: user.profilePicture,
          balance: user.balance,
          accessTokenExpiresAt: user.accessTokenExpiresAt,
        }),
      )

      return {
        success: true,
        statusCode: response.status,
        message: envelope.message || 'Login successful.',
        login: user,
      }
    }

    // ── Blocked (200 body with blocked payload is not expected,
    //          but the FE should still handle it defensively) ──
    if (body?.blocked) {
      return {
        success: false,
        statusCode: response.status,
        message: envelope.message || 'Login blocked.',
        blocked: body.blocked,
      }
    }

    // ── Generic failure on 200 with is_success: false ──
    return {
      success: false,
      statusCode: response.status,
      message: envelope.message || 'Login failed. Please try again.',
    }
  } catch (error) {
    // ── HTTP error (4xx / 5xx) ──
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

    // ── Network error ──
    return {
      success: false,
      statusCode: 0,
      message: 'Network error. Please check your connection.',
    }
  }
}