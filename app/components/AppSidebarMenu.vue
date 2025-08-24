<template>
  <div class="h-full bg-slate-900 text-white flex flex-col">
    <!-- Header -->
    <div class="p-6 border-b border-slate-700">
      <div class="flex items-center justify-between">
        <div v-if="!sidebarCollapsed" class="flex items-center gap-3">
          <svg
            width="35"
            height="40"
            viewBox="0 0 35 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8"
          >
            <path
              d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
              fill="hsl(var(--primary))"
            />
            <path
              d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
              fill="currentColor"
            />
          </svg>
          <div class="flex flex-col">
            <span class="text-lg font-bold text-white">智能ERP</span>
            <small class="text-slate-400">企业管理系统</small>
          </div>
        </div>
        <Button variant="ghost" size="sm" @click="toggleSidebar">
          <ChevronLeft v-if="!sidebarCollapsed" class="h-4 w-4" />
          <ChevronRight v-else class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto p-4 space-y-2">
      <template v-for="(item, index) in items" :key="index">
        <!-- Separator -->
        <div v-if="item.separator" class="my-4 border-t border-slate-700"></div>

        <!-- Menu Group -->
        <div v-else-if="item.items" class="space-y-1">
          <div v-if="!sidebarCollapsed" class="px-3 py-2">
            <span class="text-primary font-bold text-xs uppercase tracking-wider">{{ item.label }}</span>
          </div>
          <div class="space-y-1">
            <template v-for="(subItem, subIndex) in item.items" :key="subIndex">
              <NuxtLink
                v-if="subItem.route"
                :to="subItem.route"
                class="flex items-center px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 rounded-md relative group"
                :class="{ 'text-white bg-slate-700': $route.path === subItem.route }"
              >
                <component :is="getIcon(subItem.icon)" class="mr-3 h-5 w-5" />
                <span v-if="!sidebarCollapsed" class="font-medium">{{ subItem.label }}</span>
                <Badge v-if="subItem.badge && !sidebarCollapsed" class="ml-auto" :variant="'secondary'">{{
                  subItem.badge
                }}</Badge>
                <div
                  v-if="subItem.shortcut && !sidebarCollapsed"
                  class="ml-auto px-2 py-1 text-xs bg-slate-100 text-slate-900 rounded"
                >
                  {{ subItem.shortcut }}
                </div>
                <div
                  v-if="!sidebarCollapsed && $route.path === subItem.route"
                  class="absolute right-2 w-2 h-2 bg-primary rounded-full"
                ></div>
              </NuxtLink>
            </template>
          </div>
        </div>

        <!-- Single Menu Item -->
        <div v-else>
          <NuxtLink
            v-if="item.route"
            :to="item.route"
            class="flex items-center px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 rounded-md relative"
            :class="{ 'text-white bg-slate-700': $route.path === item.route }"
          >
            <component :is="getIcon(item.icon)" class="mr-3 h-5 w-5" />
            <span v-if="!sidebarCollapsed" class="font-medium">{{ item.label }}</span>
            <Badge v-if="item.badge && !sidebarCollapsed" class="ml-auto" :variant="'secondary'">{{
              item.badge
            }}</Badge>
            <div
              v-if="!sidebarCollapsed && $route.path === item.route"
              class="absolute right-2 w-2 h-2 bg-primary rounded-full"
            ></div>
          </NuxtLink>
        </div>
      </template>
    </nav>

    <!-- User Section -->
    <div class="border-t border-slate-700 p-4">
      <div class="flex items-center justify-between">
        <div v-if="!sidebarCollapsed" class="flex items-center gap-3">
          <Avatar class="h-8 w-8">
            <AvatarFallback class="bg-primary text-primary-foreground">
              {{ user?.email?.charAt(0)?.toUpperCase() || 'U' }}
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col flex-1 min-w-0">
            <span class="text-sm font-medium text-white truncate">
              {{ user?.email || '未登录' }}
            </span>
            <small class="text-slate-400">管理员</small>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <Button v-if="!sidebarCollapsed" variant="ghost" size="sm" @click="goToSettings">
            <Settings class="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" class="text-red-400 hover:text-red-300" @click="logout">
            <LogOut class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

// 类型定义
import {
  BarChart3,
  Book,
  Briefcase,
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Database,
  FileCheck,
  FileText,
  Home,
  List,
  LogOut,
  Menu as MenuIcon,
  Package,
  PieChart,
  Receipt,
  RotateCcw,
  Settings,
  Settings as SettingsIcon,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tag as TagIcon,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-vue-next'

interface MenuItem {
  label: string
  icon: string
  route: string
  badge?: string
  shortcut?: string
}

interface MenuGroup {
  label?: string
  separator?: boolean
  items?: MenuItem[]
  icon?: string
  route?: string
  badge?: string
}

// Props
defineProps<{
  sidebarCollapsed: boolean
}>()

// Emits
const emit = defineEmits<{
  toggleSidebar: []
}>()

// 获取用户信息
const user = useSupabaseUser()

// 图标映射函数
const getIcon = (iconClass?: string) => {
  if (!iconClass) return Home
  const iconMap: Record<string, any> = {
    'pi pi-home': Home,
    'pi pi-shopping-cart': ShoppingCart,
    'pi pi-users': Users,
    'pi pi-shopping-bag': ShoppingBag,
    'pi pi-truck': Truck,
    'pi pi-box': Package,
    'pi pi-building': Building,
    'pi pi-refresh': RotateCcw,
    'pi pi-cog': SettingsIcon,
    'pi pi-calendar': Calendar,
    'pi pi-list': List,
    'pi pi-file-edit': FileText,
    'pi pi-credit-card': CreditCard,
    'pi pi-receipt': Receipt,
    'pi pi-tag': TagIcon,
    'pi pi-chart-line': TrendingUp,
    'pi pi-chart-bar': BarChart3,
    'pi pi-chart-pie': PieChart,
    'pi pi-user': Users,
    'pi pi-shield': Shield,
    'pi pi-sitemap': Map,
    'pi pi-bars': MenuIcon,
    'pi pi-briefcase': Briefcase,
    'pi pi-database': Database,
    'pi pi-book': Book,
    'pi pi-file': FileCheck,
  }
  return iconMap[iconClass] || Home
}

// 菜单项配置
const items = ref<MenuGroup[]>([
  {
    separator: true,
  },
  // 仪表盘
  {
    label: '仪表盘',
    icon: 'pi pi-home',
    route: '/dashboard',
  },
  {
    separator: true,
  },
  // 销售管理
  {
    label: '销售管理',
    items: [
      {
        label: '销售订单',
        icon: 'pi pi-shopping-cart',
        route: '/sales/orders',
        badge: '5',
        shortcut: '⌘+S',
      },
      {
        label: '客户管理',
        icon: 'pi pi-users',
        route: '/sales/customers',
      },
    ],
  },
  // 采购管理
  {
    label: '采购管理',
    items: [
      {
        label: '采购订单',
        icon: 'pi pi-shopping-bag',
        route: '/purchase/orders',
      },
      {
        label: '供应商管理',
        icon: 'pi pi-truck',
        route: '/purchase/suppliers',
      },
    ],
  },
  // 库存管理
  {
    label: '库存管理',
    items: [
      {
        label: '库存管理',
        icon: 'pi pi-box',
        route: '/warehouse/inventory',
      },
      {
        label: '仓库管理',
        icon: 'pi pi-building',
        route: '/warehouse/warehouses',
      },
      {
        label: '库存调拨',
        icon: 'pi pi-refresh',
        route: '/warehouse/transfers',
      },
    ],
  },
  // 生产管理
  {
    label: '生产管理',
    items: [
      {
        label: '生产订单',
        icon: 'pi pi-cog',
        route: '/production/orders',
      },
      {
        label: '生产计划',
        icon: 'pi pi-calendar',
        route: '/production/plans',
      },
      {
        label: '物料清单',
        icon: 'pi pi-list',
        route: '/production/bom',
      },
      {
        label: '车间管理',
        icon: 'pi pi-building',
        route: '/production/workshops',
      },
    ],
  },
  // 财务管理
  {
    label: '财务管理',
    items: [
      {
        label: '发票管理',
        icon: 'pi pi-file-edit',
        route: '/finance/invoices',
        badge: '3',
      },
      {
        label: '付款管理',
        icon: 'pi pi-credit-card',
        route: '/finance/payments',
      },
      {
        label: '收款管理',
        icon: 'pi pi-receipt',
        route: '/finance/receipts',
      },
    ],
  },
  // 基础数据
  {
    label: '基础数据',
    items: [
      {
        label: '产品管理',
        icon: 'pi pi-tag',
        route: '/master-data/products',
      },
      {
        label: '客户管理',
        icon: 'pi pi-users',
        route: '/master-data/customers',
      },
      {
        label: '供应商管理',
        icon: 'pi pi-truck',
        route: '/master-data/suppliers',
      },
    ],
  },
  // 报表分析
  {
    label: '报表分析',
    items: [
      {
        label: '销售报表',
        icon: 'pi pi-chart-line',
        route: '/reports/sales',
      },
      {
        label: '库存报表',
        icon: 'pi pi-chart-bar',
        route: '/reports/inventory',
      },
      {
        label: '生产报表',
        icon: 'pi pi-chart-pie',
        route: '/reports/production',
      },
      {
        label: '采购报表',
        icon: 'pi pi-chart-bar',
        route: '/reports/purchase',
      },
    ],
  },
  // 系统设置
  {
    label: '系统设置',
    items: [
      {
        label: '系统配置',
        icon: 'pi pi-cog',
        route: '/system/config',
      },
      {
        label: '用户管理',
        icon: 'pi pi-user',
        route: '/users',
      },
      {
        label: '角色权限',
        icon: 'pi pi-shield',
        route: '/system/roles',
      },
      {
        label: '部门管理',
        icon: 'pi pi-sitemap',
        route: '/system/departments',
      },
      {
        label: '菜单管理',
        icon: 'pi pi-bars',
        route: '/system/menus',
      },
      {
        label: '岗位管理',
        icon: 'pi pi-briefcase',
        route: '/system/positions',
      },
      {
        label: '资源管理',
        icon: 'pi pi-database',
        route: '/system/resources',
      },
      {
        label: '数据字典',
        icon: 'pi pi-book',
        route: '/system/dictionaries',
      },
      {
        label: '系统日志',
        icon: 'pi pi-file',
        route: '/system/logs',
      },
    ],
  },
  {
    separator: true,
  },
])

// 方法
const toggleSidebar = () => {
  emit('toggleSidebar')
}

const goToSettings = () => {
  navigateTo('/system/config')
}

const logout = async () => {
  const { auth } = useSupabaseClient()
  await auth.signOut()
  await navigateTo('/login')
}
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
