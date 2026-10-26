<template>
  <section class="page-surface">
    <header class="page-heading admin-heading">
      <div>
        <h1>文章管理</h1>
        <p>共 {{ articles.length }} 篇文章，可新增、编辑、发布或删除；关联项目来自项目 Store。</p>
      </div>
      <el-button type="primary" @click="startNew">新增文章</el-button>
    </header>

    <el-table :data="articles" stripe row-key="id">
      <el-table-column prop="title" label="文章标题" min-width="190" />
      <el-table-column prop="createdAt" label="发布日期" width="130" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.published ? 'success' : 'info'">{{ row.published ? '已发布' : '草稿' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="关联项目" min-width="140">
        <template #default="{ row }">{{ projectName(row.projectId) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="editArticle(row)">编辑</el-button>
          <el-button link type="danger" @click="removeArticle(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无文章，点击“新增文章”开始创作。" /></template>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑文章' : '新增文章'" width="min(720px, 92vw)" destroy-on-close>
      <el-form ref="formRef" :model="draft" :rules="rules" label-position="top">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="draft.title" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="draft.summary" type="textarea" :rows="2" maxlength="240" show-word-limit />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input v-model="draft.content" type="textarea" :rows="7" maxlength="10000" show-word-limit />
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="关联项目">
            <el-select v-model="draft.projectId" clearable placeholder="不关联项目" class="full-control">
              <el-option label="不关联项目" value="" />
              <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="发布日期" prop="createdAt">
            <el-date-picker v-model="draft.createdAt" type="date" value-format="YYYY-MM-DD" placeholder="选择发布日期" class="full-control" />
          </el-form-item>
        </div>
        <el-form-item label="发布状态">
          <el-switch v-model="draft.published" active-text="已发布" inactive-text="草稿" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveArticle">保存文章</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-date-picker.css'
import 'element-plus/theme-chalk/el-date-picker-panel.css'
import 'element-plus/theme-chalk/el-dialog.css'
import 'element-plus/theme-chalk/el-empty.css'
import 'element-plus/theme-chalk/el-form.css'
import 'element-plus/theme-chalk/el-form-item.css'
import 'element-plus/theme-chalk/el-input.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-option.css'
import 'element-plus/theme-chalk/el-overlay.css'
import 'element-plus/theme-chalk/el-popper.css'
import 'element-plus/theme-chalk/el-scrollbar.css'
import 'element-plus/theme-chalk/el-select.css'
import 'element-plus/theme-chalk/el-select-dropdown.css'
import 'element-plus/theme-chalk/el-switch.css'
import 'element-plus/theme-chalk/el-table.css'
import 'element-plus/theme-chalk/el-table-column.css'
import 'element-plus/theme-chalk/el-tag.css'
import { useArticleStore } from '../stores/article.js'
import { useProjectStore } from '../stores/project.js'

const articleStore = useArticleStore()
const projectStore = useProjectStore()
// 要求 2、3：文章管理页连接文章与项目 Store；storeToRefs 解构后仍保持响应式。
const { articles } = storeToRefs(articleStore)
const { projects } = storeToRefs(projectStore)
// 新建文章以独立的未发布草稿初始化，避免弹窗沿用上次编辑内容。
const blankArticle = () => ({
  id: '',
  title: '',
  summary: '',
  content: '',
  projectId: '',
  createdAt: new Date().toISOString().slice(0, 10),
  published: false
})
const draft = reactive(blankArticle())
const formRef = ref()
const dialogVisible = ref(false)
const isEditing = ref(false)
const rules = {
  title: [{ required: true, message: '请输入文章标题。', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入文章摘要。', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章正文。', trigger: 'blur' }],
  createdAt: [{ required: true, message: '请选择发布日期。', trigger: 'change' }]
}
// 显示关联项目名称；文章允许不关联项目。
const projectName = (projectId) => projects.value.find((project) => project.id === projectId)?.name || '未关联'

// 初始化一个新的草稿文章，并默认设为未发布状态。
function startNew() {
  isEditing.value = false
  Object.assign(draft, blankArticle())
  dialogVisible.value = true
}

function editArticle(article) {
  isEditing.value = true
  Object.assign(draft, article)
  dialogVisible.value = true
}

// 新文章生成稳定的文章 ID；修改时保留现有 ID 并提交表单字段。
function saveArticle() {
  // 要求 2、5：Element Plus 表单校验通过后调用 Store actions，新增或编辑文章并持久化。
  formRef.value.validate(async (valid) => {
    if (!valid) return
    const nextArticle = { ...draft, projectId: draft.projectId || '', id: isEditing.value ? draft.id : `article-${Date.now()}` }
    try {
      if (isEditing.value) {
        await articleStore.updateArticle(draft.id, nextArticle)
        ElMessage.success('文章修改已保存。')
      } else {
        await articleStore.addArticle(nextArticle)
        ElMessage.success('文章已新增。')
      }
      dialogVisible.value = false
    } catch (cause) {
      ElMessage.error(cause instanceof Error ? cause.message : '文章保存失败。')
    }
  })
}

// 删除文章前要求确认，避免误操作造成已发布内容丢失。
async function removeArticle(article) {
  try {
    // 取消确认时不修改数据；确认后才调用删除 action。
    await ElMessageBox.confirm(`确定删除“${article.title}”吗？`, '删除文章', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await articleStore.deleteArticle(article.id)
    ElMessage.success('文章已删除。')
  } catch (cause) {
    if (cause === 'cancel' || cause === 'close') return
    ElMessage.error(cause instanceof Error ? cause.message : '文章删除失败。')
  }
}
</script>

<style scoped>
.admin-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1rem; }
.full-control { width: 100%; }
@media (max-width: 600px) {
  .admin-heading { flex-direction: column; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>
