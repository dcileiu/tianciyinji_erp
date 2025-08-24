<template>
  <div class="p-6 min-h-screen bg-background">
    <!-- 页面标题 -->
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-foreground mb-2">财务支付</h1>
        <p class="text-muted-foreground">管理付款记录和支付流程</p>
      </div>
      <Button @click="openPaymentModal">
        <Plus class="w-4 h-4 mr-2" />
        新建支付
      </Button>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">搜索</Label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model="searchKeyword"
                placeholder="搜索单号、供应商..."
                class="pl-10"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">支付状态</Label>
            <Select v-model="selectedStatus">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">支付方式</Label>
            <Select v-model="selectedMethod">
              <SelectTrigger>
                <SelectValue placeholder="全部方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in methodOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">日期范围</Label>
            <Input
              v-model="dateRange"
              type="date"
              placeholder="选择日期范围"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium opacity-0">操作</Label>
            <Button variant="outline" @click="resetFilters">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-blue-600 mb-1">{{ filteredPayments.length }}</div>
              <div class="text-sm text-blue-700">总支付数</div>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-orange-600 mb-1">{{ pendingPaymentsCount }}</div>
              <div class="text-sm text-orange-700">待支付</div>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-green-50 dark:bg-green-900/20 border-green-200">
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-green-600 mb-1">¥{{ totalAmount.toLocaleString() }}</div>
              <div class="text-sm text-green-700">总金额</div>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
            
    <!-- 支付列表 -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle class="text-lg font-semibold">支付列表</CardTitle>
          <span class="text-sm text-muted-foreground">总金额: ¥{{ totalAmount.toLocaleString() }}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center py-8">
          <Loader2 class="w-6 h-6 animate-spin" />
        </div>
        <div v-else-if="filteredPayments.length === 0" class="text-center py-12">
          <CreditCard class="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 class="text-lg mb-2">暂无支付记录</h3>
          <p class="mb-4 text-muted-foreground">开始创建您的第一个支付记录</p>
          <Button @click="openPaymentModal">
            <Plus class="w-4 h-4 mr-2" />
            新建支付
          </Button>
        </div>
        <div v-else class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>支付单号</TableHead>
                <TableHead>供应商</TableHead>
                <TableHead>支付金额</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>支付日期</TableHead>
                <TableHead class="w-40">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="payment in filteredPayments" :key="payment.id">
                <TableCell>
                  <span class="font-mono bg-muted px-2 py-1 rounded text-primary text-sm">{{ payment.paymentNo }}</span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-primary">{{ payment.supplier.charAt(0) }}</span>
                    </div>
                    <span class="font-medium">{{ payment.supplier }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span class="font-semibold text-green-600 text-lg">¥{{ payment.amount.toLocaleString() }}</span>
                </TableCell>
                <TableCell>
                  <Badge :variant="getMethodVariant(payment.paymentMethod)">
                    {{ getMethodText(payment.paymentMethod) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(payment.status)">
                    {{ getStatusText(payment.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground">{{ formatDate(payment.paymentDate) }}</span>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button variant="outline" size="sm" @click="viewPayment(payment)">
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" @click="editPayment(payment)">
                      <Edit class="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" @click="confirmDelete(payment)">
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

    <!-- 支付详情/编辑对话框 -->
    <Dialog v-model:open="showPaymentModal">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ modalTitle }}</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label class="text-sm font-medium">支付单号</Label>
              <Input
                v-model="currentPayment.paymentNo"
                placeholder="自动生成"
                :disabled="isEditing"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label class="text-sm font-medium">供应商</Label>
              <Select v-model="currentPayment.supplier">
                <SelectTrigger>
                  <SelectValue placeholder="选择供应商" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="supplier in supplierOptions" :key="supplier.value" :value="supplier.value">
                    {{ supplier.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label class="text-sm font-medium">支付金额</Label>
              <Input
                v-model="currentPayment.amount"
                type="number"
                placeholder="输入支付金额"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label class="text-sm font-medium">支付方式</Label>
              <Select v-model="currentPayment.paymentMethod">
                <SelectTrigger>
                  <SelectValue placeholder="选择支付方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="method in methodOptions" :key="method.value" :value="method.value">
                    {{ method.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label class="text-sm font-medium">支付日期</Label>
              <Input
                v-model="currentPayment.paymentDate"
                type="date"
                placeholder="选择支付日期"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label class="text-sm font-medium">状态</Label>
              <Select v-model="currentPayment.status">
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="status in statusOptions" :key="status.value" :value="status.value">
                    {{ status.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            
          <div class="flex flex-col gap-2">
            <Label class="text-sm font-medium">描述</Label>
            <Textarea 
              v-model="currentPayment.description"
              placeholder="输入支付描述"
              :rows="3"
            />
          </div>
        </div>
            
        <DialogFooter>
          <Button variant="outline" @click="closePaymentModal">
            取消
          </Button>
          <Button @click="savePayment" :disabled="saving">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEditing ? '更新' : '创建' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Plus, Search, RefreshCw, CreditCard, Clock, DollarSign, Eye, Edit, Trash2, Loader2 } from 'lucide-vue-next'

// 页面状态
const loading = ref(false)
const saving = ref(false)

// 搜索过滤
const searchKeyword = ref('')
const selectedStatus = ref('')
const selectedMethod = ref('')
const startDate = ref('')
const endDate = ref('')

// 对话框状态
const showPaymentModal = ref(false)
const isEditing = ref(false)
const currentPayment = ref({})
const dialogMode = ref('create')

// 初始化当前支付记录
const initCurrentPayment = () => ({
  id: null,
  paymentNo: '',
  supplier: '',
  amount: 0,
  paymentMethod: '',
  status: 'pending',
  paymentDate: '',
  description: ''
})

currentPayment.value = initCurrentPayment()

// 模拟支付数据
const payments = ref([
  {
    id: '1',
    paymentNo: 'PAY-2025-001',
    supplier: '钢材供应商A',
    amount: 125420,
    paymentMethod: 'bank_transfer',
    status: 'completed',
    paymentDate: new Date('2025-01-15'),
    description: '采购钢材货款',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15')
  },
  {
    id: '2',
    paymentNo: 'PAY-2025-002',
    supplier: '电子器件供应商B',
    amount: 89500,
    paymentMethod: 'credit_card',
    status: 'pending',
    paymentDate: new Date('2025-01-16'),
    description: '电子元件采购',
    created_at: new Date('2025-01-16'),
    updated_at: new Date('2025-01-16')
  },
  {
    id: '3',
    paymentNo: 'PAY-2025-003',
    supplier: '物流公司C',
    amount: 15600,
    paymentMethod: 'alipay',
    status: 'processing',
    paymentDate: new Date('2025-01-17'),
    description: '运输费用',
    created_at: new Date('2025-01-17'),
    updated_at: new Date('2025-01-17')
  }
])

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待支付', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

// 支付方式选项
const methodOptions = [
  { label: '全部方式', value: '' },
  { label: '银行转账', value: 'bank_transfer' },
  { label: '信用卡', value: 'credit_card' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信支付', value: 'wechat_pay' },
  { label: '现金', value: 'cash' }
]

// 供应商选项
const supplierOptions = [
  { label: '钢材供应商A', value: '钢材供应商A' },
  { label: '电子器件供应商B', value: '电子器件供应商B' },
  { label: '物流公司C', value: '物流公司C' }
]

// 计算属性
const filteredPayments = computed(() => {
  let result = payments.value
  
  if (searchKeyword.value) {
    result = result.filter(payment =>
      payment.paymentNo.toLowerCase().includes(searchKeyword.value.toLowerCase())
      || payment.supplier.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (selectedStatus.value) {
    result = result.filter(payment => payment.status === selectedStatus.value)
  }
  
  if (selectedMethod.value) {
    result = result.filter(payment => payment.paymentMethod === selectedMethod.value)
  }
  
  return result
})

const pendingPaymentsCount = computed(() => {
  return payments.value.filter(p => p.status === 'pending').length
})

const totalAmount = computed(() => {
  return filteredPayments.value.reduce((sum, payment) => sum + payment.amount, 0)
})

const modalTitle = computed(() => {
  return isEditing.value ? '编辑支付' : '新建支付'
})

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: string) => {
  const variantMap: Record<string, string> = {
    pending: 'secondary',
    processing: 'outline',
    completed: 'default',
    cancelled: 'destructive'
  }
  return variantMap[status] || 'outline'
}

const getMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    bank_transfer: '银行转账',
    credit_card: '信用卡',
    alipay: '支付宝',
    wechat_pay: '微信支付',
    cash: '现金'
  }
  return methodMap[method] || method
}

const getMethodVariant = (method: string) => {
  const variantMap: Record<string, string> = {
    bank_transfer: 'outline',
    credit_card: 'secondary',
    alipay: 'default',
    wechat_pay: 'default',
    cash: 'outline'
  }
  return variantMap[method] || 'outline'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date))
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedStatus.value = ''
  selectedMethod.value = ''
  dateRange.value = null
}

const openPaymentModal = () => {
  isEditing.value = false
  currentPayment.value = {
    id: '',
    paymentNo: `PAY-${new Date().getFullYear()}-${String(payments.value.length + 1).padStart(3, '0')}`,
    supplier: '',
    amount: 0,
    paymentMethod: 'bank_transfer',
    status: 'pending',
    paymentDate: new Date(),
    description: '',
    created_at: new Date(),
    updated_at: new Date()
  }
  showPaymentModal.value = true
}

const editPayment = (payment: any) => {
  isEditing.value = true
  currentPayment.value = { ...payment }
  showPaymentModal.value = true
}

const viewPayment = (payment: any) => {
  editPayment(payment)
  // 可以设置为只读模式
}

const confirmDelete = (payment: any) => {
  if (confirm(`确定要删除支付单号 ${payment.paymentNo} 吗？`)) {
    deletePayment(payment)
  }
}

const deletePayment = async (payment: any) => {
  try {
    loading.value = true
    // 这里应该调用API删除支付记录
    // await paymentApi.delete(payment.id)
    
    // 模拟删除
    const index = payments.value.findIndex(p => p.id === payment.id)
    if (index > -1) {
      payments.value.splice(index, 1)
    }
    
    console.log('支付记录已删除')
  } catch (error) {
    console.error('删除支付记录失败:', error)
  } finally {
    loading.value = false
  }
}

const savePayment = async () => {
  try {
    saving.value = true
    
    if (isEditing.value) {
      // 更新现有支付记录
      const index = payments.value.findIndex(p => p.id === currentPayment.value.id)
      if (index > -1) {
        payments.value[index] = { ...currentPayment.value, updated_at: new Date() }
      }
    } else {
      // 创建新支付记录
      const newPayment = {
        ...currentPayment.value,
        id: Date.now().toString(),
        paymentNo: `PAY${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date()
      }
      payments.value.unshift(newPayment)
    }
    
    closePaymentModal()
    console.log('支付记录保存成功')
  } catch (error) {
    console.error('保存支付记录失败:', error)
  } finally {
    saving.value = false
  }
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  isEditing.value = false
  dialogMode.value = 'create'
  currentPayment.value = initCurrentPayment()
}
</script>
