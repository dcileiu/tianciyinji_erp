<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        系统设置
      </h1>
      <p class="text-gray-600 mt-1">
        管理系统用户、角色权限和系统配置
      </p>
    </div>

    <UTabs v-model="activeTab" :items="tabs" class="w-full">
      <!-- 用户管理 -->
      <template #users>
        <div class="space-y-6">
          <!-- 用户统计卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">
                    总用户数
                  </p>
                  <p class="text-2xl font-bold text-blue-600">
                    {{ userStats.total }}
                  </p>
                </div>
                <UIcon name="i-heroicons-users" class="w-8 h-8 text-blue-500" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">
                    启用用户
                  </p>
                  <p class="text-2xl font-bold text-green-600">
                    {{ userStats.active }}
                  </p>
                </div>
                <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">
                    禁用用户
                  </p>
                  <p class="text-2xl font-bold text-red-600">
                    {{ userStats.inactive }}
                  </p>
                </div>
                <UIcon name="i-heroicons-x-circle" class="w-8 h-8 text-red-500" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">
                    管理员
                  </p>
                  <p class="text-2xl font-bold text-purple-600">
                    {{ userStats.admin }}
                  </p>
                </div>
                <UIcon name="i-heroicons-shield-check" class="w-8 h-8 text-purple-500" />
              </div>
            </UCard>
          </div>

          <!-- 用户操作栏 -->
          <div class="flex flex-col sm:flex-row gap-4 justify-between">
            <div class="flex flex-col sm:flex-row gap-4">
              <UInput
                v-model="userFilters.search"
                placeholder="搜索用户..."
                icon="i-heroicons-magnifying-glass"
                class="w-full sm:w-64"
                @input="debouncedUserSearch"
              />
              <USelectMenu
                v-model="userFilters.role"
                :options="roleOptions"
                placeholder="选择角色"
                class="w-full sm:w-40"
                @change="loadUsers"
              />
              <USelectMenu
                v-model="userFilters.status"
                :options="statusOptions"
                placeholder="选择状态"
                class="w-full sm:w-32"
                @change="loadUsers"
              />
            </div>
            <UButton
              icon="i-heroicons-plus"
              @click="openUserModal()"
            >
              新增用户
            </UButton>
          </div>

          <!-- 用户列表 -->
          <UCard>
            <UTable
              :rows="users"
              :columns="userColumns"
              :loading="userLoading"
              class="w-full"
            >
              <template #role-data="{ row }">
                <UBadge
                  :color="row.role?.status === 'active' ? 'green' : 'red'"
                  variant="subtle"
                >
                  {{ row.role?.display_name || '未分配' }}
                </UBadge>
              </template>
              <template #status-data="{ row }">
                <UBadge
                  :color="row.status_color"
                  variant="subtle"
                >
                  {{ row.status_text }}
                </UBadge>
              </template>
              <template #actions-data="{ row }">
                <div class="flex gap-2">
                  <UButton
                    icon="i-heroicons-pencil"
                    size="sm"
                    variant="ghost"
                    @click="openUserModal(row)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="sm"
                    variant="ghost"
                    color="red"
                    @click="deleteUser(row)"
                  />
                </div>
              </template>
            </UTable>

            <!-- 用户分页 -->
            <div class="flex justify-between items-center mt-4">
              <p class="text-sm text-gray-600">
                显示 {{ (userPagination.page - 1) * userPagination.limit + 1 }} -
                {{ Math.min(userPagination.page * userPagination.limit, userPagination.total) }}
                共 {{ userPagination.total }} 条
              </p>
              <UPagination
                v-model="userPagination.page"
                :page-count="userPagination.limit"
                :total="userPagination.total"
                @update:model-value="loadUsers"
              />
            </div>
          </UCard>
        </div>
      </template>

      <!-- 角色管理 -->
      <template #roles>
        <div class="space-y-6">
          <!-- 角色统计卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">
                    总角色数
                  </p>
                  <p class="text-2xl font-bold text-blue-600">
                    {{ roleStats.total }}
                  </p>
                </div>
                <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-blue-500" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">
                    启用角色
                  </p>
                  <p class="text-2xl font-bold text-green-600">
                    {{ roleStats.active }}
                  </p>
                </div>
                <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500" />
              </div>
            </UCard>
            <UCard>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">
                    禁用角色
                  </p>
                  <p class="text-2xl font-bold text-red-600">
                    {{ roleStats.inactive }}
                  </p>
                </div>
                <UIcon name="i-heroicons-x-circle" class="w-8 h-8 text-red-500" />
              </div>
            </UCard>
          </div>

          <!-- 角色操作栏 -->
          <div class="flex flex-col sm:flex-row gap-4 justify-between">
            <div class="flex flex-col sm:flex-row gap-4">
              <UInput
                v-model="roleFilters.search"
                placeholder="搜索角色..."
                icon="i-heroicons-magnifying-glass"
                class="w-full sm:w-64"
                @input="debouncedRoleSearch"
              />
              <USelectMenu
                v-model="roleFilters.status"
                :options="statusOptions"
                placeholder="选择状态"
                class="w-full sm:w-32"
                @change="loadRoles"
              />
            </div>
            <UButton
              icon="i-heroicons-plus"
              @click="openRoleModal()"
            >
              新增角色
            </UButton>
          </div>

          <!-- 角色列表 -->
          <UCard>
            <UTable
              :rows="roles"
              :columns="roleColumns"
              :loading="roleLoading"
              class="w-full"
            >
              <template #user_count-data="{ row }">
                <span class="text-blue-600 font-medium">{{ row.user_count }}</span>
              </template>
              <template #status-data="{ row }">
                <UBadge
                  :color="row.status_color"
                  variant="subtle"
                >
                  {{ row.status_text }}
                </UBadge>
              </template>
              <template #actions-data="{ row }">
                <div class="flex gap-2">
                  <UButton
                    icon="i-heroicons-pencil"
                    size="sm"
                    variant="ghost"
                    @click="openRoleModal(row)"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    size="sm"
                    variant="ghost"
                    color="red"
                    :disabled="row.name === 'admin' || row.name === 'user'"
                    @click="deleteRole(row)"
                  />
                </div>
              </template>
            </UTable>

            <!-- 角色分页 -->
            <div class="flex justify-between items-center mt-4">
              <p class="text-sm text-gray-600">
                显示 {{ (rolePagination.page - 1) * rolePagination.limit + 1 }} -
                {{ Math.min(rolePagination.page * rolePagination.limit, rolePagination.total) }}
                共 {{ rolePagination.total }} 条
              </p>
              <UPagination
                v-model="rolePagination.page"
                :page-count="rolePagination.limit"
                :total="rolePagination.total"
                @update:model-value="loadRoles"
              />
            </div>
          </UCard>
        </div>
      </template>
    </UTabs>

    <!-- 用户模态框 -->
    <UModal v-model="userModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingUser ? '编辑用户' : '新增用户' }}
          </h3>
        </template>

        <UForm
          :schema="userFormSchema"
          :state="userForm"
          class="space-y-4"
          @submit="saveUser"
        >
          <UFormGroup label="邮箱" name="email">
            <UInput
              v-model="userForm.email"
              type="email"
              placeholder="请输入邮箱"
              :disabled="!!editingUser"
            />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="姓" name="first_name">
              <UInput
                v-model="userForm.first_name"
                placeholder="请输入姓"
              />
            </UFormGroup>
            <UFormGroup label="名" name="last_name">
              <UInput
                v-model="userForm.last_name"
                placeholder="请输入名"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="电话" name="phone">
            <UInput
              v-model="userForm.phone"
              placeholder="请输入电话"
            />
          </UFormGroup>

          <UFormGroup label="角色" name="role_id">
            <USelectMenu
              v-model="userForm.role_id"
              :options="activeRoleOptions"
              placeholder="选择角色"
            />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="部门" name="department">
              <UInput
                v-model="userForm.department"
                placeholder="请输入部门"
              />
            </UFormGroup>
            <UFormGroup label="职位" name="position">
              <UInput
                v-model="userForm.position"
                placeholder="请输入职位"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="状态" name="status">
            <USelectMenu
              v-model="userForm.status"
              :options="statusOptions"
              placeholder="选择状态"
            />
          </UFormGroup>

          <UFormGroup v-if="!editingUser" label="密码" name="password">
            <UInput
              v-model="userForm.password"
              type="password"
              placeholder="请输入密码"
            />
          </UFormGroup>

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              variant="ghost"
              @click="userModalOpen = false"
            >
              取消
            </UButton>
            <UButton
              type="submit"
              :loading="userSaving"
            >
              {{ editingUser ? '更新' : '创建' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- 角色模态框 -->
    <UModal v-model="roleModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingRole ? '编辑角色' : '新增角色' }}
          </h3>
        </template>

        <UForm
          :schema="roleFormSchema"
          :state="roleForm"
          class="space-y-4"
          @submit="saveRole"
        >
          <UFormGroup label="角色名称" name="name">
            <UInput
              v-model="roleForm.name"
              placeholder="请输入角色名称（英文）"
              :disabled="editingRole && (editingRole.name === 'admin' || editingRole.name === 'user')"
            />
          </UFormGroup>

          <UFormGroup label="显示名称" name="display_name">
            <UInput
              v-model="roleForm.display_name"
              placeholder="请输入显示名称"
              :disabled="editingRole && (editingRole.name === 'admin' || editingRole.name === 'user')"
            />
          </UFormGroup>

          <UFormGroup label="描述" name="description">
            <UTextarea
              v-model="roleForm.description"
              placeholder="请输入角色描述"
              rows="3"
            />
          </UFormGroup>

          <UFormGroup label="状态" name="status">
            <USelectMenu
              v-model="roleForm.status"
              :options="statusOptions"
              placeholder="选择状态"
              :disabled="editingRole && (editingRole.name === 'admin' || editingRole.name === 'user')"
            />
          </UFormGroup>

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              variant="ghost"
              @click="roleModalOpen = false"
            >
              取消
            </UButton>
            <UButton
              type="submit"
              :loading="roleSaving"
            >
              {{ editingRole ? '更新' : '创建' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { debounce } from 'lodash-es'

// 页面元数据
definePageMeta({
  title: '系统设置',
  requiresAuth: true
})

// 标签页配置
const activeTab = ref(0)
const tabs = [
  {
    key: 'users',
    label: '用户管理',
    icon: 'i-heroicons-users'
  },
  {
    key: 'roles',
    label: '角色管理',
    icon: 'i-heroicons-user-group'
  }
]

// 用户相关状态
const users = ref([])
const userLoading = ref(false)
const userModalOpen = ref(false)
const editingUser = ref(null)
const userSaving = ref(false)
const userStats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  admin: 0
})

const userPagination = ref({
  page: 1,
  limit: 10,
  total: 0
})

const userFilters = ref({
  search: '',
  role: '',
  status: ''
})

// 角色相关状态
const roles = ref([])
const roleLoading = ref(false)
const roleModalOpen = ref(false)
const editingRole = ref(null)
const roleSaving = ref(false)
const roleStats = ref({
  total: 0,
  active: 0,
  inactive: 0
})

const rolePagination = ref({
  page: 1,
  limit: 10,
  total: 0
})

const roleFilters = ref({
  search: '',
  status: ''
})

// 表单状态
const userForm = ref({
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  role_id: '',
  department: '',
  position: '',
  status: 'active',
  password: ''
})

const roleForm = ref({
  name: '',
  display_name: '',
  description: '',
  status: 'active'
})

// 表单验证
const userFormSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  first_name: z.string().min(1, '请输入姓'),
  last_name: z.string().min(1, '请输入名'),
  phone: z.string().optional(),
  role_id: z.string().min(1, '请选择角色'),
  department: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  password: z.string().min(6, '密码至少6位').optional()
})

const roleFormSchema = z.object({
  name: z.string().min(1, '请输入角色名称').regex(/^[a-zA-Z0-9_]+$/, '角色名称只能包含字母、数字和下划线'),
  display_name: z.string().min(1, '请输入显示名称'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive'])
})

// 表格列配置
const userColumns = [
  { key: 'email', label: '邮箱' },
  { key: 'full_name', label: '姓名' },
  { key: 'phone', label: '电话' },
  { key: 'role', label: '角色' },
  { key: 'department', label: '部门' },
  { key: 'position', label: '职位' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

const roleColumns = [
  { key: 'name', label: '角色名称' },
  { key: 'display_name', label: '显示名称' },
  { key: 'description', label: '描述' },
  { key: 'user_count', label: '用户数' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

// 选项配置
const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
]

const roleOptions = computed(() => [
  { label: '全部', value: '' },
  ...roles.value.map(role => ({
    label: role.display_name,
    value: role.id
  }))
])

const activeRoleOptions = computed(() =>
  roles.value
    .filter(role => role.status === 'active')
    .map(role => ({
      label: role.display_name,
      value: role.id
    }))
)

// 防抖搜索
const debouncedUserSearch = debounce(() => {
  userPagination.value.page = 1
  loadUsers()
}, 300)

const debouncedRoleSearch = debounce(() => {
  rolePagination.value.page = 1
  loadRoles()
}, 300)

// 加载用户列表
const loadUsers = async () => {
  try {
    userLoading.value = true
    const { data } = await $fetch('/api/users', {
      query: {
        page: userPagination.value.page,
        limit: userPagination.value.limit,
        search: userFilters.value.search,
        role_id: userFilters.value.role,
        status: userFilters.value.status
      }
    })

    users.value = data.data
    userPagination.value.total = data.pagination.total

    // 计算统计数据
    calculateUserStats()
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    userLoading.value = false
  }
}

// 加载角色列表
const loadRoles = async () => {
  try {
    roleLoading.value = true
    const { data } = await $fetch('/api/roles', {
      query: {
        page: rolePagination.value.page,
        limit: rolePagination.value.limit,
        search: roleFilters.value.search,
        status: roleFilters.value.status
      }
    })

    roles.value = data.data
    rolePagination.value.total = data.pagination.total

    // 计算统计数据
    calculateRoleStats()
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    roleLoading.value = false
  }
}

// 计算用户统计
const calculateUserStats = () => {
  userStats.value = {
    total: userPagination.value.total,
    active: users.value.filter(u => u.status === 'active').length,
    inactive: users.value.filter(u => u.status === 'inactive').length,
    admin: users.value.filter(u => u.role?.name === 'admin').length
  }
}

// 计算角色统计
const calculateRoleStats = () => {
  roleStats.value = {
    total: rolePagination.value.total,
    active: roles.value.filter(r => r.status === 'active').length,
    inactive: roles.value.filter(r => r.status === 'inactive').length
  }
}

// 打开用户模态框
const openUserModal = (user = null) => {
  editingUser.value = user
  if (user) {
    userForm.value = {
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role_id: user.role_id || '',
      department: user.department || '',
      position: user.position || '',
      status: user.status,
      password: ''
    }
  } else {
    userForm.value = {
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role_id: '',
      department: '',
      position: '',
      status: 'active',
      password: ''
    }
  }
  userModalOpen.value = true
}

// 保存用户
const saveUser = async () => {
  try {
    userSaving.value = true

    if (editingUser.value) {
      // 更新用户
      await $fetch(`/api/users/${editingUser.value.id}`, {
        method: 'PUT',
        body: userForm.value
      })
    } else {
      // 创建用户
      await $fetch('/api/users', {
        method: 'POST',
        body: userForm.value
      })
    }

    userModalOpen.value = false
    await loadUsers()

    // 显示成功消息
    // 这里可以添加 toast 通知
  } catch (error) {
    console.error('保存用户失败:', error)
    // 这里可以添加错误提示
  } finally {
    userSaving.value = false
  }
}

// 删除用户
const deleteUser = async (user) => {
  if (!confirm(`确定要删除用户 ${user.full_name} 吗？`)) {
    return
  }

  try {
    await $fetch(`/api/users/${user.id}`, {
      method: 'DELETE'
    })

    await loadUsers()

    // 显示成功消息
    // 这里可以添加 toast 通知
  } catch (error) {
    console.error('删除用户失败:', error)
    // 这里可以添加错误提示
  }
}

// 打开角色模态框
const openRoleModal = (role = null) => {
  editingRole.value = role
  if (role) {
    roleForm.value = {
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      status: role.status
    }
  } else {
    roleForm.value = {
      name: '',
      display_name: '',
      description: '',
      status: 'active'
    }
  }
  roleModalOpen.value = true
}

// 保存角色
const saveRole = async () => {
  try {
    roleSaving.value = true

    if (editingRole.value) {
      // 更新角色
      await $fetch(`/api/roles/${editingRole.value.id}`, {
        method: 'PUT',
        body: roleForm.value
      })
    } else {
      // 创建角色
      await $fetch('/api/roles', {
        method: 'POST',
        body: roleForm.value
      })
    }

    roleModalOpen.value = false
    await loadRoles()

    // 显示成功消息
    // 这里可以添加 toast 通知
  } catch (error) {
    console.error('保存角色失败:', error)
    // 这里可以添加错误提示
  } finally {
    roleSaving.value = false
  }
}

// 删除角色
const deleteRole = async (role) => {
  if (!confirm(`确定要删除角色 ${role.display_name} 吗？`)) {
    return
  }

  try {
    await $fetch(`/api/roles/${role.id}`, {
      method: 'DELETE'
    })

    await loadRoles()

    // 显示成功消息
    // 这里可以添加 toast 通知
  } catch (error) {
    console.error('删除角色失败:', error)
    // 这里可以添加错误提示
  }
}

// 页面加载时初始化数据
onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>
