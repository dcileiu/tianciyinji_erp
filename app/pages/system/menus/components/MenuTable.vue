<template>
  <div class="space-y-4">
    <!-- 表格 -->
    <div
      class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
    >
      <!-- 表头 -->
      <div
        class="grid grid-cols-9 gap-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <div class="p-3 font-medium text-left col-span-2">菜单名称</div>
        <div class="p-3 font-medium text-center">类型</div>
        <div class="p-3 font-medium text-left">路径</div>
        <div class="p-3 font-medium text-center">图标</div>
        <div class="p-3 font-medium text-left">权限标识</div>
        <div class="p-3 font-medium text-center">排序</div>
        <div class="p-3 font-medium text-center">状态</div>
        <div class="p-3 font-medium text-center">操作</div>
      </div>

      <!-- 表体 -->
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <MenuTableRow
          v-for="menu in menus"
          :key="menu.id"
          :expanded-ids="expandedIds"
          :level="0"
          :menu="menu"
          @add-child="$emit('add-child', $event)"
          @delete="$emit('delete', $event)"
          @edit="$emit('edit', $event)"
          @toggle-expand="toggleExpand"
          @toggle-status="$emit('toggle-status', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Menu } from "~/composables/useMenus";
  import MenuTableRow from "~/pages/system/menus/components/MenuTableRow.vue";

  interface MenuTableProps {
    menus: Menu[];
  }

  type MenuTableEmits = (
    e: "toggle-status" | "add-child" | "delete" | "edit",
    menu: Menu
  ) => void;

  const props = defineProps<MenuTableProps>();
  const emit = defineEmits<MenuTableEmits>();

  // 展开状态管理
  const expandedIds = ref<string[]>([]);

  const toggleExpand = (menuId: string) => {
    const index = expandedIds.value.indexOf(menuId);
    if (index > -1) {
      expandedIds.value.splice(index, 1);
    } else {
      expandedIds.value.push(menuId);
    }
  };
</script>
