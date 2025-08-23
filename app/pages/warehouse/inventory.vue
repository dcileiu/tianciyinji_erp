<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-color">库存管理</h1>
        <p class="text-muted-color">实时监控库存状态，管理库存变动</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button
          label="刷新"
          icon="pi pi-refresh"
          outlined
          @click="refreshData"
        />
        <Button
          label="库存调整"
          icon="pi pi-plus"
          @click="showAdjustDialog = true"
        />
      </div>
    </div>

    <!-- 库存统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <i class="pi pi-box text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">总商品数</p>
              <p class="text-2xl font-semibold text-color">156</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <i class="pi pi-trending-up text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">库存总值</p>
              <p class="text-2xl font-semibold text-color">¥1,234,567</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">低库存预警</p>
              <p class="text-2xl font-semibold text-color">12</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <i class="pi pi-home text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">仓库数量</p>
              <p class="text-2xl font-semibold text-color">3</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">搜索</label>
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search"></i>
              </InputIcon>
              <InputText
                v-model="searchQuery"
                placeholder="商品名称、编码..."
                class="w-full"
              />
            </IconField>
          </div>
          
          <!-- 仓库筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">仓库</label>
            <Dropdown
              v-model="warehouseFilter"
              :options="warehouses"
              option-label="name"
              option-value="id"
              placeholder="全部仓库"
              show-clear
              class="w-full"
            />
          </div>
          
          <!-- 分类筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">分类</label>
            <Dropdown
              v-model="categoryFilter"
              :options="categories"
              option-label="name"
              option-value="id"
              placeholder="全部分类"
              show-clear
              class="w-full"
            />
          </div>
          
          <!-- 状态筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2 text-color">库存状态</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>
        </div>
        
        <div class="flex justify-between items-center mt-4">
          <div class="flex items-center gap-2">
            <Button
              label="重置筛选"
              icon="pi pi-filter-slash"
              text
              size="small"
              @click="resetFilters"
            />
          </div>
          
          <div class="flex items-center gap-2">
            <Button
              label="导出"
              icon="pi pi-download"
              outlined
              size="small"
              @click="exportInventory"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 库存列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">库存列表</h3>
          <div class="text-sm text-muted-color">
            共 {{ filteredInventory.length }} 个商品
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="filteredInventory"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          class="p-datatable-sm"
        >
          <Column field="product_code" header="商品编码" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm font-mono">
                {{ slotProps.data.product_code }}
              </code>
            </template>
          </Column>
          
          <Column field="product_name" header="商品名称" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <Avatar
                  :image="slotProps.data.image"
                  :label="slotProps.data.product_name.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <span class="font-medium">{{ slotProps.data.product_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="warehouse_name" header="仓库" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-1">
                <i class="pi pi-home text-primary"></i>
                <span class="text-sm">{{ slotProps.data.warehouse_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="category_name" header="分类" sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.category_name"
                severity="info"
              />
            </template>
          </Column>
          
          <Column field="current_stock" header="当前库存" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <span class="font-medium">{{ slotProps.data.current_stock }}</span>
                <span class="text-sm text-muted-color">{{ slotProps.data.unit }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="available_stock" header="可用库存" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <span>{{ slotProps.data.available_stock }}</span>
                <span class="text-sm text-muted-color">{{ slotProps.data.unit }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="reserved_stock" header="预留库存" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <span>{{ slotProps.data.reserved_stock }}</span>
                <span class="text-sm text-muted-color">{{ slotProps.data.unit }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="stock_status" header="库存状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.stock_status)"
                :severity="getStatusSeverity(slotProps.data.stock_status)"
              />
            </template>
          </Column>
          
          <Column field="last_updated" header="最后更新" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.last_updated) }}
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
                  @click="viewInventory(slotProps.data)"
                />
                <Button
                  v-tooltip="'库存调整'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="adjustInventory(slotProps.data)"
                />
                <Button
                  v-tooltip="'变动记录'"
                  icon="pi pi-history"
                  rounded
                  text
                  size="small"
                  @click="viewHistory(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 库存调整对话框 -->
    <Dialog
      v-model:visible="showAdjustDialog"
      header="库存调整"
      :style="{ width: '500px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">商品 *</label>
            <Dropdown
              v-model="adjustForm.product_id"
              :options="products"
              option-label="name"
              option-value="id"
              placeholder="选择商品"
              filter
              required
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">仓库 *</label>
            <Dropdown
              v-model="adjustForm.warehouse_id"
              :options="warehouses"
              option-label="name"
              option-value="id"
              placeholder="选择仓库"
              required
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">调整类型 *</label>
            <Dropdown
              v-model="adjustForm.adjust_type"
              :options="adjustTypes"
              option-label="label"
              option-value="value"
              placeholder="选择调整类型"
              required
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">调整数量 *</label>
            <InputNumber
              v-model="adjustForm.quantity"
              placeholder="调整数量"
              :min="1"
              required
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">调整原因</label>
            <Textarea
              v-model="adjustForm.reason"
              placeholder="请输入调整原因"
              :rows="3"
            />
          </div>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            icon="pi pi-times"
            outlined
            @click="closeAdjustDialog"
          />
          <Button
            label="确认调整"
            icon="pi pi-check"
            :loading="adjusting"
            @click="confirmAdjust"
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

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '库存管理 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const adjusting = ref(false)
const showAdjustDialog = ref(false)
const confirm = useConfirm()

// 筛选条件
const searchQuery = ref('')
const warehouseFilter = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')

// 调整表单
const adjustForm = ref({
  product_id: '',
  warehouse_id: '',
  adjust_type: 'in',
  quantity: 0,
  reason: ''
})

// 选项数据
const warehouses = ref([
  { id: '1', name: '原料仓库A' },
  { id: '2', name: '成品仓库B' },
  { id: '3', name: '工具仓库C' }
])

const categories = ref([
  { id: '1', name: '电子产品' },
  { id: '2', name: '服装鞋帽' },
  { id: '3', name: '食品饮料' },
  { id: '4', name: '办公用品' }
])

const products = ref([
  { id: '1', name: 'iPhone 15 Pro' },
  { id: '2', name: '华为 Mate 60' },
  { id: '3', name: '小米 14' }
])

const statusOptions = ref([
  { label: '正常', value: 'normal' },
  { label: '低库存', value: 'low' },
  { label: '缺货', value: 'out_of_stock' },
  { label: '超储', value: 'overstock' }
])

const adjustTypes = ref([
  { label: '入库', value: 'in' },
  { label: '出库', value: 'out' },
  { label: '盘点调整', value: 'adjust' },
  { label: '损耗', value: 'loss' }
])

// 模拟数据
const mockInventory = ref([
  {
    id: '1',
    product_code: 'PRD001',
    product_name: 'iPhone 15 Pro',
    image: null,
    warehouse_id: '1',
    warehouse_name: '成品仓库B',
    category_id: '1',
    category_name: '电子产品',
    current_stock: 120,
    available_stock: 100,
    reserved_stock: 20,
    unit: '部',
    stock_status: 'normal',
    min_stock: 50,
    max_stock: 500,
    last_updated: new Date('2024-01-15')
  },
  {
    id: '2',
    product_code: 'PRD002',
    product_name: '华为 Mate 60',
    image: null,
    warehouse_id: '1',
    warehouse_name: '成品仓库B',
    category_id: '1',
    category_name: '电子产品',
    current_stock: 15,
    available_stock: 10,
    reserved_stock: 5,
    unit: '部',
    stock_status: 'low',
    min_stock: 20,
    max_stock: 200,
    last_updated: new Date('2024-01-14')
  },
  {
    id: '3',
    product_code: 'PRD003',
    product_name: '小米 14',
    image: null,
    warehouse_id: '1',
    warehouse_name: '成品仓库B',
    category_id: '1',
    category_name: '电子产品',
    current_stock: 0,
    available_stock: 0,
    reserved_stock: 0,
    unit: '部',
    stock_status: 'out_of_stock',
    min_stock: 30,
    max_stock: 300,
    last_updated: new Date('2024-01-13')
  }
])

// 计算属性
const filteredInventory = computed(() => {
  let result = mockInventory.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item =>
      item.product_name.toLowerCase().includes(query)
      || item.product_code.toLowerCase().includes(query)
    )
  }

  if (warehouseFilter.value) {
    result = result.filter(item => item.warehouse_id === warehouseFilter.value)
  }

  if (categoryFilter.value) {
    result = result.filter(item => item.category_id === categoryFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(item => item.stock_status === statusFilter.value)
  }

  return result
})

// 状态映射
const statusMap: Record<string, string> = {
  normal: '正常',
  low: '低库存',
  out_of_stock: '缺货',
  overstock: '超储'
}

const statusSeverityMap: Record<string, string> = {
  normal: 'success',
  low: 'warn',
  out_of_stock: 'danger',
  overstock: 'info'
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status

const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const resetFilters = () => {
  searchQuery.value = ''
  warehouseFilter.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
}

const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  catch (error) {
    console.error('刷新数据失败:', error)
  }
  finally {
    loading.value = false
  }
}

const viewInventory = (item: any) => {
  console.log('查看库存详情:', item)
}

const adjustInventory = (item: any) => {
  adjustForm.value.product_id = item.id
  adjustForm.value.warehouse_id = item.warehouse_id
  adjustForm.value.adjust_type = 'adjust'
  adjustForm.value.quantity = 0
  adjustForm.value.reason = ''
  showAdjustDialog.value = true
}

const viewHistory = (item: any) => {
  console.log('查看变动记录:', item)
}

const closeAdjustDialog = () => {
  showAdjustDialog.value = false
  Object.assign(adjustForm.value, {
    product_id: '',
    warehouse_id: '',
    adjust_type: 'in',
    quantity: 0,
    reason: ''
  })
}

const confirmAdjust = async () => {
  adjusting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('库存调整:', adjustForm.value)
    closeAdjustDialog()
  }
  catch (error) {
    console.error('库存调整失败:', error)
  }
  finally {
    adjusting.value = false
  }
}

const exportInventory = () => {
  console.log('导出库存数据')
}

// 初始化
onMounted(() => {
  refreshData()
})
</script> 
