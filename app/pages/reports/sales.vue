<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">销售报表</h1>
        <p class="text-muted-color">分析销售数据，了解业务趋势和客户表现</p>
      </div>
      <div class="flex gap-3">
        <Button
          label="导出报表"
          icon="pi pi-download"
          outlined
          @click="exportReport"
        />
        <Button
          label="刷新数据"
          icon="pi pi-refresh"
          @click="refreshData"
        />
      </div>
    </div>

    <!-- 筛选器 -->
    <Card class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold text-color">报表筛选</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">日期范围</label>
            <Calendar
              v-model="dateRange"
              selection-mode="range"
              :manual-input="false"
              date-format="yy-mm-dd"
              placeholder="选择日期范围"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">客户筛选</label>
            <Dropdown
              v-model="customerFilter"
              :options="customerOptions"
              option-label="label"
              option-value="value"
              placeholder="选择客户"
              filter
              show-clear
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">搜索</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchQuery"
                placeholder="搜索订单号、产品..."
              />
            </span>
          </div>
        </div>
      </template>
    </Card>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-green-600 mb-1">
                ¥{{ formatCurrency(salesStats.totalAmount) }}
              </div>
              <div class="text-sm text-muted-color mb-2">总销售额</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+15.2%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-dollar text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-blue-600 mb-1">{{ salesStats.totalOrders }}</div>
              <div class="text-sm text-muted-color mb-2">订单数量</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+8.3%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-shopping-cart text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-purple-600 mb-1">
                ¥{{ formatCurrency(salesStats.avgOrderAmount) }}
              </div>
              <div class="text-sm text-muted-color mb-2">平均订单额</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+12.1%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-calculator text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-orange-600 mb-1">{{ salesStats.activeCustomers }}</div>
              <div class="text-sm text-muted-color mb-2">活跃客户</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+6.7%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-users text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 销售明细 -->
    <Card class="mb-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-color">销售明细</h3>
          <span class="text-sm text-muted-color">共 {{ filteredSalesDetails.length }} 条记录</span>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="filteredSalesDetails"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :total-records="filteredSalesDetails.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
        >
          <template #loading>
            <div class="p-6">
              <div v-for="i in 5" :key="i" class="flex align-items-center gap-4 mb-4">
                <Skeleton shape="circle" size="3rem" />
                <div class="flex-1">
                  <Skeleton width="100%" height="1.5rem" class="mb-2" />
                  <Skeleton width="70%" height="1rem" />
                </div>
                <Skeleton width="8rem" height="1.5rem" />
                <Skeleton width="6rem" height="1.5rem" />
              </div>
            </div>
          </template>
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-chart-bar text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无销售数据</h3>
              <p class="mb-4">当前筛选条件下没有找到相关数据</p>
        </div>
          </template>

          <Column field="order_no" header="订单号" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono bg-surface-100 px-2 py-1 rounded text-primary text-sm">
                {{ slotProps.data.order_no }}
                  </span>
            </template>
          </Column>

          <Column field="customer_name" header="客户名称" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :label="slotProps.data.customer_name.charAt(0)"
                  shape="circle"
                  size="normal"
                  class="bg-primary-100 text-primary"
                />
                <span class="font-medium text-color">{{ slotProps.data.customer_name }}</span>
              </div>
            </template>
          </Column>

          <Column field="product_name" header="产品名称" :sortable="true">
            <template #body="slotProps">
              <div>
                <div class="font-medium text-color mb-1">{{ slotProps.data.product_name }}</div>
                <div class="text-sm text-muted-color">数量: {{ slotProps.data.quantity }}</div>
              </div>
            </template>
          </Column>

          <Column field="unit_price" header="单价" :sortable="true">
            <template #body="slotProps">
              <span class="font-medium text-color">¥{{ formatCurrency(slotProps.data.unit_price) }}</span>
            </template>
          </Column>

          <Column field="total_amount" header="总金额" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-green-600 text-lg">
                ¥{{ formatCurrency(slotProps.data.total_amount) }}
              </span>
            </template>
          </Column>

          <Column field="order_date" header="订单日期" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.order_date) }}
              </span>
            </template>
          </Column>

          <Column field="status" header="状态" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getStatusText(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
      </Card>

    <!-- 趋势图表 -->
      <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">销售趋势</h3>
      </template>
      <template #content>
        <div class="flex flex-col items-center justify-center h-80 text-center text-muted-color p-4">
          <i class="pi pi-chart-bar text-6xl mb-4 opacity-50"></i>
          <p class="text-lg mb-2">销售趋势图表</p>
          <p class="text-sm opacity-75">（图表组件待集成）</p>
                </div>
      </template>
      </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Skeleton from 'primevue/skeleton'

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
const filteredSalesDetails = computed(() => {
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

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    pending: 'warn',
    processing: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return severityMap[status] || 'secondary'
}

const exportReport = () => {
  console.log('导出报表')
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


