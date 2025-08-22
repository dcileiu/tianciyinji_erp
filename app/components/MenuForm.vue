<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- 基本信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 菜单名称 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          菜单名称 <span class="text-red-500">*</span>
        </label>
        <Input
          v-model="form.name"
          placeholder="请输入菜单名称"
          :class="{ 'border-red-500': errors.name }"
          required
        />
        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>
      
      <!-- 父级菜单 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          父级菜单
        </label>
        <Select v-model="form.parent_id">
          <option value="">无（顶级菜单）</option>
          <option
            v-for="menu in availableParents"
            :key="menu.id"
            :value="menu.id"
            :disabled="menu.id === editingMenuId"
          >
            {{ getMenuDisplayName(menu) }}
          </option>
        </Select>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 菜单路径 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          菜单路径
        </label>
        <Input
          v-model="form.path"
          placeholder="/dashboard 或 https://example.com"
          :class="{ 'border-red-500': errors.path }"
        />
        <p v-if="errors.path" class="text-red-500 text-sm mt-1">{{ errors.path }}</p>
        <p class="text-gray-500 text-xs mt-1">
          内部路径以 / 开头，外部链接以 http:// 或 https:// 开头
        </p>
      </div>
      
      <!-- 排序 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          排序
        </label>
        <Input
          v-model.number="form.sort_order"
          type="number"
          placeholder="0"
          min="0"
          max="9999"
        />
        <p class="text-gray-500 text-xs mt-1">数字越小排序越靠前</p>
      </div>
    </div>
    
    <!-- 图标选择 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        菜单图标
      </label>
      <div class="flex items-center gap-4">
        <Select v-model="form.icon" class="flex-1">
          <option value="">请选择图标</option>
          <option
            v-for="icon in availableIcons"
            :key="icon.name"
            :value="icon.name"
          >
            {{ icon.label }}
          </option>
        </Select>
        
        <!-- 图标预览 -->
        <div v-if="form.icon" class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded">
          <component
            :is="getIconComponent(form.icon)"
            class="w-4 h-4 text-gray-600 dark:text-gray-400"
          />
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ form.icon }}</span>
        </div>
      </div>
    </div>
    
    <!-- 菜单描述 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        菜单描述
      </label>
      <textarea
        v-model="form.description"
        rows="3"
        placeholder="请输入菜单描述（可选）"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
      ></textarea>
    </div>
    
    <!-- 菜单选项 -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">菜单选项</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 是否隐藏 -->
        <div class="flex items-center">
          <input
            id="is_hidden"
            v-model="form.is_hidden"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label for="is_hidden" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            隐藏菜单
          </label>
        </div>
        
        <!-- 是否外部链接 -->
        <div class="flex items-center">
          <input
            id="is_external"
            v-model="form.is_external"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label for="is_external" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            外部链接
          </label>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 新窗口打开 -->
        <div class="flex items-center">
          <input
            id="open_in_new_tab"
            v-model="form.open_in_new_tab"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            :disabled="!form.is_external"
          />
          <label for="open_in_new_tab" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            新窗口打开
          </label>
        </div>
        
        <!-- 需要权限 -->
        <div class="flex items-center">
          <input
            id="requires_permission"
            v-model="form.requires_permission"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label for="requires_permission" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            需要权限验证
          </label>
        </div>
      </div>
    </div>
    
    <!-- 权限配置 -->
    <div v-if="form.requires_permission" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">权限配置</h3>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          所需权限
        </label>
        <Input
          v-model="form.permission_key"
          placeholder="menu:view 或 dashboard:access"
          :class="{ 'border-red-500': errors.permission_key }"
        />
        <p v-if="errors.permission_key" class="text-red-500 text-sm mt-1">{{ errors.permission_key }}</p>
        <p class="text-gray-500 text-xs mt-1">
          权限键格式：模块:操作，如 menu:view、user:manage
        </p>
      </div>
    </div>
    
    <!-- 表单按钮 -->
    <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Button type="button" variant="outline" @click="$emit('cancel')">
        取消
      </Button>
      <Button type="submit" :disabled="loading">
        <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        {{ editingMenuId ? '更新菜单' : '创建菜单' }}
      </Button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
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
  MapPin,
  Home,
  Bell,
  Mail,
  Phone,
  Globe,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  Edit,
  Trash2,
  Plus,
  Minus
} from 'lucide-vue-next'

// Props
const props = defineProps({
  menu: {
    type: Object,
    default: null
  },
  parentId: {
    type: String,
    default: null
  },
  menus: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['save', 'cancel'])

// 状态
const loading = ref(false)
const errors = ref({})

// 表单数据
const form = ref({
  name: '',
  path: '',
  icon: '',
  description: '',
  parent_id: props.parentId || '',
  sort_order: 0,
  is_hidden: false,
  is_external: false,
  open_in_new_tab: false,
  requires_permission: false,
  permission_key: ''
})

// 可用图标
const availableIcons = [
  { name: 'LayoutDashboard', label: '仪表板' },
  { name: 'Database', label: '数据库' },
  { name: 'Warehouse', label: '仓库' },
  { name: 'ShoppingCart', label: '购物车' },
  { name: 'Package', label: '包裹' },
  { name: 'Factory', label: '工厂' },
  { name: 'DollarSign', label: '美元符号' },
  { name: 'BarChart3', label: '柱状图' },
  { name: 'Users', label: '用户' },
  { name: 'Settings', label: '设置' },
  { name: 'BookOpen', label: '打开的书' },
  { name: 'FileText', label: '文件' },
  { name: 'Calendar', label: '日历' },
  { name: 'Truck', label: '卡车' },
  { name: 'ClipboardList', label: '清单' },
  { name: 'PieChart', label: '饼图' },
  { name: 'Building', label: '建筑' },
  { name: 'UserCheck', label: '用户检查' },
  { name: 'Shield', label: '盾牌' },
  { name: 'Key', label: '钥匙' },
  { name: 'MenuIcon', label: '菜单' },
  { name: 'Folder', label: '文件夹' },
  { name: 'Tag', label: '标签' },
  { name: 'MapPin', label: '地图标记' },
  { name: 'Home', label: '首页' },
  { name: 'Bell', label: '铃铛' },
  { name: 'Mail', label: '邮件' },
  { name: 'Phone', label: '电话' },
  { name: 'Globe', label: '地球' },
  { name: 'Search', label: '搜索' },
  { name: 'Filter', label: '过滤器' },
  { name: 'Download', label: '下载' },
  { name: 'Upload', label: '上传' },
  { name: 'Save', label: '保存' },
  { name: 'Edit', label: '编辑' },
  { name: 'Trash2', label: '删除' },
  { name: 'Plus', label: '加号' },
  { name: 'Minus', label: '减号' }
]

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
  MapPin,
  Home,
  Bell,
  Mail,
  Phone,
  Globe,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  Edit,
  Trash2,
  Plus,
  Minus
}

// 计算属性
const editingMenuId = computed(() => props.menu?.id)

const availableParents = computed(() => {
  // 过滤掉当前编辑的菜单及其子菜单，避免循环引用
  return props.menus.filter(menu => {
    if (editingMenuId.value && menu.id === editingMenuId.value) {
      return false
    }
    // TODO: 这里可以添加更复杂的逻辑来过滤子菜单
    return true
  })
})

// 方法
const getIconComponent = (iconName) => {
  return iconMap[iconName] || MenuIcon
}

const getMenuDisplayName = (menu) => {
  const level = getMenuLevel(menu)
  const prefix = '　'.repeat(level) // 使用全角空格缩进
  return `${prefix}${menu.name}`
}

const getMenuLevel = (menu, level = 0) => {
  if (!menu.parent_id) return level
  
  const parent = props.menus.find(m => m.id === menu.parent_id)
  if (!parent) return level
  
  return getMenuLevel(parent, level + 1)
}

const validateForm = () => {
  errors.value = {}
  
  // 验证菜单名称
  if (!form.value.name.trim()) {
    errors.value.name = '菜单名称不能为空'
  }
  
  // 验证路径格式
  if (form.value.path) {
    const path = form.value.path.trim()
    if (form.value.is_external) {
      if (!path.startsWith('http://') && !path.startsWith('https://')) {
        errors.value.path = '外部链接必须以 http:// 或 https:// 开头'
      }
    } else {
      if (!path.startsWith('/')) {
        errors.value.path = '内部路径必须以 / 开头'
      }
    }
  }
  
  // 验证权限键
  if (form.value.requires_permission && !form.value.permission_key.trim()) {
    errors.value.permission_key = '启用权限验证时必须设置权限键'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const menuData = {
      ...form.value,
      name: form.value.name.trim(),
      path: form.value.path.trim() || null,
      description: form.value.description.trim() || null,
      parent_id: form.value.parent_id || null,
      permission_key: form.value.permission_key.trim() || null
    }
    
    // 如果不是外部链接，清除相关字段
    if (!menuData.is_external) {
      menuData.open_in_new_tab = false
    }
    
    // 如果不需要权限验证，清除权限键
    if (!menuData.requires_permission) {
      menuData.permission_key = null
    }
    
    emit('save', menuData)
    
  } catch (err) {
    console.error('表单提交失败:', err)
  } finally {
    loading.value = false
  }
}

// 监听外部链接状态变化
watch(() => form.value.is_external, (isExternal) => {
  if (isExternal) {
    // 如果是外部链接，自动检测并设置
    if (form.value.path && (form.value.path.startsWith('http://') || form.value.path.startsWith('https://'))) {
      form.value.open_in_new_tab = true
    }
  } else {
    form.value.open_in_new_tab = false
  }
})

// 监听路径变化，自动检测是否为外部链接
watch(() => form.value.path, (path) => {
  if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
    form.value.is_external = true
    form.value.open_in_new_tab = true
  }
})

// 初始化表单数据
const initForm = () => {
  if (props.menu) {
    // 编辑模式
    form.value = {
      name: props.menu.name || '',
      path: props.menu.path || '',
      icon: props.menu.icon || '',
      description: props.menu.description || '',
      parent_id: props.menu.parent_id || '',
      sort_order: props.menu.sort_order || 0,
      is_hidden: props.menu.is_hidden || false,
      is_external: props.menu.is_external || false,
      open_in_new_tab: props.menu.open_in_new_tab || false,
      requires_permission: props.menu.requires_permission || false,
      permission_key: props.menu.permission_key || ''
    }
  } else {
    // 创建模式
    form.value = {
      name: '',
      path: '',
      icon: '',
      description: '',
      parent_id: props.parentId || '',
      sort_order: 0,
      is_hidden: false,
      is_external: false,
      open_in_new_tab: false,
      requires_permission: false,
      permission_key: ''
    }
  }
  
  errors.value = {}
}

// 监听 props 变化
watch(() => [props.menu, props.parentId], () => {
  initForm()
}, { immediate: true })

// 组件挂载
onMounted(() => {
  initForm()
})
</script>