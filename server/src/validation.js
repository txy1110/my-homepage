import { ApiError } from './errors.js'

// 必填短字符串可统一裁剪首尾空白，并限制数据库字段对应的字符长度。
export function requiredString(body, field, maxLength, { trim = true } = {}) {
  const value = body[field]
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required and must be a non-empty string.`)
  }
  const result = trim ? value.trim() : value
  if (result.length > maxLength) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must not exceed ${maxLength} characters.`)
  }
  return result
}

// 长文本使用 UTF-8 字节长度校验，避免多字节字符突破数据库列容量。
export function requiredText(body, field, maxBytes) {
  const value = body[field]
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} is required and must be non-empty text.`)
  }
  if (Buffer.byteLength(value, 'utf8') > maxBytes) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must not exceed ${maxBytes} UTF-8 bytes.`)
  }
  return value
}

// 可选字符串在缺失时使用默认值，但显式传入的类型和长度仍需校验。
export function optionalString(body, field, maxLength, defaultValue = '') {
  const value = body[field]
  if (value === undefined) return defaultValue
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a string of at most ${maxLength} characters.`)
  }
  return value
}

// 数据库自增主键以十进制正整数的字符串形式传递，拒绝零和非数字值。
export function requiredId(value, field = 'id') {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a positive integer.`)
  }
  return value
}

// 所有写入接口只接受 JSON 对象，避免数组或空值进入字段校验流程。
export function requestBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.')
  }
  return body
}

// 先检查日期格式，再往返校验日历日期，拒绝诸如 2 月 30 日的无效值。
export function requiredDate(body, field) {
  const value = requiredString(body, field, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must use YYYY-MM-DD format.`)
  }
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a valid calendar date.`)
  }
  return value
}

// 布尔字段不进行字符串或数字转换，避免客户端类型错误被静默接受。
export function requiredBoolean(body, field) {
  if (typeof body[field] !== 'boolean') {
    throw new ApiError(400, 'VALIDATION_ERROR', `${field} must be a boolean.`)
  }
  return body[field]
}

// 所有成功接口都通过此方法返回统一的 JSON 信封和 HTTP 状态码。
export function sendData(response, data, status = 200) {
  return response.status(status).json({ success: true, data })
}

// 查询结果为空时以资源类型构造统一的 404 API 错误。
export function notFound(resource) {
  throw new ApiError(404, 'RESOURCE_NOT_FOUND', `${resource} not found.`)
}
