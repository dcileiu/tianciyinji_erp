<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">菜单管理</h1>
        <p class="text-muted-color mt-1">管理系统菜单结构和权限</p>
      </div>
      <Button
        label="新增菜单"
        icon="pi pi-plus"
        @click="openCreateDialog"
      />
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <template #content>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText
              v-model="searchQuery"
              placeholder="搜索菜单名称或路径..."
              class="w-full"
              />
            </IconField>
          </div>
          <div class="flex gap-2">
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              show-clear
            />
            <Button
              icon="pi pi-refresh"
              outlined
              @click="refreshMenus"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 菜单树形表格 -->
    <Card>
      <template #content>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <ProgressSpinner style="width: 30px; height: 30px" stroke-width="3" />
          <span class="ml-2 text-muted-color">加载中...</span>
        </div>
        
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600 dark:text-red-400">{{ error }}</p>
          <Button
            label="重新加载"
            icon="pi pi-refresh"
            outlined
            class="mt-4"
            @click="loadMenus"
          />
        </div>
        
        <div v-else>
          <DataTable
            v-model:selection="selectedMenus"
            :value="filteredMenus"
            :loading="loading"
            selection-mode="multiple"
            data-key="id"
            class="p-datatable-sm"
          >
            <Column selection-mode="multiple" header-style="width: 3rem"></Column>
            
            <Column field="name" header="菜单名称" :expander="true">
              <template #body="slotProps">
                <div class="flex items-center space-x-2">
                  <i :class="slotProps.data.icon || 'pi pi-circle'" class="text-primary"></i>
                  <span class="font-medium">{{ slotProps.data.name }}</span>
                </div>
              </template>
            </Column>
            
            <Column field="path" header="路径">
              <template #body="slotProps">
                <code v-if="slotProps.data.path" class="bg-surface-100 px-2 py-1 rounded text-sm">
                  {{ slotProps.data.path }}
                </code>
                <span v-else class="text-muted-color">-</span>
              </template>
            </Column>
            
            <Column field="icon" header="图标">
              <template #body="slotProps">
                <div class="flex items-center space-x-2">
                  <i :class="slotProps.data.icon || 'pi pi-circle'" class="text-lg"></i>
                  <code class="text-sm text-muted-color">{{ slotProps.data.icon || '-' }}</code>
                </div>
              </template>
            </Column>
            
            <Column field="sort_order" header="排序" sortable>
              <template #body="slotProps">
                <span>{{ slotProps.data.sort_order || 0 }}</span>
              </template>
            </Column>
            
            <Column field="status" header="状态" sortable>
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.status === 'active' ? '启用' : '禁用'"
                  :severity="slotProps.data.status === 'active' ? 'success' : 'warn'"
                />
              </template>
            </Column>
            
            <Column field="created_at" header="创建时间" sortable>
              <template #body="slotProps">
                <span class="text-sm text-muted-color">
                  {{ formatDate(slotProps.data.created_at) }}
                </span>
              </template>
            </Column>
                
            <Column header="操作" :exportable="false">
              <template #body="slotProps">
                <div class="flex items-center space-x-1">
                  <Button
                    v-tooltip="'添加子菜单'"
                    icon="pi pi-plus"
                    rounded
                    text
                    size="small"
                    @click="addChildMenu(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'编辑'"
                    icon="pi pi-pencil"
                    rounded
                    text
                    size="small"
                    @click="editMenu(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'删除'"
                    icon="pi pi-trash"
                    rounded
                    text
                    size="small"
                    severity="danger"
                    @click="confirmDeleteMenu(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>

    <!-- 菜单对话框 -->
    <Dialog
      v-model:visible="showMenuDialog"
      :header="editingMenu ? '编辑菜单' : '新增菜单'"
      :style="{ width: '600px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">菜单名称 *</label>
              <InputText
                v-model="menuForm.name"
                placeholder="请输入菜单名称"
                required
              />
    </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">父级菜单</label>
              <TreeSelect
                v-model="menuForm.parent_id"
                :options="menuTreeOptions"
                placeholder="选择父级菜单"
                selection-mode="single"
        />
      </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">菜单路径</label>
              <InputText
                v-model="menuForm.path"
                placeholder="例如: /users"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">菜单图标</label>
              <div class="flex space-x-2">
                <InputText
                  v-model="menuForm.icon"
                  placeholder="例如: pi pi-users"
                  class="flex-1"
                />
                <div class="flex items-center justify-center w-10 h-10 border rounded">
                  <i :class="menuForm.icon || 'pi pi-circle'" class="text-lg"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">排序值</label>
              <InputNumber
                v-model="menuForm.sort_order"
                placeholder="排序值"
                :min="0"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">状态</label>
              <Dropdown
                v-model="menuForm.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="选择状态"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">菜单描述</label>
            <Textarea
              v-model="menuForm.description"
              placeholder="请输入菜单描述"
              :rows="3"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">权限标识</label>
            <InputText
              v-model="menuForm.permission"
              placeholder="例如: user:view"
            />
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox
                v-model="menuForm.is_external"
                input-id="is_external"
                :binary="true"
              />
              <label for="is_external" class="text-sm font-medium text-color">外部链接</label>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <Checkbox
                v-model="menuForm.is_hidden"
                input-id="is_hidden"
                :binary="true"
              />
              <label for="is_hidden" class="text-sm font-medium text-color">隐藏菜单</label>
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
            @click="closeMenuDialog"
          />
          <Button
            label="保存"
            icon="pi pi-check"
            :loading="saving"
            @click="saveMenu"
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
import InputNumber from 'primevue/inputnumber'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dropdown from 'primevue/dropdown'
import TreeSelect from 'primevue/treeselect'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '菜单管理 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const showMenuDialog = ref(false)
const editingMenu = ref(null as any)
const selectedMenus = ref([])
const confirm = useConfirm()

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')

// 表单数据
const menuForm = ref({
  name: '',
  parent_id: null,
  path: '',
  icon: '',
  sort_order: 0,
  status: 'active',
  description: '',
  permission: '',
  is_external: false,
  is_hidden: false,
  type: 'MENU' // MENU | BUTTON 
})

// 选项数据
const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' }
])

// 模拟数据
const mockMenus = ref([
  {
    id: '1',
    name: '仪表盘',
    parent_id: null,
    path: '/dashboard',
    icon: 'pi pi-home',
    sort_order: 1,
    status: 'active',
    description: '系统仪表盘',
    permission: 'dashboard:view',
    is_external: false,
    is_hidden: false,
    created_at: new Date('2024-01-01'),
    children: []
  },
  {
    id: '2',
    name: '系统管理',
    parent_id: null,
    path: '',
    icon: 'pi pi-cog',
    sort_order: 2,
    status: 'active',
    description: '系统管理模块',
    permission: 'system:view',
    is_external: false,
    is_hidden: false,
    created_at: new Date('2024-01-02'),
    children: [
      {
        id: '21',
        name: '用户管理',
        parent_id: '2',
        path: '/users',
        icon: 'pi pi-users',
        sort_order: 1,
        status: 'active',
        description: '用户管理',
        permission: 'user:view',
        is_external: false,
        is_hidden: false,
        created_at: new Date('2024-01-02')
      },
      {
        id: '22',
        name: '角色管理',
        parent_id: '2',
        path: '/system/roles',
        icon: 'pi pi-shield',
        sort_order: 2,
        status: 'active',
        description: '角色管理',
        permission: 'role:view',
        is_external: false,
        is_hidden: false,
        created_at: new Date('2024-01-02')
      }
    ]
  }
])

// 计算属性
const filteredMenus = computed(() => {
  let result = mockMenus.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(menu =>
      menu.name.toLowerCase().includes(query)
      || (menu.path && menu.path.toLowerCase().includes(query))
    )
  }
  
  if (statusFilter.value) {
    result = result.filter(menu => menu.status === statusFilter.value)
  }

  return result
})

const menuTreeOptions = computed(() => {
  const buildTreeOptions = (menus: any[], level = 0): any[] => {
    return menus.map(menu => ({
      key: menu.id,
      label: menu.name,
      children: menu.children ? buildTreeOptions(menu.children, level + 1) : []
    }))
  }
  
  return [
    { key: 'root', label: '根菜单', children: buildTreeOptions(mockMenus.value) }
  ]
})

// 方法
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const loadMenus = async () => {
  loading.value = true
  error.value = ''
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  catch (err) {
    error.value = '加载菜单失败'
    console.error('加载菜单失败:', err)
  }
  finally {
    loading.value = false
  }
}

const refreshMenus = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  loadMenus()
}

const openCreateDialog = () => {
  editingMenu.value = null
  Object.assign(menuForm.value, {
    name: '',
    parent_id: null,
    path: '',
    icon: '',
    sort_order: 0,
    status: 'active',
    description: '',
    permission: '',
    is_external: false,
    is_hidden: false
  })
  showMenuDialog.value = true
}

const addChildMenu = (parentMenu: any) => {
  editingMenu.value = null
  Object.assign(menuForm.value, {
    name: '',
    parent_id: parentMenu.id,
    path: '',
    icon: '',
    sort_order: 0,
    status: 'active',
    description: '',
    permission: '',
    is_external: false,
    is_hidden: false
  })
  showMenuDialog.value = true
}

const editMenu = (menu: any) => {
  editingMenu.value = menu
  Object.assign(menuForm.value, {
    name: menu.name,
    parent_id: menu.parent_id,
    path: menu.path,
    icon: menu.icon,
    sort_order: menu.sort_order,
    status: menu.status,
    description: menu.description,
    permission: menu.permission,
    is_external: menu.is_external,
    is_hidden: menu.is_hidden
  })
  showMenuDialog.value = true
}

const closeMenuDialog = () => {
  showMenuDialog.value = false
  editingMenu.value = null
}

const saveMenu = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingMenu.value) {
      // 更新菜单
      const updateMenuInTree = (menus: any[]): any[] => {
        return menus.map((menu) => {
          if (menu.id === editingMenu.value.id) {
            return { ...menu, ...menuForm.value }
          }
          if (menu.children) {
            return { ...menu, children: updateMenuInTree(menu.children) }
          }
          return menu
        })
      }
      mockMenus.value = updateMenuInTree(mockMenus.value)
    }
    else {
      // 新增菜单
      const newMenu = {
        id: Date.now().toString(),
        ...menuForm.value,
        created_at: new Date(),
        children: []
      }
      
      if (menuForm.value.parent_id) {
        // 添加为子菜单
        const addToParent = (menus: any[]): any[] => {
          return menus.map((menu) => {
            if (menu.id === menuForm.value.parent_id) {
              return { ...menu, children: [...(menu.children || []), newMenu] }
            }
            if (menu.children) {
              return { ...menu, children: addToParent(menu.children) }
            }
            return menu
          })
        }
        mockMenus.value = addToParent(mockMenus.value)
      }
      else {
        // 添加为根菜单
        mockMenus.value.push(newMenu)
      }
    }
    
    closeMenuDialog()
  }
  catch (error) {
    console.error('保存菜单失败:', error)
  }
  finally {
    saving.value = false
  }
}

const confirmDeleteMenu = (menu: any) => {
  confirm.require({
    message: `确定要删除菜单 ${menu.name} 吗？这将同时删除所有子菜单。`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteMenu(menu.id)
    }
  })
}

const deleteMenu = (menuId: string) => {
  const deleteFromTree = (menus: any[]): any[] => {
    return menus.filter((menu) => {
      if (menu.id === menuId) {
        return false
      }
      if (menu.children) {
        menu.children = deleteFromTree(menu.children)
      }
      return true
    })
  }
  
  mockMenus.value = deleteFromTree(mockMenus.value)
}

// 初始化
onMounted(() => {
  loadMenus()
})
</script>
