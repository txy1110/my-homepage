/**
 * @apiDefine AdminAuth
 * @apiHeader {String} Authorization Bearer session token returned by `/api/auth/login`.
 */

/**
 * @apiDefine SuccessEnvelope
 * @apiSuccess {Boolean} success Always `true`.
 * @apiSuccess {Object} data Response payload.
 */

/**
 * @apiDefine ErrorEnvelope
 * @apiError {Boolean} success Always `false`.
 * @apiError {Object} error Error details.
 * @apiError {String} error.code Stable error code.
 * @apiError {String} error.message Human-readable error message.
 */

/**
 * @apiDefine ResourceNotFound
 * @apiError (404) {Boolean} success Always `false`.
 * @apiError (404) {Object} error Error details.
 * @apiError (404) {String} error.code `RESOURCE_NOT_FOUND`.
 * @apiError (404) {String} error.message Resource was not found.
 */

/**
 * @apiDefine ValidationError
 * @apiError (400) {Boolean} success Always `false`.
 * @apiError (400) {Object} error Error details.
 * @apiError (400) {String} error.code `VALIDATION_ERROR`.
 * @apiError (400) {String} error.message Describes invalid input.
 */

/**
 * @api {get} /api/health Health check
 * @apiName HealthCheck
 * @apiGroup System
 * @apiVersion 1.0.0
 *
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {"success":true,"data":{"status":"ok"}}
 */

/**
 * @api {post} /api/auth/login Admin login
 * @apiName AdminLogin
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 *
 * @apiBody {String} username Configured admin username.
 * @apiBody {String} password Admin secret configured by `ADMIN_API_TOKEN`.
 * @apiUse SuccessEnvelope
 * @apiSuccess {String} data.token Short-lived bearer session token.
 * @apiSuccess {Number} data.expiresIn Session lifetime in seconds.
 * @apiSuccess {String} data.username Authenticated username.
 * @apiUse ValidationError
 * @apiError (401) {String} error.code `INVALID_CREDENTIALS`.
 * @apiError (503) {String} error.code `AUTH_NOT_CONFIGURED`.
 *
 * @apiParamExample {json} Request:
 * {"username":"admin","password":"your-local-admin-secret"}
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {"success":true,"data":{"token":"<session-token>","expiresIn":28800,"username":"admin"}}
 */

/**
 * @api {get} /api/auth/me Current admin session
 * @apiName CurrentAdmin
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiUse SuccessEnvelope
 * @apiSuccess {String} data.username Authenticated username.
 * @apiError (401) {String} error.code `UNAUTHORIZED`.
 */

/**
 * @api {post} /api/auth/logout Admin logout
 * @apiName AdminLogout
 * @apiGroup Authentication
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiUse SuccessEnvelope
 * @apiSuccess {Boolean} data.loggedOut Whether the session is revoked.
 */

/**
 * @api {get} /api/profile Get first profile
 * @apiName GetProfile
 * @apiGroup Profile
 * @apiVersion 1.0.0
 * @apiUse SuccessEnvelope
 * @apiSuccess {Number} data.id Profile ID.
 * @apiSuccess {String} data.name Display name.
 * @apiSuccess {String} data.title Headline.
 * @apiSuccess {String} data.bio Biography.
 * @apiSuccess {String} data.email Email address.
 * @apiSuccess {String} data.city City.
 * @apiSuccess {String} data.birthday Birthday or null.
 * @apiSuccess {String} data.job Occupation.
 * @apiSuccess {String} data.avatarEmoji Avatar.
 * @apiSuccess {String[]} data.skills Skill names.
 * @apiUse ResourceNotFound
 */

/**
 * @api {get} /api/profile/:id Get profile by ID
 * @apiName GetProfileById
 * @apiGroup Profile
 * @apiVersion 1.0.0
 * @apiParam {Number} id Positive profile ID.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Profile with a `skills` array.
 * @apiUse ResourceNotFound
 * @apiUse ValidationError
 */

/**
 * @api {post} /api/profile Create profile
 * @apiName CreateProfile
 * @apiGroup Profile
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiBody {String} name Display name, max 80 chars.
 * @apiBody {String} title Headline, max 120 chars.
 * @apiBody {String} bio Biography text.
 * @apiBody {String} email Email address, max 254 chars.
 * @apiBody {String} city City, max 100 chars.
 * @apiBody {String|null} birthday Birthday in `YYYY-MM-DD` format or null.
 * @apiBody {String} job Occupation, max 100 chars.
 * @apiBody {String} [avatarEmoji] Avatar, max 32 chars.
 * @apiBody {String[]} [skills] Skill names, max 80 chars each.
 * @apiUse SuccessEnvelope
 * @apiSuccess (201) {Object} data Created profile with ID and skills.
 * @apiUse ValidationError
 */

/**
 * @api {put} /api/profile/:id Update profile
 * @apiName UpdateProfile
 * @apiGroup Profile
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {Number} id Profile ID.
 * @apiBody {String} name Display name.
 * @apiBody {String} title Headline.
 * @apiBody {String} bio Biography text.
 * @apiBody {String} email Email address.
 * @apiBody {String} city City.
 * @apiBody {String|null} birthday Birthday in `YYYY-MM-DD` format or null.
 * @apiBody {String} job Occupation.
 * @apiBody {String} [avatarEmoji] Avatar.
 * @apiBody {String[]} [skills] Full replacement list of skill names.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Updated profile with skills.
 * @apiUse ResourceNotFound
 * @apiUse ValidationError
 */

/**
 * @api {delete} /api/profile/:id Delete profile
 * @apiName DeleteProfile
 * @apiGroup Profile
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {Number} id Profile ID.
 * @apiUse SuccessEnvelope
 * @apiSuccess {String} data.id Deleted profile ID.
 * @apiUse ResourceNotFound
 */

/**
 * @api {get} /api/skills List skills
 * @apiName ListSkills
 * @apiGroup Skills
 * @apiVersion 1.0.0
 * @apiQuery {Number} [profileId] Filter by profile ID.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object[]} data Skill records with `id`, `profileId`, `name`, and `sortOrder`.
 * @apiUse ValidationError
 */

/**
 * @api {get} /api/skills/:id Get skill
 * @apiName GetSkill
 * @apiGroup Skills
 * @apiVersion 1.0.0
 * @apiParam {Number} id Skill ID.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Skill record.
 * @apiUse ResourceNotFound
 * @apiUse ValidationError
 */

/**
 * @api {post} /api/skills Create skill
 * @apiName CreateSkill
 * @apiGroup Skills
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiBody {Number} profileId Parent profile ID.
 * @apiBody {String} name Skill name, max 80 chars.
 * @apiBody {Number} [sortOrder=0] Integer from 0 to 4294967295.
 * @apiUse SuccessEnvelope
 * @apiSuccess (201) {Object} data Created skill.
 * @apiUse ValidationError
 * @apiError (400) {String} error.code `INVALID_REFERENCE`.
 */

/**
 * @api {put} /api/skills/:id Update skill
 * @apiName UpdateSkill
 * @apiGroup Skills
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {Number} id Skill ID.
 * @apiBody {Number} profileId Parent profile ID.
 * @apiBody {String} name Skill name.
 * @apiBody {Number} [sortOrder=0] Sort order.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Updated skill.
 * @apiUse ResourceNotFound
 * @apiUse ValidationError
 */

/**
 * @api {delete} /api/skills/:id Delete skill
 * @apiName DeleteSkill
 * @apiGroup Skills
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {Number} id Skill ID.
 * @apiUse SuccessEnvelope
 * @apiSuccess {String} data.id Deleted skill ID.
 * @apiUse ResourceNotFound
 */

/**
 * @api {get} /api/projects List projects
 * @apiName ListProjects
 * @apiGroup Projects
 * @apiVersion 1.0.0
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object[]} data Project records with `id`, `profileId`, `name`, `description`, `status`, `tech`, and `period`.
 */

/**
 * @api {get} /api/projects/:id Get project
 * @apiName GetProject
 * @apiGroup Projects
 * @apiVersion 1.0.0
 * @apiParam {String} id Project identifier.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Project record.
 * @apiUse ResourceNotFound
 */

/**
 * @api {post} /api/projects Create project
 * @apiName CreateProject
 * @apiGroup Projects
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiBody {String} id Lowercase project ID containing letters, digits, or hyphens.
 * @apiBody {Number} profileId Parent profile ID.
 * @apiBody {String} name Project name, max 80 chars.
 * @apiBody {String} description Description, max 500 chars.
 * @apiBody {String="进行中","已完成","规划中"} status Project status.
 * @apiBody {String} tech Technology summary, max 120 chars.
 * @apiBody {String} period Display period, max 60 chars.
 * @apiUse SuccessEnvelope
 * @apiSuccess (201) {Object} data Created project.
 * @apiUse ValidationError
 */

/**
 * @api {put} /api/projects/:id Update project
 * @apiName UpdateProject
 * @apiGroup Projects
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {String} id Project identifier; immutable.
 * @apiBody {Number} profileId Parent profile ID.
 * @apiBody {String} name Project name.
 * @apiBody {String} description Description.
 * @apiBody {String="进行中","已完成","规划中"} status Project status.
 * @apiBody {String} tech Technology summary.
 * @apiBody {String} period Display period.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Updated project.
 * @apiUse ResourceNotFound
 * @apiUse ValidationError
 */

/**
 * @api {delete} /api/projects/:id Delete project
 * @apiName DeleteProject
 * @apiGroup Projects
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {String} id Project identifier.
 * @apiUse SuccessEnvelope
 * @apiSuccess {String} data.id Deleted project ID.
 * @apiUse ResourceNotFound
 */

/**
 * @api {get} /api/articles List published articles
 * @apiName ListArticles
 * @apiGroup Articles
 * @apiVersion 1.0.0
 * @apiQuery {String} [projectId] Filter by project ID.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object[]} data Published article records.
 * @apiUse ValidationError
 */

/**
 * @api {get} /api/articles/:id Get published article
 * @apiName GetArticle
 * @apiGroup Articles
 * @apiVersion 1.0.0
 * @apiParam {String} id Article identifier.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Published article.
 * @apiUse ResourceNotFound
 */

/**
 * @api {get} /api/articles/manage List all articles
 * @apiName ListManagedArticles
 * @apiGroup Articles
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object[]} data Article records including drafts.
 */

/**
 * @api {get} /api/articles/manage/:id Get managed article
 * @apiName GetManagedArticle
 * @apiGroup Articles
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {String} id Article identifier.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Article record including drafts.
 * @apiUse ResourceNotFound
 */

/**
 * @api {post} /api/articles Create article
 * @apiName CreateArticle
 * @apiGroup Articles
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiBody {String} id Article identifier, max 100 chars.
 * @apiBody {Number} profileId Parent profile ID.
 * @apiBody {String|null} projectId Related project ID or null.
 * @apiBody {String} title Title, max 100 chars.
 * @apiBody {String} summary Summary, max 240 chars.
 * @apiBody {String} content Article body.
 * @apiBody {String} createdAt Publish date in `YYYY-MM-DD` format.
 * @apiBody {Boolean} published Whether it is public.
 * @apiUse SuccessEnvelope
 * @apiSuccess (201) {Object} data Created article.
 * @apiUse ValidationError
 */

/**
 * @api {put} /api/articles/:id Update article
 * @apiName UpdateArticle
 * @apiGroup Articles
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {String} id Article identifier; immutable.
 * @apiBody {Number} profileId Parent profile ID.
 * @apiBody {String|null} projectId Related project ID or null.
 * @apiBody {String} title Title.
 * @apiBody {String} summary Summary.
 * @apiBody {String} content Article body.
 * @apiBody {String} createdAt Publish date in `YYYY-MM-DD` format.
 * @apiBody {Boolean} published Whether it is public.
 * @apiUse SuccessEnvelope
 * @apiSuccess {Object} data Updated article.
 * @apiUse ResourceNotFound
 * @apiUse ValidationError
 */

/**
 * @api {delete} /api/articles/:id Delete article
 * @apiName DeleteArticle
 * @apiGroup Articles
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiParam {String} id Article identifier.
 * @apiUse SuccessEnvelope
 * @apiSuccess {String} data.id Deleted article ID.
 * @apiUse ResourceNotFound
 */

/**
 * @api {get} /api/export Export all content
 * @apiName ExportAllData
 * @apiGroup Export
 * @apiVersion 1.0.0
 * @apiUse AdminAuth
 * @apiUse SuccessEnvelope
 * @apiSuccess {String} data.exportedAt Export generation time in ISO 8601 format.
 * @apiSuccess {Object[]} data.profiles All profile records.
 * @apiSuccess {Object[]} data.skills All skill records.
 * @apiSuccess {Object[]} data.projects All project records.
 * @apiSuccess {Object[]} data.articles All articles, including unpublished drafts.
 * @apiError (401) {String} error.code `UNAUTHORIZED`.
 *
 * @apiSuccessExample {json} Success:
 * HTTP/1.1 200 OK
 * {"success":true,"data":{"exportedAt":"2026-10-23T00:00:00.000Z","profiles":[],"skills":[],"projects":[],"articles":[]}}
 */
