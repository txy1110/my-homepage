<template>
  <div class="admin-layout">
    <div class="admin-banner">
      <div><strong>内容管理</strong><div>此区域用于维护主页公开展示的数据。</div></div>
      <div class="admin-actions">
        <span v-if="username">已登录：{{ username }}</span>
        <button class="button" type="button" :disabled="exporting" @click="exportData">
          {{ exporting ? '正在导出…' : '导出全部数据' }}
        </button>
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
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user.js'
import { apiRequest } from '../services/api.js'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { username } = storeToRefs(userStore)
const exporting = ref(false)

async function exportData() {
  exporting.value = true
  try {
    const data = await apiRequest('/export', { authenticated: true })
    // 将服务端返回的完整快照打包为一次性 JSON 下载。
    const content = JSON.stringify(data, null, 2)
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }))
    const link = document.createElement('a')
    const date = new Date().toISOString().replace(/[:.]/g, '-')
    link.href = url
    link.download = `personal-homepage-export-${date}.json`
    document.body.append(link)
    link.click()
    link.remove()
    // 等浏览器开始读取下载内容后再释放 Blob URL。
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    ElMessage.success('全部数据已导出到本地 JSON 文件。')
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '数据导出失败。')
  } finally {
    exporting.value = false
  }
}

// 即便服务端注销失败也清理前端状态并离开受保护页面。
async function logout() {
  try {
    await userStore.logout()
  } catch (cause) {
    ElMessage.error(cause instanceof Error ? cause.message : '退出服务端会话失败。')
  } finally {
    router.push({ name: 'login' })
  }
}
</script>

<style scoped>
.admin-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }
.admin-actions span { font-size: 0.9rem; }
@media (max-width: 600px) { .admin-actions { align-items: flex-start; } }
</style>