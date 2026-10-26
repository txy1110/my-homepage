<template>
  <section class="page-surface">
    <header class="page-heading">
      <h1>文章列表</h1>
      <p>记录前端学习、项目实践与日常思考。</p>
    </header>
    <div class="search-field">
      <label for="article-search">查找文章</label>
      <input
        id="article-search"
        v-model="searchText"
        type="search"
        placeholder="输入标题、摘要或正文关键词"
        autocomplete="off"
      >
    </div>
    <div v-if="filteredArticles.length" class="article-list">
      <article v-for="article in filteredArticles" :key="article.id" class="article-card">
        <p class="article-date">{{ article.createdAt }}</p>
        <h2><RouterLink :to="{ name: 'article-detail', params: { id: article.id } }">{{ article.title }}</RouterLink></h2>
        <p>{{ article.summary }}</p>
        <RouterLink class="article-more" :to="{ name: 'article-detail', params: { id: article.id } }">阅读全文 →</RouterLink>
      </article>
    </div>
    <p v-else-if="publishedArticles.length" class="empty-message">没有找到匹配的文章，请尝试其他关键词。</p>
    <p v-else class="empty-message">暂无已发布文章。</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useArticleStore } from '../stores/article.js'

// 要求 2、3：公开文章列表从 Article Store 读取已发布文章，不再维护组件局部文章数据。
const { publishedArticles } = storeToRefs(useArticleStore())
const searchText = ref('')
// 只在公开文章集合中按标题、摘要、正文或日期检索。
const filteredArticles = computed(() => {
  const query = searchText.value.trim().toLocaleLowerCase()
  if (!query) return publishedArticles.value

  return publishedArticles.value.filter((article) =>
    [article.title, article.summary, article.content, article.createdAt]
      .some((value) => value?.toLocaleLowerCase().includes(query))
  )
})
</script>

<style scoped>
.search-field { display: grid; gap: 0.45rem; margin-bottom: 1.25rem; }
.search-field label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; }
.search-field input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text-primary);
}
.search-field input:focus { outline: 2px solid var(--accent-soft); border-color: var(--accent); }
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
