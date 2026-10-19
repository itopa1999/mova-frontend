import axios, { type AxiosInstance } from 'axios'
import { showErrorToast } from '../utils/notifications'

export interface ApiResponse<T> {
  request_id: string
  message: string
  is_success: boolean
  status_code: string
  timestamp: string
  data: T | null
}

export interface RefreshTokenResponse {
  userPublicId: string
  email: string
  phone: string
  fullName: string
  profilePicture: string
  balance: number
  accessToken: string
  refreshToken: string
  platform: string
  accessTokenExpiresAt: string
}

const authApiBaseUrl = import.meta.env.VITE_AUTH_URL?.trim()
if (!authApiBaseUrl) {
  throw new Error(
    'VITE_AUTH_URL is not configured. Set it in .env and restart the Vite dev server.'
  )
}

try {
  new URL(authApiBaseUrl)
} catch {
  throw new Error('VITE_AUTH_URL must be an absolute backend URL.')
}

export const authApi: AxiosInstance = axios.create({
  baseURL: authApiBaseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
})

const AUTH_ENDPOINTS_SKIP_REFRESH = [
  'auth/refresh-token',
  'auth/logout',
  'auth/login',
  'auth/register',
  'security/pin/verify',
  'security/pin/change'
]

let isRefreshing = false
let refreshSubscribers: Array<(success: boolean) => void> = []
let isRedirecting = false

const onRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((cb) => cb(success))
  refreshSubscribers = []
}

const addRefreshSubscriber = (cb: (success: boolean) => void) => {
  refreshSubscribers.push(cb)
}

const clearSession = () => {
  localStorage.removeItem('userData')
  sessionStorage.removeItem('userData')
}

const redirectToLogin = () => {
  if (isRedirecting) return

  const currentPath = window.location.pathname

  const authPaths = [
    '/welcome',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/auth/pin-setup',
    '/error/403',
    '/error/423',
  ]

  if (authPaths.includes(currentPath)) {
    return
  }

  isRedirecting = true
  window.location.replace('/welcome')
}

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
      `${authApiBaseUrl}/auth/refresh-token`,
      { platform: 'web' },
      {
        withCredentials: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.is_success && response.data.data) {
      const userData = response.data.data

      sessionStorage.setItem(
        'userData',
        JSON.stringify({
          email: userData.email,
          phone: userData.phone,
          fullName: userData.fullName,
          platform: userData.platform,
          profilePicture: userData.profilePicture,
          balance: userData.balance,
          accessTokenExpiresAt: userData.accessTokenExpiresAt,
        })
      )
    }

    return response.data.is_success === true
  } catch {
    return false
  }
}

authApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

authApi.interceptors.response.use(
  (response) => {
    const payload = response.data as
      | { data?: { notification?: boolean } | null }
      | undefined

    if (payload?.data?.notification === true) {
      window.dispatchEvent(new CustomEvent('notificationReceived'))
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined

    const requestUrl = originalRequest?.url ?? ''
    const isAuthEndpoint = AUTH_ENDPOINTS_SKIP_REFRESH.some((p) =>
      requestUrl.includes(p)
    )

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isAuthEndpoint) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((success) => {
            if (!success) {
              reject(error)
              return
            }
            resolve(authApi(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshed = await refreshAccessToken()

      isRefreshing = false
      onRefreshed(refreshed)

      if (!refreshed) {
        clearSession()
        showErrorToast('Your session expired. Please log in again.')
        throw new Error("Test error page");
        redirectToLogin()
        return Promise.reject(error)
      }

      return authApi(originalRequest)
    }

    if (error.response?.status === 403) {
      const serverMessage: string | undefined = error.response.data?.message
      const forbiddenMessage =
        serverMessage && serverMessage.trim().length > 0
          ? serverMessage
          : "You don't have permission to perform this action."

      const isLoginOrRegister =
        requestUrl.includes('auth/login') ||
        requestUrl.includes('auth/register')

      if (isLoginOrRegister) {
        return Promise.reject(error)
      }

      const currentPath = window.location.pathname
      if (currentPath !== '/error/403' && !isRedirecting) {
        sessionStorage.setItem('forbiddenMessage', forbiddenMessage)
        sessionStorage.setItem('forbiddenFrom', currentPath)
        isRedirecting = true
        window.location.replace('/error/403')
      }

      return Promise.reject(error)
    }

    if (error.response?.status === 423) {
      const serverMessage: string | undefined = error.response.data?.message
      const lockedMessage =
        serverMessage && serverMessage.trim().length > 0
          ? serverMessage
          : 'Your account is currently restricted from performing this action.'

      const isLoginOrRegister =
        requestUrl.includes('auth/login') ||
        requestUrl.includes('auth/register')

      if (isLoginOrRegister) {
        return Promise.reject(error)
      }

      const currentPath = window.location.pathname
      if (currentPath !== '/error/423' && !isRedirecting) {
        sessionStorage.setItem('lockedMessage', lockedMessage)
        sessionStorage.setItem('lockedFrom', currentPath)
        isRedirecting = true
        window.location.replace('/error/423')
      }

      return Promise.reject(error)
    }

    if (error.response?.status === 429) {
      const retryAfterSeconds: number =
        parseRetryAfterSeconds(error.response.data?.retry_after_seconds) ??
        parseRetryAfterSeconds(error.response.headers['retry-after']) ??
        60

      const serverMessage: string =
        error.response.data?.message ?? 'Too many requests. Please slow down.'

      window.dispatchEvent(
        new CustomEvent('rateLimitExceeded', {
          detail: {
            message: serverMessage,
            retryAfterSeconds,
            retryAfterText: formatRetryAfter(retryAfterSeconds),
          },
        })
      )

      return Promise.reject(error)
    }

    if (error.response?.status === 500) {
      window.dispatchEvent(
        new CustomEvent('serverError', {
          detail: {
            message: 'Something went wrong on our end. Please try again later.',
            supportNumber: '+234 800 000 0000',
          },
        })
      )
      return Promise.reject(error)
    }

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      window.dispatchEvent(
        new CustomEvent('networkError', {
          detail: {
            type: 'error',
            message: 'Network error. Please check your connection.',
          },
        })
      )
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

function parseRetryAfterSeconds(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function formatRetryAfter(seconds: number): string {
  if (seconds <= 0) return 'a moment'
  if (seconds < 60) {
    return seconds === 1 ? '1 second' : `${seconds} seconds`
  }
  const minutes = Math.ceil(seconds / 60)
  return minutes === 1 ? '1 minute' : `${minutes} minutes`
}