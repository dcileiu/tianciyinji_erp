<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">
        仪表板
      </h1>
      <p class="text-gray-600">
        欢迎使用ERP管理系统
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-users" class="h-8 w-8 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">
              客户总数
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.customers }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-shopping-cart" class="h-8 w-8 text-green-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">
              销售订单
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.salesOrders }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-cube" class="h-8 w-8 text-yellow-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">
              产品总数
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.products }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <UIcon name="i-heroicons-banknotes" class="h-8 w-8 text-purple-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">
              本月销售额
            </p>
            <p class="text-2xl font-bold text-gray-900">
              ¥{{ formatCurrency(stats.monthlyRevenue) }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近订单 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              最近订单
            </h3>
            <UButton to="/sales/orders" variant="ghost" size="sm">
              查看全部
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <div v-if="recentOrders.length === 0" class="text-center py-8 text-gray-500">
            暂无订单数据
          </div>
          <div v-else>
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <p class="font-medium">
                  {{ order.order_number }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ order.customer_name }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium">
                  ¥{{ formatCurrency(order.total_amount) }}
                </p>
                <UBadge
                  :color="getStatusColor(order.status)"
                  size="sm"
                >
                  {{ getStatusText(order.status) }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 库存预警 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              库存预警
            </h3>
            <UButton to="/inventory/stock" variant="ghost" size="sm">
              查看全部
            </UButton>
          </div>
        </template>

        <div class="space-y-4">
          <div v-if="lowStockProducts.length === 0" class="text-center py-8 text-gray-500">
            库存充足
          </div>
          <div v-else>
            <div
              v-for="product in lowStockProducts"
              :key="product.id"
              class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
            >
              <div>
                <p class="font-medium">
                  {{ product.name }}
                </p>
                <p class="text-sm text-gray-600">
                  SKU: {{ product.sku }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-red-600">
                  {{ product.stock_quantity }}
                </p>
                <p class="text-sm text-gray-600">
                  最低: {{ product.min_stock_level }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()

// 统计数据
const stats = ref({
  customers: 0,
  salesOrders: 0,
  products: 0,
  monthlyRevenue: 0
})

// 最近订单
const recentOrders = ref([])

// 库存预警产品
const lowStockProducts = ref([])

// 加载统计数据
async function loadStats () {
  try {
    // 客户总数
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })

    // 销售订单总数
    const { count: orderCount } = await supabase
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })

    // 产品总数
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    // 本月销售额
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthlyOrders } = await supabase
      .from('sales_orders')
      .select('total_amount')
      .gte('created_at', startOfMonth.toISOString())

    const monthlyRevenue = monthlyOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

    stats.value = {
      customers: customerCount || 0,
      salesOrders: orderCount || 0,
      products: productCount || 0,
      monthlyRevenue
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载最近订单
async function loadRecentOrders () {
  try {
    const { data } = await supabase
      .from('sales_orders')
      .select(`
        id,
        order_number,
        total_amount,
        status,
        customers(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    recentOrders.value = data?.map(order => ({
      ...order,
      customer_name: order.customers?.name || '未知客户'
    })) || []
  } catch (error) {
    console.error('加载最近订单失败:', error)
  }
}

// 加载库存预警产品
async function loadLowStockProducts () {
  try {
    const { data } = await supabase
      .from('products')
      .select('id, name, sku, stock_quantity, min_stock_level')
      .filter('stock_quantity', 'lte', 'min_stock_level')
      .limit(5)

    lowStockProducts.value = data || []
  } catch (error) {
    console.error('加载库存预警失败:', error)
  }
}

// 格式化货币
function formatCurrency (amount: number) {
  return new Intl.NumberFormat('zh-CN').format(amount)
}

// 获取状态颜色
function getStatusColor (status: string) {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    shipped: 'green',
    delivered: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

// 获取状态文本
function getStatusText (status: string) {
  const texts = {
    pending: '待确认',
    confirmed: '已确认',
    shipped: '已发货',
    delivered: '已交付',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 页面加载时获取数据
onMounted(() => {
  loadStats()
  loadRecentOrders()
  loadLowStockProducts()
})
</script>
