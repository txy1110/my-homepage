<template>
  <NotFoundPage v-if="route.name === 'not-found'" />
  <div v-else-if="loading" class="startup-state" role="status">正在连接数据库并加载主页内容…</div>
  <div v-else-if="startupError" class="startup-state startup-error" role="alert">
    <p>无法从数据库加载内容：{{ startupError }}</p>
    <button class="button primary" type="button" @click="loadDatabase">重新连接</button>
  </div>
  <div v-else class="app-wrapper">
    <AppHeader v-model:is-dark="isDarkTheme" />
    <main class="app-main"><RouterView /></main>
    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import NotFoundPage from './components/NotFoundPage.vue'
import { useArticleStore } from './stores/article.js'
import { useProjectStore } from './stores/project.js'
import { useUserStore } from './stores/user.js'

const isDarkTheme = ref(false)
const route = useRoute()
const loading = ref(true)
const startupError = ref('')
const projectStore = useProjectStore()
const articleStore = useArticleStore()
const userStore = useUserStore()

// 首屏并行加载公开内容；如果浏览器已有会话，再额外加载管理员可见的草稿。
async function loadDatabase() {
  loading.value = true
  startupError.value = ''
  try {
    await Promise.all([projectStore.load(), articleStore.load()])
    if (await userStore.restoreSession()) await articleStore.loadAdmin()
  } catch (error) {
    startupError.value = error instanceof Error ? error.message : '数据库请求失败。'
  } finally {
    loading.value = false
  }
}

onMounted(loadDatabase)

// 主题开关只维护在应用状态中，并通过 body 类统一驱动全局主题变量。
watch(isDarkTheme, (enabled) => {
  document.body.classList.toggle('dark', enabled)
})
</script>

<style>
:root {
  --bg: #f8faff;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --border: #e2e8f0;
  --accent: #3b82f6;
  --accent-soft: #dbeafe;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  --skill-bg: #f1f5f9;
}
body.dark {
  --bg: #0f172a;
  --card-bg: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --border: #334155;
  --accent: #60a5fa;
  --accent-soft: #1e3a8a;
  --shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  --skill-bg: #334155;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.25s ease, color 0.2s ease, border-color 0.2s;
}
body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background: var(--bg);
  color: var(--text-primary);
}
button, input, textarea, select { font: inherit; }
a { color: var(--accent); }
.app-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
.app-main {
  width: min(100%, 1000px);
  flex: 1;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
.startup-state {
  min-height: 100vh;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-secondary);
  text-align: center;
}
.startup-error { color: #b91c1c; }
.page-surface {
  width: 100%;
  padding: 2rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow: var(--shadow);
}
.page-heading { margin-bottom: 1.5rem; }
.page-heading h1 { margin-bottom: 0.35rem; font-size: 1.65rem; }
.page-heading p { color: var(--text-secondary); line-height: 1.7; }
.admin-layout { width: 100%; }
.admin-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  border-left: 4px solid #d97706;
  background: #fffbeb;
  color: #78350f;
}
body.dark .admin-banner { background: #422006; color: #fef3c7; }
.admin-nav { display: flex; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); }
.admin-nav a { padding: 0.75rem 1rem; color: var(--text-secondary); text-decoration: none; border-bottom: 2px solid transparent; }
.admin-nav a.selected { color: var(--accent); border-color: var(--accent); }
.admin-nav { flex-wrap: wrap; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.4rem; }
.form-field.full-width { grid-column: 1 / -1; }
.form-field label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; }
.form-field input, .form-field textarea, .form-field select {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text-primary);
}
.form-field textarea { min-height: 110px; resize: vertical; }
.form-field input:focus, .form-field textarea:focus, .form-field select:focus { outline: 2px solid var(--accent-soft); border-color: var(--accent); }
.button-row { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 1.25rem; }
.button {
  padding: 0.65rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  text-decoration: none;
}
.button.primary { border-color: var(--accent); background: var(--accent); color: #fff; }
.button.danger { border-color: #dc2626; color: #b91c1c; }
.button:hover { filter: brightness(0.96); }
.notice { margin-top: 1rem; color: #15803d; font-weight: 600; }
.form-error { margin-top: 0.8rem; color: #b91c1c; }
@media (max-width: 600px) {
  .app-main { padding: 1rem; }
  .page-surface { padding: 1.25rem; }
  .form-grid { grid-template-columns: 1fr; }
  .form-field.full-width { grid-column: auto; }
  .admin-banner { align-items: flex-start; flex-direction: column; }
}
</style>