<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          采购订单管理
        </h1>
        <p class="text-muted-foreground mt-1">
          管理所有采购订单，跟踪采购进度和供应商信息
        </p>
      </div>
      <button @click="handleCreate" class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
        + 新增采购订单
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center">
          <div class="p-3 bg-blue-500/10 rounded-full">
            <svg
              class="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              本月采购订单
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ orderStats.monthlyOrders }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-500/10 rounded-full">
            <svg
              class="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              待审核
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ orderStats.pendingApproval }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center">
          <div class="p-3 bg-green-500/10 rounded-full">
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              已完成
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ orderStats.completed }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center">
          <div class="p-3 bg-purple-500/10 rounded-full">
            <svg
              class="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              本月金额
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ formatCurrency(orderStats.monthlyAmount) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="bg-card p-6 rounded-lg border">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-muted-foreground mb-2">订单号</label>
          <input v-model="filters.orderNo" type="text" placeholder="输入订单号" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-muted-foreground mb-2">供应商</label>
          <select v-model="filters.supplierId" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="supplier in suppliersList" :key="supplier.value" :value="supplier.value">
              {{ supplier.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-muted-foreground mb-2">状态</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button @click="resetFilters" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- 采购订单列表 -->
    <div class="bg-card rounded-lg border overflow-hidden">
      <div class="px-6 py-4 border-b">
        <h3 class="text-lg font-semibold text-foreground">
          采购订单列表
        </h3>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-border">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                订单号
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                供应商
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                金额
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                订单日期
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-background divide-y divide-border">
             <!-- 错误提示 -->
             <tr v-if="error">
               <td colspan="6" class="px-6 py-8 text-center">
                 <div class="text-red-600">
                   <p class="text-sm">{{ error }}</p>
                 </div>
               </td>
             </tr>
             
             <!-- 加载状态 -->
             <tr v-else-if="loading">
               <td colspan="6" class="px-6 py-8 text-center">
                 <div class="flex items-center justify-center">
                   <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                   <span class="ml-2 text-sm text-gray-600">加载中...</span>
                 </div>
               </td>
             </tr>
             
             <!-- 空数据状态 -->
             <tr v-else-if="paginatedOrders.length === 0">
               <td colspan="6" class="px-6 py-8 text-center">
                 <div class="text-gray-500">
                   <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   <p class="mt-2 text-sm">暂无采购订单数据</p>
                 </div>
               </td>
             </tr>
             
             <!-- 订单数据 -->
             <tr v-else v-for="order in paginatedOrders" :key="order.id" class="hover:bg-muted/20">
               <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                 {{ order.order_no }}
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                 {{ order.supplier?.name }}
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                 {{ formatCurrency(order.total_amount) }}
               </td>
               <td class="px-6 py-4 whitespace-nowrap">
                 <span :class="getStatusColor(order.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                   {{ getStatusText(order.status) }}
                 </span>
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                 {{ formatDate(order.order_date) }}
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                 <button @click="handleView(order)" class="text-blue-600 hover:text-blue-900 mr-3" title="查看订单">
                   <EyeIcon class="h-4 w-4" />
                 </button>
                 <button @click="handleEdit(order)" class="text-green-600 hover:text-green-900 mr-3" title="编辑订单">
                   <EditIcon class="h-4 w-4" />
                 </button>
                 <button @click="handleDelete(order)" class="text-red-600 hover:text-red-900" title="删除订单">
                   <TrashIcon class="h-4 w-4" />
                 </button>
               </td>
             </tr>
           </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-vue-next'
import type { PurchaseOrderFilters } from '~/composables/usePurchaseOrders'

const {
  purchaseOrders,
  suppliers,
  orderStats,
  loading,
  error,
  fetchPurchaseOrders,
  fetchSuppliers,
  fetchOrderStats,
  deletePurchaseOrder,
  getStatusColor,
  getStatusText,
  formatCurrency,
  formatDate
} = usePurchaseOrders()

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

// 筛选条件
const filters = ref<PurchaseOrderFilters>({
  orderNo: '',
  supplierName: '',
  status: '',
  supplierId: '',
  startDate: '',
  endDate: ''
})

// 供应商列表
const suppliersList = ref<Array<{value: string, label: string}>>([])

// 状态选项
const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已审核' },
  { value: 'ordered', label: '已下单' },
  { value: 'partial_received', label: '部分收货' },
  { value: 'received', label: '已收货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

// 分页后的订单
const paginatedOrders = computed(() => {
  return purchaseOrders.value
})

// 加载数据
const loadOrders = async () => {
  const result = await fetchPurchaseOrders()
  totalCount.value = result.total
}

// 加载供应商列表
const loadSuppliers = async () => {
  const data = await fetchSuppliers()
  suppliersList.value = [
    { value: '', label: '全部供应商' },
    ...data.map(supplier => ({
      value: supplier.id,
      label: supplier.name
    }))
  ]
}

// 操作方法
const handleEdit = (order: any) => {
  console.log('编辑订单:', order)
}

const handleDelete = async (order: any) => {
  if (confirm('确定要删除这个采购订单吗？')) {
    try {
      await deletePurchaseOrder(order.id)
      await loadOrders()
    } catch (err) {
      console.error('删除失败:', err)
    }
  }
}

const handleView = (order: any) => {
  console.log('查看订单:', order)
}

const handleCreate = () => {
  console.log('创建新订单')
}

const resetFilters = () => {
  filters.value = {
    orderNo: '',
    supplierName: '',
    status: '',
    supplierId: '',
    startDate: '',
    endDate: ''
  }
  currentPage.value = 1
  loadOrders()
}

// 监听筛选条件变化
watch(filters, () => {
  currentPage.value = 1
  loadOrders()
}, { deep: true })

// 监听分页变化
watch([currentPage, pageSize], () => {
  loadOrders()
})

// 初始化数据
onMounted(async () => {
  await Promise.all([
    loadOrders(),
    loadSuppliers(),
    fetchOrderStats()
  ])
})

// 页面标题
useHead({
  title: '采购订单管理 - ERP 管理系统',
})

// 页面元数据
definePageMeta({
  middleware: 'auth',
})
</script>
