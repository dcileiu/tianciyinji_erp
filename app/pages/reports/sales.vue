<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-foreground mb-2">销售报表</h1>
        <p class="text-muted-foreground">分析销售数据，了解业务趋势和客户表现</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" @click="exportReport">
          <Download class="w-4 h-4 mr-2" />
          导出报表
        </Button>
        <Button @click="refreshData">
          <RefreshCw class="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>
    </div>

    <!-- 筛选器 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">报表筛选</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">日期范围</label>
            <Input
              v-model="dateRange"
              type="date"
              placeholder="选择日期范围"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">客户筛选</label>
            <Select v-model="customerFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择客户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in customerOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-foreground">搜索</label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="搜索订单号、产品..."
                class="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card class="border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-green-600 mb-1">
                ¥{{ formatCurrency(salesStats.totalAmount) }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">总销售额</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="w-4 h-4" />
                <span>+15.2%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white">
              <DollarSign class="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card class="border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-blue-600 mb-1">{{ salesStats.totalOrders }}</div>
              <div class="text-sm text-muted-foreground mb-2">订单数量</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="w-4 h-4" />
                <span>+8.3%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingCart class="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card class="border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-purple-600 mb-1">
                ¥{{ formatCurrency(salesStats.avgOrderAmount) }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">平均订单额</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="w-4 h-4" />
                <span>+12.1%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Calculator class="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card class="border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-orange-600 mb-1">{{ salesStats.activeCustomers }}</div>
              <div class="text-sm text-muted-foreground mb-2">活跃客户</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="w-4 h-4" />
                <span>+6.7%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white">
              <Users class="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 详细销售表格 -->
    <Card class="border">
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle class="text-lg font-semibold">销售明细</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            @click="exportData"
          >
            <Download class="w-4 h-4 mr-2" />
            导出
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div class="space-y-3 w-full">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
          </div>
        </div>
        
        <div v-else-if="filteredSalesData.length === 0" class="text-center py-8">
          <div class="text-muted-foreground mb-2">暂无销售数据</div>
          <Button 
            variant="ghost" 
            size="sm"
            @click="refreshData"
          >
            <RefreshCw class="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>
        
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>客户名称</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead>数量</TableHead>
              <TableHead>单价</TableHead>
              <TableHead>总金额</TableHead>
              <TableHead>订单日期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>

            <TableRow v-for="item in filteredSalesData" :key="item.id">
              <TableCell>
                <div class="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{{ item.customer_name.charAt(0) }}</AvatarFallback>
                  </Avatar>
                  <span class="font-medium">{{ item.customer_name }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div class="font-medium mb-1">{{ item.product_name }}</div>
                  <div class="text-sm text-muted-foreground">数量: {{ item.quantity }}</div>
                </div>
              </TableCell>
              <TableCell>{{ item.quantity }}</TableCell>
              <TableCell>¥{{ formatCurrency(item.unit_price) }}</TableCell>
              <TableCell>
                <span class="font-semibold text-green-600">
                  ¥{{ formatCurrency(item.total_amount) }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ formatDate(item.order_date) }}
                </span>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(item.status)">
                  {{ getStatusText(item.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <Eye class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 趋势图表 -->
    <Card class="border">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">销售趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col items-center justify-center h-80 text-center text-muted-foreground p-4">
          <BarChart3 class="w-16 h-16 mb-4 opacity-50" />
          <p class="text-lg mb-2">销售趋势图表</p>
          <p class="text-sm opacity-75">（图表组件待集成）</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, RefreshCw, Search, DollarSign, ShoppingCart, Calculator, Users, ArrowUp, BarChart3, Eye } from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '销售报表 - ERP 管理系统'
})

// 页面状态
const loading = ref(false)
const dateRange = ref()
const customerFilter = ref('')
const searchQuery = ref('')

// 统计数据
const salesStats = ref({
  totalAmount: 1250000,
  totalOrders: 156,
  avgOrderAmount: 8013,
  activeCustomers: 45
})

// 客户选项
const customerOptions = ref([
  { label: '全部客户', value: '' },
  { label: '苏州华智科技有限公司', value: 'C001' },
  { label: '上海浦东制造有限公司', value: 'C002' },
  { label: '北京智能设备有限公司', value: 'C003' },
  { label: '深圳创新科技有限公司', value: 'C004' }
])

// 销售明细数据
const salesDetails = ref([
  {
    id: '1',
    order_no: 'SO202501001',
    customer_name: '苏州华智科技有限公司',
    product_name: '智能控制器',
    quantity: 10,
    unit_price: 2500,
    total_amount: 25000,
    order_date: '2025-01-15',
    status: 'completed'
  },
  {
    id: '2',
    order_no: 'SO202501002',
    customer_name: '上海浦东制造有限公司',
    product_name: '传感器模块',
    quantity: 50,
    unit_price: 150,
    total_amount: 7500,
    order_date: '2025-01-16',
    status: 'processing'
  },
  {
    id: '3',
    order_no: 'SO202501003',
    customer_name: '北京智能设备有限公司',
    product_name: '工业显示屏',
    quantity: 5,
    unit_price: 8000,
    total_amount: 40000,
    order_date: '2025-01-17',
    status: 'pending'
  },
  {
    id: '4',
    order_no: 'SO202501004',
    customer_name: '深圳创新科技有限公司',
    product_name: '自动化设备',
    quantity: 2,
    unit_price: 50000,
    total_amount: 100000,
    order_date: '2025-01-18',
    status: 'completed'
  }
])

// 计算属性
const filteredSalesData = computed(() => {
  let result = salesDetails.value

  if (searchQuery.value) {
    result = result.filter(item =>
      item.order_no.toLowerCase().includes(searchQuery.value.toLowerCase())
      || item.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || item.customer_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (customerFilter.value) {
    // 根据客户名称筛选（这里简化处理）
    const customerName = customerOptions.value.find(c => c.value === customerFilter.value)?.label
    if (customerName && customerName !== '全部客户') {
      result = result.filter(item => item.customer_name === customerName)
    }
  }

  return result
})

// 方法
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: string) => {
  const variantMap: Record<string, string> = {
    pending: 'secondary',
    processing: 'default',
    completed: 'default',
    cancelled: 'destructive'
  }
  return variantMap[status] || 'secondary'
}

const exportData = () => {
  console.log('导出数据')
  // 这里可以实现导出功能
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    console.log('数据已刷新')
  }, 1000)
}
</script>


