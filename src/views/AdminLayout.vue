<template>
  <div class="admin-layout">
    <div class="admin-banner">
      <div><strong>内容管理</strong><div>此区域用于维护主页公开展示的数据。</div></div>
      <div class="admin-actions">
        <span v-if="username">已登录：{{ username }}</span>
        <RouterLink class="button" :to="{ name: 'home' }">返回公开主页</RouterLink>
        <button class="button" type="button" @click="logout">退出登录</button>
      </div>
    </div>
    <nav class="admin-nav" aria-label="管理导航">
      <RouterLink :class="{ selected: route.name === 'admin-profile' }" :to="{ name: 'admin-profile' }">个人资料</RouterLink>
      <RouterLink :class="{ selected: route.name === 'admin-projects' }" :to="{ name: 'admin-projects' }">项目管理</RouterLink>
      <RouterLink :class="{ selected: route.name === 'admin-articles' }" :to="{ name: 'admin-articles' }">文章管理</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { username } = storeToRefs(userStore)

function logout() {
  userStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.admin-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }
.admin-actions span { font-size: 0.9rem; }
@media (max-width: 600px) { .admin-actions { align-items: flex-start; } }
</style>