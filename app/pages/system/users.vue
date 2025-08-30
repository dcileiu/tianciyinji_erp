<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">用户管理</h1>
        <p class="text-muted-foreground">
          管理系统用户账户，分配角色权限和访问控制
        </p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="importUsers">
          <Upload class="mr-2 h-4 w-4" />
          批量导入
        </Button>
        <Button variant="outline" size="sm" @click="exportUsers">
          <Download class="mr-2 h-4 w-4" />
          导出用户
        </Button>
        <Button size="sm" @click="openUserModal">
          <Plus class="mr-2 h-4 w-4" />
          新增用户
        </Button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Search class="h-5 w-5" />
          搜索与筛选
        </CardTitle>
        <CardDescription>快速查找用户信息</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>搜索用户</Label>
            <div class="relative">
              <Search
                class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                placeholder="用户名、姓名、邮箱..."
                class="pl-9"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>用户角色</Label>
            <Select v-model="roleFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem
                  v-for="role in roles"
                  :key="role.id"
                  :value="role.id"
                >
                  {{ role.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>部门</Label>
            <Select v-model="departmentFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                <SelectItem
                  v-for="dept in departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>用户状态</Label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
                <SelectItem value="pending">待激活</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <Button variant="outline" @click="resetFilters">
            <RotateCcw class="mr-2 h-4 w-4" />
            重置筛选
          </Button>
          <Button variant="outline" @click="refreshData">
            <RefreshCw class="mr-2 h-4 w-4" />
            刷新数据
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 用户统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">总用户数</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-blue-600">
                  {{ userStats.total }}
                </p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +{{ userStats.newThisMonth }}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">本月新增</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
            >
              <Users class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">活跃用户</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-green-600">
                  {{ userStats.active }}
                </p>
                <Badge variant="secondary" class="text-xs">
                  {{ Math.round((userStats.active / userStats.total) * 100) }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">活跃率</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            >
              <UserCheck class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">管理员</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-purple-600">
                  {{ userStats.admins }}
                </p>
                <Badge variant="outline" class="text-xs">权限用户</Badge>
              </div>
              <p class="text-xs text-muted-foreground">管理权限</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900"
            >
              <Shield class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">在线用户</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-orange-600">
                  {{ userStats.online }}
                </p>
                <Badge variant="default" class="text-xs">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  在线
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">当前在线</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900"
            >
              <Activity class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 用户列表 -->
    <Card>
      <CardHeader>
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <CardTitle class="flex items-center gap-2">
              <Users class="h-5 w-5" />
              用户列表
            </CardTitle>
            <CardDescription
              >当前共有 {{ filteredUsers.length }} 个用户</CardDescription
            >
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="pageSize">
              <SelectTrigger class="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
                <SelectItem value="100">100条/页</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-4">
          <div
            v-for="i in 10"
            :key="i"
            class="flex items-center space-x-4 p-4 border rounded-lg"
          >
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
            <Skeleton class="h-8 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center py-16">
          <Users class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 class="text-xl font-semibold mb-4">暂无用户数据</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            没有找到符合条件的用户记录。请检查筛选条件或添加新用户。
          </p>
          <Button @click="openUserModal">
            <Plus class="mr-2 h-4 w-4" />
            添加用户
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="user in paginatedUsers"
            :key="user.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <Avatar class="h-12 w-12">
                <AvatarImage
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="user.name"
                />
                <AvatarFallback class="bg-primary/10 text-primary">
                  {{ user.name.charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold">{{ user.name }}</h3>
                  <Badge
                    :variant="getStatusVariant(user.status)"
                    class="text-xs"
                  >
                    {{ getStatusText(user.status) }}
                  </Badge>
                  <Badge
                    v-if="user.is_online"
                    variant="default"
                    class="text-xs"
                  >
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    在线
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground">
                  @{{ user.username }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ user.email }} •
                  {{ getDepartmentName(user.department_id) }} •
                  {{ getRoleName(user.role_id) }}
                </p>
                <p class="text-xs text-muted-foreground">
                  最后登录: {{ formatDate(user.last_login) }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-6">
              <div class="text-center">
                <p class="text-sm text-muted-foreground">创建时间</p>
                <p class="text-sm font-medium">
                  {{ formatDate(user.created_at) }}
                </p>
              </div>

              <div class="text-center">
                <p class="text-sm text-muted-foreground">登录次数</p>
                <p class="text-sm font-semibold text-blue-600">
                  {{ user.login_count || 0 }}
                </p>
              </div>

              <div class="flex items-center space-x-1">
                <Button variant="ghost" size="sm" @click="viewUser(user)">
                  <Eye class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="editUser(user)">
                  <Edit class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="resetPassword(user)">
                  <Key class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  :class="user.status === 'active'
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-green-600 hover:text-green-700'
                    "
                  @click="toggleStatus(user)"
                >
                  <Power class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="flex items-center justify-between pt-4">
            <p class="text-sm text-muted-foreground">
              显示第 {{ (currentPage - 1) * Number(pageSize) + 1 }} -
              {{
                Math.min(currentPage * Number(pageSize), filteredUsers.length)
              }}
              条，共 {{ filteredUsers.length }} 条记录
            </p>
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <ChevronLeft class="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                下一页
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 用户详情/编辑对话框 -->
    <Dialog v-model:open="showUserModal">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Users class="h-5 w-5" />
            {{ modalTitle }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? "编辑用户信息和权限设置" : "创建新的系统用户账户" }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>用户名 *</Label>
              <Input
                v-model="currentUser.username"
                placeholder="请输入用户名"
                :disabled="isEditing"
              />
            </div>
            <div class="space-y-2">
              <Label>姓名 *</Label>
              <Input v-model="currentUser.name" placeholder="请输入姓名" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>邮箱 *</Label>
              <Input
                v-model="currentUser.email"
                type="email"
                placeholder="请输入邮箱地址"
              />
            </div>
            <div class="space-y-2">
              <Label>手机号</Label>
              <Input v-model="currentUser.phone" placeholder="请输入手机号" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>所属部门</Label>
              <Select v-model="currentUser.department_id">
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="dept in departments"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>用户角色 *</Label>
              <Select v-model="currentUser.role_id">
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="role in roles"
                    :key="role.id"
                    :value="role.id"
                  >
                    {{ role.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>密码 *</Label>
              <Input
                v-model="currentUser.password"
                type="password"
                placeholder="请输入密码"
              />
            </div>
            <div class="space-y-2">
              <Label>确认密码 *</Label>
              <Input
                v-model="currentUser.confirmPassword"
                type="password"
                placeholder="请确认密码"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>备注</Label>
            <Textarea
              v-model="currentUser.remarks"
              placeholder="请输入备注信息..."
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeUserModal">取消</Button>
          <Button :disabled="saving" @click="saveUser">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditing ? "更新用户" : "创建用户" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 重置密码对话框 -->
    <Dialog v-model:open="showPasswordModal">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Key class="h-5 w-5" />
            重置密码
          </DialogTitle>
          <DialogDescription
            >为用户 "{{ resetPasswordUser?.name }}"
            设置新密码</DialogDescription
          >
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label>新密码 *</Label>
            <Input
              v-model="newPassword"
              type="password"
              placeholder="请输入新密码"
            />
          </div>
          <div class="space-y-2">
            <Label>确认新密码 *</Label>
            <Input
              v-model="confirmNewPassword"
              type="password"
              placeholder="请确认新密码"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closePasswordModal">取消</Button>
          <Button :disabled="resetting" @click="confirmResetPassword">
            <Loader2 v-if="resetting" class="mr-2 h-4 w-4 animate-spin" />
            确认重置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Key,
  Loader2,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
} from "lucide-vue-next"

// 页面配置
definePageMeta({
  layout: "default",
})

useHead({
  title: "用户管理 - 智能ERP管理系统",
})

interface User {
  id: string
  username: string
  name: string
  email: string
  phone?: string
  avatar?: string
  department_id: string
  role_id: string
  status: string
  is_online: boolean
  last_login: Date
  login_count: number
  created_at: Date
  updated_at: Date
  remarks?: string
}

// 状态管理
const loading = ref(false)
const saving = ref(false)
const resetting = ref(false)
const showUserModal = ref(false)
const showPasswordModal = ref(false)
const isEditing = ref(false)
const pageSize = ref("20")
const currentPage = ref(1)

// 筛选条件
const searchQuery = ref("")
const roleFilter = ref("all")
const departmentFilter = ref("all")
const statusFilter = ref("all")

// 表单数据
const currentUser = ref({
  id: "",
  username: "",
  name: "",
  email: "",
  phone: "",
  department_id: "",
  role_id: "",
  password: "",
  confirmPassword: "",
  remarks: "",
})

const resetPasswordUser = ref<User | null>(null)
const newPassword = ref("")
const confirmNewPassword = ref("")

// 统计数据
const userStats = ref({
  total: 156,
  active: 142,
  admins: 8,
  online: 23,
  newThisMonth: 12,
})

// 选项数据
const departments = ref([
  { id: "1", name: "技术部" },
  { id: "2", name: "销售部" },
  { id: "3", name: "财务部" },
  { id: "4", name: "人力资源部" },
  { id: "5", name: "运营部" },
])

const roles = ref([
  { id: "1", name: "超级管理员" },
  { id: "2", name: "系统管理员" },
  { id: "3", name: "部门经理" },
  { id: "4", name: "普通用户" },
  { id: "5", name: "访客" },
])

// 模拟用户数据
const mockUsers = ref<User[]>([
  {
    id: "1",
    username: "admin",
    name: "系统管理员",
    email: "admin@example.com",
    phone: "13800138000",
    avatar: "",
    department_id: "1",
    role_id: "1",
    status: "active",
    is_online: true,
    last_login: new Date("2024-01-20 14:30:00"),
    login_count: 1250,
    created_at: new Date("2023-01-01"),
    updated_at: new Date("2024-01-20"),
    remarks: "系统超级管理员账户",
  },
  {
    id: "2",
    username: "zhangsan",
    name: "张三",
    email: "zhangsan@example.com",
    phone: "13800138001",
    avatar: "",
    department_id: "2",
    role_id: "3",
    status: "active",
    is_online: false,
    last_login: new Date("2024-01-19 16:45:00"),
    login_count: 89,
    created_at: new Date("2023-06-15"),
    updated_at: new Date("2024-01-19"),
    remarks: "销售部门经理",
  },
  {
    id: "3",
    username: "lisi",
    name: "李四",
    email: "lisi@example.com",
    phone: "13800138002",
    avatar: "",
    department_id: "1",
    role_id: "4",
    status: "active",
    is_online: true,
    last_login: new Date("2024-01-20 09:15:00"),
    login_count: 156,
    created_at: new Date("2023-08-20"),
    updated_at: new Date("2024-01-20"),
    remarks: "技术部开发人员",
  },
  {
    id: "4",
    username: "wangwu",
    name: "王五",
    email: "wangwu@example.com",
    phone: "13800138003",
    avatar: "",
    department_id: "3",
    role_id: "4",
    status: "inactive",
    is_online: false,
    last_login: new Date("2024-01-10 11:20:00"),
    login_count: 45,
    created_at: new Date("2023-12-01"),
    updated_at: new Date("2024-01-10"),
    remarks: "财务部会计",
  },
  {
    id: "5",
    username: "zhaoliu",
    name: "赵六",
    email: "zhaoliu@example.com",
    phone: "13800138004",
    avatar: "",
    department_id: "4",
    role_id: "4",
    status: "pending",
    is_online: false,
    last_login: new Date("2024-01-18 15:30:00"),
    login_count: 12,
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-18"),
    remarks: "人力资源专员",
  },
])

// 计算属性
const filteredUsers = computed(() => {
  let result = mockUsers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }

  if (roleFilter.value && roleFilter.value !== "all") {
    result = result.filter((user) => user.role_id === roleFilter.value)
  }

  if (departmentFilter.value && departmentFilter.value !== "all") {
    result = result.filter(
      (user) => user.department_id === departmentFilter.value
    )
  }

  if (statusFilter.value && statusFilter.value !== "all") {
    result = result.filter((user) => user.status === statusFilter.value)
  }

  return result
})

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * Number(pageSize.value)
  const end = start + Number(pageSize.value)
  return filteredUsers.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / Number(pageSize.value))
})

const modalTitle = computed(() => {
  return isEditing.value ? "编辑用户" : "新增用户"
})

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: "活跃",
    inactive: "停用",
    pending: "待激活",
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: string) => {
  const variantMap: Record<
    string,
    "default" | "destructive" | "outline" | "secondary"
  > = {
    active: "default",
    inactive: "destructive",
    pending: "outline",
  }
  return variantMap[status] || "secondary"
}

const getDepartmentName = (departmentId: string) => {
  const department = departments.value.find((d) => d.id === departmentId)
  return department?.name || "未知部门"
}

const getRoleName = (roleId: string) => {
  const role = roles.value.find((r) => r.id === roleId)
  return role?.name || "未知角色"
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

const resetFilters = () => {
  searchQuery.value = ""
  roleFilter.value = "all"
  departmentFilter.value = "all"
  statusFilter.value = "all"
}

const refreshData = async () => {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

const importUsers = () => { }

const exportUsers = () => { }

const openUserModal = () => {
  isEditing.value = false
  currentUser.value = {
    id: "",
    username: "",
    name: "",
    email: "",
    phone: "",
    department_id: "",
    role_id: "",
    password: "",
    confirmPassword: "",
    remarks: "",
  }
  showUserModal.value = true
}

const viewUser = (user: User) => {
  editUser(user)
}

const editUser = (user: User) => {
  isEditing.value = true
  currentUser.value = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    department_id: user.department_id,
    role_id: user.role_id,
    password: "",
    confirmPassword: "",
    remarks: user.remarks || "",
  }
  showUserModal.value = true
}

const resetPassword = (user: User) => {
  resetPasswordUser.value = user
  newPassword.value = ""
  confirmNewPassword.value = ""
  showPasswordModal.value = true
}

const toggleStatus = async (user: User) => {
  try {
    const newStatus = user.status === "active" ? "inactive" : "active"
    const index = mockUsers.value.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      mockUsers.value[index]!.status = newStatus
      mockUsers.value[index]!.updated_at = new Date()
    }
  } catch (_error) { }
}

const saveUser = async () => {
  try {
    saving.value = true

    // 简单验证
    if (
      !(
        currentUser.value.username &&
        currentUser.value.name &&
        currentUser.value.email
      )
    ) {
      throw new Error("请填写必填字段")
    }

    if (
      !isEditing.value &&
      currentUser.value.password !== currentUser.value.confirmPassword
    ) {
      throw new Error("两次输入的密码不一致")
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (isEditing.value) {
      const index = mockUsers.value.findIndex(
        (u) => u.id === currentUser.value.id
      )
      if (index !== -1) {
        mockUsers.value[index] = {
          ...mockUsers.value[index],
          id: mockUsers.value[index]?.id || currentUser.value.id,
          username: currentUser.value.username,
          name: currentUser.value.name,
          email: currentUser.value.email,
          phone: currentUser.value.phone,
          department_id: currentUser.value.department_id,
          role_id: currentUser.value.role_id,
          status: mockUsers.value[index]?.status ?? "active",
          remarks: currentUser.value.remarks,
          updated_at: new Date(),
          is_online: mockUsers.value[index]?.is_online ?? false,
          last_login: mockUsers.value[index]?.last_login ?? new Date(),
          login_count: mockUsers.value[index]?.login_count ?? 0,
          created_at: mockUsers.value[index]?.created_at ?? new Date(),
        }
      }
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        username: currentUser.value.username,
        name: currentUser.value.name,
        email: currentUser.value.email,
        phone: currentUser.value.phone,
        avatar: "",
        department_id: currentUser.value.department_id,
        role_id: currentUser.value.role_id,
        status: "active",
        is_online: false,
        last_login: new Date(),
        login_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        remarks: currentUser.value.remarks,
      }
      mockUsers.value.push(newUser)
    }

    closeUserModal()
  } catch (_error) {
  } finally {
    saving.value = false
  }
}

const closeUserModal = () => {
  showUserModal.value = false
  isEditing.value = false
}

const confirmResetPassword = async () => {
  try {
    resetting.value = true

    if (newPassword.value !== confirmNewPassword.value) {
      throw new Error("两次输入的密码不一致")
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    closePasswordModal()
  } catch (_error) {
  } finally {
    resetting.value = false
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  resetPasswordUser.value = null
  newPassword.value = ""
  confirmNewPassword.value = ""
}

// 监听分页变化
watch([pageSize, filteredUsers], () => {
  currentPage.value = 1
})
</script>
