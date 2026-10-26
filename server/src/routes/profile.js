import { Router } from 'express'
import pool from '../db.js'
import { requireAdminToken } from '../auth.js'
import { ApiError } from '../errors.js'
import {
  notFound,
  optionalString,
  requestBody,
  requiredDate,
  requiredId,
  requiredString,
  requiredText,
  sendData
} from '../validation.js'

const router = Router()

// 资料详情同时组装其技能名称，保持前端资料接口返回单一完整对象。
async function loadProfile(id) {
  const [profiles] = await pool.execute(
    `SELECT id, name, title, bio, email, city, birthday, job, avatar_emoji AS avatarEmoji
     FROM profiles
     WHERE id = ?
     LIMIT 1`,
    [id]
  )
  if (!profiles.length) return null

  const profile = profiles[0]
  const [skills] = await pool.execute(
    'SELECT name FROM skills WHERE profile_id = ? ORDER BY sort_order, id',
    [profile.id]
  )
  return { ...profile, skills: skills.map((skill) => skill.name) }
}

// 校验资料字段和技能列表，并将前端可选字段规范化为数据库可存储值。
function profileFields(body) {
  requestBody(body)
  const skills = body.skills ?? []
  if (!Array.isArray(skills) || skills.some((skill) => typeof skill !== 'string' || !skill.trim() || skill.length > 80)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'skills must be an array of non-empty strings with at most 80 characters.')
  }
  return {
    name: requiredString(body, 'name', 80),
    title: requiredString(body, 'title', 120),
    bio: requiredText(body, 'bio', 65535),
    email: requiredString(body, 'email', 254),
    city: requiredString(body, 'city', 100),
    birthday: body.birthday === null || body.birthday === '' ? null : requiredDate(body, 'birthday'),
    job: requiredString(body, 'job', 100),
    avatarEmoji: optionalString(body, 'avatarEmoji', 32),
    // 去除首尾空格并去重，避免同一资料的技能唯一约束冲突。
    skills: [...new Set(skills.map((skill) => skill.trim()))]
  }
}

// 资料更新时整体替换技能，并按数组顺序重设排序值。
async function replaceSkills(connection, profileId, skills) {
  await connection.execute('DELETE FROM skills WHERE profile_id = ?', [profileId])
  for (let index = 0; index < skills.length; index += 1) {
    await connection.execute(
      'INSERT INTO skills (profile_id, name, sort_order) VALUES (?, ?, ?)',
      [profileId, skills[index], index]
    )
  }
}

// 根路径读取默认资料，供主页首次加载使用。
router.get('/', async (_request, response) => {
  // 主页只展示一份主资料；没有初始化资料时返回明确的 404。
  const [rows] = await pool.execute('SELECT id FROM profiles ORDER BY id LIMIT 1')
  if (!rows.length) notFound('Profile')
  return sendData(response, await loadProfile(rows[0].id))
})

// 按资料主键读取资料及其技能。
router.get('/:id', async (request, response) => {
  const id = requiredId(request.params.id)
  const profile = await loadProfile(id)
  if (!profile) notFound('Profile')
  return sendData(response, profile)
})

// 新建资料和关联技能放在同一事务中，确保失败时不会留下半份数据。
router.post('/', requireAdminToken, async (request, response) => {
  const profile = profileFields(request.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute(
      `INSERT INTO profiles (name, title, bio, email, city, birthday, job, avatar_emoji)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [profile.name, profile.title, profile.bio, profile.email, profile.city, profile.birthday, profile.job, profile.avatarEmoji]
    )
    await replaceSkills(connection, String(result.insertId), profile.skills)
    await connection.commit()
    return sendData(response, await loadProfile(String(result.insertId)), 201)
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

// 更新资料字段与技能列表使用同一事务，保证两部分数据保持一致。
router.put('/:id', requireAdminToken, async (request, response) => {
  const id = requiredId(request.params.id)
  const profile = profileFields(request.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(
      `UPDATE profiles
       SET name = ?, title = ?, bio = ?, email = ?, city = ?, birthday = ?, job = ?, avatar_emoji = ?
       WHERE id = ?`,
      [profile.name, profile.title, profile.bio, profile.email, profile.city, profile.birthday, profile.job, profile.avatarEmoji, id]
    )
    const [rows] = await connection.execute('SELECT id FROM profiles WHERE id = ? LIMIT 1', [id])
    if (!rows.length) notFound('Profile')
    await replaceSkills(connection, id, profile.skills)
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
  const profileResult = await loadProfile(id)
  if (!profileResult) notFound('Profile')
  return sendData(response, profileResult)
})

// 删除资料依赖数据库外键级联清理相关内容，避免留下孤立记录。
router.delete('/:id', requireAdminToken, async (request, response) => {
  const id = requiredId(request.params.id)
  const [result] = await pool.execute('DELETE FROM profiles WHERE id = ?', [id])
  if (!result.affectedRows) notFound('Profile')
  // 外键 ON DELETE CASCADE 会一并删除此资料关联的技能、项目和文章。
  return sendData(response, { id })
})

export default router
