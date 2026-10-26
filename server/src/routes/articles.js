import { Router } from 'express'
import pool from '../db.js'
import { requireAdminToken } from '../auth.js'
import { ApiError } from '../errors.js'
import {
  notFound,
  requestBody,
  requiredBoolean,
  requiredDate,
  requiredId,
  requiredString,
  requiredText,
  sendData
} from '../validation.js'

const router = Router()

// 验证文章字段及可空项目关联，草稿与已发布文章共用此校验规则。
function articleFields(body) {
  requestBody(body)
  const projectId = body.projectId === null || body.projectId === '' ? null : body.projectId
  if (projectId !== null && typeof projectId !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'projectId must be a project identifier or null.')
  }
  return {
    id: requiredString(body, 'id', 100),
    profileId: requiredId(String(body.profileId || ''), 'profileId'),
    projectId,
    title: requiredString(body, 'title', 100),
    summary: requiredString(body, 'summary', 240),
    content: requiredText(body, 'content', 65535),
    createdAt: requiredDate(body, 'createdAt'),
    published: requiredBoolean(body, 'published')
  }
}

const articleColumns = `id, profile_id AS profileId, title, summary, content,
  project_id AS projectId, publish_date AS createdAt, published`

// 文章关联的项目必须存在且归属于同一资料，避免跨资料建立无效关系。
async function assertProjectBelongsToProfile(projectId, profileId) {
  if (projectId === null) return
  const [projects] = await pool.execute(
    'SELECT id FROM projects WHERE id = ? AND profile_id = ? LIMIT 1',
    [projectId, profileId]
  )
  if (!projects.length) {
    throw new ApiError(400, 'INVALID_PROJECT', 'projectId must refer to a project owned by profileId.')
  }
}

// mysql2 对布尔列可能返回数字，统一转换为 API 的 JSON 布尔值。
function normalizeArticles(articles) {
  return articles.map((article) => ({ ...article, published: Boolean(article.published) }))
}

// 公开列表只返回已发布内容，可选按项目筛选。
router.get('/', async (request, response) => {
  if (request.query.projectId !== undefined && typeof request.query.projectId !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'projectId must be a single project identifier.')
  }
  const projectId = request.query.projectId || null
  const [articles] = projectId
    ? await pool.execute(
      `SELECT ${articleColumns} FROM articles
       WHERE published = TRUE AND project_id = ?
       ORDER BY publish_date DESC, id DESC`,
      [projectId]
    )
    : await pool.execute(
      `SELECT ${articleColumns} FROM articles
       WHERE published = TRUE
       ORDER BY publish_date DESC, id DESC`
    )
  return sendData(response, normalizeArticles(articles))
})

// 管理员专用列表包含草稿，供后台内容管理使用。
router.get('/manage', requireAdminToken, async (_request, response) => {
  const [articles] = await pool.execute(
    `SELECT ${articleColumns} FROM articles ORDER BY publish_date DESC, id DESC`
  )
  return sendData(response, normalizeArticles(articles))
})

// 管理员可按 ID 读取文章草稿或已发布内容。
router.get('/manage/:id', requireAdminToken, async (request, response) => {
  const [articles] = await pool.execute(
    `SELECT ${articleColumns} FROM articles WHERE id = ? LIMIT 1`,
    [request.params.id]
  )
  if (!articles.length) notFound('Article')
  return sendData(response, { ...articles[0], published: Boolean(articles[0].published) })
})

// 公开详情只能访问已发布文章，未发布内容统一表现为不存在。
router.get('/:id', async (request, response) => {
  const [articles] = await pool.execute(
    `SELECT ${articleColumns} FROM articles WHERE id = ? AND published = TRUE LIMIT 1`,
    [request.params.id]
  )
  if (!articles.length) notFound('Article')
  return sendData(response, { ...articles[0], published: Boolean(articles[0].published) })
})

// 创建文章前校验项目关联，成功时以 HTTP 201 返回新记录。
router.post('/', requireAdminToken, async (request, response) => {
  const article = articleFields(request.body)
  await assertProjectBelongsToProfile(article.projectId, article.profileId)
  await pool.execute(
    `INSERT INTO articles (id, profile_id, project_id, title, summary, content, publish_date, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [article.id, article.profileId, article.projectId, article.title, article.summary, article.content, article.createdAt, article.published]
  )
  return sendData(response, article, 201)
})

// 更新时以路径 ID 覆盖请求体 ID，确保目标记录不能被请求体篡改。
router.put('/:id', requireAdminToken, async (request, response) => {
  const article = articleFields({ ...request.body, id: request.params.id })
  await assertProjectBelongsToProfile(article.projectId, article.profileId)
  await pool.execute(
    `UPDATE articles
     SET profile_id = ?, project_id = ?, title = ?, summary = ?, content = ?, publish_date = ?, published = ?
     WHERE id = ?`,
    [article.profileId, article.projectId, article.title, article.summary, article.content, article.createdAt, article.published, article.id]
  )
  const [rows] = await pool.execute(
    `SELECT ${articleColumns} FROM articles WHERE id = ? LIMIT 1`,
    [article.id]
  )
  if (!rows.length) notFound('Article')
  return sendData(response, { ...rows[0], published: Boolean(rows[0].published) })
})

// 删除文章仅允许管理员操作，数据库无匹配记录时返回 404。
router.delete('/:id', requireAdminToken, async (request, response) => {
  const id = request.params.id
  const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [id])
  if (!result.affectedRows) notFound('Article')
  return sendData(response, { id })
})

export default router
