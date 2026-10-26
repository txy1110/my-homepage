<template>
  <div class="list-section">
    <div class="list-header">
      <h2>✨ 技能与兴趣</h2>
      <!-- v-model 绑定到 defineModel 声明的 filterText -->
      <input
        type="text"
        class="filter-input"
        v-model="filterText"
        placeholder="🔍 筛选技能/兴趣..."
      >
    </div>

    <ul class="skill-list" v-if="filteredSkills.length > 0">
      <li
        class="skill-item"
        v-for="skill in filteredSkills"
        :key="skill"
        :title="'技能/兴趣：' + skill"
      >
        {{ skill }}
      </li>
    </ul>
    <div v-else class="empty-message">没有匹配的技能/兴趣</div>

    <p class="filter-count" v-if="filterText.length > 0">
      筛选出 {{ filteredSkills.length }} 项 (共 {{ skills.length }} 项)
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// defineProps：接收父组件传入的技能列表
const props = defineProps({
  skills: { type: Array, required: true }
})

// defineModel：与父组件双向绑定 filterText
const filterText = defineModel('filterText', { type: String, default: '' })

// 空关键词展示完整列表，其余情况使用不区分大小写的包含匹配。
const filteredSkills = computed(() => {
  if (!filterText.value.trim()) return props.skills
  const k = filterText.value.trim().toLowerCase()
  return props.skills.filter(s => s.toLowerCase().includes(k))
})
</script>

<style scoped>
.list-section { margin-bottom: 1.5rem; }
.list-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.list-header h2 { font-size: 1.3rem; font-weight: 600; }
.filter-input {
  padding: 0.55rem 1rem;
  border-radius: 2rem;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  width: 200px;
  outline: none;
}
.filter-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  list-style: none;
  padding: 0.2rem 0;
}
.skill-item {
  background: var(--skill-bg);
  border: 1px solid var(--border);
  padding: 0.45rem 1.1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}
.skill-item:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.empty-message {
  color: var(--text-secondary);
  font-style: italic;
  padding: 0.6rem 0;
}
.filter-count {
  font-size: 0.8rem;
  margin-top: 0.8rem;
  color: var(--text-secondary);
}
</style>