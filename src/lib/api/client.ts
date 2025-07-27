import axios, { AxiosResponse } from 'axios'
import { ApiResponse } from './types'

const API_BASE_URL = import.meta.env.DEV ? '' : 'http://localhost:8000'

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // console.log('🚀 API Request:', {
    //   method: config.method?.toUpperCase(),
    //   url: config.url,
    //   baseURL: config.baseURL,
    //   fullURL: `${config.baseURL}${config.url}`,
    //   data: config.data,
    // })
    return config
  },
  (error) => {
    // console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // 直接返回响应，让调用方处理
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 统一的 API 客户端
export const apiClient = {
  // GET 请求
  get: <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    return axiosInstance.get(url, { params }).then(response => response.data)
  },

  // POST 请求
  post: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    return axiosInstance.post(url, data).then(response => response.data)
  },

  // PUT 请求
  put: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    return axiosInstance.put(url, data).then(response => response.data)
  },

  // PATCH 请求
  patch: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    return axiosInstance.patch(url, data).then(response => response.data)
  },

  // DELETE 请求
  delete: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    return axiosInstance.delete(url, { data }).then(response => response.data)
  },
}

export default apiClient