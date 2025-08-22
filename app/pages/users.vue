<template>
  <div class="container mx-auto py-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">用户管理</h1>
        <p class="text-muted-foreground">管理系统用户账户、角色权限和访问控制</p>
      </div>
      <PermissionWrapper :has-permission="canCreateUser">
        <Button @click="openCreateDialog">
          <Plus class="mr-2 h-4 w-4" />
          新增用户
        </Button>
      </PermissionWrapper>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-500/10 rounded-full">
              <Users class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">总用户数</p>
              <p class="text-2xl font-semibold">{{ userStats.totalUsers }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-500/10 rounded-full">
              <UserCheck class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">活跃用户</p>
              <p class="text-2xl font-semibold">{{ userStats.activeUsers }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-500/10 rounded-full">
              <Shield class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">管理员</p>
              <p class="text-2xl font-semibold">{{ userStats.adminUsers }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-red-500/10 rounded-full">
              <UserX class="h-6 w-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">停用用户</p>
              <p class="text-2xl font-semibold">{{ userStats.inactiveUsers }}</p>
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label for="search">搜索用户</Label>
            <Input
              id="search"
              v-model="searchQuery"
              placeholder="用户名或邮箱"
              class="mt-1"
            />
          </div>
          <div>
            <Label for="role">角色</Label>
            <select
              id="role"
              v-model="selectedRole"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部角色</option>
              <option value="admin">管理员</option>
              <option value="manager">经理</option>
              <option value="employee">员工</option>
              <option value="viewer">访客</option>
            </select>
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

    <!-- 用户列表 -->
    <Card>
      <CardHeader>
        <CardTitle>用户列表</CardTitle>
        <CardDescription>
          共 {{ filteredUsers.length }} 个用户
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          加载中...
        </div>
        <div v-else-if="filteredUsers.length === 0" class="text-center py-8">
          <Users class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p class="text-muted-foreground">暂无用户数据</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <Avatar 
                :src="user.avatar_url" 
                :fallback="user.name"
                size="lg"
              />
              <div>
                <h3 class="font-semibold">{{ user.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ user.email }}</p>
                <div class="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" size="sm">{{ user.department }}</Badge>
                  <Badge variant="outline" size="sm">{{ user.position }}</Badge>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="flex items-center space-x-2">
                  <Badge :variant="getRoleVariant(user.role)">
                    {{ getRoleText(user.role) }}
                  </Badge>
                  <Badge :variant="user.status === 'active' ? 'default' : 'secondary'">
                    {{ user.status === 'active' ? '活跃' : '停用' }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  最后登录: {{ formatDate(user.updated_at) }}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewUser(user)">
                    <Eye class="mr-2 h-4 w-4" />
                    查看详情
                  </DropdownMenuItem>
                  <PermissionWrapper :has-permission="canEditUser">
                    <DropdownMenuItem @click="editUser(user)">
                      <Edit class="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                  </PermissionWrapper>
                  <DropdownMenuItem @click="resetPassword(user)">
                    <Key class="mr-2 h-4 w-4" />
                    重置密码
                  </DropdownMenuItem>
                  <PermissionWrapper :has-permission="canDeleteUser">
                    <DropdownMenuItem 
                      @click="deleteUser(user)"
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

    <!-- 创建/编辑用户对话框 -->
    <Dialog v-model:open="showUserDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{ editingUser ? '编辑用户' : '新增用户' }}</DialogTitle>
          <DialogDescription>
            {{ editingUser ? '修改用户信息' : '创建新的用户账户' }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="user-name">用户姓名 <span class="text-destructive">*</span></Label>
              <Input
                id="user-name"
                v-model="userForm.name"
                placeholder="请输入用户姓名"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="email">邮箱地址 <span class="text-destructive">*</span></Label>
              <Input
                id="email"
                v-model="userForm.email"
                type="email"
                placeholder="请输入邮箱地址"
                class="mt-1"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="role">角色 <span class="text-destructive">*</span></Label>
              <select
                id="role"
                v-model="userForm.role"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
              >
                <option value="">请选择角色</option>
                <option value="admin">管理员</option>
                <option value="manager">经理</option>
                <option value="employee">员工</option>
                <option value="viewer">访客</option>
              </select>
            </div>
            <div>
              <Label for="status">状态 <span class="text-destructive">*</span></Label>
              <select
                id="status"
                v-model="userForm.status"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
              >
                <option value="active">活跃</option>
                <option value="inactive">停用</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="department">部门</Label>
              <Input
                id="department"
                v-model="userForm.department"
                placeholder="请输入部门"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="position">职位</Label>
              <Input
                id="position"
                v-model="userForm.position"
                placeholder="请输入职位"
                class="mt-1"
              />
            </div>
          </div>
          
          <div v-if="!editingUser">
            <Label for="password">初始密码 <span class="text-destructive">*</span></Label>
            <Input
              id="password"
              v-model="userForm.password"
              type="password"
              placeholder="请输入初始密码"
              class="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" @click="showUserDialog = false">
            取消
          </Button>
          <Button @click="handleSubmit" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingUser ? '更新' : '创建' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, Search, MoreHorizontal, Users, UserCheck, Shield, UserX,
  Eye, Edit, Key, Trash2, Loader2 
} from 'lucide-vue-next'

// 导入组件
import Button from '~/components/ui/Button.vue'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Badge from '~/components/ui/Badge.vue'
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/Dialog.vue'
import Avatar from '~/components/ui/Avatar.vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 响应式数据
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showUserDialog = ref(false)
const editingUser = ref(null)
const submitting = ref(false)
const loading = ref(false)

// 权限检查（模拟）
const canCreateUser = ref(true)
const canEditUser = ref(true)
const canDeleteUser = ref(true)

// 统计数据
const userStats = reactive({
  totalUsers: 0,
  activeUsers: 0,
  adminUsers: 0,
  inactiveUsers: 0
})

// 表单数据
const userForm = reactive({
  name: '',
  email: '',
  role: '',
  status: 'active',
  department: '',
  position: '',
  password: ''
})

// 模拟用户数据
const users = ref([
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@company.com',
    role: 'admin',
    status: 'active',
    department: 'IT部',
    position: '系统管理员',
    avatar_url: '',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-26T10:00:00Z'
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@company.com',
    role: 'manager',
    status: 'active',
    department: '销售部',
    position: '销售经理',
    avatar_url: '',
    created_at: '2024-02-20T10:00:00Z',
    updated_at: '2024-12-25T15:30:00Z'
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@company.com',
    role: 'employee',
    status: 'active',
    department: '财务部',
    position: '会计',
    avatar_url: '',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-12-24T09:15:00Z'
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@company.com',
    role: 'viewer',
    status: 'inactive',
    department: '采购部',
    position: '采购员',
    avatar_url: '',
    created_at: '2024-04-05T10:00:00Z',
    updated_at: '2024-11-20T16:45:00Z'
  }
])

// 计算属性
const filteredUsers = computed(() => {
  let result = users.value || []
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }
  
  if (selectedRole.value) {
    result = result.filter(user => user.role === selectedRole.value)
  }
  
  if (selectedStatus.value) {
    result = result.filter(user => user.status === selectedStatus.value)
  }
  
  return result
})

// 方法
const openCreateDialog = () => {
  editingUser.value = null
  resetForm()
  showUserDialog.value = true
}

const editUser = (user: any) => {
  editingUser.value = user
  Object.assign(userForm, {
    ...user,
    password: '' // 不显示现有密码
  })
  showUserDialog.value = true
}

const viewUser = (user: any) => {
  console.log('查看用户:', user)
}

const resetPassword = (user: any) => {
  if (confirm(`确定要重置用户 "${user.name}" 的密码吗？`)) {
    console.log('重置密码:', user)
  }
}

const deleteUser = async (user: any) => {
  if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
    console.log('删除用户:', user)
  }
}

const handleSubmit = async () => {
  if (!userForm.name || !userForm.email || !userForm.role) {
    alert('请填写必填字段')
    return
  }
  
  if (!editingUser.value && !userForm.password) {
    alert('请设置初始密码')
    return
  }
  
  submitting.value = true
  try {
    console.log('提交用户:', userForm)
    showUserDialog.value = false
    updateStats()
  } catch (error) {
    alert('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(userForm, {
    name: '',
    email: '',
    role: '',
    status: 'active',
    department: '',
    position: '',
    password: ''
  })
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

const updateStats = () => {
  const items = users.value || []
  userStats.totalUsers = items.length
  userStats.activeUsers = items.filter(user => user.status === 'active').length
  userStats.adminUsers = items.filter(user => user.role === 'admin').length
  userStats.inactiveUsers = items.filter(user => user.status === 'inactive').length
}

const getRoleVariant = (role: string) => {
  const variants = {
    admin: 'default' as const,
    manager: 'secondary' as const,
    employee: 'outline' as const,
    viewer: 'destructive' as const
  }
  return variants[role as keyof typeof variants] || 'secondary'
}

const getRoleText = (role: string) => {
  const texts = {
    admin: '管理员',
    manager: '经理',
    employee: '员工',
    viewer: '访客'
  }
  return texts[role as keyof typeof texts] || role
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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