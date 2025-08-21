<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">付款单管理</h1>
        <p class="text-muted-foreground">管理供应商付款和支出记录</p>
      </div>
      <Button @click="showCreateDialog = true" class="bg-red-600 hover:bg-red-700">
        <Plus class="w-4 h-4 mr-2" />
        新增付款单
      </Button>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">搜索</label>
            <Input
              v-model="searchQuery"
              placeholder="单据号、供应商名称..."
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">状态</label>
            <select v-model="statusFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部状态</option>
              <option value="draft">草稿</option>
              <option value="confirmed">已确认</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">付款方式</label>
            <select v-model="paymentMethodFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部方式</option>
              <option value="cash">现金</option>
              <option value="bank_transfer">银行转账</option>
              <option value="check">支票</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" @click="resetFilters" class="flex-1">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 付款单列表 -->
    <Card>
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">付款单列表</h2>
        <div class="text-sm text-muted-foreground">
          总支出: ¥{{ totalAmount.toLocaleString() }}
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">单据号</th>
              <th class="p-4 font-medium">供应商</th>
              <th class="p-4 font-medium">付款日期</th>
              <th class="p-4 font-medium">付款金额</th>
              <th class="p-4 font-medium">付款方式</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id" class="border-b hover:bg-muted/50">
              <td class="p-4 font-mono text-sm">{{ payment.payment_no }}</td>
              <td class="p-4">{{ payment.supplier_name }}</td>
              <td class="p-4">{{ formatDate(payment.payment_date) }}</td>
              <td class="p-4 font-medium text-red-600">¥{{ payment.amount.toLocaleString() }}</td>
              <td class="p-4">
                <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                  {{ getPaymentMethodName(payment.payment_method) }}
                </span>
              </td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-gray-100 text-gray-800': payment.status === 'draft',
                    'bg-green-100 text-green-800': payment.status === 'confirmed',
                    'bg-red-100 text-red-800': payment.status === 'cancelled'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusName(payment.status) }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="viewPayment(payment)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button 
                    v-if="payment.status === 'draft'" 
                    size="sm" 
                    variant="outline" 
                    @click="editPayment(payment)"
                  >
                    <Edit3 class="w-4 h-4" />
                  </Button>
                  <Button 
                    v-if="payment.status === 'draft'" 
                    size="sm" 
                    variant="outline" 
                    @click="deletePayment(payment.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPayments.length === 0">
              <td colspan="7" class="p-8 text-center text-muted-foreground">
                暂无付款单数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 创建/编辑付款单对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditDialog ? '编辑付款单' : '新增付款单' }}
        </h3>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">单据号</label>
              <Input v-model="formData.payment_no" placeholder="自动生成" readonly />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">付款日期</label>
              <Input v-model="formData.payment_date" type="date" required />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">供应商名称</label>
            <Input v-model="formData.supplier_name" placeholder="请输入供应商名称" required />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">付款金额</label>
              <Input 
                v-model.number="formData.amount" 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                required 
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">付款方式</label>
              <select v-model="formData.payment_method" class="w-full px-3 py-2 border rounded-md" required>
                <option value="">请选择付款方式</option>
                <option value="cash">现金</option>
                <option value="bank_transfer">银行转账</option>
                <option value="check">支票</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">付款用途</label>
            <select v-model="formData.purpose" class="w-full px-3 py-2 border rounded-md">
              <option value="">请选择付款用途</option>
              <option value="purchase">采购付款</option>
              <option value="expense">费用支付</option>
              <option value="salary">工资发放</option>
              <option value="other">其他</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">备注</label>
            <textarea 
              v-model="formData.remark"
              class="w-full px-3 py-2 border rounded-md resize-none"
              rows="3"
              placeholder="请输入备注信息"
            ></textarea>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, RefreshCw, Eye, Edit3, Trash2 } from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '付款单管理 - ERP 管理系统'
})

// 数据管理
const { payments, createPayment, updatePayment, deletePayment: removePayment, refreshPayments } = usePayments()

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const paymentMethodFilter = ref('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const currentEditId = ref<string | null>(null)

// 表单数据
const formData = ref({
  payment_no: '',
  supplier_name: '',
  payment_date: '',
  amount: 0,
  payment_method: '',
  purpose: '',
  remark: '',
  status: 'draft'
})

// 计算属性
const filteredPayments = computed(() => {
  let filtered = payments.value
  
  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(payment => 
      payment.payment_no.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payment.supplier_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(payment => payment.status === statusFilter.value)
  }
  
  // 付款方式过滤
  if (paymentMethodFilter.value) {
    filtered = filtered.filter(payment => payment.payment_method === paymentMethodFilter.value)
  }
  
  return filtered
})

const totalAmount = computed(() => {
  return filteredPayments.value
    .filter(payment => payment.status === 'confirmed')
    .reduce((sum, payment) => sum + payment.amount, 0)
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

const generatePaymentNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `PAY${year}${month}${day}${random}`
}

const viewPayment = (payment: any) => {
  // TODO: 实现查看付款单详情
  console.log('查看付款单:', payment)
}

const editPayment = (payment: any) => {
  formData.value = {
    payment_no: payment.payment_no,
    supplier_name: payment.supplier_name,
    payment_date: payment.payment_date,
    amount: payment.amount,
    payment_method: payment.payment_method,
    purpose: payment.purpose || '',
    remark: payment.remark || '',
    status: payment.status
  }
  currentEditId.value = payment.id
  showEditDialog.value = true
}

const deletePayment = async (id: string) => {
  if (confirm('确定要删除这张付款单吗？')) {
    await removePayment(id)
    await refreshPayments()
  }
}

const submitForm = async () => {
  try {
    if (!showEditDialog.value) {
      formData.value.payment_no = generatePaymentNo()
    }
    
    if (showEditDialog.value && currentEditId.value) {
      await updatePayment(currentEditId.value, formData.value)
    } else {
      await createPayment(formData.value)
    }
    
    await refreshPayments()
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
    payment_no: '',
    supplier_name: '',
    payment_date: '',
    amount: 0,
    payment_method: '',
    purpose: '',
    remark: '',
    status: 'draft'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 初始化数据
onMounted(async () => {
  await refreshPayments()
})
</script> 