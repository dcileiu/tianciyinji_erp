<template>
  <Dialog v-model:open="dialogVisible">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ editingMenu ? "编辑菜单" : "新增菜单" }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="menu-name">菜单名称 *</Label>
            <Input
              id="menu-name"
              v-model="formData.name"
              placeholder="请输入菜单名称"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="menu-type">菜单类型 *</Label>
            <Select v-model="formData.type">
              <SelectTrigger>
                <SelectValue placeholder="选择菜单类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="parent-menu">父级菜单</Label>
            <Select v-model="parentIdString">
              <SelectTrigger>
                <SelectValue placeholder="选择父级菜单" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">根菜单</SelectItem>
                <SelectItem
                  v-for="option in parentMenuOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="menu-path">菜单路径</Label>
            <Input
              id="menu-path"
              v-model="pathString"
              placeholder="例如: /users"
              :disabled="formData.type === 'directory' || formData.type === 'permission'"
            />
            <p class="text-xs text-gray-500">
              {{ formData.type === 'directory' ? '目录类型无需路径' :
                formData.type === 'permission' ? '权限类型无需路径' : '菜单类型需要路径' }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="menu-icon">菜单图标</Label>
            <div class="flex space-x-2">
              <Input
                id="menu-icon"
                v-model="iconString"
                placeholder="例如: Home"
                class="flex-1"
                :disabled="formData.type === 'permission'"
              />
              <div class="flex items-center justify-center w-10 h-10 border rounded">
                <component
                  :is="getMenuIcon(formData.icon)"
                  class="w-5 h-5"
                  v-if="formData.icon && formData.type !== 'permission'"
                />
              </div>
            </div>
            <p class="text-xs text-gray-500">
              {{ formData.type === 'permission' ? '权限类型无需图标' : '选填，支持 Lucide 图标名称' }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="menu-permission">权限标识</Label>
            <Input
              id="menu-permission"
              v-model="permissionString"
              placeholder="例如: user:view"
            />
            <p class="text-xs text-gray-500">用于权限控制，建议格式：模块:操作</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="sort-order">排序值</Label>
            <Input
              id="sort-order"
              v-model.number="formData.sort"
              type="number"
              placeholder="排序值"
              min="0"
            />
          </div>

          <div class="space-y-2">
            <Label for="menu-status">状态</Label>
            <Select v-model="formData.status">
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">取消</Button>
        <Button :disabled="saving" @click="handleSave">
          <div v-if="saving" class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  BarChart3,
  Building,
  Calendar,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  HelpCircle,
  Home,
  List,
  Menu as MenuLucideIcon,
  Package,
  Settings,
  Settings2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Users,
} from 'lucide-vue-next'
import type { Menu, MenuForm } from '~/composables/useMenus'

interface MenuDialogProps {
  open: boolean
  editingMenu?: Menu | null
  parentMenuOptions: Array<{ label: string; value: string }>
  saving?: boolean
}

interface MenuDialogEmits {
  (e: 'update:open', value: boolean): void
  (e: 'save', data: MenuForm): void
}

const props = withDefaults(defineProps<MenuDialogProps>(), {
  editingMenu: null,
  saving: false,
})

const emit = defineEmits<MenuDialogEmits>()

// 双向绑定对话框显示状态
const dialogVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

// 表单数据
const formData = ref<MenuForm>({
  name: '',
  parent_id: '0',
  path: null,
  icon: null,
  sort: 0,
  status: 'active',
  permission: null,
  type: 'menu',
})

// 用于处理 null 和 string 之间的转换的计算属性
const parentIdString = computed({
  get: () => formData.value.parent_id || '0',
  set: (value: string) => {
    formData.value.parent_id = value || '0'
  }
})

const pathString = computed({
  get: () => formData.value.path || '',
  set: (value: string) => {
    formData.value.path = value === '' ? null : value
  }
})

const iconString = computed({
  get: () => formData.value.icon || '',
  set: (value: string) => {
    formData.value.icon = value === '' ? null : value
  }
})

const permissionString = computed({
  get: () => formData.value.permission || '',
  set: (value: string) => {
    formData.value.permission = value === '' ? null : value
  }
})

// 选项数据
const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
]

const typeOptions = [
  { label: '目录', value: 'directory' },
  { label: '菜单', value: 'menu' },
  { label: '权限', value: 'permission' },
]

// 监听编辑菜单变化，更新表单数据
watch(() => props.editingMenu, (menu) => {
  if (menu) {
    Object.assign(formData.value, {
      name: menu.name,
      parent_id: menu.parent_id || '0',
      path: menu.path || null,
      icon: menu.icon || null,
      sort: menu.sort,
      status: menu.status,
      permission: menu.permission || null,
      type: menu.type,
    })
  } else {
    // 重置表单
    Object.assign(formData.value, {
      name: '',
      parent_id: '0',
      path: null,
      icon: null,
      sort: 0,
      status: 'active',
      permission: null,
      type: 'menu',
    })
  }
}, { immediate: true })

// 获取菜单图标
const getMenuIcon = (iconName?: string | null) => {
  if (!iconName) return HelpCircle

  const iconMap: Record<string, any> = {
    Home,
    Users,
    Settings,
    Settings2,
    FileText,
    BarChart3,
    Package,
    DollarSign,
    CreditCard,
    Shield,
    Database,
    Menu: MenuLucideIcon,
    Building,
    ShoppingCart,
    ShoppingBag,
    Calendar,
    List,
    HelpCircle,
  }
  return iconMap[iconName] || HelpCircle
}

// 事件处理
const handleSave = () => {
  if (!formData.value.name.trim()) {
    // 可以在这里添加验证逻辑
    return
  }

  emit('save', { ...formData.value })
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>
