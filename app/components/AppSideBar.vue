<script setup lang="ts">
import type { SidebarProps } from '@/registry/new-york/ui/sidebar'

import {
  ShoppingCart,
  Package,
  Warehouse,
  Factory,
  Calculator,
  Database,
  BarChart3,
  Settings,
  Users,
  FileText,
  Truck,
  Building2,
} from 'lucide-vue-next'
import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/registry/new-york/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})

// ERP系统菜单数据
const data = {
  user: {
    name: '管理员',
    email: 'admin@erp.com',
    avatar: '/avatars/admin.jpg',
  },
  navMain: [
    {
      title: '销售管理',
      url: '/sales',
      icon: ShoppingCart,
      isActive: false,
      items: [
        {
          title: '销售订单',
          url: '/sales/orders',
        },
        {
          title: '客户管理',
          url: '/sales/customers',
        },
        {
          title: '报价管理',
          url: '/sales/quotes',
        },
        {
          title: '销售统计',
          url: '/sales/statistics',
        },
      ],
    },
    {
      title: '采购管理',
      url: '/purchase',
      icon: Package,
      items: [
        {
          title: '采购订单',
          url: '/purchase/orders',
        },
        {
          title: '供应商管理',
          url: '/purchase/suppliers',
        },
        {
          title: '采购申请',
          url: '/purchase/requests',
        },
        {
          title: '采购统计',
          url: '/purchase/statistics',
        },
      ],
    },
    {
      title: '库存管理',
      url: '/inventory',
      icon: Warehouse,
      items: [
        {
          title: '库存查询',
          url: '/inventory/query',
        },
        {
          title: '入库管理',
          url: '/inventory/inbound',
        },
        {
          title: '出库管理',
          url: '/inventory/outbound',
        },
        {
          title: '库存盘点',
          url: '/inventory/stocktaking',
        },
      ],
    },
    {
      title: '生产管理',
      url: '/production',
      icon: Factory,
      items: [
        {
          title: '生产计划',
          url: '/production/planning',
        },
        {
          title: '工单管理',
          url: '/production/workorders',
        },
        {
          title: '质量检验',
          url: '/production/quality',
        },
        {
          title: '设备管理',
          url: '/production/equipment',
        },
      ],
    },
    {
      title: '财务管理',
      url: '/finance',
      icon: Calculator,
      items: [
        {
          title: '应收账款',
          url: '/finance/receivables',
        },
        {
          title: '应付账款',
          url: '/finance/payables',
        },
        {
          title: '费用管理',
          url: '/finance/expenses',
        },
        {
          title: '财务报表',
          url: '/finance/reports',
        },
      ],
    },
    {
      title: '基础数据',
      url: '/master',
      icon: Database,
      items: [
        {
          title: '产品管理',
          url: '/master/products',
        },
        {
          title: '仓库管理',
          url: '/master/warehouses',
        },
        {
          title: '部门管理',
          url: '/master/departments',
        },
        {
          title: '员工管理',
          url: '/master/employees',
        },
      ],
    },
    {
      title: '报表分析',
      url: '/reports',
      icon: BarChart3,
      items: [
        {
          title: '销售报表',
          url: '/reports/sales',
        },
        {
          title: '采购报表',
          url: '/reports/purchase',
        },
        {
          title: '库存报表',
          url: '/reports/inventory',
        },
        {
          title: '财务报表',
          url: '/reports/finance',
        },
      ],
    },
    {
      title: '系统设置',
      url: '/settings',
      icon: Settings,
      items: [
        {
          title: '用户管理',
          url: '/settings/users',
        },
        {
          title: '角色权限',
          url: '/settings/roles',
        },
        {
          title: '系统参数',
          url: '/settings/parameters',
        },
        {
          title: '数据备份',
          url: '/settings/backup',
        },
      ],
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <div class="flex items-center gap-2 px-4 py-2">
        <Building2 class="h-6 w-6" />
        <span class="font-semibold text-lg">ERP 管理系统</span>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
