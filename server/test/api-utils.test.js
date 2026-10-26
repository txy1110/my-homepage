import assert from 'node:assert/strict'
import test from 'node:test'
import { createAdminSession, getAdminSession, requireAdminToken } from '../src/auth.js'
import { ApiError, errorHandler } from '../src/errors.js'
import {
  requestBody,
  requiredBoolean,
  requiredDate,
  requiredId,
  requiredString,
  requiredText
} from '../src/validation.js'

test('validates request bodies, IDs, strings, dates, and booleans', () => {
  assert.equal(requestBody({ title: 'Example' }).title, 'Example')
  assert.throws(() => requestBody([]), { status: 400, code: 'VALIDATION_ERROR' })
  assert.equal(requiredId('42', 'profileId'), '42')
  assert.throws(() => requiredId('0'), { status: 400, code: 'VALIDATION_ERROR' })
  assert.equal(requiredString({ title: '  Example  ' }, 'title', 20), 'Example')
  assert.equal(requiredDate({ date: '2024-02-29' }, 'date'), '2024-02-29')
  assert.throws(() => requiredDate({ date: '2025-02-29' }, 'date'), { status: 400 })
  assert.equal(requiredBoolean({ published: false }, 'published'), false)
  assert.throws(() => requiredBoolean({ published: 'false' }, 'published'), { status: 400 })
})

test('checks text limits using UTF-8 byte length', () => {
  assert.equal(requiredText({ content: '正文' }, 'content', 6), '正文')
  assert.throws(() => requiredText({ content: '正文' }, 'content', 5), {
    status: 400,
    code: 'VALIDATION_ERROR'
  })
})

test('issues short-lived sessions only for the configured admin credentials', () => {
  const previousToken = process.env.ADMIN_API_TOKEN
  const previousUsername = process.env.ADMIN_USERNAME
  process.env.ADMIN_API_TOKEN = 'test-administrator-token'
  process.env.ADMIN_USERNAME = 'test-admin'

  const session = createAdminSession('test-admin', 'test-administrator-token')
  assert.equal(session.username, 'test-admin')
  assert.equal(getAdminSession(session.token).username, 'test-admin')

  assert.throws(() => createAdminSession('test-admin', 'wrong-token'), {
    status: 401,
    code: 'INVALID_CREDENTIALS'
  })
  assert.throws(() => createAdminSession('wrong-user', 'test-administrator-token'), {
    status: 401,
    code: 'INVALID_CREDENTIALS'
  })

  let passedError
  requireAdminToken({ get: () => `Bearer ${session.token}` }, {}, (error) => {
    passedError = error
  })
  assert.equal(passedError, undefined)

  requireAdminToken({ get: () => 'Bearer invalid-session' }, {}, (error) => {
    passedError = error
  })
  assert.equal(passedError.status, 401)

  if (previousToken === undefined) delete process.env.ADMIN_API_TOKEN
  else process.env.ADMIN_API_TOKEN = previousToken
  if (previousUsername === undefined) delete process.env.ADMIN_USERNAME
  else process.env.ADMIN_USERNAME = previousUsername
})

test('refuses admin login when the server secret is missing', () => {
  const previousToken = process.env.ADMIN_API_TOKEN
  delete process.env.ADMIN_API_TOKEN
  assert.throws(() => createAdminSession('admin', 'some-password'), {
    status: 503,
    code: 'AUTH_NOT_CONFIGURED'
  })
  if (previousToken !== undefined) process.env.ADMIN_API_TOKEN = previousToken
})

test('protects admin routes against missing credentials', () => {
  let passedError
  requireAdminToken({ get: () => '' }, {}, (error) => {
    passedError = error
  })
  assert.equal(passedError.status, 401)
})

test('returns a stable JSON error envelope', () => {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    }
  }

  errorHandler(new ApiError(404, 'RESOURCE_NOT_FOUND', 'Project not found.'), {}, response, () => {})
  assert.equal(response.statusCode, 404)
  assert.deepEqual(response.body, {
    success: false,
    error: { code: 'RESOURCE_NOT_FOUND', message: 'Project not found.' }
  })
})
