import { createRouter, createWebHashHistory } from 'vue-router'
import { watch } from 'vue'
import NotFoundPage from '../components/NotFoundPage.vue'
import { useArticleStore } from '../stores/article.js'
import { useProjectStore } from '../stores/project.js'
import pinia from '../stores/pinia.js'
import { useUserStore } from '../stores/user.js'

const router = createRouter({
  // 使用 hash 路由，静态部署到 GitHub Pages 子路径时无需服务器回退配置。
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomePage.vue'),
      meta: { title: '个人主页', nav: 'home' }
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsPage.vue'),
      meta: { title: '项目作品', nav: 'projects' }
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: () => import('../views/ProjectDetailPage.vue'),
      props: true,
      meta: { title: '项目详情', nav: 'projects' }
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('../views/ArticlesPage.vue'),
      meta: { title: '文章列表', nav: 'articles' }
    },
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: () => import('../views/ArticleDetailPage.vue'),
      props: true,
      meta: { title: '文章详情', nav: 'articles' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginPage.vue'),
      meta: { title: '管理登录' }
    },
    {
      path: '/admin',
      component: () => import('../views/AdminLayout.vue'),
      // 后台父路由的权限标记会由全局守卫统一检查。
      meta: { requiresAdmin: true, nav: 'admin' },
      children: [
        { path: '', redirect: { name: 'admin-profile' } },
        {
          path: 'profile',
          name: 'admin-profile',
          component: () => import('../views/AdminProfilePage.vue'),
          meta: { title: '个人资料管理' }
        },
        {
          path: 'projects',
          name: 'admin-projects',
          component: () => import('../views/AdminProjectsPage.vue'),
          meta: { title: '项目管理' }
        },
        {
          path: 'articles',
          name: 'admin-articles',
          component: () => import('../views/AdminArticlesPage.vue'),
          meta: { title: '文章管理' }
        }
      ]
    },
    { path: '/404', name: 'not-found', component: NotFoundPage, meta: { title: '页面未找到' } },
    { path: '/:pathMatch(.*)*', redirect: { name: 'not-found' } }
  ]
})

router.beforeEach((to) => {
  // 要求 3：路由守卫读取持久化的 User Store 登录态，未登录访问后台时转到登录页。
  const userStore = useUserStore(pinia)
  const projectStore = useProjectStore(pinia)
  const articleStore = useArticleStore(pinia)

  // 避免访问已删除或不存在的项目，以及未发布/不存在的文章详情。
  if (to.name === 'project-detail' && !projectStore.getProjectById(to.params.id)) {
    return { name: 'not-found' }
  }
  if (to.name === 'article-detail') {
    const article = articleStore.getArticleById(to.params.id)
    if (!article || !article.published) return { name: 'not-found' }
  }
  if (to.meta.requiresAdmin && !userStore.isLoggedIn) {
    // 登录成功后回到用户原本想访问的后台地址。
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && userStore.isLoggedIn) return { name: 'admin-profile' }
})

let currentPageTitle = '个人主页'
let currentProjectId = ''
let titleWatcherStarted = false

function updateDocumentTitle() {
  const projectStore = useProjectStore(pinia)
  const project = currentProjectId ? projectStore.getProjectById(currentProjectId) : null
  document.title = `${project?.name || currentPageTitle} · ${projectStore.userInfo.name}`
}

router.afterEach((to) => {
  currentPageTitle = to.meta.title || '个人主页'
  currentProjectId = to.name === 'project-detail' ? String(to.params.id) : ''
  updateDocumentTitle()
  if (!titleWatcherStarted) {
    titleWatcherStarted = true
    watch(() => useProjectStore(pinia).userInfo.name, updateDocumentTitle)
  }
})

export default router