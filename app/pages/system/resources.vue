<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">资源管理</h1>
        <p class="text-muted-color mt-1">
          管理系统中的各种资源权限，包括页面、功能、数据等
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <Button
          v-if="canCreate"
          label="添加资源"
          icon="pi pi-plus"
          @click="openCreateDialog"
        />
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <Card>
      <template #content>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜索框 -->
        <div class="md:col-span-2">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText
              v-model="searchQuery"
              placeholder="搜索资源名称、键值或描述..."
                class="w-full"
            />
            </IconField>
        </div>
        
        <!-- 资源类型筛选 -->
        <div>
            <Dropdown
              v-model="typeFilter"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="全部类型"
              class="w-full"
            />
        </div>
        
        <!-- 状态筛选 -->
        <div>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              class="w-full"
            />
        </div>
      </div>
      
      <!-- 筛选操作 -->
      <div class="flex items-center justify-between mt-4">
        <div class="flex items-center gap-2">
          <Button
            v-if="hasSelected"
              label="批量删除"
              icon="pi pi-trash"
              severity="danger"
              outlined
              size="small"
            @click="handleBatchDelete"
          >
              <template #default>
            批量删除 ({{ selectedResources.length }})
              </template>
          </Button>
          
          <Button
            v-if="searchQuery || typeFilter !== 'all' || statusFilter !== 'all'"
              label="清空筛选"
              icon="pi pi-filter-slash"
              text
              size="small"
            @click="clearFilters"
            />
        </div>
        
          <div class="flex items-center gap-2">
            <Button
              label="导出"
              icon="pi pi-download"
              outlined
              size="small"
              @click="exportResources"
            />
            <Button
              label="刷新"
              icon="pi pi-refresh"
              outlined
              size="small"
              @click="loadResources"
            />
          </div>
        </div>
      </template>
    </Card>
    
    <!-- 资源列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">资源列表</h3>
          <div class="text-sm text-muted-color">
            共 {{ filteredResources.length }} 个资源
          </div>
        </div>
      </template>
      
      <template #content>
        <DataTable
          v-model:selection="selectedResources"
          :value="filteredResources"
          :loading="loading"
          selection-mode="multiple"
          data-key="id"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          class="p-datatable-sm"
        >
          <Column selection-mode="multiple" header-style="width: 3rem"></Column>
          
          <Column field="key" header="资源键值" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm">
                {{ slotProps.data.key }}
              </code>
            </template>
          </Column>
          
          <Column field="name" header="资源名称" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <i :class="getResourceIcon(slotProps.data.type)" class="text-primary"></i>
                <span class="font-medium">{{ slotProps.data.name }}</span>
            </div>
            </template>
          </Column>
          
          <Column field="type" header="类型" sortable>
            <template #body="slotProps">
              <Tag
                :value="getTypeDisplayName(slotProps.data.type)"
                :severity="getTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>
            
          <Column field="description" header="描述">
            <template #body="slotProps">
              <span class="text-muted-color text-sm">
                {{ slotProps.data.description || '-' }}
              </span>
            </template>
          </Column>
          
          <Column field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.status === 'active' ? '启用' : '禁用'"
                :severity="slotProps.data.status === 'active' ? 'success' : 'warn'"
              />
            </template>
          </Column>
            
          <Column field="created_at" header="创建时间" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.created_at) }}
              </span>
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
                  @click="viewResource(slotProps.data)"
                />
                <Button
                  v-if="canEdit"
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="editResource(slotProps.data)"
                />
                <Button
                  v-if="canDelete"
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDeleteResource(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
    
    <!-- 资源对话框 -->
    <Dialog
      v-model:visible="showDialog"
      :header="editingResource ? '编辑资源' : '添加资源'"
      :style="{ width: '600px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">资源键值 *</label>
              <InputText
                v-model="resourceForm.key"
                placeholder="例如: user:create"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">资源名称 *</label>
              <InputText
                v-model="resourceForm.name"
                placeholder="例如: 创建用户"
                required
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">资源类型 *</label>
              <Dropdown
                v-model="resourceForm.type"
                :options="typeOptions"
                option-label="label"
                option-value="value"
                placeholder="选择类型"
                required
              />
        </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">状态</label>
              <Dropdown
                v-model="resourceForm.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="选择状态"
              />
      </div>
    </div>
    
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">描述</label>
            <Textarea
              v-model="resourceForm.description"
              placeholder="请输入资源描述"
              :rows="3"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">路径</label>
            <InputText
              v-model="resourceForm.path"
              placeholder="例如: /api/users"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">HTTP方法</label>
            <MultiSelect
              v-model="resourceForm.methods"
              :options="methodOptions"
              option-label="label"
              option-value="value"
              placeholder="选择HTTP方法"
              :max-selected-labels="3"
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
            @click="saveResource"
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
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
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
  title: '资源管理 - ERP 管理系统'
})

// 权限检查
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingResource = ref(null as any)
const selectedResources = ref([])
const confirm = useConfirm()

// 搜索和筛选
const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')

// 表单数据
const resourceForm = ref({
  key: '',
  name: '',
  type: 'page',
  description: '',
  path: '',
  methods: [],
  status: 'active'
})

// 选项数据
const typeOptions = ref([
  { label: '全部类型', value: 'all' },
  { label: '页面', value: 'page' },
  { label: '功能', value: 'function' },
  { label: '数据', value: 'data' },
  { label: 'API', value: 'api' },
  { label: '按钮', value: 'button' },
  { label: '菜单', value: 'menu' }
])

const statusOptions = ref([
  { label: '全部状态', value: 'all' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
])

const methodOptions = ref([
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' }
])

// 模拟数据
const mockResources = ref([
  {
    id: '1',
    key: 'user:view',
    name: '查看用户',
    type: 'function',
    description: '查看用户列表和详情',
    path: '/api/users',
    methods: ['GET'],
    status: 'active',
    created_at: new Date('2024-01-01')
  },
  {
    id: '2',
    key: 'user:create',
    name: '创建用户',
    type: 'function',
    description: '创建新用户',
    path: '/api/users',
    methods: ['POST'],
    status: 'active',
    created_at: new Date('2024-01-02')
  },
  {
    id: '3',
    key: 'user:edit',
    name: '编辑用户',
    type: 'function',
    description: '编辑用户信息',
    path: '/api/users/:id',
    methods: ['PUT', 'PATCH'],
    status: 'active',
    created_at: new Date('2024-01-03')
  },
  {
    id: '4',
    key: 'user:delete',
    name: '删除用户',
    type: 'function',
    description: '删除用户',
    path: '/api/users/:id',
    methods: ['DELETE'],
    status: 'active',
    created_at: new Date('2024-01-04')
  },
  {
    id: '5',
    key: 'dashboard',
    name: '仪表盘页面',
    type: 'page',
    description: '系统仪表盘页面',
    path: '/dashboard',
    methods: [],
    status: 'active',
    created_at: new Date('2024-01-05')
  }
])

// 计算属性
const filteredResources = computed(() => {
  let result = mockResources.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(resource =>
      resource.key.toLowerCase().includes(query)
      || resource.name.toLowerCase().includes(query)
      || (resource.description && resource.description.toLowerCase().includes(query))
    )
  }
  
  if (typeFilter.value && typeFilter.value !== 'all') {
    result = result.filter(resource => resource.type === typeFilter.value)
  }
  
  if (statusFilter.value && statusFilter.value !== 'all') {
    result = result.filter(resource => resource.status === statusFilter.value)
  }
  
  return result
})

const hasSelected = computed(() => selectedResources.value.length > 0)

// 类型映射
const typeMap: Record<string, string> = {
  page: '页面',
  function: '功能',
  data: '数据',
  api: 'API',
  button: '按钮',
  menu: '菜单'
}

const severityMap: Record<string, string> = {
  page: 'info',
  function: 'success',
  data: 'warn',
  api: 'danger',
  button: 'secondary',
  menu: 'contrast'
}

// 方法
const getResourceIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    page: 'pi pi-file',
    function: 'pi pi-cog',
    data: 'pi pi-database',
    api: 'pi pi-server',
    button: 'pi pi-circle',
    menu: 'pi pi-bars'
  }
  return iconMap[type] || 'pi pi-circle'
}

const getTypeDisplayName = (type: string) => typeMap[type] || type

const getTypeSeverity = (type: string) => severityMap[type] || 'info'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const loadResources = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  catch (error) {
    console.error('加载资源失败:', error)
  }
  finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingResource.value = null
  Object.assign(resourceForm.value, {
    key: '',
    name: '',
    type: 'page',
    description: '',
    path: '',
    methods: [],
    status: 'active'
  })
  showDialog.value = true
}

const editResource = (resource: any) => {
  editingResource.value = resource
  Object.assign(resourceForm.value, {
    key: resource.key,
    name: resource.name,
    type: resource.type,
    description: resource.description,
    path: resource.path,
    methods: resource.methods,
    status: resource.status
  })
  showDialog.value = true
}

const viewResource = (resource: any) => {
  // 查看资源详情
  console.log('查看资源:', resource)
}

const closeDialog = () => {
  showDialog.value = false
  editingResource.value = null
}

const saveResource = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingResource.value) {
      // 更新资源
      const index = mockResources.value.findIndex(r => r.id === editingResource.value.id)
      if (index !== -1) {
        mockResources.value[index].key = resourceForm.value.key
        mockResources.value[index].name = resourceForm.value.name
        mockResources.value[index].type = resourceForm.value.type
        mockResources.value[index].description = resourceForm.value.description
        mockResources.value[index].path = resourceForm.value.path
        mockResources.value[index].methods = resourceForm.value.methods
        mockResources.value[index].status = resourceForm.value.status
      }
    }
    else {
      // 新增资源
      const newResource = {
        id: Date.now().toString(),
        ...resourceForm.value,
        created_at: new Date()
      }
      mockResources.value.push(newResource)
    }
    
    closeDialog()
  }
  catch (error) {
    console.error('保存资源失败:', error)
  }
  finally {
    saving.value = false
  }
}

const confirmDeleteResource = (resource: any) => {
  confirm.require({
    message: `确定要删除资源 ${resource.name} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteResource(resource.id)
    }
  })
}

const deleteResource = (resourceId: string) => {
  mockResources.value = mockResources.value.filter(resource => resource.id !== resourceId)
}

const handleBatchDelete = () => {
  confirm.require({
    message: `确定要删除选中的 ${selectedResources.value.length} 个资源吗？`,
    header: '确认批量删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      const selectedIds = selectedResources.value.map((r: any) => r.id)
      mockResources.value = mockResources.value.filter(resource => !selectedIds.includes(resource.id))
      selectedResources.value = []
    }
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  typeFilter.value = 'all'
  statusFilter.value = 'all'
}

const exportResources = () => {
  console.log('导出资源')
}

// 初始化
onMounted(() => {
  loadResources()
})
</script>
