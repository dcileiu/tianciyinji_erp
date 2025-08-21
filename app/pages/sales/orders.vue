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
    <Card class="p-6">
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
          <select v-model="selectedStatus" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="confirmed">已确认</option>
            <option value="in_production">生产中</option>
            <option value="shipped">已发货</option>
            <option value="delivered">已送达</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        <!-- 客户筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            客户
          </label>
          <select v-model="selectedCustomer" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部客户</option>
            <option v-for="customer in customersList" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
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
    </Card>

    <!-- 订单统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">今日新增</p>
            <p class="text-2xl font-bold text-foreground">{{ orderStats.todayNew }}</p>
          </div>
          <div class="p-2 bg-blue-500/10 rounded-lg">
            <Plus class="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </Card>
      
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">待确认</p>
            <p class="text-2xl font-bold text-foreground">{{ orderStats.pendingConfirm }}</p>
          </div>
          <div class="p-2 bg-yellow-500/10 rounded-lg">
            <Clock class="w-5 h-5 text-yellow-600" />
          </div>
        </div>
      </Card>
      
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">生产中</p>
            <p class="text-2xl font-bold text-foreground">{{ orderStats.inProduction }}</p>
          </div>
          <div class="p-2 bg-orange-500/10 rounded-lg">
            <Factory class="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </Card>
      
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">本月完成</p>
            <p class="text-2xl font-bold text-foreground">{{ orderStats.monthlyCompleted }}</p>
          </div>
          <div class="p-2 bg-green-500/10 rounded-lg">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
        </div>
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
    <Card class="overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">加载中...</span>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-border">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                订单号
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                客户
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                订单金额
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                订单日期
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                交付日期
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-background divide-y divide-border">
              <!-- 空数据状态 -->
              <tr v-if="paginatedOrders.length === 0">
                <td colspan="7" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <svg class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="text-sm font-medium text-gray-900 mb-1">暂无订单数据</h3>
                    <p class="text-sm text-gray-500">开始创建您的第一个销售订单</p>
                  </div>
                </td>
              </tr>
              
              <tr
                v-for="order in paginatedOrders"
                :key="order.id"
                class="hover:bg-muted/20 transition-colors"
              >
              <!-- 订单号 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-foreground">
                  {{ order.order_no }}
                </div>
              </td>

              <!-- 客户 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-primary">
                      {{ (order.customer?.name || '未知客户').charAt(0) }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-foreground">
                      {{ order.customer?.name || '未知客户' }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- 订单金额 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-foreground font-medium">
                  {{ formatCurrency(order.total_amount) }}
                </div>
              </td>

              <!-- 状态 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusColor(order.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusText(order.status) }}
                </span>
              </td>

              <!-- 订单日期 -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {{ formatDate(order.order_date) }}
              </td>

              <!-- 交付日期 -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {{ order.delivery_date ? formatDate(order.delivery_date) : '-' }}
              </td>

              <!-- 操作 -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" title="查看详情">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="编辑">
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="删除">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
              @click="currentPage--"
              :disabled="currentPage === 1"
            >
              上一页
            </Button>
            <Button
              variant="outline" 
              size="sm"
              @click="currentPage++"
              :disabled="currentPage * pageSize >= filteredOrders.length"
            >
              下一页
            </Button>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Filter, Plus, Eye, Edit, Trash2, Download } from 'lucide-vue-next'
import { useSalesOrders, type OrderFilters } from '~/composables/useSalesOrders'

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

// 分页后的订单列表
const paginatedOrders = computed(() => {
  return ordersList.value
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