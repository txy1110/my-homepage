<template>
  <section class="page-surface">
    <header class="page-heading">
      <h1>项目作品</h1>
      <p>按时间记录正在探索与已经完成的作品。</p>
    </header>
    <div class="search-field">
      <label for="project-search">查找项目</label>
      <input
        id="project-search"
        v-model="searchText"
        type="search"
        placeholder="输入项目名称、介绍、技术或状态关键词"
        autocomplete="off"
      >
    </div>
    <ProjectList
      :projects="filteredProjects"
      :empty-message="projects.length ? '没有找到匹配的项目，请尝试其他关键词。' : '暂无项目数据'"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import ProjectList from '../components/ProjectList.vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '../stores/project.js'

const { projects } = storeToRefs(useProjectStore())
const searchText = ref('')
// 在客户端对数据库返回的项目字段做不区分大小写的即时筛选。
const filteredProjects = computed(() => {
  const query = searchText.value.trim().toLocaleLowerCase()
  if (!query) return projects.value

  return projects.value.filter((project) =>
    [project.name, project.description, project.tech, project.status, project.period]
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
</style>