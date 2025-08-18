<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        库存管理
      </h1>
      <UButton icon="i-heroicons-adjustments-horizontal" size="sm" @click="showAdjustModal = true">
        库存调整
      </UButton>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="搜索产品名称或SKU..."
          icon="i-heroicons-magnifying-glass"
          @input="debouncedSearch"
        />
        <USelect
          v-model="categoryFilter"
          :options="categoryOptions"
          placeholder="选择分类"
          @change="loadInventory"
        />
        <USelect
          v-model="stockStatusFilter"
          :options="stockStatusOptions"
          placeholder="库存状态"
          @change="loadInventory"
        />
        <UButton variant="outline" icon="i-heroicons-arrow-path" @click="resetFilters">
          重置
        </UButton>
        <UButton variant="outline" icon="i-heroicons-list-bullet" @click="showTransactionsModal = true">
          变动记录
        </UButton>
      </div>
    </div>

    <!-- 库存统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Icon name="i-heroicons-cube" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              总产品数
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.totalProducts }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <Icon name="i-heroicons-currency-dollar" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              库存总价值
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatCurrency(stats.totalValue) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <Icon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              库存不足
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.lowStockCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <Icon name="i-heroicons-x-circle" class="w-6 h-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              缺货产品
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.outOfStockCount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 库存列表 -->
    <div class="bg-white rounded-lg shadow">
      <UTable
        :rows="inventory"
        :columns="columns"
        :loading="loading"
        class="w-full"
      >
        <template #stock_status-data="{ row }">
          <UBadge
            :color="getStockStatusColor(row.stock_status)"
            :label="row.stock_status_text"
          />
        </template>

        <template #stock_quantity-data="{ row }">
          <div class="text-center">
            <span class="font-medium">{{ row.stock_quantity }}</span>
            <span class="text-gray-500 text-sm ml-1">{{ row.unit }}</span>
          </div>
        </template>

        <template #stock_levels-data="{ row }">
          <div class="text-sm">
            <div>最小: {{ row.min_stock_level }}</div>
            <div>最大: {{ row.max_stock_level }}</div>
          </div>
        </template>

        <template #cost_price-data="{ row }">
          {{ formatCurrency(row.cost_price) }}
        </template>

        <template #stock_value-data="{ row }">
          {{ formatCurrency(row.stock_value) }}
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-adjustments-horizontal"
              size="xs"
              variant="outline"
              @click="adjustStock(row)"
            />
            <UButton
              icon="i-heroicons-list-bullet"
              size="xs"
              variant="outline"
              @click="viewTransactions(row)"
            />
          </div>
        </template>
      </UTable>

      <!-- 分页 -->
      <div class="flex justify-between items-center p-4 border-t">
        <span class="text-sm text-gray-500">
          共 {{ pagination.total }} 条记录
        </span>
        <UPagination
          v-model="pagination.page"
          :page-count="pagination.limit"
          :total="pagination.total"
          @update:model-value="loadInventory"
        />
      </div>
    </div>

    <!-- 库存调整模态框 -->
    <UModal v-model="showAdjustModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            库存调整
          </h3>
        </template>

        <UForm :schema="adjustSchema" :state="adjustForm" @submit="submitAdjustment">
          <div class="space-y-4">
            <UFormGroup label="产品" name="product_id">
              <USelect
                v-model="adjustForm.product_id"
                :options="productOptions"
                placeholder="选择产品"
                @change="onProductSelect"
              />
            </UFormGroup>

            <div v-if="selectedProduct" class="p-3 bg-gray-50 rounded">
              <div class="text-sm">
                <div><strong>当前库存:</strong> {{ selectedProduct.stock_quantity }} {{ selectedProduct.unit }}</div>
                <div><strong>最小库存:</strong> {{ selectedProduct.min_stock_level }}</div>
                <div><strong>最大库存:</strong> {{ selectedProduct.max_stock_level }}</div>
              </div>
            </div>

            <UFormGroup label="调整类型" name="adjustment_type">
              <USelect
                v-model="adjustForm.adjustment_type"
                :options="adjustmentTypeOptions"
                placeholder="选择调整类型"
              />
            </UFormGroup>

            <UFormGroup label="调整数量" name="quantity">
              <UInput
                v-model="adjustForm.quantity"
                type="number"
                min="1"
                placeholder="输入调整数量"
              />
            </UFormGroup>

            <UFormGroup label="调整原因" name="reason">
              <USelect
                v-model="adjustForm.reason"
                :options="reasonOptions"
                placeholder="选择调整原因"
              />
            </UFormGroup>

            <UFormGroup label="备注" name="notes">
              <UTextarea
                v-model="adjustForm.notes"
                placeholder="调整备注（可选）"
              />
            </UFormGroup>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton variant="outline" @click="showAdjustModal = false">
              取消
            </UButton>
            <UButton type="submit" :loading="submitting">
              确认调整
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- 库存变动记录模态框 -->
    <UModal v-model="showTransactionsModal" :ui="{ width: 'sm:max-w-6xl' }">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            库存变动记录
          </h3>
        </template>

        <div class="space-y-4">
          <!-- 筛选条件 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <USelect
              v-model="transactionTypeFilter"
              :options="transactionTypeOptions"
              placeholder="交易类型"
              @change="loadTransactions"
            />
            <USelect
              v-model="transactionProductFilter"
              :options="productOptions"
              placeholder="选择产品"
              @change="loadTransactions"
            />
            <UButton variant="outline" @click="resetTransactionFilters">
              重置筛选
            </UButton>
          </div>

          <!-- 变动记录表格 -->
          <UTable
            :rows="transactions"
            :columns="transactionColumns"
            :loading="transactionLoading"
            class="w-full"
          >
            <template #transaction_type-data="{ row }">
              <UBadge
                :color="row.type_color"
                :label="row.type_text"
              />
            </template>

            <template #quantity-data="{ row }">
              <span :class="row.transaction_type.includes('out') ? 'text-red-600' : 'text-green-600'">
                {{ row.transaction_type.includes('out') ? '-' : '+' }}{{ row.quantity }}
              </span>
            </template>

            <template #total_amount-data="{ row }">
              {{ formatCurrency(row.total_amount) }}
            </template>

            <template #created_at-data="{ row }">
              {{ formatDateTime(row.created_at) }}
            </template>
          </UTable>

          <!-- 分页 -->
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">
              共 {{ transactionPagination.total }} 条记录
            </span>
            <UPagination
              v-model="transactionPagination.page"
              :page-count="transactionPagination.limit"
              :total="transactionPagination.total"
              @update:model-value="loadTransactions"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton variant="outline" @click="showTransactionsModal = false">
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
const adjustSchema = z.object({
  product_id: z.number().int().positive('请选择产品'),
  adjustment_type: z.enum(['in', 'out'], { message: '请选择调整类型' }),
  quantity: z.number().int().positive('数量必须大于0'),
  reason: z.string().min(1, '请选择调整原因'),
  notes: z.string().optional()
})

// 响应式数据
const inventory = ref([])
const transactions = ref([])
const categories = ref([])
const products = ref([])
const loading = ref(false)
const transactionLoading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('')
const stockStatusFilter = ref('')
const transactionTypeFilter = ref('')
const transactionProductFilter = ref('')
const showAdjustModal = ref(false)
const showTransactionsModal = ref(false)
const selectedProduct = ref(null)

// 统计数据
const stats = ref({
  totalProducts: 0,
  totalValue: 0,
  lowStockCount: 0,
  outOfStockCount: 0
})

// 分页数据
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const transactionPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// 表单数据
const adjustForm = ref({
  product_id: null,
  adjustment_type: '',
  quantity: 1,
  reason: '',
  notes: ''
})

// 表格列定义
const columns = [
  { key: 'name', label: '产品名称' },
  { key: 'sku', label: 'SKU' },
  { key: 'category_name', label: '分类' },
  { key: 'stock_quantity', label: '当前库存' },
  { key: 'stock_levels', label: '库存水位' },
  { key: 'stock_status', label: '库存状态' },
  { key: 'cost_price', label: '成本价' },
  { key: 'stock_value', label: '库存价值' },
  { key: 'location', label: '存放位置' },
  { key: 'actions', label: '操作' }
]

const transactionColumns = [
  { key: 'product_name', label: '产品名称' },
  { key: 'transaction_type', label: '交易类型' },
  { key: 'quantity', label: '数量变化' },
  { key: 'total_amount', label: '金额' },
  { key: 'reason', label: '原因' },
  { key: 'notes', label: '备注' },
  { key: 'created_at', label: '时间' }
]

// 选项数据
const stockStatusOptions = [
  { label: '全部状态', value: '' },
  { label: '库存不足', value: 'true' }
]

const adjustmentTypeOptions = [
  { label: '入库', value: 'in' },
  { label: '出库', value: 'out' }
]

const reasonOptions = [
  { label: '盘点调整', value: '盘点调整' },
  { label: '损耗报废', value: '损耗报废' },
  { label: '退货入库', value: '退货入库' },
  { label: '其他调整', value: '其他调整' }
]

const transactionTypeOptions = [
  { label: '全部类型', value: '' },
  { label: '入库', value: 'stock_in' },
  { label: '出库', value: 'stock_out' },
  { label: '销售出库', value: 'sale' },
  { label: '采购入库', value: 'purchase' },
  { label: '退货入库', value: 'return' }
]

// 计算属性
const categoryOptions = computed(() => [
  { label: '全部分类', value: '' },
  ...categories.value.map(category => ({
    label: category.name,
    value: category.id
  }))
])

const productOptions = computed(() => [
  { label: '全部产品', value: '' },
  ...products.value.map(product => ({
    label: `${product.name} (${product.sku})`,
    value: product.id
  }))
])

// 防抖搜索
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  loadInventory()
}, 300)

// 方法
const loadInventory = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/inventory', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        category_id: categoryFilter.value,
        low_stock: stockStatusFilter.value
      }
    })

    inventory.value = data.data
    pagination.value = data.pagination

    // 计算统计数据
    calculateStats()
  } catch (error) {
    console.error('加载库存失败:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const { data } = await $fetch('/api/categories')
    categories.value = data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadProducts = async () => {
  try {
    const { data } = await $fetch('/api/products', {
      query: { limit: 1000 }
    })
    products.value = data.data.filter(product => product.is_active)
  } catch (error) {
    console.error('加载产品失败:', error)
  }
}

const loadTransactions = async () => {
  transactionLoading.value = true
  try {
    const { data } = await $fetch('/api/inventory/transactions', {
      query: {
        page: transactionPagination.value.page,
        limit: transactionPagination.value.limit,
        transaction_type: transactionTypeFilter.value,
        product_id: transactionProductFilter.value
      }
    })

    transactions.value = data.data
    transactionPagination.value = data.pagination
  } catch (error) {
    console.error('加载变动记录失败:', error)
  } finally {
    transactionLoading.value = false
  }
}

const calculateStats = () => {
  stats.value = {
    totalProducts: inventory.value.length,
    totalValue: inventory.value.reduce((sum, item) => sum + item.stock_value, 0),
    lowStockCount: inventory.value.filter(item => item.stock_status === 'low_stock').length,
    outOfStockCount: inventory.value.filter(item => item.stock_status === 'out_of_stock').length
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  stockStatusFilter.value = ''
  pagination.value.page = 1
  loadInventory()
}

const resetTransactionFilters = () => {
  transactionTypeFilter.value = ''
  transactionProductFilter.value = ''
  transactionPagination.value.page = 1
  loadTransactions()
}

const adjustStock = (product) => {
  adjustForm.value = {
    product_id: product.id,
    adjustment_type: '',
    quantity: 1,
    reason: '',
    notes: ''
  }
  selectedProduct.value = product
  showAdjustModal.value = true
}

const onProductSelect = () => {
  const product = products.value.find(p => p.id === adjustForm.value.product_id)
  selectedProduct.value = product
}

const submitAdjustment = async () => {
  submitting.value = true
  try {
    await $fetch('/api/inventory/adjust', {
      method: 'POST',
      body: adjustForm.value
    })

    showAdjustModal.value = false
    resetAdjustForm()
    loadInventory()

    // 显示成功消息
  } catch (error) {
    console.error('库存调整失败:', error)
    // 显示错误消息
  } finally {
    submitting.value = false
  }
}

const resetAdjustForm = () => {
  adjustForm.value = {
    product_id: null,
    adjustment_type: '',
    quantity: 1,
    reason: '',
    notes: ''
  }
  selectedProduct.value = null
}

const viewTransactions = (product) => {
  transactionProductFilter.value = product.id
  transactionPagination.value.page = 1
  loadTransactions()
  showTransactionsModal.value = true
}

const getStockStatusColor = (status) => {
  const colors = {
    normal: 'green',
    low_stock: 'yellow',
    out_of_stock: 'red',
    overstock: 'blue'
  }
  return colors[status] || 'gray'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount || 0)
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadInventory()
  loadCategories()
  loadProducts()
})
</script>
