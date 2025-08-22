<template>
  <div class="p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">角色权限配置</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          管理系统角色及其对应的菜单和资源权限
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <Button
          v-if="canCreate"
          @click="openCreateRoleDialog"
          class="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus class="w-4 h-4 mr-2" />
          添加角色
        </Button>
      </div>
    </div>
    
    <!-- 角色列表和权限配置 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：角色列表 -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">角色列表</h3>
            
            <!-- 搜索框 -->
            <div class="mt-3 relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                v-model="roleSearchQuery"
                placeholder="搜索角色..."
                class="pl-10"
              />
            </div>
          </div>
          
          <div class="max-h-96 overflow-y-auto">
            <div v-if="loadingRoles" class="flex items-center justify-center py-8">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span class="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
            </div>
            
            <div v-else-if="filteredRoles.length === 0" class="text-center py-8">
              <Users class="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p class="text-gray-500 dark:text-gray-400 text-sm">
                {{ roleSearchQuery ? '没有找到匹配的角色' : '暂无角色数据' }}
              </p>
            </div>
            
            <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="role in filteredRoles"
                :key="role.id"
                :class="[
                  'p-4 cursor-pointer transition-colors',
                  selectedRole?.id === role.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                ]"
                @click="selectRole(role)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <Shield class="w-4 h-4 text-gray-500" />
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ role.name }}
                      </span>
                      <Badge :variant="role.is_active ? 'success' : 'secondary'" class="text-xs">
                        {{ role.is_active ? '启用' : '禁用' }}
                      </Badge>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {{ role.description || '暂无描述' }}
                    </p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>用户: {{ role.user_count || 0 }}</span>
                      <span>权限: {{ (role.menu_count || 0) + (role.resource_count || 0) }}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-1 ml-2">
                    <Button
                      v-if="canEdit"
                      variant="ghost"
                      size="sm"
                      @click.stop="openEditRoleDialog(role)"
                      class="text-blue-600 hover:text-blue-700"
                    >
                      <Edit class="w-3 h-3" />
                    </Button>
                    
                    <Button
                      v-if="canDelete && role.code !== 'admin'"
                      variant="ghost"
                      size="sm"
                      @click.stop="handleDeleteRole(role)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <Trash2 class="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：权限配置 -->
      <div class="lg:col-span-2">
        <div v-if="!selectedRole" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div class="text-center">
            <Settings class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">选择角色配置权限</h3>
            <p class="text-gray-600 dark:text-gray-400">
              请从左侧角色列表中选择一个角色来配置其权限
            </p>
          </div>
        </div>
        
        <div v-else class="space-y-6">
          <!-- 角色信息 -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <Shield class="w-6 h-6 text-blue-600" />
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ selectedRole.name }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ selectedRole.description || '暂无描述' }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <Badge :variant="selectedRole.is_active ? 'success' : 'secondary'">
                  {{ selectedRole.is_active ? '启用' : '禁用' }}
                </Badge>
                
                <Button
                  v-if="canEdit"
                  variant="outline"
                  size="sm"
                  @click="savePermissions"
                  :disabled="savingPermissions"
                >
                  <div v-if="savingPermissions" class="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  <Save class="w-3 h-3 mr-1" />
                  保存权限
                </Button>
              </div>
            </div>
          </div>
          
          <!-- 权限配置标签页 -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <!-- 标签头 -->
            <div class="border-b border-gray-200 dark:border-gray-700">
              <nav class="flex space-x-8 px-4" aria-label="Tabs">
                <button
                  v-for="tab in permissionTabs"
                  :key="tab.key"
                  :class="[
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                  @click="activeTab = tab.key"
                >
                  <component :is="tab.icon" class="w-4 h-4 mr-2 inline" />
                  {{ tab.label }}
                  <span class="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {{ tab.key === 'menus' ? selectedMenus.length : selectedResources.length }}
                  </span>
                </button>
              </nav>
            </div>
            
            <!-- 标签内容 -->
            <div class="p-4">
              <!-- 菜单权限 -->
              <div v-if="activeTab === 'menus'" class="space-y-4">
                <PermissionTree
                  title="菜单权限"
                  :tree-data="menuTree"
                  :selected-ids="selectedMenus"
                  :disabled="!selectedRole || savingPermissions"
                  @update:selected-ids="selectedMenus = $event"
                />
              </div>
              
              <!-- 资源权限 -->
              <div v-if="activeTab === 'resources'" class="space-y-4">
                <PermissionTree
                  title="资源权限"
                  :tree-data="filteredResourcesForPermission"
                  :selected-ids="selectedResources"
                  :disabled="!selectedRole || savingPermissions"
                  @update:selected-ids="selectedResources = $event"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑角色对话框 -->
    <Dialog v-model:open="showRoleDialog">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingRole ? '编辑角色' : '添加角色' }}</DialogTitle>
        </DialogHeader>
        
        <RoleForm
          :role="editingRole"
          @save="handleSaveRole"
          @cancel="closeRoleDialog"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoles } from '~/composables/useRoles'
import { useMenus } from '~/composables/useMenus'
import { useResources } from '~/composables/useResources'
import { usePermissions } from '~/composables/usePermissions'
import RoleForm from '~/components/RoleForm.vue'
import PermissionTree from '~/components/PermissionTree.vue'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Shield,
  Settings,
  Save,
  Menu as MenuIcon,
  Database
} from 'lucide-vue-next'

// 权限检查
const { hasPermission } = usePermissions()
if (!hasPermission('role:view')) {
  throw createError({
    statusCode: 403,
    statusMessage: '您没有权限访问角色权限配置页面'
  })
}

// Composables
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleMenus,
  getRoleResources,
  updateRoleMenus,
  updateRoleResources
} = useRoles()

const { getAllMenus, buildMenuTree } = useMenus()
const { getResources } = useResources()

// 状态管理
const loadingRoles = ref(false)
const savingPermissions = ref(false)
const roles = ref([])
const menus = ref([])
const resources = ref([])
const selectedRole = ref(null)
const showRoleDialog = ref(false)
const editingRole = ref(null)

// 搜索和筛选
const roleSearchQuery = ref('')
const activeTab = ref('menus')

// 权限选择
const selectedMenus = ref([])
const selectedResources = ref([])

// 权限标签页
const permissionTabs = [
  { key: 'menus', label: '菜单权限', icon: MenuIcon },
  { key: 'resources', label: '资源权限', icon: Database }
]

// 计算属性
const filteredRoles = computed(() => {
  if (!roleSearchQuery.value) return roles.value
  
  const query = roleSearchQuery.value.toLowerCase()
  return roles.value.filter(role => 
    role.name.toLowerCase().includes(query) ||
    (role.description && role.description.toLowerCase().includes(query)) ||
    role.code.toLowerCase().includes(query)
  )
})

const menuTree = computed(() => {
  return buildMenuTree(menus.value)
})

const filteredResourcesForPermission = computed(() => {
  return resources.value
})

const canEdit = computed(() => hasPermission('role:edit'))
const canDelete = computed(() => hasPermission('role:delete'))
const canCreate = computed(() => hasPermission('role:create'))

// 方法
const loadRoles = async () => {
  loadingRoles.value = true
  try {
    const data = await getRoles()
    roles.value = data || []
  } catch (error) {
    console.error('加载角色失败:', error)
  } finally {
    loadingRoles.value = false
  }
}

const loadMenus = async () => {
  try {
    const data = await getAllMenus()
    menus.value = data || []
  } catch (error) {
    console.error('加载菜单失败:', error)
  }
}

const loadResources = async () => {
  try {
    const data = await getResources()
    resources.value = data || []
  } catch (error) {
    console.error('加载资源失败:', error)
  }
}

const selectRole = async (role) => {
  selectedRole.value = role
  
  // 加载角色的菜单权限
  try {
    const roleMenus = await getRoleMenus(role.id)
    selectedMenus.value = roleMenus.map(rm => rm.menu_id)
  } catch (error) {
    console.error('加载角色菜单权限失败:', error)
    selectedMenus.value = []
  }
  
  // 加载角色的资源权限
  try {
    const roleResources = await getRoleResources(role.id)
    selectedResources.value = roleResources.map(rr => rr.resource_id)
  } catch (error) {
    console.error('加载角色资源权限失败:', error)
    selectedResources.value = []
  }
}

const savePermissions = async () => {
  if (!selectedRole.value || !canEdit.value) return
  
  savingPermissions.value = true
  try {
    // 保存菜单权限
    await updateRoleMenus(selectedRole.value.id, selectedMenus.value)
    
    // 保存资源权限
    await updateRoleResources(selectedRole.value.id, selectedResources.value)
    
    // 这里可以添加成功提示
    console.log('权限保存成功')
  } catch (error) {
    console.error('保存权限失败:', error)
    // 这里可以添加错误提示
  } finally {
    savingPermissions.value = false
  }
}

const openCreateRoleDialog = () => {
  if (!canCreate.value) return
  
  editingRole.value = null
  showRoleDialog.value = true
}

const openEditRoleDialog = (role) => {
  if (!canEdit.value) return
  
  editingRole.value = { ...role }
  showRoleDialog.value = true
}

const closeRoleDialog = () => {
  showRoleDialog.value = false
  editingRole.value = null
}

const handleSaveRole = async (roleData) => {
  try {
    if (editingRole.value) {
      await updateRole(editingRole.value.id, roleData)
    } else {
      await createRole(roleData)
    }
    
    await loadRoles()
    closeRoleDialog()
    
    // 这里可以添加成功提示
  } catch (error) {
    console.error('保存角色失败:', error)
    // 这里可以添加错误提示
  }
}

const handleDeleteRole = async (role) => {
  if (!canDelete.value) return
  
  if (!confirm(`确定要删除角色 "${role.name}" 吗？删除后该角色下的所有用户将失去相应权限。`)) {
    return
  }
  
  try {
    await deleteRole(role.id)
    await loadRoles()
    
    // 如果删除的是当前选中的角色，清空选择
    if (selectedRole.value?.id === role.id) {
      selectedRole.value = null
      selectedMenus.value = []
      selectedResources.value = []
    }
    
    // 这里可以添加成功提示
  } catch (error) {
    console.error('删除角色失败:', error)
    // 这里可以添加错误提示
  }
}

// 权限操作方法已移至PermissionTree组件内部处理

// 页面标题
useHead({
  title: '角色权限配置 - ERP系统'
})

// 初始化
onMounted(async () => {
  await Promise.all([
    loadRoles(),
    loadMenus(),
    loadResources()
  ])
})
</script>