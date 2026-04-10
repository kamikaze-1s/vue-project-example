import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// 1. Định nghĩa interface cho Metadata (để đo thời gian)
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number
  }
  _retry?: boolean // Dùng cho logic refresh token
}

// Giả lập hàm refresh token (Bạn sẽ thay bằng logic thật sau)
const refreshYourToken = async (): Promise<string> => {
  return 'new-access-token'
}

const USE_MOCK_DATA = true

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
  (config: CustomInternalAxiosRequestConfig) => {
    // Gắn Token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Logic cho môi trường DEV (Log & Timing)
    if (import.meta.env.DEV) {
      config.metadata = { startTime: Date.now() }
      console.log(`🚀 [API CALL] ${config.method?.toUpperCase()} -> ${config.url}`)
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      const config = response.config as CustomInternalAxiosRequestConfig
      if (config.metadata) {
        const duration = Date.now() - config.metadata.startTime
        console.log(`✅ [API DONE] ${config.url} mất ${duration}ms`)
      }
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newToken = await refreshYourToken()
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
