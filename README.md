# 个人主页与内容管理

基于 Vue 3、Vue Router、Pinia、Vite 和 Element Plus 构建的个人主页，包含项目与文章展示、个人信息时间线，以及登录保护的内容管理后台。

## 本地运行

```sh
npm install
npm run dev
```

生产构建与本地预览：

```sh
npm run build
npm run preview
```

后台为课程演示登录：任意非空用户名和密码即可登录。它只用于展示路由守卫和共享状态，不是可用于真实服务的身份认证。

## Pinia Store 结构

Pinia 实例在应用入口注册；Vue DevTools 可在开发时查看 Store 状态、getters 和 actions，并追踪 action 调用。页面通过 `storeToRefs` 解构状态，避免失去响应性。

### 五项要求对应位置与验证方式

1. **安装、注册 Pinia 并创建 Store：**依赖见 `package.json`；实例在 `src/stores/pinia.js` 创建并由 `src/main.js` 注册；Store 位于 `src/stores/`。
2. **文章列表和管理页面：**`src/views/ArticlesPage.vue` 展示已发布文章；`src/views/AdminArticlesPage.vue` 管理文章；文章状态和增删改 action 定义在 `src/stores/article.js`。
3. **共享状态、持久化和登录守卫：**文章、项目、用户 Store 供公开页与管理页共用；`src/stores/persistence.js` 负责 `localStorage` 读写；`src/router/index.js` 检查登录态并保护后台页面。
4. **Vue DevTools 检查数据流：**`vite.config.js` 已启用 Vue DevTools 插件。运行 `npm run dev` 后打开 Vue DevTools 的 Pinia 面板，查看 `projects`、`articles`、`user` 三个 Store；在文章管理页新增文章，观察 `articles` 状态及 `addArticle` action，再打开文章列表确认共享数据；刷新页面后确认文章仍在，并在浏览器开发者工具的 Application/存储面板检查 `personal-home-articles`。后台登录/退出时可同样观察 `user` 状态变化。
5. **Element Plus 注册与页面改造：**`src/main.js` 全局注册项目使用的 Element Plus 组件；页面仅加载当前页面所需样式。导航和主页用法见 `src/components/AppHeader.vue`、`src/views/HomePage.vue`；后台表格、表单和对话框见 `src/views/AdminProjectsPage.vue`、`src/views/AdminArticlesPage.vue`。

| Store | state | getters | actions 与调用时机 |
| --- | --- | --- | --- |
| `projects`（`useProjectStore`） | `userInfo`、`avatarEmoji`、`skills`、`projects` | `projectCount`、`getProjectById(id)` | `updateProfile` 在后台保存个人资料时调用；`addProject`、`updateProject`、`deleteProject` 在项目管理新增、编辑、删除时调用。每次变更后写入 `personal-home-content`。 |
| `articles`（`useArticleStore`） | `articles` | `publishedArticles`、`publishedCount`、`getArticleById(id)`、`getArticlesByProject(projectId)` | `addArticle`、`updateArticle`、`deleteArticle` 在文章管理保存或删除时调用；公开文章列表、详情和项目详情读取这些共享数据。每次变更后写入 `personal-home-articles`。 |
| `user`（`useUserStore`） | `isLoggedIn`、`username` | `isAdmin` | 登录页调用 `login`，后台退出按钮调用 `logout`；路由守卫读取 `isLoggedIn` 控制 `/admin` 路由。状态保存在 `personal-home-user`。 |

内容与登录状态使用浏览器 `localStorage` 保存，因此会跨组件、页面和重新加载共享；清理浏览器站点数据会重置为演示初始内容。登录状态只属于本机浏览器。

## Element Plus 组件说明

项目按需引入并注册 Element Plus 组件，并通过表单校验、弹窗确认、表格操作和消息反馈实现交互：

| 组件 | 使用场景与作用 |
| --- | --- |
| `ElContainer`、`ElMain` | 组织个人主页的主体布局。 |
| `ElMenu`、`ElMenuItem` | 顶部导航，并与 Vue Router 路由集成。 |
| `ElTimeline`、`ElTimelineItem` | 展示个人学习与项目经历时间线。 |
| `ElCard` | 承载个人主页主要内容。 |
| `ElTable`、`ElTableColumn` | 列出后台项目和文章以及可操作字段。 |
| `ElDialog` | 承载项目、文章的新增和编辑表单。 |
| `ElForm`、`ElFormItem` | 管理表单字段布局和必填/格式校验。 |
| `ElInput` | 输入标题、简介、项目资料和文章正文。 |
| `ElSelect`、`ElOption` | 选择项目状态以及文章关联项目。 |
| `ElDatePicker` | 选择文章发布日期。 |
| `ElSwitch` | 切换文章已发布或草稿状态。 |
| `ElButton` | 执行新增、保存、编辑和删除操作。 |
| `ElTag` | 标记项目状态、文章发布状态。 |
| `ElMessage`、`ElMessageBox` | 显示操作结果，并在删除前确认。 |
| `ElEmpty` | 在项目或文章列表为空时展示空状态。 |

Element Plus 文档：[组件总览](https://element-plus.org/zh-CN/component/overview.html)。组件属性通过 props 配置，交互通过事件监听，表格、对话框等可通过具名插槽自定义内容。

## GitHub Pages 部署

仓库包含 GitHub Actions Pages 工作流：推送到 `main` 或 `master` 后自动构建并部署，也可在 Actions 页面手动运行 `Deploy to GitHub Pages`。

1. 将项目推送到 GitHub 仓库。
2. 在仓库的 **Settings → Pages → Build and deployment** 中，将 Source 设为 **GitHub Actions**。
3. 确认 Actions 工作流完成；页面地址为 `https://<GitHub用户名>.github.io/<仓库名>/`。

路由采用 hash 模式，支持 GitHub Pages 的静态托管和直接打开子页面。当前工作区没有配置 GitHub 远程仓库，因此尚未实际推送或发布；配置仓库并完成上述步骤后才能得到可访问的线上链接。
