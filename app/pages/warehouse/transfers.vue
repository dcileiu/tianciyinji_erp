<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">库存调拨</h1>
        <p class="text-muted-foreground mt-2">管理仓库间库存调拨</p>
      </div>
      <Button @click="openTransferDialog()" class="gap-2">
        <Plus class="h-4 w-4" />
        新建调拨单
      </Button>
    </div>

    <!-- 筛选区域 -->
    <Card class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-medium mb-2 block">状态</label>
          <select v-model="filters.status" class="w-full p-2 border rounded-md">
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending">待审核</option>
            <option value="approved">已批准</option>
            <option value="in_transit">运输中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium mb-2 block">调出仓库</label>
          <select v-model="filters.from_warehouse" class="w-full p-2 border rounded-md">
            <option value="">全部仓库</option>
            <option value="WH001">主仓库</option>
            <option value="WH002">原料仓库</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium mb-2 block">搜索</label>
          <div class="relative">
            <Search class="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              v-model="filters.search"
              placeholder="搜索调拨单号、商品..."
              class="pl-10"
            />
          </div>
        </div>
        <div class="flex items-end gap-2">
          <Button @click="loadTransfers" variant="outline" class="gap-2">
            <RefreshCw class="h-4 w-4" />
            刷新
          </Button>
          <Button @click="exportTransfers" variant="outline" class="gap-2">
            <Download class="h-4 w-4" />
            导出
          </Button>
        </div>
      </div>
    </Card>

    <!-- 调拨单列表 -->
    <Card>
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">调拨单列表</h3>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            共 {{ totalCount }} 条记录
          </div>
        </div>
        
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4 font-medium">调拨单号</th>
                <th class="text-left py-3 px-4 font-medium">调出仓库</th>
                <th class="text-left py-3 px-4 font-medium">调入仓库</th>
                <th class="text-left py-3 px-4 font-medium">商品数量</th>
                <th class="text-left py-3 px-4 font-medium">申请人</th>
                <th class="text-left py-3 px-4 font-medium">申请时间</th>
                <th class="text-left py-3 px-4 font-medium">状态</th>
                <th class="text-left py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transfer in transfers" :key="transfer.id" class="border-b hover:bg-muted/50">
                <td class="py-3 px-4">
                  <div class="font-medium">{{ transfer.transfer_number }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="font-medium">{{ transfer.from_warehouse_name }}</div>
                  <div class="text-sm text-muted-foreground">{{ transfer.from_warehouse_code }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="font-medium">{{ transfer.to_warehouse_name }}</div>
                  <div class="text-sm text-muted-foreground">{{ transfer.to_warehouse_code }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="font-medium">{{ transfer.item_count }} 种商品</div>
                  <div class="text-sm text-muted-foreground">{{ transfer.total_quantity }} 件</div>
                </td>
                <td class="py-3 px-4">
                  <div>{{ transfer.applicant_name }}</div>
                  <div class="text-sm text-muted-foreground">{{ transfer.applicant_department }}</div>
                </td>
                <td class="py-3 px-4">{{ formatDate(transfer.created_at) }}</td>
                <td class="py-3 px-4">
                  <span :class="{
                    'bg-gray-100 text-gray-800': transfer.status === 'draft',
                    'bg-yellow-100 text-yellow-800': transfer.status === 'pending',
                    'bg-blue-100 text-blue-800': transfer.status === 'approved',
                    'bg-purple-100 text-purple-800': transfer.status === 'in_transit',
                    'bg-green-100 text-green-800': transfer.status === 'completed',
                    'bg-red-100 text-red-800': transfer.status === 'cancelled'
                  }" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ getStatusText(transfer.status) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <Button @click="viewTransfer(transfer)" size="sm" variant="ghost">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button v-if="transfer.status === 'draft'" @click="editTransfer(transfer)" size="sm" variant="ghost">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button v-if="transfer.status === 'pending'" @click="approveTransfer(transfer)" size="sm" variant="ghost" class="text-green-600">
                      <CheckCircle class="h-4 w-4" />
                    </Button>
                    <Button v-if="['draft', 'pending'].includes(transfer.status)" @click="cancelTransfer(transfer)" size="sm" variant="ghost" class="text-red-500 hover:text-red-700">
                      <XCircle class="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="transfers.length === 0" class="text-center py-8 text-muted-foreground">
            暂无调拨单数据
          </div>
        </div>
      </div>
    </Card>

    <!-- 调拨单对话框 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card class="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold">
              {{ editingTransfer ? '编辑调拨单' : '新建调拨单' }}
            </h2>
            <Button @click="closeDialog" variant="ghost" size="sm">
              <X class="h-4 w-4" />
            </Button>
          </div>
          
          <form @submit.prevent="saveTransfer" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">调拨单号</label>
                <Input v-model="form.transfer_number" placeholder="自动生成" readonly />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">调出仓库</label>
                <select v-model="form.from_warehouse" class="w-full p-2 border rounded-md" required>
                  <option value="">选择调出仓库</option>
                  <option value="WH001">主仓库</option>
                  <option value="WH002">原料仓库</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">调入仓库</label>
                <select v-model="form.to_warehouse" class="w-full p-2 border rounded-md" required>
                  <option value="">选择调入仓库</option>
                  <option value="WH001">主仓库</option>
                  <option value="WH002">原料仓库</option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">申请人</label>
                <Input v-model="form.applicant_name" placeholder="申请人姓名" required />
              </div>
              <div>
                <label class="text-sm font-medium mb-2 block">申请部门</label>
                <Input v-model="form.applicant_department" placeholder="申请部门" required />
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium mb-2 block">调拨原因</label>
              <textarea v-model="form.reason" class="w-full p-2 border rounded-md" rows="3" placeholder="请说明调拨原因" required></textarea>
            </div>
            
            <!-- 调拨商品列表 -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h4 class="font-medium">调拨商品</h4>
                <Button type="button" @click="addTransferItem" variant="outline" size="sm">
                  <Plus class="h-4 w-4 mr-2" />
                  添加商品
                </Button>
              </div>
              
              <div class="border rounded-md">
                <table class="w-full">
                  <thead class="bg-muted/50">
                    <tr>
                      <th class="text-left py-2 px-3 text-sm font-medium">商品编码</th>
                      <th class="text-left py-2 px-3 text-sm font-medium">商品名称</th>
                      <th class="text-left py-2 px-3 text-sm font-medium">规格</th>
                      <th class="text-left py-2 px-3 text-sm font-medium">调拨数量</th>
                      <th class="text-left py-2 px-3 text-sm font-medium">单位</th>
                      <th class="text-left py-2 px-3 text-sm font-medium">备注</th>
                      <th class="text-left py-2 px-3 text-sm font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index" class="border-t">
                      <td class="py-2 px-3">
                        <Input v-model="item.product_code" placeholder="商品编码" class="text-sm" />
                      </td>
                      <td class="py-2 px-3">
                        <Input v-model="item.product_name" placeholder="商品名称" class="text-sm" />
                      </td>
                      <td class="py-2 px-3">
                        <Input v-model="item.specification" placeholder="规格" class="text-sm" />
                      </td>
                      <td class="py-2 px-3">
                        <Input v-model="item.quantity" type="number" placeholder="数量" class="text-sm" />
                      </td>
                      <td class="py-2 px-3">
                        <Input v-model="item.unit" placeholder="单位" class="text-sm" />
                      </td>
                      <td class="py-2 px-3">
                        <Input v-model="item.notes" placeholder="备注" class="text-sm" />
                      </td>
                      <td class="py-2 px-3">
                        <Button type="button" @click="removeTransferItem(index)" size="sm" variant="ghost" class="text-red-500">
                          <Trash2 class="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-if="form.items.length === 0" class="text-center py-8 text-muted-foreground text-sm">
                  暂无商品，请点击"添加商品"按钮添加
                </div>
              </div>
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
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Card from '~/components/ui/Card.vue'
import { Plus, Search, RefreshCw, Download, Eye, Edit, CheckCircle, XCircle, Trash2, X } from 'lucide-vue-next'

// 页面元数据
definePageMeta({
  title: '库存调拨',
  description: '管理仓库间库存调拨'
})

// 响应式数据
const transfers = ref([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingTransfer = ref(null)
const totalCount = ref(0)

// 筛选条件
const filters = reactive({
  status: '',
  from_warehouse: '',
  search: ''
})

// 表单数据
const form = reactive({
  transfer_number: '',
  from_warehouse: '',
  to_warehouse: '',
  applicant_name: '',
  applicant_department: '',
  reason: '',
  items: []
})

// 初始化表单
const initForm = () => {
  form.transfer_number = ''
  form.from_warehouse = ''
  form.to_warehouse = ''
  form.applicant_name = ''
  form.applicant_department = ''
  form.reason = ''
  form.items = []
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    pending: '待审核',
    approved: '已批准',
    in_transit: '运输中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 加载调拨单数据
const loadTransfers = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockData = [
      {
        id: 1,
        transfer_number: 'TR-2024-001',
        from_warehouse_code: 'WH001',
        from_warehouse_name: '主仓库',
        to_warehouse_code: 'WH002',
        to_warehouse_name: '原料仓库',
        item_count: 3,
        total_quantity: 150,
        applicant_name: '张三',
        applicant_department: '生产部',
        status: 'pending',
        created_at: '2024-01-15T10:00:00Z',
        reason: '生产需要调拨原料'
      },
      {
        id: 2,
        transfer_number: 'TR-2024-002',
        from_warehouse_code: 'WH002',
        from_warehouse_name: '原料仓库',
        to_warehouse_code: 'WH001',
        to_warehouse_name: '主仓库',
        item_count: 2,
        total_quantity: 80,
        applicant_name: '李四',
        applicant_department: '仓储部',
        status: 'completed',
        created_at: '2024-01-10T14:30:00Z',
        reason: '库存平衡调整'
      }
    ]
    
    transfers.value = mockData
    totalCount.value = mockData.length
  } catch (error) {
    console.error('加载调拨单失败:', error)
  } finally {
    loading.value = false
  }
}

// 添加调拨商品
const addTransferItem = () => {
  form.items.push({
    product_code: '',
    product_name: '',
    specification: '',
    quantity: '',
    unit: '',
    notes: ''
  })
}

// 移除调拨商品
const removeTransferItem = (index) => {
  form.items.splice(index, 1)
}

// 打开调拨单对话框
const openTransferDialog = (transfer = null) => {
  editingTransfer.value = transfer
  if (transfer) {
    form.transfer_number = transfer.transfer_number
    form.from_warehouse = transfer.from_warehouse_code
    form.to_warehouse = transfer.to_warehouse_code
    form.applicant_name = transfer.applicant_name
    form.applicant_department = transfer.applicant_department
    form.reason = transfer.reason
    form.items = transfer.items || []
  } else {
    initForm()
    // 生成调拨单号
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    form.transfer_number = `TR-${year}${month}${day}-${random}`
  }
  showDialog.value = true
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
  editingTransfer.value = null
  initForm()
}

// 保存调拨单
const saveTransfer = async () => {
  if (form.items.length === 0) {
    alert('请至少添加一个调拨商品')
    return
  }
  
  if (form.from_warehouse === form.to_warehouse) {
    alert('调出仓库和调入仓库不能相同')
    return
  }
  
  saving.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingTransfer.value) {
      // 更新现有调拨单
      const index = transfers.value.findIndex(t => t.id === editingTransfer.value.id)
      if (index !== -1) {
        transfers.value[index] = { 
          ...editingTransfer.value, 
          ...form,
          item_count: form.items.length,
          total_quantity: form.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        }
      }
    } else {
      // 添加新调拨单
      const newTransfer = {
        id: Date.now(),
        transfer_number: form.transfer_number,
        from_warehouse_code: form.from_warehouse,
        from_warehouse_name: form.from_warehouse === 'WH001' ? '主仓库' : '原料仓库',
        to_warehouse_code: form.to_warehouse,
        to_warehouse_name: form.to_warehouse === 'WH001' ? '主仓库' : '原料仓库',
        item_count: form.items.length,
        total_quantity: form.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        applicant_name: form.applicant_name,
        applicant_department: form.applicant_department,
        status: 'draft',
        created_at: new Date().toISOString(),
        reason: form.reason,
        items: form.items
      }
      transfers.value.unshift(newTransfer)
      totalCount.value++
    }
    
    closeDialog()
  } catch (error) {
    console.error('保存调拨单失败:', error)
  } finally {
    saving.value = false
  }
}

// 查看调拨单
const viewTransfer = (transfer) => {
  console.log('查看调拨单:', transfer)
}

// 编辑调拨单
const editTransfer = (transfer) => {
  openTransferDialog(transfer)
}

// 批准调拨单
const approveTransfer = async (transfer) => {
  if (confirm('确定要批准这个调拨单吗？')) {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = transfers.value.findIndex(t => t.id === transfer.id)
      if (index !== -1) {
        transfers.value[index].status = 'approved'
      }
    } catch (error) {
      console.error('批准调拨单失败:', error)
    }
  }
}

// 取消调拨单
const cancelTransfer = async (transfer) => {
  if (confirm('确定要取消这个调拨单吗？')) {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = transfers.value.findIndex(t => t.id === transfer.id)
      if (index !== -1) {
        transfers.value[index].status = 'cancelled'
      }
    } catch (error) {
      console.error('取消调拨单失败:', error)
    }
  }
}

// 导出调拨单
const exportTransfers = () => {
  console.log('导出调拨单数据')
}

// 页面加载时获取数据
onMounted(() => {
  loadTransfers()
})
</script> 