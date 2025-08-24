<template>
  <div class="inventory-container p-6 flex flex-column gap-6 bg-surface-50 min-h-full">
    <!-- 页面头部 -->
    <div class="page-header bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-8 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-black opacity-10"></div>
      <div class="absolute -top-4 -right-4 w-32 h-32 bg-white opacity-5 rounded-full"></div>
      <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-white opacity-5 rounded-full"></div>
      <div class="relative z-10">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2 flex items-center">
              <i class="pi pi-box mr-3 text-4xl"></i>
              库存管理
            </h1>
            <p class="text-orange-100 text-lg">实时监控库存状态，管理库存变动，优化库存配置</p>
          </div>
          <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <Button
              label="导入库存"
              icon="pi pi-upload"
              severity="secondary"
              outlined
              class="text-white border-white hover:bg-white hover:text-orange-600"
              @click="importInventory"
            />
            <Button
              label="库存调整"
              icon="pi pi-plus"
              class="bg-white text-orange-600 hover:bg-orange-50 border-0 shadow-lg"
              @click="showAdjustDialog = true"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 库存统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-box text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-blue-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +5.2%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">{{ filteredInventory.length }}</div>
                <div class="text-blue-100">总商品数</div>
                <div class="text-xs text-blue-200 mt-2">当前在库商品种类</div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-trending-up text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-green-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +12.8%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">¥{{ totalInventoryValue.toLocaleString() }}</div>
                <div class="text-green-100">库存总值</div>
                <div class="text-xs text-green-200 mt-2">按成本价计算</div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-exclamation-triangle text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-red-100">
                    <i class="pi pi-arrow-down mr-1"></i>
                    -2.1%
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">{{ lowStockCount }}</div>
                <div class="text-red-100">低库存预警</div>
                <div class="text-xs text-red-200 mt-2">需要及时补货</div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg overflow-hidden">
        <template #content>
          <div class="relative p-6">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i class="pi pi-home text-2xl text-white"></i>
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-purple-100">
                    <i class="pi pi-arrow-up mr-1"></i>
                    +1
                  </div>
                </div>
              </div>
              <div>
                <div class="text-3xl font-bold mb-1">{{ warehouses.length }}</div>
                <div class="text-purple-100">仓库数量</div>
                <div class="text-xs text-purple-200 mt-2">管理的仓库总数</div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="shadow-lg border-0">
      <template #header>
        <div class="p-6 pb-0">
          <h3 class="text-lg font-bold text-surface-900 mb-1 flex items-center">
            <i class="pi pi-filter mr-2 text-primary-600"></i>
            搜索与筛选
          </h3>
          <p class="text-surface-600">快速找到您需要的库存信息</p>
        </div>
      </template>
      <template #content>
        <div class="p-6 pt-0">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- 搜索框 -->
            <div>
              <label class="block text-sm font-semibold mb-2 text-surface-900">搜索商品</label>
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
              <label class="block text-sm font-semibold mb-2 text-surface-900">仓库</label>
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
              <label class="block text-sm font-semibold mb-2 text-surface-900">分类</label>
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
              <label class="block text-sm font-semibold mb-2 text-surface-900">库存状态</label>
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
          
          <div class="flex justify-between items-center mt-6">
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
                label="导出数据"
                icon="pi pi-download"
                outlined
                size="small"
                @click="exportInventory"
              />
              <Button
                v-tooltip="'刷新数据'"
                icon="pi pi-refresh"
                outlined
                rounded
                size="small"
                @click="refreshData"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- 库存列表 -->
    <Card class="shadow-lg border-0">
      <template #header>
        <div class="p-6 pb-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold text-surface-900 mb-1 flex items-center">
                <i class="pi pi-list mr-2 text-primary-600"></i>
                库存列表
              </h3>
              <p class="text-surface-600">
                当前共有 {{ filteredInventory.length }} 个商品，总价值 ¥{{ totalInventoryValue.toLocaleString() }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Dropdown
                v-model="pageRows"
                :options="rowsPerPageOptions"
                option-label="label"
                option-value="value"
                class="w-32"
                size="small"
              />
            </div>
          </div>
        </div>
      </template>

      <template #content>
        <div class="p-6 pt-0">
          <DataTable
            :value="filteredInventory"
            :loading="loading"
            :paginator="true"
            :rows="pageRows"
            :rows-per-page-options="[10, 20, 50]"
            data-key="id"
            :sort-field="'last_updated'"
            :sort-order="-1"
          >
            <template #loading>
              <div class="p-6">
                <div v-for="i in 6" :key="i" class="flex align-items-center gap-4 mb-4">
                  <Skeleton shape="circle" size="2.5rem" />
                  <div class="flex-1">
                    <Skeleton width="100%" height="1.5rem" class="mb-2" />
                    <Skeleton width="70%" height="1rem" />
                  </div>
                  <Skeleton width="6rem" height="1.5rem" />
                  <Skeleton width="4rem" height="1.5rem" />
                  <Skeleton width="5rem" height="2rem" />
                </div>
              </div>
            </template>

            <template #empty>
              <div class="text-center py-16 text-surface-500">
                <div class="mb-6">
                  <i class="pi pi-box text-8xl text-surface-300"></i>
                </div>
                <h3 class="text-xl font-semibold mb-4">暂无库存数据</h3>
                <p class="text-surface-600 mb-6 max-w-md mx-auto">
                  您还没有任何库存记录。点击下方按钮开始添加库存。
                </p>
                <Button
                  label="库存调整"
                  icon="pi pi-plus"
                  class="px-6 py-3"
                  @click="showAdjustDialog = true"
                />
              </div>
            </template>

            <Column field="product_code" header="商品编码" sortable style="min-width: 150px">
              <template #body="slotProps">
                <div class="flex items-center">
                  <code class="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-mono font-semibold">
                    {{ slotProps.data.product_code }}
                  </code>
                </div>
              </template>
            </Column>
            
            <Column field="product_name" header="商品信息" sortable style="min-width: 200px">
              <template #body="slotProps">
                <div class="flex items-center space-x-3">
                  <Avatar
                    :image="slotProps.data.image"
                    :label="slotProps.data.product_name.charAt(0)"
                    shape="circle"
                    size="normal"
                    class="bg-gradient-to-br from-primary-400 to-primary-600 text-white"
                  />
                  <div>
                    <div class="font-semibold text-surface-900">{{ slotProps.data.product_name }}</div>
                    <div class="text-sm text-surface-600">{{ slotProps.data.category_name }}</div>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column field="warehouse_name" header="仓库位置" sortable style="min-width: 140px">
              <template #body="slotProps">
                <div class="flex items-center space-x-2">
                  <i class="pi pi-home text-primary-600"></i>
                  <div>
                    <div class="font-medium text-surface-900">{{ slotProps.data.warehouse_name }}</div>
                    <div class="text-xs text-surface-500">A1-B2-C3</div>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column field="current_stock" header="当前库存" sortable style="min-width: 140px">
              <template #body="slotProps">
                <div class="text-center">
                  <div class="font-bold text-xl text-surface-900">{{ slotProps.data.current_stock }}</div>
                  <div class="text-sm text-surface-600">{{ slotProps.data.unit }}</div>
                </div>
              </template>
            </Column>
            
            <Column field="available_stock" header="可用库存" sortable style="min-width: 120px">
              <template #body="slotProps">
                <div class="text-center">
                  <div class="font-semibold text-green-600 text-lg">{{ slotProps.data.available_stock }}</div>
                  <div class="text-xs text-surface-500">{{ slotProps.data.unit }}</div>
                </div>
              </template>
            </Column>
            
            <Column field="reserved_stock" header="预留库存" sortable style="min-width: 120px">
              <template #body="slotProps">
                <div class="text-center">
                  <div class="font-medium text-orange-600">{{ slotProps.data.reserved_stock }}</div>
                  <div class="text-xs text-surface-500">{{ slotProps.data.unit }}</div>
                </div>
              </template>
            </Column>
            
            <Column field="stock_status" header="库存状态" sortable style="min-width: 120px">
              <template #body="slotProps">
                <div class="flex flex-col items-center gap-1">
                  <Tag
                    :value="getStatusDisplayName(slotProps.data.stock_status)"
                    :severity="getStatusSeverity(slotProps.data.stock_status)"
                    class="font-semibold"
                  />
                  <div class="text-xs text-surface-500">{{ getStockPercentage(slotProps.data) }}%</div>
                </div>
              </template>
            </Column>
            
            <Column field="last_updated" header="最后更新" sortable style="min-width: 140px">
              <template #body="slotProps">
                <div class="text-center">
                  <div class="text-sm font-medium text-surface-900">
                    {{ formatDate(slotProps.data.last_updated) }}
                  </div>
                  <div class="text-xs text-surface-500">
                    {{ formatTimeAgo(slotProps.data.last_updated) }}
                  </div>
                </div>
              </template>
            </Column>
            
            <Column header="操作" :exportable="false" style="min-width: 160px">
              <template #body="slotProps">
                <div class="flex gap-1 justify-center">
                  <Button
                    v-tooltip="'查看详情'"
                    icon="pi pi-eye"
                    rounded
                    text
                    size="small"
                    class="p-button-info"
                    @click="viewInventory(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'库存调整'"
                    icon="pi pi-pencil"
                    rounded
                    text
                    size="small"
                    class="p-button-warning"
                    @click="adjustInventory(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'变动记录'"
                    icon="pi pi-history"
                    rounded
                    text
                    size="small"
                    class="p-button-secondary"
                    @click="viewHistory(slotProps.data)"
                  />
                  <Button
                    v-tooltip="'库存转移'"
                    icon="pi pi-arrow-right"
                    rounded
                    text
                    size="small"
                    class="p-button-primary"
                    @click="transferStock(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>

    <!-- 库存调整对话框 -->
    <Dialog
      v-model:visible="showAdjustDialog"
      :header="'库存调整'"
      :style="{ width: '600px' }"
      modal
      class="p-fluid adjust-dialog"
      :draggable="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <i class="pi pi-box text-orange-600 text-lg"></i>
          </div>
          <div>
            <h3 class="text-xl font-bold text-surface-900">库存调整</h3>
            <p class="text-surface-600 text-sm">调整商品库存数量</p>
          </div>
        </div>
      </template>

      <template #default>
        <div class="space-y-6 py-4">
          <!-- 基本信息 -->
          <Card class="shadow-sm">
            <template #header>
              <div class="p-4 pb-0">
                <h4 class="font-semibold text-surface-900 flex items-center">
                  <i class="pi pi-info-circle mr-2 text-primary-600"></i>
                  基本信息
                </h4>
              </div>
            </template>
            <template #content>
              <div class="p-4 pt-0">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-surface-900">商品 *</label>
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
                    <label class="block text-sm font-semibold text-surface-900">仓库 *</label>
                    <Dropdown
                      v-model="adjustForm.warehouse_id"
                      :options="warehouses"
                      option-label="name"
                      option-value="id"
                      placeholder="选择仓库"
                      required
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- 调整信息 -->
          <Card class="shadow-sm">
            <template #header>
              <div class="p-4 pb-0">
                <h4 class="font-semibold text-surface-900 flex items-center">
                  <i class="pi pi-sliders-h mr-2 text-primary-600"></i>
                  调整信息
                </h4>
              </div>
            </template>
            <template #content>
              <div class="p-4 pt-0">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-surface-900">调整类型 *</label>
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
                    <label class="block text-sm font-semibold text-surface-900">调整数量 *</label>
                    <InputNumber
                      v-model="adjustForm.quantity"
                      placeholder="调整数量"
                      :min="1"
                      required
                    />
                  </div>
                </div>
                
                <div class="space-y-2 mt-4">
                  <label class="block text-sm font-semibold text-surface-900">调整原因</label>
                  <Textarea
                    v-model="adjustForm.reason"
                    placeholder="请输入调整原因..."
                    :rows="3"
                  />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-surface-200">
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
import Skeleton from 'primevue/skeleton'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '库存管理 - 智能ERP管理系统'
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
const pageRows = ref(20)

// 分页选项
const rowsPerPageOptions = [
  { label: '10条/页', value: 10 },
  { label: '20条/页', value: 20 },
  { label: '50条/页', value: 50 }
]

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
  { id: '3', name: '工具仓库C' },
  { id: '4', name: '备品仓库D' }
])

const categories = ref([
  { id: '1', name: '电子产品' },
  { id: '2', name: '服装鞋帽' },
  { id: '3', name: '食品饮料' },
  { id: '4', name: '办公用品' },
  { id: '5', name: '工业原料' }
])

const products = ref([
  { id: '1', name: 'iPhone 15 Pro' },
  { id: '2', name: '华为 Mate 60' },
  { id: '3', name: '小米 14' },
  { id: '4', name: '钢材A型' },
  { id: '5', name: '塑料原料B' }
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
  { label: '损耗', value: 'loss' },
  { label: '退货入库', value: 'return' }
])

// 模拟数据
const mockInventory = ref([
  {
    id: '1',
    product_code: 'PRD001',
    product_name: 'iPhone 15 Pro',
    image: null,
    warehouse_id: '2',
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
    cost_price: 8000,
    last_updated: new Date('2025-01-15')
  },
  {
    id: '2',
    product_code: 'PRD002',
    product_name: '华为 Mate 60',
    image: null,
    warehouse_id: '2',
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
    cost_price: 7500,
    last_updated: new Date('2025-01-14')
  },
  {
    id: '3',
    product_code: 'PRD003',
    product_name: '小米 14',
    image: null,
    warehouse_id: '2',
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
    cost_price: 4500,
    last_updated: new Date('2025-01-13')
  },
  {
    id: '4',
    product_code: 'MAT001',
    product_name: '钢材A型',
    image: null,
    warehouse_id: '1',
    warehouse_name: '原料仓库A',
    category_id: '5',
    category_name: '工业原料',
    current_stock: 850,
    available_stock: 800,
    reserved_stock: 50,
    unit: '吨',
    stock_status: 'overstock',
    min_stock: 100,
    max_stock: 500,
    cost_price: 3500,
    last_updated: new Date('2025-01-16')
  },
  {
    id: '5',
    product_code: 'MAT002',
    product_name: '塑料原料B',
    image: null,
    warehouse_id: '1',
    warehouse_name: '原料仓库A',
    category_id: '5',
    category_name: '工业原料',
    current_stock: 25,
    available_stock: 20,
    reserved_stock: 5,
    unit: '吨',
    stock_status: 'low',
    min_stock: 50,
    max_stock: 300,
    cost_price: 12000,
    last_updated: new Date('2025-01-12')
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

const totalInventoryValue = computed(() => {
  return filteredInventory.value.reduce((total, item) => {
    return total + (item.current_stock * (item.cost_price || 0))
  }, 0)
})

const lowStockCount = computed(() => {
  return mockInventory.value.filter(item => 
    item.stock_status === 'low' || item.stock_status === 'out_of_stock'
  ).length
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

const getStockPercentage = (item: any) => {
  if (item.max_stock <= 0) return 0
  return Math.round((item.current_stock / item.max_stock) * 100)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffTime = now.getTime() - new Date(date).getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return `${Math.floor(diffDays / 30)}月前`
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
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

const importInventory = () => {
  console.log('导入库存数据')
  // 这里可以实现库存导入功能
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

const transferStock = (item: any) => {
  console.log('库存转移:', item)
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
  } catch (error) {
    console.error('库存调整失败:', error)
  } finally {
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

 

