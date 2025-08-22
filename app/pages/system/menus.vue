<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">菜单管理</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">管理系统菜单结构和权限</p>
      </div>
      <Button @click="openCreateDialog" class="flex items-center gap-2">
        <Plus class="w-4 h-4" />
        新增菜单
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="mb-6">
      <div class="p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="搜索菜单名称或路径..."
              class="w-full"
            >
              <template #prefix>
                <Search class="w-4 h-4 text-gray-400" />
              </template>
            </Input>
          </div>
          <div class="flex gap-2">
            <Select v-model="statusFilter">
              <option value="">全部状态</option>
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </Select>
            <Button variant="outline" @click="refreshMenus">
              <RefreshCw class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 菜单树形表格 -->
    <Card>
      <div class="p-6">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
        </div>
        
        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600 dark:text-red-400">{{ error }}</p>
          <Button @click="loadMenus" variant="outline" class="mt-4">
            重新加载
          </Button>
        </div>
        
        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">
                  <input
                    type="checkbox"
                    :checked="selectedMenus.length === filteredMenus.length && filteredMenus.length > 0"
                    :indeterminate="selectedMenus.length > 0 && selectedMenus.length < filteredMenus.length"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>菜单名称</TableHead>
                <TableHead>路径</TableHead>
                <TableHead>图标</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead class="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-for="menu in filteredMenus" :key="menu.id">
                <MenuRow
                  :menu="menu"
                  :level="0"
                  :is-selected="selectedMenus.includes(menu.id)"
                  :can-edit="canEdit"
                   :can-delete="canDelete"
                   :can-create="canCreate"
                  @edit="openEditDialog"
                   @delete="handleDelete"
                   @add-child="openAddDialog"
                  @toggle-selection="toggleMenuSelection"
                />
                
                <!-- 递归渲染子菜单 -->
                <template v-if="menu.children && menu.children.length > 0">
                  <MenuRow
                    v-for="child in menu.children"
                    :key="child.id"
                    :menu="child"
                    :level="1"
                    :is-selected="selectedMenus.includes(child.id)"
                    :can-edit="canEdit"
                     :can-delete="canDelete"
                     :can-create="canCreate"
                    @edit="openEditDialog"
                     @delete="handleDelete"
                     @add-child="openAddDialog"
                    @toggle-selection="toggleMenuSelection"
                  />
                </template>
              </template>
            </TableBody>
          </Table>
          
          <div v-if="filteredMenus.length === 0" class="text-center py-8">
            <MenuIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400">暂无菜单数据</p>
            <Button @click="openCreateDialog" variant="outline" class="mt-4">
              创建第一个菜单
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 批量操作 -->
    <div v-if="selectedMenus.length > 0" class="fixed bottom-6 left-1/2 transform -translate-x-1/2">
      <Card class="shadow-lg">
        <div class="p-4 flex items-center gap-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            已选择 {{ selectedMenus.length }} 个菜单
          </span>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="batchEnable">
              <Eye class="w-4 h-4 mr-1" />
              批量启用
            </Button>
            <Button variant="outline" size="sm" @click="batchDisable">
              <EyeOff class="w-4 h-4 mr-1" />
              批量禁用
            </Button>
            <Button variant="destructive" size="sm" @click="batchDelete">
              <Trash2 class="w-4 h-4 mr-1" />
              批量删除
            </Button>
          </div>
          <Button variant="ghost" size="sm" @click="clearSelection">
            <X class="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>

    <!-- 添加/编辑菜单对话框 -->
    <Dialog v-model:open="showDialog">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ editingMenu ? '编辑菜单' : (parentMenuForAdd ? `为 "${parentMenuForAdd.name}" 添加子菜单` : '添加菜单') }}
        </h3>
        
        <MenuForm
          :menu="editingMenu"
          :parent-id="parentMenuForAdd?.id"
          :menus="menus"
          @save="handleSaveMenu"
          @cancel="closeDialog"
        />
      </div>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog v-model:open="showDeleteDialog">
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                确认删除
              </h3>
              <Button variant="ghost" size="sm" @click="showDeleteDialog = false">
                <X class="w-4 h-4" />
              </Button>
            </div>
            
            <div class="mb-6">
              <p class="text-gray-600 dark:text-gray-400">
                确定要删除菜单 "{{ deletingMenu?.name }}" 吗？
              </p>
              <p class="text-sm text-red-600 dark:text-red-400 mt-2">
                此操作不可撤销，同时会删除所有子菜单。
              </p>
            </div>
            
            <div class="flex justify-end gap-3">
              <Button variant="outline" @click="showDeleteDialog = false">
                取消
              </Button>
              <Button variant="destructive" @click="handleDelete">
                确认删除
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Plus,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  X,
  Menu as MenuIcon
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import MenuForm from '~/components/MenuForm.vue'

// 页面元数据
definePageMeta({
  title: '菜单管理',
  requiresAuth: true,
  layout: 'default'
})

// 状态
const loading = ref(true)
const error = ref(null)
const allMenus = ref([])
const selectedMenus = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

// 对话框状态
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingMenu = ref(null)
const deletingMenu = ref(null)
const parentMenuForAdd = ref(null)

// Composables
const { getAllMenus, createMenu, updateMenu, deleteMenu, buildMenuTree } = useMenus()
const { hasPermission } = usePermissions()
const user = useSupabaseUser()

// 计算属性
const filteredMenus = computed(() => {
  let menus = allMenus.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    menus = menus.filter(menu => 
      menu.name.toLowerCase().includes(query) ||
      (menu.path && menu.path.toLowerCase().includes(query))
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active'
    menus = menus.filter(menu => !menu.is_hidden === isActive)
  }
  
  return buildMenuTree(menus)
})

const menus = computed(() => allMenus.value)

// 方法
const loadMenus = async () => {
  try {
    loading.value = true
    error.value = null
    
    const menus = await getAllMenus()
    allMenus.value = menus
    
  } catch (err) {
    console.error('加载菜单失败:', err)
    error.value = err.message || '加载菜单失败'
    toast.error('加载菜单失败')
  } finally {
    loading.value = false
  }
}

const refreshMenus = () => {
  selectedMenus.value = []
  loadMenus()
}

// 选择相关
const toggleSelectAll = () => {
  if (selectedMenus.value.length === filteredMenus.value.length) {
    selectedMenus.value = []
  } else {
    selectedMenus.value = filteredMenus.value.map(menu => menu.id)
  }
}

const toggleMenuSelection = (menuId) => {
  const index = selectedMenus.value.indexOf(menuId)
  if (index > -1) {
    selectedMenus.value.splice(index, 1)
  } else {
    selectedMenus.value.push(menuId)
  }
}

const clearSelection = () => {
  selectedMenus.value = []
}

// 对话框相关
const openCreateDialog = () => {
  editingMenu.value = null
  parentMenuForAdd.value = null
  showDialog.value = true
}

const openAddDialog = (parentMenu = null) => {
  editingMenu.value = null
  parentMenuForAdd.value = parentMenu
  showDialog.value = true
}

const openCreateChildDialog = (parentMenu) => {
  editingMenu.value = null
  parentMenuForAdd.value = parentMenu
  showDialog.value = true
}

const openEditDialog = (menu) => {
  editingMenu.value = { ...menu }
  parentMenuForAdd.value = null
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingMenu.value = null
  parentMenuForAdd.value = null
}

const confirmDelete = (menu) => {
  deletingMenu.value = menu
  showDeleteDialog.value = true
}

// 菜单操作
const handleSaveMenu = async (menuData) => {
  try {
    if (editingMenu.value) {
      await updateMenu(editingMenu.value.id, menuData)
      toast.success('菜单更新成功')
    } else {
      await createMenu(menuData)
      toast.success('菜单创建成功')
    }
    
    closeDialog()
    await loadMenus()
    
  } catch (err) {
    console.error('保存菜单失败:', err)
    toast.error(err.message || '保存菜单失败')
  }
}

const handleDelete = async () => {
  if (!deletingMenu.value) return
  
  try {
    await deleteMenu(deletingMenu.value.id)
    toast.success('菜单删除成功')
    
    showDeleteDialog.value = false
    deletingMenu.value = null
    await loadMenus()
    
  } catch (err) {
    console.error('删除菜单失败:', err)
    toast.error(err.message || '删除菜单失败')
  }
}

// 批量操作
const batchEnable = async () => {
  try {
    for (const menuId of selectedMenus.value) {
      await updateMenu(menuId, { is_hidden: false })
    }
    toast.success(`已启用 ${selectedMenus.value.length} 个菜单`)
    clearSelection()
    await loadMenus()
  } catch (err) {
    console.error('批量启用失败:', err)
    toast.error('批量启用失败')
  }
}

const batchDisable = async () => {
  try {
    for (const menuId of selectedMenus.value) {
      await updateMenu(menuId, { is_hidden: true })
    }
    toast.success(`已禁用 ${selectedMenus.value.length} 个菜单`)
    clearSelection()
    await loadMenus()
  } catch (err) {
    console.error('批量禁用失败:', err)
    toast.error('批量禁用失败')
  }
}

const batchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedMenus.value.length} 个菜单吗？`)) {
    return
  }
  
  try {
    for (const menuId of selectedMenus.value) {
      await deleteMenu(menuId)
    }
    toast.success(`已删除 ${selectedMenus.value.length} 个菜单`)
    clearSelection()
    await loadMenus()
  } catch (err) {
    console.error('批量删除失败:', err)
    toast.error('批量删除失败')
  }
}

// 权限检查
const canCreateMenu = computed(() => {
  return hasPermission('menu:create')
})

const canEditMenu = computed(() => {
  return hasPermission('menu:update')
})

const canDeleteMenu = computed(() => {
  return hasPermission('menu:delete')
})

// 组件挂载
onMounted(() => {
  loadMenus()
})
</script>