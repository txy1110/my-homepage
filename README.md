# 个人主页与内容管理

基于 Vue 3、Vue Router、Pinia、Vite 和 Element Plus 构建的个人主页，包含项目与文章展示、个人信息时间线，以及登录保护的内容管理后台。

## 本地运行

先在一个终端启动数据库 API：

```sh
cd server
npm install
npm run dev
```

再在项目根目录的另一个终端启动前端：

```sh
npm install
npm run dev
```

生产构建与本地预览：

```sh
npm run build
npm run preview
```

后台使用服务端认证；默认用户名为 `admin`，密码为 `server/.env` 中配置的 `ADMIN_API_TOKEN`。

## Pinia Store 结构

Pinia 实例在应用入口注册；Vue DevTools 可在开发时查看 Store 状态、getters 和 actions，并追踪 action 调用。页面通过 `storeToRefs` 解构状态，避免失去响应性。

### 五项要求对应位置与验证方式

1. **安装、注册 Pinia 并创建 Store：**依赖见 `package.json`；实例在 `src/stores/pinia.js` 创建并由 `src/main.js` 注册；Store 位于 `src/stores/`。
2. **文章列表和管理页面：**`src/views/ArticlesPage.vue` 展示已发布文章；`src/views/AdminArticlesPage.vue` 管理文章；文章状态和增删改 action 定义在 `src/stores/article.js`。
3. **共享状态、数据库持久化和登录守卫：**文章、项目、用户 Store 供公开页与管理页共用；`src/services/api.js` 封装 Axios 实例、统一成功/错误处理并调用 Express API，MySQL 保存资料、技能、项目和文章；`src/router/index.js` 检查服务端登录态并保护后台页面。
4. **Vue DevTools 检查数据流：**`vite.config.js` 已启用 Vue DevTools 插件。运行前端与后端后打开 Vue DevTools 的 Pinia 面板，查看 `projects`、`articles`、`user` 三个 Store；在文章管理页新增文章，观察 `articles` 状态及 `addArticle` action，再刷新页面检查文章仍由数据库返回；也可通过 MySQL 查询 `personal_homepage.articles` 验证持久化。后台登录/退出时可同样观察 `user` 状态变化。
5. **Element Plus 注册与页面改造：**`src/main.js` 全局注册项目使用的 Element Plus 组件；页面仅加载当前页面所需样式。导航和主页用法见 `src/components/AppHeader.vue`、`src/views/HomePage.vue`；后台表格、表单和对话框见 `src/views/AdminProjectsPage.vue`、`src/views/AdminArticlesPage.vue`。

| Store | state | getters | actions 与调用时机 |
| --- | --- | --- | --- |
| `projects`（`useProjectStore`） | `profileId`、`userInfo`、`avatarEmoji`、`skills`、`projects` | `projectCount`、`getProjectById(id)` | `load` 从 API 加载资料、技能和项目；`updateProfile`、`addProject`、`updateProject`、`deleteProject` 调用 API 并在成功后同步 Store。 |
| `articles`（`useArticleStore`） | `articles`、`loaded`、`adminLoaded` | `publishedArticles`、`publishedCount`、`getArticleById(id)`、`getArticlesByProject(projectId)` | `load` 读取公开文章；管理员使用 `loadAdmin` 读取草稿，增删改 action 通过 API 写入数据库。 |
| `user`（`useUserStore`） | `isLoggedIn`、`username` | `isAdmin` | 登录页调用服务端 `login`，后台退出按钮调用 `logout`；路由守卫通过服务端会话检查并保护 `/admin` 路由。 |

页面内容由 MySQL 持久化；登录令牌仅保存在当前标签页的 `sessionStorage`，服务端重启后会话失效。

## 数据库表设计

MySQL 5.7+ 建表脚本位于 [`database/schema.sql`](./database/schema.sql)，包含个人资料、技能、项目和文章四张表。字段依据当前 Store 与管理表单设计；项目编号和文章编号保留为字符串主键，以兼容现有详情页路由。首次初始化可从 `server` 目录运行 `npm run db:seed` 导入默认内容。

| 表 | 主要字段 | 主键与关系 |
| --- | --- | --- |
| `profiles` | 姓名、称谓、简介、邮箱、城市、生日、职业、头像 | `id` 主键；个人资料拥有技能、项目和文章 |
| `skills` | 技能名称、排序 | `id` 主键；`profile_id` 外键指向 `profiles.id`；同一资料下技能名称唯一 |
| `projects` | 项目编号、名称、简介、状态、技术栈、项目周期 | 字符串 `id` 主键；`profile_id` 外键指向 `profiles.id` |
| `articles` | 文章编号、标题、摘要、正文、发布日期、发布状态 | 字符串 `id` 主键；`profile_id` 外键指向 `profiles.id`；可选 `project_id` 外键关联项目 |

删除个人资料时，其技能、项目和文章会级联删除；删除项目时，相关文章保留但 `project_id` 设为 `NULL`。项目周期保留为字符串，以兼容“2025.11 - 至今”这类现有展示格式；文章发布日期使用 `DATE`，与表单的 `YYYY-MM-DD` 格式对应。管理员认证由服务端会话完成，密码通过环境变量配置，不存入数据库。字段类型、主外键关系和完整 API 参数清单见[数据库与 API 验收说明](./docs/database-api-acceptance.md)。

## Node.js API 服务

后端位于 [`server/`](./server/)，使用 Node.js、Express、mysql2 和 cors；数据库配置通过环境变量提供，不将密码提交到仓库。先执行上面的数据库脚本，然后在项目根目录运行：

```sh
cd server
npm install
```

首次使用时运行 `npm run db:seed`，将主页默认资料、6 个技能、3 个项目和 2 篇文章写入空数据库；若已有个人资料，脚本会跳过，不覆盖现有内容。

将 `server/.env.example` 复制为 `server/.env`，按本机 MySQL 配置填写 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`。`ADMIN_USERNAME` 默认为 `admin`，登录密码为环境变量 `ADMIN_API_TOKEN`；请将该值替换为随机强令牌，例如运行 `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` 生成，再启动开发服务器：

```sh
npm run dev
```

默认监听 `http://localhost:3000`，CORS 默认允许 Vite 开发地址 `http://localhost:5173`。Vite 开发服务器将 `/api` 代理至该后端。所有成功响应均为 `{"success":true,"data":...}`；所有错误响应均为 `{"success":false,"error":{"code":"...","message":"..."}}`。创建成功返回 HTTP 201；参数错误、未登录、资源不存在、冲突和服务器错误分别使用相应 HTTP 状态码。

API 使用 apidoc 注释生成文档。进入 `server` 目录执行 `npm run docs:api`，生成页面至 `docs/apidoc/index.html`；后端启动后可在 `http://localhost:3000/docs/api/` 查看已生成的交互式[接口文档](./docs/apidoc/index.html)。注释来源为 `server/src/api-docs.js`。

| 资源 | 查询 | 新增 | 修改 | 删除 |
| --- | --- | --- | --- | --- |
| 个人资料 | `GET /api/profile`、`GET /api/profile/:id` | `POST /api/profile` | `PUT /api/profile/:id` | `DELETE /api/profile/:id` |
| 技能 | `GET /api/skills?profileId=:id`、`GET /api/skills/:id` | `POST /api/skills` | `PUT /api/skills/:id` | `DELETE /api/skills/:id` |
| 项目 | `GET /api/projects`、`GET /api/projects/:id` | `POST /api/projects` | `PUT /api/projects/:id` | `DELETE /api/projects/:id` |
| 文章 | `GET /api/articles`、`GET /api/articles/:id` | `POST /api/articles` | `PUT /api/articles/:id` | `DELETE /api/articles/:id` |

内容管理顶部的“导出全部数据”按钮调用受管理员会话保护的 `GET /api/export`，将完整资料、技能、项目和文章（包括草稿）下载为带导出时间的 JSON 文件。

文章公开查询仅返回已发布内容；可通过 `?projectId=<项目编号>` 筛选。管理端查询草稿使用 `GET /api/articles/manage` 和 `GET /api/articles/manage/:id`。所有新增、修改、删除接口，以及文章管理查询，都要求在 `Authorization` 请求头中使用登录接口返回的短期 Bearer 会话令牌；管理密码只发送给服务端登录接口，令牌不写入公开前端代码。修改接口采用完整资源字段的 `PUT` 请求。SQL 均使用参数化查询；路由会校验字段、日期、状态和资源关系。

写请求 JSON 字段：资料为 `name`、`title`、`bio`、`email`、`city`、可空 `birthday`、`job`、`avatarEmoji`；技能为 `profileId`、`name`、可选 `sortOrder`；项目为 `id`、`profileId`、`name`、`description`、`status`、`tech`、`period`；文章为 `id`、`profileId`、可空 `projectId`、`title`、`summary`、`content`、`createdAt`（`YYYY-MM-DD`）、`published`。成功响应示例：`{"success":true,"data":{"id":"personal-blog"}}`。运行后端单元测试时进入 `server` 目录并执行 `npm test`。

### 使用 Apifox / Postman 测试

测试资产在 [`server/apifox/`](./server/apifox/)：

1. 在 Apifox 或 Postman 分别导入 `personal-home.postman_collection.json` 与 `personal-home.postman_environment.json`。
2. 确认 MySQL 和 API 已启动，并在工具中选中“个人主页本地接口环境”。
3. 在工具中复制/另存一份本地环境，填写 `adminPassword`；其值与 `server/.env` 中的 `ADMIN_API_TOKEN` 相同。不要导出或提交包含密码、会话令牌的本地环境文件。
4. 按顺序运行“个人主页 API 接口测试”整个集合。共 29 个请求，覆盖健康检查、登录鉴权、公开查询、四类资源 CRUD、数据导出、草稿访问控制及统一错误格式（含参数错误）。CRUD 使用临时记录，完整运行时会清理测试数据。

本地已通过 Newman 对该集合完成 29 个请求与断言测试；课程提交截图请从实际运行的 Apifox 或 Postman 客户端窗口截取。仓库不使用生成的结果页或合成图片代替客户端截图。

前端使用 Axios 请求 API，启动时加载公开资料、项目和文章；管理界面的资料、技能、项目和文章增删改均写入 MySQL，成功后同步 Pinia Store。Axios 响应拦截器统一拆出成功响应的数据，并将服务端错误标准化为 `ApiError`；网络失败也会明确报错。浏览器只在当前标签页保存短期登录会话，数据库是内容的持久化来源。登录接口在服务端校验管理员用户名和 `ADMIN_API_TOKEN`，返回服务进程内的短期会话令牌；重启 API 后需重新登录。旧版本 `localStorage` 中的用户改动不会自动导入，数据库首次初始化使用项目默认主页数据。删除个人资料会级联删除其技能、项目和文章；删除项目会保留文章并清空关联项目。

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
