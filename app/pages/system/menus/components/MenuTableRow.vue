<template>
  <div>
    <!-- 当前行 -->
    <div class="grid grid-cols-9 gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <!-- 菜单名称 -->
      <div class="p-3 text-left col-span-2">
        <div class="flex items-center space-x-2">
          <!-- 层级缩进 -->
          <div
            v-for="i in level"
            :key="`indent-${i}`"
            class="w-4 flex-shrink-0"
          ></div>

          <!-- 展开/收起按钮 -->
          <Button
            v-if="menu.children && menu.children.length > 0"
            variant="ghost"
            size="sm"
            class="w-5 h-5 p-0 flex-shrink-0"
            @click="$emit('toggle-expand', menu.id)"
          >
            <ChevronDown
              class="w-3 h-3 transition-transform"
              :class="{ 'rotate-180': !expandedIds.includes(menu.id) }"
            />
          </Button>
          <div v-else class="w-5 flex-shrink-0"></div>

          <!-- 图标 -->
          <component
            :is="getMenuIcon(menu.icon)"
            :key="menu.icon || 'empty'"
            class="w-4 h-4 text-blue-600 flex-shrink-0"
            v-if="menu.icon"
          />

          <!-- 菜单名称 -->
          <span class="font-medium truncate">{{ menu.name }}</span>
        </div>
      </div>

      <!-- 类型 -->
      <div class="p-3 text-center">
        <Badge :variant="getTypeVariant(menu.type) as any">
          {{ getTypeLabel(menu.type) }}
        </Badge>
      </div>

      <!-- 路径 -->
      <div class="p-3 text-left">
        <code
          v-if="menu.path"
          class="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs rounded truncate block"
        >
          {{ menu.path }}
        </code>
        <span v-else class="text-gray-500">-</span>
      </div>

      <!-- 图标 -->
      <div class="p-3 text-center">
        <div class="flex items-center justify-center space-x-1" v-if="menu.icon">
          <component
            :is="getMenuIcon(menu.icon)"
            :key="`table-icon-${menu.icon}`"
            class="w-3 h-3 flex-shrink-0"
          />
          <code class="text-xs text-gray-500 truncate">{{ menu.icon }}</code>
        </div>
        <span v-else class="text-gray-500">-</span>
      </div>

      <!-- 权限标识 -->
      <div class="p-3 text-left">
        <code v-if="menu.permission" class="text-xs bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded truncate block">
          {{ menu.permission }}
        </code>
        <span v-else class="text-gray-500">-</span>
      </div>

      <!-- 排序 -->
      <div class="p-3 text-center">
        <span class="text-sm">{{ menu.sort }}</span>
      </div>

      <!-- 状态 -->
      <div class="p-3 text-center">
        <div 
          class="cursor-pointer inline-block"
          @click="$emit('toggle-status', menu)"
        >
                    <StatusBadge 
            :status="getMenuStatusType(menu.status)" 
            :customLabel="menu.status === 'active' ? '启用' : '禁用'"
          />
        </div>
      </div>

      <!-- 操作 -->
      <div class="p-3 text-center">
        <div class="flex items-center justify-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            title="添加子菜单"
            @click="$emit('add-child', menu)"
            v-if="menu.type !== 'permission'"
          >
            <Plus class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="编辑"
            @click="$emit('edit', menu)"
          >
            <Edit class="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="删除"
            @click="$emit('delete', menu)"
          >
            <Trash2 class="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 递归渲染子菜单 -->
    <MenuTableRow
      v-if="menu.children && menu.children.length > 0 && expandedIds.includes(menu.id)"
      v-for="child in menu.children"
      :key="child.id"
      :menu="child"
      :level="level + 1"
      :expanded-ids="expandedIds"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @add-child="$emit('add-child', $event)"
      @toggle-status="$emit('toggle-status', $event)"
      @toggle-expand="$emit('toggle-expand', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, Edit, Plus, Trash2 } from 'lucide-vue-next';
import { getIconByName } from '~/components/icons';
import type { StatusType } from '~/components/StatusBadge.vue';
import type { Menu } from '~/composables/useMenus';

interface MenuTableRowProps {
  menu: Menu;
  level: number;
  expandedIds: string[];
}

interface MenuTableRowEmits {
  (e: 'toggle-status' | 'add-child' | 'delete' | 'edit', menu: Menu): void;
  (e: 'toggle-expand', menuId: string): void;
}

const props = defineProps<MenuTableRowProps>();
const emit = defineEmits<MenuTableRowEmits>();

// 方法
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

const getTypeLabel = (type: string) => {
  const typeMap = {
    directory: '目录',
    menu: '菜单',
    permission: '权限',
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getTypeVariant = (type: string) => {
  const variantMap = {
    directory: 'secondary',
    menu: 'default',
    permission: 'outline',
  };
  return variantMap[type as keyof typeof variantMap] || 'default';
};

const getMenuIcon = (iconName?: string | null) => {
  if (!iconName) {
    return getIconByName('HelpCircle');
  }

  return getIconByName(iconName);
};

// 菜单状态映射到StatusBadge状态类型
const getMenuStatusType = (status: 'active' | 'inactive'): StatusType => {
  const statusMap: Record<'active' | 'inactive', StatusType> = {
    active: 'active',
    inactive: 'inactive',
  };
  return statusMap[status];
};
</script>
