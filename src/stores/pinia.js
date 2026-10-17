import { createPinia } from 'pinia'

// 要求 1：在 stores 目录创建并导出 Pinia 实例，供入口和路由守卫共用。
const pinia = createPinia()

export default pinia
