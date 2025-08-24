<template>
  <div class="flex flex-col gap-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">发票管理</h1>
        <p class="text-gray-600 mt-2">管理销售发票和采购发票</p>
      </div>
      <Button @click="openInvoiceDialog()">
        <Plus class="w-4 h-4 mr-2" />
        新建发票
      </Button>
    </div>

    <!-- 筛选区域 -->
    <Card>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label class="text-sm font-medium mb-2 block">发票类型</Label>
            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部类型</SelectItem>
                <SelectItem 
                  v-for="option in invoiceTypeOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="text-sm font-medium mb-2 block">状态</Label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
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
          <div>
            <Label class="text-sm font-medium mb-2 block">搜索</Label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                v-model="filters.search"
                placeholder="搜索发票号、客户/供应商..."
                class="pl-10"
              />
            </div>
          </div>
          <div class="flex items-end gap-2">
            <Button variant="outline" @click="loadInvoices">
              <RefreshCw class="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Button variant="outline" @click="exportInvoices">
              <Download class="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 发票列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-semibold">发票列表</CardTitle>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            共 {{ totalCount }} 条记录
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div v-if="loading" class="p-6">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div class="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
            <div class="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div v-else class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>发票号</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>客户/供应商</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>税额</TableHead>
                <TableHead>总金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>开票日期</TableHead>
                <TableHead>到期日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="invoice in filteredInvoices" :key="invoice.id">
                <TableCell>
                  <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {{ invoice.invoice_no }}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge :variant="getTypeSeverity(invoice.type)">
                    {{ getTypeDisplayName(invoice.type) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {{ invoice.customer_name.charAt(0) }}
                    </div>
                    <span class="font-medium">{{ invoice.customer_name }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span class="font-medium text-green-600">
                    ¥{{ invoice.amount.toLocaleString() }}
                  </span>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-gray-600">
                    ¥{{ invoice.tax_amount.toLocaleString() }}
                  </span>
                </TableCell>
                <TableCell>
                  <span class="font-bold text-blue-600">
                    ¥{{ invoice.total_amount.toLocaleString() }}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusSeverity(invoice.status)">
                    {{ getStatusDisplayName(invoice.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-gray-600">
                    {{ formatDate(invoice.invoice_date) }}
                  </span>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-gray-600">
                    {{ formatDate(invoice.due_date) }}
                  </span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="viewInvoice(invoice)"
                    >
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button
                      v-if="invoice.status === 'draft'"
                      variant="ghost"
                      size="sm"
                      @click="editInvoice(invoice)"
                    >
                      <Edit class="w-4 h-4" />
                    </Button>
                    <Button
                      v-if="invoice.status === 'draft'"
                      variant="ghost"
                      size="sm"
                      @click="sendInvoice(invoice)"
                    >
                      <Send class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="printInvoice(invoice)"
                    >
                      <Printer class="w-4 h-4" />
                    </Button>
                    <Button
                      v-if="invoice.status === 'draft'"
                      variant="ghost"
                      size="sm"
                      @click="confirmDeleteInvoice(invoice)"
                    >
                      <Trash2 class="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
         </div>
       </CardContent>
     </Card>

    <!-- 发票对话框 -->
    <Dialog v-model:open="invoiceDialogVisible">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingInvoice ? '编辑发票' : '新建发票' }}</DialogTitle>
        </DialogHeader>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">基本信息</h3>
            
            <div class="space-y-2">
              <Label for="invoice_no">发票号</Label>
              <Input
                id="invoice_no"
                v-model="invoiceForm.invoice_no"
                placeholder="请输入发票号"
                :disabled="saving"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="type">发票类型</Label>
              <Select v-model="invoiceForm.type" :disabled="saving">
                <SelectTrigger>
                  <SelectValue placeholder="请选择发票类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="type in invoiceTypes"
                    :key="type.value"
                    :value="type.value"
                  >
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="status">状态</Label>
              <Select v-model="invoiceForm.status" :disabled="saving">
                <SelectTrigger>
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in invoiceStatuses"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div class="space-y-2">
              <Label for="customer_name">客户/供应商</Label>
              <Input
                id="customer_name"
                v-model="invoiceForm.customer_name"
                placeholder="请输入客户或供应商名称"
                :disabled="saving"
              />
            </div>
          </div>
          
          <!-- 日期和备注 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">日期信息</h3>
            
            <div class="space-y-2">
              <Label for="invoice_date">开票日期</Label>
              <Input
                id="invoice_date"
                v-model="invoiceForm.invoice_date"
                type="date"
                :disabled="saving"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="due_date">到期日期</Label>
              <Input
                id="due_date"
                v-model="invoiceForm.due_date"
                type="date"
                :disabled="saving"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="notes">备注</Label>
              <Textarea
                id="notes"
                v-model="invoiceForm.notes"
                rows="4"
                placeholder="请输入备注信息"
                :disabled="saving"
              />
            </div>
          </div>
        </div>
          
          <!-- 发票项目列表 -->
          <div class="space-y-4 col-span-full">
            <div class="flex justify-between items-center">
              <h4 class="text-lg font-semibold">发票项目</h4>
              <Button
                size="sm"
                @click="addInvoiceItem"
                :disabled="saving"
              >
                <Plus class="h-4 w-4 mr-2" />
                添加项目
              </Button>
            </div>
            
            <div class="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="min-w-[200px]">项目描述</TableHead>
                    <TableHead class="min-w-[100px]">数量</TableHead>
                    <TableHead class="min-w-[120px]">单价</TableHead>
                    <TableHead class="min-w-[120px]">金额</TableHead>
                    <TableHead class="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(item, index) in invoiceForm.items" :key="index">
                    <TableCell>
                      <Input
                        v-model="item.description"
                        placeholder="请输入项目描述"
                        :disabled="saving"
                        @input="calculateItemAmount(index)"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        v-model.number="item.quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        :disabled="saving"
                        @input="calculateItemAmount(index)"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        v-model.number="item.unit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        :disabled="saving"
                        @input="calculateItemAmount(index)"
                      />
                    </TableCell>
                    <TableCell>
                      <span class="font-medium text-green-600">
                        ¥{{ (item.amount || 0).toLocaleString() }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="removeInvoiceItem(index)"
                        :disabled="saving"
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          <!-- 金额统计 -->
          <div class="border-t pt-4 space-y-2 col-span-full">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">小计：</span>
              <span class="font-medium">¥{{ subtotal.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">税额 ({{ taxRate }}%)：</span>
              <span class="font-medium">¥{{ taxAmount.toLocaleString() }}</span>
            </div>
            <div class="border-t pt-2">
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold">总计：</span>
                <span class="text-xl font-bold text-blue-600">
                  ¥{{ totalAmount.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            @click="closeInvoiceDialog"
            :disabled="saving"
          >
            取消
          </Button>
          <Button
            v-if="dialogMode !== 'view'"
            @click="saveInvoice"
            :disabled="saving"
          >
            <Loader2 v-if="saving" class="h-4 w-4 mr-2 animate-spin" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search, RefreshCw, Download, Eye, Edit, Send, Printer, Trash2, Loader2 } from 'lucide-vue-next'

definePageMeta({
  title: '发票管理',
  layout: 'default'
})

useHead({
  title: '发票管理 - ERP系统'
})

// 响应式状态
const loading = ref(false)
const saving = ref(false)
const invoiceDialogVisible = ref(false)
const editingInvoice = ref(null)

// 筛选条件
const filters = ref({
  type: '',
  status: '',
  search: ''
})

// 发票表单数据
const invoiceForm = ref({
  invoice_no: '',
  type: '',
  status: 'draft',
  customer_name: '',
  amount: 0,
  tax_amount: 0,
  total_amount: 0,
  invoice_date: '',
  due_date: '',
  notes: '',
  items: []
})

// 选项数据
const invoiceTypeOptions = ref([
  { label: '销售发票', value: 'sales' },
  { label: '采购发票', value: 'purchase' }
])

const statusOptions = ref([
  { label: '草稿', value: 'draft' },
  { label: '已发送', value: 'sent' },
  { label: '已付款', value: 'paid' },
  { label: '逾期', value: 'overdue' }
])

// 模拟数据
const mockInvoices = ref([
  {
    id: '1',
    invoice_no: 'INV-2024-001',
    type: 'sales',
    customer_name: 'ABC公司',
    contact_person: '张经理',
    amount: 85000,
    tax_amount: 11050,
    total_amount: 96050,
    status: 'sent',
    invoice_date: new Date('2024-01-15'),
    due_date: new Date('2024-02-15'),
    notes: '销售发票备注',
    items: [
      { description: '产品A', quantity: 10, unit_price: 5000, amount: 50000 },
      { description: '产品B', quantity: 7, unit_price: 5000, amount: 35000 }
    ]
  },
  {
    id: '2',
    invoice_no: 'INV-2024-002',
    type: 'purchase',
    customer_name: 'XYZ供应商',
    contact_person: '李总',
    amount: 45000,
    tax_amount: 5850,
    total_amount: 50850,
    status: 'paid',
    invoice_date: new Date('2024-01-10'),
    due_date: new Date('2024-02-10'),
    notes: '采购发票备注',
    items: [
      { description: '原料C', quantity: 15, unit_price: 3000, amount: 45000 }
    ]
  }
])

// 计算属性
const filteredInvoices = computed(() => {
  let result = mockInvoices.value

  if (filters.value.search) {
    const query = filters.value.search.toLowerCase()
    result = result.filter(invoice =>
      invoice.invoice_no.toLowerCase().includes(query)
      || invoice.customer_name.toLowerCase().includes(query)
    )
  }

  if (filters.value.type) {
    result = result.filter(invoice => invoice.type === filters.value.type)
  }

  if (filters.value.status) {
    result = result.filter(invoice => invoice.status === filters.value.status)
  }

  return result
})

const totalCount = computed(() => mockInvoices.value.length)

const subtotal = computed(() => {
  return invoiceForm.value.items.reduce((sum: number, item: any) => {
    return sum + (item.amount || 0)
  }, 0)
})

const subtotalAmount = computed(() => {
  return invoiceForm.value.items.reduce((sum: number, item: any) => {
    return sum + (item.amount || 0)
  }, 0)
})

const taxRate = ref(13) // 13% 税率

const taxAmount = computed(() => {
  return Math.round(subtotalAmount.value * taxRate.value / 100)
})

const totalAmount = computed(() => {
  return subtotalAmount.value + taxAmount.value
})

// 类型映射
const typeMap: Record<string, string> = {
  sales: '销售发票',
  purchase: '采购发票'
}

const typeSeverityMap: Record<string, string> = {
  sales: 'success',
  purchase: 'info'
}

const statusMap: Record<string, string> = {
  draft: '草稿',
  sent: '已发送',
  paid: '已付款',
  overdue: '逾期'
}

const statusSeverityMap: Record<string, string> = {
  draft: 'secondary',
  sent: 'info',
  paid: 'success',
  overdue: 'danger'
}

// 方法
const getTypeDisplayName = (type: string) => typeMap[type] || type
const getTypeSeverity = (type: string) => typeSeverityMap[type] || 'info'
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadInvoices = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  catch (error) {
    console.error('加载发票失败:', error)
  }
  finally {
    loading.value = false
  }
}

const openInvoiceDialog = (invoice: any = null) => {
  if (invoice) {
    editingInvoice.value = invoice
    Object.assign(invoiceForm.value, {
      ...invoice,
      items: [...invoice.items]
    })
  }
  else {
    editingInvoice.value = null
    invoiceForm.value = {
      invoice_no: '',
      type: '',
      status: 'draft',
      customer_name: '',
      amount: 0,
      tax_amount: 0,
      total_amount: 0,
      invoice_date: '',
      due_date: '',
      notes: '',
      items: []
    }
  }
  invoiceDialogVisible.value = true
}

const viewInvoice = (invoice: any) => {
  editingInvoice.value = invoice
  Object.assign(invoiceForm.value, {
    ...invoice,
    items: [...invoice.items]
  })
  invoiceDialogVisible.value = true
}

const editInvoice = (invoice: any) => {
  openInvoiceDialog(invoice)
}

const sendInvoice = async (invoice: any) => {
  if (confirm(`确定要发送发票 ${invoice.invoice_no} 吗？`)) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const index = mockInvoices.value.findIndex(i => i.id === invoice.id)
      if (index !== -1 && mockInvoices.value[index]) {
        mockInvoices.value[index]!.status = 'sent'
      }
    }
    catch (error) {
      console.error('发送失败:', error)
    }
  }
}

const printInvoice = (invoice: any) => {
  console.log('打印发票:', invoice.invoice_no)
}

const confirmDeleteInvoice = (invoice: any) => {
  if (confirm(`确定要删除发票 ${invoice.invoice_no} 吗？`)) {
    deleteInvoice(invoice.id)
  }
}

const deleteInvoice = (invoiceId: string) => {
  mockInvoices.value = mockInvoices.value.filter(invoice => invoice.id !== invoiceId)
}

const closeInvoiceDialog = () => {
  invoiceDialogVisible.value = false
  editingInvoice.value = null
}

const saveInvoice = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 计算金额
    const calculatedInvoice = {
      ...invoiceForm.value,
      amount: subtotalAmount.value,
      tax_amount: taxAmount.value,
      total_amount: totalAmount.value
    }
    
    if (!editingInvoice.value) {
      const newInvoice = {
        id: Date.now().toString(),
        ...calculatedInvoice,
        due_date: calculatedInvoice.due_date || new Date()
      }
      mockInvoices.value.push(newInvoice)
    }
    else {
      const index = mockInvoices.value.findIndex(i => i.id === editingInvoice.value?.id)
      if (index !== -1) {
        mockInvoices.value[index] = {
          ...mockInvoices.value[index],
          ...calculatedInvoice,
          id: mockInvoices.value[index]?.id || '',
          due_date: calculatedInvoice.due_date || new Date()
        }
      }
    }
    
    closeInvoiceDialog()
  }
  catch (error) {
    console.error('保存发票失败:', error)
  }
  finally {
    saving.value = false
  }
}

const addInvoiceItem = () => {
  invoiceForm.value.items.push({
    description: '',
    quantity: 1,
    unit_price: 0,
    amount: 0
  })
}

const removeInvoiceItem = (index: number) => {
  invoiceForm.value.items.splice(index, 1)
}

const calculateItemAmount = (index: number) => {
  const item = invoiceForm.value.items[index]
  if (item) {
    item.amount = (item.quantity || 0) * (item.unit_price || 0)
  }
}

const exportInvoices = () => {
  console.log('导出发票')
}

// 初始化
onMounted(() => {
  loadInvoices()
})
</script>
