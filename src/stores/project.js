import { defineStore } from 'pinia'
import { apiRequest } from '../services/api.js'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    profileId: '',
    userInfo: {},
    avatarEmoji: '',
    skills: [],
    projects: [],
    loaded: false
  }),
  getters: {
    // 项目数量和详情查询由当前 Store 状态即时派生。
    projectCount: (state) => state.projects.length,
    getProjectById: (state) => (id) => state.projects.find((project) => project.id === id)
  },
  actions: {
    // 首屏并行读取资料、项目和技能，待请求全部成功后一次性更新 Store。
    async load() {
      const [profile, projects, skills] = await Promise.all([
        apiRequest('/profile'),
        apiRequest('/projects'),
        apiRequest('/skills')
      ])
      this.profileId = String(profile.id)
      this.userInfo = {
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        email: profile.email,
        city: profile.city,
        birthday: profile.birthday || '',
        job: profile.job
      }
      this.avatarEmoji = profile.avatarEmoji
      this.skills = skills.map((skill) => skill.name)
      this.projects = projects
      this.loaded = true
    },
    // 保存资料时连同技能清单一起提交，接口成功后再同步返回值。
    async updateProfile({ userInfo, skills }) {
      const profile = await apiRequest(`/profile/${this.profileId}`, {
        method: 'PUT',
        authenticated: true,
        body: {
          ...userInfo,
          skills: [...new Set(skills)],
          avatarEmoji: this.avatarEmoji
        }
      })
      this.userInfo = {
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        email: profile.email,
        city: profile.city,
        birthday: profile.birthday || '',
        job: profile.job
      }
      this.skills = profile.skills
    },
    // 新建项目成功后立即置入列表，保持页面响应式状态与数据库一致。
    async addProject(project) {
      const saved = await apiRequest('/projects', {
        method: 'POST',
        authenticated: true,
        body: { ...project, profileId: this.profileId }
      })
      this.projects.unshift(saved)
    },
    // 更新后以服务端结果替换 Store 条目，避免保留未规范化的表单值。
    async updateProject(id, changes) {
      const saved = await apiRequest(`/projects/${encodeURIComponent(id)}`, {
        method: 'PUT',
        authenticated: true,
        body: { ...changes, profileId: this.profileId }
      })
      const index = this.projects.findIndex((project) => project.id === id)
      if (index === -1) this.projects.unshift(saved)
      else this.projects.splice(index, 1, saved)
    },
    // 删除只在接口确认成功后才从本地列表移除。
    async deleteProject(id) {
      await apiRequest(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE', authenticated: true })
      const index = this.projects.findIndex((project) => project.id === id)
      this.projects.splice(index, 1)
    }
  }
})
