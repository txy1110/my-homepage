export class ApiError extends Error {
  // 附加 HTTP 状态和稳定错误码，供统一中间件生成客户端可识别的错误信封。
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// 将业务错误、常见 MySQL 错误和未知异常转换为统一 JSON 格式。
export function errorHandler(error, _request, response, _next) {
  if (error instanceof ApiError) {
    return response.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message }
    })
  }

  if (error?.type === 'entity.parse.failed') {
    return response.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Request body must contain valid JSON.' }
    })
  }

  if (error?.code === 'ER_DUP_ENTRY') {
    return response.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_RESOURCE', message: 'A resource with this identifier already exists.' }
    })
  }

  if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
    return response.status(400).json({
      success: false,
      error: { code: 'INVALID_REFERENCE', message: 'A referenced profile or project does not exist.' }
    })
  }

  if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
    return response.status(409).json({
      success: false,
      error: { code: 'RESOURCE_IN_USE', message: 'The resource is still referenced by another record.' }
    })
  }

  if (error?.code === 'ER_DATA_TOO_LONG' ||
      error?.code === 'ER_DATA_OUT_OF_RANGE' ||
      error?.code === 'ER_TRUNCATED_WRONG_VALUE') {
    return response.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'One or more values are invalid or exceed the database field limits.' }
    })
  }

  console.error('API request failed:', error)
  return response.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected server error occurred.' }
  })
}
