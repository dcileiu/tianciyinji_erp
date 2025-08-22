<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">销售报表</h1>
        <p class="text-muted-foreground">销售数据分析和统计报表</p>
      </div>
      <div class="flex gap-2">
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

    <!-- 时间筛选 -->
    <Card class="mb-6">
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">开始日期</label>
            <Input 
              v-model="dateRange.start" 
              type="date" 
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">结束日期</label>
            <Input 
              v-model="dateRange.end" 
              type="date" 
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">客户筛选</label>
            <Select v-model="customerFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部客户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部客户</SelectItem>
                <SelectItem v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-end">
            <Button @click="applyFilters" class="w-full">
              <Search class="w-4 h-4 mr-2" />
              查询
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 销售概览 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">总销售额</p>
              <p class="text-2xl font-bold">¥{{ salesStats.totalAmount.toLocaleString() }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">订单数量</p>
              <p class="text-2xl font-bold">{{ salesStats.totalOrders }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">平均订单额</p>
              <p class="text-2xl font-bold">¥{{ salesStats.avgOrderAmount.toLocaleString() }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calculator class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">活跃客户</p>
              <p class="text-2xl font-bold">{{ salesStats.activeCustomers }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 销售趋势图 -->
    <Card class="mb-6">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>销售趋势</CardTitle>
          <div class="flex items-center gap-2">
            <BarChart3 class="w-5 h-5 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">图表展示</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
          <p class="text-muted-foreground">销售趋势图表占位符</p>
        </div>
      </CardContent>
    </Card>

    <!-- 销售明细 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>销售明细</CardTitle>
          <Button @click="exportReport" variant="outline">
            <Download class="w-4 h-4 mr-2" />
            导出报表
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>订单日期</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>毛利率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="order in salesDetails" :key="order.id">
                <TableCell class="font-medium">
                  {{ order.order_no }}
                </TableCell>
                <TableCell>
                  {{ order.customer_name }}
                </TableCell>
                <TableCell>
                  {{ formatDate(order.order_date) }}
                </TableCell>
                <TableCell>
                  ¥{{ order.final_amount.toLocaleString() }}
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(order.status)">
                    {{ getStatusName(order.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span :class="{
                    'text-green-600': order.profit_margin > 0.3,
                    'text-yellow-600': order.profit_margin > 0.2,
                    'text-red-600': order.profit_margin <= 0.2
                  }">
                    {{ (order.profit_margin * 100).toFixed(1) }}%
                  </span>
                </TableCell>
              </TableRow>
              <TableRow v-if="salesDetails.length === 0">
                <TableCell colspan="6" class="text-center text-muted-foreground">
                  暂无销售数据
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 客户销售排行 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>客户销售排行</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(customer, index) in topCustomers" :key="customer.id" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                     :class="{
                       'bg-yellow-500': index === 0,
                       'bg-gray-400': index === 1, 
                       'bg-orange-500': index === 2,
                       'bg-blue-500': index > 2
                     }">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium">{{ customer.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ customer.orders }}个订单</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">¥{{ customer.amount.toLocaleString() }}</p>
                <p class="text-sm text-muted-foreground">{{ customer.percentage }}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>产品销售排行</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(product, index) in topProducts" :key="product.id" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                     :class="{
                       'bg-yellow-500': index === 0,
                       'bg-gray-400': index === 1,
                       'bg-orange-500': index === 2,
                       'bg-green-500': index > 2
                     }">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium">{{ product.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ product.quantity }}件</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">¥{{ product.amount.toLocaleString() }}</p>
                <p class="text-sm text-muted-foreground">{{ product.percentage }}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Download, RefreshCw, Search, TrendingUp, ShoppingCart, 
  Calculator, Users, BarChart3 
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '销售报表 - ERP 管理系统'
})

// 数据管理
const { getSalesReport, getSalesDetails, getTopCustomers, getTopProducts } = useSalesReports()
const { customers } = useCustomers()

// 响应式数据
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})
const customerFilter = ref('')

// 报表数据
const salesStats = ref({
  totalAmount: 1250000,
  totalOrders: 156,
  avgOrderAmount: 8013,
  activeCustomers: 45
})

const salesDetails = ref([
  {
    id: '1',
    order_no: 'SO202501001',
    customer_name: '苏州华智科技有限公司',
    order_date: '2025-01-20',
    final_amount: 150000,
    status: 'delivered',
    profit_margin: 0.35
  },
  {
    id: '2',
    order_no: 'SO202501002',
    customer_name: '上海浦东制造有限公司',
    order_date: '2025-01-19',
    final_amount: 88000,
    status: 'shipped',
    profit_margin: 0.28
  },
  {
    id: '3',
    order_no: 'SO202501003',
    customer_name: '北京智能设备有限公司',
    order_date: '2025-01-18',
    final_amount: 125000,
    status: 'confirmed',
    profit_margin: 0.42
  }
])

const topCustomers = ref([
  { id: '1', name: '苏州华智科技有限公司', amount: 350000, orders: 8, percentage: 28 },
  { id: '2', name: '上海浦东制造有限公司', amount: 280000, orders: 6, percentage: 22 },
  { id: '3', name: '北京智能设备有限公司', amount: 220000, orders: 5, percentage: 18 },
  { id: '4', name: '深圳创新科技有限公司', amount: 180000, orders: 4, percentage: 14 },
  { id: '5', name: '广州自动化设备有限公司', amount: 150000, orders: 3, percentage: 12 }
])

const topProducts = ref([
  { id: '1', name: '智能控制器 Model-A', amount: 450000, quantity: 120, percentage: 36 },
  { id: '2', name: '传感器套装 Pro', amount: 280000, quantity: 200, percentage: 22 },
  { id: '3', name: '工业显示屏 15寸', amount: 220000, quantity: 80, percentage: 18 },
  { id: '4', name: '数据采集模块', amount: 180000, quantity: 150, percentage: 14 },
  { id: '5', name: '通讯接口卡', amount: 120000, quantity: 300, percentage: 10 }
])

// 方法
const applyFilters = async () => {
  // TODO: 根据筛选条件重新加载数据
  console.log('应用筛选条件:', {
    dateRange: dateRange.value,
    customer: customerFilter.value
  })
}

const refreshData = async () => {
  // TODO: 刷新报表数据
  console.log('刷新报表数据')
}

const exportReport = () => {
  // TODO: 导出报表
  console.log('导出销售报表')
}

const getStatusName = (status: string) => {
  const statuses = {
    draft: '草稿',
    confirmed: '已确认',
    shipped: '已发货',
    delivered: '已交付',
    cancelled: '已取消'
  }
  return statuses[status as keyof typeof statuses] || status
}

const getStatusVariant = (status: string) => {
  const variants = {
    draft: 'secondary',
    confirmed: 'default',
    shipped: 'outline',
    delivered: 'default',
    cancelled: 'destructive'
  }
  return variants[status as keyof typeof variants] || 'secondary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 初始化数据
onMounted(async () => {
  await applyFilters()
})
</script>