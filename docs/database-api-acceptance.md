# 个人主页数据库与 API 验收说明

## 1. 数据库与表结构

数据库为 `personal_homepage`，使用 MySQL 5.7+、InnoDB 和 `utf8mb4`。建表脚本：[schema.sql](../database/schema.sql)。

| 表 | 字段 | 类型 | 约束/说明 |
| --- | --- | --- | --- |
| `profiles` | `id` | `BIGINT UNSIGNED AUTO_INCREMENT` | 主键 |
| | `name` | `VARCHAR(80)` | 姓名，非空 |
| | `title` | `VARCHAR(120)` | 头衔，非空 |
| | `bio` | `TEXT` | 简介，非空 |
| | `email` | `VARCHAR(254)` | 邮箱，非空 |
| | `city` | `VARCHAR(100)` | 城市，非空 |
| | `birthday` | `DATE` | 生日，可空 |
| | `job` | `VARCHAR(100)` | 职业，非空 |
| | `avatar_emoji` | `VARCHAR(32)` | 头像字符，非空，默认空字符串 |
| | `created_at`、`updated_at` | `TIMESTAMP` | 创建时间、自动维护的更新时间 |
| `skills` | `id` | `BIGINT UNSIGNED AUTO_INCREMENT` | 主键 |
| | `profile_id` | `BIGINT UNSIGNED` | 外键 → `profiles.id`；删除资料时级联删除 |
| | `name` | `VARCHAR(80)` | 技能名称；与 `profile_id` 组成唯一约束 |
| | `sort_order` | `INT UNSIGNED` | 排序值，默认 `0` |
| | `created_at` | `TIMESTAMP` | 创建时间 |
| `projects` | `id` | `VARCHAR(80)` | 项目编号，主键，匹配前端详情页标识 |
| | `profile_id` | `BIGINT UNSIGNED` | 外键 → `profiles.id`；删除资料时级联删除 |
| | `name` | `VARCHAR(80)` | 项目名称，非空 |
| | `description` | `VARCHAR(500)` | 项目简介，非空 |
| | `status` | `ENUM('进行中','已完成','规划中')` | 项目状态 |
| | `tech` | `VARCHAR(120)` | 技术栈，非空 |
| | `period` | `VARCHAR(60)` | 项目周期文本，支持“至今”等展示格式 |
| | `created_at`、`updated_at` | `TIMESTAMP` | 创建时间、自动维护的更新时间 |
| `articles` | `id` | `VARCHAR(100)` | 文章编号，主键 |
| | `profile_id` | `BIGINT UNSIGNED` | 外键 → `profiles.id`；删除资料时级联删除 |
| | `project_id` | `VARCHAR(80)` | 可空外键 → `projects.id`；删除项目时设为 `NULL` |
| | `title` | `VARCHAR(100)` | 标题，非空 |
| | `summary` | `VARCHAR(240)` | 摘要，非空 |
| | `content` | `TEXT` | 正文，非空 |
| | `publish_date` | `DATE` | 发布日期，非空 |
| | `published` | `BOOLEAN` | 是否公开，默认 `FALSE` |
| | `created_at`、`updated_at` | `TIMESTAMP` | 创建时间、自动维护的更新时间 |

关系：`profiles 1:N skills`、`profiles 1:N projects`、`profiles 1:N articles`、`projects 1:N articles`（文章项目关系可空）。删除项目会保留文章并清除其项目关联。

## 2. 创建与初始数据

```powershell
mysql -u <数据库用户> -p < database\schema.sql
cd server
npm run db:seed
```

`db:seed` 仅在资料表为空且其他内容表也没有记录时导入初始数据；如果已有资料则不覆盖。当前本机数据库创建结果：1 个资料、6 个技能、3 个项目、2 篇文章。

## 3. REST API 约定

- 默认地址：`http://localhost:3000/api`；Vite 开发代理地址：`http://localhost:5173/api`。
- apidoc 文档页面：`http://localhost:3000/docs/api/`；在 `server` 目录运行 `npm run docs:api` 可重新生成。
- 成功统一格式：`{"success":true,"data":...}`。
- 错误统一格式：`{"success":false,"error":{"code":"...","message":"..."}}`。
- 集合查询没有匹配记录时返回 `200` 和空数组 `data: []`；单项详情不存在时返回 `404 RESOURCE_NOT_FOUND` 与明确 `message`，避免把“列表为空”和“资源不存在”混为一类。
- 成功查询/修改/删除返回 HTTP `200`；创建返回 `201`；客户端校验 `400`；未认证 `401`；未找到 `404`；唯一冲突或资源仍被引用 `409`；未配置登录 `503`；未预期服务器错误 `500`。
- 后台写请求及文章管理草稿查询需要请求头 `Authorization: Bearer {sessionToken}`。登录凭据只在服务端校验；令牌只保存在当前浏览器标签页。
- 请求体为 JSON。所有 SQL 使用 mysql2 参数化查询。

### 认证

| 方法与路径 | 参数 | 权限 | 成功响应 |
| --- | --- | --- | --- |
| `GET /health` | 无（完整 URL：`/api/health`） | 公开 | `200 {"success":true,"data":{"status":"ok"}}` |
| `POST /auth/login` | JSON：`username: string`、`password: string` | 公开 | `200`，`data.token`、`data.expiresIn`、`data.username`；错误凭据 `401`，登录未配置 `503` |
| `GET /auth/me` | 请求头 `Authorization: Bearer {sessionToken}` | 管理员 | `200 {"success":true,"data":{"username":"admin"}}`；无效会话 `401` |
| `POST /auth/logout` | 请求头 `Authorization: Bearer {sessionToken}` | 管理员 | `200 {"success":true,"data":{"loggedOut":true}}` |

### 个人资料

| 方法与路径 | 参数/请求体 | 成功返回 |
| --- | --- | --- |
| `GET /profile` | 无 | 第一份资料对象，包含 `id`、资料字段及技能名称数组 `skills`；无资料时 `404 RESOURCE_NOT_FOUND` |
| `GET /profile/:id` | 路径：正整数资料 ID | 对应资料对象；无此 ID 时 `404` |
| `POST /profile` | 管理员；`name`、`title`、`bio`、`email`、`city`、`birthday`（`YYYY-MM-DD` 或 `null`）、`job`、可选 `avatarEmoji`、可选 `skills: string[]`（缺省为空数组） | `201`，新资料对象；技能与资料在同一事务内创建 |
| `PUT /profile/:id` | 管理员；同创建字段 | `200`，更新后的资料对象；缺省 `skills` 为空数组并整体替换 |
| `DELETE /profile/:id` | 管理员；路径：正整数资料 ID | `200 {"success":true,"data":{"id":"..."}}`；技能、项目和文章级联删除 |

### 技能

| 方法与路径 | 参数/请求体 | 成功返回 |
| --- | --- | --- |
| `GET /skills` | 可选查询：`profileId` 正整数 | 技能对象数组：`id`、`profileId`、`name`、`sortOrder`；非法参数返回 `400` |
| `GET /skills/:id` | 路径：技能正整数 ID | 单个技能对象；无此 ID 时 `404` |
| `POST /skills` | 管理员；JSON：`profileId`、`name`、可选 `sortOrder`（0 至 4294967295） | `201`，新技能对象 |
| `PUT /skills/:id` | 管理员；同创建字段 | `200`，更新后的技能对象 |
| `DELETE /skills/:id` | 管理员；路径：技能正整数 ID | `200`，删除的 ID |

### 项目

| 方法与路径 | 参数/请求体 | 成功返回 |
| --- | --- | --- |
| `GET /projects` | 无 | 项目对象数组：`id`、`profileId`、`name`、`description`、`status`、`tech`、`period` |
| `GET /projects/:id` | 路径：项目字符串编号 | 项目对象；无此项目时 `404 RESOURCE_NOT_FOUND` |
| `POST /projects` | 管理员；JSON：`id`（小写字母/数字/连字符）、`profileId`、`name`、`description`、`status`（`进行中`/`已完成`/`规划中`）、`tech`、`period` | `201`，新项目对象 |
| `PUT /projects/:id` | 管理员；请求体字段同创建，路径 ID 为准，不可改 ID | `200`，更新后的项目对象 |
| `DELETE /projects/:id` | 管理员；路径：项目编号 | `200`，删除的 ID；文章项目外键自动置空 |

### 文章

| 方法与路径 | 参数/请求体 | 成功返回 |
| --- | --- | --- |
| `GET /articles` | 可选查询：`projectId` 项目编号 | 已发布文章数组；可按项目筛选，重复参数返回 `400` |
| `GET /articles/:id` | 路径：文章编号 | 已发布文章对象；草稿与不存在文章统一 `404` |
| `GET /articles/manage` | 管理员 | 全部文章，包括草稿 |
| `GET /articles/manage/:id` | 管理员；路径：文章编号 | 单篇文章，包括草稿 |
| `POST /articles` | 管理员；JSON：`id`、`profileId`、可空 `projectId`、`title`、`summary`、`content`、`createdAt`（`YYYY-MM-DD`）、`published: boolean` | `201`，新文章对象 |
| `PUT /articles/:id` | 管理员；请求体与创建相同，路径 ID 为准 | `200`，更新后的文章对象 |
| `DELETE /articles/:id` | 管理员；路径：文章编号 | `200`，删除的 ID |

### 全量数据导出

| 方法与路径 | 参数 | 权限 | 成功返回 |
| --- | --- | --- | --- |
| `GET /api/export` | 无 | 管理员 Bearer 会话 | `200 {"success":true,"data":{"exportedAt":"...","profiles":[...],"skills":[...],"projects":[...],"articles":[...]}}`；导出所有资料、技能、项目及文章，包含草稿 |

后台内容管理页的“导出全部数据”按钮调用该端点，并下载 `personal-homepage-export-<时间戳>.json` 到本地。未登录返回 `401 UNAUTHORIZED`。完整数据导出是只读操作，不修改数据库。

### 常见错误码

| HTTP | `error.code` | 说明 |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | 字段类型、必填值、日期、状态或查询参数无效 |
| `400` | `INVALID_REFERENCE` / `INVALID_PROJECT` | 外键引用的资料或项目不存在/不匹配 |
| `401` | `UNAUTHORIZED` / `INVALID_CREDENTIALS` | 会话无效或登录凭据错误 |
| `404` | `RESOURCE_NOT_FOUND` / `API_ROUTE_NOT_FOUND` | 资源或路由不存在 |
| `409` | `DUPLICATE_RESOURCE` | 主键或唯一键冲突 |
| `409` | `RESOURCE_IN_USE` | 数据仍被外键引用 |
| `500` | `INTERNAL_SERVER_ERROR` | 未预期服务器异常 |

## 4. Apifox / Postman 测试与结果

导入 [Postman Collection](../server/apifox/personal-home.postman_collection.json) 和 [环境模板](../server/apifox/personal-home.postman_environment.json)，复制环境到本地并填写 `adminPassword`（等于 `server/.env` 的 `ADMIN_API_TOKEN`）。启动 MySQL、API 后，按顺序运行整个集合；测试使用临时资源并执行清理。

本次已用 Postman Newman 命令行运行该 Collection：29 个请求、29 项断言全部通过，0 失败；包含已登录导出和未登录拒绝导出测试。临时数据由集合清理，随后查询 MySQL 确认仍为 1 份资料、6 个技能、3 个项目、2 篇文章。Newman 输出只作为命令行测试记录，不替代 Apifox/Postman 客户端截图。

提交截图时，请在实际使用的 Apifox 或 Postman 客户端中导入上述 Collection 与环境模板，配置本地 `adminPassword`，运行完整集合后截取显示本次运行结果的客户端窗口。仓库不包含伪造或代制的客户端截图。

## 5. 前端数据来源

`src/services/api.js` 通过 Axios 统一处理请求、会话令牌、响应信封和异常。`src/stores/project.js` 加载资料/技能/项目，`src/stores/article.js` 加载文章；公开主页、项目列表/详情、文章列表/详情均使用这些 Store。后台管理界面通过同一 Axios API 执行 CRUD，成功后更新 Pinia 状态；刷新后重新从 MySQL 读取。
