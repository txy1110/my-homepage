<template>
  <section class="page-surface">
    <header class="page-heading"><h1>个人资料</h1><p>修改后会立即更新公开主页，并保存在当前浏览器。</p></header>
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

function resetDraft() {
  Object.assign(draft, userInfo.value)
  skillsDraft.value = skills.value.join(', ')
  saved.value = false
}

function save() {
  if (!draft.name || !draft.title || !draft.bio || !draft.email || !draft.city || !draft.job) return
  const skills = skillsDraft.value.split(',').map((skill) => skill.trim()).filter(Boolean)
  if (!skills.length) return
  projectStore.updateProfile({ userInfo: draft, skills })
  saved.value = true
}
</script>