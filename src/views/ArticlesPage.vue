<template>
  <section class="page-surface">
    <header class="page-heading">
      <h1>文章列表</h1>
      <p>记录前端学习、项目实践与日常思考。</p>
    </header>
    <div v-if="publishedArticles.length" class="article-list">
      <article v-for="article in publishedArticles" :key="article.id" class="article-card">
        <p class="article-date">{{ article.createdAt }}</p>
        <h2><RouterLink :to="{ name: 'article-detail', params: { id: article.id } }">{{ article.title }}</RouterLink></h2>
        <p>{{ article.summary }}</p>
        <RouterLink class="article-more" :to="{ name: 'article-detail', params: { id: article.id } }">阅读全文 →</RouterLink>
      </article>
    </div>
    <p v-else class="empty-message">暂无已发布文章。</p>
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useArticleStore } from '../stores/article.js'

// 要求 2、3：公开文章列表从 Article Store 读取已发布文章，不再维护组件局部文章数据。
const { publishedArticles } = storeToRefs(useArticleStore())
</script>

<style scoped>
.article-list { display: grid; gap: 1rem; }
.article-card { padding: 1.25rem; border: 1px solid var(--border); border-radius: 0.75rem; }
.article-card h2 { margin: 0.4rem 0; font-size: 1.2rem; }
.article-card h2 a { color: var(--text-primary); text-decoration: none; }
.article-card h2 a:hover { color: var(--accent); }
.article-card > p:not(.article-date) { color: var(--text-secondary); line-height: 1.7; }
.article-date { color: var(--text-secondary); font-size: 0.85rem; }
.article-more { display: inline-block; margin-top: 0.75rem; font-weight: 600; text-decoration: none; }
.empty-message { color: var(--text-secondary); }
</style>
