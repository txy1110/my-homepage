import { defineStore } from 'pinia'
import { readStoredState, writeStoredState } from './persistence.js'

const storageKey = 'personal-home-user'

export const useUserStore = defineStore('user', {
  // 初始化时恢复浏览器登录态，供路由守卫和导航栏共同使用。
  state: () => readStoredState(storageKey, { isLoggedIn: false, username: '' }, (value) =>
    value && typeof value.isLoggedIn === 'boolean' && typeof value.username === 'string'
  ),
  getters: {
    isAdmin: (state) => state.isLoggedIn
  },
  actions: {
    login(username, password) {
      // 这是教学演示登录，不校验服务端凭据；真实项目应替换为后端认证。
      if (!username.trim() || !password) throw new Error('请输入用户名和密码。')
      this.isLoggedIn = true
      this.username = username.trim()
      writeStoredState(storageKey, { isLoggedIn: this.isLoggedIn, username: this.username })
    },
    logout() {
      this.isLoggedIn = false
      this.username = ''
      writeStoredState(storageKey, { isLoggedIn: this.isLoggedIn, username: this.username })
    }
  }
})
