<template>
  <article v-if="article" class="page-surface article-detail">
    <RouterLink class="back-link" :to="{ name: 'articles' }">← 返回文章列表</RouterLink>
    <header class="page-heading">
      <p class="article-date">{{ article.createdAt }}</p>
      <h1>{{ article.title }}</h1>
      <p>{{ article.summary }}</p>
    </header>
    <div class="article-content">{{ article.content }}</div>
    <p v-if="project" class="article-project">
      相关项目：
      <RouterLink :to="{ name: 'project-detail', params: { id: project.id } }">{{ project.name }}</RouterLink>
    </p>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useArticleStore } from '../stores/article.js'
import { useProjectStore } from '../stores/project.js'

const props = defineProps({ id: { type: String, required: true } })
const articleStore = useArticleStore()
const projectStore = useProjectStore()
const { articles } = storeToRefs(articleStore)
const article = computed(() => articles.value.find((item) => item.id === props.id && item.published))
const project = computed(() => article.value?.projectId ? projectStore.getProjectById(article.value.projectId) : null)
</script>

<style scoped>
.back-link { display: inline-block; margin-bottom: 1.5rem; text-decoration: none; }
.article-content { white-space: pre-line; color: var(--text-secondary); line-height: 1.9; }
.article-date { color: var(--text-secondary); font-size: 0.88rem; }
.article-project { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); }
</style>
