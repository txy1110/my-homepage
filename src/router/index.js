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
    // 公开页面按需加载，避免首屏加载时打包所有页面代码。
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

router.beforeEach(async (to) => {
  const userStore = useUserStore(pinia)
  const articleStore = useArticleStore(pinia)

  // 进入登录页或后台时恢复服务端会话，刷新页面后仍按真实登录态决定权限。
  if ((to.meta.requiresAdmin || to.name === 'login') && !userStore.isLoggedIn) {
    try {
      await userStore.restoreSession()
    } catch {
      if (to.meta.requiresAdmin) {
        return { name: 'login', query: { redirect: to.fullPath } }
      }
    }
  }
  if (to.meta.requiresAdmin && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !articleStore.adminLoaded) {
    await articleStore.loadAdmin()
  }
  // 已登录用户访问登录页时直接返回管理页，避免重复认证。
  if (to.name === 'login' && userStore.isLoggedIn) return { name: 'admin-profile' }
})

let currentPageTitle = '个人主页'
let currentProjectId = ''
let titleWatcherStarted = false

function updateDocumentTitle() {
  // 项目详情页优先使用项目名，其它页面使用路由标题并附加站点姓名。
  const projectStore = useProjectStore(pinia)
  const project = currentProjectId ? projectStore.getProjectById(currentProjectId) : null
  document.title = `${project?.name || currentPageTitle} · ${projectStore.userInfo.name}`
}

router.afterEach((to) => {
  currentPageTitle = to.meta.title || '个人主页'
  currentProjectId = to.name === 'project-detail' ? String(to.params.id) : ''
  updateDocumentTitle()
  // 只安装一次姓名监听，资料修改后浏览器标题能自动更新。
  if (!titleWatcherStarted) {
    titleWatcherStarted = true
    watch(() => useProjectStore(pinia).userInfo.name, updateDocumentTitle)
  }
})

export default router