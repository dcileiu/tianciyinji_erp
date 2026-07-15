<template>
  <div class="permission-tree-node">
    <!-- 当前节点 -->
    <div
      class="flex items-center py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
      :class="{
        'bg-blue-50 dark:bg-blue-900/20': isSelected,
        'opacity-50': disabled,
      }"
      :style="{ paddingLeft: `${level * 20 + 8}px` }"
    >
      <!-- 展开/收起按钮 -->
      <button
        class="flex items-center justify-center w-5 h-5 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        v-if="hasChildren"
        @click="handleToggleExpand"
      >
        <ChevronRight
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
        />
      </button>

      <!-- 占位符（无子项时） -->
      <div class="w-5 h-5 mr-2" v-else></div>

      <!-- 复选框 -->
      <div class="flex items-center mr-3">
        <input
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
          type="checkbox"
          :checked="isSelected"
          :disabled="disabled"
          :id="`permission-${item.id}`"
          :indeterminate="isIndeterminate"
          @change="handleToggleSelection"
        >
      </div>

      <!-- 图标 -->
      <div class="flex items-center mr-3">
        <component
          class="w-4 h-4 text-gray-500"
          :is="iconComponent"
          v-if="iconComponent"
        />
        <div
          class="w-4 h-4 bg-gray-300 rounded flex items-center justify-center"
          v-else
        >
          <span class="text-xs text-gray-600"
            >{{ getTypeIcon(item.type) }}</span
          >
        </div>
      </div>

      <!-- 内容 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <label
            class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer truncate"
            :for="`permission-${item.id}`"
          >
            {{ item.name }}
          </label>

          <!-- 类型标签 -->
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            v-if="item.type"
            :class="getTypeClass(item.type)"
          >
            {{ getTypeLabel(item.type) }}
          </span>

          <!-- 权限键 -->
          <span
            class="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded"
            v-if="item.key"
          >
            {{ item.key }}
          </span>
        </div>

        <!-- 描述 -->
        <div
          class="text-xs text-gray-500 mt-1 truncate"
          v-if="item.description"
          :title="item.description"
        >
          {{ item.description }}
        </div>

        <!-- 路径信息 -->
        <div
          class="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono truncate"
          v-if="item.path || item.url"
          :title="item.path || item.url"
        >
          {{ item.path || item.url }}
        </div>
      </div>

      <!-- 状态指示器 -->
      <div class="flex items-center space-x-2 ml-2">
        <!-- 必需权限标识 -->
        <div
          class="w-2 h-2 bg-red-500 rounded-full"
          title="必需权限"
          v-if="item.is_required"
        ></div>

        <!-- 隐藏状态 -->
        <EyeOff
          class="w-3 h-3 text-gray-400"
          title="隐藏项"
          v-if="item.is_hidden"
        />

        <!-- 禁用状态 -->
        <Ban
          class="w-3 h-3 text-red-400"
          title="已禁用"
          v-if="!item.is_active"
        />
      </div>
    </div>

    <!-- 子节点 -->
    <div class="children" v-if="hasChildren && isExpanded">
      <PermissionTreeNode
        v-for="child in item.children"
        :key="child.id"
        :disabled="disabled"
        :expanded-ids="expandedIds"
        :item="child"
        :level="level + 1"
        :selected-ids="selectedIds"
        @toggle-expand="$emit('toggle-expand', $event)"
        @toggle-selection="$emit('toggle-selection', $event, $event.selected)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    ChevronRight,
    Database,
    FileText,
    Globe,
    Menu,
    Settings,
    Shield,
    Zap,
  } from "lucide-vue-next";
  import { computed } from "vue";

  // Props
  const props = defineProps({
    item: {
      type: Object,
      required: true,
    },
    selectedIds: {
      type: Array,
      default: () => [],
    },
    expandedIds: {
      type: Set,
      default: () => new Set(),
    },
    level: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  // Emits
  const emit = defineEmits(["toggle-selection", "toggle-expand"]);

  // 计算属性
  const hasChildren = computed(
    () => props.item.children && props.item.children.length > 0
  );

  const isExpanded = computed(() => props.expandedIds.has(props.item.id));

  const isSelected = computed(() => props.selectedIds.includes(props.item.id));

  const isIndeterminate = computed(() => {
    if (!hasChildren.value) {
      return false;
    }

    const childIds = getAllChildIds(props.item.children);
    const selectedChildIds = childIds.filter((id: any) =>
      props.selectedIds.includes(id)
    );

    return (
      selectedChildIds.length > 0 && selectedChildIds.length < childIds.length
    );
  });

  const iconComponent = computed(() => {
    const iconMap: Record<string, any> = {
      menu: Menu,
      page: FileText,
      function: Zap,
      data: Database,
      api: Globe,
      system: Settings,
      security: Shield,
    };

    return iconMap[props.item.type as string] || null;
  });

  // 方法
  const getAllChildIds = (children: any[]): any[] => {
    const ids: any[] = [];
    for (const child of children) {
      ids.push(child.id);
      if (child.children && child.children.length > 0) {
        ids.push(...getAllChildIds(child.children));
      }
    }
    return ids;
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      menu: "📋",
      page: "📄",
      function: "⚡",
      data: "💾",
      api: "🌐",
      system: "⚙️",
      security: "🛡️",
    };
    return iconMap[type] || "📦";
  };

  const getTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      menu: "菜单",
      page: "页面",
      function: "功能",
      data: "数据",
      api: "API",
      system: "系统",
      security: "安全",
    };
    return labelMap[type] || type;
  };

  const getTypeClass = (type: string) => {
    const classMap: Record<string, string> = {
      menu: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      page: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      function:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      data: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      api: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      system: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      security: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return (
      classMap[type] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    );
  };

  const handleToggleSelection = (event: any) => {
    if (props.disabled) {
      return;
    }

    emit("toggle-selection", props.item.id, event.target.checked);
  };

  const handleToggleExpand = () => {
    emit("toggle-expand", props.item.id);
  };
</script>

<style scoped>
  .permission-tree-node {
    @apply select-none;
  }

  .children {
    @apply border-l border-gray-200 dark:border-gray-700 ml-2;
  }

  /* 自定义复选框的半选状态样式 */
  input[type="checkbox"]:indeterminate {
    @apply bg-blue-600 border-blue-600;
  }

  input[type="checkbox"]:indeterminate::before {
    content: "";
    @apply block w-2 h-0.5 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
  }
</style>
