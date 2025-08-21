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
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">开始日期</label>
            <Input v-model="dateRange.start" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">结束日期</label>
            <Input v-model="dateRange.end" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">供应商筛选</label>
            <select v-model="supplierFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部供应商</option>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
          </div>
          <div class="flex gap-2">
            <Button @click="applyFilters" class="flex-1">
              <Search class="w-4 h-4 mr-2" />
              查询
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 采购概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">总采购额</p>
              <p class="text-2xl font-bold text-red-600">¥{{ purchaseStats.totalAmount.toLocaleString() }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown class="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-red-600">↗ +8.7%</span>
            <span class="text-xs text-muted-foreground ml-2">较上期</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">订单数量</p>
              <p class="text-2xl font-bold text-blue-600">{{ purchaseStats.totalOrders }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-blue-600">↗ +12.3%</span>
            <span class="text-xs text-muted-foreground ml-2">较上期</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">平均订单额</p>
              <p class="text-2xl font-bold text-orange-600">¥{{ purchaseStats.avgOrderAmount.toLocaleString() }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calculator class="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-orange-600">↘ -2.1%</span>
            <span class="text-xs text-muted-foreground ml-2">较上期</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">活跃供应商</p>
              <p class="text-2xl font-bold text-purple-600">{{ purchaseStats.activeSuppliers }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 class="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-purple-600">↗ +5.8%</span>
            <span class="text-xs text-muted-foreground ml-2">较上期</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- 采购趋势图 -->
    <Card>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">采购趋势分析</h3>
      </div>
      <div class="p-6">
        <div class="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="text-center text-muted-foreground">
            <BarChart3 class="w-16 h-16 mx-auto mb-4" />
            <p class="text-lg font-medium">采购趋势图</p>
            <p class="text-sm">图表组件将在后续版本中集成</p>
          </div>
        </div>
      </div>
    </Card>

    <!-- 采购明细表 -->
    <Card>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">采购明细</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">订单号</th>
              <th class="p-4 font-medium">供应商</th>
              <th class="p-4 font-medium">订单日期</th>
              <th class="p-4 font-medium">金额</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">到货率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in purchaseDetails" :key="order.id" class="border-b hover:bg-muted/50">
              <td class="p-4 font-mono text-sm">{{ order.order_no }}</td>
              <td class="p-4">{{ order.supplier_name }}</td>
              <td class="p-4">{{ formatDate(order.order_date) }}</td>
              <td class="p-4 font-medium">¥{{ order.total_amount.toLocaleString() }}</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': order.status === 'completed',
                    'bg-blue-100 text-blue-800': order.status === 'shipped',
                    'bg-yellow-100 text-yellow-800': order.status === 'confirmed',
                    'bg-gray-100 text-gray-800': order.status === 'draft'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusName(order.status) }}
                </span>
              </td>
              <td class="p-4">
                <span :class="order.delivery_rate >= 0.9 ? 'text-green-600' : order.delivery_rate >= 0.7 ? 'text-yellow-600' : 'text-red-600'">
                  {{ (order.delivery_rate * 100).toFixed(1) }}%
                </span>
              </td>
            </tr>
            <tr v-if="purchaseDetails.length === 0">
              <td colspan="6" class="p-8 text-center text-muted-foreground">
                暂无采购数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 供应商采购排行 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">供应商采购排行</h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div v-for="(supplier, index) in topSuppliers" :key="supplier.id" class="flex items-center justify-between">
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
                  <p class="font-medium">{{ supplier.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ supplier.orders }}个订单</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">¥{{ supplier.amount.toLocaleString() }}</p>
                <p class="text-sm text-muted-foreground">{{ supplier.percentage }}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">采购类别排行</h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div v-for="(category, index) in topCategories" :key="category.id" class="flex items-center justify-between">
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
                  <p class="font-medium">{{ category.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ category.quantity }}件</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">¥{{ category.amount.toLocaleString() }}</p>
                <p class="text-sm text-muted-foreground">{{ category.percentage }}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Download, RefreshCw, Search, TrendingDown, ShoppingBag, 
  Calculator, Building2, BarChart3 
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '采购报表 - ERP 管理系统'
})

// 数据管理
const { getPurchaseReport, getPurchaseDetails, getTopSuppliers, getTopCategories } = usePurchaseReports()
const { suppliers } = useSuppliers()

// 响应式数据
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})
const supplierFilter = ref('')

// 报表数据
const purchaseStats = ref({
  totalAmount: 850000,
  totalOrders: 89,
  avgOrderAmount: 9551,
  activeSuppliers: 28
})

const purchaseDetails = ref([
  {
    id: '1',
    order_no: 'PO202501001',
    supplier_name: '深圳原材料供应有限公司',
    order_date: '2025-01-20',
    total_amount: 85000,
    status: 'completed',
    delivery_rate: 0.95
  },
  {
    id: '2',
    order_no: 'PO202501002',
    supplier_name: '广州物流运输有限公司',
    order_date: '2025-01-19',
    total_amount: 12000,
    status: 'shipped',
    delivery_rate: 0.88
  },
  {
    id: '3',
    order_no: 'PO202501003',
    supplier_name: '上海电子元件有限公司',
    order_date: '2025-01-18',
    total_amount: 65000,
    status: 'confirmed',
    delivery_rate: 0.92
  }
])

const topSuppliers = ref([
  { id: '1', name: '深圳原材料供应有限公司', amount: 280000, orders: 12, percentage: 33 },
  { id: '2', name: '上海电子元件有限公司', amount: 180000, orders: 8, percentage: 21 },
  { id: '3', name: '广州物流运输有限公司', amount: 120000, orders: 6, percentage: 14 },
  { id: '4', name: '北京机械配件有限公司', amount: 95000, orders: 5, percentage: 11 },
  { id: '5', name: '杭州化工原料有限公司', amount: 75000, orders: 4, percentage: 9 }
])

const topCategories = ref([
  { id: '1', name: '原材料', amount: 350000, quantity: 1200, percentage: 41 },
  { id: '2', name: '电子元件', amount: 220000, quantity: 800, percentage: 26 },
  { id: '3', name: '机械配件', amount: 150000, quantity: 450, percentage: 18 },
  { id: '4', name: '包装材料', amount: 80000, quantity: 600, percentage: 9 },
  { id: '5', name: '办公用品', amount: 50000, quantity: 300, percentage: 6 }
])

// 方法
const applyFilters = async () => {
  // TODO: 根据筛选条件重新加载数据
  console.log('应用筛选条件:', {
    dateRange: dateRange.value,
    supplier: supplierFilter.value
  })
}

const refreshData = async () => {
  // TODO: 刷新报表数据
  console.log('刷新采购报表数据')
}

const exportReport = () => {
  // TODO: 导出报表
  console.log('导出采购报表')
}

const getStatusName = (status: string) => {
  const statuses = {
    draft: '草稿',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statuses[status as keyof typeof statuses] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 初始化数据
onMounted(async () => {
  await applyFilters()
})
</script> 