<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">部门管理</h1>
        <p class="text-muted-color">管理组织架构和部门层级关系</p>
      </div>
      <div>
        <Button
          label="新增部门"
          icon="pi pi-plus"
          class="create-btn"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <template #content>
        <div class="flex gap-4 items-center flex-wrap p-4">
          <div class="flex-1 min-w-80">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchQuery"
                placeholder="搜索部门名称、负责人..."
                class="w-full"
              />
            </span>
          </div>

        <div class="flex gap-4 items-center">
            <Dropdown
              v-model="statusFilter"
              :options="statusFilterOptions"
              option-label="label"
              option-value="value"
              placeholder="状态"
              class="w-32"
          />
            <Button
              label="重置"
              icon="pi pi-refresh"
              outlined
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 部门列表 -->
    <Card>
      <template #content>
        <DataTable
          :value="filteredDepartments"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :total-records="filteredDepartments.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
          class="p-4"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-sitemap text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无部门数据</h3>
              <p class="mb-4">开始创建您的第一个部门</p>
              <Button
                label="新增部门"
                icon="pi pi-plus"
                @click="showCreateDialog = true"
              />
      </div>
          </template>

          <Column field="name" header="部门名称" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-100 rounded-border flex items-center justify-center">
                  <i class="pi pi-building text-primary"></i>
                </div>
                <div>
                  <div class="font-medium text-color mb-1">{{ slotProps.data.name }}</div>
                  <div class="text-sm text-muted-color">{{ slotProps.data.description }}</div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="manager" header="部门负责人" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <Avatar
                  :label="slotProps.data.manager?.charAt(0)"
                  shape="circle"
                  size="normal"
                  class="bg-surface-200 text-surface-700"
                />
                <span class="font-medium">{{ slotProps.data.manager || '未指定' }}</span>
              </div>
            </template>
          </Column>

          <Column field="parentDepartment" header="上级部门" :sortable="true">
            <template #body="slotProps">
              <span v-if="slotProps.data.parentDepartment" class="text-muted-color">
                {{ slotProps.data.parentDepartment }}
              </span>
              <Tag v-else value="顶级部门" severity="info" />
            </template>
          </Column>

          <Column field="employeeCount" header="员工数量" :sortable="true">
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.employeeCount || 0 }}</span>
            </template>
          </Column>

          <Column field="status" header="状态" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.status === 'active' ? '启用' : '停用'"
                :severity="slotProps.data.status === 'active' ? 'success' : 'danger'"
              />
            </template>
          </Column>

          <Column header="操作" class="w-40">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  size="small"
                  @click="editDepartment(slotProps.data)"
                />
                <Button
                  v-tooltip="'添加子部门'"
                  icon="pi pi-plus"
                  outlined
                  rounded
                  size="small"
                  @click="addSubDepartment(slotProps.data)"
                />
                <Button
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  outlined
                  rounded
                  size="small"
                  severity="danger"
                  @click="confirmDelete(slotProps.data)"
                />
      </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 新建/编辑部门对话框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="editingDepartment ? '编辑部门' : '新增部门'"
      modal
      :style="{ width: '600px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="deptCode" class="text-sm font-medium text-color">部门编码</label>
            <InputText
              id="deptCode"
              v-model="departmentForm.code"
              placeholder="输入部门编码"
              :disabled="!!editingDepartment"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="deptName" class="text-sm font-medium text-color">部门名称</label>
            <InputText
              id="deptName"
              v-model="departmentForm.name"
              placeholder="输入部门名称"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="deptDesc" class="text-sm font-medium text-color">部门描述</label>
          <Textarea
            id="deptDesc"
            v-model="departmentForm.description"
            placeholder="输入部门描述"
            rows="3"
          />
          </div>
          
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="deptStatus" class="text-sm font-medium text-color">状态</label>
            <Dropdown
              id="deptStatus"
              v-model="departmentForm.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="选择状态"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="parentDept" class="text-sm font-medium text-color">上级部门</label>
            <Dropdown
              id="parentDept"
              v-model="departmentForm.parentId"
              :options="parentDepartmentOptions"
              option-label="label"
              option-value="value"
              placeholder="选择上级部门"
            />
          </div>
          </div>
          
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="deptManager" class="text-sm font-medium text-color">部门负责人</label>
            <InputText
              id="deptManager"
              v-model="departmentForm.manager"
              placeholder="输入负责人姓名"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="deptSort" class="text-sm font-medium text-color">排序</label>
            <InputNumber
              id="deptSort"
              v-model="departmentForm.sort"
              placeholder="输入排序号"
              :min="0"
            />
          </div>
        </div>
          </div>
          
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            outlined
            @click="closeCreateDialog"
          />
          <Button
            :label="editingDepartment ? '更新' : '创建'"
            :loading="saving"
            @click="saveDepartment"
          />
        </div>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')

// 对话框状态
const showCreateDialog = ref(false)
const editingDepartment = ref<any>(null)
const confirm = useConfirm()

// 部门表单
const departmentForm = ref({
  code: '',
  name: '',
  description: '',
  status: 'active',
  parentId: '',
  manager: '',
  sort: 0
})

// 状态选项
const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
]

// 状态筛选选项
const statusFilterOptions = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
]

// 模拟部门数据
const departments = ref([
  {
    id: '1',
    code: 'TECH',
    name: '技术部',
    description: '负责产品研发和技术支持',
    status: 'active',
    parentId: '',
    parentDepartment: '',
    manager: '张三',
    employeeCount: 15,
    sort: 1
  },
  {
    id: '2',
    code: 'SALES',
    name: '销售部',
    description: '负责产品销售和客户关系维护',
    status: 'active',
    parentId: '',
    parentDepartment: '',
    manager: '李四',
    employeeCount: 12,
    sort: 2
  },
  {
    id: '3',
    code: 'TECH_FE',
    name: '前端开发组',
    description: '负责前端界面开发',
    status: 'active',
    parentId: '1',
    parentDepartment: '技术部',
    manager: '王五',
    employeeCount: 8,
    sort: 1
  },
  {
    id: '4',
    code: 'TECH_BE',
    name: '后端开发组',
    description: '负责后端服务开发',
    status: 'active',
    parentId: '1',
    parentDepartment: '技术部',
    manager: '赵六',
    employeeCount: 7,
    sort: 2
  }
])

// 计算属性
const filteredDepartments = computed(() => {
  let result = departments.value
  
  if (searchQuery.value) {
    result = result.filter(dept =>
      dept.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || dept.manager.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    result = result.filter(dept => dept.status === statusFilter.value)
  }

  return result
})

const parentDepartmentOptions = computed(() => {
  const options = [{ label: '无上级部门', value: '' }]
  
  // 只显示顶级部门作为上级部门选项
  const topLevelDepts = departments.value.filter(dept => !dept.parentId)
  topLevelDepts.forEach((dept) => {
    if (!editingDepartment.value || dept.id !== editingDepartment.value.id) {
      options.push({ label: dept.name, value: dept.id })
    }
  })
  
  return options
})

// 方法
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}

const editDepartment = (department: any) => {
  editingDepartment.value = department
  Object.assign(departmentForm.value, {
    code: department.code,
    name: department.name,
    description: department.description,
    status: department.status,
    parentId: department.parentId,
    manager: department.manager,
    sort: department.sort
  })
  showCreateDialog.value = true
}

const addSubDepartment = (parentDepartment: any) => {
  editingDepartment.value = null
  departmentForm.value = {
    code: '',
    name: '',
    description: '',
    status: 'active',
    parentId: parentDepartment.id,
    manager: '',
    sort: 0
  }
  showCreateDialog.value = true
}

const confirmDelete = (department: any) => {
  // 检查是否有子部门
  const hasChildren = departments.value.some(dept => dept.parentId === department.id)
  
  if (hasChildren) {
    confirm.require({
      message: `部门 "${department.name}" 下还有子部门，请先删除子部门。`,
      header: '删除失败',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: '确定',
      acceptLabel: '',
      reject: () => {}
    })
    return
  }

  confirm.require({
    message: `确定要删除部门 "${department.name}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteDepartment(department.id)
    }
  })
}

const deleteDepartment = async (id: string) => {
  const index = departments.value.findIndex(d => d.id === id)
  if (index !== -1) {
    departments.value.splice(index, 1)
  }
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  editingDepartment.value = null
  departmentForm.value = {
    code: '',
    name: '',
    description: '',
    status: 'active',
    parentId: '',
    manager: '',
    sort: 0
  }
}

const saveDepartment = async () => {
  saving.value = true
  try {
    if (editingDepartment.value) {
      // 更新部门
      const index = departments.value.findIndex(d => d.id === editingDepartment.value?.id)
      if (index !== -1) {
        // 查找父部门名称
        const parentDept = departments.value.find(d => d.id === departmentForm.value.parentId)
        
        const existingDept = departments.value[index]
        departments.value[index] = {
          id: existingDept.id,
          code: departmentForm.value.code,
          name: departmentForm.value.name,
          description: departmentForm.value.description,
          status: departmentForm.value.status,
          parentId: departmentForm.value.parentId,
          parentDepartment: parentDept?.name || '',
          manager: departmentForm.value.manager,
          employeeCount: existingDept.employeeCount,
          sort: departmentForm.value.sort
        }
      }
    }
    else {
      // 新增部门
      const parentDept = departments.value.find(d => d.id === departmentForm.value.parentId)
      
      const newDept = {
        id: Date.now().toString(),
        code: departmentForm.value.code,
        name: departmentForm.value.name,
        description: departmentForm.value.description,
        status: departmentForm.value.status,
        parentId: departmentForm.value.parentId,
        parentDepartment: parentDept?.name || '',
        manager: departmentForm.value.manager,
        employeeCount: 0,
        sort: departmentForm.value.sort
      }
      departments.value.push(newDept)
    }
    
    closeCreateDialog()
  }
  finally {
    saving.value = false
  }
}
</script>
