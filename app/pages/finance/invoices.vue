<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">发票管理</h1>
        <p class="text-muted-foreground mt-2">管理销售发票和采购发票</p>
      </div>
      <Button @click="openInvoiceDialog()" class="gap-2">
        <Plus class="h-4 w-4" />
        新建发票
      </Button>
    </div>

    <!-- 筛选区域 -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block">发票类型</label>
            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部类型</SelectItem>
                <SelectItem value="sales">销售发票</SelectItem>
                <SelectItem value="purchase">采购发票</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">状态</label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="sent">已发送</SelectItem>
                <SelectItem value="paid">已付款</SelectItem>
                <SelectItem value="overdue">逾期</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block">搜索</label>
            <div class="relative">
              <Search class="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                v-model="filters.search"
                placeholder="搜索发票号、客户/供应商..."
                class="pl-10"
              />
            </div>
          </div>
          <div class="flex items-end gap-2">
            <Button @click="loadInvoices" variant="outline" class="gap-2">
              <RefreshCw class="h-4 w-4" />
              刷新
            </Button>
            <Button @click="exportInvoices" variant="outline" class="gap-2">
              <Download class="h-4 w-4" />
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
          <CardTitle>发票列表</CardTitle>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            共 {{ totalCount }} 条记录
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>发票号</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>客户/供应商</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>开票日期</TableHead>
                <TableHead>到期日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="invoice in invoices" :key="invoice.id">
                <TableCell>
                  <div class="font-medium">{{ invoice.invoice_number }}</div>
                </TableCell>
                <TableCell>
                  <Badge :variant="invoice.type === 'sales' ? 'default' : 'secondary'">
                    {{ invoice.type === 'sales' ? '销售发票' : '采购发票' }}
                  </Badge>
                </TableCell>
                <TableCell>{{ invoice.partner_name }}</TableCell>
                <TableCell>
                  <div class="font-medium">¥{{ invoice.total_amount?.toLocaleString() }}</div>
                </TableCell>
                <TableCell>{{ formatDate(invoice.invoice_date) }}</TableCell>
                <TableCell>{{ formatDate(invoice.due_date) }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(invoice.status)">
                    {{ getStatusText(invoice.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Button @click="viewInvoice(invoice)" size="sm" variant="ghost">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button @click="editInvoice(invoice)" size="sm" variant="ghost">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button @click="deleteInvoice(invoice)" size="sm" variant="ghost" class="text-red-500 hover:text-red-700">
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div v-if="invoices.length === 0" class="text-center py-8 text-muted-foreground">
            暂无发票数据
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 发票对话框 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>
              {{ editingInvoice ? '编辑发票' : '新建发票' }}
            </CardTitle>
            <Button @click="closeDialog" variant="ghost" size="sm">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="saveInvoice" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">发票类型</label>
                <Select v-model="form.type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">销售发票</SelectItem>
                    <SelectItem value="purchase">采购发票</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">发票号</label>
                <Input v-model="form.invoice_number" placeholder="自动生成或手动输入" />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">
                  {{ form.type === 'sales' ? '客户' : '供应商' }}
                </label>
                <Input v-model="form.partner_name" placeholder="输入名称" required />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">联系人</label>
                <Input v-model="form.contact_person" placeholder="联系人姓名" />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">开票日期</label>
                <Input v-model="form.invoice_date" type="date" required />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">到期日期</label>
                <Input v-model="form.due_date" type="date" required />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">金额</label>
                <Input v-model="form.total_amount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">税率 (%)</label>
                <Input v-model="form.tax_rate" type="number" step="0.01" placeholder="13.00" />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">状态</label>
                <Select v-model="form.status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="sent">已发送</SelectItem>
                    <SelectItem value="paid">已付款</SelectItem>
                    <SelectItem value="overdue">逾期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium mb-2 block">备注</label>
              <Textarea v-model="form.notes" rows="3" placeholder="发票备注信息" />
            </div>
            
            <div class="flex justify-end gap-2 pt-4">
              <Button type="button" @click="closeDialog" variant="outline">
                取消
              </Button>
              <Button type="submit" :disabled="saving">
                {{ saving ? '保存中...' : '保存' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardTitle from '~/components/ui/CardTitle.vue'
import Select from '~/components/ui/Select.vue'
import SelectContent from '~/components/ui/SelectContent.vue'
import SelectItem from '~/components/ui/SelectItem.vue'
import SelectTrigger from '~/components/ui/SelectTrigger.vue'
import SelectValue from '~/components/ui/SelectValue.vue'
import Badge from '~/components/ui/Badge.vue'
import Table from '~/components/ui/Table.vue'
import TableBody from '~/components/ui/TableBody.vue'
import TableCell from '~/components/ui/TableCell.vue'
import TableHead from '~/components/ui/TableHead.vue'
import TableHeader from '~/components/ui/TableHeader.vue'
import TableRow from '~/components/ui/TableRow.vue'
import Textarea from '~/components/ui/Textarea.vue'
import { Plus, Search, RefreshCw, Download, Eye, Edit, Trash2, X } from 'lucide-vue-next'
import { log } from '~/utils/logger'
import { handleAsyncError } from '~/utils/error-handler'

// 发票类型定义
interface Invoice {
  id: number
  invoice_number: string
  type: string
  partner_name: string
  contact_person: string
  total_amount: number
  tax_rate: number
  invoice_date: string
  due_date: string
  status: string
  notes: string
}

// 页面元数据
definePageMeta({
  title: '发票管理',
  description: '管理销售发票和采购发票'
})

// 响应式数据
const invoices = ref<Invoice[]>([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingInvoice = ref<Invoice | null>(null)
const totalCount = ref(0)

// 筛选条件
const filters = reactive({
  type: '',
  status: '',
  search: ''
})

// 表单数据
const form = reactive({
  type: '',
  invoice_number: '',
  partner_name: '',
  contact_person: '',
  invoice_date: '',
  due_date: '',
  total_amount: '',
  tax_rate: 13,
  status: 'draft',
  notes: ''
})

// 初始化表单
const initForm = () => {
  form.type = ''
  form.invoice_number = ''
  form.partner_name = ''
  form.contact_person = ''
  form.invoice_date = ''
  form.due_date = ''
  form.total_amount = ''
  form.tax_rate = 13
  form.status = 'draft'
  form.notes = ''
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    sent: '已发送',
    paid: '已付款',
    overdue: '逾期'
  }
  return statusMap[status] || status
}

// 获取状态变体
const getStatusVariant = (status: string) => {
  const variantMap: Record<string, string> = {
    draft: 'secondary',
    sent: 'default',
    paid: 'success',
    overdue: 'destructive'
  }
  return variantMap[status] || 'secondary'
}

// 加载发票数据
const loadInvoices = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        invoice_number: 'INV-2024-001',
        type: 'sales',
        partner_name: '北京科技有限公司',
        contact_person: '张经理',
        total_amount: 50000,
        tax_rate: 13,
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        status: 'sent',
        notes: '季度采购发票'
      },
      {
        id: 2,
        invoice_number: 'INV-2024-002',
        type: 'purchase',
        partner_name: '上海供应链公司',
        contact_person: '李总',
        total_amount: 30000,
        tax_rate: 13,
        invoice_date: '2024-01-10',
        due_date: '2024-02-10',
        status: 'paid',
        notes: '原材料采购'
      }
    ]
    
    invoices.value = mockData
    totalCount.value = mockData.length
  } catch (error) {
    console.error('加载发票失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开发票对话框
const openInvoiceDialog = (invoice: Invoice | null = null) => {
  editingInvoice.value = invoice
  if (invoice) {
    form.type = invoice.type
    form.invoice_number = invoice.invoice_number
    form.partner_name = invoice.partner_name
    form.contact_person = invoice.contact_person
    form.invoice_date = invoice.invoice_date
    form.due_date = invoice.due_date
    form.total_amount = String(invoice.total_amount)
    form.tax_rate = invoice.tax_rate
    form.status = invoice.status
    form.notes = invoice.notes
  } else {
    initForm()
    // 生成发票号
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    form.invoice_number = `INV-${year}${month}${day}-${random}`
    
    // 设置默认日期
    form.invoice_date = now.toISOString().split('T')[0] || ''
    const dueDate = new Date(now)
    dueDate.setMonth(dueDate.getMonth() + 1)
    form.due_date = dueDate.toISOString().split('T')[0] || ''
  }
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  editingInvoice.value = null
  initForm()
}

// 保存发票
const saveInvoice = async () => {
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingInvoice.value) {
      // 更新现有发票
      const index = invoices.value.findIndex(p => p.id === editingInvoice.value!.id)
      if (index !== -1) {
        invoices.value[index] = { 
          ...editingInvoice.value, 
          ...form,
          total_amount: Number(form.total_amount)
        }
      }
    } else {
      // 添加新发票
      const newInvoice = {
        id: Date.now(),
        type: form.type,
        invoice_number: form.invoice_number,
        partner_name: form.partner_name,
        contact_person: form.contact_person,
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        total_amount: Number(form.total_amount),
        tax_rate: form.tax_rate,
        status: form.status,
        notes: form.notes
      }
      invoices.value.unshift(newInvoice)
      totalCount.value++
    }
    
    closeDialog()
  } catch (error) {
    console.error('保存发票失败:', error)
  } finally {
    saving.value = false
  }
}

// 查看发票
const viewInvoice = (invoice: Invoice) => {
  // TODO: 实现发票详情查看功能
  log.action('查看发票', { invoiceId: invoice.id, invoiceNumber: invoice.invoice_number })
}

// 编辑发票
const editInvoice = (invoice: Invoice) => {
  openInvoiceDialog(invoice)
}

// 删除发票
const deleteInvoice = async (invoice: Invoice) => {
  if (confirm('确定要删除这张发票吗？')) {
    const result = await handleAsyncError(
      async () => {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const index = invoices.value.findIndex(p => p.id === invoice.id)
        if (index !== -1) {
          invoices.value.splice(index, 1)
          totalCount.value--
        }
      },
      '删除发票'
    )
    
    if (!result.success) {
      alert(result.error.message)
    }
  }
}

// 导出发票
const exportInvoices = () => {
  // TODO: 实现发票导出功能
  log.action('导出发票数据', { count: invoices.value.length })
}

// 页面加载时获取数据
onMounted(() => {
  loadInvoices()
})
</script>