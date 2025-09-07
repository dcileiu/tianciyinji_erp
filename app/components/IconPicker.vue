<template>
  <div class="space-y-4">
    <!-- 当前选中的图标 -->
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 border rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <component
          :is="getIconByName(selectedIcon)"
          :key="selectedIcon || 'empty'"
          class="w-5 h-5"
          v-if="selectedIcon"
        />
        <span v-else class="text-gray-400 text-xs">无</span>
      </div>
      <div>
        <p class="font-medium">{{ selectedIcon || '未选择图标' }}</p>
        <p class="text-sm text-gray-500">点击下方图标进行选择</p>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        v-model="searchQuery"
        placeholder="搜索图标..."
        class="pl-10"
      />
    </div>

    <!-- 图标网格 -->
    <div class="max-h-64 overflow-y-auto border rounded-lg p-4">
      <div class="grid grid-cols-8 gap-2">
        <button
          v-for="iconName in filteredIcons"
          :key="iconName"
          @click="selectIcon(iconName)"
          :class="[
            'w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all hover:bg-gray-50 dark:hover:bg-gray-800',
            selectedIcon === iconName
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700'
          ]"
          :title="iconName"
        >
          <component
            :is="getIconByName(iconName)"
            :key="`icon-${iconName}`"
            class="w-4 h-4"
          />
        </button>
      </div>
    </div>

    <!-- 清除选择按钮 -->
    <div class="flex justify-between">
      <Button
        variant="outline"
        size="sm"
        @click="clearSelection"
        v-if="selectedIcon"
      >
        清除选择
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import { getIconByName, iconNames } from '~/components/icons';

interface IconPickerProps {
  modelValue?: string | null;
}

type IconPickerEmits = (e: 'update:modelValue', value: string | null) => void;

const props = withDefaults(defineProps<IconPickerProps>(), {
  modelValue: null,
});

const emit = defineEmits<IconPickerEmits>();

// 响应式数据
const searchQuery = ref('');
const selectedIcon = ref<string | null>(props.modelValue);

// 监听 props 变化
watch(
  () => props.modelValue,
  (newValue) => {
    selectedIcon.value = newValue;
  }
);

// 监听 selectedIcon 变化，向父组件发送事件
watch(selectedIcon, (newValue) => {
  emit('update:modelValue', newValue);
});

// 过滤图标
const filteredIcons = computed(() => {
  if (!searchQuery.value) {
    return iconNames;
  }

  return iconNames.filter((iconName) =>
    iconName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 方法
const selectIcon = (iconName: string) => {
  selectedIcon.value = iconName;
};

const clearSelection = () => {
  selectedIcon.value = null;
};
</script>
