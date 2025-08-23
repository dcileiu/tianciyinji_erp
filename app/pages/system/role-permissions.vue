<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">角色权限配置</h1>
        <p class="text-muted-color mt-1">
          管理系统角色及其对应的菜单和资源权限
        </p>
      </div>
      
      <div class="flex items-center gap-3">
        <Button
          v-if="canCreate"
          label="添加角色"
          icon="pi pi-plus"
          @click="openCreateRoleDialog"
        />
      </div>
    </div>
    
    <!-- 角色列表和权限配置 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：角色列表 -->
      <div class="lg:col-span-1">
        <Card>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-color">角色列表</h3>
            </div>
          </template>
          
          <template #content>
            <!-- 搜索框 -->
            <div class="mb-4">
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search"></i>
                </InputIcon>
                <InputText
                v-model="roleSearchQuery"
                placeholder="搜索角色..."
                  class="w-full"
              />
              </IconField>
          </div>
          
          <div class="max-h-96 overflow-y-auto">
            <div v-if="loadingRoles" class="flex items-center justify-center py-8">
                <ProgressSpinner style="width: 30px; height: 30px" stroke-width="3" />
                <span class="ml-2 text-muted-color">加载中...</span>
            </div>
            
            <div v-else-if="filteredRoles.length === 0" class="text-center py-8">
                <i class="pi pi-users text-4xl text-muted-color opacity-50 mb-2"></i>
                <p class="text-muted-color">暂无角色数据</p>
            </div>
            
              <div v-else class="space-y-2">
              <div
                v-for="role in filteredRoles"
                :key="role.id"
                :class="[
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedRole?.id === role.id
                      ? 'border-primary bg-primary-50 dark:bg-primary-900/20'
                      : 'border-surface-300 hover:border-primary-300 hover:bg-surface-50',
                ]"
                @click="selectRole(role)"
              >
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <i class="pi pi-shield text-primary text-lg"></i>
                      </div>
                      <div>
                        <h4 class="font-medium text-color">{{ role.name }}</h4>
                        <p class="text-sm text-muted-color">{{ role.description }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-1">
                      <Button
                        v-if="canEdit"
                        v-tooltip="'编辑角色'"
                        icon="pi pi-pencil"
                        rounded
                        text
                        size="small"
                        @click.stop="editRole(role)"
                      />
                      <Button
                        v-if="canDelete && !role.is_system"
                        v-tooltip="'删除角色'"
                        icon="pi pi-trash"
                        rounded
                        text
                        size="small"
                        severity="danger"
                        @click.stop="confirmDeleteRole(role)"
                      />
                    </div>
                  </div>
                  
                  <div class="mt-2 flex items-center space-x-4 text-xs text-muted-color">
                    <span>{{ role.user_count || 0 }} 个用户</span>
                    <span>{{ role.menu_count || 0 }} 个菜单</span>
                    <span>{{ role.resource_count || 0 }} 个资源</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
      
      <!-- 右侧：权限配置 -->
      <div class="lg:col-span-2">
        <div v-if="!selectedRole" class="text-center py-20">
          <i class="pi pi-arrow-left text-6xl text-muted-color opacity-50 mb-4"></i>
          <h3 class="text-lg font-medium text-color mb-2">选择角色</h3>
          <p class="text-muted-color">请从左侧列表中选择一个角色来配置权限</p>
        </div>
        
        <div v-else class="space-y-6">
          <!-- 选中角色信息 -->
          <Card>
            <template #content>
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <i class="pi pi-shield text-primary text-xl"></i>
                  </div>
                <div>
                    <h2 class="text-xl font-semibold text-color">{{ selectedRole.name }}</h2>
                    <p class="text-muted-color">{{ selectedRole.description }}</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Tag
                    :value="selectedRole.is_system ? '系统角色' : '自定义角色'"
                    :severity="selectedRole.is_system ? 'warn' : 'info'"
                  />
                  <Tag
                    :value="selectedRole.status === 'active' ? '启用' : '停用'"
                    :severity="selectedRole.status === 'active' ? 'success' : 'warn'"
                  />
                </div>
              </div>
            </template>
          </Card>
          
          <!-- 权限配置选项卡 -->
          <TabView>
            <!-- 菜单权限 -->
            <TabPanel value="0">
              <template #header>
                <i class="pi pi-bars mr-2"></i>
                菜单权限
              </template>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-muted-color">
                    配置该角色可以访问的系统菜单
                  </p>
                  <Button
                    label="保存菜单权限"
                    icon="pi pi-save"
                    size="small"
                    :loading="savingPermissions"
                    @click="saveMenuPermissions"
                  />
                </div>
                
                <div class="border border-surface-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <Tree
                    v-model:selection-keys="selectedMenus"
                    :value="menuTree"
                    selection-mode="checkbox"
                    :filter="true"
                    filter-placeholder="搜索菜单..."
                    class="w-full"
                  >
                    <template #default="slotProps">
                      <div class="flex items-center">
                        <i :class="slotProps.node.icon || 'pi pi-circle'" class="mr-2"></i>
                        <span>{{ slotProps.node.label }}</span>
                        <span v-if="slotProps.node.path" class="ml-2 text-xs text-muted-color">
                          ({{ slotProps.node.path }})
                        </span>
                      </div>
                    </template>
                  </Tree>
                </div>
              </div>
            </TabPanel>
          
            <!-- 资源权限 -->
            <TabPanel value="1">
              <template #header>
                <i class="pi pi-database mr-2"></i>
                资源权限
              </template>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-muted-color">
                    配置该角色可以访问的系统资源和操作
                  </p>
                  <Button
                    label="保存资源权限"
                    icon="pi pi-save"
                    size="small"
                    :loading="savingPermissions"
                    @click="saveResourcePermissions"
                />
              </div>
              
                <div class="space-y-4">
                  <div v-for="category in resourceCategories" :key="category.id" class="border border-surface-300 rounded-lg">
                    <div class="p-3 bg-surface-50 border-b border-surface-300">
                      <div class="flex items-center justify-between">
                        <h4 class="font-medium text-color">{{ category.name }}</h4>
                        <div class="flex items-center space-x-2">
                          <Button
                            label="全选"
                            text
                            size="small"
                            @click="selectAllInCategory(category)"
                          />
                          <Button
                            label="清空"
                            text
                            size="small"
                            @click="clearAllInCategory(category)"
                />
              </div>
            </div>
          </div>
                    
                    <div class="p-3">
                      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div
                          v-for="resource in category.resources"
                          :key="resource.id"
                          class="flex items-center"
                        >
                          <Checkbox
                            v-model="selectedResources"
                            :input-id="resource.id"
                            :value="resource.id"
                          />
                          <label :for="resource.id" class="ml-2 text-sm cursor-pointer">
                            {{ resource.name }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
    
    <!-- 角色对话框 -->
    <Dialog
      v-model:visible="showRoleDialog"
      :header="editingRole ? '编辑角色' : '添加角色'"
      :style="{ width: '500px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">角色名称 *</label>
            <InputText
              v-model="roleForm.name"
              placeholder="请输入角色名称"
              required
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">角色编码 *</label>
            <InputText
              v-model="roleForm.code"
              placeholder="请输入角色编码"
              :disabled="editingRole && editingRole.is_system"
              required
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">描述</label>
            <Textarea
              v-model="roleForm.description"
              placeholder="请输入角色描述"
              :rows="3"
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
            :loading="savingPermissions"
            @click="saveRole"
          />
        </div>
      </template>
    </Dialog>
    
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Tree from 'primevue/tree'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Tag from 'primevue/tag'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '角色权限配置 - ERP 管理系统'
})

// 权限检查
const canCreate = ref(true)
const canEdit = ref(true)
const canDelete = ref(true)

// 状态管理
const loadingRoles = ref(false)
const savingPermissions = ref(false)
const roles = ref([] as any[])
const menus = ref([] as any[])
const resources = ref([] as any[])
const selectedRole = ref(null as any)
const showRoleDialog = ref(false)
const editingRole = ref(null as any)
const confirm = useConfirm()

// 搜索和筛选
const roleSearchQuery = ref('')

// 权限选择状态
const selectedMenus = ref({} as Record<string, any>)
const selectedResources = ref([] as string[])

// 表单数据
const roleForm = ref({
  name: '',
  code: '',
  description: '',
  status: 'active'
})

// 选项数据
const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
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
    created_at: new Date('2024-01-01')
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
    created_at: new Date('2024-01-02')
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
    created_at: new Date('2024-01-03')
  }
])

// 菜单树数据
const menuTree = ref([
  {
    key: 'dashboard',
    label: '仪表盘',
    icon: 'pi pi-home',
    path: '/dashboard'
  },
  {
    key: 'master-data',
    label: '基础数据',
    icon: 'pi pi-database',
    children: [
      { key: 'products', label: '产品管理', icon: 'pi pi-box', path: '/master-data/products' },
      { key: 'customers', label: '客户管理', icon: 'pi pi-users', path: '/master-data/customers' },
      { key: 'suppliers', label: '供应商管理', icon: 'pi pi-truck', path: '/master-data/suppliers' }
    ]
  },
  {
    key: 'sales',
    label: '销售管理',
    icon: 'pi pi-shopping-cart',
    children: [
      { key: 'sales-orders', label: '销售订单', icon: 'pi pi-file', path: '/sales/orders' },
      { key: 'sales-customers', label: '客户管理', icon: 'pi pi-users', path: '/sales/customers' }
    ]
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'pi pi-cog',
    children: [
      { key: 'users', label: '用户管理', icon: 'pi pi-users', path: '/users' },
      { key: 'roles', label: '角色管理', icon: 'pi pi-shield', path: '/system/roles' },
      { key: 'permissions', label: '权限配置', icon: 'pi pi-key', path: '/system/role-permissions' }
    ]
  }
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
      { id: 'user:import', name: '导入用户' }
    ]
  },
  {
    id: 'role',
    name: '角色管理',
    resources: [
      { id: 'role:view', name: '查看角色' },
      { id: 'role:create', name: '新增角色' },
      { id: 'role:edit', name: '编辑角色' },
      { id: 'role:delete', name: '删除角色' },
      { id: 'role:assign', name: '分配角色' }
    ]
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
      { id: 'product:price', name: '价格管理' }
    ]
  }
])

// 计算属性
const filteredRoles = computed(() => {
  if (!roleSearchQuery.value) {
    return mockRoles.value
  }
  
  const query = roleSearchQuery.value.toLowerCase()
  return mockRoles.value.filter(role => 
    role.name.toLowerCase().includes(query)
    || role.code.toLowerCase().includes(query)
    || role.description.toLowerCase().includes(query)
  )
})

// 方法
const selectRole = (role: any) => {
  selectedRole.value = role
  loadRolePermissions(role)
}

const loadRolePermissions = async (role: any) => {
  // 模拟加载角色权限
  selectedMenus.value = {
    'dashboard': { checked: true, partialChecked: false },
    'master-data': { checked: true, partialChecked: false },
    'products': { checked: true, partialChecked: false }
  }
  
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
      const index = mockRoles.value.findIndex(r => r.id === editingRole.value.id)
      if (index !== -1) {
        mockRoles.value[index].name = roleForm.value.name
        mockRoles.value[index].code = roleForm.value.code
        mockRoles.value[index].description = roleForm.value.description
        mockRoles.value[index].status = roleForm.value.status
      }
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
        created_at: new Date()
      }
      mockRoles.value.push(newRole)
    }
    
    closeRoleDialog()
  }
  catch (error) {
    console.error('保存角色失败:', error)
  }
  finally {
    savingPermissions.value = false
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
  mockRoles.value = mockRoles.value.filter(role => role.id !== roleId)
  if (selectedRole.value?.id === roleId) {
    selectedRole.value = null
  }
}

const saveMenuPermissions = async () => {
  savingPermissions.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('保存菜单权限:', selectedMenus.value)
  }
  catch (error) {
    console.error('保存菜单权限失败:', error)
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
  }
  catch (error) {
    console.error('保存资源权限失败:', error)
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
