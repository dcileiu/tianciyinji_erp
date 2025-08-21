<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          库存管理
        </h1>
        <p class="text-muted-foreground mt-1">
          实时查看库存现存量，监控库存预警和异常情况
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button class="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          <span>导出报表</span>
        </button>
        <button class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>刷新库存</span>
        </button>
      </div>
    </div>

    <!-- 库存概览统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">总库存价值</p>
            <p class="text-2xl font-bold text-foreground">¥{{ stats.totalValue.toLocaleString() }}</p>
            <p class="text-xs text-green-600 mt-1">↑ 比上月增长 5.2%</p>
          </div>
          <div class="p-2 bg-blue-500/10 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">库存预警</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.alerts }}</p>
            <p class="text-xs text-yellow-600 mt-1">需要关注</p>
          </div>
          <div class="p-2 bg-yellow-500/10 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.16 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">缺货商品</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.outOfStock }}</p>
            <p class="text-xs text-red-600 mt-1">紧急处理</p>
          </div>
          <div class="p-2 bg-red-500/10 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">库存周转率</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.turnoverRate }}</p>
            <p class="text-xs text-green-600 mt-1">周转良好</p>
          </div>
          <div class="p-2 bg-green-500/10 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-card p-6 rounded-lg border">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- 搜索框 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            搜索商品
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              placeholder="商品名称、编号..."
              class="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- 仓库筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            仓库
          </label>
          <select v-model="warehouseFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部仓库</option>
            <option value="main">主仓库</option>
            <option value="raw_material">原料仓</option>
            <option value="finished_goods">成品仓</option>
            <option value="backup">备用仓</option>
          </select>
        </div>

        <!-- 分类筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            商品分类
          </label>
          <select v-model="categoryFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部分类</option>
            <option value="raw_material">原材料</option>
            <option value="finished_product">成品</option>
            <option value="semi_finished">半成品</option>
            <option value="accessory">配件</option>
          </select>
        </div>

        <!-- 库存状态筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            库存状态
          </label>
          <select v-model="stockStatusFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部状态</option>
            <option value="normal">正常</option>
            <option value="low">库存不足</option>
            <option value="out">缺货</option>
            <option value="excess">库存过量</option>
          </select>
        </div>

        <!-- 操作按钮 -->
        <div class="flex items-end space-x-2">
          <button class="flex-1 h-10 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 快速操作面板 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-card p-4 rounded-lg border">
        <h4 class="font-medium text-foreground mb-2">库存预警商品</h4>
        <div class="space-y-2">
          <div v-for="alert in stockAlerts.slice(0, 3)" :key="alert.id" class="flex items-center justify-between text-sm">
            <span class="text-foreground">{{ alert.product?.name || '未知商品' }}</span>
            <span class="text-yellow-600">{{ alert.current_stock }}</span>
          </div>
          <button class="text-xs text-blue-600 hover:text-blue-800">查看全部预警 →</button>
        </div>
      </div>
      
      <div class="bg-card p-4 rounded-lg border">
        <h4 class="font-medium text-foreground mb-2">缺货商品</h4>
        <div class="space-y-2">
          <div v-for="outStock in outOfStockItems.slice(0, 3)" :key="outStock.id" class="flex items-center justify-between text-sm">
            <span class="text-foreground">{{ outStock.product?.name || '未知商品' }}</span>
            <span class="text-red-600">缺货</span>
          </div>
          <button class="text-xs text-blue-600 hover:text-blue-800">查看全部缺货 →</button>
        </div>
      </div>
      
      <div class="bg-card p-4 rounded-lg border">
        <h4 class="font-medium text-foreground mb-2">库存异动</h4>
        <div class="space-y-2">
          <div v-for="movement in recentMovements.slice(0, 3)" :key="movement.id" class="flex items-center justify-between text-sm">
            <span class="text-foreground">{{ movement.product?.name || '未知商品' }}</span>
            <span :class="movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'">
              {{ movement.movement_type === 'in' ? '+' : '-' }}{{ movement.quantity }}
            </span>
          </div>
          <button class="text-xs text-blue-600 hover:text-blue-800">查看异动记录 →</button>
        </div>
      </div>
    </div>

    <!-- 库存明细列表 -->
    <div class="bg-card rounded-lg border overflow-hidden">
      <div class="px-6 py-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold text-foreground">库存明细</h3>
        <div class="flex items-center space-x-2">
          <button class="text-sm px-3 py-1 border border-input rounded-md hover:bg-accent">
            批量调整
          </button>
          <button class="text-sm px-3 py-1 border border-input rounded-md hover:bg-accent">
            盘点
          </button>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-border">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input type="checkbox" class="rounded border-input">
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">商品信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">仓库位置</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">当前库存</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">可用库存</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">预留库存</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">安全库存</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">库存状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">最后更新</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-background divide-y divide-border">
            <tr
              v-for="item in paginatedInventory"
              :key="item.id"
              class="hover:bg-muted/20 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="rounded border-input">
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-foreground">{{ item.product?.name || '未知商品' }}</div>
                    <div class="text-sm text-muted-foreground">{{ item.product?.product_no || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-foreground">{{ getWarehouseName(item.warehouse) }}</div>
                <div class="text-sm text-muted-foreground">{{ item.location || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-foreground">{{ item.current_stock }}</div>
                <div class="text-xs text-muted-foreground">{{ item.product?.unit || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ item.available_stock }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ item.reserved_stock }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {{ item.safety_stock }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStockStatusColor(item)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStockStatusText(item) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {{ formatDate(item.last_updated) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button class="text-blue-600 hover:text-blue-900 p-1" title="库存详情">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button class="text-green-600 hover:text-green-900 p-1" title="库存调整">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button class="text-purple-600 hover:text-purple-900 p-1" title="异动记录">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-4h10m0 0l-4-4m4 4l-4 4M3 4h4"></path>
                    </svg>
                  </button>
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
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredInventory.length) }}</span>
              项，共
              <span class="font-medium">{{ filteredInventory.length }}</span>
              项
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage * pageSize >= filteredInventory.length"
              class="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Filter, Download, Upload, AlertTriangle, Package, TrendingUp, BarChart3 } from 'lucide-vue-next'
import { useInventory, type InventoryItem, type InventoryMovement, type InventoryStats } from '~/composables/useInventory'

// 使用库存管理组合式函数
const {
  loading,
  error,
  getInventoryList,
  getInventoryStats,
  getInventoryMovements,
  getLowStockItems,
  getOutOfStockItems,
  getStockStatus,
  getStockStatusColor,
  getStockStatusText,
  getWarehouseName
} = useInventory()

// 响应式数据
const searchQuery = ref('')
const warehouseFilter = ref('')
const categoryFilter = ref('')
const stockStatusFilter = ref('')
const currentPage = ref(1)
const pageSize = 15

// 数据状态
const inventory = ref<InventoryItem[]>([])
const stats = ref<InventoryStats>({
  totalValue: 0,
  alerts: 0,
  outOfStock: 0,
  turnoverRate: '0次/月'
})
const stockAlerts = ref<InventoryItem[]>([])
const outOfStockItems = ref<InventoryItem[]>([])
const recentMovements = ref<InventoryMovement[]>([])

// 数据加载函数
const loadInventoryData = async () => {
  try {
    const filters = {
      warehouse: selectedWarehouse.value || undefined,
      category: selectedCategory.value || undefined,
      stockStatus: selectedStockStatus.value || undefined,
      searchQuery: searchQuery.value || undefined
    }
    
    inventoryList.value = await getInventoryList(filters)
  } catch (err) {
    console.error('加载库存数据失败:', err)
  }
}

const loadStats = async () => {
  try {
    stats.value = await getInventoryStats()
  } catch (err) {
    console.error('加载统计数据失败:', err)
  }
}

const loadAlertItems = async () => {
  try {
    alertItems.value = await getLowStockItems()
  } catch (err) {
    console.error('加载预警商品失败:', err)
  }
}

const loadOutOfStockItems = async () => {
  try {
    outOfStockItems.value = await getOutOfStockItems()
  } catch (err) {
    console.error('加载缺货商品失败:', err)
  }
}

const loadRecentMovements = async () => {
  try {
    recentMovements.value = await getInventoryMovements({ 
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    })
  } catch (err) {
    console.error('加载最近异动失败:', err)
  }
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    loadInventoryData(),
    loadStats(),
    loadAlertItems(),
    loadOutOfStockItems(),
    loadRecentMovements()
  ])
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  selectedWarehouse.value = ''
  selectedCategory.value = ''
  selectedStockStatus.value = ''
  currentPage.value = 1
  loadInventoryData()
}

// 分页计算
const totalPages = computed(() => {
  return Math.ceil(filteredInventory.value.length / pageSize)
})

const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredInventory.value.slice(start, end)
})

// 格式化函数
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

// 组件挂载时初始化数据
onMounted(() => {
  initData()
})

// 筛选库存
const filteredInventory = computed(() => {
  let filtered = inventory.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.productName.toLowerCase().includes(query) ||
      item.productNo.toLowerCase().includes(query)
    )
  }

  // 仓库筛选
  if (warehouseFilter.value) {
    filtered = filtered.filter(item => item.warehouse === warehouseFilter.value)
  }

  // 库存状态筛选
  if (stockStatusFilter.value) {
    filtered = filtered.filter(item => {
      const stockStatus = getStockStatus(item)
      return stockStatus === stockStatusFilter.value
    })
  }

  return filtered
})

// 监听筛选条件变化
watch([searchQuery, selectedWarehouse, selectedCategory, selectedStockStatus], () => {
  currentPage.value = 1
  loadInventoryData()
}, { debounce: 300 })

// 格式化日期
const formatDate = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes} 分钟前`
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    return `${hours} 小时前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 页面标题
useHead({
  title: '库存管理 - ERP 管理系统'
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>