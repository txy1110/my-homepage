<template>
  <section class="page-surface">
    <header class="page-heading admin-heading">
      <div>
        <h1>项目管理</h1>
        <p>共 {{ projectCount }} 个项目。项目编号用于生成稳定的详情页地址。</p>
      </div>
      <el-button type="primary" @click="startNew">新增项目</el-button>
    </header>

    <el-table :data="projects" stripe row-key="id">
      <el-table-column prop="name" label="项目名称" min-width="150" />
      <el-table-column prop="id" label="项目编号" min-width="135" />
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" effect="light">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tech" label="技术栈" min-width="180" />
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="editProject(row)">编辑</el-button>
          <el-button link type="danger" @click="removeProject(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="还没有项目，点击“新增项目”开始创建。" /></template>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEditing ? '编辑项目' : '新增项目'" width="min(620px, 92vw)" destroy-on-close>
      <el-form ref="formRef" :model="draft" :rules="rules" label-position="top" @submit.prevent>
        <div class="form-grid">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="draft.name" maxlength="80" show-word-limit />
          </el-form-item>
          <el-form-item label="项目编号" prop="id">
            <el-input v-model.trim="draft.id" :disabled="isEditing" placeholder="例如 my-project" />
          </el-form-item>
          <el-form-item label="项目简介" prop="description" class="full-width">
            <el-input v-model="draft.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="项目状态" prop="status">
            <el-select v-model="draft.status" class="full-control">
              <el-option label="进行中" value="进行中" />
              <el-option label="已完成" value="已完成" />
              <el-option label="规划中" value="规划中" />
            </el-select>
          </el-form-item>
          <el-form-item label="技术栈" prop="tech">
            <el-input v-model="draft.tech" maxlength="120" />
          </el-form-item>
          <el-form-item label="项目周期" prop="period" class="full-width">
            <el-input v-model="draft.period" maxlength="60" placeholder="例如 2025.09 - 至今" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProject">保存项目</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/theme-chalk/el-button.css'
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
import 'element-plus/theme-chalk/el-table.css'
import 'element-plus/theme-chalk/el-table-column.css'
import 'element-plus/theme-chalk/el-tag.css'
import { useProjectStore } from '../stores/project.js'

const projectStore = useProjectStore()
// storeToRefs 解构后仍保留响应式；表单草稿独立于 Store，取消弹窗不会提前改动正式数据。
const { projects, projectCount } = storeToRefs(projectStore)
const blankProject = () => ({ id: '', name: '', description: '', status: '规划中', tech: '', period: '' })
const draft = reactive(blankProject())
const formRef = ref()
const dialogVisible = ref(false)
const isEditing = ref(false)
const rules = {
  id: [
    { required: true, message: '请输入项目编号。', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '仅允许小写字母、数字和连字符。', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入项目名称。', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目简介。', trigger: 'blur' }],
  status: [{ required: true, message: '请选择项目状态。', trigger: 'change' }],
  tech: [{ required: true, message: '请输入项目技术栈。', trigger: 'blur' }],
  period: [{ required: true, message: '请输入项目周期。', trigger: 'blur' }]
}

const statusTag = (status) => ({ '进行中': 'success', '已完成': 'info', '规划中': 'warning' }[status] || 'info')

function startNew() {
  isEditing.value = false
  Object.assign(draft, blankProject())
  dialogVisible.value = true
}

function editProject(project) {
  isEditing.value = true
  Object.assign(draft, project)
  dialogVisible.value = true
}

function saveProject() {
  // 先通过 Element Plus 表单校验，再调用 Store action 更新并持久化数据。
  formRef.value.validate((valid) => {
    if (!valid) return
    try {
      if (isEditing.value) {
        projectStore.updateProject(draft.id, { ...draft })
        ElMessage.success('项目修改已保存。')
      } else {
        projectStore.addProject({ ...draft })
        ElMessage.success('项目已新增。')
      }
      dialogVisible.value = false
    } catch (cause) {
      ElMessage.error(cause instanceof Error ? cause.message : '项目保存失败。')
    }
  })
}

async function removeProject(project) {
  try {
    // 删除前二次确认，确认后由 Store 负责修改状态和保存缓存。
    await ElMessageBox.confirm(`确定删除“${project.name}”吗？`, '删除项目', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    projectStore.deleteProject(project.id)
    ElMessage.success('项目已删除。')
  } catch (cause) {
    if (cause === 'cancel' || cause === 'close') return
    ElMessage.error(cause instanceof Error ? cause.message : '项目删除失败。')
  }
}
</script>

<style scoped>
.admin-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1rem; }
.full-width { grid-column: 1 / -1; }
.full-control { width: 100%; }
@media (max-width: 600px) {
  .admin-heading { flex-direction: column; }
  .form-grid { grid-template-columns: 1fr; }
  .full-width { grid-column: auto; }
}
</style>
