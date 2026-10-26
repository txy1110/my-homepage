import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pool from './db.js'
import { ApiError, errorHandler } from './errors.js'
import articlesRouter from './routes/articles.js'
import authRouter from './routes/auth.js'
import exportRouter from './routes/export.js'
import profileRouter from './routes/profile.js'
import projectsRouter from './routes/projects.js'
import skillsRouter from './routes/skills.js'

const app = express()
const port = Number(process.env.PORT || 3000)
// 转换成绝对路径，避免从不同工作目录启动服务时找不到生成的文档。
// apidoc 输出位于仓库根目录的 docs/apidoc。
const apiDocPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/apidoc')
// 允许通过逗号配置多个前端来源；不带 Origin 的服务端请求也可正常访问。
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// 浏览器跨域只开放配置的前端来源，避免 API 被任意网站调用。
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin))
  }
}))
// 限制 JSON 请求体大小，避免过大的请求占用过多服务器内存。
app.use(express.json({ limit: '100kb' }))
app.get('/api/health', async (_request, response) => {
  // 健康检查会实际查询 MySQL，数据库不可用时由统一错误处理中间件返回错误。
  await pool.query('SELECT 1')
  response.json({ success: true, data: { status: 'ok' } })
})
// 文档静态页面公开只读；管理数据接口仍由独立路由校验会话。
app.use('/docs/api', express.static(apiDocPath))
// 按资源挂载路由，各路由内部负责请求校验和相应的管理员权限控制。
app.use('/api/auth', authRouter)
app.use('/api/export', exportRouter)
app.use('/api/profile', profileRouter)
app.use('/api/skills', skillsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/articles', articlesRouter)
// 未匹配的 API 请求也走统一错误结构，避免返回 Express 默认 HTML 错误页。
app.use('/api', (_request, _response, next) => {
  next(new ApiError(404, 'API_ROUTE_NOT_FOUND', 'API route not found.'))
})
// 将路由抛出的验证、数据库及运行时错误统一转换为 JSON 响应。
app.use(errorHandler)

// 启动 HTTP 监听；数据库连接会在下方单独验证，失败时关闭此监听。
const server = app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})

async function shutdown(signal) {
  console.log(`${signal} received; closing API server`)
  // 先停止接收新请求并等待现有请求完成，再释放数据库连接池。
  server.close(async (error) => {
    if (error) {
      console.error('Failed to close API server:', error)
      process.exitCode = 1
    }

    try {
      await pool.end()
    } catch (poolError) {
      console.error('Failed to close database pool:', poolError)
      process.exitCode = 1
    }
  })
}

// 支持终端中断和操作系统终止信号，统一执行优雅关闭。
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

try {
  // 服务启动后立即验证数据库连接，避免 API 在数据库不可用时报告启动成功。
  await pool.query('SELECT 1')
  console.log('MySQL connection ready')
} catch (error) {
  console.error('Unable to connect to MySQL:', error)
  // 数据库不可用时停止 HTTP 服务，防止进程处于无法正常工作的状态。
  await new Promise((resolve) => server.close(resolve))
  await pool.end()
  process.exitCode = 1
}
