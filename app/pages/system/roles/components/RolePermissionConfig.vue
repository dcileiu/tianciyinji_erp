<template>
  <div class="space-y-4">
    <div class="text-center py-8" v-if="loading">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
      ></div>
      <p class="text-muted-foreground mt-2">加载菜单数据...</p>
    </div>

    <div class="text-center py-8" v-else-if="menus.length === 0">
      <p class="text-muted-foreground">暂无菜单数据</p>
    </div>

    <div class="space-y-2" v-else>
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-sm font-medium">菜单权限配置</h4>
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="selectAll"> 全选 </Button>
          <Button size="sm" variant="outline" @click="unselectAll">
            取消全选
          </Button>
        </div>
      </div>

      <div class="max-h-80 overflow-y-auto border rounded-lg p-4">
        <div class="mb-4" v-for="menu in menus" :key="menu.id">
          <!-- 一级菜单 -->
          <div class="flex items-center space-x-2 py-2">
            <input
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              type="checkbox"
              :checked="selectedIds.includes(menu.id)"
              :id="menu.id"
              @change="handlePermissionUpdate(menu.id, ($event.target as HTMLInputElement).checked)"
            >
            <label
              class="text-sm font-semibold cursor-pointer flex items-center"
              :for="menu.id"
            >
              <span class="mr-2">📁</span>
              {{ menu.name }}
            </label>
          </div>

          <!-- 二级菜单 -->
          <div
            class="ml-6 space-y-1 border-l-2 border-gray-100 pl-4"
            v-if="menu.children && menu.children.length > 0"
          >
            <div
              class="flex items-center space-x-2 py-1"
              v-for="child in menu.children"
              :key="child.id"
            >
              <input
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                type="checkbox"
                :checked="selectedIds.includes(child.id)"
                :id="child.id"
                @change="handlePermissionUpdate(child.id, ($event.target as HTMLInputElement).checked)"
              >
              <label
                class="text-sm cursor-pointer flex items-center"
                :for="child.id"
              >
                <span class="mr-2">📄</span>
                {{ child.name }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="text-sm text-muted-foreground mt-2">
        已选择 {{ selectedIds.length }} 个菜单权限
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Button } from "@/components/ui/button";

  interface Props {
    roleId?: string;
    selectedMenuIds?: string[];
  }

  type Emits = (event: "update:selectedMenuIds", value: string[]) => void;

  const props = withDefaults(defineProps<Props>(), {
    selectedMenuIds: () => [],
  });

  const emit = defineEmits<Emits>();

  // 状态
  const menus = ref<any[]>([]);
  const loading = ref(false);
  const selectedIds = ref<string[]>([]);

  // 初始化选中的菜单
  watch(
    () => props.selectedMenuIds,
    (newValue) => {
      selectedIds.value = [...(newValue || [])];
    },
    { immediate: true }
  );

  // 监听选中变化并向外emit（简化处理）
  watchEffect(() => {
    emit("update:selectedMenuIds", selectedIds.value);
  });

  // 获取菜单数据
  const fetchMenus = async () => {
    try {
      loading.value = true;
      // 使用模拟数据 - 完整的ERP菜单结构
      menus.value = [
        {
          id: "1",
          name: "系统管理",
          type: "directory",
          children: [
            { id: "11", name: "用户管理", type: "menu" },
            { id: "12", name: "角色管理", type: "menu" },
            { id: "13", name: "部门管理", type: "menu" },
            { id: "14", name: "菜单管理", type: "menu" },
            { id: "15", name: "系统配置", type: "menu" },
            { id: "16", name: "操作日志", type: "menu" },
          ],
        },
        {
          id: "2",
          name: "销售管理",
          type: "directory",
          children: [
            { id: "21", name: "客户管理", type: "menu" },
            { id: "22", name: "销售订单", type: "menu" },
            { id: "23", name: "销售发货", type: "menu" },
            { id: "24", name: "销售退货", type: "menu" },
          ],
        },
        {
          id: "3",
          name: "采购管理",
          type: "directory",
          children: [
            { id: "31", name: "供应商管理", type: "menu" },
            { id: "32", name: "采购订单", type: "menu" },
            { id: "33", name: "采购入库", type: "menu" },
            { id: "34", name: "采购退货", type: "menu" },
          ],
        },
        {
          id: "4",
          name: "库存管理",
          type: "directory",
          children: [
            { id: "41", name: "仓库管理", type: "menu" },
            { id: "42", name: "库存查询", type: "menu" },
            { id: "43", name: "库存调拨", type: "menu" },
            { id: "44", name: "盘点管理", type: "menu" },
          ],
        },
        {
          id: "5",
          name: "生产管理",
          type: "directory",
          children: [
            { id: "51", name: "生产计划", type: "menu" },
            { id: "52", name: "生产订单", type: "menu" },
            { id: "53", name: "工艺管理", type: "menu" },
            { id: "54", name: "BOM管理", type: "menu" },
          ],
        },
        {
          id: "6",
          name: "财务管理",
          type: "directory",
          children: [
            { id: "61", name: "应收管理", type: "menu" },
            { id: "62", name: "应付管理", type: "menu" },
            { id: "63", name: "发票管理", type: "menu" },
            { id: "64", name: "费用管理", type: "menu" },
          ],
        },
        {
          id: "7",
          name: "报表中心",
          type: "directory",
          children: [
            { id: "71", name: "销售报表", type: "menu" },
            { id: "72", name: "采购报表", type: "menu" },
            { id: "73", name: "库存报表", type: "menu" },
            { id: "74", name: "财务报表", type: "menu" },
          ],
        },
      ];
    } catch (error) {
    } finally {
      loading.value = false;
    }
  };

  // 处理权限更新
  const handlePermissionUpdate = (menuId: string, checked: boolean) => {
    const newSelectedIds = [...selectedIds.value];

    if (checked) {
      if (!newSelectedIds.includes(menuId)) {
        newSelectedIds.push(menuId);
      }
    } else {
      const index = newSelectedIds.indexOf(menuId);
      if (index > -1) {
        newSelectedIds.splice(index, 1);
      }
    }

    selectedIds.value = newSelectedIds;
  };

  // 获取所有菜单ID
  const getAllMenuIds = (menuList: any[]): string[] => {
    const ids: string[] = [];

    const traverse = (menus: any[]) => {
      menus.forEach((menu) => {
        ids.push(menu.id);
        if (menu.children && menu.children.length > 0) {
          traverse(menu.children);
        }
      });
    };

    traverse(menuList);
    return ids;
  };

  // 全选
  const selectAll = () => {
    selectedIds.value = getAllMenuIds(menus.value);
  };

  // 取消全选
  const unselectAll = () => {
    selectedIds.value = [];
  };

  // 初始化
  onMounted(() => {
    fetchMenus();
  });
</script>
