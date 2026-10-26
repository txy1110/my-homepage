import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import pinia from './stores/pinia.js'
import {
  ElButton,
  ElCard,
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTimeline,
  ElTimelineItem
} from 'element-plus'
import 'element-plus/theme-chalk/el-var.css'
import 'element-plus/theme-chalk/el-reset.css'
import 'element-plus/theme-chalk/el-card.css'
import 'element-plus/theme-chalk/el-container.css'
import 'element-plus/theme-chalk/el-icon.css'
import 'element-plus/theme-chalk/el-main.css'
import 'element-plus/theme-chalk/el-menu.css'
import 'element-plus/theme-chalk/el-menu-item.css'
import 'element-plus/theme-chalk/el-timeline.css'
import 'element-plus/theme-chalk/el-timeline-item.css'

const app = createApp(App)
// 先注册 Pinia，再注册路由，确保路由守卫执行时可以访问共享 Store。
app.use(pinia).use(router)

// 项目采用显式的按需组件清单，避免把 Element Plus 的全部组件都注册进应用。
for (const component of [
  ElButton,
  ElCard,
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElInput,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElOption,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTimeline,
  ElTimelineItem
]) {
  app.use(component)
}

app.mount('#app')
