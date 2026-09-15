import axios, { type AxiosInstance } from 'axios'


export interface ApiResponse<T> {
  request_id: string
  message: string
  is_success: boolean
  status_code: string
  timestamp: string
  data: T | null
}

export interface RefreshTokenResponse {
  userPublicId: string,
  email: string,
  phone: string,
  fullName: string,
  profilePicture: string,
  accessToken: string
  refreshToken: string
  platform: string
  accessTokenExpiresAt: string
}

export const authApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
})

// ─── Refresh state ────────────────────────────────────
let isRefreshing = false
let refreshSubscribers: Array<(success: boolean) => void> = []

const onRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((cb) => cb(success))
  refreshSubscribers = []
}

const addRefreshSubscriber = (cb: (success: boolean) => void) => {
  refreshSubscribers.push(cb)
}

const clearSession = () => {
  sessionStorage.removeItem('userData')
  sessionStorage.removeItem('isLoggedIn')
  localStorage.removeItem('userData')
  localStorage.removeItem('isLoggedIn')
}

const redirectToLogin = () => {
  const currentPath = window.location.pathname

  const authPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/verify-email',
    '/pin-setup',
  ]

  if (authPaths.includes(currentPath)) {
    return
  }

  window.location.replace('/login')
}

// ─── Refresh the access token cookie ──────────────────
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
      `${import.meta.env.VITE_AUTH_URL}/auth/refresh-token`,
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
      const userData = response.data.data;

    sessionStorage.setItem('userData', JSON.stringify({
        email: userData.email,
        phone: userData.phone,
        fullName: userData.fullName,
        platform: userData.platform,
        profilePicture: userData.profilePicture,
        accessTokenExpiresAt: userData.accessTokenExpiresAt,
      }));

    }

    return response.data.is_success === true
  } catch (err) {
    console.error('Refresh token failed:', err)
    return false
  }
}

// ─── Request interceptor ──────────────────────────────
authApi.interceptors.request.use(
  (config) => {
    console.log('Auth API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor ─────────────────────────────
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

    // ─── 401 → try refresh ────────────────────────────
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Never retry the refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        clearSession()
        redirectToLogin()
        return Promise.reject(error)
      }

      // If a refresh is already in progress, queue this request
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

        const sessionExpiredEvent = new CustomEvent('showToast', {
          detail: {
            type: 'error',
            message: 'Your session expired. Please log in again.',
          },
        })
        window.dispatchEvent(sessionExpiredEvent)

        redirectToLogin()
        return Promise.reject(error)
      }

      // Cookies are already updated by the backend — just retry the request
      return authApi(originalRequest)
    }

    // ─── 500 ──────────────────────────────────────────
    if (error.response?.status === 500) {
      const serverErrorEvent = new CustomEvent('serverError', {
        detail: {
          message: 'Something went wrong on our end. Please try again later.',
          supportNumber: '+234 800 000 0000',
        },
      })
      window.dispatchEvent(serverErrorEvent)
      return Promise.reject(error)
    }

    // ─── Network errors ───────────────────────────────
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const networkErrorEvent = new CustomEvent('networkError', {
        detail: {
          type: 'error',
          message: 'Network error. Please check your connection.',
        },
      })
      window.dispatchEvent(networkErrorEvent)
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)