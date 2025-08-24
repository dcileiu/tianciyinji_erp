<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-color">生产订单管理</h1>
        <p class="text-muted-color mt-1">管理和跟踪生产订单的执行情况</p>
      </div>
      <Button label="新建订单" icon="pi pi-plus" @click="handleCreate" />
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-color mb-2">订单号/产品名称</label>
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText v-model="searchQuery" placeholder="搜索订单号或产品名称" class="w-full" />
            </IconField>
          </div>

          <div>
            <label class="block text-sm font-medium text-color mb-2">订单状态</label>
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

          <div>
            <label class="block text-sm font-medium text-color mb-2">车间</label>
            <Dropdown
              v-model="workshopFilter"
              :options="workshopOptions"
              option-label="label"
              option-value="value"
              placeholder="全部车间"
              show-clear
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-color mb-2">优先级</label>
            <Dropdown
              v-model="priorityFilter"
              :options="priorityOptions"
              option-label="label"
              option-value="value"
              placeholder="全部优先级"
              show-clear
              class="w-full"
            />
          </div>

          <div class="flex items-end">
            <Button label="重置筛选" icon="pi pi-filter-slash" outlined class="w-full" @click="resetFilters" />
          </div>
        </div>
      </template>
    </Card>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-color">今日新增</p>
              <p class="text-2xl font-bold text-color">{{ orderStats.todayNew }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-plus text-blue-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-color">生产中</p>
              <p class="text-2xl font-bold text-color">{{ orderStats.producing }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-cog text-green-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-color">已完工</p>
              <p class="text-2xl font-bold text-color">{{ orderStats.completed }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-check-circle text-purple-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-color">延期订单</p>
              <p class="text-2xl font-bold text-red-600">{{ orderStats.delayed }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 生产订单列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">生产订单列表</h3>
          <div class="flex items-center gap-2 text-sm text-muted-color">共 {{ totalCount }} 条记录</div>
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
          <Column field="order_no" header="订单号" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm font-mono">
                {{ slotProps.data.order_no }}
              </code>
            </template>
          </Column>

          <Column field="product_name" header="产品名称" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <Avatar :label="slotProps.data.product_name.charAt(0)" shape="circle" size="small" />
                <span class="font-medium">{{ slotProps.data.product_name }}</span>
              </div>
            </template>
          </Column>

          <Column field="quantity" header="计划数量" sortable>
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.quantity.toLocaleString() }}</span>
            </template>
          </Column>

          <Column field="produced_quantity" header="已生产" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <span class="font-medium">{{ slotProps.data.produced_quantity.toLocaleString() }}</span>
                <ProgressBar
                  :value="(slotProps.data.produced_quantity / slotProps.data.quantity) * 100"
                  class="w-16"
                  :show-value="false"
                />
              </div>
            </template>
          </Column>

          <Column field="workshop_name" header="车间" sortable>
            <template #body="slotProps">
              <Tag :value="slotProps.data.workshop_name" severity="info" />
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

          <Column field="priority" header="优先级" sortable>
            <template #body="slotProps">
              <Tag
                :value="getPriorityDisplayName(slotProps.data.priority)"
                :severity="getPrioritySeverity(slotProps.data.priority)"
              />
            </template>
          </Column>

          <Column field="start_date" header="开始日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.start_date) }}
              </span>
            </template>
          </Column>

          <Column field="due_date" header="预期完成日期" sortable>
            <template #body="slotProps">
              <span class="text-sm" :class="getDueDateClass(slotProps.data.due_date)">
                {{ formatDate(slotProps.data.due_date) }}
              </span>
            </template>
          </Column>

          <Column header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex align-items-center gap-1">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  rounded
                  text
                  size="small"
                  @click="viewOrder(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status !== 'completed' && slotProps.data.status !== 'cancelled'"
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="editOrder(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'pending'"
                  v-tooltip="'确认订单'"
                  icon="pi pi-check"
                  rounded
                  text
                  size="small"
                  @click="confirmOrder(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'confirmed'"
                  v-tooltip="'开始生产'"
                  icon="pi pi-play"
                  rounded
                  text
                  size="small"
                  @click="startProduction(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'producing'"
                  v-tooltip="'完成生产'"
                  icon="pi pi-stop"
                  rounded
                  text
                  size="small"
                  @click="completeProduction(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status !== 'completed' && slotProps.data.status !== 'cancelled'"
                  v-tooltip="'取消订单'"
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmCancelOrder(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 生产订单对话框 -->
    <Dialog
      v-model:visible="showOrderDialog"
      :header="editingOrder ? '编辑生产订单' : '新建生产订单'"
      :style="{ width: '800px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">订单号</label>
              <InputText v-model="orderForm.order_no" :disabled="true" placeholder="系统自动生成" />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">产品名称 *</label>
              <Dropdown
                v-model="orderForm.product_id"
                :options="productOptions"
                option-label="label"
                option-value="value"
                placeholder="选择产品"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">计划数量 *</label>
              <InputNumber
                v-model="orderForm.quantity"
                :min="1"
                show-buttons
                placeholder="输入计划数量"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">车间 *</label>
              <Dropdown
                v-model="orderForm.workshop_id"
                :options="workshopOptions"
                option-label="label"
                option-value="value"
                placeholder="选择车间"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">优先级</label>
              <Dropdown
                v-model="orderForm.priority"
                :options="priorityOptions"
                option-label="label"
                option-value="value"
                placeholder="选择优先级"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">开始日期 *</label>
              <Calendar
                v-model="orderForm.start_date"
                placeholder="选择开始日期"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">预期完成日期 *</label>
              <Calendar
                v-model="orderForm.due_date"
                placeholder="选择预期完成日期"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">订单说明</label>
            <Textarea
              v-model="orderForm.notes"
              placeholder="请输入订单说明"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="取消" icon="pi pi-times" outlined @click="closeOrderDialog" />
          <Button v-if="dialogMode !== 'view'" label="保存" icon="pi pi-check" :loading="saving" @click="saveOrder" />
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
import InputNumber from 'primevue/inputnumber'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import ProgressBar from 'primevue/progressbar'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import Skeleton from 'primevue/skeleton'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '生产订单管理 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showOrderDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const editingOrder = ref(null as any)
const confirm = useConfirm()

// 筛选条件
const searchQuery = ref('')
const statusFilter = ref('')
const workshopFilter = ref('')
const priorityFilter = ref('')

// 表单数据
const orderForm = ref({
  order_no: '',
  product_id: '',
  quantity: 1,
  workshop_id: '',
  priority: 'medium',
  start_date: new Date(),
  due_date: null as Date | null,
  notes: '',
})

// 选项数据
const statusOptions = ref([
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '生产中', value: 'producing' },
  { label: '已完工', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
])

const workshopOptions = ref([
  { label: '装配车间', value: 'assembly' },
  { label: '机加工车间', value: 'machining' },
  { label: '喷涂车间', value: 'painting' },
  { label: '包装车间', value: 'packaging' },
])

const priorityOptions = ref([
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
])

const productOptions = ref([
  { label: '产品A', value: 'product-a' },
  { label: '产品B', value: 'product-b' },
  { label: '产品C', value: 'product-c' },
])

// 统计数据
const orderStats = ref({
  todayNew: 8,
  producing: 15,
  completed: 42,
  delayed: 3,
})

// 模拟数据
const mockOrders = ref([
  {
    id: '1',
    order_no: 'PO-2024-001',
    product_name: '智能手机组件',
    quantity: 1000,
    produced_quantity: 750,
    workshop_name: '装配车间',
    status: 'producing',
    priority: 'high',
    start_date: new Date('2024-01-15'),
    due_date: new Date('2024-01-25'),
    notes: '紧急订单，需优先生产',
  },
  {
    id: '2',
    order_no: 'PO-2024-002',
    product_name: '电脑配件',
    quantity: 500,
    produced_quantity: 500,
    workshop_name: '机加工车间',
    status: 'completed',
    priority: 'medium',
    start_date: new Date('2024-01-10'),
    due_date: new Date('2024-01-20'),
    notes: '常规生产订单',
  },
])

// 计算属性
const filteredOrders = computed(() => {
  let result = mockOrders.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      order => order.order_no.toLowerCase().includes(query) || order.product_name.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    result = result.filter(order => order.status === statusFilter.value)
  }

  if (workshopFilter.value) {
    result = result.filter(order => order.workshop_name === workshopFilter.value)
  }

  if (priorityFilter.value) {
    result = result.filter(order => order.priority === priorityFilter.value)
  }

  return result
})

const totalCount = computed(() => mockOrders.value.length)

// 映射对象
const statusMap: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  producing: '生产中',
  completed: '已完工',
  cancelled: '已取消',
}

const statusSeverityMap: Record<string, string> = {
  pending: 'warning',
  confirmed: 'info',
  producing: 'success',
  completed: 'success',
  cancelled: 'danger',
}

const priorityMap: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
}

const prioritySeverityMap: Record<string, string> = {
  low: 'secondary',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info'
const getPriorityDisplayName = (priority: string) => priorityMap[priority] || priority
const getPrioritySeverity = (priority: string) => prioritySeverityMap[priority] || 'info'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const getDueDateClass = (dueDate: Date) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-red-600' // 已过期
  if (diffDays <= 3) return 'text-orange-600' // 即将到期
  return 'text-muted-color' // 正常
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  workshopFilter.value = ''
  priorityFilter.value = ''
}

const handleCreate = () => {
  editingOrder.value = null
  dialogMode.value = 'create'
  orderForm.value = {
    order_no: `PO-${Date.now()}`,
    product_id: '',
    quantity: 1,
    workshop_id: '',
    priority: 'medium',
    start_date: new Date(),
    due_date: null,
    notes: '',
  }
  showOrderDialog.value = true
}

const viewOrder = (order: any) => {
  editingOrder.value = order
  dialogMode.value = 'view'
  Object.assign(orderForm.value, order)
  showOrderDialog.value = true
}

const editOrder = (order: any) => {
  editingOrder.value = order
  dialogMode.value = 'edit'
  Object.assign(orderForm.value, order)
  showOrderDialog.value = true
}

const confirmOrder = async (order: any) => {
  confirm.require({
    message: `确定要确认订单 ${order.order_no} 吗？`,
    header: '确认订单',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockOrders.value.findIndex(o => o.id === order.id)
        if (index !== -1 && mockOrders.value[index]) {
          mockOrders.value[index]!.status = 'confirmed'
        }
      } catch (error) {
        console.error('确认订单失败:', error)
      }
    },
  })
}

const startProduction = async (order: any) => {
  confirm.require({
    message: `确定要开始生产订单 ${order.order_no} 吗？`,
    header: '开始生产',
    icon: 'pi pi-play',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockOrders.value.findIndex(o => o.id === order.id)
        if (index !== -1 && mockOrders.value[index]) {
          mockOrders.value[index]!.status = 'producing'
        }
      } catch (error) {
        console.error('开始生产失败:', error)
      }
    },
  })
}

const completeProduction = async (order: any) => {
  confirm.require({
    message: `确定要完成订单 ${order.order_no} 的生产吗？`,
    header: '完成生产',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockOrders.value.findIndex(o => o.id === order.id)
        if (index !== -1 && mockOrders.value[index]) {
          mockOrders.value[index]!.status = 'completed'
          mockOrders.value[index]!.produced_quantity = mockOrders.value[index]!.quantity
        }
      } catch (error) {
        console.error('完成生产失败:', error)
      }
    },
  })
}

const confirmCancelOrder = (order: any) => {
  confirm.require({
    message: `确定要取消订单 ${order.order_no} 吗？`,
    header: '取消订单',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      cancelOrder(order.id)
    },
  })
}

const cancelOrder = (orderId: string) => {
  const index = mockOrders.value.findIndex(order => order.id === orderId)
  if (index !== -1 && mockOrders.value[index]) {
    mockOrders.value[index]!.status = 'cancelled'
  }
}

const closeOrderDialog = () => {
  showOrderDialog.value = false
  editingOrder.value = null
}

const saveOrder = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (dialogMode.value === 'create') {
      const newOrder = {
        id: Date.now().toString(),
        ...orderForm.value,
        product_name: productOptions.value.find(p => p.value === orderForm.value.product_id)?.label || '',
        workshop_name: workshopOptions.value.find(w => w.value === orderForm.value.workshop_id)?.label || '',
        status: 'pending',
        produced_quantity: 0,
        due_date: orderForm.value.due_date || new Date(),
      }
      mockOrders.value.push(newOrder as any)
    } else if (dialogMode.value === 'edit') {
      const index = mockOrders.value.findIndex(o => o.id === editingOrder.value?.id)
      if (index !== -1 && mockOrders.value[index]) {
        mockOrders.value[index] = {
          ...mockOrders.value[index],
          ...orderForm.value,
          product_name:
            productOptions.value.find(p => p.value === orderForm.value.product_id)?.label ||
            mockOrders.value[index]!.product_name,
          workshop_name:
            workshopOptions.value.find(w => w.value === orderForm.value.workshop_id)?.label ||
            mockOrders.value[index]!.workshop_name,
          due_date: orderForm.value.due_date || new Date(),
        }
      }
    }

    closeOrderDialog()
  } catch (error) {
    console.error('保存订单失败:', error)
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  // 这里可以加载实际数据
})
</script>
