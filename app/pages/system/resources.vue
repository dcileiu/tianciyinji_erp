<template>
  <div class="p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">资源管理</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          管理系统中的各种资源权限，包括页面、功能、数据等
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <Button
          v-if="canCreate"
          @click="openCreateDialog"
          class="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus class="w-4 h-4 mr-2" />
          添加资源
        </Button>
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜索框 -->
        <div class="md:col-span-2">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              v-model="searchQuery"
              placeholder="搜索资源名称、键值或描述..."
              class="pl-10"
            />
          </div>
        </div>
        
        <!-- 资源类型筛选 -->
        <div>
          <Select v-model="typeFilter">
            <option value="all">全部类型</option>
            <option value="page">页面</option>
            <option value="function">功能</option>
            <option value="data">数据</option>
            <option value="api">API</option>
            <option value="button">按钮</option>
            <option value="menu">菜单</option>
          </Select>
        </div>
        
        <!-- 状态筛选 -->
        <div>
          <Select v-model="statusFilter">
            <option value="all">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </Select>
        </div>
      </div>
      
      <!-- 筛选操作 -->
      <div class="flex items-center justify-between mt-4">
        <div class="flex items-center gap-2">
          <Button
            v-if="hasSelected"
            variant="outline"
            size="sm"
            @click="handleBatchDelete"
            class="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 class="w-4 h-4 mr-1" />
            批量删除 ({{ selectedResources.length }})
          </Button>
          
          <Button
            v-if="searchQuery || typeFilter !== 'all' || statusFilter !== 'all'"
            variant="ghost"
            size="sm"
            @click="clearFilters"
          >
            <Filter class="w-4 h-4 mr-1" />
            清除筛选
          </Button>
        </div>
        
        <div class="text-sm text-gray-500">
          共 {{ filteredResources.length }} 个资源
        </div>
      </div>
    </div>
    
    <!-- 资源列表 -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
      
      <div v-else-if="filteredResources.length === 0" class="text-center py-12">
        <Package class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500 dark:text-gray-400">
          {{ searchQuery ? '没有找到匹配的资源' : '暂无资源数据' }}
        </p>
        <Button
          v-if="canCreate && !searchQuery"
          @click="openCreateDialog"
          class="mt-4"
          variant="outline"
        >
          <Plus class="w-4 h-4 mr-2" />
          添加第一个资源
        </Button>
      </div>
      
      <div v-else>
        <!-- 表格头部 -->
        <div class="border-b border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div class="col-span-1">
              <input
                type="checkbox"
                :checked="selectedResources.length === filteredResources.length"
                :indeterminate="selectedResources.length > 0 && selectedResources.length < filteredResources.length"
                @change="selectAllResources"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div class="col-span-2">资源名称</div>
            <div class="col-span-2">资源键值</div>
            <div class="col-span-1">类型</div>
            <div class="col-span-2">描述</div>
            <div class="col-span-1">状态</div>
            <div class="col-span-2">创建时间</div>
            <div class="col-span-1">操作</div>
          </div>
        </div>
        
        <!-- 表格内容 -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="resource in filteredResources"
            :key="resource.id"
            class="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <!-- 选择框 -->
            <div class="col-span-1 flex items-center">
              <input
                type="checkbox"
                :checked="selectedResources.includes(resource.id)"
                @change="toggleResourceSelection(resource.id)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
            <!-- 资源名称 -->
            <div class="col-span-2 flex items-center">
              <div class="flex items-center gap-2">
                <component
                  :is="getResourceIcon(resource.type)"
                  class="w-4 h-4 text-gray-500"
                />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ resource.name }}
                  </div>
                  <div v-if="resource.parent_name" class="text-xs text-gray-500">
                    父级: {{ resource.parent_name }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 资源键值 -->
            <div class="col-span-2 flex items-center">
              <code class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {{ resource.resource_key }}
              </code>
            </div>
            
            <!-- 类型 -->
            <div class="col-span-1 flex items-center">
              <Badge :variant="getTypeVariant(resource.type)">
                {{ getTypeLabel(resource.type) }}
              </Badge>
            </div>
            
            <!-- 描述 -->
            <div class="col-span-2 flex items-center">
              <span class="text-gray-600 dark:text-gray-400 text-sm truncate">
                {{ resource.description || '-' }}
              </span>
            </div>
            
            <!-- 状态 -->
            <div class="col-span-1 flex items-center">
              <Badge :variant="resource.is_active ? 'success' : 'secondary'">
                {{ resource.is_active ? '启用' : '禁用' }}
              </Badge>
            </div>
            
            <!-- 创建时间 -->
            <div class="col-span-2 flex items-center">
              <span class="text-gray-600 dark:text-gray-400 text-sm">
                {{ formatDate(resource.created_at) }}
              </span>
            </div>
            
            <!-- 操作 -->
            <div class="col-span-1 flex items-center">
              <div class="flex items-center gap-1">
                <Button
                  v-if="canEdit"
                  variant="ghost"
                  size="sm"
                  @click="openEditDialog(resource)"
                  class="text-blue-600 hover:text-blue-700"
                >
                  <Edit class="w-4 h-4" />
                </Button>
                
                <Button
                  v-if="canDelete"
                  variant="ghost"
                  size="sm"
                  @click="handleDelete(resource)"
                  class="text-red-600 hover:text-red-700"
                >
                  <Trash2 class="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  @click="openCreateDialog(resource)"
                  class="text-green-600 hover:text-green-700"
                  title="添加子资源"
                >
                  <Plus class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑资源对话框 -->
    <Dialog v-model:open="showDialog">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ editingResource ? '编辑资源' : (parentResourceForAdd ? `为 "${parentResourceForAdd.name}" 添加子资源` : '添加资源') }}
        </h3>
        
        <ResourceForm
          :resource="editingResource"
          :parent-id="parentResourceForAdd?.id"
          :resources="resources"
          @save="handleSaveResource"
          @cancel="closeDialog"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResources } from '~/composables/useResources'
import { usePermissions } from '~/composables/usePermissions'
import ResourceForm from '~/components/ResourceForm.vue'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Globe,
  Database,
  Settings,
  FileText,
  MousePointer,
  Menu as MenuIcon,
  Shield
} from 'lucide-vue-next'

// 权限检查
const { hasPermission } = usePermissions()
if (!hasPermission('resource:view')) {
  throw createError({
    statusCode: 403,
    statusMessage: '您没有权限访问资源管理页面'
  })
}

// 资源管理
const {
  getResources,
  createResource,
  updateResource,
  deleteResource
} = useResources()

// 状态管理
const loading = ref(false)
const resources = ref([])
const selectedResources = ref([])
const showDialog = ref(false)
const editingResource = ref(null)
const parentResourceForAdd = ref(null)

// 搜索和筛选
const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')

// 计算属性
const filteredResources = computed(() => {
  let filtered = resources.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(resource => 
      resource.name.toLowerCase().includes(query) ||
      resource.resource_key.toLowerCase().includes(query) ||
      (resource.description && resource.description.toLowerCase().includes(query))
    )
  }
  
  // 类型过滤
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(resource => resource.type === typeFilter.value)
  }
  
  // 状态过滤
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(resource => {
      if (statusFilter.value === 'active') return resource.is_active
      if (statusFilter.value === 'inactive') return !resource.is_active
      return true
    })
  }
  
  return filtered
})

const hasSelected = computed(() => selectedResources.value.length > 0)
const canEdit = computed(() => hasPermission('resource:edit'))
const canDelete = computed(() => hasPermission('resource:delete'))
const canCreate = computed(() => hasPermission('resource:create'))

// 方法
const loadResources = async () => {
  loading.value = true
  try {
    const data = await getResources()
    resources.value = data || []
  } catch (error) {
    console.error('加载资源失败:', error)
    // 这里可以添加错误提示
  } finally {
    loading.value = false
  }
}

const openCreateDialog = (parentResource = null) => {
  if (!canCreate.value) return
  
  editingResource.value = null
  parentResourceForAdd.value = parentResource
  showDialog.value = true
}

const openEditDialog = (resource) => {
  if (!canEdit.value) return
  
  editingResource.value = { ...resource }
  parentResourceForAdd.value = null
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingResource.value = null
  parentResourceForAdd.value = null
}

const handleSaveResource = async (resourceData) => {
  loading.value = true
  try {
    if (editingResource.value) {
      // 更新资源
      await updateResource(editingResource.value.id, resourceData)
    } else {
      // 创建资源
      await createResource(resourceData)
    }
    
    await loadResources()
    closeDialog()
    
    // 这里可以添加成功提示
  } catch (error) {
    console.error('保存资源失败:', error)
    // 这里可以添加错误提示
  } finally {
    loading.value = false
  }
}

const handleDelete = async (resource) => {
  if (!canDelete.value) return
  
  if (!confirm(`确定要删除资源 "${resource.name}" 吗？`)) {
    return
  }
  
  loading.value = true
  try {
    await deleteResource(resource.id)
    await loadResources()
    
    // 这里可以添加成功提示
  } catch (error) {
    console.error('删除资源失败:', error)
    // 这里可以添加错误提示
  } finally {
    loading.value = false
  }
}

const handleBatchDelete = async () => {
  if (!canDelete.value || selectedResources.value.length === 0) return
  
  if (!confirm(`确定要删除选中的 ${selectedResources.value.length} 个资源吗？`)) {
    return
  }
  
  loading.value = true
  try {
    await Promise.all(
      selectedResources.value.map(resourceId => deleteResource(resourceId))
    )
    
    selectedResources.value = []
    await loadResources()
    
    // 这里可以添加成功提示
  } catch (error) {
    console.error('批量删除资源失败:', error)
    // 这里可以添加错误提示
  } finally {
    loading.value = false
  }
}

const toggleResourceSelection = (resourceId) => {
  const index = selectedResources.value.indexOf(resourceId)
  if (index > -1) {
    selectedResources.value.splice(index, 1)
  } else {
    selectedResources.value.push(resourceId)
  }
}

const selectAllResources = () => {
  if (selectedResources.value.length === filteredResources.value.length) {
    selectedResources.value = []
  } else {
    selectedResources.value = filteredResources.value.map(resource => resource.id)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  typeFilter.value = 'all'
  statusFilter.value = 'all'
}

// 工具方法
const getResourceIcon = (type) => {
  const iconMap = {
    page: Globe,
    function: Settings,
    data: Database,
    api: Shield,
    button: MousePointer,
    menu: MenuIcon
  }
  return iconMap[type] || Package
}

const getTypeVariant = (type) => {
  const variantMap = {
    page: 'default',
    function: 'secondary',
    data: 'outline',
    api: 'destructive',
    button: 'success',
    menu: 'warning'
  }
  return variantMap[type] || 'default'
}

const getTypeLabel = (type) => {
  const labelMap = {
    page: '页面',
    function: '功能',
    data: '数据',
    api: 'API',
    button: '按钮',
    menu: '菜单'
  }
  return labelMap[type] || type
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面标题
useHead({
  title: '资源管理 - ERP系统'
})

// 初始化
onMounted(() => {
  loadResources()
})
</script>