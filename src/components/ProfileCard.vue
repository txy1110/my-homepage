<template>
  <div class="header">
    <!-- 头像 -->
    <div
      class="avatar"
      :title="'我是 ' + userInfo.name"
      :data-name="userInfo.name"
    >
      {{ avatarEmoji }}
    </div>

    <div class="info">
      <h1 :title="'姓名：' + userInfo.name" :data-title="userInfo.title">
        {{ userInfo.name }}
      </h1>
      <div class="title" :title="'职位：' + userInfo.title">
        {{ userInfo.title }}
      </div>
      <div class="bio" :title="userInfo.bio" :data-bio="userInfo.bio">
        {{ userInfo.bio }}
      </div>
    </div>
  </div>
</template>

<script setup>
// 用 defineProps 接收父组件传入的个人信息
defineProps({
  userInfo: {
    type: Object,
    required: true
  },
  avatarEmoji: {
    type: String,
    default: '👩‍💻'
  }
})
</script>

<style scoped>
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.8rem;
  margin-bottom: 1.8rem;
}
.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: var(--accent-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.2rem;
  border: 3px solid var(--accent);
  color: var(--accent);
  flex-shrink: 0;
}
.info h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.info .title {
  font-size: 1.1rem;
  color: var(--accent);
  font-weight: 500;
  margin-bottom: 0.6rem;
}
.info .bio {
  color: var(--text-secondary);
  font-size: 0.95rem;
}
</style>