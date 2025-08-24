<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-color">采购报表</h1>
        <p class="text-muted-color">采购数据分析和统计报表</p>
      </div>
      <div class="flex gap-2">
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

    <!-- 时间筛选 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-color mb-2">开始日期</label>
            <Calendar 
              v-model="dateRange.start"
              placeholder="选择开始日期"
              date-format="yy-mm-dd"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-2">结束日期</label>
            <Calendar 
              v-model="dateRange.end"
              placeholder="选择结束日期"
              date-format="yy-mm-dd"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-2">供应商筛选</label>
            <Dropdown
              v-model="supplierFilter"
              :options="supplierOptions"
              option-label="label"
              option-value="value"
              placeholder="全部供应商"
              show-clear
              class="w-full"
            />
          </div>
          <div class="flex gap-2">
            <Button 
              label="查询"
              icon="pi pi-search"
              class="flex-1"
              @click="applyFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 采购概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">总采购额</p>
              <p class="text-2xl font-bold text-red-600">¥{{ purchaseStats.totalAmount.toLocaleString() }}</p>
              <div class="mt-2">
                <span class="text-xs text-red-600">↗ +8.7%</span>
                <span class="text-xs text-muted-color ml-2">较上期</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-arrow-down text-red-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">订单数量</p>
              <p class="text-2xl font-bold text-blue-600">{{ purchaseStats.totalOrders }}</p>
              <div class="mt-2">
                <span class="text-xs text-blue-600">↗ +12.3%</span>
                <span class="text-xs text-muted-color ml-2">较上期</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-shopping-bag text-blue-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">平均订单额</p>
              <p class="text-2xl font-bold text-orange-600">¥{{ purchaseStats.avgOrderAmount.toLocaleString() }}</p>
              <div class="mt-2">
                <span class="text-xs text-orange-600">↗ +5.2%</span>
                <span class="text-xs text-muted-color ml-2">较上期</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-calculator text-orange-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">活跃供应商</p>
              <p class="text-2xl font-bold text-green-600">{{ purchaseStats.activeSuppliers }}</p>
              <div class="mt-2">
                <span class="text-xs text-green-600">↗ +3</span>
                <span class="text-xs text-muted-color ml-2">较上期</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-users text-green-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 趋势图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold text-color">采购趋势</h3>
        </template>
        <template #content>
          <div class="h-64 flex items-center justify-center text-muted-color">
            <div class="text-center">
              <i class="pi pi-chart-line text-4xl mb-4"></i>
              <p>图表组件待集成</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #header>
          <h3 class="text-lg font-semibold text-color">供应商分布</h3>
        </template>
        <template #content>
          <div class="h-64 flex items-center justify-center text-muted-color">
            <div class="text-center">
              <i class="pi pi-chart-pie text-4xl mb-4"></i>
              <p>图表组件待集成</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 详细数据表格 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">采购明细</h3>
          <div class="flex items-center gap-2">
            <Button
              label="批量导出"
              icon="pi pi-file-excel"
              outlined
              size="small"
            />
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="purchaseDetails"
          :loading="loading"
          :paginator="true"
          :rows="15"
          :rows-per-page-options="[10, 15, 25]"
          data-key="id"
        >
          <template #loading>
            <div class="p-6">
              <div v-for="i in 5" :key="i" class="flex align-items-center gap-4 mb-4">
                <Skeleton shape="circle" size="2.5rem" />
                <div class="flex-1">
                  <Skeleton width="100%" height="1.5rem" class="mb-2" />
                  <Skeleton width="70%" height="1rem" />
                </div>
                <Skeleton width="8rem" height="1.5rem" />
                <Skeleton width="6rem" height="1.5rem" />
              </div>
            </div>
          </template>
          <Column field="order_no" header="采购单号" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm font-mono">
                {{ slotProps.data.order_no }}
              </code>
            </template>
          </Column>
          
          <Column field="supplier_name" header="供应商" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <Avatar
                  :label="slotProps.data.supplier_name.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <span class="font-medium">{{ slotProps.data.supplier_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="product_name" header="产品名称" sortable>
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.product_name }}</span>
            </template>
          </Column>
          
          <Column field="quantity" header="数量" sortable>
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.quantity.toLocaleString() }}</span>
            </template>
          </Column>
          
          <Column field="unit_price" header="单价" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                ¥{{ slotProps.data.unit_price.toLocaleString() }}
              </span>
            </template>
          </Column>
          
          <Column field="total_amount" header="总金额" sortable>
            <template #body="slotProps">
              <span class="font-bold text-red-600">
                ¥{{ slotProps.data.total_amount.toLocaleString() }}
              </span>
            </template>
          </Column>
          
          <Column field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
          
          <Column field="order_date" header="采购日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.order_date) }}
              </span>
            </template>
          </Column>
          
          <Column field="delivery_date" header="到货日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.delivery_date) }}
              </span>
            </template>
          </Column>
          
          <Column header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex items-center space-x-1">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  rounded
                  text
                  size="small"
                  @click="viewDetail(slotProps.data)"
                />
                <Button
                  v-tooltip="'打印'"
                  icon="pi pi-print"
                  rounded
                  text
                  size="small"
                  @click="printOrder(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 总计统计 -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">汇总统计</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ purchaseDetails.length }}
            </div>
            <div class="text-sm text-muted-color">采购订单总数</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">
              ¥{{ totalAmount.toLocaleString() }}
            </div>
            <div class="text-sm text-muted-color">采购总金额</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600 mb-2">
              ¥{{ avgOrderAmount.toLocaleString() }}
            </div>
            <div class="text-sm text-muted-color">平均订单金额</div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
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
  title: '采购报表 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)

// 筛选条件
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date()
})
const supplierFilter = ref('')

// 选项数据
const supplierOptions = ref([
  { label: 'ABC供应商', value: 'supplier-1' },
  { label: 'XYZ材料厂', value: 'supplier-2' },
  { label: '优质零件公司', value: 'supplier-3' }
])

// 统计数据
const purchaseStats = ref({
  totalAmount: 2850000,
  totalOrders: 156,
  avgOrderAmount: 18269,
  activeSuppliers: 23
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
    delivery_date: new Date('2024-01-20')
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
    delivery_date: new Date('2024-01-25')
  }
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
  cancelled: '已取消'
}

const statusSeverityMap: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  completed: 'success',
  cancelled: 'danger'
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info'

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
