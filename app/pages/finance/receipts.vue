<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">收款单管理</h1>
        <p class="text-muted-color">管理客户收款记录和回款情况</p>
      </div>
      <Button
        label="新建收款单"
        icon="pi pi-plus"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-blue-600 mb-1">{{ receiptStats.totalReceipts }}</div>
              <div class="text-sm text-blue-700">总收款数</div>
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
              <div class="text-2xl font-bold text-orange-600 mb-1">{{ receiptStats.draftReceipts }}</div>
              <div class="text-sm text-orange-700">待确认</div>
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
              <div class="text-2xl font-bold text-green-600 mb-1">{{ receiptStats.confirmedReceipts }}</div>
              <div class="text-sm text-green-700">已确认</div>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <div class="text-2xl font-bold text-purple-600 mb-1">¥{{ formatCurrency(receiptStats.totalAmount) }}</div>
              <div class="text-sm text-purple-700">总收入</div>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-dollar text-purple-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 搜索筛选 -->
    <Card class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold text-color">搜索筛选</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">搜索</label>
            <InputText
              v-model="searchQuery"
              placeholder="单据号、客户名称..."
              class="w-full"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">状态</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              class="w-full"
              show-clear
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">收款方式</label>
            <Dropdown
              v-model="paymentMethodFilter"
              :options="paymentMethodOptions"
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
              :manual-input="false"
              placeholder="选择日期范围"
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

    <!-- 收款单列表 -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-color">收款单列表</h3>
          <span class="text-sm text-muted-color">总收入: ¥{{ formatCurrency(totalAmount) }}</span>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="filteredReceipts"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :total-records="filteredReceipts.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-file-text text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无收款单数据</h3>
              <p class="mb-4">开始创建您的第一个收款单</p>
              <Button 
                label="新建收款单"
                icon="pi pi-plus"
                @click="showCreateDialog = true"
              />
            </div>
          </template>

          <Column field="receipt_no" header="收款单号" :sortable="true">
            <template #body="slotProps">
              <div>
                <span class="font-mono bg-surface-100 px-2 py-1 rounded text-primary text-sm">
                  {{ slotProps.data.receipt_no }}
                </span>
                <div class="text-sm text-muted-color mt-1">
                  {{ formatDate(slotProps.data.receipt_date) }}
                </div>
              </div>
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

          <Column field="amount" header="收款金额" :sortable="true">
            <template #body="slotProps">
              <div>
                <span class="font-semibold text-green-600 text-lg">
                  ¥{{ formatCurrency(slotProps.data.amount) }}
                </span>
                <div class="text-sm text-muted-color">
                  {{ getPaymentMethodName(slotProps.data.payment_method) }}
                </div>
              </div>
            </template>
          </Column>

          <Column field="receiver_account" header="收款账户" :sortable="true">
            <template #body="slotProps">
              <span v-if="slotProps.data.receiver_account" class="font-mono text-sm text-muted-color">
                {{ slotProps.data.receiver_account }}
              </span>
              <span v-else class="text-muted-color">-</span>
            </template>
          </Column>

          <Column field="status" header="状态" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getStatusName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>

          <Column field="remark" header="备注" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ slotProps.data.remark || '-' }}
              </span>
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
                  @click="viewReceipt(slotProps.data)"
                />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  size="small"
                  :disabled="slotProps.data.status === 'confirmed'"
                  @click="editReceipt(slotProps.data)"
                />
                <Button
                  v-tooltip="'确认收款'"
                  icon="pi pi-check"
                  outlined
                  rounded
                  size="small"
                  :disabled="slotProps.data.status === 'confirmed'"
                  @click="confirmReceipt(slotProps.data.id)"
                />
                <Button
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  outlined
                  rounded
                  size="small"
                  severity="danger"
                  :disabled="slotProps.data.status === 'confirmed'"
                  @click="confirmDeleteReceipt(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 新建/编辑收款单对话框 -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="editingReceipt ? '编辑收款单' : '新增收款单'"
      :style="{ width: '700px' }"
      modal
      class="p-fluid"
    >
      <div class="space-y-6">
        <!-- 基本信息 -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-color border-b pb-2">基本信息</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-color">收款单号 *</label>
              <InputText
                v-model="receiptForm.receipt_no"
                placeholder="系统自动生成"
                :disabled="!!editingReceipt"
              />
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-color">收款日期 *</label>
              <Calendar
                v-model="receiptForm.receipt_date"
                placeholder="选择日期"
                class="w-full"
              />
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-color">客户 *</label>
              <Dropdown
                v-model="receiptForm.customer_id"
                :options="customers"
                option-label="name"
                option-value="id"
                placeholder="选择客户"
                filter
                class="w-full"
              />
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-color">状态 *</label>
              <Dropdown
                v-model="receiptForm.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="请选择状态"
                class="w-full"
              />
            </div>
          </div>
        </div>
            
        <!-- 收款信息 -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-color border-b pb-2">收款信息</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-color">收款金额 *</label>
              <InputNumber
                v-model="receiptForm.amount"
                :min="0"
                :fraction-digits="2"
                placeholder="0.00" 
                mode="currency"
                currency="CNY"
                locale="zh-CN"
                class="w-full"
              />
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-color">收款方式 *</label>
              <Dropdown
                v-model="receiptForm.payment_method"
                :options="paymentMethodOptions"
                option-label="label"
                option-value="value"
                placeholder="请选择方式"
                class="w-full"
              />
            </div>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">收款账户</label>
            <InputText
              v-model="receiptForm.receiver_account"
              placeholder="请输入收款账户"
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">备注</label>
            <Textarea
              v-model="receiptForm.remark"
              placeholder="请输入备注信息"
              :rows="3"
              class="w-full"
            />
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            icon="pi pi-times"
            outlined
            @click="closeCreateDialog"
          />
          <Button
            label="保存"
            icon="pi pi-check"
            :loading="saving"
            @click="saveReceipt"
          />
        </div>
      </template>
    </Dialog>
    
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '收款单管理 - ERP 管理系统'
})

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingReceipt = ref(null)

// 搜索筛选
const searchQuery = ref('')
const statusFilter = ref('')
const paymentMethodFilter = ref('')
const dateRange = ref()

// 状态选项
const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已取消', value: 'cancelled' }
])

// 收款方式选项
const paymentMethodOptions = ref([
  { label: '全部方式', value: '' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '现金', value: 'cash' },
  { label: '支票', value: 'check' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wechat' }
])

// 收款单表单
const receiptForm = ref({
  receipt_no: '',
  receipt_date: null,
  customer_id: '',
  amount: 0,
  payment_method: '',
  receiver_account: '',
  status: 'draft',
  remark: ''
})

// 模拟数据
const receipts = ref([
  {
    id: '1',
    receipt_no: 'REC202501001',
    customer_id: 'C001',
    customer_name: '苏州华智科技有限公司',
    receipt_date: '2025-01-15',
    amount: 150000,
    payment_method: 'bank_transfer',
    receiver_account: '6222021234567890',
    status: 'confirmed',
    remark: '销售订单回款',
    created_at: '2025-01-15T10:00:00Z'
  },
  {
    id: '2',
    receipt_no: 'REC202501002',
    customer_id: 'C002',
    customer_name: '上海浦东制造有限公司',
    receipt_date: '2025-01-16',
    amount: 88000,
    payment_method: 'cash',
    receiver_account: '',
    status: 'draft',
    remark: '现金收款',
    created_at: '2025-01-16T14:30:00Z'
  }
])

const customers = ref([
  { id: 'C001', name: '苏州华智科技有限公司' },
  { id: 'C002', name: '上海浦东制造有限公司' },
  { id: 'C003', name: '北京智能设备有限公司' }
])

const receiptStats = ref({
  totalReceipts: 189,
  draftReceipts: 12,
  confirmedReceipts: 165,
  totalAmount: 3280000
})

// 计算属性
const filteredReceipts = computed(() => {
  let result = receipts.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(receipt =>
      receipt.receipt_no.toLowerCase().includes(query)
      || receipt.customer_name.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    result = result.filter(receipt => receipt.status === statusFilter.value)
  }
  
  if (paymentMethodFilter.value) {
    result = result.filter(receipt => receipt.payment_method === paymentMethodFilter.value)
  }
  
  return result
})

const totalAmount = computed(() => {
  return filteredReceipts.value.reduce((sum, receipt) => sum + receipt.amount, 0)
})

// 工具函数
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN').format(amount || 0)
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

const getStatusName = (status: string) => {
  const nameMap: Record<string, string> = {
    draft: '草稿',
    confirmed: '已确认',
    cancelled: '已取消'
  }
  return nameMap[status] || status
}

const getPaymentMethodName = (method: string) => {
  const nameMap: Record<string, string> = {
    cash: '现金',
    bank_transfer: '银行转账',
    check: '支票',
    alipay: '支付宝',
    wechat: '微信',
    other: '其他'
  }
  return nameMap[method] || method
}

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    draft: 'warn',
    confirmed: 'success',
    cancelled: 'danger'
  }
  return severityMap[status] || 'secondary'
}

// Confirm dialog
const confirm = useConfirm()

// 收款单操作
const viewReceipt = (receipt: any) => {
  console.log('查看收款单:', receipt)
}

const editReceipt = (receipt: any) => {
  editingReceipt.value = receipt
  Object.assign(receiptForm.value, receipt)
  showCreateDialog.value = true
}

const confirmReceipt = async (id: string) => {
  try {
    console.log('确认收款单:', id)
    const receipt = receipts.value.find(r => r.id === id)
    if (receipt) {
      receipt.status = 'confirmed'
    }
  } catch (err) {
    console.error('确认收款单失败:', err)
  }
}

const deleteReceipt = async (id: string) => {
  try {
    console.log('删除收款单:', id)
    receipts.value = receipts.value.filter(receipt => receipt.id !== id)
  } catch (err) {
    console.error('删除收款单失败:', err)
  }
}

const confirmDeleteReceipt = (receipt: any) => {
  confirm.require({
    message: `确定要删除收款单 ${receipt.receipt_no} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteReceipt(receipt.id)
    }
  })
}

// 对话框操作
const closeCreateDialog = () => {
  showCreateDialog.value = false
  editingReceipt.value = null
  receiptForm.value = {
    receipt_no: '',
    receipt_date: null,
    customer_id: '',
    amount: 0,
    payment_method: '',
    receiver_account: '',
    status: 'draft',
    remark: ''
  }
}

const saveReceipt = async () => {
  saving.value = true
  try {
    console.log('保存收款单:', receiptForm.value)
    await new Promise(resolve => setTimeout(resolve, 1000))
    closeCreateDialog()
  } catch (err) {
    console.error('保存收款单失败:', err)
  } finally {
    saving.value = false
  }
}

// 其他操作
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  paymentMethodFilter.value = ''
  dateRange.value = null
}

// 初始化数据
onMounted(() => {
  // 初始化逻辑
})
</script>
