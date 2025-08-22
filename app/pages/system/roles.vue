<template>
  <div class="container mx-auto py-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">角色管理</h1>
        <p class="text-muted-foreground">管理系统角色和权限配置</p>
      </div>
      <PermissionWrapper :has-permission="canCreateRole">
        <Button @click="openCreateDialog">
          <Plus class="mr-2 h-4 w-4" />
          新增角色
        </Button>
      </PermissionWrapper>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-500/10 rounded-full">
              <Shield class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">总角色数</p>
              <p class="text-2xl font-semibold">{{ roleStats.totalRoles }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-500/10 rounded-full">
              <ShieldCheck class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">活跃角色</p>
              <p class="text-2xl font-semibold">{{ roleStats.activeRoles }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-500/10 rounded-full">
              <Users class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">关联用户</p>
              <p class="text-2xl font-semibold">{{ roleStats.assignedUsers }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-red-500/10 rounded-full">
              <Key class="h-6 w-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">权限数量</p>
              <p class="text-2xl font-semibold">{{ roleStats.totalPermissions }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>搜索筛选</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label for="search">搜索角色</Label>
            <Input
              id="search"
              v-model="searchQuery"
              placeholder="角色名称或编码"
              class="mt-1"
            />
          </div>
          <div>
            <Label for="status">状态</Label>
            <select
              id="status"
              v-model="selectedStatus"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">停用</option>
            </select>
          </div>
          <div class="flex items-end">
            <Button @click="handleSearch" class="w-full">
              <Search class="mr-2 h-4 w-4" />
              搜索
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 角色列表 -->
    <Card>
      <CardHeader>
        <CardTitle>角色列表</CardTitle>
        <CardDescription>
          共 {{ filteredRoles.length }} 个角色
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          加载中...
        </div>
        <div v-else-if="filteredRoles.length === 0" class="text-center py-8">
          <Shield class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p class="text-muted-foreground">暂无角色数据</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="role in filteredRoles"
            :key="role.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Shield class="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 class="font-semibold">{{ role.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ role.code }}</p>
                <p class="text-sm text-muted-foreground">{{ role.description }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="flex items-center space-x-2">
                  <Badge :variant="role.status === 'active' ? 'default' : 'secondary'">
                    {{ role.status === 'active' ? '活跃' : '停用' }}
                  </Badge>
                  <Tooltip :content="`${role.permissions?.length || 0} 个权限`">
                    <Badge variant="outline">
                      {{ role.permissions?.length || 0 }} 权限
                    </Badge>
                  </Tooltip>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ role.userCount || 0 }} 个用户
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewRole(role)">
                    <Eye class="mr-2 h-4 w-4" />
                    查看详情
                  </DropdownMenuItem>
                  <PermissionWrapper :has-permission="canEditRole">
                    <DropdownMenuItem @click="editRole(role)">
                      <Edit class="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                  </PermissionWrapper>
                  <DropdownMenuItem @click="configurePermissions(role)">
                    <Settings class="mr-2 h-4 w-4" />
                    配置权限
                  </DropdownMenuItem>
                  <PermissionWrapper :has-permission="canDeleteRole">
                    <DropdownMenuItem 
                      @click="deleteRole(role)"
                      class="text-destructive"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </PermissionWrapper>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 创建/编辑角色对话框 -->
    <Dialog v-model:open="showRoleDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{ editingRole ? '编辑角色' : '新增角色' }}</DialogTitle>
          <DialogDescription>
            {{ editingRole ? '修改角色信息' : '创建新的系统角色' }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="role-name">角色名称 <span class="text-destructive">*</span></Label>
              <Input
                id="role-name"
                v-model="roleForm.name"
                placeholder="请输入角色名称"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="role-code">角色编码 <span class="text-destructive">*</span></Label>
              <Input
                id="role-code"
                v-model="roleForm.code"
                placeholder="请输入角色编码"
                class="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label for="description">角色描述</Label>
            <Textarea
              id="description"
              v-model="roleForm.description"
              placeholder="请输入角色描述"
              class="mt-1"
            />
          </div>
          
          <div>
            <Label for="status">状态</Label>
            <select
              id="status"
              v-model="roleForm.status"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="active">活跃</option>
              <option value="inactive">停用</option>
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" @click="showRoleDialog = false">
            取消
          </Button>
          <Button @click="handleSubmit" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingRole ? '更新' : '创建' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 权限配置对话框 -->
    <Dialog v-model:open="showPermissionDialog">
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>配置角色权限</DialogTitle>
          <DialogDescription>
            为角色 "{{ selectedRole?.name }}" 配置系统权限
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4 max-h-[400px] overflow-y-auto">
          <div v-for="category in permissionCategories" :key="category.id" class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox 
                :id="`category-${category.id}`"
                :checked="isCategorySelected(category)"
                @update:checked="toggleCategory(category)"
              />
              <Label :for="`category-${category.id}`" class="font-medium">
                {{ category.name }}
              </Label>
            </div>
            <div class="ml-6 space-y-2">
              <div 
                v-for="permission in category.permissions" 
                :key="permission.id"
                class="flex items-center space-x-2"
              >
                <Checkbox 
                  :id="`permission-${permission.id}`"
                  :checked="selectedPermissions.includes(permission.id)"
                  @update:checked="togglePermission(permission.id)"
                />
                <Label :for="`permission-${permission.id}`" class="text-sm">
                  {{ permission.name }}
                </Label>
                <Tooltip :content="permission.description">
                  <Badge variant="outline" size="sm">{{ permission.code }}</Badge>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" @click="showPermissionDialog = false">
            取消
          </Button>
          <Button @click="savePermissions" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            保存权限
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, Search, MoreHorizontal, Shield, ShieldCheck, Users, Key,
  Eye, Edit, Settings, Trash2, Loader2 
} from 'lucide-vue-next'

// 导入组件
import Button from '~/components/ui/Button.vue'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Badge from '~/components/ui/Badge.vue'
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/Dialog.vue'
import Checkbox from '~/components/ui/Checkbox.vue'
import Tooltip from '~/components/ui/Tooltip.vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 响应式数据
const searchQuery = ref('')
const selectedStatus = ref('')
const showRoleDialog = ref(false)
const showPermissionDialog = ref(false)
const editingRole = ref<any>(null)
const selectedRole = ref<any>(null)
const submitting = ref(false)
const loading = ref(false)
const selectedPermissions = ref<string[]>([])

// 权限检查（模拟）
const canCreateRole = ref(true)
const canEditRole = ref(true)
const canDeleteRole = ref(true)

// 统计数据
const roleStats = reactive({
  totalRoles: 0,
  activeRoles: 0,
  assignedUsers: 0,
  totalPermissions: 0
})

// 表单数据
const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  status: 'active'
})

// 模拟角色数据
const roles = ref([
  {
    id: '1',
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限的超级管理员',
    status: 'active',
    userCount: 2,
    permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'role.manage'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-26T10:00:00Z'
  },
  {
    id: '2',
    name: '部门经理',
    code: 'manager',
    description: '部门管理权限，可管理本部门员工',
    status: 'active',
    userCount: 5,
    permissions: ['user.read', 'user.update', 'report.read'],
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-12-25T15:30:00Z'
  },
  {
    id: '3',
    name: '普通员工',
    code: 'employee',
    description: '基础员工权限，可查看和操作业务数据',
    status: 'active',
    userCount: 25,
    permissions: ['user.read', 'customer.read', 'order.create'],
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-12-24T09:15:00Z'
  },
  {
    id: '4',
    name: '访客',
    code: 'viewer',
    description: '只读权限，可查看部分数据',
    status: 'inactive',
    userCount: 1,
    permissions: ['user.read'],
    created_at: '2024-04-05T10:00:00Z',
    updated_at: '2024-11-20T16:45:00Z'
  }
])

// 权限分类数据
const permissionCategories = ref([
  {
    id: 'user',
    name: '用户管理',
    permissions: [
      { id: 'user.create', name: '创建用户', code: 'user:create', description: '可以创建新用户' },
      { id: 'user.read', name: '查看用户', code: 'user:read', description: '可以查看用户信息' },
      { id: 'user.update', name: '编辑用户', code: 'user:update', description: '可以编辑用户信息' },
      { id: 'user.delete', name: '删除用户', code: 'user:delete', description: '可以删除用户' }
    ]
  },
  {
    id: 'role',
    name: '角色管理',
    permissions: [
      { id: 'role.manage', name: '角色管理', code: 'role:manage', description: '可以管理系统角色' },
      { id: 'role.assign', name: '分配角色', code: 'role:assign', description: '可以为用户分配角色' }
    ]
  },
  {
    id: 'customer',
    name: '客户管理',
    permissions: [
      { id: 'customer.create', name: '创建客户', code: 'customer:create', description: '可以创建新客户' },
      { id: 'customer.read', name: '查看客户', code: 'customer:read', description: '可以查看客户信息' },
      { id: 'customer.update', name: '编辑客户', code: 'customer:update', description: '可以编辑客户信息' },
      { id: 'customer.delete', name: '删除客户', code: 'customer:delete', description: '可以删除客户' }
    ]
  },
  {
    id: 'order',
    name: '订单管理',
    permissions: [
      { id: 'order.create', name: '创建订单', code: 'order:create', description: '可以创建新订单' },
      { id: 'order.read', name: '查看订单', code: 'order:read', description: '可以查看订单信息' },
      { id: 'order.update', name: '编辑订单', code: 'order:update', description: '可以编辑订单信息' },
      { id: 'order.delete', name: '删除订单', code: 'order:delete', description: '可以删除订单' }
    ]
  },
  {
    id: 'report',
    name: '报表管理',
    permissions: [
      { id: 'report.read', name: '查看报表', code: 'report:read', description: '可以查看业务报表' },
      { id: 'report.export', name: '导出报表', code: 'report:export', description: '可以导出报表数据' }
    ]
  }
])

// 计算属性
const filteredRoles = computed(() => {
  let result = roles.value || []
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(role => 
      role.name.toLowerCase().includes(query) ||
      role.code.toLowerCase().includes(query)
    )
  }
  
  if (selectedStatus.value) {
    result = result.filter(role => role.status === selectedStatus.value)
  }
  
  return result
})

// 方法
const openCreateDialog = () => {
  editingRole.value = null
  resetForm()
  showRoleDialog.value = true
}

const editRole = (role: any) => {
  editingRole.value = role
  Object.assign(roleForm, role)
  showRoleDialog.value = true
}

const viewRole = (role: any) => {
  console.log('查看角色:', role)
}

const configurePermissions = (role: any) => {
  selectedRole.value = role
  selectedPermissions.value = [...(role.permissions || [])]
  showPermissionDialog.value = true
}

const deleteRole = async (role: any) => {
  if (confirm(`确定要删除角色 "${role.name}" 吗？`)) {
    console.log('删除角色:', role)
  }
}

const handleSubmit = async () => {
  if (!roleForm.name || !roleForm.code) {
    alert('请填写必填字段')
    return
  }
  
  submitting.value = true
  try {
    console.log('提交角色:', roleForm)
    showRoleDialog.value = false
    updateStats()
  } catch (error) {
    alert('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    status: 'active'
  })
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

const updateStats = () => {
  const items = roles.value || []
  roleStats.totalRoles = items.length
  roleStats.activeRoles = items.filter(role => role.status === 'active').length
  roleStats.assignedUsers = items.reduce((sum, role) => sum + (role.userCount || 0), 0)
  
  // 统计所有权限数量
  const allPermissions = new Set()
  permissionCategories.value.forEach(category => {
    category.permissions.forEach(permission => {
      allPermissions.add(permission.id)
    })
  })
  roleStats.totalPermissions = allPermissions.size
}

const isCategorySelected = (category: any) => {
  return category.permissions.every((permission: any) => 
    selectedPermissions.value.includes(permission.id)
  )
}

const toggleCategory = (category: any) => {
  const isSelected = isCategorySelected(category)
  
  if (isSelected) {
    // 取消选择该分类下的所有权限
    category.permissions.forEach((permission: any) => {
      const index = selectedPermissions.value.indexOf(permission.id)
      if (index > -1) {
        selectedPermissions.value.splice(index, 1)
      }
    })
  } else {
    // 选择该分类下的所有权限
    category.permissions.forEach((permission: any) => {
      if (!selectedPermissions.value.includes(permission.id)) {
        selectedPermissions.value.push(permission.id)
      }
    })
  }
}

const togglePermission = (permissionId: string) => {
  const index = selectedPermissions.value.indexOf(permissionId)
  if (index > -1) {
    selectedPermissions.value.splice(index, 1)
  } else {
    selectedPermissions.value.push(permissionId)
  }
}

const savePermissions = async () => {
  submitting.value = true
  try {
    console.log('保存权限:', {
      roleId: selectedRole.value?.id,
      permissions: selectedPermissions.value
    })
    showPermissionDialog.value = false
  } catch (error) {
    alert('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 页面加载时更新统计
onMounted(() => {
  updateStats()
})

// 页面元数据
definePageMeta({
  layout: 'default',
  middleware: 'auth' as any
})
</script> 