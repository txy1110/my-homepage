<template>
  <div class="edit-form" v-if="visible">
    <h3>✎ 编辑个人信息</h3>
    <form @submit.prevent="$emit('save')">
      <div class="form-grid">
        <div class="form-group">
          <label>姓名</label>
          <input
            type="text"
            v-model="editTemp.name"
            :placeholder="'请输入姓名（当前：' + userInfo.name + '）'"
          >
        </div>
        <div class="form-group">
          <label>头衔</label>
          <input
            type="text"
            v-model="editTemp.title"
            :placeholder="'请输入头衔（当前：' + userInfo.title + '）'"
          >
        </div>
        <div class="form-group full-width">
          <label>简介</label>
          <input
            type="text"
            v-model="editTemp.bio"
            :placeholder="'请输入简介（当前：' + userInfo.bio + '）'"
          >
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input
            type="email"
            v-model="editTemp.email"
            :placeholder="'请输入邮箱（当前：' + userInfo.email + '）'"
          >
        </div>
        <div class="form-group">
          <label>城市</label>
          <input
            type="text"
            v-model="editTemp.city"
            :placeholder="'请输入城市（当前：' + userInfo.city + '）'"
          >
        </div>
        <div class="form-group">
          <label>生日</label>
          <input
            type="text"
            v-model="editTemp.birthday"
            :placeholder="'请输入生日（当前：' + userInfo.birthday + '）'"
          >
        </div>
        <div class="form-group">
          <label>职业</label>
          <input
            type="text"
            v-model="editTemp.job"
            :placeholder="'请输入职业（当前：' + userInfo.job + '）'"
          >
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('cancel')">
          取消
        </button>
        <button type="submit" class="btn-primary">保存修改</button>
      </div>
    </form>
  </div>
</template>

<script setup>
// 表单展示当前资料作为提示，编辑值由父组件通过双向绑定维护。
defineProps({
  userInfo: { type: Object, required: true }
})

// 将保存和取消动作上抛，由管理页面负责校验、持久化及提示反馈。
defineEmits(['save', 'cancel'])

// 编辑草稿和表单显隐都由父级控制，关闭或重置时可统一恢复状态。
const editTemp = defineModel('editTemp', { type: Object, required: true })
const visible = defineModel('visible', { type: Boolean, default: false })
</script>

<style scoped>
.edit-form {
  margin-top: 1.8rem;
  border-top: 1px solid var(--border);
  padding-top: 1.8rem;
}
.edit-form h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}
.form-group input {
  padding: 0.7rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  outline: none;
}
.form-group input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.form-group.full-width { grid-column: span 2; }
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.btn-primary, .btn-secondary {
  padding: 0.6rem 1.6rem;
  border-radius: 2rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
}
.btn-primary { background: var(--accent); color: white; }
.btn-primary:hover { opacity: 0.85; }
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.btn-secondary:hover { background: var(--skill-bg); border-color: var(--accent); }
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full-width { grid-column: span 1; }
}
</style>