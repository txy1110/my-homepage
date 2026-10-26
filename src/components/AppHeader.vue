<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink class="logo" :to="{ name: 'home' }">👤 我的个人主页</RouterLink>
      <el-menu :default-active="activePath" mode="horizontal" :ellipsis="false" router class="main-nav">
        <el-menu-item index="/">主页</el-menu-item>
        <el-menu-item index="/projects">项目</el-menu-item>
        <el-menu-item index="/articles">文章</el-menu-item>
        <el-menu-item :index="adminPath">内容管理</el-menu-item>
      </el-menu>
      <ThemeToggle v-model:is-dark="isDark" />
    </div>
  </header>
</template>

<script setup>
import ThemeToggle from './ThemeToggle.vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user.js'

// 主题开关状态由父级管理，避免导航组件与页面主题状态分离。
const isDark = defineModel('isDark', { type: Boolean, default: false })
const route = useRoute()
// 以响应式 Store 状态决定“内容管理”入口跳转至登录页还是后台。
const { isLoggedIn } = storeToRefs(useUserStore())
const adminPath = computed(() => isLoggedIn.value ? '/admin/profile' : '/login')
// 后台子页面统一高亮内容管理入口，其他页面按当前路由路径高亮。
const activePath = computed(() => route.path.startsWith('/admin') ? '/admin/profile' : route.path)
</script>

<style scoped>
.app-header {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.header-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;
}
.main-nav { flex: 0 1 auto; margin-left: auto; margin-right: 1rem; border-bottom: 0; background: transparent; }
.main-nav :deep(.el-menu-item) { height: 44px; padding: 0 0.75rem; color: var(--text-secondary); border-radius: 0.5rem; }
.main-nav :deep(.el-menu-item:hover), .main-nav :deep(.el-menu-item.is-active) { color: var(--accent); background: var(--accent-soft); border-bottom-color: var(--accent); }
@media (max-width: 680px) {
  .header-inner { flex-wrap: wrap; gap: 0.7rem; }
  .main-nav { order: 3; width: 100%; margin: 0; justify-content: space-between; }
  .main-nav :deep(.el-menu-item) { flex: 1; justify-content: center; padding: 0 0.4rem; }
}
</style>