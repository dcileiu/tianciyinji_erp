<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-color">角色管理</h1>
        <p class="text-muted-color">管理系统角色和权限配置</p>
      </div>
      <PermissionWrapper :has-permission="canCreateRole">
        <Button 
          label="新增角色" 
          icon="pi pi-plus"
          @click="openCreateDialog"
        />
      </PermissionWrapper>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-600 dark:text-blue-400 text-sm font-medium">总角色数</p>
              <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ roleStats.totalRoles }}</p>
            </div>
            <div class="bg-blue-100 dark:bg-blue-800 p-3 rounded-full">
              <i class="pi pi-shield text-blue-600 dark:text-blue-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-green-50 dark:bg-green-900/20 border-green-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-600 dark:text-green-400 text-sm font-medium">活跃角色</p>
              <p class="text-2xl font-bold text-green-900 dark:text-green-100">{{ roleStats.activeRoles }}</p>
            </div>
            <div class="bg-green-100 dark:bg-green-800 p-3 rounded-full">
              <i class="pi pi-check-circle text-green-600 dark:text-green-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-600 dark:text-orange-400 text-sm font-medium">系统角色</p>
              <p class="text-2xl font-bold text-orange-900 dark:text-orange-100">{{ roleStats.systemRoles }}</p>
            </div>
            <div class="bg-orange-100 dark:bg-orange-800 p-3 rounded-full">
              <i class="pi pi-cog text-orange-600 dark:text-orange-400 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-600 dark:text-purple-400 text-sm font-medium">自定义角色</p>
              <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">{{ roleStats.customRoles }}</p>
            </div>
            <div class="bg-purple-100 dark:bg-purple-800 p-3 rounded-full">
              <i class="pi pi-user text-purple-600 dark:text-purple-400 text-xl"></i>
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
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">搜索角色</label>
            <InputText
              v-model="searchQuery"
              placeholder="角色名称、描述..."
              class="w-full"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">角色类型</label>
            <Dropdown
              v-model="selectedType"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="全部类型"
              class="w-full"
              show-clear
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">状态</label>
            <Dropdown
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              class="w-full"
              show-clear
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color opacity-0">操作</label>
            <Button
              label="重置筛选"
              icon="pi pi-refresh"
              outlined
              class="w-full"
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 角色列表 -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">角色列表</h3>
      </template>
      <template #content>
        <DataTable
          :value="filteredRoles"
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
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-shield text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无角色数据</h3>
              <p class="mb-4">开始创建第一个角色</p>
              <Button
                label="新增角色"
                icon="pi pi-plus"
                @click="openCreateDialog"
              />
              </div>
          </template>

          <Column field="name" header="角色信息" :sortable="true">
            <template #body="slotProps">
              <div>
                <p class="font-medium text-color">{{ slotProps.data.name }}</p>
                <p class="text-sm text-muted-color">{{ slotProps.data.description }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <Tag
                    :value="getTypeDisplayName(slotProps.data.type)"
                    :severity="getTypeSeverity(slotProps.data.type)"
                    size="small"
                  />
                  <span class="text-xs text-muted-color">
                    {{ slotProps.data.permissions?.length || 0 }} 项权限
                  </span>
                </div>
              </div>
            </template>
          </Column>

          <Column field="status" header="状态" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>

          <Column field="user_count" header="关联用户">
            <template #body="slotProps">
              <span class="text-sm">{{ slotProps.data.user_count || 0 }} 个用户</span>
            </template>
          </Column>

          <Column field="created_at" header="创建时间" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.created_at) }}
              </span>
            </template>
          </Column>

          <Column header="操作" style="width: 150px">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button
                  v-tooltip="'查看权限'"
                  icon="pi pi-eye"
                  outlined
                  rounded
                  size="small"
                  @click="viewRole(slotProps.data)"
                />
                  <PermissionWrapper :has-permission="canEditRole">
                  <Button
                    v-tooltip="'编辑'"
                    icon="pi pi-pencil"
                    outlined
                    rounded
                    size="small"
                    @click="editRole(slotProps.data)"
                  />
                  </PermissionWrapper>
                  <PermissionWrapper :has-permission="canDeleteRole">
                  <Button
                    v-tooltip="'删除'"
                    icon="pi pi-trash"
                    outlined
                    rounded
                    size="small"
                    severity="danger"
                    :disabled="slotProps.data.type === 'system'"
                    @click="confirmDeleteRole(slotProps.data)"
                  />
                  </PermissionWrapper>
            </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 角色对话框 -->
    <Dialog
      v-model:visible="showRoleDialog"
      :header="editingRole ? '编辑角色' : '新增角色'"
      :style="{ width: '800px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-6">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-color border-b pb-2">基本信息</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-color">角色名称 *</label>
                <InputText
                v-model="roleForm.name"
                placeholder="请输入角色名称"
                  required
              />
            </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-color">角色类型</label>
                <Dropdown
                  v-model="roleForm.type"
                  :options="typeOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="选择类型"
                  :disabled="editingRole && editingRole.type === 'system'"
              />
          </div>
          
              <div class="space-y-2 md:col-span-2">
                <label class="block text-sm font-medium text-color">角色描述</label>
            <Textarea
              v-model="roleForm.description"
              placeholder="请输入角色描述"
                  :rows="2"
            />
          </div>
          
              <div class="space-y-2">
                <label class="block text-sm font-medium text-color">状态</label>
                <Dropdown
              v-model="roleForm.status"
                  :options="statusOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="选择状态"
                />
              </div>
            </div>
          </div>

          <!-- 权限配置 -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-color border-b pb-2">权限配置</h4>
            <div class="bg-surface-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <Tree
                v-model:selection-keys="selectedPermissions"
                :value="permissionTree"
                selection-mode="checkbox"
                :filter="true"
                filter-placeholder="搜索权限..."
                class="w-full"
              >
                <template #default="slotProps">
                  <div class="flex items-center">
                    <i :class="slotProps.node.icon" class="mr-2"></i>
                    <span>{{ slotProps.node.label }}</span>
                    <span v-if="slotProps.node.description" class="ml-2 text-xs text-muted-color">
                      ({{ slotProps.node.description }})
                    </span>
                  </div>
                </template>
              </Tree>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            icon="pi pi-times"
            outlined
            @click="closeRoleDialog"
          />
          <Button
            label="保存"
            icon="pi pi-check"
            :loading="submitting"
            @click="submitRole"
          />
        </div>
      </template>
    </Dialog>

    <!-- 权限查看对话框 -->
    <Dialog
      v-model:visible="showPermissionDialog"
      header="角色权限详情"
      :style="{ width: '600px' }"
      modal
    >
      <template #default>
        <div v-if="viewingRole" class="space-y-4">
          <div>
            <h4 class="font-semibold text-color mb-2">{{ viewingRole.name }}</h4>
            <p class="text-sm text-muted-color">{{ viewingRole.description }}</p>
          </div>

          <Divider />

          <div v-if="viewingRole.permissions && viewingRole.permissions.length > 0">
            <h5 class="font-medium text-color mb-3">权限列表</h5>
            <div class="space-y-2">
              <div 
                v-for="permission in viewingRole.permissions"
                :key="permission"
                class="flex items-center p-2 bg-surface-50 rounded"
              >
                <i class="pi pi-check text-green-600 mr-2"></i>
                <span class="text-sm">{{ getPermissionName(permission) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-muted-color">
            <i class="pi pi-shield text-4xl mb-2 opacity-50"></i>
            <p>该角色暂无权限配置</p>
          </div>
        </div>
      </template>

      <template #footer>
        <Button
          label="关闭"
          icon="pi pi-times"
          outlined
          @click="showPermissionDialog = false"
        />
      </template>
    </Dialog>

    <!-- 确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import Tree from 'primevue/tree'
import Divider from 'primevue/divider'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '角色管理 - ERP 管理系统'
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
const confirm = useConfirm()
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
  customRoles: 0
})

// 表单数据
const roleForm = reactive({
  name: '',
  description: '',
  type: 'custom',
  status: 'active',
  permissions: []
})

// 选项数据
const typeOptions = ref([
  { label: '全部类型', value: '' },
  { label: '系统角色', value: 'system' },
  { label: '自定义角色', value: 'custom' }
])

const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
])

// 权限树数据
const permissionTree = ref([
  {
    key: 'user',
    label: '用户管理',
    icon: 'pi pi-users',
    children: [
      { key: 'user:view', label: '查看用户', icon: 'pi pi-eye' },
      { key: 'user:create', label: '新增用户', icon: 'pi pi-plus' },
      { key: 'user:edit', label: '编辑用户', icon: 'pi pi-pencil' },
      { key: 'user:delete', label: '删除用户', icon: 'pi pi-trash' }
    ]
  },
  {
    key: 'role',
    label: '角色管理',
    icon: 'pi pi-shield',
    children: [
      { key: 'role:view', label: '查看角色', icon: 'pi pi-eye' },
      { key: 'role:create', label: '新增角色', icon: 'pi pi-plus' },
      { key: 'role:edit', label: '编辑角色', icon: 'pi pi-pencil' },
      { key: 'role:delete', label: '删除角色', icon: 'pi pi-trash' }
    ]
  },
  {
    key: 'product',
    label: '产品管理',
    icon: 'pi pi-box',
    children: [
      { key: 'product:view', label: '查看产品', icon: 'pi pi-eye' },
      { key: 'product:create', label: '新增产品', icon: 'pi pi-plus' },
      { key: 'product:edit', label: '编辑产品', icon: 'pi pi-pencil' },
      { key: 'product:delete', label: '删除产品', icon: 'pi pi-trash' }
    ]
  }
])

// 模拟角色数据
const roles = ref([
  {
    id: '1',
    name: '超级管理员',
    description: '系统最高权限管理员',
    type: 'system',
    status: 'active',
    permissions: ['user:view', 'user:create', 'user:edit', 'user:delete', 'role:view', 'role:create', 'role:edit', 'role:delete'],
    user_count: 1,
    created_at: new Date('2024-01-01')
  },
  {
    id: '2',
    name: '业务管理员',
    description: '业务模块管理权限',
    type: 'custom',
    status: 'active',
    permissions: ['product:view', 'product:create', 'product:edit'],
    user_count: 3,
    created_at: new Date('2024-01-02')
  },
  {
    id: '3',
    name: '普通用户',
    description: '基础查看权限',
    type: 'custom',
    status: 'active',
    permissions: ['product:view'],
    user_count: 10,
    created_at: new Date('2024-01-03')
  }
] as any[])

// 计算属性
const filteredRoles = computed(() => {
  return roles.value.filter((role) => {
    const matchesSearch = !searchQuery.value 
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
    custom: '自定义'
  }
  return typeMap[type] || type
}

const getTypeSeverity = (type: string): string => {
  const severityMap: Record<string, string> = {
    system: 'warn',
    custom: 'info'
  }
  return severityMap[type] || 'secondary'
}

const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '停用'
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string): string => {
  const severityMap: Record<string, string> = {
    active: 'success',
    inactive: 'warn'
  }
  return severityMap[status] || 'secondary'
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
    'product:delete': '删除产品'
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
    permissions: []
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
    permissions: role.permissions || []
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
    const permissions = Object.keys(selectedPermissions.value).filter(key => 
      selectedPermissions.value[key]?.checked
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
          permissions
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
        created_at: new Date()
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
  confirm.require({
    message: `确定要删除角色 ${role.name} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteRole(role.id)
    }
  })
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
