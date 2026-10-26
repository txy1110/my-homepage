import { Router } from 'express'
import pool from '../db.js'
import { requireAdminToken } from '../auth.js'
import { ApiError } from '../errors.js'
import { notFound, requiredId, requiredString, sendData } from '../validation.js'

const router = Router()
const projectStatuses = new Set(['进行中', '已完成', '规划中'])

// 统一验证项目字段，限制可用状态和项目 ID 字符集。
function projectFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.')
  }
  const status = requiredString(body, 'status', 20)
  if (!projectStatuses.has(status)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'status must be 进行中, 已完成, or 规划中.')
  }
  const id = requiredString(body, 'id', 80)
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'id may contain only lowercase letters, numbers, and hyphens.')
  }
  return {
    id,
    profileId: requiredId(String(body.profileId || ''), 'profileId'),
    name: requiredString(body, 'name', 80),
    description: requiredString(body, 'description', 500),
    status,
    tech: requiredString(body, 'tech', 120),
    period: requiredString(body, 'period', 60)
  }
}

// 集中维护数据库列到 API 驼峰字段的映射，供多个项目查询复用。
function projectColumns() {
  return `id, profile_id AS profileId, name, description, status, tech, period`
}

// 公开项目列表按创建时间倒序，较新的项目优先展示。
router.get('/', async (_request, response) => {
  const [projects] = await pool.execute(
    `SELECT ${projectColumns()} FROM projects ORDER BY created_at DESC, id`
  )
  return sendData(response, projects)
})

// 公开详情接口按项目标识读取单条记录。
router.get('/:id', async (request, response) => {
  const [projects] = await pool.execute(
    `SELECT ${projectColumns()} FROM projects WHERE id = ? LIMIT 1`,
    [request.params.id]
  )
  if (!projects.length) notFound('Project')
  return sendData(response, projects[0])
})

// 创建项目仅允许管理员操作，并返回 201 和刚提交的规范化字段。
router.post('/', requireAdminToken, async (request, response) => {
  const project = projectFields(request.body)
  await pool.execute(
    `INSERT INTO projects (id, profile_id, name, description, status, tech, period)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [project.id, project.profileId, project.name, project.description, project.status, project.tech, project.period]
  )
  return sendData(response, project, 201)
})

// 更新路径中的 ID 为唯一标识，忽略请求体中可能伪造的 ID。
router.put('/:id', requireAdminToken, async (request, response) => {
  const project = projectFields({ ...request.body, id: request.params.id })
  await pool.execute(
    `UPDATE projects
     SET profile_id = ?, name = ?, description = ?, status = ?, tech = ?, period = ?
     WHERE id = ?`,
    [project.profileId, project.name, project.description, project.status, project.tech, project.period, project.id]
  )
  const [rows] = await pool.execute(
    `SELECT ${projectColumns()} FROM projects WHERE id = ? LIMIT 1`,
    [project.id]
  )
  if (!rows.length) notFound('Project')
  return sendData(response, rows[0])
})

// 删除项目后，外键规则会将关联文章的 project_id 置空。
router.delete('/:id', requireAdminToken, async (request, response) => {
  const id = request.params.id
  const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id])
  if (!result.affectedRows) notFound('Project')
  return sendData(response, { id })
})

export default router
