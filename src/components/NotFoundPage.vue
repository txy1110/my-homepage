<template>
  <main class="not-found">
    <div class="not-found__topline">
      <RouterLink class="not-found__brand" :to="{ name: 'home' }" aria-label="返回个人主页">TX.YI</RouterLink>
      <span class="not-found__status">错误代码 404</span>
    </div>

    <section class="not-found__content" aria-labelledby="not-found-title">
      <div class="not-found__number" aria-hidden="true">404</div>
      <div class="not-found__message">
        <p class="not-found__eyebrow">页面走丢了</p>
        <h1 id="not-found-title">这里暂时<br>什么也没有。</h1>
        <p class="not-found__description">你访问的页面不存在，或许它已经搬到别处了。</p>
        <RouterLink class="not-found__home" :to="{ name: 'home' }">
          <span aria-hidden="true">←</span>
          返回个人主页
        </RouterLink>
      </div>
    </section>

    <footer class="not-found__footer">
      <span>田兴亿 · 个人主页</span>
      <span>重庆 · 中国</span>
    </footer>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found {
  --not-found-ink: #172b3a;
  --not-found-muted: #63727a;
  --not-found-accent: #c45135;
  --not-found-line: rgba(23, 43, 58, 0.2);
  min-height: 100vh;
  padding: 2rem clamp(1.25rem, 6vw, 6rem) 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  color: var(--not-found-ink);
  background-color: #f2f0e9;
  background-image: radial-gradient(rgba(23, 43, 58, 0.12) 0.7px, transparent 0.7px);
  background-size: 8px 8px;
}

.not-found__topline,
.not-found__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.not-found__brand {
  color: inherit;
  font-size: 1rem;
  font-weight: 800;
  text-decoration: none;
}

.not-found__status,
.not-found__footer {
  color: var(--not-found-muted);
  font-size: 0.8rem;
}

.not-found__content {
  width: min(100%, 1040px);
  min-height: min(68vh, 620px);
  margin: 2rem auto;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  align-items: center;
  gap: clamp(1rem, 5vw, 5rem);
}

.not-found__number {
  color: var(--not-found-accent);
  font-size: 18rem;
  font-weight: 900;
  line-height: 0.78;
  transform: rotate(-7deg);
  user-select: none;
  animation: arrive 700ms cubic-bezier(0.2, 0.75, 0.3, 1) both;
}

.not-found__message {
  max-width: 360px;
  animation: arrive 700ms 100ms cubic-bezier(0.2, 0.75, 0.3, 1) both;
}

.not-found__eyebrow {
  margin-bottom: 1rem;
  color: var(--not-found-accent);
  font-size: 0.85rem;
  font-weight: 700;
}

.not-found__message h1 {
  font-size: 3rem;
  line-height: 1.12;
}

.not-found__description {
  margin-top: 1.25rem;
  color: var(--not-found-muted);
  line-height: 1.8;
}

.not-found__home {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 2rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--not-found-accent);
  color: var(--not-found-ink);
  font-weight: 700;
  text-decoration: none;
}

.not-found__home span {
  color: var(--not-found-accent);
  font-size: 1.2rem;
  transition: transform 180ms ease;
}

.not-found__home:hover span {
  transform: translateX(-4px);
}

.not-found__footer {
  padding-top: 1rem;
  border-top: 1px solid var(--not-found-line);
}

@keyframes arrive {
  from {
    opacity: 0;
    translate: 0 18px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@media (max-width: 680px) {
  .not-found {
    padding-top: 1.25rem;
  }

  .not-found__content {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .not-found__number {
    font-size: 10rem;
  }

  .not-found__message h1 {
    font-size: 2.2rem;
  }

  .not-found__message {
    margin-left: 0.5rem;
  }
}

@media (max-width: 380px) {
  .not-found__number {
    font-size: 8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>