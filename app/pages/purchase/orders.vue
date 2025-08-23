<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">
          采购订单管理
        </h1>
        <p class="text-muted-color mt-1">
          管理所有采购订单，跟踪采购进度和供应商信息
        </p>
      </div>
      <Button
        label="新增采购订单"
        icon="pi pi-plus"
        @click="handleCreate"
      />
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <i class="pi pi-shopping-bag text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">
                本月采购订单
              </p>
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
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <i class="pi pi-clock text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">
                待审核
              </p>
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
            <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">
                已完成
              </p>
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
            <div class="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <i class="pi pi-dollar text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">
                本月采购金额
              </p>
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
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText
                v-model="searchQuery"
                placeholder="订单号、供应商..."
                class="w-full"
              />
            </IconField>
          </div>
          
          <!-- 状态筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">状态</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>
          
          <!-- 供应商筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">供应商</label>
            <Dropdown
              v-model="supplierFilter"
              :options="suppliers"
              option-label="name"
              option-value="id"
              placeholder="全部供应商"
              show-clear
              class="w-full"
            />
          </div>
          
          <!-- 日期范围 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">日期范围</label>
            <Calendar
              v-model="dateRange"
              selection-mode="range"
              placeholder="选择日期范围"
              :manual-input="false"
              class="w-full"
            />
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex items-end gap-2">
            <Button
              label="重置"
              icon="pi pi-refresh"
              outlined
              class="flex-1"
              @click="resetFilters"
            />
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
            <Button
              label="导出"
              icon="pi pi-download"
              outlined
              size="small"
              @click="exportOrders"
            />
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="filteredOrders"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          class="p-datatable-sm"
        >
          <Column field="order_no" header="订单号" sortable>
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
          
          <Column field="total_amount" header="订单金额" sortable>
            <template #body="slotProps">
              <span class="font-medium text-green-600">
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
          
          <Column field="order_date" header="订单日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.order_date) }}
              </span>
            </template>
          </Column>
          
          <Column field="expected_date" header="预期到货" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.expected_date) }}
              </span>
            </template>
          </Column>
          
          <Column field="items_count" header="商品数量">
            <template #body="slotProps">
              <span class="text-sm">{{ slotProps.data.items.length }} 种商品</span>
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
                  @click="viewOrder(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="editOrder(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'pending'"
                  v-tooltip="'审核'"
                  icon="pi pi-check"
                  rounded
                  text
                  size="small"
                  @click="approveOrder(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDeleteOrder(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
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
              <InputText
                v-model="orderForm.order_no"
                :disabled="dialogMode !== 'create'"
                placeholder="系统自动生成"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">供应商 *</label>
              <Dropdown
                v-model="orderForm.supplier_id"
                :options="suppliers"
                option-label="name"
                option-value="id"
                placeholder="选择供应商"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">订单日期 *</label>
              <Calendar
                v-model="orderForm.order_date"
                placeholder="选择订单日期"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">预期到货日期</label>
              <Calendar
                v-model="orderForm.expected_date"
                placeholder="选择预期到货日期"
                :disabled="dialogMode === 'view'"
              />
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
              <Button
                v-if="dialogMode !== 'view'"
                label="添加商品"
                icon="pi pi-plus"
                text
                size="small"
                @click="addOrderItem"
              />
            </div>
            
            <DataTable
              :value="orderForm.items"
              class="p-datatable-sm"
            >
              <Column field="product_name" header="商品名称">
                <template #body="slotProps">
                  <span class="font-medium">{{ slotProps.data.product_name }}</span>
                </template>
              </Column>
              
              <Column field="quantity" header="数量">
                <template #body="slotProps">
                  <span>{{ slotProps.data.quantity }} {{ slotProps.data.unit }}</span>
                </template>
              </Column>
              
              <Column field="unit_price" header="单价">
                <template #body="slotProps">
                  <span>¥{{ slotProps.data.unit_price.toLocaleString() }}</span>
                </template>
              </Column>
              
              <Column field="amount" header="金额">
                <template #body="slotProps">
                  <span class="font-medium">
                    ¥{{ (slotProps.data.quantity * slotProps.data.unit_price).toLocaleString() }}
                  </span>
                </template>
              </Column>
              
              <Column v-if="dialogMode !== 'view'" header="操作" :exportable="false">
                <template #body="slotProps">
                  <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    size="small"
                    severity="danger"
                    @click="removeOrderItem(slotProps.index)"
                  />
                </template>
              </Column>
            </DataTable>
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
          <Button
            label="取消"
            icon="pi pi-times"
            outlined
            @click="closeOrderDialog"
          />
          <Button
            v-if="dialogMode !== 'view'"
            label="保存"
            icon="pi pi-check"
            :loading="saving"
            @click="saveOrder"
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
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '采购订单管理 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showOrderDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const confirm = useConfirm()

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
  items: []
})

// 统计数据
const orderStats = ref({
  monthlyOrders: 156,
  pendingApproval: 23,
  completed: 89,
  monthlyAmount: 2456789
})

// 选项数据
const statusOptions = ref([
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
])

const suppliers = ref([
  { id: '1', name: '供应商A' },
  { id: '2', name: '供应商B' },
  { id: '3', name: '供应商C' }
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
      { product_name: '商品B', quantity: 200, unit: '个', unit_price: 30 }
    ],
    remark: '紧急采购'
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
    items: [
      { product_name: '商品C', quantity: 150, unit: '箱', unit_price: 45 }
    ],
    remark: ''
  }
])

// 计算属性
const filteredOrders = computed(() => {
  let result = mockOrders.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(order =>
      order.order_no.toLowerCase().includes(query)
      || order.supplier_name.toLowerCase().includes(query)
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
    return sum + (item.quantity * item.unit_price)
  }, 0)
})

// 状态映射
const statusMap: Record<string, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已批准',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消'
}

const statusSeverityMap: Record<string, string> = {
  draft: 'secondary',
  pending: 'warn',
  approved: 'info',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'danger'
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status

const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info'

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
    items: []
  }
  showOrderDialog.value = true
}

const viewOrder = (order: any) => {
  dialogMode.value = 'view'
  Object.assign(orderForm.value, order)
  showOrderDialog.value = true
}

const editOrder = (order: any) => {
  dialogMode.value = 'edit'
  Object.assign(orderForm.value, order)
  showOrderDialog.value = true
}

const approveOrder = async (order: any) => {
  confirm.require({
    message: `确定要审核通过订单 ${order.order_no} 吗？`,
    header: '确认审核',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockOrders.value.findIndex(o => o.id === order.id)
        if (index !== -1) {
          mockOrders.value[index].status = 'approved'
        }
      }
      catch (error) {
        console.error('审核失败:', error)
      }
    }
  })
}

const confirmDeleteOrder = (order: any) => {
  confirm.require({
    message: `确定要删除订单 ${order.order_no} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteOrder(order.id)
    }
  })
}

const deleteOrder = (orderId: string) => {
  mockOrders.value = mockOrders.value.filter(order => order.id !== orderId)
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
        status: 'draft'
      }
      mockOrders.value.push(newOrder)
    }
    else if (dialogMode.value === 'edit') {
      const index = mockOrders.value.findIndex(o => o.id === orderForm.value.id)
      if (index !== -1) {
        mockOrders.value[index] = {
          ...mockOrders.value[index],
          ...orderForm.value,
          supplier_name: suppliers.value.find(s => s.id === orderForm.value.supplier_id)?.name || '',
          total_amount: totalAmount.value
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
    unit_price: 0
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
