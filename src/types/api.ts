import axios, { type AxiosInstance } from 'axios';

export interface ApiResponse<T> {
  request_id: string;
  message: string;
  is_success: boolean;
  status_code: string;
  timestamp: string;
  data: T | null;
}

const X_KEY_ID = '1';

export const authApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Key-Id': X_KEY_ID,
  },
  withCredentials: true,
  timeout: 30000,
});

authApi.interceptors.request.use(
  (config) => {
    console.log('Auth API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 500 Internal Server Error - Show modal
    if (error.response?.status === 500) {
      const serverErrorEvent = new CustomEvent('serverError', {
        detail: {
          message: 'Something went wrong on our end. Please try again later.',
          supportNumber: '+234 800 000 0000',
        },
      });
      window.dispatchEvent(serverErrorEvent);
      return Promise.reject(error);
    }

    // Network Error (no response from server)
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const networkErrorEvent = new CustomEvent('networkError', {
        detail: {
          type: 'error',
          message: 'Network error. Please check your connection.',
        },
      });
      window.dispatchEvent(networkErrorEvent);
      return Promise.reject(error);
    }

    // For other errors (400, 401, 403, etc.), just pass through
    return Promise.reject(error);
  }
);