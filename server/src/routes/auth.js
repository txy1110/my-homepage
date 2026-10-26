import { Router } from 'express'
import { createAdminSession, getAdminSession, revokeAdminSession } from '../auth.js'
import { requestBody, requiredString, sendData } from '../validation.js'

const router = Router()

// 从 Authorization 请求头提取 Bearer 令牌；缺失或格式错误时返回空值。
function bearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.get('authorization') || '')
  return match?.[1] || ''
}

// 验证登录字段并签发短期服务端会话。
router.post('/login', (request, response) => {
  const body = requestBody(request.body)
  const username = requiredString(body, 'username', 80)
  const password = requiredString(body, 'password', 256)
  return sendData(response, createAdminSession(username, password))
})

// 供前端刷新页面时恢复登录状态；无效或过期令牌返回 401。
router.get('/me', (request, response, next) => {
  const session = getAdminSession(bearerToken(request))
  if (!session) {
    return response.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Admin session has expired.' }
    })
  }
  return sendData(response, { username: session.username })
})

// 注销接口可重复调用，令牌不存在时也保持幂等成功。
router.post('/logout', (request, response) => {
  revokeAdminSession(bearerToken(request))
  return sendData(response, { loggedOut: true })
})

export default router
