import axios, { AxiosError } from 'axios'
import { createClient } from '@/lib/supabase/client'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

export interface UnifiedPredictionResult {
  prediction: string
  confidence: number
  analysis?: string
  probabilities?: { benign: number; malignant: number }
  source: 'backend'
  processing_time: number
  heatmap?: string
  model_version?: string
  abstain?: boolean
  abstain_threshold?: number
  label?: string
}

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Unsupported file type. Please upload a JPEG, PNG, or WebP image.'
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is 10MB.`
  }
  if (file.size === 0) {
    return 'Uploaded file is empty.'
  }
  return null
}

async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  } catch {
    return null
  }
}

function formatApiError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ detail?: string | { code?: string; message?: string } }>
    const detail = ax.response?.data?.detail
    if (typeof detail === 'string') return new Error(detail)
    if (detail && typeof detail === 'object' && detail.message) {
      return new Error(detail.message)
    }
    if (ax.response?.status === 401) {
      return new Error('Backend rejected the request (unauthorized). Sign in again.')
    }
    if (ax.response?.status === 413) {
      return new Error('Image is too large for the inference server.')
    }
    if (ax.response?.status === 429) {
      return new Error('Too many analyses. Please wait a minute and try again.')
    }
    return new Error(ax.message || 'Inference request failed.')
  }
  if (err instanceof Error) return err
  return new Error('An unexpected error occurred.')
}

export const unifiedAPI = {
  /** CNN inference via FastAPI — sole prediction path. */
  async predictCancer(file: File): Promise<UnifiedPredictionResult> {
    const validationError = validateUploadFile(file)
    if (validationError) {
      throw new Error(validationError)
    }
    const startTime = Date.now()
    return this.predictWithBackend(file, startTime)
  },

  async predictWithBackend(file: File, startTime: number): Promise<UnifiedPredictionResult> {
    const formData = new FormData()
    formData.append('file', file)
    const token = await getAccessToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    headers['X-Request-Id'] =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `req-${Date.now()}`

    try {
      const response = await axios.post(`${BACKEND_URL}/predict-with-gradcam`, formData, {
        headers,
        timeout: 120_000,
      })
      return {
        ...response.data,
        source: 'backend',
        processing_time: Date.now() - startTime,
      }
    } catch (err) {
      throw formatApiError(err)
    }
  },

  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 })
      return response.data.status === 'healthy'
    } catch {
      return false
    }
  },
}
