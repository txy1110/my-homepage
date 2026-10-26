import 'dotenv/config'
import pool from '../src/db.js'
import { initialSiteContent } from '../../src/data/site.js'

const initialArticles = [
  {
    id: 'welcome-to-my-blog',
    title: '欢迎来到我的个人博客',
    summary: '记录前端学习、项目实践与日常思考。',
    content: '这里会持续分享我在 Vue、JavaScript 和项目开发中的学习记录。\n\n欢迎浏览我的项目，也欢迎交流。',
    projectId: 'personal-blog',
    createdAt: '2026-01-10',
    published: true
  },
  {
    id: 'vue-project-notes',
    title: '从一个 Vue 项目开始',
    summary: '把页面拆分成组件，并通过共享状态组织项目数据。',
    content: '在项目初期，先明确页面结构和数据边界，再逐步引入路由与状态管理，可以让后续功能扩展更加清晰。',
    projectId: 'personal-blog',
    createdAt: '2026-02-05',
    published: true
  }
]

// 用单个数据库事务初始化基准数据，避免部分插入导致数据关系不完整。
const connection = await pool.getConnection()

try {
  await connection.beginTransaction()
  // 已存在资料时跳过导入；若子表有数据却没有资料则中止，避免覆盖异常状态。
  const [profiles] = await connection.execute('SELECT id FROM profiles LIMIT 1')
  if (profiles.length) {
    console.log('Seed skipped: profiles already contain data.')
    await connection.rollback()
  } else {
    const [counts] = await connection.execute(
      `SELECT
         (SELECT COUNT(*) FROM skills) AS skills,
         (SELECT COUNT(*) FROM projects) AS projects,
         (SELECT COUNT(*) FROM articles) AS articles`
    )
    if (Number(counts[0].skills) + Number(counts[0].projects) + Number(counts[0].articles) > 0) {
      throw new Error('Cannot seed: content tables already contain rows but no profile exists.')
    }

    // 先创建父资料，拿到自增主键后再写入关联技能、项目和文章。
    const profile = initialSiteContent.userInfo
    const [result] = await connection.execute(
      `INSERT INTO profiles (name, title, bio, email, city, birthday, job, avatar_emoji)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [profile.name, profile.title, profile.bio, profile.email, profile.city, profile.birthday, profile.job, initialSiteContent.avatarEmoji]
    )
    const profileId = String(result.insertId)

    for (let index = 0; index < initialSiteContent.skills.length; index += 1) {
      await connection.execute(
        'INSERT INTO skills (profile_id, name, sort_order) VALUES (?, ?, ?)',
        [profileId, initialSiteContent.skills[index], index]
      )
    }

    for (const project of initialSiteContent.projects) {
      await connection.execute(
        `INSERT INTO projects (id, profile_id, name, description, status, tech, period)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [project.id, profileId, project.name, project.description, project.status, project.tech, project.period]
      )
    }

    for (const article of initialArticles) {
      await connection.execute(
        `INSERT INTO articles (id, profile_id, project_id, title, summary, content, publish_date, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [article.id, profileId, article.projectId, article.title, article.summary, article.content, article.createdAt, article.published]
      )
    }

    await connection.commit()
    console.log(`Seed complete: 1 profile, ${initialSiteContent.skills.length} skills, ${initialSiteContent.projects.length} projects, ${initialArticles.length} articles.`)
  }
} catch (error) {
  // 任一插入失败都回滚整批导入，保证初始化结果全有或全无。
  await connection.rollback()
  throw error
} finally {
  connection.release()
  await pool.end()
}
