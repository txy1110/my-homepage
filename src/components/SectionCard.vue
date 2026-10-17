<template>
  <section class="section-card">
    <header class="section-header">
      <div class="header-copy">
        <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
      </div>
      <slot name="header-extra" />
    </header>

    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  eyebrow: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.section-card {
  margin-top: 1.8rem;
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  padding: 1.5rem;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.header-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 700;
}
.section-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
}
.section-body {
  width: 100%;
}
@media (max-width: 600px) {
  .section-card {
    padding: 1.1rem;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
