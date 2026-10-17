<template>
  <div
    v-show="visible"
    class="details-section"
    :id="'details-' + userInfo.name"
    :data-email="userInfo.email"
    :data-city="userInfo.city"
    :data-birthday="userInfo.birthday"
    :data-job="userInfo.job"
  >
    <p>
      <strong>📧 邮箱：</strong>
      <a :href="'mailto:' + userInfo.email" :title="'发送邮件至 ' + userInfo.email">
        {{ userInfo.email }}
      </a>
    </p>
    <p><strong>📍 城市：</strong> {{ userInfo.city }}</p>
    <p><strong>🎂 生日：</strong> {{ userInfo.birthday }}</p>
    <p><strong>💼 职业：</strong> {{ userInfo.job }}</p>
  </div>
</template>

<script setup>
defineProps({
  userInfo: { type: Object, required: true },
  visible: { type: Boolean, default: true }
})
</script>

<style scoped>
.details-section {
  background: var(--skill-bg);
  border-radius: 1.2rem;
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--accent);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
}
.details-section p { margin-bottom: 0.4rem; }
.details-section strong { color: var(--text-primary); font-weight: 600; }
.details-section a { color: var(--accent); text-decoration: none; }
.details-section a:hover { text-decoration: underline; }
</style>