 <template>
  <TableRow :class="{ 'bg-blue-50 dark:bg-blue-950/20': selected }">
    <!-- 选择框 -->
    <TableCell>
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('select', menu.id)"
        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </TableCell>
    
    <!-- 菜单名称（带层级缩进） -->
    <TableCell>
      <div class="flex items-center" :style="{ paddingLeft: `${level * 24}px` }">
        <!-- 展开/收起按钮 -->
        <button
          v-if="menu.children && menu.children.length > 0"
          @click="toggleExpanded"
          class="mr-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight
            :class="[
              'w-4 h-4 text-gray-500 transition-transform',
              { 'rotate-90': expanded }
            ]"
          />
        </button>
        <div v-else class="w-6 mr-2"></div>
        
        <!-- 菜单图标 -->
        <component
          v-if="menu.icon"
          :is="getIconComponent(menu.icon)"
          class="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400"
        />
        
        <!-- 菜单名称 -->
        <span class="font-medium text-gray-900 dark:text-white">
          {{ menu.name }}
        </span>
        
        <!-- 外部链接标识 -->
        <ExternalLink
          v-if="menu.is_external"
          class="w-3 h-3 ml-2 text-gray-400"
        />
      </div>
    </TableCell>
    
    <!-- 路径 -->
    <TableCell>
      <code
        v-if="menu.path"
        class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
      >
        {{ menu.path }}
      </code>
      <span v-else class="text-gray-400">-</span>
    </TableCell>
    
    <!-- 图标 -->
    <TableCell>
      <div v-if="menu.icon" class="flex items-center gap-2">
        <component
          :is="getIconComponent(menu.icon)"
          class="w-4 h-4 text-gray-600 dark:text-gray-400"
        />
        <code class="text-xs text-gray-500">{{ menu.icon }}</code>
      </div>
      <span v-else class="text-gray-400">-</span>
    </TableCell>
    
    <!-- 排序 -->
    <TableCell>
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {{ menu.sort_order || 0 }}
      </span>
    </TableCell>
    
    <!-- 状态 -->
    <TableCell>
      <Badge :variant="menu.is_hidden ? 'secondary' : 'success'">
        {{ menu.is_hidden ? '禁用' : '启用' }}
      </Badge>
    </TableCell>
    
    <!-- 创建时间 -->
    <TableCell>
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {{ formatDate(menu.created_at) }}
      </span>
    </TableCell>
    
    <!-- 操作 -->
    <TableCell class="text-right">
      <div class="flex items-center justify-end gap-1">
        <!-- 添加子菜单 -->
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('add-child', menu)"
          title="添加子菜单"
        >
          <Plus class="w-4 h-4" />
        </Button>
        
        <!-- 编辑 -->
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('edit', menu)"
          title="编辑菜单"
        >
          <Edit class="w-4 h-4" />
        </Button>
        
        <!-- 删除 -->
        <Button
          variant="ghost"
          size="sm"
          @click="$emit('delete', menu)"
          title="删除菜单"
          class="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <Trash2 class="w-4 h-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
  
  <!-- 子菜单 -->
  <template v-if="expanded && menu.children && menu.children.length > 0">
    <MenuRow
      v-for="child in menu.children"
      :key="child.id"
      :menu="child"
      :level="level + 1"
      :selected="selectedChildren.includes(child.id)"
      @select="$emit('select', $event)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @add-child="$emit('add-child', $event)"
    />
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ChevronRight,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  LayoutDashboard,
  Database,
  Warehouse,
  ShoppingCart,
  Package,
  Factory,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  FileText,
  Calendar,
  Truck,
  ClipboardList,
  PieChart,
  Building,
  UserCheck,
  Shield,
  Key,
  Menu as MenuIcon,
  Folder,
  Tag,
  MapPin
} from 'lucide-vue-next'

// Props
const props = defineProps({
  menu: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  canCreate: {
    type: Boolean,
    default: false
  }
})

// 状态
const expanded = ref(false)
const showActions = ref(false)

// 图标映射
const iconMap = {
  LayoutDashboard,
  Database,
  Warehouse,
  ShoppingCart,
  Package,
  Factory,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  FileText,
  Calendar,
  Truck,
  ClipboardList,
  PieChart,
  Building,
  UserCheck,
  Shield,
  Key,
  MenuIcon,
  Folder,
  Tag,
  MapPin
}

// Emits
const emit = defineEmits(['select', 'edit', 'delete', 'add-child', 'toggle-selection'])

// 方法
const getIconComponent = (iconName) => {
  return iconMap[iconName] || MenuIcon
}

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

const handleEdit = () => {
  emit('edit', props.menu)
}

const handleDelete = () => {
  emit('delete', props.menu)
}

const handleAddChild = () => {
  emit('add-child', props.menu)
}

const handleToggleSelection = () => {
  emit('toggle-selection', props.menu.id)
}
</script>