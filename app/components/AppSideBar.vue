<template>
  <Sidebar v-bind="$props" variant="inset">
    <!-- 显示骨架屏当数据加载中 -->
    <div v-if="isLoading" class="animate-pulse">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div class="flex h-12 items-center gap-2 p-2">
              <Skeleton class="h-8 w-8 rounded-lg" />
              <div class="flex-1 space-y-1">
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-3 w-16" />
              </div>
              <Skeleton class="h-4 w-4" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <!-- Business Modules Section Skeleton -->
        <SidebarGroup>
          <SidebarGroupLabel>
            <Skeleton class="h-3 w-16" />
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="n in 8" :key="`menu-skeleton-${n}`" class="p-0">
              <div class="flex h-10 items-center gap-2 p-2">
                <Skeleton class="h-4 w-4" />
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-4 w-4 ml-auto" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <!-- Projects Section Skeleton -->
        <SidebarGroup class="mt-4">
          <SidebarGroupLabel>
            <Skeleton class="h-3 w-12" />
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="n in 3" :key="`project-skeleton-${n}`" class="p-0">
              <div class="flex h-10 items-center gap-2 p-2">
                <Skeleton class="h-4 w-4" />
                <Skeleton class="h-4 w-16" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div class="flex h-12 items-center gap-2 p-2">
              <Skeleton class="h-8 w-8 rounded-full" />
              <div class="flex-1 space-y-1">
                <Skeleton class="h-4 w-16" />
                <Skeleton class="h-3 w-24" />
              </div>
              <Skeleton class="h-4 w-4" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </div>

    <!-- 实际内容 -->
    <template v-else>
    <SidebarHeader>
        <TeamSwitcher :teams="currentData.teams" />
    </SidebarHeader>
    <SidebarContent>
        <NavMain :items="currentData.navMain" />
        <NavProjects :projects="currentData.projects" />
    </SidebarContent>
    <SidebarFooter>
        <NavUser :user="currentData.user" />
    </SidebarFooter>
    </template>

    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import {
  AudioWaveform,
  BarChart3,
  Command,
  CreditCard,
  Database,
  GalleryVerticalEnd,
  Home,
  Map,
  Package,
  PieChart,
  Settings2,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-vue-next'

// shadcn-nuxt 会自动导入 Sidebar 相关组件
interface SidebarProps {
  collapsible?: 'icon' | 'offcanvas' | 'none'
}

withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

// 加载状态
const isLoading = ref(true)
const { user } = useAuth()

// 基础数据配置
const baseData = {
  user: {
    name: 'User',
    email: 'user@example.com',
    avatar: '',
  },
  teams: [
    {
      name: '智能ERP',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: '财务系统',
      logo: AudioWaveform,
      plan: 'Professional',
    },
    {
      name: '生产管理',
      logo: Command,
      plan: 'Standard',
    },
  ],
  navMain: [
    {
      title: '仪表盘',
      url: '/dashboard',
      icon: Home,
      isActive: true,
      items: [
        {
          title: '概览',
          url: '/dashboard',
        },
        {
          title: '统计',
          url: '/dashboard/stats',
        },
      ],
    },
    {
      title: '销售管理',
      url: '#',
      icon: ShoppingCart,
      items: [
        {
          title: '销售订单',
          url: '/sales/orders',
        },
        {
          title: '客户管理',
          url: '/sales/customers',
        },
      ],
    },
    {
      title: '采购管理',
      url: '#',
      icon: ShoppingBag,
      items: [
        {
          title: '采购订单',
          url: '/purchase/orders',
        },
        {
          title: '供应商管理',
          url: '/purchase/suppliers',
        },
      ],
    },
    {
      title: '库存管理',
      url: '#',
      icon: Package,
      items: [
        {
          title: '库存管理',
          url: '/warehouse/inventory',
        },
        {
          title: '仓库管理',
          url: '/warehouse/warehouses',
        },
        {
          title: '库存调拨',
          url: '/warehouse/transfers',
        },
      ],
    },
    {
      title: '生产管理',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: '生产订单',
          url: '/production/orders',
        },
        {
          title: '生产计划',
          url: '/production/plans',
        },
        {
          title: '物料清单',
          url: '/production/bom',
        },
        {
          title: '车间管理',
          url: '/production/workshops',
        },
      ],
    },
    {
      title: '财务管理',
      url: '#',
      icon: CreditCard,
      items: [
        {
          title: '发票管理',
          url: '/finance/invoices',
        },
        {
          title: '付款管理',
          url: '/finance/payments',
        },
        {
          title: '收款管理',
          url: '/finance/receipts',
        },
      ],
    },
    {
      title: '基础数据',
      url: '#',
      icon: Database,
      items: [
        {
          title: '产品管理',
          url: '/master-data/products',
        },
        {
          title: '客户管理',
          url: '/master-data/customers',
        },
        {
          title: '供应商管理',
          url: '/master-data/suppliers',
        },
      ],
    },
    {
      title: '系统设置',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: '系统配置',
          url: '/system/config',
        },
        {
          title: '用户管理',
          url: '/system/users',
        },
        {
          title: '角色管理',
          url: '/system/roles',
        },
        {
          title: '部门管理',
          url: '/system/departments',
        },
        {
          title: '菜单管理',
          url: '/system/menus',
        },
      ],
    },
  ],
  projects: [
    {
      name: '报表分析',
      url: '/reports',
      icon: BarChart3,
    },
    {
      name: '数据统计',
      url: '/analytics',
      icon: PieChart,
    },
    {
      name: '系统监控',
      url: '/monitoring',
      icon: Map,
    },
  ],
}

// 当前使用的数据
const currentData = ref(baseData)

// 初始化数据
const initData = async () => {
  try {
    // 模拟数据加载延迟 - 让用户能看到骨架屏效果
    await new Promise(resolve => setTimeout(resolve, 500))

    // 根据用户信息更新数据
    if (user.value) {
      const userData = { ...baseData }
      userData.user = {
        name: (user.value.user_metadata?.name as string) || user.value.email?.split('@')[0] || 'User',
        email: user.value.email || 'user@example.com',
        avatar: user.value.user_metadata?.avatar_url || '',
      }
      currentData.value = userData
    }
  } catch (error) {
    console.warn('侧边栏数据初始化失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 监听用户状态变化
watch(user, (newUser) => {
  if (newUser) {
    initData()
  }
}, { immediate: true })

// 页面加载时初始化
onMounted(() => {
  // 如果用户已存在，立即初始化
  if (user.value) {
    initData()
  } else {
    // 否则等待一段时间后停止加载
    setTimeout(() => {
      if (!user.value) {
        isLoading.value = false
      }
    }, 2000)
  }
})
</script>
