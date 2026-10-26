<template>
  <section class="page-surface">
    <header class="page-heading"><h1>个人资料</h1><p>修改后会保存到数据库并更新公开主页。</p></header>
    <form @submit.prevent="save">
      <div class="form-grid">
        <div class="form-field"><label for="profile-name">姓名</label><input id="profile-name" v-model.trim="draft.name" required maxlength="40"></div>
        <div class="form-field"><label for="profile-title">头衔</label><input id="profile-title" v-model.trim="draft.title" required maxlength="80"></div>
        <div class="form-field full-width"><label for="profile-bio">个人简介</label><textarea id="profile-bio" v-model.trim="draft.bio" required maxlength="240"></textarea></div>
        <div class="form-field"><label for="profile-email">邮箱</label><input id="profile-email" v-model.trim="draft.email" type="email" required></div>
        <div class="form-field"><label for="profile-city">城市</label><input id="profile-city" v-model.trim="draft.city" required maxlength="40"></div>
        <div class="form-field"><label for="profile-birthday">生日</label><input id="profile-birthday" v-model="draft.birthday" type="date"></div>
        <div class="form-field"><label for="profile-job">职业</label><input id="profile-job" v-model.trim="draft.job" required maxlength="40"></div>
        <div class="form-field full-width"><label for="profile-skills">技能与兴趣（用英文逗号分隔）</label><input id="profile-skills" v-model="skillsDraft" required></div>
      </div>
      <div class="button-row">
        <button class="button primary" type="submit">保存资料</button>
        <button class="button" type="button" @click="resetDraft">取消修改</button>
      </div>
      <p v-if="saved" class="notice" role="status">资料已保存。</p>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '../stores/project.js'

const projectStore = useProjectStore()
const { userInfo, skills } = storeToRefs(projectStore)
const draft = reactive({ ...userInfo.value })
const skillsDraft = ref(skills.value.join(', '))
const saved = ref(false)
const error = ref('')

// 放弃编辑时从 Store 重新拷贝当前值，恢复表单和技能输入框。
function resetDraft() {
  Object.assign(draft, userInfo.value)
  skillsDraft.value = skills.value.join(', ')
  saved.value = false
}

// 前端先做必填检查，再将资料和技能一起提交给后端事务接口。
async function save() {
  if (!draft.name || !draft.title || !draft.bio || !draft.email || !draft.city || !draft.job) return
  const skills = skillsDraft.value.split(',').map((skill) => skill.trim()).filter(Boolean)
  if (!skills.length) return
  error.value = ''
  try {
    await projectStore.updateProfile({ userInfo: draft, skills })
    saved.value = true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '资料保存失败。'
  }
}
</script>