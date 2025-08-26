<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">采购订单管理</h1>
        <p class="text-muted-color mt-1">管理所有采购订单，跟踪采购进度和供应商信息</p>
      </div>
      <Button @click="handleCreate" />
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/20 -full">
              <i class="pi pi-shopping-bag text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">本月采购订单</p>
              <p class="text-2xl font-semibold text-color">
                {{ orderStats.monthlyOrders }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900/20 -full">
              <i class="pi pi-clock text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">待审核</p>
              <p class="text-2xl font-semibold text-color">
                {{ orderStats.pendingApproval }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900/20 -full">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">已完成</p>
              <p class="text-2xl font-semibold text-color">
                {{ orderStats.completed }}
              </p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 dark:bg-purple-900/20 -full">
              <i class="pi pi-dollar text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">本月采购金额</p>
              <p class="text-2xl font-semibold text-color">
                ¥{{ orderStats.monthlyAmount.toLocaleString() }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">搜索</label>
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <i class="pi pi-search"></i>
            <!-- /InputIcon -->
            <Input v-model="searchQuery" placeholder="订单号、供应商..." class="w-full" />
            <!-- /IconField -->
          </div>

          <!-- 状态筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">状态</label>
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              option-option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>

          <!-- 供应商筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">供应商</label>
            <Select
              v-model="supplierFilter"
              :options="suppliers"
              option-option-value="id"
              placeholder="全部供应商"
              show-clear
              class="w-full"
            />
          </div>

          <!-- 日期范围 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">日期范围</label>
            <!-- Calendar 组件需要手动替换为 DatePicker -->
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-end gap-2">
            <Button class="flex-1" @click="resetFilters" />
          </div>
        </div>
      </template>
    </Card>

    <!-- 采购订单列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">采购订单列表</h3>
          <div class="flex items-center gap-2">
            <Button size="sm" @click="exportOrders" />
          </div>
        </div>
      </template>

      <template #content>
        <Table
          :value="filteredOrders"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
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
          <TableHead field="order_no" header="订单号" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 text-sm font-mono">
                {{ slotProps.data.order_no }}
              </code>
            </template>
          </TableHead>

          <TableHead field="supplier_name" header="供应商" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <Avatar :shape="'circle'" size="sm" />
                <span class="font-medium">{{ slotProps.data.supplier_name }}</span>
              </div>
            </template>
          </TableHead>

          <TableHead field="total_amount" header="订单金额" sortable>
            <template #body="slotProps">
              <span class="font-medium text-green-600">
                ¥{{ slotProps.data.total_amount.toLocaleString() }}
              </span>
            </template>
          </TableHead>

          <TableHead field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </TableHead>

          <TableHead field="order_date" header="订单日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.order_date) }}
              </span>
            </template>
          </TableHead>

          <TableHead field="expected_date" header="预期到货" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.expected_date) }}
              </span>
            </template>
          </TableHead>

          <TableHead field="items_count" header="商品数量">
            <template #body="slotProps">
              <span class="text-sm">{{ slotProps.data.items.length }} 种商品</span>
            </template>
          </TableHead>

          <TableHead header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex align-items-center gap-1">
                <Button text size="sm" @click="viewOrder(slotProps.data)" />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  text
                  size="sm"
                  @click="editOrder(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'pending'"
                  text
                  size="sm"
                  @click="approveOrder(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  text
                  size="sm"
                  severity="danger"
                  @click="confirmDeleteOrder(slotProps.data)"
                />
              </div>
            </template>
          </TableHead>
        </Table>
      </template>
    </Card>

    <!-- 订单详情对话框 -->
    <Dialog
      v-model:visible="showOrderDialog"
      :header="dialogMode === 'create' ? '新增采购订单' : '订单详情'"
      :style="{ width: '800px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">订单号</label>
              <Input
                v-model="orderForm.order_no"
                :disabled="dialogMode !== 'create'"
                placeholder="系统自动生成"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">供应商 *</label>
              <Select
                v-model="orderForm.supplier_id"
                :options="suppliers"
                option-option-value="id"
                placeholder="选择供应商"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">订单日期 *</label>
              <!-- Calendar 组件需要手动替换为 DatePicker -->
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">预期到货日期</label>
              <!-- Calendar 组件需要手动替换为 DatePicker -->
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">备注</label>
            <Textarea
              v-model="orderForm.remark"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>

          <!-- 订单项列表 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-color">订单项</label>
              <Button v-if="dialogMode !== 'view'" text size="sm" @click="addOrderItem" />
            </div>

            <Table :value="orderForm.items">
              <template #loading>
                <div class="p-6">
                  <div v-for="i in 3" :key="i" class="flex align-items-center gap-4 mb-4">
                    <Skeleton width="100%" height="1.5rem" class="mb-2" />
                    <Skeleton width="60%" height="1rem" />
                    <Skeleton width="80%" height="1rem" />
                    <Skeleton width="4rem" height="1.5rem" />
                  </div>
                </div>
              </template>
              <TableHead field="product_name" header="商品名称">
                <template #body="slotProps">
                  <span class="font-medium">{{ slotProps.data.product_name }}</span>
                </template>
              </TableHead>

              <TableHead field="quantity" header="数量">
                <template #body="slotProps">
                  <span>{{ slotProps.data.quantity }} {{ slotProps.data.unit }}</span>
                </template>
              </TableHead>

              <TableHead field="unit_price" header="单价">
                <template #body="slotProps">
                  <span>¥{{ slotProps.data.unit_price.toLocaleString() }}</span>
                </template>
              </TableHead>

              <TableHead field="amount" header="金额">
                <template #body="slotProps">
                  <span class="font-medium">
                    ¥{{ (slotProps.data.quantity * slotProps.data.unit_price).toLocaleString() }}
                  </span>
                </template>
              </TableHead>

              <TableHead v-if="dialogMode !== 'view'" header="操作" :exportable="false">
                <template #body="slotProps">
                  <Button
                    text
                    size="sm"
                    severity="danger"
                    @click="removeOrderItem(slotProps.index)"
                  />
                </template>
              </TableHead>
            </Table>
          </div>

          <!-- 总计 -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-color">总计：</span>
              <span class="text-xl font-bold text-green-600">
                ¥{{ totalAmount.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeOrderDialog" />
          <Button v-if="dialogMode !== 'view'" :loading="saving" @click="saveOrder" />
        </div>
      </template>
    </Dialog>

    <!-- 确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script setup lang="ts">
// import Card from 'primevue/card' // 已移除PrimeVue导入
// import Button from 'primevue/button' // 已移除PrimeVue导入
// import InputText from 'primevue/inputtext' // 已移除PrimeVue导入
// import IconField from 'primevue/iconfield' // 已移除PrimeVue导入
// import InputIcon from 'primevue/inputicon' // 已移除PrimeVue导入
// import Dropdown from 'primevue/dropdown' // 已移除PrimeVue导入
// import Calendar from 'primevue/calendar' // 已移除PrimeVue导入
// import Textarea from 'primevue/textarea' // 已移除PrimeVue导入
// import DataTable from 'primevue/datatable' // 已移除PrimeVue导入
// import Column from 'primevue/column' // 已移除PrimeVue导入
// import Tag from 'primevue/tag' // 已移除PrimeVue导入
// import Avatar from 'primevue/avatar' // 已移除PrimeVue导入
// import Dialog from 'primevue/dialog' // 已移除PrimeVue导入
// import ConfirmDialog from 'primevue/confirmdialog' // 已移除PrimeVue导入
// import { useConfirm } from 'primevue/useconfirm' // 已移除PrimeVue导入
// import Skeleton from 'primevue/skeleton' // 已移除PrimeVue导入
// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '采购订单管理 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showOrderDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
// const confirm = useConfirm() // 已移除
// 筛选条件
const searchQuery = ref('')
const statusFilter = ref('')
const supplierFilter = ref('')
const dateRange = ref()

// 表单数据
const orderForm = ref({
  order_no: '',
  supplier_id: '',
  order_date: new Date(),
  expected_date: null,
  remark: '',
  items: [] as Array<{ product_name: string, quantity: number, unit: string, unit_price: number }>,
})

// 统计数据
const orderStats = ref({
  monthlyOrders: 156,
  pendingApproval: 23,
  completed: 89,
  monthlyAmount: 2456789,
})

// 选项数据
const statusOptions = ref([
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
])

const suppliers = ref([
  { id: '1', name: '供应商A' },
  { id: '2', name: '供应商B' },
  { id: '3', name: '供应商C' },
])

// 模拟数据
const mockOrders = ref([
  {
    id: '1',
    order_no: 'PO202401001',
    supplier_id: '1',
    supplier_name: '供应商A',
    total_amount: 156780,
    status: 'pending',
    order_date: new Date('2024-01-15'),
    expected_date: new Date('2024-01-25'),
    items: [
      { product_name: '商品A', quantity: 100, unit: '个', unit_price: 50 },
      { product_name: '商品B', quantity: 200, unit: '个', unit_price: 30 },
    ],
    remark: '紧急采购',
  },
  {
    id: '2',
    order_no: 'PO202401002',
    supplier_id: '2',
    supplier_name: '供应商B',
    total_amount: 89560,
    status: 'approved',
    order_date: new Date('2024-01-14'),
    expected_date: new Date('2024-01-24'),
    items: [{ product_name: '商品C', quantity: 150, unit: '箱', unit_price: 45 }],
    remark: '',
  },
])

// 计算属性
const filteredOrders = computed(() => {
  let result = mockOrders.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      order =>
        order.order_no.toLowerCase().includes(query)
        || order.supplier_name.toLowerCase().includes(query),
    )
  }

  if (statusFilter.value) {
    result = result.filter(order => order.status === statusFilter.value)
  }

  if (supplierFilter.value) {
    result = result.filter(order => order.supplier_id === supplierFilter.value)
  }

  return result
})

const totalAmount = computed(() => {
  return orderForm.value.items.reduce((sum: number, item: any) => {
    return sum + item.quantity * item.unit_price
  }, 0)
})

// 状态映射
const statusMap: Record<string, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已批准',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
}

const statusSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  draft: 'secondary',
  pending: 'outline',
  approved: 'secondary',
  in_progress: 'default',
  completed: 'default',
  cancelled: 'destructive',
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status

const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'secondary'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  supplierFilter.value = ''
  dateRange.value = null
}

const handleCreate = () => {
  dialogMode.value = 'create'
  orderForm.value = {
    order_no: `PO${Date.now()}`,
    supplier_id: '',
    order_date: new Date(),
    expected_date: null,
    remark: '',
    items: [],
  }
  showOrderDialog.value = true
}

const viewOrder = (order: any) => {
  dialogMode.value = 'view'
  Object.assign(orderForm.value, order)
  showOrderDialog.value = true
}

const editingOrder = ref<any>(null)

const editOrder = (order: any) => {
  dialogMode.value = 'edit'
  editingOrder.value = order
  Object.assign(orderForm.value, order)
  showOrderDialog.value = true
}

const approveOrder = async (_order: any) => {
  // TODO: 需要重新实现确认对话框
}

const confirmDeleteOrder = (_order: any) => {
  // TODO: 需要重新实现确认对话框
}

const closeOrderDialog = () => {
  showOrderDialog.value = false
}

const saveOrder = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (dialogMode.value === 'create') {
      const newOrder = {
        id: Date.now().toString(),
        ...orderForm.value,
        supplier_name: suppliers.value.find(s => s.id === orderForm.value.supplier_id)?.name || '',
        total_amount: totalAmount.value,
        status: 'draft',
        expected_date: orderForm.value.expected_date || new Date(),
      }
      mockOrders.value.push(newOrder)
    }
    else if (dialogMode.value === 'edit') {
      const index = mockOrders.value.findIndex(o => o.id === editingOrder.value?.id)
      if (index !== -1 && mockOrders.value[index]) {
        mockOrders.value[index] = {
          ...mockOrders.value[index],
          ...orderForm.value,
          id: mockOrders.value[index]!.id,
          supplier_name:
            suppliers.value.find(s => s.id === orderForm.value.supplier_id)?.name || '',
          total_amount: totalAmount.value,
          expected_date: orderForm.value.expected_date || new Date(),
        }
      }
    }

    closeOrderDialog()
  }
  catch (error) {
    console.error('保存订单失败:', error)
  }
  finally {
    saving.value = false
  }
}

const addOrderItem = () => {
  orderForm.value.items.push({
    product_name: '新商品',
    quantity: 1,
    unit: '个',
    unit_price: 0,
  })
}

const removeOrderItem = (index: number) => {
  orderForm.value.items.splice(index, 1)
}

const exportOrders = () => {
  console.log('导出采购订单')
}

// 初始化
onMounted(() => {
  // 加载数据
})
</script>
