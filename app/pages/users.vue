<template>
  <div class="flex flex-column gap-6">
    <!-- 页面标题 -->
    <div class="flex align-items-center justify-content-between">
      <div>
        <h1 class="text-3xl font-bold text-color">用户管理</h1>
        <p class="text-muted-color">管理系统用户账户、角色权限和访问控制</p>
      </div>
      <PermissionWrapper :has-permission="canCreateUser">
        <Button @click="openCreateDialog" />
      </PermissionWrapper>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-600 dark:text-blue-400 text-sm font-medium">总用户数</p>
              <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ userStats.totalUsers }}</p>
            </div>
            <div class="bg-blue-100 dark:bg-blue-800 p-3 -full">
              <i class="pi pi-users text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-green-50 dark:bg-green-900/20 border-green-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-600 dark:text-green-400 text-sm font-medium">活跃用户</p>
              <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ userStats.activeUsers }}</p>
            </div>
            <div class="bg-green-100 dark:bg-green-800 p-3 -full">
              <i class="pi pi-user-plus text-green-600 dark:text-green-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-600 dark:text-purple-400 text-sm font-medium">管理员</p>
              <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">{{ userStats.adminUsers }}</p>
            </div>
            <div class="bg-purple-100 dark:bg-purple-800 p-3 -full">
              <i class="pi pi-shield text-purple-600 dark:text-purple-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-red-50 dark:bg-red-900/20 border-red-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-600 dark:text-red-400 text-sm font-medium">停用用户</p>
              <p class="text-2xl font-bold text-red-900 dark:text-red-100">{{ userStats.inactiveUsers }}</p>
            </div>
            <div class="bg-red-100 dark:bg-red-800 p-3 -full">
              <i class="pi pi-user-minus text-red-600 dark:text-red-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 筛选和搜索 -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">筛选条件</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="flex flex-column gap-2">
            <label class="block text-sm font-medium text-color">搜索用户</label>
            <Input v-model="searchQuery" placeholder="用户名、邮箱..." class="w-full" />
          </div>

          <div class="flex flex-column gap-2">
            <label class="block text-sm font-medium text-color">角色</label>
            <Select
              v-model="selectedRole"
              :options="roleOptions"
              option-option-value="value"
              placeholder="全部角色"
              class="w-full"
              show-clear
            />
          </div>

          <div class="flex flex-column gap-2">
            <label class="block text-sm font-medium text-color">状态</label>
            <Select
              v-model="selectedStatus"
              :options="statusOptions"
              option-option-value="value"
              placeholder="全部状态"
              class="w-full"
              show-clear
            />
          </div>

          <div class="flex flex-column gap-2">
            <label class="block text-sm font-medium text-color opacity-0">操作</label>
            <Button class="w-full" @click="resetFilters" />
          </div>
        </div>
      </template>
    </Card>

    <!-- 用户列表 -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">用户列表</h3>
      </template>
      <template #content>
        <Table
          :value="filteredUsers"
          :loading="loading"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
          paginator
          :rows="10"
          :rows-per-page-options="[5, 10, 20, 50]"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="显示 {first} 到 {last} 条，共 {totalRecords} 条记录"
        >
          <template #loading>
            <div class="p-6">
              <div v-for="i in 5" :key="i" class="flex align-items-center gap-4 mb-4">
                <Skeleton shape="circle" size="3rem" />
                <div class="flex-1">
                  <Skeleton width="100%" height="1.5rem" class="mb-2" />
                  <Skeleton width="60%" height="1rem" />
                </div>
                <Skeleton width="6rem" height="1.5rem" />
                <Skeleton width="4rem" height="1.5rem" />
              </div>
            </div>
          </template>

          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-users text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无用户数据</h3>
              <p class="mb-4">开始创建第一个用户</p>
              <Button @click="openCreateDialog" />
            </div>
          </template>

          <TableHead header="用户信息">
            <template #body="slotProps">
              <div class="flex align-items-center gap-3">
                <Avatar
                  :image="slotProps.data.avatar"
                  size="lg"
                  shape="circle"
                />
                <div>
                  <p class="font-medium text-color">{{ slotProps.data.name }}</p>
                  <p class="text-sm text-muted-color">{{ slotProps.data.email }}</p>
                </div>
              </div>
            </template>
          </TableHead>

          <TableHead field="role" header="角色">
            <template #body="slotProps">
              <Tag :value="getRoleDisplayName(slotProps.data.role)" :severity="getRoleSeverity(slotProps.data.role)" />
            </template>
          </TableHead>

          <TableHead field="status" header="状态">
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </TableHead>

          <TableHead field="last_login" header="最后登录">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatLastLogin(slotProps.data.last_login) }}
              </span>
            </template>
          </TableHead>

          <TableHead field="created_at" header="创建时间">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.created_at) }}
              </span>
            </template>
          </TableHead>

          <TableHead header="操作" style="width: 150px">
            <template #body="slotProps">
              <div class="flex gap-2">
                <PermissionWrapper :has-permission="canEditUser">
                  <Button
                    size="sm"
                    @click="viewUser(slotProps.data)"
                  />
                </PermissionWrapper>
                <PermissionWrapper :has-permission="canEditUser">
                  <Button
                    size="sm"
                    @click="editUser(slotProps.data)"
                  />
                </PermissionWrapper>
                <PermissionWrapper :has-permission="canDeleteUser">
                  <Button
                    size="sm"
                    severity="danger"
                    @click="confirmDeleteUser(slotProps.data)"
                  />
                </PermissionWrapper>
              </div>
            </template>
          </TableHead>
        </Table>
      </template>
    </Card>

    <!-- 用户对话框 -->
    <Dialog
      v-model:visible="showUserDialog"
      :header="editingUser ? '编辑用户' : '新增用户'"
      :style="{ width: '600px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <form class="flex flex-column gap-6" @submit.prevent="submitUser">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-column gap-2">
              <label class="block text-sm font-medium text-color">用户名 *</label>
              <Input v-model="userForm.name" placeholder="请输入用户名" required />
            </div>

            <div class="flex flex-column gap-2">
              <label class="block text-sm font-medium text-color">邮箱 *</label>
              <Input v-model="userForm.email" type="email" placeholder="请输入邮箱" required />
            </div>

            <div class="flex flex-column gap-2">
              <label class="block text-sm font-medium text-color">角色 *</label>
              <Select
                v-model="userForm.role"
                :options="roleOptions"
                option-option-value="value"
                placeholder="选择角色"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">状态</label>
              <Select
                v-model="userForm.status"
                :options="statusOptions"
                option-option-value="value"
                placeholder="选择状态"
              />
            </div>

            <div v-if="!editingUser" class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-color">初始密码 *</label>
              <Input
                v-model="userForm.password"
                type="password"
                placeholder="请输入初始密码"
                :feedback="false"
                toggle-mask
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">备注</label>
            <Textarea v-model="userForm.remark" placeholder="请输入备注信息" :rows="3" />
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeUserDialog" />
          <Button :loading="submitting" @click="submitUser" />
        </div>
      </template>
    </Dialog>

    <!-- 确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script setup lang="ts">
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '用户管理 - ERP 管理系统',
})

// 响应式数据
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showUserDialog = ref(false)
const editingUser = ref(null)
const submitting = ref(false)
const loading = ref(false)
// const confirm = useConfirm() // 已移除
// 权限检查（模拟）
const canCreateUser = ref(true)
const canEditUser = ref(true)
const canDeleteUser = ref(true)

// 统计数据
const userStats = reactive({
  totalUsers: 0,
  activeUsers: 0,
  adminUsers: 0,
  inactiveUsers: 0,
})

// 表单数据
const userForm = reactive({
  name: '',
  email: '',
  role: '',
  status: 'active',
  password: '',
  remark: '',
})

// 选项数据
const roleOptions = ref([
  { label: '全部角色', value: '' },
  { label: '超级管理员', value: 'super_admin' },
  { label: '系统管理员', value: 'admin' },
  { label: '业务管理员', value: 'business_admin' },
  { label: '普通用户', value: 'user' },
  { label: '只读用户', value: 'readonly' },
])

const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '正常', value: 'active' },
  { label: '停用', value: 'inactive' },
  { label: '锁定', value: 'locked' },
])

// 模拟用户数据
const users = ref([
  {
    id: '1',
    name: '系统管理员',
    email: 'admin@example.com',
    role: 'super_admin',
    status: 'active',
    last_login: new Date('2024-01-15T10:30:00'),
    created_at: new Date('2024-01-01'),
    avatar: null,
    remark: '',
  },
  {
    id: '2',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: 'active',
    last_login: new Date('2024-01-14T16:45:00'),
    created_at: new Date('2024-01-02'),
    avatar: null,
    remark: '',
  },
  {
    id: '3',
    name: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    last_login: new Date('2024-01-13T09:15:00'),
    created_at: new Date('2024-01-03'),
    avatar: null,
    remark: '',
  },
  {
    id: '4',
    name: '王五',
    email: 'wangwu@example.com',
    role: 'user',
    status: 'inactive',
    last_login: new Date('2024-01-10T14:20:00'),
    created_at: new Date('2024-01-04'),
    avatar: null,
    remark: '',
  },
] as any[])

// 计算属性
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const matchesSearch
      = !searchQuery.value
        || user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        || user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = !selectedRole.value || user.role === selectedRole.value
    const matchesStatus = !selectedStatus.value || user.status === selectedStatus.value

    return matchesSearch && matchesRole && matchesStatus
  })
})

// 方法
const getRoleDisplayName = (role: string): string => {
  const roleMap: Record<string, string> = {
    super_admin: '超级管理员',
    admin: '系统管理员',
    business_admin: '业务管理员',
    user: '普通用户',
    readonly: '只读用户',
  }
  return roleMap[role] || role
}

const getRoleSeverity = (role: string): string => {
  const severityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    super_admin: 'destructive',
    admin: 'outline',
    business_admin: 'secondary',
    user: 'default',
    readonly: 'secondary',
  }
  return severityMap[role] || 'secondary'
}

const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    locked: '锁定',
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string): string => {
  const severityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    active: 'default',
    inactive: 'outline',
    locked: 'destructive',
  }
  return severityMap[status] || 'secondary'
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN')
}

const formatLastLogin = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  }
  else if (days === 1) {
    return '昨天'
  }
  else if (days < 7) {
    return `${days}天前`
  }
  else {
    return date.toLocaleDateString('zh-CN')
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedRole.value = ''
  selectedStatus.value = ''
}

const openCreateDialog = () => {
  editingUser.value = null
  Object.assign(userForm, {
    name: '',
    email: '',
    role: '',
    status: 'active',
    password: '',
    remark: '',
  })
  showUserDialog.value = true
}

const closeUserDialog = () => {
  showUserDialog.value = false
  editingUser.value = null
}

const viewUser = (user: any) => {
  console.log('查看用户:', user)
}

const editUser = (user: any) => {
  editingUser.value = user
  Object.assign(userForm, {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    remark: user.remark || '',
  })
  showUserDialog.value = true
}

const submitUser = async () => {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingUser.value) {
      // 更新用户
      const index = users.value.findIndex(u => u.id === (editingUser.value as any).id)
      if (index !== -1) {
        Object.assign(users.value[index], {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          status: userForm.status,
          remark: userForm.remark,
        })
      }
    }
    else {
      // 新增用户
      const newUser = {
        id: Date.now().toString(),
        ...userForm,
        last_login: new Date(),
        created_at: new Date(),
        avatar: null,
      }
      users.value.push(newUser)
    }

    closeUserDialog()
    updateStats()
  }
  catch (error) {
    console.error('保存用户失败:', error)
  }
  finally {
    submitting.value = false
  }
}

const confirmDeleteUser = (_user: any) => {
  // TODO: 需要重新实现确认对话框
}

const updateStats = () => {
  userStats.totalUsers = users.value.length
  userStats.activeUsers = users.value.filter(u => u.status === 'active').length
  userStats.adminUsers = users.value.filter(u => u.role.includes('admin')).length
  userStats.inactiveUsers = users.value.filter(u => u.status === 'inactive').length
}

// 初始化
onMounted(() => {
  updateStats()
})
</script>
