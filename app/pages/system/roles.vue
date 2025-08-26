<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">角色管理</h1>
        <p class="text-muted-foreground mt-1">管理系统角色和权限配置</p>
      </div>
      <PermissionWrapper :has-permission="canCreateRole">
        <Button @click="openCreateDialog">
          <Plus class="w-4 h-4 mr-2" />
          新增角色
        </Button>
      </PermissionWrapper>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">总角色数</p>
              <p class="text-2xl font-bold">{{ roleStats.totalRoles }}</p>
            </div>
            <Shield class="w-8 h-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card class="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">启用角色</p>
              <p class="text-2xl font-bold">{{ roleStats.activeRoles }}</p>
            </div>
            <CheckCircle class="w-8 h-8 text-green-200" />
          </div>
        </CardContent>
      </Card>

      <Card class="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-sm">系统角色</p>
              <p class="text-2xl font-bold">{{ roleStats.systemRoles }}</p>
            </div>
            <Settings class="w-8 h-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>

      <Card class="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">自定义角色</p>
              <p class="text-2xl font-bold">{{ roleStats.customRoles }}</p>
            </div>
            <Users class="w-8 h-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="p-6">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="flex flex-col md:flex-row gap-4 flex-1">
            <div class="flex-1 relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
              />
              <Input v-model="searchQuery" placeholder="搜索角色名称或描述..." class="pl-10" />
            </div>

            <Select v-model="selectedType">
              <SelectTrigger class="w-full md:w-48">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in typeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedStatus">
              <SelectTrigger class="w-full md:w-48">
                <SelectValue placeholder="选择状态" />
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

          <div class="flex gap-2">
            <Button variant="outline" @click="resetFilters">
              <FilterX class="w-4 h-4 mr-2" />
              重置
            </Button>
            <Button variant="outline">
              <Download class="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 角色列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>角色列表</CardTitle>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-4 p-4">
            <Skeleton class="w-12 h-12 -full" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-4/5" />
            </div>
          </div>
        </div>

        <div v-else-if="filteredRoles.length === 0" class="text-center py-8">
          <Shield class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p class="text-muted-foreground">暂无角色数据</p>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>关联用户</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead class="w-[150px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="role in filteredRoles" :key="role.id">
                <TableCell>
                  <div class="flex items-center">
                    <div
                      class="bg-primary/10 text-primary w-8 h-8 -full flex items-center justify-center mr-3"
                    >
                      <Shield class="w-4 h-4" />
                    </div>
                    <div>
                      <div class="font-semibold">{{ role.name }}</div>
                      <div class="text-sm text-muted-foreground">{{ role.description }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getTypeVariant(role.type)">
                    {{ getTypeDisplayName(role.type) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(role.status)">
                    {{ getStatusDisplayName(role.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm">{{ role.user_count || 0 }} 个用户</span>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground">
                    {{ formatDate(role.created_at) }}
                  </span>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button variant="outline" size="sm" @click="viewRole(role)">
                      <Eye class="w-4 h-4" />
                    </Button>
                    <PermissionWrapper :has-permission="canEditRole">
                      <Button variant="outline" size="sm" @click="editRole(role)">
                        <Edit class="w-4 h-4" />
                      </Button>
                    </PermissionWrapper>
                    <PermissionWrapper :has-permission="canDeleteRole">
                      <Button
                        variant="outline"
                        size="sm"
                        :disabled="role.type === 'system'"
                        @click="confirmDeleteRole(role)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </PermissionWrapper>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 角色对话框 -->
    <Dialog v-model:open="showRoleDialog">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{{ editingRole ? '编辑角色' : '新增角色' }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-6">
          <!-- 基本信息 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">基本信息</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>角色名称 *</Label>
                  <Input v-model="roleForm.name" placeholder="请输入角色名称" />
                </div>

                <div class="space-y-2">
                  <Label>角色类型</Label>
                  <Select
                    v-model="roleForm.type"
                    :disabled="editingRole && editingRole.type === 'system'"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in typeOptions.filter(o => o.value)"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label>角色描述</Label>
                  <Textarea v-model="roleForm.description" placeholder="请输入角色描述" :rows="2" />
                </div>

                <div class="space-y-2">
                  <Label>状态</Label>
                  <Select v-model="roleForm.status">
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in statusOptions.filter(o => o.value)"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 权限配置 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">权限配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="bg-muted/50 p-4 -lg max-h-96 overflow-y-auto">
                <div class="space-y-4">
                  <div v-for="group in permissionTree" :key="group.key" class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <input
                        :id="group.key"
                        type="checkbox"
                        class="border-gray-300"
                        @change="toggleGroupPermissions(group)"
                      />
                      <Label :for="group.key" class="font-medium flex items-center">
                        <component :is="getIconComponent(group.icon)" class="w-4 h-4 mr-2" />
                        {{ group.label }}
                      </Label>
                    </div>
                    <div class="ml-6 space-y-2">
                      <div
                        v-for="child in group.children"
                        :key="child.key"
                        class="flex items-center space-x-2"
                      >
                        <input
                          :id="child.key"
                          v-model="selectedPermissions[child.key]"
                          type="checkbox"
                          class="border-gray-300"
                        />
                        <Label :for="child.key" class="text-sm flex items-center">
                          <component :is="getIconComponent(child.icon)" class="w-4 h-4 mr-2" />
                          {{ child.label }}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeRoleDialog">
            <X class="w-4 h-4 mr-2" />
            取消
          </Button>
          <Button :disabled="submitting" @click="submitRole">
            <Check class="w-4 h-4 mr-2" />
            <span v-if="submitting">保存中...</span>
            <span v-else>保存</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 权限查看对话框 -->
    <Dialog v-model:open="showPermissionDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>权限详情</DialogTitle>
        </DialogHeader>

        <div v-if="viewingRole" class="space-y-6">
          <div class="text-center space-y-2">
            <h3 class="text-xl font-semibold">{{ viewingRole.name }}</h3>
            <p class="text-muted-foreground">{{ viewingRole.description }}</p>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle class="text-lg">已分配权限</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div
                  v-for="permission in viewingRole.permissions"
                  :key="permission"
                  class="flex items-center space-x-2"
                >
                  <Check class="w-4 h-4 text-green-500" />
                  <span>{{ getPermissionName(permission) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>

    <!-- 确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  CheckCircle,
  Download,
  Edit,
  Eye,
  FilterX,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-vue-next'
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '角色管理 - ERP 管理系统',
})

// 响应式数据
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const showRoleDialog = ref(false)
const showPermissionDialog = ref(false)
const editingRole = ref(null as any)
const viewingRole = ref(null as any)
const submitting = ref(false)
const loading = ref(false)
// 图标组件映射
const getIconComponent = (iconName: any) => {
  const iconMap = {
    Users: Users,
    Shield: Shield,
    Settings: Settings,
    Eye: Eye,
    Edit: Edit,
    Check: Check,
    Plus: Plus,
    Trash2: Trash2,
  }
  return iconMap[iconName as keyof typeof iconMap] || Shield
}

// 切换权限组
const toggleGroupPermissions = (group: any) => {
  const allSelected = group.children.every((child: any) => selectedPermissions.value[child.key])
  group.children.forEach((child: any) => {
    selectedPermissions.value[child.key] = !allSelected
  })
}
const selectedPermissions = ref({} as Record<string, any>)

// 权限检查（模拟）
const canCreateRole = ref(true)
const canEditRole = ref(true)
const canDeleteRole = ref(true)

// 统计数据
const roleStats = reactive({
  totalRoles: 0,
  activeRoles: 0,
  systemRoles: 0,
  customRoles: 0,
})

// 表单数据
const roleForm = reactive({
  name: '',
  description: '',
  type: 'custom',
  status: 'active',
  permissions: [],
})

// 选项数据
const typeOptions = ref([
  { label: '全部类型', value: '' },
  { label: '系统角色', value: 'system' },
  { label: '自定义角色', value: 'custom' },
])

const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
])

// 权限树数据
const permissionTree = ref([
  {
    key: 'user',
    label: '用户管理',
    icon: 'Users',
    children: [
      { key: 'user:view', label: '查看用户', icon: 'Eye' },
      { key: 'user:create', label: '新增用户', icon: 'Plus' },
      { key: 'user:edit', label: '编辑用户', icon: 'Edit' },
      { key: 'user:delete', label: '删除用户', icon: 'Trash2' },
    ],
  },
  {
    key: 'role',
    label: '角色管理',
    icon: 'Shield',
    children: [
      { key: 'role:view', label: '查看角色', icon: 'Eye' },
      { key: 'role:create', label: '新增角色', icon: 'Plus' },
      { key: 'role:edit', label: '编辑角色', icon: 'Edit' },
      { key: 'role:delete', label: '删除角色', icon: 'Trash2' },
    ],
  },
  {
    key: 'product',
    label: '产品管理',
    icon: 'Settings',
    children: [
      { key: 'product:view', label: '查看产品', icon: 'Eye' },
      { key: 'product:create', label: '新增产品', icon: 'Plus' },
      { key: 'product:edit', label: '编辑产品', icon: 'Edit' },
      { key: 'product:delete', label: '删除产品', icon: 'Trash2' },
    ],
  },
])

// 模拟角色数据
const roles = ref([
  {
    id: '1',
    name: '超级管理员',
    description: '系统最高权限管理员',
    type: 'system',
    status: 'active',
    permissions: [
      'user:view',
      'user:create',
      'user:edit',
      'user:delete',
      'role:view',
      'role:create',
      'role:edit',
      'role:delete',
    ],
    user_count: 1,
    created_at: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: '业务管理员',
    description: '业务模块管理权限',
    type: 'custom',
    status: 'active',
    permissions: ['product:view', 'product:create', 'product:edit'],
    user_count: 3,
    created_at: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: '普通用户',
    description: '基础查看权限',
    type: 'custom',
    status: 'active',
    permissions: ['product:view'],
    user_count: 10,
    created_at: new Date('2024-01-03'),
  },
] as any[])

// 计算属性
const filteredRoles = computed(() => {
  return roles.value.filter((role) => {
    const matchesSearch
      = !searchQuery.value
        || role.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        || role.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = !selectedType.value || role.type === selectedType.value
    const matchesStatus = !selectedStatus.value || role.status === selectedStatus.value

    return matchesSearch && matchesType && matchesStatus
  })
})

// 方法
const getTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    system: '系统角色',
    custom: '自定义',
  }
  return typeMap[type] || type
}

const getTypeVariant = (type: string): 'default' | 'outline' | 'destructive' | 'secondary' => {
  const variantMap: Record<string, 'default' | 'outline' | 'destructive' | 'secondary'> = {
    system: 'destructive',
    custom: 'default',
    business: 'secondary',
  }
  return variantMap[type] || 'default'
}

const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '停用',
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: string): 'default' | 'outline' | 'destructive' | 'secondary' => {
  const variantMap: Record<string, 'default' | 'outline' | 'destructive' | 'secondary'> = {
    active: 'default',
    inactive: 'secondary',
  }
  return variantMap[status] || 'default'
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN')
}

const getPermissionName = (permission: string): string => {
  const permissionMap: Record<string, string> = {
    'user:view': '查看用户',
    'user:create': '新增用户',
    'user:edit': '编辑用户',
    'user:delete': '删除用户',
    'role:view': '查看角色',
    'role:create': '新增角色',
    'role:edit': '编辑角色',
    'role:delete': '删除角色',
    'product:view': '查看产品',
    'product:create': '新增产品',
    'product:edit': '编辑产品',
    'product:delete': '删除产品',
  }
  return permissionMap[permission] || permission
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
}

const openCreateDialog = () => {
  editingRole.value = null
  Object.assign(roleForm, {
    name: '',
    description: '',
    type: 'custom',
    status: 'active',
    permissions: [],
  })
  selectedPermissions.value = {}
  showRoleDialog.value = true
}

const closeRoleDialog = () => {
  showRoleDialog.value = false
  editingRole.value = null
}

const viewRole = (role: any) => {
  viewingRole.value = role
  showPermissionDialog.value = true
}

const editRole = (role: any) => {
  editingRole.value = role
  Object.assign(roleForm, {
    name: role.name,
    description: role.description,
    type: role.type,
    status: role.status,
    permissions: role.permissions || [],
  })

  // 设置权限选择状态
  const selections: any = {}
  if (role.permissions) {
    role.permissions.forEach((permission: string) => {
      selections[permission] = { checked: true, partialChecked: false }
    })
  }
  selectedPermissions.value = selections

  showRoleDialog.value = true
}

const submitRole = async () => {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 获取选中的权限
    const permissions = Object.keys(selectedPermissions.value).filter(
      key => selectedPermissions.value[key]?.checked,
    )

    if (editingRole.value) {
      // 更新角色
      const index = roles.value.findIndex(r => r.id === (editingRole.value as any).id)
      if (index !== -1) {
        Object.assign(roles.value[index], {
          name: roleForm.name,
          description: roleForm.description,
          type: roleForm.type,
          status: roleForm.status,
          permissions,
        })
      }
    }
    else {
      // 新增角色
      const newRole = {
        id: Date.now().toString(),
        ...roleForm,
        permissions,
        user_count: 0,
        created_at: new Date(),
      }
      roles.value.push(newRole)
    }

    closeRoleDialog()
    updateStats()
  }
  catch (error) {
    console.error('保存角色失败:', error)
  }
  finally {
    submitting.value = false
  }
}

const confirmDeleteRole = (role: any) => {
  if (window.confirm(`确定要删除角色 "${role.name}" 吗？此操作不可撤销。`)) {
    deleteRole(role.id)
  }
}

const deleteRole = (roleId: string) => {
  roles.value = roles.value.filter(role => role.id !== roleId)
  updateStats()
}

const updateStats = () => {
  roleStats.totalRoles = roles.value.length
  roleStats.activeRoles = roles.value.filter(r => r.status === 'active').length
  roleStats.systemRoles = roles.value.filter(r => r.type === 'system').length
  roleStats.customRoles = roles.value.filter(r => r.type === 'custom').length
}

// 初始化
onMounted(() => {
  updateStats()
})
</script>
