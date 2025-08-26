<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">销售订单</h1>
        <p class="text-muted-foreground">管理和跟踪销售订单信息，优化销售流程</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="importOrders">
          <Upload class="mr-2 h-4 w-4" />
          导入订单
        </Button>
        <Button size="sm" @click="openOrderModal">
          <Plus class="mr-2 h-4 w-4" />
          新建订单
        </Button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Search class="h-5 w-5" />
          搜索与筛选
        </CardTitle>
        <CardDescription>快速找到您需要的订单</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>搜索订单</Label>
            <div class="relative">
              <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input v-model="searchKeyword" placeholder="搜索订单号、客户名称..." class="pl-9" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>订单状态</Label>
            <Select v-model="selectedStatus">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem
                  v-for="status in statusOptions"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>日期范围</Label>
            <div class="flex gap-2">
              <Input v-model="dateRange.start" type="date" class="flex-1" />
              <Input v-model="dateRange.end" type="date" class="flex-1" />
            </div>
          </div>

          <div class="space-y-2">
            <Label class="opacity-0">操作</Label>
            <div class="flex gap-2">
              <Button variant="outline" class="flex-1" @click="resetFilters">
                <RotateCcw class="mr-2 h-4 w-4" />
                重置
              </Button>
              <Button variant="outline" @click="exportData">
                <Download class="mr-2 h-4 w-4" />
                导出
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 统计信息卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">总订单数</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold">{{ filteredOrders.length }}</p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +12.5%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">
                本月新增 {{ Math.floor(filteredOrders.length * 0.3) }} 个
              </p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
            >
              <ShoppingCart class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">待处理订单</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold">{{ pendingOrdersCount }}</p>
                <Badge variant="destructive" class="text-xs">紧急</Badge>
              </div>
              <p class="text-xs text-muted-foreground">需要及时处理</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900"
            >
              <Clock class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">总销售额</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold">¥{{ totalAmount.toLocaleString() }}</p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +15.3%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">本月累计收入</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            >
              <DollarSign class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 订单列表 -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle class="flex items-center gap-2">
              <FileText class="h-5 w-5" />
              订单列表
            </CardTitle>
            <CardDescription>
              当前共有 {{ filteredOrders.length }} 个订单，总金额 ¥{{
                totalAmount.toLocaleString()
              }}
            </CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="pageSize">
              <SelectTrigger class="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10条/页</SelectItem>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" @click="refreshData">
              <RefreshCw class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
            <Skeleton class="h-8 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="text-center py-16">
          <ShoppingCart class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 class="text-xl font-semibold mb-4">暂无订单数据</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            您还没有创建任何订单。点击下方按钮开始创建您的第一个订单。
          </p>
          <Button @click="openOrderModal">
            <Plus class="mr-2 h-4 w-4" />
            创建订单
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in paginatedOrders"
            :key="order.id"
            class="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText class="h-6 w-6 text-primary" />
                </div>
                <div class="space-y-1">
                  <div class="flex items-center space-x-2">
                    <Badge variant="outline" class="font-mono">
                      {{ order.orderNo }}
                    </Badge>
                    <Badge :variant="getStatusVariant(order.status)">
                      {{ getStatusText(order.status) }}
                    </Badge>
                  </div>
                  <p class="font-medium">{{ order.customerName }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ formatDate(order.orderDate) }} • {{ formatTimeAgo(order.orderDate) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <p class="text-lg font-bold text-green-600">
                    ¥{{ order.amount.toLocaleString() }}
                  </p>
                  <p class="text-xs text-muted-foreground">含税金额</p>
                </div>
                <div class="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" @click="viewOrder(order)">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="editOrder(order)">
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="duplicateOrder(order)">
                    <Copy class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="confirmDelete(order)">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="flex items-center justify-between pt-4">
            <p class="text-sm text-muted-foreground">
              显示第 {{ (currentPage - 1) * Number(pageSize) + 1 }} -
              {{ Math.min(currentPage * Number(pageSize), filteredOrders.length) }} 条，共
              {{ filteredOrders.length }} 条记录
            </p>
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <ChevronLeft class="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                下一页
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 订单详情/编辑对话框 -->
    <Dialog v-model:open="showOrderModal">
      <DialogContent class="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <ShoppingCart class="h-5 w-5" />
            {{ modalTitle }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? '编辑订单信息' : '创建新的销售订单' }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-6 py-4">
          <!-- 基本信息 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <Info class="h-4 w-4" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>订单号</Label>
                  <Input
                    v-model="currentOrder.orderNo"
                    placeholder="系统自动生成"
                    :disabled="isEditing"
                    class="font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <Label>客户名称 *</Label>
                  <Select v-model="currentOrder.customerName">
                    <SelectTrigger>
                      <SelectValue placeholder="选择客户" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="customer in customerOptions"
                        :key="customer.value"
                        :value="customer.value"
                      >
                        {{ customer.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 订单详情 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <Package class="h-4 w-4" />
                订单详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>订单金额 *</Label>
                  <Input v-model="currentOrder.amount" type="number" placeholder="输入订单金额" />
                </div>
                <div class="space-y-2">
                  <Label>订单状态</Label>
                  <Select v-model="currentOrder.status">
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="status in statusOptions"
                        :key="status.value"
                        :value="status.value"
                      >
                        {{ status.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label>订单日期</Label>
                  <Input v-model="currentOrder.orderDate" type="date" />
                </div>
                <div class="space-y-2">
                  <Label>预计交付日期</Label>
                  <Input v-model="currentOrder.deliveryDate" type="date" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 备注信息 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <MessageSquare class="h-4 w-4" />
                备注信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <Label>订单备注</Label>
                <Textarea
                  v-model="currentOrder.remarks"
                  placeholder="输入订单备注信息..."
                  rows="4"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeOrderModal">取消</Button>
          <Button :disabled="saving" @click="saveOrder">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditing ? '更新订单' : '创建订单' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要删除订单 "{{ deleteTarget?.orderNo }}" 吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction @click="deleteOrder">删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Info,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Upload,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '销售订单 - 智能ERP管理系统',
})

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const selectedStatus = ref('')
const dateRange = ref({
  start: '',
  end: '',
})
const pageSize = ref('20')
const currentPage = ref(1)

// 对话框状态
const showOrderModal = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)

interface Order {
  id: string
  orderNo: string
  customerName: string
  amount: number
  status: string
  orderDate: Date
  deliveryDate: Date
  remarks: string
  created_at: Date
  updated_at: Date
}

const deleteTarget = ref<Order | null>(null)

// 当前编辑的订单
const currentOrder = ref({
  id: '',
  orderNo: '',
  customerName: '',
  amount: 0,
  status: 'pending',
  orderDate: new Date().toISOString().split('T')[0],
  deliveryDate: new Date().toISOString().split('T')[0],
  remarks: '',
  created_at: new Date(),
  updated_at: new Date(),
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
    updated_at: new Date('2025-01-15'),
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
    updated_at: new Date('2025-01-16'),
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
    updated_at: new Date('2025-01-17'),
  },
  {
    id: '4',
    orderNo: 'SO-2025-004',
    customerName: '深圳创新科技有限公司',
    amount: 234500,
    status: 'production',
    orderDate: new Date('2025-01-18'),
    deliveryDate: new Date('2025-02-05'),
    remarks: '大批量订单，分批交付',
    created_at: new Date('2025-01-18'),
    updated_at: new Date('2025-01-18'),
  },
  {
    id: '5',
    orderNo: 'SO-2025-005',
    customerName: '广州精密制造有限公司',
    amount: 156780,
    status: 'delivered',
    orderDate: new Date('2025-01-19'),
    deliveryDate: new Date('2025-01-28'),
    remarks: '已完成交付，客户满意',
    created_at: new Date('2025-01-19'),
    updated_at: new Date('2025-01-19'),
  },
])

// 状态选项
const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '生产中', value: 'production' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'delivered' },
  { label: '已取消', value: 'cancelled' },
]

// 客户选项
const customerOptions = [
  { label: '苏州华智科技有限公司', value: '苏州华智科技有限公司' },
  { label: '上海浦东制造有限公司', value: '上海浦东制造有限公司' },
  { label: '北京智能设备有限公司', value: '北京智能设备有限公司' },
  { label: '深圳创新科技有限公司', value: '深圳创新科技有限公司' },
  { label: '广州精密制造有限公司', value: '广州精密制造有限公司' },
]

// 计算属性
const filteredOrders = computed(() => {
  let result = orders.value

  if (searchKeyword.value) {
    result = result.filter(
      order =>
        order.orderNo.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    result = result.filter(order => order.status === selectedStatus.value)
  }

  if (dateRange.value.start && dateRange.value.end) {
    const startDate = new Date(dateRange.value.start)
    const endDate = new Date(dateRange.value.end)
    result = result.filter(order => {
      const orderDate = new Date(order.orderDate)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  return result
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * Number(pageSize.value)
  const end = start + Number(pageSize.value)
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / Number(pageSize.value))
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
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: string) => {
  const variantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    pending: 'outline',
    confirmed: 'secondary',
    production: 'secondary',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
  }
  return variantMap[status] || 'secondary'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffTime = now.getTime() - new Date(date).getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return `${Math.floor(diffDays / 30)}月前`
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedStatus.value = ''
  dateRange.value = { start: '', end: '' }
}

const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

const exportData = () => {
  console.log('导出数据')
}

const importOrders = () => {
  console.log('导入订单')
}

const openOrderModal = () => {
  isEditing.value = false
  currentOrder.value = {
    id: '',
    orderNo: `SO-${new Date().getFullYear()}-${String(orders.value.length + 1).padStart(3, '0')}`,
    customerName: '',
    amount: 0,
    status: 'pending',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    remarks: '',
    created_at: new Date(),
    updated_at: new Date(),
  }
  showOrderModal.value = true
}

const editOrder = (order: Order) => {
  isEditing.value = true
  currentOrder.value = {
    ...order,
    orderDate: new Date(order.orderDate).toISOString().split('T')[0],
    deliveryDate: new Date(order.deliveryDate).toISOString().split('T')[0],
    created_at: new Date(),
    updated_at: new Date(),
  }
  showOrderModal.value = true
}

const viewOrder = (order: Order) => {
  editOrder(order)
}

const duplicateOrder = (order: Order) => {
  isEditing.value = false
  currentOrder.value = {
    ...order,
    id: '',
    orderNo: `SO-${new Date().getFullYear()}-${String(orders.value.length + 1).padStart(3, '0')}`,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    created_at: new Date(),
    updated_at: new Date(),
  }
  showOrderModal.value = true
}

const confirmDelete = (order: Order) => {
  deleteTarget.value = order
  showDeleteDialog.value = true
}

const deleteOrder = () => {
  if (deleteTarget.value) {
    const index = orders.value.findIndex(o => o.id === deleteTarget.value!.id)
    if (index !== -1) {
      orders.value.splice(index, 1)
    }
  }
  showDeleteDialog.value = false
  deleteTarget.value = null
}

const saveOrder = async () => {
  try {
    saving.value = true

    if (isEditing.value) {
      const index = orders.value.findIndex(o => o.id === currentOrder.value.id)
      if (index !== -1) {
        orders.value[index] = {
          ...currentOrder.value,
          amount: Number(currentOrder.value.amount),
          orderDate: new Date(currentOrder.value.orderDate!),
          deliveryDate: new Date(currentOrder.value.deliveryDate!),
          updated_at: new Date(),
        }
      }
    } else {
      const newOrder = {
        ...currentOrder.value,
        id: Date.now().toString(),
        amount: Number(currentOrder.value.amount),
        orderDate: new Date(currentOrder.value.orderDate!),
        deliveryDate: new Date(currentOrder.value.deliveryDate!),
        created_at: new Date(),
        updated_at: new Date(),
      }
      orders.value.push(newOrder)
    }

    closeOrderModal()
  } catch (error) {
    console.error('保存订单失败:', error)
  } finally {
    saving.value = false
  }
}

const closeOrderModal = () => {
  showOrderModal.value = false
  isEditing.value = false
}

// 监听分页变化
watch([pageSize, filteredOrders], () => {
  currentPage.value = 1
})
</script>
