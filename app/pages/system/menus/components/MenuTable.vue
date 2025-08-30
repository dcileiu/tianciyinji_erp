<template>
  <div class="space-y-4">
    <!-- 表格 -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <!-- 表头 -->
      <div class="grid grid-cols-10 gap-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="p-3 text-center">
          <input
            type="checkbox"
            class="rounded"
            :checked="selectAll"
            @change="toggleSelectAll"
          />
        </div>
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
          :menu="menu"
          :level="0"
          :selected-ids="selectedIds"
          :expanded-ids="expandedIds"
          @select="handleSelect"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @add-child="$emit('add-child', $event)"
          @toggle-status="$emit('toggle-status', $event)"
          @toggle-expand="toggleExpand"
        />
      </div>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedIds.length > 0" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <div class="flex items-center justify-between">
        <span class="text-sm text-blue-600 dark:text-blue-400">
          已选择 {{ selectedIds.length }} 项
        </span>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="$emit('clear-selection')">
            取消选择
          </Button>
          <Button variant="destructive" size="sm" @click="$emit('batch-delete')">
            批量删除
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Menu } from '~/composables/useMenus'
import MenuTableRow from '~/pages/system/menus/components/MenuTableRow.vue'

interface MenuTableProps {
  menus: Menu[]
  selectedIds: string[]
  selectAll: boolean
}

interface MenuTableEmits {
  (e: 'select', menuId: string, selected: boolean): void
  (e: 'select-all', selectAll: boolean): void
  (e: 'edit', menu: Menu): void
  (e: 'delete', menu: Menu): void
  (e: 'add-child', menu: Menu): void
  (e: 'toggle-status', menu: Menu): void
  (e: 'clear-selection'): void
  (e: 'batch-delete'): void
}

const props = defineProps<MenuTableProps>()
const emit = defineEmits<MenuTableEmits>()

// 展开状态管理
const expandedIds = ref<string[]>([])

const handleSelect = (menuId: string, selected: boolean) => {
  emit('select', menuId, selected)
}

const toggleSelectAll = () => {
  emit('select-all', !props.selectAll)
}

const toggleExpand = (menuId: string) => {
  const index = expandedIds.value.indexOf(menuId)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(menuId)
  }
}
</script>
