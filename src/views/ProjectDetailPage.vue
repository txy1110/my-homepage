<template>
  <article v-if="project" class="page-surface project-detail">
    <RouterLink class="back-link" :to="{ name: 'projects' }">← 返回项目列表</RouterLink>
    <header class="page-heading">
      <span class="project-status" :class="statusClass">{{ project.status }}</span>
      <h1>{{ project.name }}</h1>
      <p>{{ project.description }}</p>
    </header>
    <dl class="project-facts">
      <div><dt>技术栈</dt><dd>{{ project.tech }}</dd></div>
      <div><dt>项目周期</dt><dd>{{ project.period }}</dd></div>
      <div><dt>项目编号</dt><dd>{{ project.id }}</dd></div>
    </dl>
    <RouterLink class="button" :to="{ name: 'projects' }">浏览其他项目</RouterLink>
    <section v-if="relatedArticles.length" class="related-articles">
      <h2>相关文章</h2>
      <ul>
        <li v-for="article in relatedArticles" :key="article.id">
          <RouterLink :to="{ name: 'article-detail', params: { id: article.id } }">{{ article.title }}</RouterLink>
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useProjectStore } from '../stores/project.js'
import { useArticleStore } from '../stores/article.js'
import { RouterLink } from 'vue-router'

const props = defineProps({ id: { type: String, required: true } })
const projectStore = useProjectStore()
const articleStore = useArticleStore()
const project = computed(() => projectStore.getProjectById(props.id))
const relatedArticles = computed(() => articleStore.getArticlesByProject(props.id))
const statusClass = computed(() => ({ '进行中': 'running', '已完成': 'done', '规划中': 'planning' }[project.value?.status] || 'planning'))
</script>

<style scoped>
.back-link { display: inline-block; margin-bottom: 1.5rem; text-decoration: none; }
.page-heading h1 { margin-top: 0.7rem; }
.project-status { display: inline-block; padding: 0.35rem 0.65rem; border-radius: 99px; font-size: 0.82rem; font-weight: 700; }
.project-status.running { background: #dcfce7; color: #166534; }
.project-status.done { background: #dbeafe; color: #1d4ed8; }
.project-status.planning { background: #fef3c7; color: #92400e; }
.project-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 2rem 0; }
.project-facts div { padding: 1rem; background: var(--skill-bg); border-radius: 0.6rem; }
.project-facts dt { margin-bottom: 0.35rem; color: var(--text-secondary); font-size: 0.85rem; }
.project-facts dd { overflow-wrap: anywhere; font-weight: 600; }
.related-articles { margin-top: 2rem; }
.related-articles h2 { margin-bottom: 0.75rem; font-size: 1.15rem; }
.related-articles ul { padding-left: 1.25rem; line-height: 1.9; }
</style>