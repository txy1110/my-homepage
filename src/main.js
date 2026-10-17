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
// 要求 1、3：先注册 Pinia，页面组件与路由守卫才能访问同一份 Store。
app.use(pinia).use(router)

// 要求 5：全局注册项目中使用的 Element Plus 组件，所有页面模板均可直接使用。
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
