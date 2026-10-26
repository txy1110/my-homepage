import mysql from 'mysql2/promise'

const requiredConfig = ['DB_HOST', 'DB_USER', 'DB_NAME']
const missingConfig = requiredConfig.filter((key) => !process.env[key])

// 配置不完整时在应用启动阶段失败，避免使用隐式默认值连接错误数据库。
if (missingConfig.length) {
  throw new Error(`Missing database configuration: ${missingConfig.join(', ')}`)
}

// 使用连接池复用 MySQL 连接，并统一处理 UTF-8、日期及大整数字段。
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  dateStrings: true,
  supportBigNumbers: true,
  bigNumberStrings: true
})

export default pool
