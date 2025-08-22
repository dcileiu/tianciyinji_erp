<template>
  <div class="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">仪表板</h1>
        <p class="text-muted-foreground mt-1">欢迎回来，这里是您的业务概览</p>
      </div>
      <div class="flex items-center space-x-4">
        <Button @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新数据
        </Button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">总销售额</p>
              <p class="text-2xl font-bold">¥{{ formatCurrency(stats.totalSales) }}</p>
              <p class="text-xs text-green-600 mt-1">+12.5% 较上月</p>
            </div>
            <div class="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp class="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">订单数量</p>
              <p class="text-2xl font-bold">{{ stats.totalOrders }}</p>
              <p class="text-xs text-green-600 mt-1">+8.2% 较上月</p>
            </div>
            <div class="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart class="h-4 w-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">客户数量</p>
              <p class="text-2xl font-bold">{{ stats.totalCustomers }}</p>
              <p class="text-xs text-blue-600 mt-1">+15.3% 较上月</p>
            </div>
            <div class="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users class="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">库存价值</p>
              <p class="text-2xl font-bold">¥{{ formatCurrency(stats.inventoryValue) }}</p>
              <p class="text-xs text-red-600 mt-1">-2.1% 较上月</p>
            </div>
            <div class="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package class="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </CardContent>
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
  CheckSquare,
  Users,
  RefreshCw
} from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardTitle from '~/components/ui/CardTitle.vue'
import Button from '~/components/ui/Button.vue'

// 用户信息
const user = useSupabaseUser()

// 统计数据
const stats = reactive({
  totalSales: 1250000,
  totalOrders: 1234,
  totalCustomers: 567,
  inventoryValue: 890000
})

// 热销产品数据
const topProducts = reactive([
  { id: 1, name: '产品A', sales: 156, price: 299, growth: 12.5 },
  { id: 2, name: '产品B', sales: 134, price: 199, growth: 8.3 },
  { id: 3, name: '产品C', sales: 98, price: 399, growth: 15.7 }
])

// 格式化货币
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN').format(amount)
}

// 刷新数据
const refreshData = () => {
  // 刷新逻辑
}

// 格式化日期
const formatDate = (date: Date) => {
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