<template>
  <SectionCard title="🧩 项目作品" eyebrow="portfolio">
    <template #header-extra>
      <div class="project-summary">
        <span>{{ projects.length }} 个作品</span>
      </div>
    </template>

    <div class="project-list" v-if="projects.length">
      <article v-for="project in projects" :key="project.id" class="project-item">
        <div class="project-topline">
          <h3><RouterLink :to="{ name: 'project-detail', params: { id: project.id } }">{{ project.name }}</RouterLink></h3>
          <span class="status" :class="statusClass(project.status)">{{ project.status }}</span>
        </div>
        <p class="project-desc">{{ project.description }}</p>
        <div class="project-meta">
          <span>技术：{{ project.tech }}</span>
          <span>时间：{{ project.period }}</span>
        </div>
      </article>
    </div>
    <div v-else class="empty-message">暂无项目数据</div>
  </SectionCard>
</template>

<script setup>
import SectionCard from './SectionCard.vue'
import { RouterLink } from 'vue-router'

const statusClass = (status) => ({ '进行中': 'running', '已完成': 'done', '规划中': 'planning' }[status] || 'planning')

defineProps({
  projects: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.project-item {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 1.2rem;
  padding: 1rem 1rem 1.2rem;
  box-shadow: var(--shadow);
}
.project-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.65rem;
}
.project-topline h3 {
  font-size: 1.08rem;
  color: var(--text-primary);
  font-weight: 700;
}
.project-topline h3 a { color: inherit; text-decoration: none; }
.project-topline h3 a:hover { color: var(--accent); }
.status {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 600;
  white-space: nowrap;
}
.status.running {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}
.status.planning {
  background: rgba(250, 204, 21, 0.14);
  color: #a16207;
}
.status.done {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}
.project-desc {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 0.85rem;
  min-height: 3.2em;
}
.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.project-summary {
  display: inline-flex;
  align-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
}
.empty-message {
  color: var(--text-secondary);
  padding: 0.5rem 0;
}
</style>
