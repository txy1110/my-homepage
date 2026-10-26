<template>
  <section class="page-surface login-page">
    <header class="page-heading">
      <h1>后台登录</h1>
      <p>登录后可管理个人资料、项目和文章。</p>
    </header>
    <form @submit.prevent="login">
      <div class="form-grid">
        <div class="form-field full-width">
          <label for="username">用户名</label>
          <input id="username" v-model.trim="username" autocomplete="username" required maxlength="40">
        </div>
        <div class="form-field full-width">
          <label for="password">密码</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required>
        </div>
      </div>
      <p class="demo-note">使用服务端配置的管理员用户名，以及 `server/.env` 中的管理令牌登录。</p>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <div class="button-row">
        <button class="button primary" type="submit">登录管理后台</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'

const username = ref('')
const password = ref('')
const error = ref('')
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 登录成功后只接受站内绝对路径作为重定向目标，避免开放重定向到外站。
async function login() {
  error.value = ''
  try {
    await userStore.login(username.value, password.value)
    const redirect = typeof route.query.redirect === 'string' &&
      route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : { name: 'admin-profile' }
    router.replace(redirect)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '登录失败。'
  }
}
</script>

<style scoped>
.login-page { max-width: 560px; margin: 0 auto; }
.demo-note { margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }
</style>
