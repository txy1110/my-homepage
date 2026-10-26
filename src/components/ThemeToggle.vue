<template>
  <button
    class="theme-toggle"
    :class="{ 'dark-active': isDark }"
    :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    @click="isDark = !isDark"
  >
    <span>{{ isDark ? '☀️ 亮色' : '🌙 暗色' }}</span>
  </button>
</template>

<script setup>
// 主题状态由父级统一持有，defineModel 让此按钮可直接切换父级状态。
const isDark = defineModel('isDark', { type: Boolean, default: false })
</script>

<style scoped>
.theme-toggle {
  background: var(--skill-bg);
  border: 1px solid var(--border);
  border-radius: 2rem;
  padding: 0.6rem 1.3rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
}
.theme-toggle:hover,
.theme-toggle.dark-active {
  background: var(--accent-soft);
  border-color: var(--accent);
}
</style>