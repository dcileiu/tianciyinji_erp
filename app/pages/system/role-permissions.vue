<template>
  <div class="role-permissions-container">
    <div class="role-permissions-page">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">角色权限配置</h1>
        <p class="page-description">管理系统角色和权限分配</p>
      </div>

      <div class="page-content">
        <!-- 左侧角色列表 -->
        <Card class="role-list-card">
          <CardHeader>
            <div class="card-header">
              <div class="header-title">
                <Users class="w-4 h-4" />
                <span>角色列表</span>
              </div>
              <Button
                size="sm"
                @click="openCreateRoleDialog"
              >
                <Plus class="w-4 h-4 mr-2" />
                新增角色
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <!-- 搜索框 -->
            <div class="search-section">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  v-model="roleSearchQuery"
                  placeholder="搜索角色名称、编码或描述"
                  class="pl-10"
                />
              </div>
            </div>

            <div class="max-h-96 overflow-y-auto">
              <div v-if="loadingRoles" class="loading-state">
                <Loader2 class="w-6 h-6 animate-spin" />
                <span class="ml-2 text-muted-foreground">加载中...</span>
              </div>

              <div v-else-if="filteredRoles.length === 0" class="text-center py-8">
                <Users class="w-12 h-12 text-muted-foreground opacity-50 mb-2 mx-auto" />
                <p class="text-muted-foreground">暂无角色数据</p>
              </div>

              <div v-else class="role-list">
                <div
                  v-for="role in filteredRoles"
                  :key="role.id"
                  :class="[
                    'role-item',
                    selectedRole?.id === role.id ? 'active' : '',
                  ]"
                  @click="selectRole(role)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <Shield class="w-5 h-5 text-primary" />
                      </div>
                      <div class="role-info">
                        <h4 class="role-name">{{ role.name }}</h4>
                        <p class="role-code">{{ role.code }}</p>
                        <p class="role-description">{{ role.description }}</p>
                      </div>
                    </div>

                    <div class="role-actions">
                      <Button
                        v-if="canEdit"
                        size="sm"
                        variant="ghost"
                        @click.stop="editRole(role)"
                      >
                        <Edit class="w-4 h-4" />
                      </Button>
                      <Button
                        v-if="canDelete && !role.is_system"
                        size="sm"
                        variant="ghost"
                        @click.stop="confirmDeleteRole(role)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div class="role-stats">
                    <Badge variant="secondary">{{ role.user_count || 0 }} 个用户</Badge>
                    <Badge variant="secondary">{{ role.menu_count || 0 }} 个菜单</Badge>
                    <Badge variant="secondary">{{ role.resource_count || 0 }} 个资源</Badge>
                    <Badge :variant="role.status === 'active' ? 'default' : 'destructive'">
                      {{ role.status === 'active' ? '启用' : '停用' }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 右侧：权限配置 -->
      <div class="lg:col-span-2">
        <div v-if="!selectedRole" class="text-center py-20">
          <ArrowLeft class="w-16 h-16 text-muted-foreground opacity-50 mb-4 mx-auto" />
          <h3 class="text-lg font-medium mb-2">选择角色</h3>
          <p class="text-muted-foreground">请从左侧列表中选择一个角色来配置权限</p>
        </div>

        <div v-else class="space-y-6">
          <!-- 选中角色信息 -->
          <Card>
            <CardContent>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-primary/10 -full flex items-center justify-center">
                    <Shield class="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 class="text-xl font-semibold">{{ selectedRole.name }}</h2>
                    <p class="text-muted-foreground">{{ selectedRole.description }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <Badge :variant="selectedRole.is_system ? 'destructive' : 'default'">
                    {{ selectedRole.is_system ? '系统角色' : '自定义角色' }}
                  </Badge>
                  <Badge :variant="selectedRole.status === 'active' ? 'default' : 'secondary'">
                    {{ selectedRole.status === 'active' ? '启用' : '停用' }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 权限配置选项卡 -->
          <Tabs default-value="menus" class="w-full">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="menus" class="flex items-center">
                <Menu class="w-4 h-4 mr-2" />
                菜单权限
              </TabsTrigger>
              <TabsTrigger value="resources" class="flex items-center">
                <Database class="w-4 h-4 mr-2" />
                资源权限
              </TabsTrigger>
            </TabsList>

            <!-- 菜单权限 -->
            <TabsContent value="menus" class="mt-6">

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-muted-foreground">
                    配置该角色可以访问的系统菜单
                  </p>
                  <Button
                    size="sm"
                    :disabled="savingPermissions"
                    @click="saveMenuPermissions"
                  >
                    <Save v-if="!savingPermissions" class="w-4 h-4 mr-2" />
                    <RefreshCw v-else class="w-4 h-4 mr-2 animate-spin" />
                    保存菜单权限
                  </Button>
                </div>

                <Card>
                  <CardContent class="p-4">
                    <div class="menu-tree">
                      <div class="space-y-2">
                        <div v-for="menu in menuTree" :key="menu.key" class="menu-item">
                          <div class="flex items-center space-x-2 p-2 hover:bg-muted ">
                            <Checkbox
                              :id="menu.key"
                              :checked="selectedMenus.includes(menu.key)"
                              @update:checked="(checked: boolean) => {
                                if (checked) {
                                  selectedMenus.push(menu.key)
                                }
                                else {
                                  const index = selectedMenus.indexOf(menu.key)
                                  if (index > -1) {
                                    selectedMenus.splice(index, 1)
                                  }
                                }
                              }"
                            />
                            <component :is="getMenuIcon(menu.icon)" class="w-4 h-4" />
                            <Label :for="menu.key" class="cursor-pointer flex-1">
                              {{ menu.label }}
                              <span v-if="menu.path" class="ml-2 text-xs text-muted-foreground">
                                ({{ menu.path }})
                              </span>
                            </Label>
                          </div>

                          <!-- 子菜单 -->
                          <div v-if="menu.children" class="ml-6 space-y-1">
                            <div v-for="child in menu.children" :key="child.key" class="flex items-center space-x-2 p-2 hover:bg-muted ">
                              <Checkbox
                                :id="child.key"
                                :checked="selectedMenus.includes(child.key)"
                                @update:checked="(checked: boolean) => {
                                  if (checked) {
                                    selectedMenus.push(child.key)
                                  }
                                  else {
                                    const index = selectedMenus.indexOf(child.key)
                                    if (index > -1) selectedMenus.splice(index, 1)
                                  }
                                }"
                              />
                              <component :is="getMenuIcon(child.icon)" class="w-4 h-4" />
                              <Label :for="child.key" class="cursor-pointer flex-1">
                                {{ child.label }}
                                <span v-if="child.path" class="ml-2 text-xs text-muted-foreground">
                                  ({{ child.path }})
                                </span>
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <!-- 资源权限 -->
            <TabsContent value="resources" class="mt-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-muted-foreground">
                    配置该角色可以访问的系统资源和操作
                  </p>
                  <Button
                    size="sm"
                    :disabled="savingPermissions"
                    @click="saveResourcePermissions"
                  >
                    <Save v-if="!savingPermissions" class="w-4 h-4 mr-2" />
                    <RefreshCw v-else class="w-4 h-4 mr-2 animate-spin" />
                    保存资源权限
                  </Button>
                </div>

                <div class="space-y-4">
                  <Card v-for="category in resourceCategories" :key="category.id">
                    <CardContent class="p-4">
                      <div class="flex items-center justify-between mb-3">
                        <h4 class="font-medium">{{ category.name }}</h4>
                        <div class="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="selectAllInCategory(category)"
                          >
                            全选
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            @click="clearAllInCategory(category)"
                          >
                            清空
                          </Button>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div
                          v-for="resource in category.resources"
                          :key="resource.id"
                          class="flex items-center space-x-2"
                        >
                          <Checkbox
                            :id="resource.id"
                            :checked="selectedResources.includes(resource.id)"
                            @update:checked="(checked: boolean) => {
                              if (checked) {
                                selectedResources.push(resource.id)
                              }
                              else {
                                const index = selectedResources.indexOf(resource.id)
                                if (index > -1) selectedResources.splice(index, 1)
                              }
                            }"
                          />
                          <Label :for="resource.id" class="text-sm cursor-pointer">
                            {{ resource.name }}
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>

    <!-- 角色创建/编辑对话框 -->
    <Dialog v-model:open="showRoleDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{ editingRole ? '编辑角色' : '新增角色' }}</DialogTitle>
        </DialogHeader>

        <div class="role-form space-y-4">
          <div class="form-group">
            <Label for="roleName">角色名称 *</Label>
            <Input
              id="roleName"
              v-model="roleForm.name"
              placeholder="请输入角色名称"
            />
          </div>

          <div class="form-group">
            <Label for="roleCode">角色编码 *</Label>
            <Input
              id="roleCode"
              v-model="roleForm.code"
              placeholder="请输入角色编码"
              :disabled="!!editingRole"
            />
          </div>

          <div class="form-group">
            <Label for="roleDescription">角色描述</Label>
            <Textarea
              id="roleDescription"
              v-model="roleForm.description"
              placeholder="请输入角色描述"
              rows="3"
            />
          </div>

          <div class="form-group">
            <Label for="roleStatus">状态</Label>
            <Select v-model="roleForm.status">
              <SelectTrigger>
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="closeRoleDialog"
          >
            取消
          </Button>
          <Button
            :disabled="savingPermissions"
            @click="saveRole"
          >
            <RefreshCw v-if="savingPermissions" class="w-4 h-4 mr-2 animate-spin" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Box,
  Database,
  Edit,
  File,
  FileText,
  Home,
  Key,
  Loader2, Menu,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Trash2,
  Truck,
  Users,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '角色权限配置 - ERP 管理系统',
})

// 权限检查
const canEdit = ref(true)
const canDelete = ref(true)

// 状态管理
const loadingRoles = ref(false)
const savingPermissions = ref(false)
const roles = ref([] as any[])
const selectedRole = ref(null as any)
const showRoleDialog = ref(false)
const editingRole = ref(null as any)
// 搜索和筛选
const roleSearchQuery = ref('')

// 权限选择状态
const selectedMenus = ref([] as string[])
const selectedResources = ref([] as string[])

// 表单数据
const roleForm = ref({
  name: '',
  code: '',
  description: '',
  status: 'active',
})

// 选项数据
const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
])

// 模拟数据
const mockRoles = ref([
  {
    id: '1',
    name: '超级管理员',
    code: 'super_admin',
    description: '系统最高权限管理员',
    status: 'active',
    is_system: true,
    user_count: 1,
    menu_count: 15,
    resource_count: 45,
    created_at: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: '业务管理员',
    code: 'business_admin',
    description: '业务模块管理权限',
    status: 'active',
    is_system: false,
    user_count: 3,
    menu_count: 8,
    resource_count: 20,
    created_at: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: '普通用户',
    code: 'user',
    description: '基础查看权限',
    status: 'active',
    is_system: false,
    user_count: 10,
    menu_count: 5,
    resource_count: 10,
    created_at: new Date('2024-01-03'),
  },
])

// 菜单树数据
const menuTree = ref([
  {
    key: 'dashboard',
    label: '仪表盘',
    icon: 'pi pi-home',
    path: '/dashboard',
  },
  {
    key: 'master-data',
    label: '基础数据',
    icon: 'pi pi-database',
    children: [
      { key: 'products', label: '产品管理', icon: 'pi pi-box', path: '/master-data/products' },
      { key: 'customers', label: '客户管理', icon: 'pi pi-users', path: '/master-data/customers' },
      { key: 'suppliers', label: '供应商管理', icon: 'pi pi-truck', path: '/master-data/suppliers' },
    ],
  },
  {
    key: 'sales',
    label: '销售管理',
    icon: 'pi pi-shopping-cart',
    children: [
      { key: 'sales-orders', label: '销售订单', icon: 'pi pi-file', path: '/sales/orders' },
      { key: 'sales-customers', label: '客户管理', icon: 'pi pi-users', path: '/sales/customers' },
    ],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'pi pi-cog',
    children: [
      { key: 'users', label: '用户管理', icon: 'pi pi-users', path: '/users' },
      { key: 'roles', label: '角色管理', icon: 'pi pi-shield', path: '/system/roles' },
      { key: 'permissions', label: '权限配置', icon: 'pi pi-key', path: '/system/role-permissions' },
    ],
  },
])

// 资源分类数据
const resourceCategories = ref([
  {
    id: 'user',
    name: '用户管理',
    resources: [
      { id: 'user:view', name: '查看用户' },
      { id: 'user:create', name: '新增用户' },
      { id: 'user:edit', name: '编辑用户' },
      { id: 'user:delete', name: '删除用户' },
      { id: 'user:export', name: '导出用户' },
      { id: 'user:import', name: '导入用户' },
    ],
  },
  {
    id: 'role',
    name: '角色管理',
    resources: [
      { id: 'role:view', name: '查看角色' },
      { id: 'role:create', name: '新增角色' },
      { id: 'role:edit', name: '编辑角色' },
      { id: 'role:delete', name: '删除角色' },
      { id: 'role:assign', name: '分配角色' },
    ],
  },
  {
    id: 'product',
    name: '产品管理',
    resources: [
      { id: 'product:view', name: '查看产品' },
      { id: 'product:create', name: '新增产品' },
      { id: 'product:edit', name: '编辑产品' },
      { id: 'product:delete', name: '删除产品' },
      { id: 'product:export', name: '导出产品' },
      { id: 'product:price', name: '价格管理' },
    ],
  },
])

// 辅助函数
const getMenuIcon = (iconClass: string) => {
  const iconMap: Record<string, any> = {
    'pi pi-home': Home,
    'pi pi-database': Database,
    'pi pi-shopping-cart': ShoppingCart,
    'pi pi-cog': Settings,
    'pi pi-box': Box,
    'pi pi-users': Users,
    'pi pi-truck': Truck,
    'pi pi-file': File,
    'pi pi-shield': Shield,
    'pi pi-key': Key,
  }
  return iconMap[iconClass] || FileText
}

// 计算属性
const filteredRoles = computed(() => {
  if (!roleSearchQuery.value) {
    return mockRoles.value
  }

  const query = roleSearchQuery.value.toLowerCase()
  return mockRoles.value.filter(role =>
    role.name.toLowerCase().includes(query)
    || role.code.toLowerCase().includes(query)
    || role.description.toLowerCase().includes(query),
  )
})

// 方法
const selectRole = (role: any) => {
  selectedRole.value = role
  loadRolePermissions(role)
}

const loadRolePermissions = async (_role: any) => {
  // 模拟加载角色权限
  selectedMenus.value = ['dashboard', 'master-data', 'products']
  selectedResources.value = ['user:view', 'product:view', 'product:create']
}

const editRole = (role: any) => {
  editingRole.value = role
  roleForm.value.name = role.name
  roleForm.value.code = role.code
  roleForm.value.description = role.description
  roleForm.value.status = role.status
  showRoleDialog.value = true
}

const openCreateRoleDialog = () => {
  editingRole.value = null
  roleForm.value.name = ''
  roleForm.value.code = ''
  roleForm.value.description = ''
  roleForm.value.status = 'active'
  showRoleDialog.value = true
}

const closeRoleDialog = () => {
  showRoleDialog.value = false
  editingRole.value = null
}

const saveRole = async () => {
  savingPermissions.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingRole.value) {
      // 更新角色
      const index = mockRoles.value.findIndex(r => r.id === editingRole.value?.id)
      if (index !== -1 && mockRoles.value[index]) {
        mockRoles.value[index]!.name = roleForm.value.name
        mockRoles.value[index]!.code = roleForm.value.code
        mockRoles.value[index]!.description = roleForm.value.description
        mockRoles.value[index]!.status = roleForm.value.status
      }
      toast.success('角色更新成功')
    }
    else {
      // 新增角色
      const newRole = {
        id: Date.now().toString(),
        ...roleForm.value,
        is_system: false,
        user_count: 0,
        menu_count: 0,
        resource_count: 0,
        created_at: new Date(),
      }
      mockRoles.value.push(newRole)
      toast.success('角色创建成功')
    }

    closeRoleDialog()
  }
  catch (error) {
    console.error('保存角色失败:', error)
    toast.error('保存角色失败')
  }
  finally {
    savingPermissions.value = false
  }
}

const confirmDeleteRole = (role: any) => {
  if (confirm(`确定要删除角色 ${role.name} 吗？`)) {
    deleteRole(role.id)
  }
}

const deleteRole = (roleId: string) => {
  mockRoles.value = mockRoles.value.filter(role => role.id !== roleId)
  if (selectedRole.value?.id === roleId) {
    selectedRole.value = null
  }
  toast.success('角色删除成功')
}

const saveMenuPermissions = async () => {
  savingPermissions.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存菜单权限:', selectedMenus.value)
    toast.success('菜单权限保存成功')
  }
  catch (error) {
    console.error('保存菜单权限失败:', error)
    toast.error('保存菜单权限失败')
  }
  finally {
    savingPermissions.value = false
  }
}

const saveResourcePermissions = async () => {
  savingPermissions.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存资源权限:', selectedResources.value)
    toast.success('资源权限保存成功')
  }
  catch (error) {
    console.error('保存资源权限失败:', error)
    toast.error('保存资源权限失败')
  }
  finally {
    savingPermissions.value = false
  }
}

const selectAllInCategory = (category: any) => {
  const resourceIds = category.resources.map((r: any) => r.id)
  resourceIds.forEach((id: string) => {
    if (!selectedResources.value.includes(id)) {
      selectedResources.value.push(id)
    }
  })
}

const clearAllInCategory = (category: any) => {
  const resourceIds = category.resources.map((r: any) => r.id)
  selectedResources.value = selectedResources.value.filter(id => !resourceIds.includes(id))
}

// 初始化
onMounted(() => {
  roles.value = mockRoles.value
})
</script>

<style scoped>
.role-permissions-page {
  @apply p-6 space-y-6;
}

.page-header {
  @apply mb-6;
}

.page-title {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.page-description {
  @apply text-gray-600 dark:text-gray-400 mt-1;
}

.page-content {
  @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
}

.role-list-card {
  @apply lg:col-span-1;
}

.card-header {
  @apply flex items-center justify-between;
}

.header-title {
  @apply flex items-center space-x-2 font-semibold;
}

.search-section {
  @apply mb-4;
}

.role-list {
  @apply space-y-2 max-h-96 overflow-y-auto;
}

.role-item {
  @apply p-3 border -lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800;
}

.role-item.active {
  @apply bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800;
}

.role-info {
  @apply space-y-1;
}

.role-name {
  @apply font-medium text-gray-900 dark:text-white;
}

.role-code {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.role-description {
  @apply text-sm text-gray-600 dark:text-gray-300;
}

.role-stats {
  @apply flex flex-wrap gap-1 mt-2;
}

.role-actions {
  @apply flex items-center space-x-1 mt-2;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-8 text-gray-500;
}

.menu-tree {
  @apply max-h-96 overflow-y-auto;
}

.menu-item {
  @apply space-y-2;
}

.resource-categories {
  @apply max-h-96 overflow-y-auto;
}

.category-section {
  @apply border -lg p-4;
}

.category-header {
  @apply pb-3 border-b;
}

.category-title {
  @apply text-lg font-medium;
}

.category-actions {
  @apply flex space-x-2;
}

.resource-grid {
  @apply mt-3;
}

.resource-item {
  @apply transition-colors hover:bg-gray-50 dark:hover:bg-gray-800;
}

.resource-label {
  @apply cursor-pointer;
}

.role-form {
  @apply py-4;
}

.form-group {
  @apply space-y-2;
}
</style>
