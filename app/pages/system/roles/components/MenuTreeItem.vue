<template>
  <div class="space-y-1">
    <div class="flex items-center space-x-2 py-1">
      <Checkbox
        :id="menu.id"
        :checked="isChecked"
        @update:checked="handleCheck"
      />
      <Label
        :for="menu.id"
        class="text-sm font-medium flex items-center space-x-2 cursor-pointer"
      >
        <span>{{ menu.name }}</span>
        <Badge variant="outline" class="text-xs">
          {{ getTypeLabel(menu.type) }}
        </Badge>
      </Label>
    </div>

    <div v-if="menu.children && menu.children.length > 0" class="ml-6 space-y-1">
      <MenuTreeItem
        v-for="child in menu.children"
        :key="child.id"
        :menu="child"
        :selected-permissions="selectedPermissions"
        @update-permission="(...args) => emit('update-permission', ...args)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Menu {
  id: string;
  name: string;
  type: 'directory' | 'menu' | 'permission';
  children?: Menu[];
}

interface Props {
  menu: Menu;
  selectedPermissions: string[];
}

type Emits = (
  event: 'update-permission',
  menuId: string,
  checked: boolean
) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 检查是否选中
const isChecked = computed(() => {
  return props.selectedPermissions.includes(props.menu.id);
});

// 处理选择变化
const handleCheck = (checked: boolean) => {
  emit('update-permission', props.menu.id, checked);
};

// 获取类型标签
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    directory: '目录',
    menu: '菜单',
    permission: '权限',
  };
  return typeMap[type] || '未知';
};
</script>
