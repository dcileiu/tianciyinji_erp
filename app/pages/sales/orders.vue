<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          销售订单管理
        </h1>
        <p class="text-muted-foreground mt-1">
          管理所有销售订单，跟踪订单状态和执行进度
        </p>
      </div>
      <Button class="space-x-2">
        <Plus class="w-4 h-4" />
        <span>新增销售订单</span>
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              搜索订单
            </label>
            <div class="relative">
              <Input
                v-model="searchQuery"
                placeholder="订单号、客户名称..."
                class="pl-10"
              />
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <!-- 订单状态筛选 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              订单状态
            </label>
            <Select v-model="selectedStatus">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="in_production">生产中</SelectItem>
                <SelectItem value="shipped">已发货</SelectItem>
                <SelectItem value="delivered">已送达</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 客户筛选 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              客户
            </label>
            <Select v-model="selectedCustomer">
              <SelectTrigger>
                <SelectValue placeholder="全部客户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部客户</SelectItem>
                <SelectItem v-for="customer in customersList" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 日期范围 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              订单日期
            </label>
            <Input
              v-model="dateRange"
              type="date"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 订单统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">总订单数</p>
              <p class="text-2xl font-bold text-foreground">{{ orderStats.total }}</p>
            </div>
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart class="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">待处理</p>
              <p class="text-2xl font-bold text-foreground">{{ orderStats.pending }}</p>
            </div>
            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock class="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">已完成</p>
              <p class="text-2xl font-bold text-foreground">{{ orderStats.completed }}</p>
            </div>
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle class="w-4 h-4 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">总金额</p>
              <p class="text-2xl font-bold text-foreground">¥{{ orderStats.totalAmount.toLocaleString() }}</p>
            </div>
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign class="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">错误</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle>订单列表</CardTitle>
          <Button @click="refreshData" variant="outline" size="sm">
            <RefreshCw class="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- 订单表格 -->
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>订单金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>订单日期</TableHead>
                <TableHead>交付日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <!-- 空数据状态 -->
              <TableRow v-if="paginatedOrders.length === 0">
                <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
                  暂无订单数据
                </TableCell>
              </TableRow>
              
              <!-- 订单数据 -->
              <TableRow v-for="order in paginatedOrders" :key="order.id">
                <TableCell>
                  <div class="font-medium">{{ order.order_no }}</div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span class="text-xs font-medium text-primary">
                        {{ (order.customer?.name || '未知客户').charAt(0) }}
                      </span>
                    </div>
                    <div class="ml-3">
                      <div class="font-medium">{{ order.customer?.name || '未知客户' }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="font-medium">{{ formatCurrency(order.total_amount) }}</div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(order.status)">
                    {{ getStatusText(order.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm">{{ formatDate(order.order_date) }}</div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">{{ order.delivery_date ? formatDate(order.delivery_date) : '-' }}</div>
                </TableCell>
                <TableCell>
                  <div class="flex space-x-2">
                    <Button variant="ghost" size="sm" @click="viewOrder(order.id)">
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="editOrder(order.id)">
                      <Edit class="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="deleteOrder(order.id)" class="text-destructive hover:text-destructive">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <!-- 分页 -->
      <div class="bg-background px-4 py-3 border-t border-border sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <p class="text-sm text-muted-foreground">
              显示 
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              到
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredOrders.length) }}</span>
              项，共
              <span class="font-medium">{{ filteredOrders.length }}</span>
              项
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
            >
              <ChevronLeft class="w-4 h-4 mr-1" />
              上一页
            </Button>
            <span class="text-sm text-muted-foreground">
              第 {{ currentPage }} / {{ totalPages }} 页
            </span>
            <Button
              variant="outline" 
              size="sm"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              下一页
              <ChevronRight class="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSalesOrders, type OrderFilters } from '~/composables/useSalesOrders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RefreshCw, ShoppingCart, Clock, CheckCircle, DollarSign, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'

// 页面标题和元数据
useHead({
  title: '销售订单管理 - ERP系统'
})

// 使用销售订单组合式函数
const {
  ordersList,
  customersList,
  orderStats,
  loading,
  error,
  getSalesOrdersList,
  getCustomersList,
  getOrderStats,
  getStatusColor,
  getStatusText,
  formatCurrency,
  formatDate
} = useSalesOrders()

// 工具函数
const getStatusVariant = (status) => {
  const variantMap = {
    draft: 'secondary',
    confirmed: 'default',
    in_production: 'outline',
    shipped: 'secondary',
    delivered: 'default',
    completed: 'default',
    cancelled: 'destructive'
  }
  return variantMap[status] || 'secondary'
}

// 操作函数
const viewOrder = (orderId) => {
  // 查看订单详情
  navigateTo(`/sales/orders/${orderId}`)
}

const editOrder = (orderId) => {
  // 编辑订单
  navigateTo(`/sales/orders/${orderId}/edit`)
}

const deleteOrder = async (orderId) => {
  // 删除订单
  if (confirm('确定要删除这个订单吗？')) {
    // 调用删除API
    await refreshData()
  }
}

const refreshData = async () => {
  await initData()
}

// 响应式数据
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCustomer = ref('')
const selectedDateRange = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// 筛选条件
const filters = computed<OrderFilters>(() => ({
  orderNo: searchQuery.value,
  status: selectedStatus.value || undefined,
  customerId: selectedCustomer.value || undefined
}))

// 计算属性
const filteredOrders = computed(() => {
  if (!ordersList.value) return []
  
  return ordersList.value.filter(order => {
    const matchesSearch = !searchQuery.value || 
      order.order_no.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !selectedStatus.value || order.status === selectedStatus.value
    const matchesCustomer = !selectedCustomer.value || order.customer?.id === selectedCustomer.value
    
    return matchesSearch && matchesStatus && matchesCustomer
  })
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize.value)
})

// 加载数据
const loadOrdersData = async () => {
  const result = await getSalesOrdersList(filters.value, currentPage.value, pageSize.value)
  totalCount.value = result.count
}

const loadStats = async () => {
  await getOrderStats()
}

const loadCustomers = async () => {
  await getCustomersList()
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    loadOrdersData(),
    loadStats(),
    loadCustomers()
  ])
}

// 监听筛选条件变化
watch([filters, currentPage], () => {
  loadOrdersData()
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  initData()
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>