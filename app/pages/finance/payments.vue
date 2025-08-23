<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">财务支付</h1>
        <p class="text-muted-color">管理付款记录和支付流程</p>
      </div>
      <Button
        label="新建支付"
        icon="pi pi-plus"
        @click="openPaymentModal"
      />
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">搜索</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchKeyword"
                placeholder="搜索单号、供应商..."
                class="w-full"
              />
            </span>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">支付状态</label>
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
            <label class="text-sm font-medium text-color">支付方式</label>
            <Dropdown
              v-model="selectedMethod"
              :options="methodOptions"
              option-label="label"
              option-value="value"
              placeholder="全部方式"
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
              <div class="text-2xl font-bold text-blue-600 mb-1">{{ filteredPayments.length }}</div>
              <div class="text-sm text-blue-700">总支付数</div>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="pi pi-credit-card text-blue-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-orange-600 mb-1">{{ pendingPaymentsCount }}</div>
              <div class="text-sm text-orange-700">待支付</div>
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
            
    <!-- 支付列表 -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-color">支付列表</h3>
          <span class="text-sm text-muted-color">总金额: ¥{{ totalAmount.toLocaleString() }}</span>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="filteredPayments"
          :loading="loading"
          :paginator="true"
          :rows="pageSize"
          :total-records="filteredPayments.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-credit-card text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无支付记录</h3>
              <p class="mb-4">开始创建您的第一个支付记录</p>
              <Button
                label="新建支付"
                icon="pi pi-plus"
                @click="openPaymentModal"
              />
            </div>
          </template>

          <Column field="paymentNo" header="支付单号" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono bg-surface-100 px-2 py-1 rounded text-primary text-sm">{{ slotProps.data.paymentNo }}</span>
            </template>
          </Column>

          <Column field="supplier" header="供应商" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :label="slotProps.data.supplier.charAt(0)"
                  shape="circle"
                  size="normal"
                  class="bg-primary-100 text-primary"
                />
                <span class="font-medium text-color">{{ slotProps.data.supplier }}</span>
              </div>
            </template>
          </Column>

          <Column field="amount" header="支付金额" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-green-600 text-lg">¥{{ slotProps.data.amount.toLocaleString() }}</span>
            </template>
          </Column>

          <Column field="paymentMethod" header="支付方式" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getMethodText(slotProps.data.paymentMethod)"
                :severity="getMethodSeverity(slotProps.data.paymentMethod)"
              />
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

          <Column field="paymentDate" header="支付日期" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">{{ formatDate(slotProps.data.paymentDate) }}</span>
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
                  @click="viewPayment(slotProps.data)"
                />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  size="small"
                  @click="editPayment(slotProps.data)"
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

    <!-- 支付详情/编辑对话框 -->
    <Dialog
      v-model:visible="showPaymentModal"
      :header="modalTitle"
      modal
      :style="{ width: '700px' }"
      class="p-fluid"
    >
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">支付单号</label>
            <InputText
              v-model="currentPayment.paymentNo"
              placeholder="自动生成"
              :disabled="isEditing"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">供应商</label>
            <Dropdown
              v-model="currentPayment.supplier"
              :options="supplierOptions"
              option-label="label"
              option-value="value"
              placeholder="选择供应商"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">支付金额</label>
            <InputNumber
              v-model="currentPayment.amount"
              mode="currency"
              currency="CNY"
              locale="zh-CN"
              placeholder="输入支付金额"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">支付方式</label>
            <Dropdown
              v-model="currentPayment.paymentMethod"
              :options="methodOptions"
              option-label="label"
              option-value="value"
              placeholder="选择支付方式"
            />
          </div>
        </div>
            
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">支付日期</label>
            <Calendar
              v-model="currentPayment.paymentDate"
              date-format="yy-mm-dd"
              placeholder="选择支付日期"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">状态</label>
            <Dropdown
              v-model="currentPayment.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="选择状态"
            />
          </div>
        </div>
            
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-color">描述</label>
          <Textarea 
            v-model="currentPayment.description"
            placeholder="输入支付描述"
            :rows="3"
          />
        </div>
      </div>
            
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            outlined
            @click="closePaymentModal"
          />
          <Button
            :label="isEditing ? '更新' : '创建'"
            :loading="saving"
            @click="savePayment"
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
const selectedMethod = ref('')
const dateRange = ref(null)
const pageSize = ref(10)

// 对话框状态
const showPaymentModal = ref(false)
const isEditing = ref(false)
const confirm = useConfirm()

// 当前编辑的支付记录
const currentPayment = ref({
  id: '',
  paymentNo: '',
  supplier: '',
  amount: 0,
  paymentMethod: 'bank_transfer',
  status: 'pending',
  paymentDate: new Date(),
  description: '',
  created_at: new Date(),
  updated_at: new Date()
})

// 模拟支付数据
const payments = ref([
  {
    id: '1',
    paymentNo: 'PAY-2025-001',
    supplier: '钢材供应商A',
    amount: 125420,
    paymentMethod: 'bank_transfer',
    status: 'completed',
    paymentDate: new Date('2025-01-15'),
    description: '采购钢材货款',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15')
  },
  {
    id: '2',
    paymentNo: 'PAY-2025-002',
    supplier: '电子器件供应商B',
    amount: 89500,
    paymentMethod: 'credit_card',
    status: 'pending',
    paymentDate: new Date('2025-01-16'),
    description: '电子元件采购',
    created_at: new Date('2025-01-16'),
    updated_at: new Date('2025-01-16')
  },
  {
    id: '3',
    paymentNo: 'PAY-2025-003',
    supplier: '物流公司C',
    amount: 15600,
    paymentMethod: 'alipay',
    status: 'processing',
    paymentDate: new Date('2025-01-17'),
    description: '运输费用',
    created_at: new Date('2025-01-17'),
    updated_at: new Date('2025-01-17')
  }
])

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待支付', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

// 支付方式选项
const methodOptions = [
  { label: '全部方式', value: '' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '信用卡', value: 'credit_card' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信支付', value: 'wechat_pay' },
  { label: '现金', value: 'cash' }
]

// 供应商选项
const supplierOptions = [
  { label: '钢材供应商A', value: '钢材供应商A' },
  { label: '电子器件供应商B', value: '电子器件供应商B' },
  { label: '物流公司C', value: '物流公司C' }
]

// 计算属性
const filteredPayments = computed(() => {
  let result = payments.value
  
  if (searchKeyword.value) {
    result = result.filter(payment =>
      payment.paymentNo.toLowerCase().includes(searchKeyword.value.toLowerCase())
      || payment.supplier.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (selectedStatus.value) {
    result = result.filter(payment => payment.status === selectedStatus.value)
  }
  
  if (selectedMethod.value) {
    result = result.filter(payment => payment.paymentMethod === selectedMethod.value)
  }
  
  return result
})

const pendingPaymentsCount = computed(() => {
  return payments.value.filter(p => p.status === 'pending').length
})

const totalAmount = computed(() => {
  return filteredPayments.value.reduce((sum, payment) => sum + payment.amount, 0)
})

const modalTitle = computed(() => {
  return isEditing.value ? '编辑支付' : '新建支付'
})

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待支付',
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

const getMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    bank_transfer: '银行转账',
    credit_card: '信用卡',
    alipay: '支付宝',
    wechat_pay: '微信支付',
    cash: '现金'
  }
  return methodMap[method] || method
}

const getMethodSeverity = (method: string) => {
  const severityMap: Record<string, string> = {
    bank_transfer: 'info',
    credit_card: 'warn',
    alipay: 'success',
    wechat_pay: 'success',
    cash: 'secondary'
  }
  return severityMap[method] || 'secondary'
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
  selectedMethod.value = ''
  dateRange.value = null
}

const openPaymentModal = () => {
  isEditing.value = false
  currentPayment.value = {
    id: '',
    paymentNo: `PAY-${new Date().getFullYear()}-${String(payments.value.length + 1).padStart(3, '0')}`,
    supplier: '',
    amount: 0,
    paymentMethod: 'bank_transfer',
    status: 'pending',
    paymentDate: new Date(),
    description: '',
    created_at: new Date(),
    updated_at: new Date()
  }
  showPaymentModal.value = true
}

const editPayment = (payment: any) => {
  isEditing.value = true
  currentPayment.value = { ...payment }
  showPaymentModal.value = true
}

const viewPayment = (payment: any) => {
  editPayment(payment)
  // 可以设置为只读模式
}

const confirmDelete = (payment: any) => {
  confirm.require({
    message: `确定要删除支付记录 "${payment.paymentNo}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deletePayment(payment.id)
    }
  })
}

const deletePayment = async (paymentId: string) => {
  try {
    loading.value = true
    // 模拟删除操作
    const index = payments.value.findIndex(p => p.id === paymentId)
    if (index !== -1) {
      payments.value.splice(index, 1)
    }
  }
  catch (error) {
    console.error('删除支付记录失败:', error)
  }
  finally {
    loading.value = false
  }
}

const savePayment = async () => {
  try {
    saving.value = true
    
    if (isEditing.value) {
      // 更新支付记录
      const index = payments.value.findIndex(p => p.id === currentPayment.value.id)
      if (index !== -1) {
        payments.value[index] = {
          ...currentPayment.value,
          updated_at: new Date()
        }
      }
    }
    else {
      // 创建新支付记录
      const newPayment = {
        ...currentPayment.value,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date()
      }
      payments.value.push(newPayment)
    }
    
    closePaymentModal()
  }
  catch (error) {
    console.error('保存支付记录失败:', error)
  }
  finally {
    saving.value = false
  }
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  isEditing.value = false
}
</script>
