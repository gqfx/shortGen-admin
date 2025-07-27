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

// 响应拦截器 - 自动解包 ApiResponse
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // console.log('✅ API Response:', {
    //   status: response.status,
    //   url: response.config.url,
    //   data: response.data,
    // })
    
    // 返回解包后的数据，这样组件中就不需要 .data.data 了
    return response.data as ApiResponse<any>
  },
  (error) => {
    // console.error('❌ Response Error:', {
    //   status: error.response?.status,
    //   url: error.config?.url,
    //   message: error.message,
    //   data: error.response?.data,
    // })
    return Promise.reject(error)
  }
)

// 统一的 API 客户端
export const apiClient = {
  // GET 请求
  get: <T>(url: string, params?: Record<string, any>): Promise<T> => {
    return axiosInstance.get(url, { params }).then(response => response.data)
  },

  // POST 请求
  post: <T>(url: string, data?: any): Promise<T> => {
    return axiosInstance.post(url, data).then(response => response.data)
  },

  // PUT 请求
  put: <T>(url: string, data?: any): Promise<T> => {
    return axiosInstance.put(url, data).then(response => response.data)
  },

  // PATCH 请求
  patch: <T>(url: string, data?: any): Promise<T> => {
    return axiosInstance.patch(url, data).then(response => response.data)
  },

  // DELETE 请求
  delete: <T>(url: string, data?: any): Promise<T> => {
    return axiosInstance.delete(url, { data }).then(response => response.data)
  },
}

export default apiClient