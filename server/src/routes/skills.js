import { Router } from 'express'
import pool from '../db.js'
import { requireAdminToken } from '../auth.js'
import { ApiError } from '../errors.js'
import { notFound, requiredId, requiredString, sendData } from '../validation.js'

const router = Router()

// 校验技能归属、名称和排序值，确保排序值可安全写入无符号整数字段。
function skillFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.')
  }
  const sortOrder = body.sortOrder === undefined ? 0 : body.sortOrder
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0 || sortOrder > 4294967295) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'sortOrder must be an integer from 0 to 4294967295.')
  }
  return {
    profileId: requiredId(String(body.profileId || ''), 'profileId'),
    name: requiredString(body, 'name', 80),
    sortOrder
  }
}

// 列表接口可按 profileId 过滤；未指定时返回全部技能。
router.get('/', async (request, response) => {
  const profileId = request.query.profileId === undefined
    ? null
    : requiredId(String(request.query.profileId), 'profileId')
  const [skills] = profileId
    ? await pool.execute(
      'SELECT id, profile_id AS profileId, name, sort_order AS sortOrder FROM skills WHERE profile_id = ? ORDER BY sort_order, id',
      [profileId]
    )
    : await pool.execute(
      'SELECT id, profile_id AS profileId, name, sort_order AS sortOrder FROM skills ORDER BY profile_id, sort_order, id'
    )
  return sendData(response, skills)
})

// 通过主键读取单条技能，不存在时返回统一的 404 错误。
router.get('/:id', async (request, response) => {
  const id = requiredId(request.params.id)
  const [skills] = await pool.execute(
    'SELECT id, profile_id AS profileId, name, sort_order AS sortOrder FROM skills WHERE id = ? LIMIT 1',
    [id]
  )
  if (!skills.length) notFound('Skill')
  return sendData(response, skills[0])
})

// 新建技能后查询数据库生成的主键，并以 201 返回完整记录。
router.post('/', requireAdminToken, async (request, response) => {
  const skill = skillFields(request.body)
  const [result] = await pool.execute(
    'INSERT INTO skills (profile_id, name, sort_order) VALUES (?, ?, ?)',
    [skill.profileId, skill.name, skill.sortOrder]
  )
  const [rows] = await pool.execute(
    'SELECT id, profile_id AS profileId, name, sort_order AS sortOrder FROM skills WHERE id = ?',
    [String(result.insertId)]
  )
  return sendData(response, rows[0], 201)
})

// 修改技能后读取最新记录；若主键不存在则返回资源未找到错误。
router.put('/:id', requireAdminToken, async (request, response) => {
  const id = requiredId(request.params.id)
  const skill = skillFields(request.body)
  await pool.execute(
    'UPDATE skills SET profile_id = ?, name = ?, sort_order = ? WHERE id = ?',
    [skill.profileId, skill.name, skill.sortOrder, id]
  )
  const [rows] = await pool.execute(
    'SELECT id, profile_id AS profileId, name, sort_order AS sortOrder FROM skills WHERE id = ?',
    [id]
  )
  if (!rows.length) notFound('Skill')
  return sendData(response, rows[0])
})

// 只有数据库确认删除记录后才返回成功，否则报告资源不存在。
router.delete('/:id', requireAdminToken, async (request, response) => {
  const id = requiredId(request.params.id)
  const [result] = await pool.execute('DELETE FROM skills WHERE id = ?', [id])
  if (!result.affectedRows) notFound('Skill')
  return sendData(response, { id })
})

export default router
