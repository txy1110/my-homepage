<template>
  <el-container class="profile-layout">
    <el-main>
      <el-card shadow="never" class="page-surface profile-card">
        <ProfileCard :user-info="userInfo" :avatar-emoji="avatarEmoji" />
        <ProfileDetails :user-info="userInfo" />
        <SkillList v-model:filter-text="filterText" :skills="skills" />
        <ProjectList :projects="projects.slice(0, 3)" />
        <RouterLink class="all-projects" :to="{ name: 'projects' }">查看全部项目 →</RouterLink>
        <section class="timeline-section" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading">学习与项目时间线</h2>
          <el-timeline>
            <el-timeline-item v-for="item in timelineItems" :key="item.time" :timestamp="item.time" placement="top" :type="item.type">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </el-timeline-item>
          </el-timeline>
        </section>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import ProfileCard from '../components/ProfileCard.vue'
import ProfileDetails from '../components/ProfileDetails.vue'
import ProjectList from '../components/ProjectList.vue'
import SkillList from '../components/SkillList.vue'
import { useProjectStore } from '../stores/project.js'

const filterText = ref('')
const projectStore = useProjectStore()
// 公开资料、技能与项目都订阅同一个 Store，后台修改后会同步反映在主页。
const { userInfo, avatarEmoji, skills, projects } = storeToRefs(projectStore)
// 时间线为主页展示数据；Timeline 组件负责统一呈现节点与时间标签。
const timelineItems = [
  { time: '2025.09 - 2025.10', title: '完成待办事项项目', description: '练习 Vue 组件拆分、表单交互与任务状态管理。', type: 'success' },
  { time: '2025.11 - 至今', title: '搭建个人主页与博客', description: '使用 Vue 3、Vue Router 和 Pinia 整理个人资料、项目和文章。', type: 'primary' },
  { time: '2026.01 - 2026.03', title: '探索 AI 作品推荐', description: '规划基于内容标签和偏好分析的作品推荐应用。', type: 'warning' }
]
</script>

<style scoped>
.profile-layout { width: 100%; }
.profile-layout :deep(.el-main) { padding: 0; }
.profile-card { max-width: 780px; margin: 0 auto; border: 0; }
.timeline-section { margin-top: 2.5rem; }
.timeline-section h2 { margin-bottom: 1.5rem; font-size: 1.3rem; }
.timeline-section h3 { margin-bottom: 0.35rem; font-size: 1rem; }
.timeline-section p { color: var(--text-secondary); line-height: 1.7; }
.all-projects { display: inline-block; margin-top: 1rem; font-weight: 600; text-decoration: none; }
</style>