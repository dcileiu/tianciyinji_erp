<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">菜单管理</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">管理系统菜单结构和权限</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" />
        新增菜单
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input v-model="searchQuery" placeholder="搜索菜单名称或路径..." class="pl-10" />
            </div>
          </div>
          <div class="flex gap-2">
            <Select v-model="statusFilter">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" @click="refreshMenus">
              <RefreshCw class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 菜单树形表格 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Menu class="w-5 h-5" />
          菜单列表
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin -full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
        </div>

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600 dark:text-red-400">{{ error }}</p>
          <Button variant="outline" class="mt-4" @click="loadMenus">
            <RefreshCw class="w-4 h-4 mr-2" />
            重新加载
          </Button>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">
                  <input type="checkbox" class="" />
                </TableHead>
                <TableHead>菜单名称</TableHead>
                <TableHead>路径</TableHead>
                <TableHead>图标</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead class="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-for="menu in filteredMenus" :key="menu.id">
                <TableRow>
                  <TableCell>
                    <input type="checkbox" class="" />
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center space-x-2">
                      <component :is="getMenuIcon(menu.icon)" class="w-4 h-4 text-blue-600" />
                      <span class="font-medium">{{ menu.name }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code v-if="menu.path" class="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm">
                      {{ menu.path }}
                    </code>
                    <span v-else class="text-gray-500">-</span>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center space-x-2">
                      <component :is="getMenuIcon(menu.icon)" class="w-4 h-4" />
                      <code class="text-sm text-gray-500">{{ menu.icon || '-' }}</code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{{ menu.sort_order || 0 }}</span>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="menu.status === 'active' ? 'default' : 'secondary'">
                      {{ menu.status === 'active' ? '启用' : '禁用' }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm text-gray-500">
                      {{ formatDate(menu.created_at) }}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" title="添加子菜单" @click="addChildMenu(menu)">
                        <Plus class="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="编辑" @click="editMenu(menu)">
                        <Edit class="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="删除" @click="confirmDeleteMenu(menu)">
                        <Trash2 class="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <!-- 子菜单行 -->
                <template v-if="menu.children && menu.children.length > 0">
                  <TableRow v-for="child in menu.children" :key="child.id" class="bg-gray-50 dark:bg-gray-900/50">
                    <TableCell>
                      <input type="checkbox" class="" />
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center space-x-2 pl-6">
                        <component :is="getMenuIcon(child.icon)" class="w-4 h-4 text-blue-600" />
                        <span class="font-medium">{{ child.name }}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code v-if="child.path" class="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm">
                        {{ child.path }}
                      </code>
                      <span v-else class="text-gray-500">-</span>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center space-x-2">
                        <component :is="getMenuIcon(child.icon)" class="w-4 h-4" />
                        <code class="text-sm text-gray-500">{{ child.icon || '-' }}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>{{ child.sort_order || 0 }}</span>
                    </TableCell>
                    <TableCell>
                      <Badge :variant="child.status === 'active' ? 'default' : 'secondary'">
                        {{ child.status === 'active' ? '启用' : '禁用' }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span class="text-sm text-gray-500">
                        {{ formatDate(child.created_at) }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" title="添加子菜单" @click="addChildMenu(child)">
                          <Plus class="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="编辑" @click="editMenu(child)">
                          <Edit class="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="删除" @click="confirmDeleteMenu(child)">
                          <Trash2 class="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </template>
              </template>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 菜单对话框 -->
    <Dialog v-model:open="showMenuDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingMenu ? '编辑菜单' : '新增菜单' }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="menu-name">菜单名称 *</Label>
              <Input id="menu-name" v-model="menuForm.name" placeholder="请输入菜单名称" required />
            </div>

            <div class="space-y-2">
              <Label for="parent-menu">父级菜单</Label>
              <Select v-model="menuForm.parent_id">
                <SelectTrigger>
                  <SelectValue placeholder="选择父级菜单" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">根菜单</SelectItem>
                  <template v-for="menu in mockMenus" :key="menu.id">
                    <SelectItem :value="menu.id">{{ menu.name }}</SelectItem>
                  </template>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="menu-path">菜单路径</Label>
              <Input id="menu-path" v-model="menuForm.path" placeholder="例如: /users" />
            </div>

            <div class="space-y-2">
              <Label for="menu-icon">菜单图标</Label>
              <div class="flex space-x-2">
                <Input id="menu-icon" v-model="menuForm.icon" placeholder="例如: Home" class="flex-1" />
                <div class="flex items-center justify-center w-10 h-10 border ">
                  <component :is="getMenuIcon(menuForm.icon)" class="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="sort-order">排序值</Label>
              <Input id="sort-order" v-model.number="menuForm.sort_order" type="number" placeholder="排序值" min="0" />
            </div>

            <div class="space-y-2">
              <Label for="menu-status">状态</Label>
              <Select v-model="menuForm.status">
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="menu-description">菜单描述</Label>
            <Textarea id="menu-description" v-model="menuForm.description" placeholder="请输入菜单描述" :rows="3" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="menu-permission">权限标识</Label>
              <Input id="menu-permission" v-model="menuForm.permission" placeholder="例如: user:view" />
            </div>

            <div class="space-y-2">
              <Label for="external-url">外部链接</Label>
              <Input id="external-url" v-model="menuForm.externalUrl" placeholder="例如: https://example.com" />
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <input id="is-hidden" v-model="menuForm.is_hidden" type="checkbox" class="border-gray-300" />
              <Label for="is-hidden">隐藏菜单</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeMenuDialog"> 取消 </Button>
          <Button :disabled="saving" @click="saveMenu"> 保存 </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import { toast } from 'vue-sonner'

import {
  BarChart3,
  Building,
  Database,
  DollarSign,
  Edit,
  FileText,
  HelpCircle,
  Home,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  Users,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '菜单管理 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const showMenuDialog = ref(false)
const editingMenu = ref(null as any)

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
  externalUrl: '',
  status: 'active',
  description: '',
  permission: '',
  is_external: false,
  is_hidden: false,
  type: 'MENU', // 目录 | 菜单 | 按钮
  children: [],
})

// 选项数据
const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
])

// 模拟数据
const mockMenus = ref([
  {
    id: '1',
    name: '仪表盘',
    parent_id: null,
    path: '/dashboard',
    icon: 'Home',
    sort_order: 1,
    status: 'active',
    description: '系统仪表盘',
    permission: 'dashboard:view',
    is_external: false,
    is_hidden: false,
    created_at: new Date('2024-01-01'),
    children: [],
  },
  {
    id: '2',
    name: '系统管理',
    parent_id: null,
    path: '',
    icon: 'Settings',
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
        icon: 'Users',
        sort_order: 1,
        status: 'active',
        description: '用户管理',
        permission: 'user:view',
        is_external: false,
        is_hidden: false,
        created_at: new Date('2024-01-02'),
      },
      {
        id: '22',
        name: '角色管理',
        parent_id: '2',
        path: '/system/roles',
        icon: 'Shield',
        sort_order: 2,
        status: 'active',
        description: '角色管理',
        permission: 'role:view',
        is_external: false,
        is_hidden: false,
        created_at: new Date('2024-01-02'),
      },
      {
        id: '23',
        name: '菜单管理',
        parent_id: '2',
        path: '/system/menus',
        icon: 'Menu',
        sort_order: 3,
        status: 'active',
        description: '菜单管理',
        permission: 'menu:view',
        is_external: false,
        is_hidden: false,
        created_at: new Date('2024-01-02'),
      },
      {
        id: '24',
        name: '部门管理',
        parent_id: '2',
        path: '/system/departments',
        icon: 'Building',
        sort_order: 4,
        status: 'active',
        description: '部门管理',
        permission: 'department:view',
        is_external: false,
        is_hidden: false,
        created_at: new Date('2024-01-02'),
      },
    ],
  },
  {
    id: '3',
    name: '仓库管理',
    parent_id: null,
    path: '',
    icon: 'Package',
    sort_order: 3,
    status: 'active',
    description: '仓库管理模块',
    permission: 'warehouse:view',
    is_external: false,
    is_hidden: false,
    created_at: new Date('2024-01-03'),
    children: [
      {
        id: '31',
        name: '库存管理',
        parent_id: '3',
        path: '/warehouse/inventory',
        icon: 'Package',
        sort_order: 1,
        status: 'active',
        description: '库存管理',
        permission: 'inventory:view',
        is_external: false,
        is_hidden: false,
        created_at: new Date('2024-01-03'),
      },
    ],
  },
  {
    id: '4',
    name: '财务管理',
    parent_id: null,
    path: '',
    icon: 'DollarSign',
    sort_order: 4,
    status: 'active',
    description: '财务管理模块',
    permission: 'finance:view',
    is_external: false,
    is_hidden: false,
    created_at: new Date('2024-01-04'),
    children: [],
  },
  {
    id: '5',
    name: '报表中心',
    parent_id: null,
    path: '',
    icon: 'BarChart3',
    sort_order: 5,
    status: 'active',
    description: '报表中心模块',
    permission: 'reports:view',
    is_external: false,
    is_hidden: false,
    created_at: new Date('2024-01-05'),
    children: [],
  },
])

// 计算属性
const filteredMenus = computed(() => {
  let result = mockMenus.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      menu => menu.name.toLowerCase().includes(query) || (menu.path && menu.path.toLowerCase().includes(query)),
    )
  }

  if (statusFilter.value) {
    result = result.filter(menu => menu.status === statusFilter.value)
  }

  return result
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
    is_hidden: false,
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
    is_hidden: false,
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
    is_hidden: menu.is_hidden,
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
        children: [],
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
  if (window.confirm(`确定要删除菜单 "${menu.name}" 吗？这将同时删除所有子菜单。`)) {
    deleteMenu(menu.id)
  }
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
  toast.success('菜单删除成功')
}

// 获取菜单图标
const getMenuIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Home: Home,
    Users: Users,
    Settings: Settings,
    FileText: FileText,
    BarChart3: BarChart3,
    Package: Package,
    DollarSign: DollarSign,
    Shield: Shield,
    Database: Database,
    Menu: Menu,
    Building: Building,
    HelpCircle: HelpCircle,
  }
  return iconMap[iconName] || HelpCircle
}

// 初始化
onMounted(() => {
  loadMenus()
})
</script>
