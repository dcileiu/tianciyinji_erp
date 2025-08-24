<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">采购报表</h1>
        <p class="text-muted-foreground">采购数据分析和统计报表</p>
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
    <Card>
      <CardContent class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-2">开始日期</label>
            <Input v-model="dateRange.start" type="date" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">结束日期</label>
            <Input v-model="dateRange.end" type="date" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">供应商筛选</label>
            <Select v-model="supplierFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="全部供应商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部供应商</SelectItem>
                <SelectItem v-for="supplier in supplierOptions" :key="supplier.value" :value="supplier.value">
                  {{ supplier.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex gap-2">
            <Button class="flex-1" @click="applyFilters">
              <Search class="w-4 h-4 mr-2" />
              查询
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 采购概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">总采购订单</p>
              <p class="text-2xl font-bold text-foreground">{{ purchaseStats.totalOrders }}</p>
              <p class="text-xs text-green-600 flex items-center mt-1">
                <TrendingDown class="w-3 h-3 mr-1" />
                较上月增长 {{ purchaseStats.orderGrowth }}%
              </p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <ShoppingBag class="text-blue-600 w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">总采购金额</p>
              <p class="text-2xl font-bold text-foreground">¥{{ purchaseStats.totalAmount.toLocaleString() }}</p>
              <p class="text-xs text-green-600 flex items-center mt-1">
                <TrendingDown class="w-3 h-3 mr-1" />
                较上月增长 {{ purchaseStats.amountGrowth }}%
              </p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <Calculator class="text-green-600 w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">活跃供应商</p>
              <p class="text-2xl font-bold text-foreground">{{ purchaseStats.activeSuppliers }}</p>
              <p class="text-xs text-blue-600 flex items-center mt-1">
                <TrendingDown class="w-3 h-3 mr-1" />
                较上月增长 {{ purchaseStats.supplierGrowth }}%
              </p>
            </div>
            <div class="bg-purple-100 p-3 rounded-full">
              <Users class="text-purple-600 w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">平均订单金额</p>
              <p class="text-2xl font-bold text-foreground">¥{{ averageOrderAmount.toLocaleString() }}</p>
              <p class="text-xs text-orange-600 flex items-center mt-1">
                <TrendingDown class="w-3 h-3 mr-1" />
                较上月变化 {{ purchaseStats.avgGrowth }}%
              </p>
            </div>
            <div class="bg-orange-100 p-3 rounded-full">
              <LineChart class="text-orange-600 w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>采购趋势</CardTitle>
            <LineChart class="text-muted-foreground w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="h-64 flex items-center justify-center bg-muted rounded-lg">
            <div class="text-center">
              <LineChart class="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
              <p class="text-muted-foreground">采购趋势图表</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>采购分布</CardTitle>
            <PieChart class="text-muted-foreground w-5 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="h-64 flex items-center justify-center bg-muted rounded-lg">
            <div class="text-center">
              <PieChart class="w-12 h-12 text-muted-foreground mb-2 mx-auto" />
              <p class="text-muted-foreground">采购分布图表</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 详细数据表格 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>采购明细</CardTitle>
          <Button variant="outline" size="sm" @click="exportReport">
            <FileSpreadsheet class="w-4 h-4 mr-2" />
            批量导出
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>采购单号</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>产品名称</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>总金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>采购日期</TableHead>
                <TableHead>到货日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="loading">
                <TableRow v-for="i in 5" :key="i">
                  <TableCell v-for="j in 10" :key="j">
                    <Skeleton class="h-4 w-full" />
                  </TableCell>
                </TableRow>
              </template>
              <template v-else-if="purchaseDetails.length === 0">
                <TableRow>
                  <TableCell colspan="10" class="text-center py-8">
                    <div class="flex flex-col items-center">
                      <FileSpreadsheet class="w-12 h-12 text-muted-foreground mb-2" />
                      <p class="text-muted-foreground">暂无采购数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
              <TableRow v-for="item in purchaseDetails" :key="item.id">
                <TableCell>
                  <code class="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {{ item.order_no }}
                  </code>
                </TableCell>
                <TableCell>
                  <div class="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback>{{ item.supplier_name.charAt(0) }}</AvatarFallback>
                    </Avatar>
                    <span class="font-medium">{{ item.supplier_name }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span class="font-medium">{{ item.product_name }}</span>
                </TableCell>
                <TableCell>
                  <span class="font-medium">{{ item.quantity.toLocaleString() }}</span>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground"> ¥{{ item.unit_price.toLocaleString() }} </span>
                </TableCell>
                <TableCell>
                  <span class="font-bold text-red-600"> ¥{{ item.total_amount.toLocaleString() }} </span>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(item.status)">
                    {{ getStatusDisplayName(item.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground">
                    {{ formatDate(item.order_date) }}
                  </span>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground">
                    {{ formatDate(item.delivery_date) }}
                  </span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" @click="viewDetail(item)">
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="printOrder(item)">
                      <Printer class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 汇总统计 -->
    <Card class="mt-6">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">汇总统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ purchaseDetails.length }}</div>
            <div class="text-sm text-muted-foreground mt-1">总订单数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">¥{{ totalAmount.toLocaleString() }}</div>
            <div class="text-sm text-muted-foreground mt-1">总采购金额</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">¥{{ avgOrderAmount.toLocaleString() }}</div>
            <div class="text-sm text-muted-foreground mt-1">平均订单金额</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import { computed, onMounted, ref } from 'vue'

import {
  Calculator,
  Download,
  Eye,
  FileSpreadsheet,
  LineChart,
  PieChart,
  Printer,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingDown,
  Users,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '采购报表 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)

// 筛选条件
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date(),
})
const supplierFilter = ref('')

// 选项数据
const supplierOptions = ref([
  { label: 'ABC供应商', value: 'supplier-1' },
  { label: 'XYZ材料厂', value: 'supplier-2' },
  { label: '优质零件公司', value: 'supplier-3' },
])

// 统计数据
const purchaseStats = ref({
  totalAmount: 2850000,
  totalOrders: 156,
  avgOrderAmount: 18269,
  activeSuppliers: 23,
})

// 模拟数据
const purchaseDetails = ref([
  {
    id: '1',
    order_no: 'PO-2024-001',
    supplier_name: 'ABC供应商',
    product_name: '钢材料',
    quantity: 1000,
    unit_price: 25,
    total_amount: 25000,
    status: 'completed',
    order_date: new Date('2024-01-15'),
    delivery_date: new Date('2024-01-20'),
  },
  {
    id: '2',
    order_no: 'PO-2024-002',
    supplier_name: 'XYZ材料厂',
    product_name: '电子元件',
    quantity: 500,
    unit_price: 120,
    total_amount: 60000,
    status: 'pending',
    order_date: new Date('2024-01-18'),
    delivery_date: new Date('2024-01-25'),
  },
])

// 计算属性
const totalAmount = computed(() => {
  return purchaseDetails.value.reduce((sum, item) => sum + item.total_amount, 0)
})

const avgOrderAmount = computed(() => {
  return purchaseDetails.value.length > 0 ? Math.round(totalAmount.value / purchaseDetails.value.length) : 0
})

// 映射对象
const statusMap: Record<string, string> = {
  pending: '待处理',
  confirmed: '已确认',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消',
}

const statusSeverityMap: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  completed: 'success',
  cancelled: 'danger',
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'secondary'
    case 'confirmed':
      return 'default'
    case 'shipped':
      return 'default'
    case 'delivered':
      return 'default'
    case 'cancelled':
      return 'destructive'
    default:
      return 'default'
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const applyFilters = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const exportReport = () => {
  console.log('导出采购报表')
}

const refreshData = () => {
  loading.value = true
  // 模拟数据刷新
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const viewDetail = (order: any) => {
  console.log('查看详情:', order.order_no)
}

const printOrder = (order: any) => {
  console.log('打印订单:', order.order_no)
}

// 初始化
onMounted(() => {
  // 加载数据
})
</script>
