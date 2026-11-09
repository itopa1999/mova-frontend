import { authApi } from '../../types/api'
import type { ApiResponse } from '../../types/api'
import { AxiosError } from 'axios'

export type LegalDocumentType = 'Agreement' | 'Privacy' | 'Terms'

export interface LegalDocument {
  type: number
  typeName: string
  version: string
  title: string
  content: string
  publishedAt: string
}

export interface CurrentLegalDocumentsResponse {
  documents: LegalDocument[]
}

export interface AcceptConsentData {
  isOnboarding: boolean
  notification: boolean
  currentStage: string
  currentStageValue: number
  nextStage: string
}

const handleError = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError && error.response) {
    const errorData = error.response.data as ApiResponse<unknown>
    const message = errorData.message || fallback

    window.dispatchEvent(
      new CustomEvent('showToast', {
        detail: { type: 'error', message },
      }),
    )

    return {
      isSuccess: false as const,
      statusCode: error.response.status,
      message,
    }
  }

  const message = 'Network error. Please check your connection.'
  window.dispatchEvent(
    new CustomEvent('showToast', {
      detail: { type: 'error', message },
    }),
  )

  return {
    isSuccess: false as const,
    statusCode: 0,
    message,
  }
}

export const getCurrentLegalDocument = async (
  type: LegalDocumentType,
): Promise<ApiResponse<CurrentLegalDocumentsResponse>> => {
  try {
    const response = await authApi.get<
      ApiResponse<CurrentLegalDocumentsResponse>
    >('/legal/current', {
      params: { type },
    })

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: response.data.message },
        }),
      )
    }

    return response.data
  } catch (error) {
    const result = handleError(error, 'Could not load the document.')

    return {
      request_id: '',
      message: result.message,
      is_success: false,
      status_code: String(result.statusCode),
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}

export const acceptLegalDocument = async (
  type: LegalDocumentType,
  documentVersion: string,
): Promise<ApiResponse<AcceptConsentData>> => {
  try {
    const response = await authApi.post<ApiResponse<AcceptConsentData>>(
      `/legal/accept/${type.toLowerCase()}`,
      { documentVersion },
    )

    if (!response.data.is_success) {
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { type: 'error', message: response.data.message },
        }),
      )
    }

    return response.data
  } catch (error) {
    const result = handleError(error, 'Could not accept the document.')

    return {
      request_id: '',
      message: result.message,
      is_success: false,
      status_code: String(result.statusCode),
      timestamp: new Date().toISOString(),
      data: null,
    }
  }
}