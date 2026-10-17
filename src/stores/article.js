import { defineStore } from 'pinia'
import { readStoredState, writeStoredState } from './persistence.js'

const storageKey = 'personal-home-articles'
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

function loadArticles() {
  // 拒绝结构不符的缓存，避免错误数据破坏文章列表渲染。
  return readStoredState(storageKey, structuredClone(initialArticles), (value) =>
    Array.isArray(value) && value.every((article) =>
      article && typeof article.id === 'string' &&
      typeof article.title === 'string' && typeof article.content === 'string'
    )
  )
}

export const useArticleStore = defineStore('articles', {
  // 要求 2、3：文章列表与管理页共享此状态，公开列表只筛选并展示已发布文章。
  state: () => ({ articles: loadArticles() }),
  getters: {
    publishedArticles: (state) => state.articles.filter((article) => article.published),
    publishedCount: (state) => state.articles.filter((article) => article.published).length,
    getArticleById: (state) => (id) => state.articles.find((article) => article.id === id),
    getArticlesByProject: (state) => (projectId) =>
      state.articles.filter((article) => article.projectId === projectId && article.published)
  },
  actions: {
    persist() {
      // 每次增删改后立即写入本地，刷新页面后仍可恢复。
      writeStoredState(storageKey, this.articles)
    },
    addArticle(article) {
      if (this.articles.some((item) => item.id === article.id)) throw new Error('文章编号已存在。')
      this.articles.unshift({ ...article })
      this.persist()
    },
    updateArticle(id, changes) {
      const index = this.articles.findIndex((article) => article.id === id)
      if (index === -1) throw new Error('找不到要修改的文章。')
      this.articles.splice(index, 1, { ...changes, id })
      this.persist()
    },
    deleteArticle(id) {
      const index = this.articles.findIndex((article) => article.id === id)
      if (index === -1) throw new Error('找不到要删除的文章。')
      this.articles.splice(index, 1)
      this.persist()
    }
  }
})
