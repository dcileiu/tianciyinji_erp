<template>
  <Sidebar v-bind="$props" variant="inset">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  BarChart3,
  CreditCard,
  Database,
  Home,
  Package,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-vue-next'
import NavMain from '@/components/NavMain.vue'
import NavProjects from '@/components/NavProjects.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

// 获取用户信息
const user = useSupabaseUser()

// 数据配置
const data = {
  user: {
    name: user.value?.email?.split('@')[0] || 'User',
    email: user.value?.email || 'user@example.com',
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
          title: '角色权限',
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
</script>
