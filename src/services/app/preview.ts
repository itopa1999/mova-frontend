// src/services/app/preview.ts

import { authApi } from '../../types/api';
import type { ApiResponse } from '../../types/api';
import { AxiosError } from 'axios';

export interface ReleaseDate {
  date: string;
  amount: number;
  releaseNumber: number;
  cumulativeAmount: number;
}

export interface PreviewData {
  isValid: boolean;
  description: string;
  targetAmount: number;
  releaseAmount: number;
  regularReleaseAmount: number;
  finalReleaseAmount: number;
  totalReleases: number;
  totalAmount: number;
  firstReleaseDate: string;
  computedEndDate: string;
  weeksToReachTarget: number;
  monthsToReachTarget: number;
  frequencyType: string;
  sampleReleaseDates: ReleaseDate[];
  errors: string[];
  warnings: string[];
}

export interface PreviewRequest {
  targetAmount: number;
  releaseAmount: number;
  frequencyType: string;
  frequencyConfig: string;
  startDate: string;
  maxReleases: number;
}

export const getSchedulePreview = async (
  payload: PreviewRequest
): Promise<ApiResponse<PreviewData>> => {
  try {
    const response = await authApi.post<ApiResponse<PreviewData>>(
      '/wallets/preview',
      payload
    );

    if (!response.data.is_success) {
      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: response.data.message || 'Failed to generate schedule preview',
        },
      });
      window.dispatchEvent(errorEvent);
      return response.data;
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const errorData = error.response.data as ApiResponse<PreviewData>;

      const errorEvent = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: errorData.message || 'Failed to generate schedule preview. Please try again.',
        },
      });
      window.dispatchEvent(errorEvent);

      return errorData;
    }

    // Network error or other error
    const errorEvent = new CustomEvent('showToast', {
      detail: {
        type: 'error',
        message: 'Network error. Please check your connection.',
      },
    });
    window.dispatchEvent(errorEvent);

    return {
      request_id: '',
      message: 'Network error. Please check your connection.',
      is_success: false,
      status_code: 'networkError',
      timestamp: new Date().toISOString(),
      data: null,
    };
  }
};