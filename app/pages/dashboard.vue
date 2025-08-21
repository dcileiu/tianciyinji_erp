<template>
  <div class="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
    <!-- 页面标题 -->
      <div class="flex items-center justify-between">
        <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          仪表盘
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          欢迎回来，{{ user?.email }}
          </p>
        </div>
        <div class="text-right">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ formatDate(new Date()) }}
          </p>
        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
            最后登录: {{ formatDate(new Date()) }}
          </p>
        </div>
      </div>

    <!-- 核心指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- 今日销售订单 -->
      <Card class="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              今日销售订单
            </p>
            <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {{ stats.todayOrders }}
            </p>
            <p class="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
              +12% 比昨日
            </p>
          </div>
          <div class="p-3 bg-blue-500/10 rounded-xl">
            <ShoppingCart class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      <!-- 库存预警 -->
      <Card class="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-amber-200 dark:border-amber-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
              库存预警
            </p>
            <p class="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {{ stats.stockAlerts }}
            </p>
            <p class="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
              需要关注
            </p>
          </div>
          <div class="p-3 bg-amber-500/10 rounded-xl">
            <AlertTriangle class="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </Card>

      <!-- 待处理采购 -->
      <Card class="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              待处理采购
            </p>
            <p class="text-2xl font-bold text-green-900 dark:text-green-100">
              {{ stats.pendingPurchases }}
            </p>
            <p class="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
              待审批
            </p>
          </div>
          <div class="p-3 bg-green-500/10 rounded-xl">
            <Package class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card>

      <!-- 月度营收 -->
      <Card class="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200 dark:border-purple-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
              月度营收
            </p>
            <p class="text-2xl font-bold text-purple-900 dark:text-purple-100">
              ¥{{ stats.monthlyRevenue.toLocaleString() }}
            </p>
            <p class="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
              +8.5% 环比
            </p>
          </div>
          <div class="p-3 bg-purple-500/10 rounded-xl">
            <TrendingUp class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </Card>
    </div>

      <!-- 快速操作 -->
      <Card class="p-6">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Zap class="w-5 h-5 mr-2 text-blue-600" />
          快速操作
        </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink 
          to="/sales/orders" 
          class="group flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
        >
          <Plus class="w-5 h-5 text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400 mr-3" />
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">新建销售订单</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">创建新的销售订单</p>
          </div>
        </NuxtLink>

        <NuxtLink 
          to="/purchase/orders" 
          class="group flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
        >
          <ShoppingBag class="w-5 h-5 text-gray-600 group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-400 mr-3" />
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">新建采购订单</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">创建新的采购订单</p>
          </div>
        </NuxtLink>

        <NuxtLink 
          to="/master-data/products" 
          class="group flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
        >
          <Box class="w-5 h-5 text-gray-600 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400 mr-3" />
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">产品管理</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">管理产品信息</p>
          </div>
        </NuxtLink>

        <NuxtLink 
          to="/warehouse/inventory" 
          class="group flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
        >
          <BarChart3 class="w-5 h-5 text-gray-600 group-hover:text-amber-600 dark:text-gray-400 dark:group-hover:text-amber-400 mr-3" />
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">库存查询</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">查看库存状态</p>
          </div>
        </NuxtLink>
        </div>
      </Card>

    <!-- 最近活动和待办事项 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近活动 -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Clock class="w-5 h-5 mr-2 text-blue-600" />
          最近活动
        </h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">新增销售订单 #SO202501001</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">2分钟前</p>
            </div>
              </div>
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">采购订单 #PO202501001 已审批</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">15分钟前</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">库存预警：产品A库存不足</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">1小时前</p>
    </div>
          </div>
        </div>
      </Card>

      <!-- 待办事项 -->
      <Card class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CheckSquare class="w-5 h-5 mr-2 text-orange-600" />
          待办事项
        </h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">审批采购订单 #PO202501002</p>
              <p class="text-xs text-red-600 dark:text-red-400">高优先级</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">补充库存：产品B、产品C</p>
              <p class="text-xs text-yellow-600 dark:text-yellow-400">中优先级</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">更新客户资料</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">低优先级</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import {
  ShoppingCart,
  AlertTriangle,
  ShoppingBag,
  Package,
  TrendingUp,
  Zap,
  Plus,
  Box,
  BarChart3,
  Clock,
  CheckSquare
} from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'

// 用户信息
const user = useSupabaseUser()

// 统计数据
const stats = reactive({
  todayOrders: 24,
  stockAlerts: 8,
  productionOrders: 12,
  pendingApprovals: 6,
  pendingPurchases: 10,
  monthlyRevenue: 1200000
})

// 格式化日期
const formatDate = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  }).format(date)
}

// 页面标题
useHead({
  title: '首页仪表盘 - ERP 管理系统'
})
</script> 