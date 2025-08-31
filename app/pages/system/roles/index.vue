<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">角色管理</h1>
        <p class="text-muted-foreground">
          管理系统角色和权限配置
        </p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新数据
        </Button>
        <Button size="sm" @click="openRoleModal">
          <Shield class="mr-2 h-4 w-4" />
          新增角色
        </Button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="w-full">
      <div class="flex items-center py-4">
        <Input
          class="max-w-sm"
          placeholder="搜索角色名称、编码..."
          v-model="searchValue"
        />
      </div>

      <div class="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>角色名称</TableHead>
              <TableHead>角色编码</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="filteredRoles.length">
              <TableRow v-for="role in paginatedRoles" :key="role.id">
                <TableCell class="font-medium">{{ role.name }}</TableCell>
                <TableCell class="font-mono text-sm">{{ role.code }}</TableCell>
                <TableCell>
                  <Badge :variant="role.type === 'system' ? 'default' : 'secondary'">
                    {{ role.type === 'system' ? '系统角色' : '自定义角色' }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="role.status === 'active' ? 'default' : 'secondary'">
                    {{ role.status === 'active' ? '启用' : '禁用' }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="max-w-[200px] truncate text-sm text-muted-foreground">
                    {{ role.description || '暂无描述' }}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    {{ new Date(role.created_at).toLocaleDateString('zh-CN') }}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" class="h-8 w-8 p-0">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem @click="handleEditRole(role)">
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="handleDeleteRole(role.id)" class="text-destructive">
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </template>
            <template v-else>
              <TableRow>
                <TableCell colspan="7" class="h-24 text-center">
                  <div v-if="loading" class="space-y-3">
                    <!-- 骨架屏行 -->
                    <div v-for="i in 3" :key="i" class="grid grid-cols-[150px_120px_100px_80px_200px_100px_60px] gap-4 p-4 items-center">
                      <!-- 角色名称列 -->
                      <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                      <!-- 角色编码列 -->
                      <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                      <!-- 类型列 -->
                      <div class="h-6 bg-muted animate-pulse rounded w-full"></div>
                      <!-- 状态列 -->
                      <div class="h-6 bg-muted animate-pulse rounded w-full"></div>
                      <!-- 描述列 -->
                      <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                      <!-- 创建时间列 -->
                      <div class="h-4 bg-muted animate-pulse rounded w-full"></div>
                      <!-- 操作列 -->
                      <div class="h-8 w-8 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                  <div v-else>
                    暂无数据
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <div class="flex items-center justify-between space-x-2 py-4">
        <div class="text-sm text-muted-foreground">
          共 {{ filteredRoles.length }} 条记录
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            上一页
          </Button>
          <span class="text-sm">{{ currentPage }} / {{ totalPages }}</span>
          <Button
            variant="outline"
            size="sm"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>

    <!-- 角色管理对话框 -->
    <Dialog v-model:open="showModal">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ isEditMode ? '编辑角色' : '新增角色' }}</DialogTitle>
          <DialogDescription>
            {{ isEditMode ? '修改角色信息和权限配置' : '创建新角色并配置权限' }}
          </DialogDescription>
        </DialogHeader>

        <Tabs default-value="basic" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="permissions">权限配置</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="name">角色名称</Label>
                <Input
                  id="name"
                  v-model="roleForm.name"
                  placeholder="请输入角色名称"
                />
              </div>
              <div class="space-y-2">
                <Label for="code">角色编码</Label>
                <Input
                  id="code"
                  v-model="roleForm.code"
                  placeholder="请输入角色编码"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="type">角色类型</Label>
                <Select v-model="roleForm.type">
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">系统角色</SelectItem>
                    <SelectItem value="custom">自定义角色</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label for="status">状态</Label>
                <Select v-model="roleForm.status">
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="space-y-2">
              <Label for="description">描述</Label>
              <Textarea
                id="description"
                v-model="roleForm.description"
                placeholder="请输入角色描述"
                rows="3"
              />
            </div>
          </TabsContent>

          <TabsContent value="permissions" class="space-y-4">
            <div class="space-y-4">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-medium">菜单权限配置</h4>
                <div class="flex gap-2">
                  <Button variant="outline" size="sm" @click="selectAllPermissions">
                    全选
                  </Button>
                  <Button variant="outline" size="sm" @click="unselectAllPermissions">
                    取消全选
                  </Button>
                </div>
              </div>

                            <div class="max-h-80 overflow-y-auto border rounded-lg p-4">
                <div v-if="menuLoading" class="text-center py-8">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p class="text-sm text-muted-foreground mt-2">加载菜单数据...</p>
                </div>

                <div v-else-if="menuPermissions.length === 0" class="text-center py-8">
                  <p class="text-sm text-muted-foreground">暂无菜单数据</p>
                </div>

                <div v-else>
                  <div v-for="menu in menuPermissions" :key="menu.id" class="mb-3">
                    <!-- 一级菜单 -->
                    <div class="flex items-center space-x-2 py-2">
                      <!-- 展开/折叠按钮 -->
                      <button
                        v-if="menu.children && menu.children.length > 0"
                        @click="toggleMenuExpanded(menu.id)"
                        class="flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700"
                      >
                        <span v-if="isMenuExpanded(menu.id)">▼</span>
                        <span v-else>▶</span>
                      </button>
                      <div v-else class="w-4"></div>

                      <!-- 复选框 -->
                      <input
                        type="checkbox"
                        :id="menu.id"
                        :checked="selectedMenuIds.includes(menu.id)"
                        @change="handlePermissionChange(menu.id, ($event.target as HTMLInputElement).checked)"
                        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <!-- 菜单名称 -->
                      <label :for="menu.id" class="text-sm font-semibold cursor-pointer flex items-center">
                        <span class="mr-2">{{ menu.type === 'directory' ? '📁' : '📄' }}</span>
                        {{ menu.name }}
                        <span v-if="menu.children && menu.children.length > 0" class="ml-2 text-xs text-gray-500">
                          ({{ menu.children.length }})
                        </span>
                      </label>
                    </div>

                    <!-- 子菜单 -->
                    <div
                      v-if="menu.children && menu.children.length > 0 && isMenuExpanded(menu.id)"
                      class="ml-6 space-y-1 border-l-2 border-gray-100 pl-4"
                    >
                      <div v-for="child in menu.children" :key="child.id" class="flex items-center space-x-2 py-1">
                        <div class="w-4"></div>
                        <input
                          type="checkbox"
                          :id="child.id"
                          :checked="selectedMenuIds.includes(child.id)"
                          @change="handlePermissionChange(child.id, ($event.target as HTMLInputElement).checked)"
                          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label :for="child.id" class="text-sm cursor-pointer flex items-center">
                          <span class="mr-2">{{ child.type === 'directory' ? '📁' : '📄' }}</span>
                          {{ child.name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="text-sm text-muted-foreground mt-2">
                已选择 {{ selectedMenuIds.length }} 个菜单权限
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" @click="closeRoleModal">
            取消
          </Button>
          <Button @click="handleSaveRole" :disabled="loading">
            {{ loading ? '保存中...' : '保存' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useRoles, type RoleData, type RoleForm } from '@/composables/useRoles'
import { MoreHorizontal, RefreshCw, Shield } from 'lucide-vue-next'

// 使用 composables
const { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole, getRoleMenuPermissions, updateRoleMenuPermissions } = useRoles()

// 响应式数据
const showModal = ref(false)
const isEditMode = ref(false)
const editingRole = ref<RoleData | null>(null)
const selectedMenuIds = ref<string[]>([])
const searchValue = ref('')
const currentPage = ref(1)
const pageSize = 10

// 菜单权限数据
const menuPermissions = ref<any[]>([])
const menuLoading = ref(false)
const expandedMenus = ref<Set<string>>(new Set())

// 表单数据
const roleForm = ref<RoleForm>({
  name: '',
  code: '',
  description: '',
  type: 'custom',
  status: 'active'
})

// 计算属性
const filteredRoles = computed(() => {
  if (!searchValue.value) return roles.value
  const search = searchValue.value.toLowerCase()
  return roles.value.filter(role =>
    role.name.toLowerCase().includes(search) ||
    role.code.toLowerCase().includes(search)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredRoles.value.length / pageSize)
})

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredRoles.value.slice(start, end)
})

// 方法
const refreshData = async () => {
  await fetchRoles()
}

const openRoleModal = async () => {
  isEditMode.value = false
  editingRole.value = null
  selectedMenuIds.value = []
  roleForm.value = {
    name: '',
    code: '',
    description: '',
    type: 'custom',
    status: 'active'
  }

  // 加载菜单权限数据
  await fetchMenuPermissions()
  showModal.value = true
}

const closeRoleModal = () => {
  showModal.value = false
  isEditMode.value = false
  editingRole.value = null
  selectedMenuIds.value = []
}

const handleEditRole = async (role: RoleData) => {
  isEditMode.value = true
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    code: role.code,
    description: role.description || '',
    type: role.type,
    status: role.status
  }

  // 加载菜单权限数据
  await fetchMenuPermissions()

  // 获取角色权限
  selectedMenuIds.value = await getRoleMenuPermissions(role.id)
  showModal.value = true
}

const handleSaveRole = async () => {
  try {
    let result: any

    if (isEditMode.value && editingRole.value) {
      result = await updateRole(editingRole.value.id, roleForm.value)
    } else {
      result = await createRole(roleForm.value)
    }

    if (result?.code === 0) {
      // 更新权限
      if (isEditMode.value && editingRole.value) {
        await updateRoleMenuPermissions(editingRole.value.id, selectedMenuIds.value)
      }

      await refreshData()
      closeRoleModal()

      // 显示成功消息
      alert(isEditMode.value ? '角色更新成功' : '角色创建成功')
    } else {
      console.error('操作失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const handleDeleteRole = async (roleId: string) => {
  if (confirm('确定要删除这个角色吗？此操作不可恢复。')) {
    const result = await deleteRole(roleId)
    if (result?.code === 0) {
      await refreshData()
      alert('角色删除成功')
    } else {
      console.error('删除失败')
    }
  }
}

// 获取菜单数据
const fetchMenuPermissions = async () => {
  try {
    menuLoading.value = true
    const { data: menus } = await useSupabaseClient()
      .from('menus')
      .select('*')
      .eq('status', 'active')
      .order('sort', { ascending: true })

    if (menus) {
      menuPermissions.value = buildMenuTree(menus)
      // 默认展开所有一级菜单
      menuPermissions.value.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
          expandedMenus.value.add(menu.id)
        }
      })
    }
  } catch (error) {
    console.error('获取菜单数据失败:', error)
  } finally {
    menuLoading.value = false
  }
}

// 构建菜单树
const buildMenuTree = (menus: any[]) => {
  const menuMap = new Map()
  const rootMenus: any[] = []

  // 创建菜单映射
  menus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] })
  })

  // 构建树结构
  menus.forEach(menu => {
    const menuItem = menuMap.get(menu.id)
    if (menu.parent_id && menuMap.has(menu.parent_id)) {
      menuMap.get(menu.parent_id).children.push(menuItem)
    } else {
      rootMenus.push(menuItem)
    }
  })

  return rootMenus
}

// 权限管理方法
const handlePermissionChange = (menuId: string, checked: boolean) => {
  const newSelectedIds = [...selectedMenuIds.value]

  if (checked) {
    // 选中时，同时选中所有子菜单
    addMenuAndChildren(menuId, newSelectedIds)
  } else {
    // 取消选中时，同时取消所有子菜单和父菜单
    removeMenuAndAffected(menuId, newSelectedIds)
  }

  selectedMenuIds.value = newSelectedIds
}

// 添加菜单及其所有子菜单
const addMenuAndChildren = (menuId: string, selectedIds: string[]) => {
  if (!selectedIds.includes(menuId)) {
    selectedIds.push(menuId)
  }

  // 查找并添加所有子菜单
  const addChildren = (menus: any[]) => {
    menus.forEach(menu => {
      if (menu.id === menuId && menu.children) {
        menu.children.forEach((child: any) => {
          if (!selectedIds.includes(child.id)) {
            selectedIds.push(child.id)
          }
          if (child.children && child.children.length > 0) {
            addChildren(child.children)
          }
        })
      } else if (menu.children) {
        addChildren(menu.children)
      }
    })
  }

  addChildren(menuPermissions.value)
}

// 移除菜单及相关菜单
const removeMenuAndAffected = (menuId: string, selectedIds: string[]) => {
  // 移除当前菜单
  const index = selectedIds.indexOf(menuId)
  if (index > -1) {
    selectedIds.splice(index, 1)
  }

  // 移除所有子菜单
  const removeChildren = (menus: any[]) => {
    menus.forEach(menu => {
      if (menu.id === menuId && menu.children) {
        menu.children.forEach((child: any) => {
          const childIndex = selectedIds.indexOf(child.id)
          if (childIndex > -1) {
            selectedIds.splice(childIndex, 1)
          }
          if (child.children && child.children.length > 0) {
            removeChildren(child.children)
          }
        })
      } else if (menu.children) {
        removeChildren(menu.children)
      }
    })
  }

  removeChildren(menuPermissions.value)
}

const getAllMenuIds = (menuList: any[]): string[] => {
  const ids: string[] = []

  const traverse = (menus: any[]) => {
    menus.forEach(menu => {
      ids.push(menu.id)
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children)
      }
    })
  }

  traverse(menuList)
  return ids
}

const selectAllPermissions = () => {
  selectedMenuIds.value = getAllMenuIds(menuPermissions.value)
}

const unselectAllPermissions = () => {
  selectedMenuIds.value = []
}

// 折叠展开功能
const toggleMenuExpanded = (menuId: string) => {
  if (expandedMenus.value.has(menuId)) {
    expandedMenus.value.delete(menuId)
  } else {
    expandedMenus.value.add(menuId)
  }
}

const isMenuExpanded = (menuId: string) => {
  return expandedMenus.value.has(menuId)
}

// 监听搜索变化，重置页码
watch(searchValue, () => {
  currentPage.value = 1
})

// 生命周期
onMounted(() => {
  refreshData()
})
</script>
