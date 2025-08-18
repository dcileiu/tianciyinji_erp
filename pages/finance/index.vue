<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        财务管理
      </h1>
      <div class="flex gap-2">
        <UButton icon="i-heroicons-chart-bar" variant="outline" @click="showReportsModal = true">
          财务报表
        </UButton>
      </div>
    </div>

    <!-- 财务概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <Icon name="i-heroicons-arrow-trending-up" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              应收账款
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(overview.receivables_total) }}
            </p>
            <p class="text-sm text-red-600">
              逾期: {{ formatCurrency(overview.receivables_overdue) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <Icon name="i-heroicons-arrow-trending-down" class="w-6 h-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              应付账款
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(overview.payables_total) }}
            </p>
            <p class="text-sm text-red-600">
              逾期: {{ formatCurrency(overview.payables_overdue) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Icon name="i-heroicons-banknotes" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              本月收款
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(overview.monthly_received) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Icon name="i-heroicons-credit-card" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              本月付款
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(overview.monthly_paid) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <UTabs v-model="activeTab" :items="tabs" class="mb-6">
      <!-- 应收账款 -->
      <template #receivables>
        <div class="space-y-4">
          <!-- 搜索和筛选 -->
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <UInput
                v-model="receivablesSearch"
                placeholder="搜索客户、订单号或发票号..."
                icon="i-heroicons-magnifying-glass"
                @input="debouncedReceivablesSearch"
              />
              <USelect
                v-model="receivablesCustomerFilter"
                :options="customerOptions"
                placeholder="选择客户"
                @change="loadReceivables"
              />
              <USelect
                v-model="receivablesStatusFilter"
                :options="receivablesStatusOptions"
                placeholder="状态筛选"
                @change="loadReceivables"
              />
              <UInput
                v-model="receivablesDateRange.start"
                type="date"
                placeholder="开始日期"
                @change="loadReceivables"
              />
              <UInput
                v-model="receivablesDateRange.end"
                type="date"
                placeholder="结束日期"
                @change="loadReceivables"
              />
            </div>
          </div>

          <!-- 应收账款列表 -->
          <div class="bg-white rounded-lg shadow">
            <UTable
              :rows="receivables"
              :columns="receivablesColumns"
              :loading="receivablesLoading"
              class="w-full"
            >
              <template #status-data="{ row }">
                <UBadge
                  :color="row.status_color"
                  :label="row.status_text"
                />
              </template>

              <template #total_amount-data="{ row }">
                {{ formatCurrency(row.total_amount) }}
              </template>

              <template #paid_amount-data="{ row }">
                {{ formatCurrency(row.paid_amount) }}
              </template>

              <template #outstanding_amount-data="{ row }">
                <span class="font-medium">
                  {{ formatCurrency(row.total_amount - row.paid_amount) }}
                </span>
              </template>

              <template #due_date-data="{ row }">
                <div>
                  {{ formatDate(row.due_date) }}
                  <span v-if="row.overdue_days > 0" class="text-red-600 text-sm block">
                    逾期 {{ row.overdue_days }} 天
                  </span>
                </div>
              </template>

              <template #actions-data="{ row }">
                <div class="flex gap-2">
                  <UButton
                    icon="i-heroicons-banknotes"
                    size="xs"
                    :disabled="row.status === 'paid'"
                    @click="recordReceivablePayment(row)"
                  >
                    收款
                  </UButton>
                </div>
              </template>
            </UTable>

            <!-- 分页 -->
            <div class="flex justify-between items-center p-4 border-t">
              <span class="text-sm text-gray-500">
                共 {{ receivablesPagination.total }} 条记录
              </span>
              <UPagination
                v-model="receivablesPagination.page"
                :page-count="receivablesPagination.limit"
                :total="receivablesPagination.total"
                @update:model-value="loadReceivables"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 应付账款 -->
      <template #payables>
        <div class="space-y-4">
          <!-- 搜索和筛选 -->
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
              <UInput
                v-model="payablesSearch"
                placeholder="搜索供应商、订单号或发票号..."
                icon="i-heroicons-magnifying-glass"
                @input="debouncedPayablesSearch"
              />
              <USelect
                v-model="payablesSupplierFilter"
                :options="supplierOptions"
                placeholder="选择供应商"
                @change="loadPayables"
              />
              <USelect
                v-model="payablesStatusFilter"
                :options="payablesStatusOptions"
                placeholder="状态筛选"
                @change="loadPayables"
              />
              <UInput
                v-model="payablesDateRange.start"
                type="date"
                placeholder="开始日期"
                @change="loadPayables"
              />
              <UInput
                v-model="payablesDateRange.end"
                type="date"
                placeholder="结束日期"
                @change="loadPayables"
              />
            </div>
          </div>

          <!-- 应付账款列表 -->
          <div class="bg-white rounded-lg shadow">
            <UTable
              :rows="payables"
              :columns="payablesColumns"
              :loading="payablesLoading"
              class="w-full"
            >
              <template #status-data="{ row }">
                <UBadge
                  :color="row.status_color"
                  :label="row.status_text"
                />
              </template>

              <template #total_amount-data="{ row }">
                {{ formatCurrency(row.total_amount) }}
              </template>

              <template #paid_amount-data="{ row }">
                {{ formatCurrency(row.paid_amount) }}
              </template>

              <template #outstanding_amount-data="{ row }">
                <span class="font-medium">
                  {{ formatCurrency(row.total_amount - row.paid_amount) }}
                </span>
              </template>

              <template #due_date-data="{ row }">
                <div>
                  {{ formatDate(row.due_date) }}
                  <span v-if="row.overdue_days > 0" class="text-red-600 text-sm block">
                    逾期 {{ row.overdue_days }} 天
                  </span>
                </div>
              </template>

              <template #actions-data="{ row }">
                <div class="flex gap-2">
                  <UButton
                    icon="i-heroicons-credit-card"
                    size="xs"
                    :disabled="row.status === 'paid'"
                    @click="recordPayablePayment(row)"
                  >
                    付款
                  </UButton>
                </div>
              </template>
            </UTable>

            <!-- 分页 -->
            <div class="flex justify-between items-center p-4 border-t">
              <span class="text-sm text-gray-500">
                共 {{ payablesPagination.total }} 条记录
              </span>
              <UPagination
                v-model="payablesPagination.page"
                :page-count="payablesPagination.limit"
                :total="payablesPagination.total"
                @update:model-value="loadPayables"
              />
            </div>
          </div>
        </div>
      </template>
    </UTabs>

    <!-- 收款记录模态框 -->
    <UModal v-model="showReceivablePaymentModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            记录收款
          </h3>
        </template>

        <UForm :schema="paymentSchema" :state="receivablePaymentForm" @submit="submitReceivablePayment">
          <div class="space-y-4">
            <div v-if="selectedReceivable" class="p-3 bg-gray-50 rounded">
              <div class="text-sm">
                <div><strong>客户:</strong> {{ selectedReceivable.customer_name }}</div>
                <div><strong>订单号:</strong> {{ selectedReceivable.order_number }}</div>
                <div><strong>应收金额:</strong> {{ formatCurrency(selectedReceivable.total_amount) }}</div>
                <div><strong>已收金额:</strong> {{ formatCurrency(selectedReceivable.paid_amount) }}</div>
                <div><strong>未收金额:</strong> {{ formatCurrency(selectedReceivable.total_amount - selectedReceivable.paid_amount) }}</div>
              </div>
            </div>

            <UFormGroup label="收款金额" name="amount">
              <UInput
                v-model="receivablePaymentForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                :max="selectedReceivable ? selectedReceivable.total_amount - selectedReceivable.paid_amount : undefined"
                placeholder="输入收款金额"
              />
            </UFormGroup>

            <UFormGroup label="付款方式" name="payment_method">
              <USelect
                v-model="receivablePaymentForm.payment_method"
                :options="paymentMethodOptions"
                placeholder="选择付款方式"
              />
            </UFormGroup>

            <UFormGroup label="收款日期" name="payment_date">
              <UInput
                v-model="receivablePaymentForm.payment_date"
                type="date"
              />
            </UFormGroup>

            <UFormGroup label="参考号" name="reference_number">
              <UInput
                v-model="receivablePaymentForm.reference_number"
                placeholder="银行流水号、支票号等（可选）"
              />
            </UFormGroup>

            <UFormGroup label="备注" name="notes">
              <UTextarea
                v-model="receivablePaymentForm.notes"
                placeholder="收款备注（可选）"
              />
            </UFormGroup>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton variant="outline" @click="showReceivablePaymentModal = false">
              取消
            </UButton>
            <UButton type="submit" :loading="submitting">
              确认收款
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- 付款记录模态框 -->
    <UModal v-model="showPayablePaymentModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            记录付款
          </h3>
        </template>

        <UForm :schema="paymentSchema" :state="payablePaymentForm" @submit="submitPayablePayment">
          <div class="space-y-4">
            <div v-if="selectedPayable" class="p-3 bg-gray-50 rounded">
              <div class="text-sm">
                <div><strong>供应商:</strong> {{ selectedPayable.supplier_name }}</div>
                <div><strong>订单号:</strong> {{ selectedPayable.order_number }}</div>
                <div><strong>应付金额:</strong> {{ formatCurrency(selectedPayable.total_amount) }}</div>
                <div><strong>已付金额:</strong> {{ formatCurrency(selectedPayable.paid_amount) }}</div>
                <div><strong>未付金额:</strong> {{ formatCurrency(selectedPayable.total_amount - selectedPayable.paid_amount) }}</div>
              </div>
            </div>

            <UFormGroup label="付款金额" name="amount">
              <UInput
                v-model="payablePaymentForm.amount"
                type="number"
                step="0.01"
                min="0.01"
                :max="selectedPayable ? selectedPayable.total_amount - selectedPayable.paid_amount : undefined"
                placeholder="输入付款金额"
              />
            </UFormGroup>

            <UFormGroup label="付款方式" name="payment_method">
              <USelect
                v-model="payablePaymentForm.payment_method"
                :options="paymentMethodOptions"
                placeholder="选择付款方式"
              />
            </UFormGroup>

            <UFormGroup label="付款日期" name="payment_date">
              <UInput
                v-model="payablePaymentForm.payment_date"
                type="date"
              />
            </UFormGroup>

            <UFormGroup label="参考号" name="reference_number">
              <UInput
                v-model="payablePaymentForm.reference_number"
                placeholder="银行流水号、支票号等（可选）"
              />
            </UFormGroup>

            <UFormGroup label="备注" name="notes">
              <UTextarea
                v-model="payablePaymentForm.notes"
                placeholder="付款备注（可选）"
              />
            </UFormGroup>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton variant="outline" @click="showPayablePaymentModal = false">
              取消
            </UButton>
            <UButton type="submit" :loading="submitting">
              确认付款
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- 财务报表模态框 -->
    <UModal v-model="showReportsModal" :ui="{ width: 'sm:max-w-6xl' }">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            财务报表
          </h3>
        </template>

        <div class="space-y-6">
          <!-- 报表筛选 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UInput
              v-model="reportDateRange.start"
              type="date"
              placeholder="开始日期"
            />
            <UInput
              v-model="reportDateRange.end"
              type="date"
              placeholder="结束日期"
            />
            <UButton :loading="reportLoading" @click="loadFinancialReport">
              生成报表
            </UButton>
          </div>

          <!-- 报表内容 -->
          <div v-if="financialReport" class="space-y-6">
            <!-- 损益概览 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-medium text-green-800">
                  销售收入
                </h4>
                <p class="text-2xl font-bold text-green-900">
                  {{ formatCurrency(financialReport.sales.confirmed_amount) }}
                </p>
                <p class="text-sm text-green-600">
                  {{ financialReport.sales.confirmed_orders }} 笔订单
                </p>
              </div>

              <div class="bg-red-50 p-4 rounded-lg">
                <h4 class="font-medium text-red-800">
                  采购成本
                </h4>
                <p class="text-2xl font-bold text-red-900">
                  {{ formatCurrency(financialReport.purchase.confirmed_amount) }}
                </p>
                <p class="text-sm text-red-600">
                  {{ financialReport.purchase.confirmed_orders }} 笔订单
                </p>
              </div>

              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-medium text-blue-800">
                  毛利润
                </h4>
                <p class="text-2xl font-bold text-blue-900">
                  {{ formatCurrency(financialReport.profit_loss.gross_profit) }}
                </p>
                <p class="text-sm text-blue-600">
                  毛利率: {{ financialReport.profit_loss.gross_profit_margin }}
                </p>
              </div>

              <div class="bg-purple-50 p-4 rounded-lg">
                <h4 class="font-medium text-purple-800">
                  净现金流
                </h4>
                <p class="text-2xl font-bold text-purple-900">
                  {{ formatCurrency(financialReport.cash_flow.net_cash_flow) }}
                </p>
                <p class="text-sm text-purple-600">
                  收入: {{ formatCurrency(financialReport.cash_flow.cash_in) }} |
                  支出: {{ formatCurrency(financialReport.cash_flow.cash_out) }}
                </p>
              </div>
            </div>

            <!-- 应收应付概览 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white border rounded-lg p-4">
                <h4 class="font-medium text-gray-800 mb-3">
                  应收账款概览
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>总应收:</span>
                    <span class="font-medium">{{ formatCurrency(financialReport.receivables.total_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>已收:</span>
                    <span class="font-medium text-green-600">{{ formatCurrency(financialReport.receivables.paid_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>未收:</span>
                    <span class="font-medium text-yellow-600">{{ formatCurrency(financialReport.receivables.outstanding_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>逾期:</span>
                    <span class="font-medium text-red-600">{{ formatCurrency(financialReport.receivables.overdue_amount) }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-white border rounded-lg p-4">
                <h4 class="font-medium text-gray-800 mb-3">
                  应付账款概览
                </h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>总应付:</span>
                    <span class="font-medium">{{ formatCurrency(financialReport.payables.total_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>已付:</span>
                    <span class="font-medium text-green-600">{{ formatCurrency(financialReport.payables.paid_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>未付:</span>
                    <span class="font-medium text-yellow-600">{{ formatCurrency(financialReport.payables.outstanding_amount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>逾期:</span>
                    <span class="font-medium text-red-600">{{ formatCurrency(financialReport.payables.overdue_amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton variant="outline" @click="showReportsModal = false">
              关闭
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { z } from 'zod'
import { debounce } from 'lodash-es'

definePageMeta({
  middleware: 'auth'
})

// 表单验证模式
const paymentSchema = z.object({
  amount: z.number().positive('金额必须大于0'),
  payment_method: z.enum(['cash', 'bank_transfer', 'check', 'other'], {
    message: '请选择付款方式'
  }),
  payment_date: z.string().min(1, '请选择付款日期'),
  reference_number: z.string().optional(),
  notes: z.string().optional()
})

// 响应式数据
const activeTab = ref(0)
const receivables = ref([])
const payables = ref([])
const customers = ref([])
const suppliers = ref([])
const financialReport = ref(null)
const receivablesLoading = ref(false)
const payablesLoading = ref(false)
const reportLoading = ref(false)
const submitting = ref(false)
const showReceivablePaymentModal = ref(false)
const showPayablePaymentModal = ref(false)
const showReportsModal = ref(false)
const selectedReceivable = ref(null)
const selectedPayable = ref(null)

// 搜索和筛选
const receivablesSearch = ref('')
const receivablesCustomerFilter = ref('')
const receivablesStatusFilter = ref('')
const receivablesDateRange = ref({ start: '', end: '' })
const payablesSearch = ref('')
const payablesSupplierFilter = ref('')
const payablesStatusFilter = ref('')
const payablesDateRange = ref({ start: '', end: '' })
const reportDateRange = ref({ start: '', end: '' })

// 概览数据
const overview = ref({
  receivables_total: 0,
  receivables_overdue: 0,
  payables_total: 0,
  payables_overdue: 0,
  monthly_received: 0,
  monthly_paid: 0
})

// 分页数据
const receivablesPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const payablesPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// 表单数据
const receivablePaymentForm = ref({
  amount: 0,
  payment_method: '',
  payment_date: new Date().toISOString().split('T')[0],
  reference_number: '',
  notes: ''
})

const payablePaymentForm = ref({
  amount: 0,
  payment_method: '',
  payment_date: new Date().toISOString().split('T')[0],
  reference_number: '',
  notes: ''
})

// 标签页配置
const tabs = [
  { key: 'receivables', label: '应收账款' },
  { key: 'payables', label: '应付账款' }
]

// 表格列定义
const receivablesColumns = [
  { key: 'customer_name', label: '客户' },
  { key: 'order_number', label: '订单号' },
  { key: 'invoice_number', label: '发票号' },
  { key: 'total_amount', label: '应收金额' },
  { key: 'paid_amount', label: '已收金额' },
  { key: 'outstanding_amount', label: '未收金额' },
  { key: 'due_date', label: '到期日期' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

const payablesColumns = [
  { key: 'supplier_name', label: '供应商' },
  { key: 'order_number', label: '订单号' },
  { key: 'invoice_number', label: '发票号' },
  { key: 'total_amount', label: '应付金额' },
  { key: 'paid_amount', label: '已付金额' },
  { key: 'outstanding_amount', label: '未付金额' },
  { key: 'due_date', label: '到期日期' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

// 选项数据
const receivablesStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '待收款', value: 'pending' },
  { label: '部分收款', value: 'partial' },
  { label: '已收款', value: 'paid' },
  { label: '逾期', value: 'overdue' }
]

const payablesStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '待付款', value: 'pending' },
  { label: '部分付款', value: 'partial' },
  { label: '已付款', value: 'paid' },
  { label: '逾期', value: 'overdue' }
]

const paymentMethodOptions = [
  { label: '现金', value: 'cash' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '支票', value: 'check' },
  { label: '其他', value: 'other' }
]

// 计算属性
const customerOptions = computed(() => [
  { label: '全部客户', value: '' },
  ...customers.value.map(customer => ({
    label: customer.name,
    value: customer.id
  }))
])

const supplierOptions = computed(() => [
  { label: '全部供应商', value: '' },
  ...suppliers.value.map(supplier => ({
    label: supplier.name,
    value: supplier.id
  }))
])

// 防抖搜索
const debouncedReceivablesSearch = debounce(() => {
  receivablesPagination.value.page = 1
  loadReceivables()
}, 300)

const debouncedPayablesSearch = debounce(() => {
  payablesPagination.value.page = 1
  loadPayables()
}, 300)

// 方法
const loadReceivables = async () => {
  receivablesLoading.value = true
  try {
    const { data } = await $fetch('/api/finance/receivables', {
      query: {
        page: receivablesPagination.value.page,
        limit: receivablesPagination.value.limit,
        search: receivablesSearch.value,
        customer_id: receivablesCustomerFilter.value,
        status: receivablesStatusFilter.value,
        start_date: receivablesDateRange.value.start,
        end_date: receivablesDateRange.value.end
      }
    })

    receivables.value = data.data
    receivablesPagination.value = data.pagination
  } catch (error) {
    console.error('加载应收账款失败:', error)
  } finally {
    receivablesLoading.value = false
  }
}

const loadPayables = async () => {
  payablesLoading.value = true
  try {
    const { data } = await $fetch('/api/finance/payables', {
      query: {
        page: payablesPagination.value.page,
        limit: payablesPagination.value.limit,
        search: payablesSearch.value,
        supplier_id: payablesSupplierFilter.value,
        status: payablesStatusFilter.value,
        start_date: payablesDateRange.value.start,
        end_date: payablesDateRange.value.end
      }
    })

    payables.value = data.data
    payablesPagination.value = data.pagination
  } catch (error) {
    console.error('加载应付账款失败:', error)
  } finally {
    payablesLoading.value = false
  }
}

const loadCustomers = async () => {
  try {
    const { data } = await $fetch('/api/customers', {
      query: { limit: 1000 }
    })
    customers.value = data.data
  } catch (error) {
    console.error('加载客户失败:', error)
  }
}

const loadSuppliers = async () => {
  try {
    const { data } = await $fetch('/api/suppliers', {
      query: { limit: 1000 }
    })
    suppliers.value = data.data
  } catch (error) {
    console.error('加载供应商失败:', error)
  }
}

const loadFinancialReport = async () => {
  reportLoading.value = true
  try {
    const { data } = await $fetch('/api/finance/reports', {
      query: {
        start_date: reportDateRange.value.start,
        end_date: reportDateRange.value.end
      }
    })
    financialReport.value = data
  } catch (error) {
    console.error('加载财务报表失败:', error)
  } finally {
    reportLoading.value = false
  }
}

const recordReceivablePayment = (receivable) => {
  selectedReceivable.value = receivable
  receivablePaymentForm.value = {
    amount: receivable.total_amount - receivable.paid_amount,
    payment_method: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: ''
  }
  showReceivablePaymentModal.value = true
}

const recordPayablePayment = (payable) => {
  selectedPayable.value = payable
  payablePaymentForm.value = {
    amount: payable.total_amount - payable.paid_amount,
    payment_method: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: ''
  }
  showPayablePaymentModal.value = true
}

const submitReceivablePayment = async () => {
  submitting.value = true
  try {
    await $fetch(`/api/finance/receivables/${selectedReceivable.value.id}/payment`, {
      method: 'POST',
      body: receivablePaymentForm.value
    })

    showReceivablePaymentModal.value = false
    loadReceivables()

    // 显示成功消息
  } catch (error) {
    console.error('收款记录失败:', error)
    // 显示错误消息
  } finally {
    submitting.value = false
  }
}

const submitPayablePayment = async () => {
  submitting.value = true
  try {
    await $fetch(`/api/finance/payables/${selectedPayable.value.id}/payment`, {
      method: 'POST',
      body: payablePaymentForm.value
    })

    showPayablePaymentModal.value = false
    loadPayables()

    // 显示成功消息
  } catch (error) {
    console.error('付款记录失败:', error)
    // 显示错误消息
  } finally {
    submitting.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 0) {
    loadReceivables()
  } else if (newTab === 1) {
    loadPayables()
  }
})

// 生命周期
onMounted(() => {
  loadReceivables()
  loadCustomers()
  loadSuppliers()
})
</script>
