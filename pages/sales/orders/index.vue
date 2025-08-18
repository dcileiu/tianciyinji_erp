<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        销售订单
      </h1>
      <UButton icon="i-heroicons-plus" size="lg" @click="showCreateModal = true">
        新增订单
      </UButton>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="搜索订单号或备注..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
          @input="debouncedSearch"
        />
        <USelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="选择状态"
          class="w-40"
          @change="loadOrders"
        />
        <USelect
          v-model="selectedCustomer"
          :options="customerOptions"
          placeholder="选择客户"
          class="w-48"
          @change="loadOrders"
        />
        <UButton variant="outline" @click="loadOrders">
          搜索
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
          <UBadge :color="getStatusColor(row.status)" variant="subtle">
            {{ getStatusText(row.status) }}
          </UBadge>
        </template>

        <template #total_amount-data="{ row }">
          ¥{{ row.total_amount.toFixed(2) }}
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-eye"
              size="sm"
              variant="outline"
              @click="viewOrder(row)"
            />
            <UButton
              v-if="row.status === 'pending'"
              icon="i-heroicons-check"
              size="sm"
              color="green"
              variant="outline"
              @click="confirmOrder(row)"
            />
            <UButton
              v-if="row.status === 'confirmed'"
              icon="i-heroicons-truck"
              size="sm"
              color="blue"
              variant="outline"
              @click="shipOrder(row)"
            />
          </div>
        </template>
      </UTable>

      <!-- 分页 -->
      <div class="flex justify-between items-center p-4 border-t">
        <div class="text-sm text-gray-500">
          共 {{ pagination.total }} 条记录
        </div>
        <UPagination
          v-model="pagination.page"
          :page-count="pagination.limit"
          :total="pagination.total"
          @update:model-value="loadOrders"
        />
      </div>
    </div>

    <!-- 创建订单模态框 -->
    <UModal v-model="showCreateModal" :ui="{ width: 'sm:max-w-4xl' }">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            新增销售订单
          </h3>
        </template>

        <UForm
          :schema="orderSchema"
          :state="orderForm"
          class="space-y-6"
          @submit="submitOrder"
        >
          <!-- 基本信息 -->
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="客户" name="customer_id" required>
              <USelect
                v-model="orderForm.customer_id"
                :options="customerOptions"
                placeholder="请选择客户"
              />
            </UFormGroup>

            <UFormGroup label="订单日期" name="order_date" required>
              <UInput
                v-model="orderForm.order_date"
                type="date"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="交货日期" name="delivery_date">
              <UInput
                v-model="orderForm.delivery_date"
                type="date"
              />
            </UFormGroup>

            <UFormGroup label="备注" name="notes">
              <UInput
                v-model="orderForm.notes"
                placeholder="请输入备注"
              />
            </UFormGroup>
          </div>

          <!-- 订单明细 -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-lg font-medium">
                订单明细
              </h4>
              <UButton icon="i-heroicons-plus" size="sm" @click="addOrderItem">
                添加商品
              </UButton>
            </div>

            <div class="space-y-3">
              <div
                v-for="(item, index) in orderForm.items"
                :key="index"
                class="flex gap-3 items-end p-3 border rounded-lg"
              >
                <UFormGroup label="产品" class="flex-1">
                  <USelect
                    v-model="item.product_id"
                    :options="productOptions"
                    placeholder="请选择产品"
                    @change="updateItemPrice(index)"
                  />
                </UFormGroup>

                <UFormGroup label="数量" class="w-24">
                  <UInput
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    @input="calculateSubtotal(index)"
                  />
                </UFormGroup>

                <UFormGroup label="单价" class="w-32">
                  <UInput
                    v-model.number="item.unit_price"
                    type="number"
                    step="0.01"
                    @input="calculateSubtotal(index)"
                  />
                </UFormGroup>

                <UFormGroup label="小计" class="w-32">
                  <UInput
                    :model-value="(item.quantity * item.unit_price).toFixed(2)"
                    readonly
                  />
                </UFormGroup>

                <UButton
                  icon="i-heroicons-trash"
                  color="red"
                  variant="outline"
                  size="sm"
                  @click="removeOrderItem(index)"
                />
              </div>
            </div>

            <!-- 总计 -->
            <div class="flex justify-end mt-4">
              <div class="text-lg font-semibold">
                总金额: ¥{{ totalAmount.toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
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
    <UModal v-model="showDetailModal" :ui="{ width: 'sm:max-w-3xl' }">
      <UCard v-if="selectedOrder">
        <template #header>
          <h3 class="text-lg font-semibold">
            订单详情 - {{ selectedOrder.order_number }}
          </h3>
        </template>

        <div class="space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">客户</label>
              <p class="mt-1">
                {{ selectedOrder.customers?.name }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">订单状态</label>
              <p class="mt-1">
                <UBadge :color="getStatusColor(selectedOrder.status)" variant="subtle">
                  {{ getStatusText(selectedOrder.status) }}
                </UBadge>
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">订单日期</label>
              <p class="mt-1">
                {{ formatDate(selectedOrder.order_date) }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">交货日期</label>
              <p class="mt-1">
                {{ selectedOrder.delivery_date ? formatDate(selectedOrder.delivery_date) : '-' }}
              </p>
            </div>
          </div>

          <!-- 订单明细 -->
          <div>
            <h4 class="text-lg font-medium mb-3">
              订单明细
            </h4>
            <UTable
              :rows="selectedOrder.sales_order_items || []"
              :columns="detailColumns"
            >
              <template #subtotal-data="{ row }">
                ¥{{ row.subtotal.toFixed(2) }}
              </template>
              <template #unit_price-data="{ row }">
                ¥{{ row.unit_price.toFixed(2) }}
              </template>
            </UTable>
          </div>

          <!-- 总计 -->
          <div class="flex justify-end">
            <div class="text-xl font-bold">
              总金额: ¥{{ selectedOrder.total_amount.toFixed(2) }}
            </div>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { debounce } from 'lodash-es'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()

// 表格列定义
const columns = [
  { key: 'order_number', label: '订单号' },
  { key: 'customer_name', label: '客户' },
  { key: 'order_date', label: '订单日期' },
  { key: 'total_amount', label: '总金额' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

const detailColumns = [
  { key: 'product_name', label: '产品名称' },
  { key: 'quantity', label: '数量' },
  { key: 'unit_price', label: '单价' },
  { key: 'subtotal', label: '小计' }
]

// 订单表单验证
const orderItemSchema = z.object({
  product_id: z.number().int().positive('请选择产品'),
  quantity: z.number().int().positive('数量必须大于0'),
  unit_price: z.number().positive('单价必须大于0')
})

const orderSchema = z.object({
  customer_id: z.number().int().positive('请选择客户'),
  order_date: z.string().min(1, '订单日期不能为空'),
  delivery_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, '订单必须包含至少一个商品')
})

// 响应式数据
const orders = ref([])
const customers = ref([])
const products = ref([])
const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCustomer = ref('')

// 分页数据
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// 订单表单数据
const orderForm = ref({
  customer_id: null,
  order_date: new Date().toISOString().split('T')[0],
  delivery_date: '',
  notes: '',
  items: [{
    product_id: null,
    quantity: 1,
    unit_price: 0
  }]
})

// 计算属性
const customerOptions = computed(() => [
  { label: '全部客户', value: '' },
  ...customers.value.map(customer => ({ label: customer.name, value: customer.id }))
])

const productOptions = computed(() =>
  products.value.map(product => ({
    label: `${product.name} (${product.sku})`,
    value: product.id,
    price: product.unit_price
  }))
)

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const totalAmount = computed(() => {
  return orderForm.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price)
  }, 0)
})

// 防抖搜索
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  loadOrders()
}, 500)

// 获取状态颜色
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    confirmed: 'blue',
    shipped: 'purple',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status] || 'gray'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待确认',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// 加载客户列表
const loadCustomers = async () => {
  try {
    const { data } = await $fetch('/api/customers')
    customers.value = data.data
  } catch (error) {
    console.error('加载客户失败:', error)
  }
}

// 加载产品列表
const loadProducts = async () => {
  try {
    const { data } = await $fetch('/api/products', {
      query: { limit: 1000, is_active: 'true' }
    })
    products.value = data.data
  } catch (error) {
    console.error('加载产品失败:', error)
  }
}

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/sales/orders', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        status: selectedStatus.value,
        customer_id: selectedCustomer.value
      }
    })

    orders.value = data.data.map(order => ({
      ...order,
      customer_name: order.customers?.name || '未知客户',
      order_date: formatDate(order.order_date)
    }))

    pagination.value = data.pagination
  } catch (error) {
    toast.add({
      title: '加载失败',
      description: error.data?.message || '获取订单列表失败',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// 添加订单明细
const addOrderItem = () => {
  orderForm.value.items.push({
    product_id: null,
    quantity: 1,
    unit_price: 0
  })
}

// 删除订单明细
const removeOrderItem = (index) => {
  if (orderForm.value.items.length > 1) {
    orderForm.value.items.splice(index, 1)
  }
}

// 更新商品价格
const updateItemPrice = (index) => {
  const item = orderForm.value.items[index]
  const product = products.value.find(p => p.id === item.product_id)
  if (product) {
    item.unit_price = product.unit_price
  }
}

// 计算小计
const calculateSubtotal = (index) => {
  // 触发响应式更新
  const item = orderForm.value.items[index]
  item.subtotal = item.quantity * item.unit_price
}

// 提交订单
const submitOrder = async () => {
  submitting.value = true
  try {
    await $fetch('/api/sales/orders', {
      method: 'POST',
      body: orderForm.value
    })

    toast.add({
      title: '创建成功',
      description: '销售订单已创建',
      color: 'green'
    })

    showCreateModal.value = false
    resetForm()
    loadOrders()
  } catch (error) {
    toast.add({
      title: '创建失败',
      description: error.data?.message || '创建订单失败',
      color: 'red'
    })
  } finally {
    submitting.value = false
  }
}

// 查看订单详情
const viewOrder = async (order) => {
  try {
    const { data } = await $fetch(`/api/sales/orders/${order.id}`)
    selectedOrder.value = {
      ...data,
      sales_order_items: data.sales_order_items?.map(item => ({
        ...item,
        product_name: item.products?.name || '未知产品'
      }))
    }
    showDetailModal.value = true
  } catch (error) {
    toast.add({
      title: '加载失败',
      description: '获取订单详情失败',
      color: 'red'
    })
  }
}

// 确认订单
const confirmOrder = async (order) => {
  try {
    await $fetch(`/api/sales/orders/${order.id}/confirm`, {
      method: 'POST'
    })

    toast.add({
      title: '确认成功',
      description: '订单已确认',
      color: 'green'
    })

    loadOrders()
  } catch (error) {
    toast.add({
      title: '确认失败',
      description: error.data?.message || '确认订单失败',
      color: 'red'
    })
  }
}

// 发货
const shipOrder = async (order) => {
  try {
    await $fetch(`/api/sales/orders/${order.id}/ship`, {
      method: 'POST'
    })

    toast.add({
      title: '发货成功',
      description: '订单已发货',
      color: 'green'
    })

    loadOrders()
  } catch (error) {
    toast.add({
      title: '发货失败',
      description: error.data?.message || '订单发货失败',
      color: 'red'
    })
  }
}

// 重置表单
const resetForm = () => {
  orderForm.value = {
    customer_id: null,
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    notes: '',
    items: [{
      product_id: null,
      quantity: 1,
      unit_price: 0
    }]
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadCustomers()
  loadProducts()
  loadOrders()
})
</script>
