<template>
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12">
            <input
              type="checkbox"
              class="rounded"
              :checked="selectAll"
              @change="toggleSelectAll"
            />
          </TableHead>
          <TableHead>菜单名称</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>路径</TableHead>
          <TableHead>图标</TableHead>
          <TableHead>权限标识</TableHead>
          <TableHead>排序</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead class="w-40">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-for="menu in menus" :key="menu.id">
          <TableRow>
            <TableCell>
              <input
                type="checkbox"
                class="rounded"
                :checked="selectedIds.includes(menu.id)"
                @change="(e) => handleSelect(menu.id, (e.target as HTMLInputElement).checked)"
              />
            </TableCell>
            <TableCell>
              <div class="flex items-center space-x-2">
                <!-- 展开/收起按钮 -->
                <Button
                  v-if="menu.children && menu.children.length > 0"
                  variant="ghost"
                  size="sm"
                  class="w-6 h-6 p-0"
                  @click="toggleExpand(menu.id)"
                >
                  <ChevronDown
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-180': !expandedIds.includes(menu.id) }"
                  />
                </Button>
                <div v-else class="w-6"></div>

                <component
                  :is="getMenuIcon(menu.icon)"
                  class="w-4 h-4 text-blue-600"
                  v-if="menu.icon"
                />
                <span class="font-medium">{{ menu.name }}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getTypeVariant(menu.type) as any">
                {{ getTypeLabel(menu.type) }}
              </Badge>
            </TableCell>
            <TableCell>
              <code
                v-if="menu.path"
                class="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm rounded"
              >
                {{ menu.path }}
              </code>
              <span v-else class="text-gray-500">-</span>
            </TableCell>
            <TableCell>
              <div class="flex items-center space-x-2" v-if="menu.icon">
                <component :is="getMenuIcon(menu.icon)" class="w-4 h-4" />
                <code class="text-sm text-gray-500">{{ menu.icon }}</code>
              </div>
              <span v-else class="text-gray-500">-</span>
            </TableCell>
            <TableCell>
              <code v-if="menu.permission" class="text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                {{ menu.permission }}
              </code>
              <span v-else class="text-gray-500">-</span>
            </TableCell>
            <TableCell>
              <span>{{ menu.sort }}</span>
            </TableCell>
            <TableCell>
              <Badge
                :variant="menu.status === 'active' ? 'default' : 'secondary'"
                class="cursor-pointer"
                @click="$emit('toggle-status', menu)"
              >
                {{ menu.status === "active" ? "启用" : "禁用" }}
              </Badge>
            </TableCell>
            <TableCell>
              <span class="text-sm text-gray-500">
                {{ formatDate(menu.created_at || '') }}
              </span>
            </TableCell>
            <TableCell>
              <div class="flex items-center space-x-1">
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
            </TableCell>
          </TableRow>

          <!-- 子菜单 -->
          <template v-if="menu.children && menu.children.length > 0 && expandedIds.includes(menu.id)">
            <TableRow
              v-for="child in menu.children"
              :key="child.id"
              class="bg-gray-50 dark:bg-gray-900/50"
            >
              <TableCell>
                <input
                  type="checkbox"
                  class="rounded"
                  :checked="selectedIds.includes(child.id)"
                  @change="(e) => handleSelect(child.id, (e.target as HTMLInputElement).checked)"
                />
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2 pl-6">
                  <component
                    :is="getMenuIcon(child.icon)"
                    class="w-4 h-4 text-blue-600"
                    v-if="child.icon"
                  />
                  <span class="font-medium">{{ child.name }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getTypeVariant(child.type) as any">
                  {{ getTypeLabel(child.type) }}
                </Badge>
              </TableCell>
              <TableCell>
                <code
                  v-if="child.path"
                  class="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm rounded"
                >
                  {{ child.path }}
                </code>
                <span v-else class="text-gray-500">-</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2" v-if="child.icon">
                  <component :is="getMenuIcon(child.icon)" class="w-4 h-4" />
                  <code class="text-sm text-gray-500">{{ child.icon }}</code>
                </div>
                <span v-else class="text-gray-500">-</span>
              </TableCell>
              <TableCell>
                <code v-if="child.permission" class="text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  {{ child.permission }}
                </code>
                <span v-else class="text-gray-500">-</span>
              </TableCell>
              <TableCell>
                <span>{{ child.sort }}</span>
              </TableCell>
              <TableCell>
                <Badge
                  :variant="child.status === 'active' ? 'default' : 'secondary'"
                  class="cursor-pointer"
                  @click="$emit('toggle-status', child)"
                >
                  {{ child.status === "active" ? "启用" : "禁用" }}
                </Badge>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-500">
                  {{ formatDate(child.created_at || '') }}
                </span>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="添加子菜单"
                    @click="$emit('add-child', child)"
                    v-if="child.type !== 'permission'"
                  >
                    <Plus class="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="编辑"
                    @click="$emit('edit', child)"
                  >
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="删除"
                    @click="$emit('delete', child)"
                  >
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </template>
      </TableBody>
    </Table>

    <!-- 批量操作 -->
    <div v-if="selectedIds.length > 0" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
import {
  BarChart3,
  Building,
  Calendar,
  ChevronDown,
  CreditCard,
  Database,
  DollarSign,
  Edit,
  FileText,
  HelpCircle,
  Home,
  List,
  Menu as MenuLucideIcon,
  Package,
  Plus,
  Settings,
  Settings2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Users,
} from 'lucide-vue-next'
import type { Menu } from '~/composables/useMenus'

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

// 初始化时默认展开所有父菜单
onMounted(() => {
  expandedIds.value = props.menus
    .filter(menu => menu.children && menu.children.length > 0)
    .map(menu => menu.id)
})

// 方法
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getTypeLabel = (type: string) => {
  const typeMap = {
    directory: '目录',
    menu: '菜单',
    permission: '权限',
  }
  return typeMap[type as keyof typeof typeMap] || type
}

const getTypeVariant = (type: string) => {
  const variantMap = {
    directory: 'secondary',
    menu: 'default',
    permission: 'outline',
  }
  return variantMap[type as keyof typeof variantMap] || 'default'
}

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
