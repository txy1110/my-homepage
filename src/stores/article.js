import { defineStore } from 'pinia'
import { apiRequest } from '../services/api.js'
import { useProjectStore } from './project.js'

export const useArticleStore = defineStore('articles', {
  state: () => ({ articles: [], loaded: false, adminLoaded: false }),
  getters: {
    // 公开页面只显示已发布文章，草稿由管理员视图单独加载。
    publishedArticles: (state) => state.articles.filter((article) => article.published),
    publishedCount: (state) => state.articles.filter((article) => article.published).length,
    getArticleById: (state) => (id) => state.articles.find((article) => article.id === id),
    getArticlesByProject: (state) => (projectId) =>
      state.articles.filter((article) => article.projectId === projectId && article.published)
  },
  actions: {
    // 公开文章接口不会返回草稿；加载公开列表时重置管理员列表标记。
    async load() {
      this.articles = await apiRequest('/articles')
      this.loaded = true
      this.adminLoaded = false
    },
    // 管理后台使用受保护接口加载所有文章，包括未发布草稿。
    async loadAdmin() {
      this.articles = await apiRequest('/articles/manage', { authenticated: true })
      this.loaded = true
      this.adminLoaded = true
    },
    // 项目关联由项目 Store 提供，未关联项目以 null 传给数据库。
    async addArticle(article) {
      const saved = await apiRequest('/articles', {
        method: 'POST',
        authenticated: true,
        body: {
          ...article,
          projectId: article.projectId || null,
          profileId: useProjectStore().profileId
        }
      })
      this.articles.unshift(saved)
    },
    // 更新后以 API 返回记录同步 Store，保证发布日期和发布状态一致。
    async updateArticle(id, changes) {
      const saved = await apiRequest(`/articles/${encodeURIComponent(id)}`, {
        method: 'PUT',
        authenticated: true,
        body: {
          ...changes,
          projectId: changes.projectId || null,
          profileId: useProjectStore().profileId
        }
      })
      const index = this.articles.findIndex((article) => article.id === id)
      if (index === -1) this.articles.unshift(saved)
      else this.articles.splice(index, 1, saved)
    },
    // 先确认服务端删除成功，再同步移除当前 Store 中的文章。
    async deleteArticle(id) {
      await apiRequest(`/articles/${encodeURIComponent(id)}`, { method: 'DELETE', authenticated: true })
      const index = this.articles.findIndex((article) => article.id === id)
      this.articles.splice(index, 1)
    }
  }
})
