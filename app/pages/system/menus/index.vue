<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          菜单管理
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          管理系统菜单结构和权限
        </p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" />
        新增菜单
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col gap-4">
          <div class="flex gap-2 flex-wrap items-center">
            <div class="relative min-w-md max-w-md">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              />
              <Input
                v-model="searchQuery"
                placeholder="搜索菜单名称或路径..."
                class="pl-10 max-w-md w-full"
                @input="handleSearch"
              />
            </div>
            <Select v-model="statusFilter" @update:model-value="handleFilter">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="typeFilter" @update:model-value="handleFilter">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" @click="refreshMenus" :disabled="loading">
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 菜单列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
        <CardTitle class="flex items-center gap-2">
          <Menu class="w-5 h-5" />
          菜单列表
        </CardTitle>
            <CardDescription>当前共有 {{ menus.length }} 个菜单</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <MenuTableSkeleton v-if="loading && menus.length === 0" />

        <div v-else-if="error" class="text-center py-8">
          <p class="text-red-600 dark:text-red-400">{{ error }}</p>
          <Button variant="outline" class="mt-4" @click="loadMenus">
            <RefreshCw class="w-4 h-4 mr-2" />
            重新加载
          </Button>
        </div>

        <MenuTable
          v-else-if="!loading && !error"
          :menus="menus as any"
          :selected-ids="selectedIds"
          :select-all="selectAll"
          @select="toggleSelect"
          @select-all="handleSelectAll"
          @edit="editMenu"
          @delete="confirmDeleteMenu"
          @add-child="addChildMenu"
          @toggle-status="toggleMenuStatus"
          @clear-selection="clearSelection"
          @batch-delete="confirmBatchDelete"
        />
      </CardContent>
    </Card>

    <!-- 菜单对话框 -->
    <MenuDialog
      :open="showMenuDialog"
      :editing-menu="editingMenu"
      :parent-menu-options="parentMenuOptions"
      :saving="saving"
      @update:open="showMenuDialog = $event"
      @save="saveMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { Menu, Plus, RefreshCw, Search } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import type { MenuForm, Menu as MenuType } from '~/composables/useMenus';
import MenuDialog from './components/MenuDialog.vue';
import MenuTable from './components/MenuTable.vue';
import MenuTableSkeleton from './components/MenuTableSkeleton.vue';

// 页面配置
definePageMeta({
  layout: 'default',
  ssr: false, // 使用客户端渲染
});

useHead({
  title: '菜单管理 - ERP 管理系统',
});

// 使用菜单管理composable
const {
  menus,
  loading,
  error,
  fetchMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  deleteMenus,
  updateMenuStatus,
  getParentMenuOptions,
} = useMenus();

// 状态管理
const saving = ref(false);
const showMenuDialog = ref(false);
const editingMenu = ref<MenuType | null>(null);

// 搜索和筛选
const searchQuery = ref('');
const statusFilter = ref('all');
const typeFilter = ref('all');

// 选择状态
const selectedIds = ref<string[]>([]);
const selectAll = ref(false);

// 选项数据
const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
];

const typeOptions = [
  { label: '目录', value: 'directory' },
  { label: '菜单', value: 'menu' },
  { label: '权限', value: 'permission' },
];

// 计算属性
const parentMenuOptions = computed(() => getParentMenuOptions());

// 菜单管理保持树形结构，不使用分页

// 方法
const loadMenus = async () => {
  const query = {
    search: searchQuery.value || undefined,
    status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
    type: typeFilter.value !== 'all' ? typeFilter.value : undefined,
  };
  await fetchMenus(query);
};

const handleSearch = debounce(() => {
  loadMenus();
}, 300);

const handleFilter = () => {
  loadMenus();
};

const refreshMenus = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  typeFilter.value = 'all';
  selectedIds.value = [];
  selectAll.value = false;
  loadMenus();
};

const openCreateDialog = () => {
  editingMenu.value = null;
  showMenuDialog.value = true;
};

const addChildMenu = (parentMenu: MenuType) => {
  editingMenu.value = {
    ...parentMenu,
    parent_id: parentMenu.id,
    name: '',
    path: null,
    icon: null,
    sort: 0,
    status: 'active',
    permission: null,
    type: 'menu',
  } as MenuType;
  showMenuDialog.value = true;
};

const editMenu = (menu: MenuType) => {
  editingMenu.value = menu;
  showMenuDialog.value = true;
};

const saveMenu = async (formData: MenuForm) => {
  if (!formData.name.trim()) {
    toast.error('请输入菜单名称');
    return;
  }

  saving.value = true;
  try {
    if (editingMenu.value?.id) {
      const { error: updateError } = await updateMenu(
        editingMenu.value.id,
        formData
      );
      if (updateError) {
        throw new Error(updateError);
      }
      toast.success('菜单更新成功');
    } else {
      const { error: createError } = await createMenu(formData);
      if (createError) {
        throw new Error(createError);
      }
      toast.success('菜单创建成功');
    }
    showMenuDialog.value = false;
  } catch (err: any) {
    toast.error(err.message || '操作失败，请重试');
  } finally {
    saving.value = false;
  }
};

const confirmDeleteMenu = (menu: MenuType) => {
  if (window.confirm(`确定要删除菜单 "${menu.name}" 吗？`)) {
    deleteMenuById(menu.id);
  }
};

const deleteMenuById = async (menuId: string) => {
  try {
    const { error: deleteError } = await deleteMenu(menuId);
    if (deleteError) {
      throw new Error(deleteError);
    }
    toast.success('菜单删除成功');
    selectedIds.value = selectedIds.value.filter((id) => id !== menuId);
  } catch (err: any) {
    toast.error(err.message || '删除失败');
  }
};

const toggleMenuStatus = async (menu: MenuType) => {
  const newStatus = menu.status === 'active' ? 'inactive' : 'active';
  try {
    const { error } = await updateMenuStatus(menu.id, newStatus);
    if (error) {
      throw new Error(error);
    }
    toast.success(`菜单已${newStatus === 'active' ? '启用' : '禁用'}`);
  } catch (err: any) {
    toast.error(err.message || '状态更新失败');
  }
};

// 选择相关方法
const toggleSelect = (menuId: string, selected: boolean) => {
  if (selected) {
    if (!selectedIds.value.includes(menuId)) {
      selectedIds.value.push(menuId);
    }
  } else {
    selectedIds.value = selectedIds.value.filter((id) => id !== menuId);
  }
  updateSelectAllState();
};

const handleSelectAll = (selectAllValue: boolean) => {
  if (selectAllValue) {
    const allIds = getAllMenuIds(menus.value);
    selectedIds.value = allIds;
  } else {
    selectedIds.value = [];
  }
  selectAll.value = selectAllValue;
};

const getAllMenuIds = (menuList: any): string[] => {
  const ids: string[] = [];
  const traverse = (items: any) => {
    items.forEach((item: any) => {
      ids.push(item.id);
      if (item.children) {
        traverse(item.children);
      }
    });
  };
  traverse(menuList);
  return ids;
};

const updateSelectAllState = () => {
  const allIds = getAllMenuIds(menus.value);
  selectAll.value =
    allIds.length > 0 && selectedIds.value.length === allIds.length;
};

const clearSelection = () => {
  selectedIds.value = [];
  selectAll.value = false;
};

const confirmBatchDelete = () => {
  if (
    window.confirm(`确定要删除选中的 ${selectedIds.value.length} 个菜单吗？`)
  ) {
    batchDelete();
  }
};

const batchDelete = async () => {
  try {
    const { error } = await deleteMenus(selectedIds.value);
    if (error) {
      throw new Error(error);
    }
    toast.success(`成功删除 ${selectedIds.value.length} 个菜单`);
    clearSelection();
  } catch (err: any) {
    toast.error(err.message || '批量删除失败');
  }
};

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// 初始化
onMounted(() => {
  loadMenus();
});
</script>
