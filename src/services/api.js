import axios from 'axios'

const tokenStorageKey = 'personal-home-admin-session'

export class ApiError extends Error {
  // 保留 HTTP 状态与服务端错误码，供页面按错误类型展示或处理。
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const http = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, ''),
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
})

// 只有显式标记为管理请求时才附带短期会话令牌。
http.interceptors.request.use((config) => {
  if (config.requiresAuth) {
    const token = getAuthToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  // 将成功信封解包，让 Store 直接接收 data；非标准成功响应视为协议错误。
  (response) => {
    if (response.data?.success !== true) {
      throw new ApiError('API returned an invalid response envelope.', response.status, 'INVALID_RESPONSE')
    }
    return response.data.data
  },
  // 统一转换服务端与网络错误，保持调用方获得一致的 ApiError。
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      return Promise.reject(new ApiError(
        data?.error?.message || `API request failed (HTTP ${status}).`,
        status,
        data?.error?.code || 'API_ERROR'
      ))
    }

    const message = error.code === 'ECONNABORTED'
      ? 'API request timed out.'
      : `Unable to connect to the API service: ${error.message || 'network error'}`
    return Promise.reject(new ApiError(message, 0, error.code || 'NETWORK_ERROR'))
  }
)

export function getAuthToken() {
  // 管理令牌只在当前标签页会话中保留，不写入长期 localStorage。
  return sessionStorage.getItem(tokenStorageKey) || ''
}

export function setAuthToken(token) {
  // 空令牌代表主动清除当前标签页的管理员会话。
  if (token) sessionStorage.setItem(tokenStorageKey, token)
  else sessionStorage.removeItem(tokenStorageKey)
}

export async function apiRequest(path, { method = 'GET', body, authenticated = false } = {}) {
  // Store 通过该入口统一发送 REST 请求，并可按需启用 Bearer 认证。
  const response = await http.request({
    url: path,
    method,
    data: body,
    requiresAuth: authenticated
  })
  return response
}
