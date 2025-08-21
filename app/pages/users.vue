<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">用户管理</h1>
        <p class="text-muted-foreground">管理系统用户账户和权限分配</p>
      </div>
      <Button @click="showCreateDialog = true" class="bg-blue-600 hover:bg-blue-700">
        <Plus class="w-4 h-4 mr-2" />
        新增用户
      </Button>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <div class="p-4">
        <div class="flex gap-4 items-center">
          <Input
            v-model="searchQuery"
            placeholder="搜索用户姓名、邮箱..."
            class="max-w-sm"
          />
          <select v-model="statusFilter" class="px-3 py-2 border rounded-md">
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>
          <select v-model="roleFilter" class="px-3 py-2 border rounded-md">
            <option value="">全部角色</option>
            <option value="admin">管理员</option>
            <option value="manager">经理</option>
            <option value="employee">员工</option>
            <option value="viewer">查看者</option>
          </select>
          <Button variant="outline" @click="resetFilters">
            <RefreshCw class="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </div>
    </Card>

    <!-- 用户列表 -->
    <Card>
      <div class="p-4 border-b">
        <h2 class="text-lg font-semibold">用户列表</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">姓名</th>
              <th class="p-4 font-medium">邮箱</th>
              <th class="p-4 font-medium">角色</th>
              <th class="p-4 font-medium">部门</th>
              <th class="p-4 font-medium">岗位</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">创建时间</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="border-b hover:bg-muted/50">
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-blue-600 font-medium text-sm">{{ user.name[0] }}</span>
                  </div>
                  <span class="font-medium">{{ user.name }}</span>
                </div>
              </td>
              <td class="p-4 text-muted-foreground">{{ user.email }}</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-purple-100 text-purple-800': user.role === 'admin',
                    'bg-blue-100 text-blue-800': user.role === 'manager', 
                    'bg-green-100 text-green-800': user.role === 'employee',
                    'bg-gray-100 text-gray-800': user.role === 'viewer'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getRoleName(user.role) }}
                </span>
              </td>
              <td class="p-4">{{ user.department }}</td>
              <td class="p-4">{{ user.position }}</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': user.status === 'active',
                    'bg-red-100 text-red-800': user.status === 'inactive'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ user.status === 'active' ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="p-4 text-sm text-muted-foreground">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="editUser(user)">
                    <Edit3 class="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" @click="resetPassword(user.id)">
                    <Key class="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    @click="deleteUser(user.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
        </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="8" class="p-8 text-center text-muted-foreground">
                暂无用户数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 创建/编辑用户对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditDialog ? '编辑用户' : '新增用户' }}
        </h3>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">姓名</label>
            <Input v-model="formData.name" placeholder="请输入用户姓名" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">邮箱</label>
            <Input 
              v-model="formData.email" 
              type="email"
              placeholder="请输入邮箱地址" 
              required 
              :disabled="showEditDialog"
            />
          </div>
          
          <div v-if="!showEditDialog">
            <label class="block text-sm font-medium mb-1">初始密码</label>
            <Input 
              v-model="formData.password" 
              type="password"
              placeholder="请输入初始密码" 
              required 
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">角色</label>
            <select v-model="formData.role" class="w-full px-3 py-2 border rounded-md" required>
              <option value="">请选择角色</option>
              <option value="admin">管理员</option>
              <option value="manager">经理</option>
              <option value="employee">员工</option>
              <option value="viewer">查看者</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">部门</label>
            <Input v-model="formData.department" placeholder="请输入部门" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">岗位</label>
            <Input v-model="formData.position" placeholder="请输入岗位" required />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">状态</label>
            <select v-model="formData.status" class="w-full px-3 py-2 border rounded-md">
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
          
          <div class="flex gap-3 pt-4">
            <Button type="submit" class="flex-1">
              {{ showEditDialog ? '更新' : '创建' }}
            </Button>
            <Button type="button" variant="outline" @click="cancelForm" class="flex-1">
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Edit3, Key, Trash2 } from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '用户管理 - ERP 管理系统'
})

// 数据管理
const { users, createUser, updateUser, deleteUser: removeUser, refreshUsers } = useUsers()

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentEditId = ref<string | null>(null)

// 表单数据
const formData = ref({
  name: '',
  email: '',
  password: '',
  role: '',
  department: '',
  position: '',
  status: 'active'
})

// 计算属性
const filteredUsers = computed(() => {
  let filtered = users.value
  
  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }
  
  // 角色过滤
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }
  
  return filtered
})

// 方法
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  roleFilter.value = ''
}

const getRoleName = (role: string) => {
  const roleNames = {
    admin: '管理员',
    manager: '经理',
    employee: '员工',
    viewer: '查看者'
  }
  return roleNames[role as keyof typeof roleNames] || role
}

const editUser = (user: any) => {
  formData.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    department: user.department,
    position: user.position,
    status: user.status
  }
  currentEditId.value = user.id
  showEditDialog.value = true
}

const resetPassword = async (userId: string) => {
  if (confirm('确定要重置该用户的密码吗？')) {
    // TODO: 实现密码重置逻辑
    console.log('重置密码:', userId)
  }
}

const deleteUser = async (id: string) => {
  if (confirm('确定要删除这个用户吗？')) {
    await removeUser(id)
    await refreshUsers()
  }
}

const submitForm = async () => {
  try {
    if (showEditDialog.value && currentEditId.value) {
      const { password, ...userData } = formData.value
      await updateUser(currentEditId.value, userData)
    } else {
      await createUser(formData.value)
    }
    
    await refreshUsers()
    cancelForm()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const cancelForm = () => {
  showCreateDialog.value = false
  showEditDialog.value = false
  currentEditId.value = null
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    position: '',
    status: 'active'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化数据
onMounted(async () => {
  await refreshUsers()
})
</script> 