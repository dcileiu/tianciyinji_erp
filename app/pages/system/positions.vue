<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-color">岗位管理</h1>
        <p class="text-muted-color">管理系统岗位和职位设置</p>
      </div>
      <Button
        label="新增岗位"
        icon="pi pi-plus"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1 text-color">搜索</label>
            <InputText
              v-model="searchQuery"
              placeholder="岗位名称、编码..."
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-color">部门</label>
            <Dropdown
              v-model="departmentFilter"
              :options="departments"
              option-label="name"
              option-value="id"
              placeholder="全部部门"
              show-clear
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-color">状态</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>
          <div class="flex gap-2">
            <Button
              label="重置"
              icon="pi pi-refresh"
              outlined
              class="flex-1"
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 岗位列表 -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-color">岗位列表</h2>
          <div class="text-sm text-muted-color">
            共 {{ filteredPositions.length }} 个岗位
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="filteredPositions"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          class="p-datatable-sm"
        >
          <Column field="code" header="岗位编码" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm font-mono">
                {{ slotProps.data.code }}
              </code>
            </template>
          </Column>
          
          <Column field="name" header="岗位名称" sortable>
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.name }}</span>
            </template>
          </Column>
          
          <Column field="department_name" header="所属部门" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <i class="pi pi-building text-primary"></i>
                <span>{{ slotProps.data.department_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="level" header="职级" sortable>
            <template #body="slotProps">
              <Tag
                :value="getLevelDisplayName(slotProps.data.level)"
                :severity="getLevelSeverity(slotProps.data.level)"
              />
            </template>
          </Column>
          
          <Column field="employee_count" header="人数" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <i class="pi pi-users text-muted-color"></i>
                <span>{{ slotProps.data.employee_count || 0 }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.status === 'active' ? '启用' : '停用'"
                :severity="slotProps.data.status === 'active' ? 'success' : 'warn'"
              />
            </template>
          </Column>
          
          <Column header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex items-center space-x-1">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  rounded
                  text
                  size="small"
                  @click="viewPosition(slotProps.data)"
                />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="editPosition(slotProps.data)"
                />
                <Button
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDeletePosition(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 岗位对话框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="editingPosition ? '编辑岗位' : '新增岗位'"
      :style="{ width: '600px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">岗位编码 *</label>
              <InputText
                v-model="positionForm.code"
                placeholder="请输入岗位编码"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">岗位名称 *</label>
              <InputText
                v-model="positionForm.name"
                placeholder="请输入岗位名称"
                required
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">所属部门 *</label>
              <Dropdown
                v-model="positionForm.department_id"
                :options="departments"
                option-label="name"
                option-value="id"
                placeholder="选择部门"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">职级</label>
              <Dropdown
                v-model="positionForm.level"
                :options="levelOptions"
                option-label="label"
                option-value="value"
                placeholder="选择职级"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">最低薪资</label>
              <InputNumber
                v-model="positionForm.min_salary"
                placeholder="最低薪资"
                :min="0"
                mode="currency"
                currency="CNY"
                locale="zh-CN"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">最高薪资</label>
              <InputNumber
                v-model="positionForm.max_salary"
                placeholder="最高薪资"
                :min="0"
                mode="currency"
                currency="CNY"
                locale="zh-CN"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">岗位描述</label>
            <Textarea
              v-model="positionForm.description"
              placeholder="请输入岗位描述"
              :rows="3"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">岗位要求</label>
            <Textarea
              v-model="positionForm.requirements"
              placeholder="请输入岗位要求"
              :rows="3"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">状态</label>
            <Dropdown
              v-model="positionForm.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="选择状态"
            />
          </div>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            icon="pi pi-times"
            outlined
            @click="closeDialog"
          />
          <Button
            label="保存"
            icon="pi pi-check"
            :loading="saving"
            @click="savePosition"
          />
        </div>
      </template>
    </Dialog>
    
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '岗位管理 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingPosition = ref(null as any)
const confirm = useConfirm()

// 搜索和筛选
const searchQuery = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')

// 表单数据
const positionForm = ref({
  code: '',
  name: '',
  department_id: '',
  level: 'junior',
  min_salary: 0,
  max_salary: 0,
  description: '',
  requirements: '',
  status: 'active'
})

// 选项数据
const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
])

const levelOptions = ref([
  { label: '初级', value: 'junior' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'senior' },
  { label: '专家', value: 'expert' },
  { label: '主管', value: 'supervisor' },
  { label: '经理', value: 'manager' },
  { label: '总监', value: 'director' }
])

// 模拟数据
const departments = ref([
  { id: '1', name: '技术部' },
  { id: '2', name: '销售部' },
  { id: '3', name: '人事部' },
  { id: '4', name: '财务部' },
  { id: '5', name: '运营部' }
])

const mockPositions = ref([
  {
    id: '1',
    code: 'DEV001',
    name: '前端开发工程师',
    department_id: '1',
    department_name: '技术部',
    level: 'intermediate',
    min_salary: 8000,
    max_salary: 15000,
    description: '负责前端页面开发和维护',
    requirements: '熟悉Vue.js、React等前端框架',
    employee_count: 5,
    status: 'active',
    created_at: new Date('2024-01-01')
  },
  {
    id: '2',
    code: 'DEV002',
    name: '后端开发工程师',
    department_id: '1',
    department_name: '技术部',
    level: 'senior',
    min_salary: 12000,
    max_salary: 25000,
    description: '负责后端API开发和数据库设计',
    requirements: '熟悉Java、Python、Node.js等后端技术',
    employee_count: 3,
    status: 'active',
    created_at: new Date('2024-01-02')
  },
  {
    id: '3',
    code: 'SAL001',
    name: '销售专员',
    department_id: '2',
    department_name: '销售部',
    level: 'junior',
    min_salary: 5000,
    max_salary: 8000,
    description: '负责客户开发和销售业务',
    requirements: '具备良好的沟通能力和销售技巧',
    employee_count: 8,
    status: 'active',
    created_at: new Date('2024-01-03')
  },
  {
    id: '4',
    code: 'HR001',
    name: '人事专员',
    department_id: '3',
    department_name: '人事部',
    level: 'intermediate',
    min_salary: 6000,
    max_salary: 10000,
    description: '负责招聘、培训和员工关系维护',
    requirements: '熟悉人力资源管理相关法规',
    employee_count: 2,
    status: 'active',
    created_at: new Date('2024-01-04')
  }
])

// 计算属性
const filteredPositions = computed(() => {
  let result = mockPositions.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(position =>
      position.name.toLowerCase().includes(query)
      || position.code.toLowerCase().includes(query)
    )
  }

  if (departmentFilter.value) {
    result = result.filter(position => position.department_id === departmentFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(position => position.status === statusFilter.value)
  }

  return result
})

// 类型映射
const levelMap: Record<string, string> = {
  junior: '初级',
  intermediate: '中级',
  senior: '高级',
  expert: '专家',
  supervisor: '主管',
  manager: '经理',
  director: '总监'
}

const levelSeverityMap: Record<string, string> = {
  junior: 'info',
  intermediate: 'success',
  senior: 'warn',
  expert: 'danger',
  supervisor: 'secondary',
  manager: 'contrast',
  director: 'primary'
}

// 方法
const getLevelDisplayName = (level: string) => levelMap[level] || level

const getLevelSeverity = (level: string) => levelSeverityMap[level] || 'info'

const resetFilters = () => {
  searchQuery.value = ''
  departmentFilter.value = ''
  statusFilter.value = ''
}

const viewPosition = (position: any) => {
  console.log('查看岗位详情:', position)
}

const editPosition = (position: any) => {
  editingPosition.value = position
  positionForm.value.code = position.code
  positionForm.value.name = position.name
  positionForm.value.department_id = position.department_id
  positionForm.value.level = position.level
  positionForm.value.min_salary = position.min_salary
  positionForm.value.max_salary = position.max_salary
  positionForm.value.description = position.description
  positionForm.value.requirements = position.requirements
  positionForm.value.status = position.status
  showCreateDialog.value = true
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingPosition.value = null
  Object.assign(positionForm.value, {
    code: '',
    name: '',
    department_id: '',
    level: 'junior',
    min_salary: 0,
    max_salary: 0,
    description: '',
    requirements: '',
    status: 'active'
  })
}

const savePosition = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingPosition.value) {
      // 更新岗位
      const index = mockPositions.value.findIndex(p => p.id === editingPosition.value.id)
      if (index !== -1) {
        const department = departments.value.find(d => d.id === positionForm.value.department_id)
        mockPositions.value[index] = {
          ...mockPositions.value[index],
          ...positionForm.value,
          id: mockPositions.value[index]?.id || '',
          employee_count: mockPositions.value[index]?.employee_count || 0,
          created_at: mockPositions.value[index]?.created_at || new Date(),
          department_name: department?.name || ''
        }
      }
    }
    else {
      // 新增岗位
      const department = departments.value.find(d => d.id === positionForm.value.department_id)
      const newPosition = {
        id: Date.now().toString(),
        ...positionForm.value,
        department_name: department?.name || '',
        employee_count: 0,
        created_at: new Date()
      }
      mockPositions.value.push(newPosition)
    }
    
    closeDialog()
  }
  catch (error) {
    console.error('保存岗位失败:', error)
  }
  finally {
    saving.value = false
  }
}

const confirmDeletePosition = (position: any) => {
  confirm.require({
    message: `确定要删除岗位 ${position.name} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deletePosition(position.id)
    }
  })
}

const deletePosition = (positionId: string) => {
  mockPositions.value = mockPositions.value.filter(position => position.id !== positionId)
}

// 初始化
onMounted(() => {
  // 加载数据
})
</script> 
