<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        采购订单管理
      </h1>
      <UButton icon="i-heroicons-plus" size="sm" @click="showCreateModal = true">
        新增采购订单
      </UButton>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="搜索订单号..."
          icon="i-heroicons-magnifying-glass"
          @input="debouncedSearch"
        />
        <USelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="选择状态"
          @change="loadOrders"
        />
        <USelect
          v-model="supplierFilter"
          :options="supplierOptions"
          placeholder="选择供应商"
          @change="loadOrders"
        />
        <UButton variant="outline" icon="i-heroicons-arrow-path" @click="resetFilters">
          重置
        </UButton>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="bg-white rounded-lg shadow">
      <UTable
        :rows="orders"
        :columns="columns"
        :loading="loading"
        class="w-full"
      >
        <template #status-data="{ row }">
          <UBadge
            :color="getStatusColor(row.status)"
            :label="getStatusText(row.status)"
          />
        </template>

        <template #total_amount-data="{ row }">
          {{ formatCurrency(row.total_amount) }}
        </template>

        <template #order_date-data="{ row }">
          {{ formatDate(row.order_date) }}
        </template>

        <template #expected_date-data="{ row }">
          {{ row.expected_date ? formatDate(row.expected_date) : '-' }}
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-eye"
              size="xs"
              variant="outline"
              @click="viewOrder(row)"
            />
            <UButton
              v-if="row.status === 'pending'"
              icon="i-heroicons-check"
              size="xs"
              color="green"
              @click="confirmOrder(row.id)"
            />
            <UButton
              v-if="row.status === 'confirmed'"
              icon="i-heroicons-truck"
              size="xs"
              color="blue"
              @click="receiveOrder(row.id)"
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
          @update:model-value="loadOrders"
        />
      </div>
    </div>

    <!-- 新增/编辑采购订单模态框 -->
    <UModal v-model="showCreateModal" :ui="{ width: 'sm:max-w-4xl' }">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            新增采购订单
          </h3>
        </template>

        <UForm :schema="orderSchema" :state="orderForm" @submit="createOrder">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <UFormGroup label="供应商" name="supplier_id">
              <USelect
                v-model="orderForm.supplier_id"
                :options="supplierOptions"
                placeholder="选择供应商"
              />
            </UFormGroup>

            <UFormGroup label="订单日期" name="order_date">
              <UInput
                v-model="orderForm.order_date"
                type="date"
              />
            </UFormGroup>

            <UFormGroup label="预期到货日期" name="expected_date">
              <UInput
                v-model="orderForm.expected_date"
                type="date"
              />
            </UFormGroup>

            <UFormGroup label="备注" name="notes">
              <UTextarea
                v-model="orderForm.notes"
                placeholder="订单备注"
              />
            </UFormGroup>
          </div>

          <!-- 订单明细 -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">
                订单明细
              </h4>
              <UButton
                icon="i-heroicons-plus"
                size="xs"
                variant="outline"
                @click="addOrderItem"
              >
                添加商品
              </UButton>
            </div>

            <div v-for="(item, index) in orderForm.items" :key="index" class="border rounded p-3 mb-2">
              <div class="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                <UFormGroup label="产品">
                  <USelect
                    v-model="item.product_id"
                    :options="productOptions"
                    placeholder="选择产品"
                  />
                </UFormGroup>

                <UFormGroup label="数量">
                  <UInput
                    v-model="item.quantity"
                    type="number"
                    min="1"
                    @input="calculateSubtotal(index)"
                  />
                </UFormGroup>

                <UFormGroup label="单价">
                  <UInput
                    v-model="item.unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    @input="calculateSubtotal(index)"
                  />
                </UFormGroup>

                <UFormGroup label="小计">
                  <UInput
                    :value="formatCurrency(item.subtotal || 0)"
                    readonly
                  />
                </UFormGroup>

                <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="red"
                  variant="outline"
                  @click="removeOrderItem(index)"
                />
              </div>
            </div>

            <div class="text-right mt-4">
              <span class="text-lg font-semibold">
                总金额: {{ formatCurrency(totalAmount) }}
              </span>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <UButton variant="outline" @click="showCreateModal = false">
              取消
            </UButton>
            <UButton type="submit" :loading="submitting">
              创建订单
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <!-- 订单详情模态框 -->
    <UModal v-model="showDetailModal" :ui="{ width: 'sm:max-w-4xl' }">
      <UCard v-if="selectedOrder">
        <template #header>
          <h3 class="text-lg font-semibold">
            采购订单详情 - {{ selectedOrder.order_number }}
          </h3>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">供应商</label>
              <p class="mt-1">
                {{ selectedOrder.supplier_name }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">订单状态</label>
              <UBadge
                :color="getStatusColor(selectedOrder.status)"
                :label="getStatusText(selectedOrder.status)"
                class="mt-1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">订单日期</label>
              <p class="mt-1">
                {{ formatDate(selectedOrder.order_date) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">预期到货日期</label>
              <p class="mt-1">
                {{ selectedOrder.expected_date ? formatDate(selectedOrder.expected_date) : '-' }}
              </p>
            </div>
          </div>

          <div v-if="selectedOrder.notes">
            <label class="block text-sm font-medium text-gray-700">备注</label>
            <p class="mt-1">
              {{ selectedOrder.notes }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">订单明细</label>
            <UTable
              :rows="orderItems"
              :columns="itemColumns"
              class="w-full"
            >
              <template #unit_price-data="{ row }">
                {{ formatCurrency(row.unit_price) }}
              </template>
              <template #subtotal-data="{ row }">
                {{ formatCurrency(row.subtotal) }}
              </template>
            </UTable>
          </div>

          <div class="text-right">
            <span class="text-lg font-semibold">
              总金额: {{ formatCurrency(selectedOrder.total_amount) }}
            </span>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton variant="outline" @click="showDetailModal = false">
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
const orderItemSchema = z.object({
  product_id: z.number().int().positive('请选择产品'),
  quantity: z.number().int().positive('数量必须大于0'),
  unit_price: z.number().positive('单价必须大于0')
})

const orderSchema = z.object({
  supplier_id: z.number().int().positive('请选择供应商'),
  order_date: z.string().min(1, '订单日期不能为空'),
  expected_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, '订单必须包含至少一个商品')
})

// 响应式数据
const orders = ref([])
const suppliers = ref([])
const products = ref([])
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const supplierFilter = ref('')
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const orderItems = ref([])

// 分页数据
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// 表单数据
const orderForm = ref({
  supplier_id: null,
  order_date: new Date().toISOString().split('T')[0],
  expected_date: '',
  notes: '',
  items: [{
    product_id: null,
    quantity: 1,
    unit_price: 0,
    subtotal: 0
  }]
})

// 表格列定义
const columns = [
  { key: 'order_number', label: '订单号' },
  { key: 'supplier_name', label: '供应商' },
  { key: 'order_date', label: '订单日期' },
  { key: 'expected_date', label: '预期到货日期' },
  { key: 'total_amount', label: '总金额' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

const itemColumns = [
  { key: 'product_name', label: '产品名称' },
  { key: 'quantity', label: '数量' },
  { key: 'unit_price', label: '单价' },
  { key: 'subtotal', label: '小计' }
]

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已收货', value: 'received' },
  { label: '已取消', value: 'cancelled' }
]

// 计算属性
const supplierOptions = computed(() => [
  { label: '全部供应商', value: '' },
  ...suppliers.value.map(supplier => ({
    label: supplier.name,
    value: supplier.id
  }))
])

const productOptions = computed(() =>
  products.value.map(product => ({
    label: `${product.name} (${product.sku})`,
    value: product.id
  }))
)

const totalAmount = computed(() => {
  return orderForm.value.items.reduce((sum, item) => {
    return sum + (item.subtotal || 0)
  }, 0)
})

// 防抖搜索
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  loadOrders()
}, 300)

// 方法
const loadOrders = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/purchase/orders', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        status: statusFilter.value,
        supplier_id: supplierFilter.value
      }
    })

    orders.value = data.data
    pagination.value = data.pagination
  } catch (error) {
    console.error('加载采购订单失败:', error)
  } finally {
    loading.value = false
  }
}

const loadSuppliers = async () => {
  try {
    const { data } = await $fetch('/api/suppliers', {
      query: { limit: 1000 }
    })
    suppliers.value = data.data.filter(supplier => supplier.status === 'active')
  } catch (error) {
    console.error('加载供应商失败:', error)
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

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  supplierFilter.value = ''
  pagination.value.page = 1
  loadOrders()
}

const addOrderItem = () => {
  orderForm.value.items.push({
    product_id: null,
    quantity: 1,
    unit_price: 0,
    subtotal: 0
  })
}

const removeOrderItem = (index) => {
  if (orderForm.value.items.length > 1) {
    orderForm.value.items.splice(index, 1)
  }
}

const calculateSubtotal = (index) => {
  const item = orderForm.value.items[index]
  item.subtotal = (item.quantity || 0) * (item.unit_price || 0)
}

const createOrder = async () => {
  submitting.value = true
  try {
    await $fetch('/api/purchase/orders', {
      method: 'POST',
      body: orderForm.value
    })

    showCreateModal.value = false
    resetOrderForm()
    loadOrders()

    // 显示成功消息
    // 这里可以添加 toast 通知
  } catch (error) {
    console.error('创建采购订单失败:', error)
    // 这里可以添加错误 toast 通知
  } finally {
    submitting.value = false
  }
}

const resetOrderForm = () => {
  orderForm.value = {
    supplier_id: null,
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    notes: '',
    items: [{
      product_id: null,
      quantity: 1,
      unit_price: 0,
      subtotal: 0
    }]
  }
}

const viewOrder = async (order) => {
  selectedOrder.value = order

  try {
    const { data } = await $fetch(`/api/purchase/orders/${order.id}`)
    orderItems.value = data.items
    showDetailModal.value = true
  } catch (error) {
    console.error('加载订单详情失败:', error)
  }
}

const confirmOrder = async (orderId) => {
  try {
    await $fetch(`/api/purchase/orders/${orderId}/confirm`, {
      method: 'POST'
    })

    loadOrders()
    // 显示成功消息
  } catch (error) {
    console.error('确认订单失败:', error)
    // 显示错误消息
  }
}

const receiveOrder = async (orderId) => {
  try {
    await $fetch(`/api/purchase/orders/${orderId}/receive`, {
      method: 'POST'
    })

    loadOrders()
    // 显示成功消息
  } catch (error) {
    console.error('收货失败:', error)
    // 显示错误消息
  }
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    received: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待确认',
    confirmed: '已确认',
    received: '已收货',
    cancelled: '已取消'
  }
  return texts[status] || status
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

// 生命周期
onMounted(() => {
  loadOrders()
  loadSuppliers()
  loadProducts()
})
</script>
