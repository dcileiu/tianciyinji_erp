<template>
  <div class="flex flex-column gap-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-color">发票管理</h1>
        <p class="text-muted-color mt-2">管理销售发票和采购发票</p>
      </div>
      <Button
        label="新建发票"
        icon="pi pi-plus"
        @click="openInvoiceDialog()"
      />
    </div>

    <!-- 筛选区域 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-medium mb-2 block text-color">发票类型</label>
            <Dropdown
              v-model="filters.type"
              :options="invoiceTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="全部类型"
              show-clear
              class="w-full"
            />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block text-color">状态</label>
            <Dropdown
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>
          <div>
            <label class="text-sm font-medium mb-2 block text-color">搜索</label>
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText
                v-model="filters.search"
                placeholder="搜索发票号、客户/供应商..."
                class="w-full"
              />
            </IconField>
          </div>
          <div class="flex items-end gap-2">
            <Button
              label="刷新"
              icon="pi pi-refresh"
              outlined
              @click="loadInvoices"
            />
            <Button
              label="导出"
              icon="pi pi-download"
              outlined
              @click="exportInvoices"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 发票列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">发票列表</h3>
          <div class="flex items-center gap-2 text-sm text-muted-color">
            共 {{ totalCount }} 条记录
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="filteredInvoices"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
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
          <Column field="invoice_no" header="发票号" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm font-mono">
                {{ slotProps.data.invoice_no }}
              </code>
            </template>
          </Column>
          
          <Column field="type" header="类型" sortable>
            <template #body="slotProps">
              <Tag
                :value="getTypeDisplayName(slotProps.data.type)"
                :severity="getTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>
          
          <Column field="customer_name" header="客户/供应商" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <Avatar
                  :label="slotProps.data.customer_name.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <span class="font-medium">{{ slotProps.data.customer_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="amount" header="金额" sortable>
            <template #body="slotProps">
              <span class="font-medium text-green-600">
                ¥{{ slotProps.data.amount.toLocaleString() }}
              </span>
            </template>
          </Column>
          
          <Column field="tax_amount" header="税额">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                ¥{{ slotProps.data.tax_amount.toLocaleString() }}
              </span>
            </template>
          </Column>
          
          <Column field="total_amount" header="总金额" sortable>
            <template #body="slotProps">
              <span class="font-bold text-primary">
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
          
          <Column field="invoice_date" header="开票日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.invoice_date) }}
              </span>
            </template>
          </Column>
          
          <Column field="due_date" header="到期日期" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
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
                  @click="viewInvoice(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="editInvoice(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  v-tooltip="'发送'"
                  icon="pi pi-send"
                  rounded
                  text
                  size="small"
                  @click="sendInvoice(slotProps.data)"
                />
                <Button
                  v-tooltip="'打印'"
                  icon="pi pi-print"
                  rounded
                  text
                  size="small"
                  @click="printInvoice(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDeleteInvoice(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 发票对话框 -->
    <Dialog
      v-model:visible="showInvoiceDialog"
      :header="editingInvoice ? '编辑发票' : '新建发票'"
      :style="{ width: '900px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">发票号</label>
              <InputText
                v-model="invoiceForm.invoice_no"
                :disabled="true"
                placeholder="系统自动生成"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">发票类型 *</label>
              <Dropdown
                v-model="invoiceForm.type"
                :options="invoiceTypeOptions"
                option-label="label"
                option-value="value"
                placeholder="选择发票类型"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">状态</label>
              <Dropdown
                v-model="invoiceForm.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="选择状态"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">客户/供应商 *</label>
              <InputText
                v-model="invoiceForm.customer_name"
                placeholder="请输入客户或供应商名称"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">联系人</label>
              <InputText
                v-model="invoiceForm.contact_person"
                placeholder="请输入联系人姓名"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">开票日期 *</label>
              <Calendar
                v-model="invoiceForm.invoice_date"
                placeholder="选择开票日期"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">到期日期</label>
              <Calendar
                v-model="invoiceForm.due_date"
                placeholder="选择到期日期"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">备注</label>
            <Textarea
              v-model="invoiceForm.notes"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>
          
          <!-- 发票项目列表 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-color">发票项目</label>
              <Button
                v-if="dialogMode !== 'view'"
                label="添加项目"
                icon="pi pi-plus"
                text
                size="small"
                @click="addInvoiceItem"
              />
            </div>
            
            <DataTable
              :value="invoiceForm.items"
            >
              <template #loading>
                <div class="p-6">
                  <div v-for="i in 3" :key="i" class="flex align-items-center gap-4 mb-4">
                    <Skeleton width="100%" height="1.5rem" class="mb-2" />
                    <Skeleton width="60%" height="1rem" />
                    <Skeleton width="80%" height="1rem" />
                    <Skeleton width="4rem" height="1.5rem" />
                  </div>
                </div>
              </template>
              <Column field="description" header="描述">
                <template #body="slotProps">
                  <InputText
                    v-if="dialogMode !== 'view'"
                    v-model="slotProps.data.description"
                    placeholder="项目描述"
                    class="w-full"
                  />
                  <span v-else>{{ slotProps.data.description }}</span>
                </template>
              </Column>
              
              <Column field="quantity" header="数量">
                <template #body="slotProps">
                  <InputNumber
                    v-if="dialogMode !== 'view'"
                    v-model="slotProps.data.quantity"
                    :min="1"
                    show-buttons
                    @update:model-value="calculateItemAmount(slotProps.data)"
                  />
                  <span v-else>{{ slotProps.data.quantity }}</span>
                </template>
              </Column>
              
              <Column field="unit_price" header="单价">
                <template #body="slotProps">
                  <InputNumber
                    v-if="dialogMode !== 'view'"
                    v-model="slotProps.data.unit_price"
                    mode="currency"
                    currency="CNY"
                    :min="0"
                    @update:model-value="calculateItemAmount(slotProps.data)"
                  />
                  <span v-else>¥{{ slotProps.data.unit_price.toLocaleString() }}</span>
                </template>
              </Column>
              
              <Column field="amount" header="金额">
                <template #body="slotProps">
                  <span class="font-medium">
                    ¥{{ slotProps.data.amount.toLocaleString() }}
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
                    @click="removeInvoiceItem(slotProps.index)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
          
          <!-- 金额统计 -->
          <div class="border-t pt-4 space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-color">小计：</span>
              <span class="font-medium">¥{{ subtotal.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-color">税额 ({{ taxRate }}%)：</span>
              <span class="font-medium">¥{{ taxAmount.toLocaleString() }}</span>
            </div>
            <Divider />
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-color">总计：</span>
              <span class="text-xl font-bold text-primary">
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
            @click="closeInvoiceDialog"
          />
          <Button
            v-if="dialogMode !== 'view'"
            label="保存"
            icon="pi pi-check"
            :loading="saving"
            @click="saveInvoice"
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
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import Skeleton from 'primevue/skeleton'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '发票管理 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showInvoiceDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const editingInvoice = ref(null as any)
const confirm = useConfirm()

// 筛选条件
const filters = ref({
  type: '',
  status: '',
  search: ''
})

// 表单数据
const invoiceForm = ref({
  invoice_no: '',
  type: 'sales',
  customer_name: '',
  contact_person: '',
  invoice_date: new Date(),
  due_date: null as Date | null,
  status: 'draft',
  notes: '',
  items: [] as any[]
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

const taxRate = ref(13) // 13% 税率

const taxAmount = computed(() => {
  return Math.round(subtotal.value * taxRate.value / 100)
})

const totalAmount = computed(() => {
  return subtotal.value + taxAmount.value
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
    dialogMode.value = 'edit'
    Object.assign(invoiceForm.value, {
      ...invoice,
      items: [...invoice.items]
    })
  }
  else {
    editingInvoice.value = null
    dialogMode.value = 'create'
    invoiceForm.value = {
      invoice_no: `INV-${Date.now()}`,
      type: 'sales',
      customer_name: '',
      contact_person: '',
      invoice_date: new Date(),
      due_date: null,
      status: 'draft',
      notes: '',
      items: []
    }
  }
  showInvoiceDialog.value = true
}

const viewInvoice = (invoice: any) => {
  editingInvoice.value = invoice
  dialogMode.value = 'view'
  Object.assign(invoiceForm.value, {
    ...invoice,
    items: [...invoice.items]
  })
  showInvoiceDialog.value = true
}

const editInvoice = (invoice: any) => {
  openInvoiceDialog(invoice)
}

const sendInvoice = async (invoice: any) => {
  confirm.require({
    message: `确定要发送发票 ${invoice.invoice_no} 吗？`,
    header: '确认发送',
    icon: 'pi pi-send',
    accept: async () => {
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
  })
}

const printInvoice = (invoice: any) => {
  console.log('打印发票:', invoice.invoice_no)
}

const confirmDeleteInvoice = (invoice: any) => {
  confirm.require({
    message: `确定要删除发票 ${invoice.invoice_no} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteInvoice(invoice.id)
    }
  })
}

const deleteInvoice = (invoiceId: string) => {
  mockInvoices.value = mockInvoices.value.filter(invoice => invoice.id !== invoiceId)
}

const closeInvoiceDialog = () => {
  showInvoiceDialog.value = false
  editingInvoice.value = null
}

const saveInvoice = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 计算金额
    const calculatedInvoice = {
      ...invoiceForm.value,
      amount: subtotal.value,
      tax_amount: taxAmount.value,
      total_amount: totalAmount.value
    }
    
    if (dialogMode.value === 'create') {
      const newInvoice = {
        id: Date.now().toString(),
        ...calculatedInvoice,
        due_date: calculatedInvoice.due_date || new Date()
      }
      mockInvoices.value.push(newInvoice)
    }
    else if (dialogMode.value === 'edit') {
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

const calculateItemAmount = (item: any) => {
  item.amount = (item.quantity || 0) * (item.unit_price || 0)
}

const exportInvoices = () => {
  console.log('导出发票')
}

// 初始化
onMounted(() => {
  loadInvoices()
})
</script>
