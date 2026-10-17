import { defineStore } from 'pinia'
import { initialSiteContent } from '../data/site.js'
import { readStoredState, writeStoredState } from './persistence.js'

const storageKey = 'personal-home-content'

function loadContent() {
  // 合并默认资料，兼容旧版本或只保存了部分字段的本地内容。
  const saved = readStoredState(storageKey, null, (value) =>
    value && typeof value === 'object' &&
    value.userInfo && typeof value.userInfo === 'object' && !Array.isArray(value.userInfo) &&
    Array.isArray(value.projects) && Array.isArray(value.skills)
  )

  return saved
    ? { ...initialSiteContent, ...saved, userInfo: { ...initialSiteContent.userInfo, ...saved.userInfo } }
    : structuredClone(initialSiteContent)
}

export const useProjectStore = defineStore('projects', {
  // 个人资料、技能和项目由同一 Store 维护，便于公开页和后台共享。
  state: () => loadContent(),
  getters: {
    projectCount: (state) => state.projects.length,
    getProjectById: (state) => (id) => state.projects.find((project) => project.id === id)
  },
  actions: {
    persist() {
      // 只写入业务数据，避免把 Store 内部属性一并序列化。
      writeStoredState(storageKey, {
        userInfo: this.userInfo,
        avatarEmoji: this.avatarEmoji,
        skills: this.skills,
        projects: this.projects
      })
    },
    updateProfile({ userInfo, skills }) {
      this.userInfo = { ...this.userInfo, ...userInfo }
      this.skills = [...new Set(skills)]
      this.persist()
    },
    addProject(project) {
      if (this.getProjectById(project.id)) throw new Error('该项目编号已存在。')
      this.projects.push({ ...project })
      this.persist()
    },
    updateProject(id, changes) {
      const index = this.projects.findIndex((project) => project.id === id)
      if (index === -1) throw new Error('找不到要修改的项目。')
      this.projects.splice(index, 1, { ...changes })
      this.persist()
    },
    deleteProject(id) {
      const index = this.projects.findIndex((project) => project.id === id)
      if (index === -1) throw new Error('找不到要删除的项目。')
      this.projects.splice(index, 1)
      this.persist()
    }
  }
})
