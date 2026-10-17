<template>
  <section class="page-surface">
    <header class="page-heading">
      <h1>项目作品</h1>
      <p>按时间记录正在探索与已经完成的作品。</p>
    </header>
    <ProjectList :projects="projects" />
  </section>
</template>

<script setup>
import ProjectList from '../components/ProjectList.vue'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '../stores/project.js'

const { projects } = storeToRefs(useProjectStore())
</script>