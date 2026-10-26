import { Router } from 'express'
import pool from '../db.js'
import { requireAdminToken } from '../auth.js'
import { sendData } from '../validation.js'

const router = Router()

// 导出包含管理端草稿，因此整条路由必须先通过管理员会话校验。
router.get('/', requireAdminToken, async (_request, response) => {
  // 同一份快照返回所有内容资源，并用驼峰字段名保持 JSON API 一致。
  const [profiles] = await pool.execute(
    `SELECT id, name, title, bio, email, city, birthday, job, avatar_emoji AS avatarEmoji,
      created_at AS createdAt, updated_at AS updatedAt
     FROM profiles ORDER BY id`
  )
  const [skills] = await pool.execute(
    `SELECT id, profile_id AS profileId, name, sort_order AS sortOrder, created_at AS createdAt
     FROM skills ORDER BY profile_id, sort_order, id`
  )
  const [projects] = await pool.execute(
    `SELECT id, profile_id AS profileId, name, description, status, tech, period,
      created_at AS createdAt, updated_at AS updatedAt
     FROM projects ORDER BY created_at, id`
  )
  const [articles] = await pool.execute(
    `SELECT id, profile_id AS profileId, project_id AS projectId, title, summary, content,
      publish_date AS createdAt, published, created_at AS recordCreatedAt, updated_at AS updatedAt
     FROM articles ORDER BY publish_date, id`
  )

  return sendData(response, {
    exportedAt: new Date().toISOString(),
    profiles,
    skills,
    projects,
    articles: articles.map((article) => ({ ...article, published: Boolean(article.published) }))
  })
})

export default router
