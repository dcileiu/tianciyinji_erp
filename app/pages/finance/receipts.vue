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
      <div class="p-4">
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
            <select v-model="statusFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部状态</option>
              <option value="draft">草稿</option>
              <option value="confirmed">已确认</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">收款方式</label>
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

    <!-- 收款单列表 -->
    <Card>
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">收款单列表</h2>
        <div class="text-sm text-muted-foreground">
          总金额: ¥{{ totalAmount.toLocaleString() }}
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">单据号</th>
              <th class="p-4 font-medium">客户</th>
              <th class="p-4 font-medium">收款日期</th>
              <th class="p-4 font-medium">收款金额</th>
              <th class="p-4 font-medium">收款方式</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="receipt in filteredReceipts" :key="receipt.id" class="border-b hover:bg-muted/50">
              <td class="p-4 font-mono text-sm">{{ receipt.receipt_no }}</td>
              <td class="p-4">{{ receipt.customer_name }}</td>
              <td class="p-4">{{ formatDate(receipt.receipt_date) }}</td>
              <td class="p-4 font-medium text-green-600">¥{{ receipt.amount.toLocaleString() }}</td>
              <td class="p-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {{ getPaymentMethodName(receipt.payment_method) }}
                </span>
              </td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-gray-100 text-gray-800': receipt.status === 'draft',
                    'bg-green-100 text-green-800': receipt.status === 'confirmed',
                    'bg-red-100 text-red-800': receipt.status === 'cancelled'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusName(receipt.status) }}
                </span>
              </td>
              <td class="p-4">
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
              </td>
            </tr>
            <tr v-if="filteredReceipts.length === 0">
              <td colspan="7" class="p-8 text-center text-muted-foreground">
                暂无收款单数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 创建/编辑收款单对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditDialog ? '编辑收款单' : '新增收款单' }}
        </h3>
        
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
              <select v-model="formData.payment_method" class="w-full px-3 py-2 border rounded-md" required>
                <option value="">请选择收款方式</option>
                <option value="cash">现金</option>
                <option value="bank_transfer">银行转账</option>
                <option value="check">支票</option>
                <option value="other">其他</option>
              </select>
            </div>
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