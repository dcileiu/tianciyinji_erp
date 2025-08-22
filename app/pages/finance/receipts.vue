<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">收款单管理</h1>
        <p class="text-muted-foreground">管理客户付款和收款记录</p>
      </div>
      <Button @click="showCreateDialog = true" class="bg-green-600 hover:bg-green-700">
        <Plus class="w-4 h-4 mr-2" />
        新增收款单
      </Button>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <CardContent class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">搜索</label>
            <Input
              v-model="searchQuery"
              placeholder="单据号、客户名称..."
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">状态</label>
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
          <div>
            <label class="block text-sm font-medium mb-1">收款方式</label>
            <Select v-model="paymentMethodFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部方式</SelectItem>
                <SelectItem value="cash">现金</SelectItem>
                <SelectItem value="bank_transfer">银行转账</SelectItem>
                <SelectItem value="check">支票</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" @click="resetFilters" class="flex-1">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 收款单列表 -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>收款单列表</CardTitle>
        <div class="text-sm text-muted-foreground">
          总金额: ¥{{ totalAmount.toLocaleString() }}
        </div>
      </CardHeader>
      
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>单据号</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>收款日期</TableHead>
                <TableHead>收款金额</TableHead>
                <TableHead>收款方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="receipt in filteredReceipts" :key="receipt.id">
                <TableCell class="font-mono text-sm">{{ receipt.receipt_no }}</TableCell>
                <TableCell>{{ receipt.customer_name }}</TableCell>
                <TableCell>{{ formatDate(receipt.receipt_date) }}</TableCell>
                <TableCell class="font-medium text-green-600">¥{{ receipt.amount.toLocaleString() }}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {{ getPaymentMethodName(receipt.payment_method) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(receipt.status)">
                    {{ getStatusName(receipt.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline" @click="viewReceipt(receipt)">
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button 
                      v-if="receipt.status === 'draft'" 
                      size="sm" 
                      variant="outline" 
                      @click="editReceipt(receipt)"
                    >
                      <Edit3 class="w-4 h-4" />
                    </Button>
                    <Button 
                      v-if="receipt.status === 'draft'" 
                      size="sm" 
                      variant="outline" 
                      @click="deleteReceipt(receipt.id)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="filteredReceipts.length === 0">
                <TableCell colspan="7" class="text-center text-muted-foreground">
                  暂无收款单数据
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 创建/编辑收款单对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {{ showEditDialog ? '编辑收款单' : '新增收款单' }}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form @submit.prevent="submitForm" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">单据号</label>
                <Input v-model="formData.receipt_no" placeholder="自动生成" readonly />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">收款日期</label>
                <Input v-model="formData.receipt_date" type="date" required />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">客户名称</label>
              <Input v-model="formData.customer_name" placeholder="请输入客户名称" required />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">收款金额</label>
                <Input 
                  v-model.number="formData.amount" 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  required 
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">收款方式</label>
                <Select v-model="formData.payment_method" required>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择收款方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">现金</SelectItem>
                    <SelectItem value="bank_transfer">银行转账</SelectItem>
                    <SelectItem value="check">支票</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">备注</label>
              <Textarea 
                v-model="formData.remark"
                rows="3"
                placeholder="请输入备注信息"
              />
            </div>
            
            <div class="flex gap-3 pt-4">
              <Button type="submit" class="flex-1">
                {{ showEditDialog ? '更新' : '创建' }}
              </Button>
              <Button type="button" variant="outline" @click="cancelForm" class="flex-1">
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Eye, Edit3, Trash2 } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '收款单管理 - ERP 管理系统'
})

// 数据管理
const { receipts, createReceipt, updateReceipt, deleteReceipt: removeReceipt, refreshReceipts } = useReceipts()

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const paymentMethodFilter = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentEditId = ref<string | null>(null)

// 表单数据
const formData = ref({
  receipt_no: '',
  customer_name: '',
  receipt_date: '',
  amount: 0,
  payment_method: '',
  remark: '',
  status: 'draft'
})

// 计算属性
const filteredReceipts = computed(() => {
  let filtered = receipts.value
  
  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(receipt => 
      receipt.receipt_no.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      receipt.customer_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(receipt => receipt.status === statusFilter.value)
  }
  
  // 收款方式过滤
  if (paymentMethodFilter.value) {
    filtered = filtered.filter(receipt => receipt.payment_method === paymentMethodFilter.value)
  }
  
  return filtered
})

const totalAmount = computed(() => {
  return filteredReceipts.value
    .filter(receipt => receipt.status === 'confirmed')
    .reduce((sum, receipt) => sum + receipt.amount, 0)
})

// 方法
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  paymentMethodFilter.value = ''
}

const getPaymentMethodName = (method: string) => {
  const methods = {
    cash: '现金',
    bank_transfer: '银行转账',
    check: '支票',
    other: '其他'
  }
  return methods[method as keyof typeof methods] || method
}

const getStatusName = (status: string) => {
  const statuses = {
    draft: '草稿',
    confirmed: '已确认',
    cancelled: '已取消'
  }
  return statuses[status as keyof typeof statuses] || status
}

const getStatusVariant = (status: string) => {
  const variantMap: Record<string, string> = {
    draft: 'secondary',
    confirmed: 'success',
    cancelled: 'destructive'
  }
  return variantMap[status] || 'secondary'
}

const generateReceiptNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `REC${year}${month}${day}${random}`
}

const viewReceipt = (receipt: any) => {
  // TODO: 实现查看收款单详情
  console.log('查看收款单:', receipt)
}

const editReceipt = (receipt: any) => {
  formData.value = {
    receipt_no: receipt.receipt_no,
    customer_name: receipt.customer_name,
    receipt_date: receipt.receipt_date,
    amount: receipt.amount,
    payment_method: receipt.payment_method,
    remark: receipt.remark || '',
    status: receipt.status
  }
  currentEditId.value = receipt.id
  showEditDialog.value = true
}

const deleteReceipt = async (id: string) => {
  if (confirm('确定要删除这张收款单吗？')) {
    await removeReceipt(id)
    await refreshReceipts()
  }
}

const submitForm = async () => {
  try {
    if (!showEditDialog.value) {
      formData.value.receipt_no = generateReceiptNo()
    }
    
    if (showEditDialog.value && currentEditId.value) {
      await updateReceipt(currentEditId.value, formData.value)
    } else {
      await createReceipt(formData.value)
    }
    
    await refreshReceipts()
    cancelForm()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const cancelForm = () => {
  showCreateDialog.value = false
  showEditDialog.value = false
  currentEditId.value = null
  formData.value = {
    receipt_no: '',
    customer_name: '',
    receipt_date: '',
    amount: 0,
    payment_method: '',
    remark: '',
    status: 'draft'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 初始化数据
onMounted(async () => {
  await refreshReceipts()
})
</script>