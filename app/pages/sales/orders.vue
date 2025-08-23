<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">销售订单</h1>
        <p class="text-muted-color">管理和跟踪销售订单信息</p>
      </div>
      <Button
        label="新建订单"
        icon="pi pi-plus"
        @click="openOrderModal"
      />
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">搜索</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchKeyword"
                placeholder="搜索订单号、客户名称..."
                class="w-full"
              />
            </span>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">订单状态</label>
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
            <label class="text-sm font-medium text-color">日期范围</label>
            <Calendar
              v-model="dateRange"
              selection-mode="range"
              placeholder="选择日期范围"
              date-format="yy-mm-dd"
              class="w-full"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color opacity-0">操作</label>
            <Button
              label="重置"
              icon="pi pi-refresh"
              outlined
              class="w-full"
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-blue-600 mb-1">{{ filteredOrders.length }}</div>
              <div class="text-sm text-blue-700">总订单数</div>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-shopping-cart text-blue-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-orange-600 mb-1">{{ pendingOrdersCount }}</div>
              <div class="text-sm text-orange-700">待处理</div>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <i class="pi pi-clock text-orange-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-green-50 dark:bg-green-900/20 border-green-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-green-600 mb-1">¥{{ totalAmount.toLocaleString() }}</div>
              <div class="text-sm text-green-700">总金额</div>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-dollar text-green-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 订单列表 -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-color">订单列表</h3>
          <span class="text-sm text-muted-color">总金额: ¥{{ totalAmount.toLocaleString() }}</span>
        </div>
      </template>
      <template #content>
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
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-shopping-cart text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无订单</h3>
              <p class="mb-4">开始创建您的第一个订单</p>
              <Button
                label="新建订单"
                icon="pi pi-plus"
                @click="openOrderModal"
              />
            </div>
          </template>

          <Column field="orderNo" header="订单号" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono bg-surface-100 px-2 py-1 rounded text-primary text-sm">{{ slotProps.data.orderNo }}</span>
            </template>
          </Column>

          <Column field="customer" header="客户" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :label="slotProps.data.customerName.charAt(0)"
                  shape="circle"
                  size="normal"
                  class="bg-primary-100 text-primary"
                />
                <span class="font-medium text-color">{{ slotProps.data.customerName }}</span>
              </div>
            </template>
          </Column>

          <Column field="amount" header="订单金额" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-green-600 text-lg">¥{{ slotProps.data.amount.toLocaleString() }}</span>
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

          <Column field="orderDate" header="订单日期" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">{{ formatDate(slotProps.data.orderDate) }}</span>
            </template>
          </Column>

          <Column header="操作" class="w-40">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  outlined
                  rounded
                  size="small"
                  @click="viewOrder(slotProps.data)"
                />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  size="small"
                  @click="editOrder(slotProps.data)"
                />
                <Button
                  v-tooltip="'删除'"
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
      </template>
    </Card>

    <!-- 订单详情/编辑对话框 -->
    <Dialog
      v-model:visible="showOrderModal"
      :header="modalTitle"
      modal
      :style="{ width: '800px' }"
      class="p-fluid"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">订单号</label>
            <InputText
              v-model="currentOrder.orderNo"
              placeholder="系统自动生成"
              :disabled="isEditing"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">客户名称</label>
            <Dropdown
              v-model="currentOrder.customerName"
              :options="customerOptions"
              option-label="label"
              option-value="value"
              placeholder="选择客户"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">订单金额</label>
            <InputNumber
              v-model="currentOrder.amount"
              mode="currency"
              currency="CNY"
              locale="zh-CN"
              placeholder="输入订单金额"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">订单状态</label>
            <Dropdown
              v-model="currentOrder.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="选择状态"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">订单日期</label>
            <Calendar
              v-model="currentOrder.orderDate"
              date-format="yy-mm-dd"
              placeholder="选择订单日期"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">预计交付日期</label>
            <Calendar
              v-model="currentOrder.deliveryDate"
              date-format="yy-mm-dd"
              placeholder="选择交付日期"
            />
          </div>
        </div>
            
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-color">备注</label>
          <Textarea 
            v-model="currentOrder.remarks"
            placeholder="输入订单备注"
            :rows="3"
          />
        </div>
      </div>
            
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            outlined
            @click="closeOrderModal"
          />
          <Button
            :label="isEditing ? '更新' : '创建'"
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
import { useConfirm } from 'primevue/useconfirm'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')
const dateRange = ref(null)
const pageSize = ref(10)

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
  updated_at: new Date()
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
    updated_at: new Date('2025-01-15')
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
    updated_at: new Date('2025-01-16')
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
    updated_at: new Date('2025-01-17')
  }
])

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '生产中', value: 'production' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'delivered' },
  { label: '已取消', value: 'cancelled' }
]

// 客户选项
const customerOptions = [
  { label: '苏州华智科技有限公司', value: '苏州华智科技有限公司' },
  { label: '上海浦东制造有限公司', value: '上海浦东制造有限公司' },
  { label: '北京智能设备有限公司', value: '北京智能设备有限公司' }
]

// 计算属性
const filteredOrders = computed(() => {
  let result = orders.value
  
  if (searchKeyword.value) {
    result = result.filter(order =>
      order.orderNo.toLowerCase().includes(searchKeyword.value.toLowerCase())
      || order.customerName.toLowerCase().includes(searchKeyword.value.toLowerCase())
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
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    pending: 'warn',
    confirmed: 'info',
    production: 'secondary',
    shipped: 'success',
    delivered: 'success',
    cancelled: 'danger'
  }
  return severityMap[status] || 'secondary'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedStatus.value = ''
  dateRange.value = null
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
    updated_at: new Date()
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

const confirmDelete = (order: any) => {
  confirm.require({
    message: `确定要删除订单 "${order.orderNo}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteOrder(order.id)
    }
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
  }
  catch (error) {
    console.error('删除订单失败:', error)
  }
  finally {
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
          updated_at: new Date()
        }
      }
    }
    else {
      // 创建新订单
      const newOrder = {
        ...currentOrder.value,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date()
      }
      orders.value.push(newOrder)
    }
    
    closeOrderModal()
  }
  catch (error) {
    console.error('保存订单失败:', error)
  }
  finally {
    saving.value = false
  }
}

const closeOrderModal = () => {
  showOrderModal.value = false
  isEditing.value = false
}
</script>
