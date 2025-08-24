<template>
  <div class="sales-orders-container p-6 flex flex-column gap-6 bg-surface-50 min-h-full">
    <!-- 页面头部 -->
    <div
      class="page-header bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-black opacity-10"></div>
      <div class="absolute -top-4 -right-4 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-white opacity-5 rounded-full"></div>
      <div class="relative z-10">
        <div class="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between">
          <div>
            <h1 class="text-3xl font-bold mb-2 flex align-items-center">
              <i class="pi pi-shopping-cart mr-3 text-4xl"></i>
              销售订单
            </h1>
            <p class="text-blue-100 text-lg">管理和跟踪销售订单信息，优化销售流程</p>
          </div>
          <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <Button
              label="导入订单"
              icon="pi pi-upload"
              severity="secondary"
              outlined
              class="text-white border-white hover:bg-white hover:text-blue-600"
              @click="importOrders"
            />
            <Button
              label="新建订单"
              icon="pi pi-plus"
              class="bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-lg"
              @click="openOrderModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="shadow-lg border-0">
      <template #header>
        <div class="p-6 pb-0">
          <h3 class="text-lg font-bold text-surface-900 mb-1 flex items-center">
            <i class="pi pi-filter mr-2 text-primary-600"></i>
            搜索与筛选
          </h3>
          <p class="text-surface-600">快速找到您需要的订单</p>
        </div>
      </template>
      <template #content>
        <div class="p-6 pt-0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-surface-900">搜索订单</label>
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search"></i>
                </InputIcon>
                <InputText v-model="searchKeyword" placeholder="搜索订单号、客户名称..." class="w-full" />
              </IconField>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-surface-900">订单状态</label>
              <Dropdown
                v-model="selectedStatus"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="全部状态"
                class="w-full"
                show-clear
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-surface-900">日期范围</label>
              <Calendar
                v-model="dateRange"
                selection-mode="range"
                placeholder="选择日期范围"
                date-format="yy-mm-dd"
                class="w-full"
                show-icon
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-surface-900 opacity-0">操作</label>
              <div class="flex gap-2">
                <Button label="重置" icon="pi pi-refresh" outlined class="flex-1" @click="resetFilters" />
                <Button v-tooltip="'导出数据'" icon="pi pi-download" outlined @click="exportData" />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- 统计信息卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-shopping-cart text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-blue-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +12.5%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">{{ filteredOrders.length }}</div>
                <div class="text-blue-100">总订单数</div>
                <div class="text-xs text-blue-200 mt-2">本月新增 {{ Math.floor(filteredOrders.length * 0.3) }} 个</div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-clock text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-orange-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +8.2%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">{{ pendingOrdersCount }}</div>
                <div class="text-orange-100">待处理订单</div>
                <div class="text-xs text-orange-200 mt-2">需要及时处理</div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-dollar text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-green-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +15.3%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">¥{{ totalAmount.toLocaleString() }}</div>
                <div class="text-green-100">总销售额</div>
                <div class="text-xs text-green-200 mt-2">本月累计收入</div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 订单列表 -->
    <Card class="shadow-lg border-0">
      <template #header>
        <div class="p-6 pb-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-surface-900 mb-1 flex items-center">
                <i class="pi pi-list mr-2 text-primary-600"></i>
                订单列表
              </h3>
              <p class="text-surface-600">
                当前共有 {{ filteredOrders.length }} 个订单，总金额 ¥{{ totalAmount.toLocaleString() }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Dropdown
                v-model="pageSize"
                :options="pageSizeOptions"
                option-label="label"
                option-value="value"
                class="w-32"
                size="small"
              />
              <Button v-tooltip="'刷新数据'" icon="pi pi-refresh" outlined rounded size="small" @click="refreshData" />
            </div>
          </div>
        </div>
      </template>
      <template #content>
        <div class="p-6 pt-0">
          <DataTable
            :value="filteredOrders"
            :loading="loading"
            :paginator="true"
            :rows="pageSize"
            :total-records="filteredOrders.length"
            :rows-per-page-options="[10, 20, 50]"
            striped-rows
            show-gridlines
            responsive-layout="scroll"
            :sort-field="'orderDate'"
            :sort-order="-1"
          >
            <template #loading>
              <div class="p-6">
                <div v-for="i in 5" :key="i" class="flex align-items-center gap-4 mb-4">
                  <Skeleton shape="circle" size="3rem" />
                  <div class="flex-1">
                    <Skeleton width="100%" height="1.5rem" class="mb-2" />
                    <Skeleton width="60%" height="1rem" />
                  </div>
                  <Skeleton width="8rem" height="2rem" />
                  <Skeleton width="6rem" height="1.5rem" />
                </div>
              </div>
            </template>

            <template #empty>
              <div class="text-center py-16 text-surface-500">
                <div class="mb-6">
                  <i class="pi pi-shopping-cart text-8xl text-surface-300"></i>
                </div>
                <h3 class="text-xl font-semibold mb-4">暂无订单数据</h3>
                <p class="text-surface-600 mb-6 max-w-md mx-auto">
                  您还没有创建任何订单。点击下方按钮开始创建您的第一个订单。
                </p>
                <Button label="新建订单" icon="pi pi-plus" class="px-6 py-3" @click="openOrderModal" />
              </div>
            </template>

            <Column field="orderNo" header="订单号" :sortable="true" style="min-width: 160px">
              <template #body="slotProps">
                <div class="flex items-center">
                  <span class="font-mono bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {{ slotProps.data.orderNo }}
                  </span>
                </div>
              </template>
            </Column>

            <Column field="customer" header="客户信息" :sortable="true" style="min-width: 200px">
              <template #body="slotProps">
                <div class="flex items-center gap-3">
                  <Avatar
                    :label="slotProps.data.customerName.charAt(0)"
                    shape="circle"
                    size="normal"
                    class="bg-gradient-to-br from-primary-400 to-primary-600 text-white"
                  />
                  <div>
                    <div class="font-semibold text-surface-900">{{ slotProps.data.customerName }}</div>
                    <div class="text-sm text-surface-600">VIP客户</div>
                  </div>
                </div>
              </template>
            </Column>

            <Column field="amount" header="订单金额" :sortable="true" style="min-width: 140px">
              <template #body="slotProps">
                <div class="text-right">
                  <div class="font-bold text-xl text-green-600">¥{{ slotProps.data.amount.toLocaleString() }}</div>
                  <div class="text-xs text-surface-500">含税金额</div>
                </div>
              </template>
            </Column>

            <Column field="status" header="订单状态" :sortable="true" style="min-width: 120px">
              <template #body="slotProps">
                <div class="flex flex-col items-center gap-1">
                  <Tag
                    :value="getStatusText(slotProps.data.status)"
                    :severity="getStatusSeverity(slotProps.data.status)"
                    class="font-semibold"
                  />
                  <div class="text-xs text-surface-500">{{ getStatusProgress(slotProps.data.status) }}</div>
                </div>
              </template>
            </Column>

            <Column field="orderDate" header="订单日期" :sortable="true" style="min-width: 140px">
              <template #body="slotProps">
                <div class="text-center">
                  <div class="font-medium text-surface-900">{{ formatDate(slotProps.data.orderDate) }}</div>
                  <div class="text-xs text-surface-500">{{ formatTimeAgo(slotProps.data.orderDate) }}</div>
                </div>
              </template>
            </Column>

            <Column header="操作" style="min-width: 160px" :exportable="false">
              <template #body="slotProps">
                <div class="flex gap-1 justify-center">
                  <Button
                    v-tooltip="'查看详情'"
                    icon="pi pi-eye"
                    outlined
                    rounded
                    size="small"
                    class="p-button-info"
                    @click="viewOrder(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'编辑订单'"
                    icon="pi pi-pencil"
                    outlined
                    rounded
                    size="small"
                    class="p-button-warning"
                    @click="editOrder(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'复制订单'"
                    icon="pi pi-copy"
                    outlined
                    rounded
                    size="small"
                    class="p-button-secondary"
                    @click="duplicateOrder(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'删除订单'"
                    icon="pi pi-trash"
                    outlined
                    rounded
                    size="small"
                    severity="danger"
                    @click="confirmDelete(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>

    <!-- 订单详情/编辑对话框 -->
    <Dialog
      v-model:visible="showOrderModal"
      :header="modalTitle"
      modal
      :style="{ width: '900px' }"
      class="p-fluid order-dialog"
      :draggable="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-shopping-cart text-primary-600 text-lg"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-surface-900">{{ modalTitle }}</h3>
            <p class="text-surface-600 text-sm">{{ isEditing ? '编辑订单信息' : '创建新的销售订单' }}</p>
          </div>
        </div>
      </template>

      <div class="space-y-6 py-4">
        <!-- 基本信息 -->
        <Card class="shadow-sm">
          <template #header>
            <div class="p-4 pb-0">
              <h4 class="font-semibold text-surface-900 flex items-center">
                <i class="pi pi-info-circle mr-2 text-primary-600"></i>
                基本信息
              </h4>
            </div>
          </template>
          <template #content>
            <div class="p-4 pt-0">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">订单号</label>
                  <InputText
                    v-model="currentOrder.orderNo"
                    placeholder="系统自动生成"
                    :disabled="isEditing"
                    class="font-mono"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">客户名称 *</label>
                  <Dropdown
                    v-model="currentOrder.customerName"
                    :options="customerOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="选择客户"
                    filter
                    show-clear
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 订单详情 -->
        <Card class="shadow-sm">
          <template #header>
            <div class="p-4 pb-0">
              <h4 class="font-semibold text-surface-900 flex items-center">
                <i class="pi pi-shopping-bag mr-2 text-primary-600"></i>
                订单详情
              </h4>
            </div>
          </template>
          <template #content>
            <div class="p-4 pt-0">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">订单金额 *</label>
                  <InputNumber
                    v-model="currentOrder.amount"
                    mode="currency"
                    currency="CNY"
                    locale="zh-CN"
                    placeholder="输入订单金额"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">订单状态</label>
                  <Dropdown
                    v-model="currentOrder.status"
                    :options="statusOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="选择状态"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">订单日期</label>
                  <Calendar
                    v-model="currentOrder.orderDate"
                    date-format="yy-mm-dd"
                    placeholder="选择订单日期"
                    show-icon
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-surface-900">预计交付日期</label>
                  <Calendar
                    v-model="currentOrder.deliveryDate"
                    date-format="yy-mm-dd"
                    placeholder="选择交付日期"
                    show-icon
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 备注信息 -->
        <Card class="shadow-sm">
          <template #header>
            <div class="p-4 pb-0">
              <h4 class="font-semibold text-surface-900 flex items-center">
                <i class="pi pi-comment mr-2 text-primary-600"></i>
                备注信息
              </h4>
            </div>
          </template>
          <template #content>
            <div class="p-4 pt-0">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-surface-900">订单备注</label>
                <Textarea v-model="currentOrder.remarks" placeholder="输入订单备注信息..." :rows="4" class="w-full" />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-surface-200">
          <Button label="取消" icon="pi pi-times" outlined @click="closeOrderModal" />
          <Button
            :label="isEditing ? '更新订单' : '创建订单'"
            :icon="isEditing ? 'pi pi-check' : 'pi pi-plus'"
            :loading="saving"
            @click="saveOrder"
          />
        </div>
      </template>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import ConfirmDialog from 'primevue/confirmdialog'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Skeleton from 'primevue/skeleton'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '销售订单 - 智能ERP管理系统',
})

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')
const dateRange = ref(null)
const pageSize = ref(10)

// 分页选项
const pageSizeOptions = [
  { label: '10条/页', value: 10 },
  { label: '20条/页', value: 20 },
  { label: '50条/页', value: 50 },
]

// 对话框状态
const showOrderModal = ref(false)
const isEditing = ref(false)
const confirm = useConfirm()

// 当前编辑的订单
const currentOrder = ref({
  id: '',
  orderNo: '',
  customerName: '',
  amount: 0,
  status: 'pending',
  orderDate: new Date(),
  deliveryDate: new Date(),
  remarks: '',
  created_at: new Date(),
  updated_at: new Date(),
})

// 模拟订单数据
const orders = ref([
  {
    id: '1',
    orderNo: 'SO-2025-001',
    customerName: '苏州华智科技有限公司',
    amount: 125420,
    status: 'confirmed',
    orderDate: new Date('2025-01-15'),
    deliveryDate: new Date('2025-01-25'),
    remarks: '加急订单，请尽快处理',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  },
  {
    id: '2',
    orderNo: 'SO-2025-002',
    customerName: '上海浦东制造有限公司',
    amount: 89500,
    status: 'pending',
    orderDate: new Date('2025-01-16'),
    deliveryDate: new Date('2025-01-30'),
    remarks: '常规订单',
    created_at: new Date('2025-01-16'),
    updated_at: new Date('2025-01-16'),
  },
  {
    id: '3',
    orderNo: 'SO-2025-003',
    customerName: '北京智能设备有限公司',
    amount: 67800,
    status: 'shipped',
    orderDate: new Date('2025-01-17'),
    deliveryDate: new Date('2025-01-27'),
    remarks: '',
    created_at: new Date('2025-01-17'),
    updated_at: new Date('2025-01-17'),
  },
  {
    id: '4',
    orderNo: 'SO-2025-004',
    customerName: '深圳创新科技有限公司',
    amount: 234500,
    status: 'production',
    orderDate: new Date('2025-01-18'),
    deliveryDate: new Date('2025-02-05'),
    remarks: '大批量订单，分批交付',
    created_at: new Date('2025-01-18'),
    updated_at: new Date('2025-01-18'),
  },
  {
    id: '5',
    orderNo: 'SO-2025-005',
    customerName: '广州精密制造有限公司',
    amount: 156780,
    status: 'delivered',
    orderDate: new Date('2025-01-19'),
    deliveryDate: new Date('2025-01-28'),
    remarks: '已完成交付，客户满意',
    created_at: new Date('2025-01-19'),
    updated_at: new Date('2025-01-19'),
  },
])

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '生产中', value: 'production' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'delivered' },
  { label: '已取消', value: 'cancelled' },
]

// 客户选项
const customerOptions = [
  { label: '苏州华智科技有限公司', value: '苏州华智科技有限公司' },
  { label: '上海浦东制造有限公司', value: '上海浦东制造有限公司' },
  { label: '北京智能设备有限公司', value: '北京智能设备有限公司' },
  { label: '深圳创新科技有限公司', value: '深圳创新科技有限公司' },
  { label: '广州精密制造有限公司', value: '广州精密制造有限公司' },
]

// 计算属性
const filteredOrders = computed(() => {
  let result = orders.value

  if (searchKeyword.value) {
    result = result.filter(
      order =>
        order.orderNo.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    result = result.filter(order => order.status === selectedStatus.value)
  }

  return result
})

const pendingOrdersCount = computed(() => {
  return orders.value.filter(o => o.status === 'pending').length
})

const totalAmount = computed(() => {
  return filteredOrders.value.reduce((sum, order) => sum + order.amount, 0)
})

const modalTitle = computed(() => {
  return isEditing.value ? '编辑订单' : '新建订单'
})

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    production: '生产中',
    shipped: '已发货',
    delivered: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    pending: 'warn',
    confirmed: 'info',
    production: 'secondary',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
  }
  return severityMap[status] || 'secondary'
}

const getStatusProgress = (status: string) => {
  const progressMap: Record<string, string> = {
    pending: '等待确认',
    confirmed: '已确认',
    production: '生产中',
    shipped: '运输中',
    delivered: '已完成',
    cancelled: '已取消',
  }
  return progressMap[status] || ''
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffTime = now.getTime() - new Date(date).getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return `${Math.floor(diffDays / 30)}月前`
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedStatus.value = ''
  dateRange.value = null
}

const refreshData = async () => {
  loading.value = true
  try {
    // 模拟刷新数据
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

const exportData = () => {
  console.log('导出数据')
  // 这里可以实现数据导出功能
}

const importOrders = () => {
  console.log('导入订单')
  // 这里可以实现订单导入功能
}

const openOrderModal = () => {
  isEditing.value = false
  currentOrder.value = {
    id: '',
    orderNo: `SO-${new Date().getFullYear()}-${String(orders.value.length + 1).padStart(3, '0')}`,
    customerName: '',
    amount: 0,
    status: 'pending',
    orderDate: new Date(),
    deliveryDate: new Date(),
    remarks: '',
    created_at: new Date(),
    updated_at: new Date(),
  }
  showOrderModal.value = true
}

const editOrder = (order: any) => {
  isEditing.value = true
  currentOrder.value = { ...order }
  showOrderModal.value = true
}

const viewOrder = (order: any) => {
  editOrder(order)
  // 可以设置为只读模式
}

const duplicateOrder = (order: any) => {
  isEditing.value = false
  currentOrder.value = {
    ...order,
    id: '',
    orderNo: `SO-${new Date().getFullYear()}-${String(orders.value.length + 1).padStart(3, '0')}`,
    orderDate: new Date(),
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date(),
  }
  showOrderModal.value = true
}

const confirmDelete = (order: any) => {
  confirm.require({
    message: `确定要删除订单 "${order.orderNo}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '确认删除',
    rejectLabel: '取消',
    accept: () => {
      deleteOrder(order.id)
    },
  })
}

const deleteOrder = async (orderId: string) => {
  try {
    loading.value = true
    // 模拟删除操作
    const index = orders.value.findIndex(o => o.id === orderId)
    if (index !== -1) {
      orders.value.splice(index, 1)
    }
  } catch (error) {
    console.error('删除订单失败:', error)
  } finally {
    loading.value = false
  }
}

const saveOrder = async () => {
  try {
    saving.value = true

    if (isEditing.value) {
      // 更新订单
      const index = orders.value.findIndex(o => o.id === currentOrder.value.id)
      if (index !== -1) {
        orders.value[index] = {
          ...currentOrder.value,
          updated_at: new Date(),
        }
      }
    } else {
      // 创建新订单
      const newOrder = {
        ...currentOrder.value,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date(),
      }
      orders.value.push(newOrder)
    }

    closeOrderModal()
  } catch (error) {
    console.error('保存订单失败:', error)
  } finally {
    saving.value = false
  }
}

const closeOrderModal = () => {
  showOrderModal.value = false
  isEditing.value = false
}
</script>
