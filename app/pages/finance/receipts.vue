<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-gray-900 mb-2">收款单管理</h1>
        <p class="text-gray-600">管理客户收款记录和回款情况</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="w-4 h-4 mr-2" />
        新建收款单
      </Button>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card class="bg-blue-50 border-blue-200">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-blue-600 mb-1">
                {{ receiptStats.totalReceipts }}
              </div>
              <div class="text-sm text-blue-700">总收款数</div>
            </div>
            <div class="w-12 h-12 bg-blue-100 -full flex items-center justify-center">
              <CreditCard class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-orange-50 border-orange-200">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-orange-600 mb-1">
                {{ receiptStats.draftReceipts }}
              </div>
              <div class="text-sm text-orange-700">待确认</div>
            </div>
            <div class="w-12 h-12 bg-orange-100 -full flex items-center justify-center">
              <Clock class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-green-50 border-green-200">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-green-600 mb-1">
                {{ receiptStats.confirmedReceipts }}
              </div>
              <div class="text-sm text-green-700">已确认</div>
            </div>
            <div class="w-12 h-12 bg-green-100 -full flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-purple-50 border-purple-200">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-purple-600 mb-1">
                ¥{{ formatCurrency(receiptStats.totalAmount) }}
              </div>
              <div class="text-sm text-purple-700">总收入</div>
            </div>
            <div class="w-12 h-12 bg-purple-100 -full flex items-center justify-center">
              <DollarSign class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 搜索筛选 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">搜索筛选</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">搜索</Label>
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <Input v-model="searchQuery" placeholder="单据号、客户名称..." class="pl-10" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">状态</Label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">收款方式</Label>
            <Select v-model="paymentMethodFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部方式</SelectItem>
                <SelectItem value="bank_transfer">银行转账</SelectItem>
                <SelectItem value="cash">现金</SelectItem>
                <SelectItem value="check">支票</SelectItem>
                <SelectItem value="alipay">支付宝</SelectItem>
                <SelectItem value="wechat">微信</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">开始日期</Label>
            <Input v-model="dateRange" type="date" placeholder="开始日期" />
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">结束日期</Label>
            <Input v-model="dateRange" type="date" placeholder="结束日期" />
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium opacity-0">操作</Label>
            <Button variant="outline" class="w-full" @click="resetFilters">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 收款单列表 -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle class="text-lg font-semibold">收款单列表</CardTitle>
          <span class="text-sm text-gray-600">总收入: ¥{{ formatCurrency(totalAmount) }}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center py-8">
          <Loader2 class="w-6 h-6 animate-spin" />
        </div>

        <div v-else-if="filteredReceipts.length === 0" class="text-center py-12 text-gray-500">
          <FileText class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 class="text-lg mb-2">暂无收款单数据</h3>
          <p class="mb-4">开始创建您的第一个收款单</p>
          <Button @click="showCreateDialog = true">
            <Plus class="w-4 h-4 mr-2" />
            新建收款单
          </Button>
        </div>

        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>收款单号</TableHead>
                <TableHead>客户名称</TableHead>
                <TableHead>收款金额</TableHead>
                <TableHead>收款账户</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>备注</TableHead>
                <TableHead class="w-40">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="receipt in filteredReceipts" :key="receipt.id">
                <TableCell>
                  <div>
                    <span class="font-mono bg-gray-100 px-2 py-1 text-blue-600 text-sm">
                      {{ receipt.receipt_no }}
                    </span>
                    <div class="text-sm text-gray-500 mt-1">
                      {{ formatDate(receipt.receipt_date) }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-100 -full flex items-center justify-center">
                      <span class="text-blue-600 text-sm font-medium">
                        {{ receipt.customer_name.charAt(0) }}
                      </span>
                    </div>
                    <span class="font-medium">{{ receipt.customer_name }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span class="font-semibold text-green-600 text-lg">
                      ¥{{ formatCurrency(receipt.amount) }}
                    </span>
                    <div class="text-sm text-gray-500">
                      {{ getPaymentMethodName(receipt.payment_method) }}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span v-if="receipt.receiver_account" class="font-mono text-sm text-gray-500">
                    {{ receipt.receiver_account }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(receipt.status)">
                    {{ getStatusName(receipt.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-gray-500">
                    {{ receipt.remark || '-' }}
                  </span>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button variant="outline" size="sm" @click="viewReceipt(receipt)">
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      :disabled="receipt.status === 'confirmed'"
                      @click="editReceipt(receipt)"
                    >
                      <Edit class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      :disabled="receipt.status === 'confirmed'"
                      @click="confirmReceipt(receipt.id)"
                    >
                      <CheckCircle class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      :disabled="receipt.status === 'confirmed'"
                      @click="confirmDeleteReceipt(receipt)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 新建/编辑收款单对话框 -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingReceipt ? '编辑收款单' : '新增收款单' }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-6">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold border-b pb-2">基本信息</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>收款单号 *</Label>
                <Input
                  v-model="receiptForm.receipt_no"
                  placeholder="系统自动生成"
                  :disabled="!!editingReceipt"
                />
              </div>

              <div class="space-y-2">
                <Label>收款日期 *</Label>
                <Input v-model="receiptForm.receipt_date" type="date" placeholder="选择日期" />
              </div>

              <div class="space-y-2">
                <Label>客户 *</Label>
                <Select v-model="receiptForm.customer_id">
                  <SelectTrigger>
                    <SelectValue placeholder="选择客户" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="customer in customers"
                      :key="customer.id"
                      :value="customer.id"
                    >
                      {{ customer.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label>状态 *</Label>
                <Select v-model="receiptForm.status">
                  <SelectTrigger>
                    <SelectValue placeholder="请选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="option in statusOptions.slice(1)"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <!-- 收款信息 -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold border-b pb-2">收款信息</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>收款金额 *</Label>
                <Input
                  v-model="receiptForm.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div class="space-y-2">
                <Label>收款方式 *</Label>
                <Select v-model="receiptForm.payment_method">
                  <SelectTrigger>
                    <SelectValue placeholder="请选择方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="option in paymentMethodOptions.slice(1)"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="space-y-2">
              <Label>收款账户</Label>
              <Input v-model="receiptForm.receiver_account" placeholder="请输入收款账户" />
            </div>

            <div class="space-y-2">
              <Label>备注</Label>
              <Textarea v-model="receiptForm.remark" placeholder="请输入备注信息" rows="3" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeCreateDialog">取消</Button>
          <Button :disabled="saving" @click="saveReceipt">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '收款单管理 - ERP 管理系统',
})

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingReceipt = ref<any>(null)
const dialogMode = ref('create')

// 收款单表单初始化函数
const initReceiptForm = () => ({
  receipt_no: '',
  receipt_date: new Date().toISOString().split('T')[0],
  customer_id: '',
  amount: 0,
  payment_method: '',
  receiver_account: '',
  status: 'draft',
  remark: '',
  created_at: new Date(),
  updated_at: new Date(),
})

// 搜索筛选
const searchQuery = ref('')
const statusFilter = ref('')
const paymentMethodFilter = ref('')
const dateRange = ref<string | undefined>(undefined)

// 状态选项
const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已取消', value: 'cancelled' },
])

// 收款方式选项
const paymentMethodOptions = ref([
  { label: '全部方式', value: '' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '现金', value: 'cash' },
  { label: '支票', value: 'check' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信', value: 'wechat' },
])

// 收款单表单
const receiptForm = ref(initReceiptForm())

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
    created_at: '2025-01-15T10:00:00Z',
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
    created_at: '2025-01-16T14:30:00Z',
  },
])

const customers = ref([
  { id: 'C001', name: '苏州华智科技有限公司' },
  { id: 'C002', name: '上海浦东制造有限公司' },
  { id: 'C003', name: '北京智能设备有限公司' },
])

const receiptStats = ref({
  totalReceipts: 189,
  draftReceipts: 12,
  confirmedReceipts: 165,
  totalAmount: 3280000,
})

// 计算属性
const filteredReceipts = computed(() => {
  let result = receipts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      receipt =>
        receipt.receipt_no.toLowerCase().includes(query)
        || receipt.customer_name.toLowerCase().includes(query),
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
    day: '2-digit',
  }).format(new Date(date))
}

const getStatusName = (status: string) => {
  const nameMap: Record<string, string> = {
    draft: '草稿',
    confirmed: '已确认',
    cancelled: '已取消',
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
    other: '其他',
  }
  return nameMap[method] || method
}

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    draft: 'secondary',
    confirmed: 'default',
    cancelled: 'destructive',
  }
  return variantMap[status] || 'secondary'
}

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
  }
  catch (err) {
    console.error('确认收款单失败:', err)
  }
}

const deleteReceipt = async (id: string) => {
  try {
    console.log('删除收款单:', id)
    receipts.value = receipts.value.filter(receipt => receipt.id !== id)
  }
  catch (err) {
    console.error('删除收款单失败:', err)
  }
}

const confirmDeleteReceipt = (receipt: any) => {
  if (window.confirm(`确定要删除收款单 ${receipt.receipt_no} 吗？`)) {
    deleteReceipt(receipt.id)
  }
}

// 对话框操作
const closeCreateDialog = () => {
  showCreateDialog.value = false
  editingReceipt.value = null
  dialogMode.value = 'create'
  receiptForm.value = initReceiptForm()
}

const saveReceipt = async () => {
  saving.value = true
  try {
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingReceipt.value) {
      // 更新现有收款单
      const index = receipts.value.findIndex(r => r.id === editingReceipt.value.id)
      if (index !== -1) {
        receipts.value[index] = {
          ...receiptForm.value,
          id: editingReceipt.value.id,
          updated_at: new Date(),
        } as any
      }
      console.log('收款单更新成功')
    }
    else {
      // 创建新收款单
      const newReceipt = {
        ...receiptForm.value,
        id: Date.now(),
        receipt_no: `REC${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date(),
      }
      receipts.value.unshift(newReceipt as any)
      console.log('收款单创建成功')
    }

    closeCreateDialog()
  }
  catch (error) {
    console.error('保存收款单失败:', error)
  }
  finally {
    saving.value = false
  }
}

// 其他操作
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  paymentMethodFilter.value = ''
  dateRange.value = undefined
}

// 初始化数据
onMounted(() => {
  // 初始化逻辑
})
</script>
