<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-color">库存调拨</h1>
        <p class="text-muted-color mt-2">管理仓库间库存调拨</p>
      </div>
      <Button
        label="新建调拨单"
        icon="pi pi-plus"
        @click="openTransferDialog()"
      />
    </div>

    <!-- 筛选区域 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label class="text-sm font-medium mb-2 block text-color">调出仓库</label>
            <Dropdown
              v-model="filters.from_warehouse"
              :options="warehouses"
              option-label="name"
              option-value="id"
              placeholder="全部仓库"
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
                placeholder="搜索调拨单号、商品..."
                class="w-full"
              />
            </IconField>
          </div>
          <div class="flex items-end gap-2">
            <Button
              label="刷新"
              icon="pi pi-refresh"
              outlined
              @click="loadTransfers"
            />
            <Button
              label="导出"
              icon="pi pi-download"
              outlined
              @click="exportTransfers"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 调拨单列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">调拨单列表</h3>
          <div class="flex items-center gap-2 text-sm text-muted-color">
            共 {{ totalCount }} 条记录
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="filteredTransfers"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          class="p-datatable-sm"
        >
          <Column field="transfer_no" header="调拨单号" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm font-mono">
                {{ slotProps.data.transfer_no }}
              </code>
            </template>
          </Column>
          
          <Column field="from_warehouse_name" header="调出仓库" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <i class="pi pi-home text-blue-600"></i>
                <span>{{ slotProps.data.from_warehouse_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="to_warehouse_name" header="调入仓库" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <i class="pi pi-home text-green-600"></i>
                <span>{{ slotProps.data.to_warehouse_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="items_count" header="商品数量">
            <template #body="slotProps">
              <span class="text-sm">{{ slotProps.data.items.length }} 种商品</span>
            </template>
          </Column>
          
          <Column field="total_quantity" header="总数量">
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.total_quantity }}</span>
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
          
          <Column field="operator_name" header="操作人">
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <Avatar
                  :label="slotProps.data.operator_name.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <span class="text-sm">{{ slotProps.data.operator_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="created_at" header="创建时间" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.created_at) }}
              </span>
            </template>
          </Column>
          
          <Column header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex items-center space-x-1">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  rounded
                  text
                  size="small"
                  @click="viewTransfer(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="editTransfer(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'pending'"
                  v-tooltip="'审核'"
                  icon="pi pi-check"
                  rounded
                  text
                  size="small"
                  @click="approveTransfer(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'draft'"
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDeleteTransfer(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 调拨单对话框 -->
    <Dialog
      v-model:visible="showDialog"
      :header="editingTransfer ? '编辑调拨单' : '新建调拨单'"
      :style="{ width: '800px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">调拨单号</label>
              <InputText
                v-model="transferForm.transfer_no"
                :disabled="true"
                placeholder="系统自动生成"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">状态</label>
              <Dropdown
                v-model="transferForm.status"
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
              <label class="block text-sm font-medium text-color">调出仓库 *</label>
              <Dropdown
                v-model="transferForm.from_warehouse_id"
                :options="warehouses"
                option-label="name"
                option-value="id"
                placeholder="选择调出仓库"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">调入仓库 *</label>
              <Dropdown
                v-model="transferForm.to_warehouse_id"
                :options="warehouses"
                option-label="name"
                option-value="id"
                placeholder="选择调入仓库"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">备注</label>
            <Textarea
              v-model="transferForm.remark"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>
          
          <!-- 调拨商品列表 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-color">调拨商品</label>
              <Button
                v-if="dialogMode !== 'view'"
                label="添加商品"
                icon="pi pi-plus"
                text
                size="small"
                @click="addTransferItem"
              />
            </div>
            
            <DataTable
              :value="transferForm.items"
              class="p-datatable-sm"
            >
              <Column field="product_name" header="商品名称">
                <template #body="slotProps">
                  <span class="font-medium">{{ slotProps.data.product_name }}</span>
                </template>
              </Column>
              
              <Column field="current_stock" header="当前库存">
                <template #body="slotProps">
                  <span class="text-sm">{{ slotProps.data.current_stock }} {{ slotProps.data.unit }}</span>
                </template>
              </Column>
              
              <Column field="transfer_quantity" header="调拨数量">
                <template #body="slotProps">
                  <div v-if="dialogMode === 'view'">
                    <span>{{ slotProps.data.transfer_quantity }} {{ slotProps.data.unit }}</span>
                  </div>
                  <InputNumber
                    v-else
                    v-model="slotProps.data.transfer_quantity"
                    :min="1"
                    :max="slotProps.data.current_stock"
                    show-buttons
                  />
                </template>
              </Column>
              
              <Column field="unit" header="单位">
                <template #body="slotProps">
                  <span class="text-sm text-muted-color">{{ slotProps.data.unit }}</span>
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
                    @click="removeTransferItem(slotProps.index)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>
          
          <!-- 总计 -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-color">总数量：</span>
              <span class="text-xl font-bold text-primary">
                {{ totalQuantity }} 件
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
            @click="closeTransferDialog"
          />
          <Button
            v-if="dialogMode !== 'view'"
            label="保存"
            icon="pi pi-check"
            :loading="saving"
            @click="saveTransfer"
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
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import type { Transfer, TransferItem } from '~/types/database'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '库存调拨 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const editingTransfer = ref<Transfer | null>(null)
const confirm = useConfirm()

// 筛选条件
const filters = ref({
  status: '',
  from_warehouse: '',
  search: ''
})

// 表单数据
const transferForm = ref({
  transfer_no: '',
  from_warehouse_id: '',
  to_warehouse_id: '',
  status: 'draft',
  remark: '',
  items: [] as any[]
})

// 选项数据
const statusOptions = ref([
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '运输中', value: 'in_transit' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
])

const warehouses = ref([
  { id: 'WH001', name: '主仓库' },
  { id: 'WH002', name: '原料仓库' },
  { id: 'WH003', name: '成品仓库' }
])

// 模拟数据
const mockTransfers = ref([
  {
    id: '1',
    transfer_no: 'TF202401001',
    from_warehouse_id: 'WH001',
    from_warehouse_name: '主仓库',
    to_warehouse_id: 'WH002',
    to_warehouse_name: '原料仓库',
    status: 'pending',
    operator_name: '张三',
    total_quantity: 200,
    created_at: new Date('2024-01-15'),
    remark: '紧急调拨',
    items: [
      {
        product_name: '商品A',
        current_stock: 500,
        transfer_quantity: 100,
        unit: '个'
      },
      {
        product_name: '商品B',
        current_stock: 300,
        transfer_quantity: 100,
        unit: '个'
      }
    ]
  },
  {
    id: '2',
    transfer_no: 'TF202401002',
    from_warehouse_id: 'WH002',
    from_warehouse_name: '原料仓库',
    to_warehouse_id: 'WH003',
    to_warehouse_name: '成品仓库',
    status: 'completed',
    operator_name: '李四',
    total_quantity: 150,
    created_at: new Date('2024-01-14'),
    remark: '常规调拨',
    items: [
      {
        product_name: '商品C',
        current_stock: 200,
        transfer_quantity: 150,
        unit: '箱'
      }
    ]
  }
])

// 计算属性
const filteredTransfers = computed(() => {
  let result = mockTransfers.value

  if (filters.value.search) {
    const query = filters.value.search.toLowerCase()
    result = result.filter(transfer =>
      transfer.transfer_no.toLowerCase().includes(query)
      || transfer.items.some(item => item.product_name.toLowerCase().includes(query))
    )
  }

  if (filters.value.status) {
    result = result.filter(transfer => transfer.status === filters.value.status)
  }

  if (filters.value.from_warehouse) {
    result = result.filter(transfer => transfer.from_warehouse_id === filters.value.from_warehouse)
  }

  return result
})

const totalCount = computed(() => mockTransfers.value.length)

const totalQuantity = computed(() => {
  return transferForm.value.items.reduce((sum: number, item: any) => {
    return sum + (item.transfer_quantity || 0)
  }, 0)
})

// 状态映射
const statusMap: Record<string, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已批准',
  in_transit: '运输中',
  completed: '已完成',
  cancelled: '已取消'
}

const statusSeverityMap: Record<string, string> = {
  draft: 'secondary',
  pending: 'warn',
  approved: 'info',
  in_transit: 'primary',
  completed: 'success',
  cancelled: 'danger'
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status

const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 加载调拨单数据
const loadTransfers = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  catch (error) {
    console.error('加载调拨单失败:', error)
  }
  finally {
    loading.value = false
  }
}

const openTransferDialog = (transfer: any = null) => {
  if (transfer) {
    editingTransfer.value = transfer
    dialogMode.value = 'edit'
    Object.assign(transferForm.value, {
      transfer_no: transfer.transfer_no,
      from_warehouse_id: transfer.from_warehouse_id,
      to_warehouse_id: transfer.to_warehouse_id,
      status: transfer.status,
      remark: transfer.remark,
      items: [...transfer.items]
    })
  }
  else {
    editingTransfer.value = null
    dialogMode.value = 'create'
    transferForm.value = {
      transfer_no: `TF${Date.now()}`,
      from_warehouse_id: '',
      to_warehouse_id: '',
      status: 'draft',
      remark: '',
      items: []
    }
  }
  showDialog.value = true
}

const viewTransfer = (transfer: any) => {
  editingTransfer.value = transfer
  dialogMode.value = 'view'
  Object.assign(transferForm.value, {
    transfer_no: transfer.transfer_no,
    from_warehouse_id: transfer.from_warehouse_id,
    to_warehouse_id: transfer.to_warehouse_id,
    status: transfer.status,
    remark: transfer.remark,
    items: [...transfer.items]
  })
  showDialog.value = true
}

const editTransfer = (transfer: any) => {
  openTransferDialog(transfer)
}

const approveTransfer = async (transfer: any) => {
  confirm.require({
    message: `确定要审核通过调拨单 ${transfer.transfer_no} 吗？`,
    header: '确认审核',
    icon: 'pi pi-check',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockTransfers.value.findIndex(t => t.id === transfer.id)
        if (index !== -1 && mockTransfers.value[index]) {
          mockTransfers.value[index].status = 'approved'
        }
      }
      catch (error) {
        console.error('审核失败:', error)
      }
    }
  })
}

const confirmDeleteTransfer = (transfer: any) => {
  confirm.require({
    message: `确定要删除调拨单 ${transfer.transfer_no} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteTransfer(transfer.id)
    }
  })
}

const deleteTransfer = (transferId: string) => {
  mockTransfers.value = mockTransfers.value.filter(transfer => transfer.id !== transferId)
}

const closeTransferDialog = () => {
  showDialog.value = false
  editingTransfer.value = null
}

const saveTransfer = () => {
  if (editingTransfer.value?.id) {
    // 编辑模式
    const index = mockTransfers.value.findIndex(t => t.id === editingTransfer.value!.id)
    if (index !== -1 && mockTransfers.value[index]) {
      mockTransfers.value[index] = {
        ...transferForm.value,
        id: editingTransfer.value.id,
        created_at: mockTransfers.value[index].created_at
      } as Transfer
    }
  } else {
    // 新增模式
    const newTransfer: Transfer = {
      ...transferForm.value,
      id: Date.now().toString(),
      created_at: new Date()
    } as Transfer
    mockTransfers.value.unshift(newTransfer)
  }
  
  closeTransferDialog()
}

const addTransferItem = () => {
  transferForm.value.items.push({
    product_name: '新商品',
    current_stock: 100,
    transfer_quantity: 1,
    unit: '个'
  })
}

const removeTransferItem = (index: number) => {
  transferForm.value.items.splice(index, 1)
}

const exportTransfers = () => {
  console.log('导出调拨单')
}

// 初始化
onMounted(() => {
  loadTransfers()
})
</script>
