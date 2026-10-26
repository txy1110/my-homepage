import { randomBytes, timingSafeEqual } from 'node:crypto'
import { ApiError } from './errors.js'

const sessions = new Map()
const sessionLifetimeMs = 8 * 60 * 60 * 1000

// 先比较字节长度再使用常量时间比较，避免凭据校验泄露匹配位置。
function secureEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

// 校验环境配置和管理员凭据后创建随机短期会话，同时清理过期会话。
export function createAdminSession(username, password) {
  if (!process.env.ADMIN_API_TOKEN) {
    throw new ApiError(503, 'AUTH_NOT_CONFIGURED', 'Admin login is not configured on this server.')
  }

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin'
  if (!secureEqual(username, expectedUsername) || !secureEqual(password, process.env.ADMIN_API_TOKEN)) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password.')
  }

  const now = Date.now()
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(token)
  }

  const token = randomBytes(32).toString('hex')
  sessions.set(token, { username, expiresAt: now + sessionLifetimeMs })
  return { token, expiresIn: Math.floor(sessionLifetimeMs / 1000), username }
}

// 查询会话时同步清除已过期条目，避免过期令牌继续获得访问权限。
export function getAdminSession(token) {
  const session = sessions.get(token)
  if (!session) return null
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token)
    return null
  }
  return session
}

// 注销通过删除令牌立即撤销对应的服务端会话。
export function revokeAdminSession(token) {
  sessions.delete(token)
}

// 保护后台路由：解析 Bearer 令牌并将有效会话挂到请求对象。
export function requireAdminToken(request, _response, next) {
  const authorization = request.get('authorization') || ''
  const match = /^Bearer\s+(.+)$/i.exec(authorization)
  const session = match ? getAdminSession(match[1]) : null
  if (!session) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'A valid admin session is required.'))
  }
  request.admin = session
  next()
}
