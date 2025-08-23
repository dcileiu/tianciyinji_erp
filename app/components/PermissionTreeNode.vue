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
        v-if="hasChildren"
        class="flex items-center justify-center w-5 h-5 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        @click="handleToggleExpand"
      >
        <ChevronRight 
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
        />
      </button>
      
      <!-- 占位符（无子项时） -->
      <div v-else class="w-5 h-5 mr-2"></div>
      
      <!-- 复选框 -->
      <div class="flex items-center mr-3">
        <input
          :id="`permission-${item.id}`"
          type="checkbox"
          :checked="isSelected"
          :indeterminate="isIndeterminate"
          :disabled="disabled"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
          @change="handleToggleSelection"
        />
      </div>
      
      <!-- 图标 -->
      <div class="flex items-center mr-3">
        <component
          :is="iconComponent"
          v-if="iconComponent"
          class="w-4 h-4 text-gray-500"
        />
        <div v-else class="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
          <span class="text-xs text-gray-600">{{ getTypeIcon(item.type) }}</span>
        </div>
      </div>
      
      <!-- 内容 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <label 
            :for="`permission-${item.id}`"
            class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer truncate"
          >
            {{ item.name }}
          </label>
          
          <!-- 类型标签 -->
          <span 
            v-if="item.type"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            :class="getTypeClass(item.type)"
          >
            {{ getTypeLabel(item.type) }}
          </span>
          
          <!-- 权限键 -->
          <span 
            v-if="item.key"
            class="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded"
          >
            {{ item.key }}
          </span>
        </div>
        
        <!-- 描述 -->
        <div 
          v-if="item.description"
          class="text-xs text-gray-500 mt-1 truncate"
          :title="item.description"
        >
          {{ item.description }}
        </div>
        
        <!-- 路径信息 -->
        <div 
          v-if="item.path || item.url"
          class="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono truncate"
          :title="item.path || item.url"
        >
          {{ item.path || item.url }}
        </div>
      </div>
      
      <!-- 状态指示器 -->
      <div class="flex items-center space-x-2 ml-2">
        <!-- 必需权限标识 -->
        <div 
          v-if="item.is_required"
          class="w-2 h-2 bg-red-500 rounded-full"
          title="必需权限"
        ></div>
        
        <!-- 隐藏状态 -->
        <EyeOff 
          v-if="item.is_hidden"
          class="w-3 h-3 text-gray-400"
          title="隐藏项"
        />
        
        <!-- 禁用状态 -->
        <Ban 
          v-if="!item.is_active"
          class="w-3 h-3 text-red-400"
          title="已禁用"
        />
      </div>
    </div>
    
    <!-- 子节点 -->
    <div v-if="hasChildren && isExpanded" class="children">
      <PermissionTreeNode
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :selected-ids="selectedIds"
        :expanded-ids="expandedIds"
        :level="level + 1"
        :disabled="disabled"
        @toggle-selection="$emit('toggle-selection', $event, $event.selected)"
        @toggle-expand="$emit('toggle-expand', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  ChevronRight, 
  EyeOff, 
  Ban,
  Menu,
  Shield,
  Database,
  Settings,
  FileText,
  Globe,
  Zap
} from 'lucide-vue-next'

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  expandedIds: {
    type: Set,
    default: () => new Set()
  },
  level: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['toggle-selection', 'toggle-expand'])

// 计算属性
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

const isExpanded = computed(() => {
  return props.expandedIds.has(props.item.id)
})

const isSelected = computed(() => {
  return props.selectedIds.includes(props.item.id)
})

const isIndeterminate = computed(() => {
  if (!hasChildren.value) return false
  
  const childIds = getAllChildIds(props.item.children)
  const selectedChildIds = childIds.filter(id => props.selectedIds.includes(id))
  
  return selectedChildIds.length > 0 && selectedChildIds.length < childIds.length
})

const iconComponent = computed(() => {
  const iconMap = {
    menu: Menu,
    page: FileText,
    function: Zap,
    data: Database,
    api: Globe,
    system: Settings,
    security: Shield
  }
  
  return iconMap[props.item.type] || null
})

// 方法
const getAllChildIds = (children) => {
  const ids = []
  for (const child of children) {
    ids.push(child.id)
    if (child.children && child.children.length > 0) {
      ids.push(...getAllChildIds(child.children))
    }
  }
  return ids
}

const getTypeIcon = (type) => {
  const iconMap = {
    menu: '📋',
    page: '📄',
    function: '⚡',
    data: '💾',
    api: '🌐',
    system: '⚙️',
    security: '🛡️'
  }
  return iconMap[type] || '📦'
}

const getTypeLabel = (type) => {
  const labelMap = {
    menu: '菜单',
    page: '页面',
    function: '功能',
    data: '数据',
    api: 'API',
    system: '系统',
    security: '安全'
  }
  return labelMap[type] || type
}

const getTypeClass = (type) => {
  const classMap = {
    menu: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    page: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    function: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    data: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    api: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    system: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return classMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

const handleToggleSelection = (event) => {
  if (props.disabled) return
  
  emit('toggle-selection', props.item.id, event.target.checked)
}

const handleToggleExpand = () => {
  emit('toggle-expand', props.item.id)
}
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
  content: '';
  @apply block w-2 h-0.5 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
}
</style>
