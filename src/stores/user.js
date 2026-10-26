import { defineStore } from 'pinia'
import { apiRequest, getAuthToken, setAuthToken } from '../services/api.js'

export const useUserStore = defineStore('user', {
  state: () => ({ isLoggedIn: false, username: '' }),
  getters: {
    isAdmin: (state) => state.isLoggedIn
  },
  actions: {
    // 页面刷新后向服务器确认现存会话，401 表示会话过期，其余错误继续上抛。
    async restoreSession() {
      if (!getAuthToken()) return false
      try {
        const session = await apiRequest('/auth/me', { authenticated: true })
        this.isLoggedIn = true
        this.username = session.username
        return true
      } catch (error) {
        setAuthToken('')
        this.isLoggedIn = false
        this.username = ''
        if (error.status === 401) return false
        throw error
      }
    },
    // 登录凭据仅提交给后端校验，前端只保存后端签发的短期会话令牌。
    async login(username, password) {
      const session = await apiRequest('/auth/login', {
        method: 'POST',
        body: { username: username.trim(), password }
      })
      setAuthToken(session.token)
      this.isLoggedIn = true
      this.username = session.username
    },
    // 无论服务端注销是否成功，都清除本地令牌和管理员状态。
    async logout() {
      try {
        await apiRequest('/auth/logout', { method: 'POST', authenticated: true })
      } finally {
        setAuthToken('')
        this.isLoggedIn = false
        this.username = ''
      }
    }
  }
})
