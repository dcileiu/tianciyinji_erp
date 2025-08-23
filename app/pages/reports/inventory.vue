<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">库存报表</h1>
        <p class="text-muted-color">库存分析和盘点统计报表</p>
      </div>
      <div class="flex gap-3">
        <Button
          label="导出报表"
          icon="pi pi-download"
          outlined
          @click="exportReport"
        />
        <Button
          label="刷新数据"
          icon="pi pi-refresh"
          @click="refreshData"
        />
      </div>
    </div>

    <!-- 筛选条件 -->
    <Card class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold text-color">筛选条件</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">仓库筛选</label>
            <Dropdown
              v-model="warehouseFilter"
              :options="warehouseOptions"
              option-label="label"
              option-value="value"
              placeholder="选择仓库"
              show-clear
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">商品类别</label>
            <Dropdown
              v-model="categoryFilter"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="选择类别"
              show-clear
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">库存状态</label>
            <Dropdown
              v-model="stockStatusFilter"
              :options="stockStatusOptions"
              option-label="label"
              option-value="value"
              placeholder="库存状态"
              show-clear
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-color">搜索</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchQuery"
                placeholder="搜索商品名称、编码..."
              />
            </span>
          </div>
        </div>
      </template>
    </Card>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-blue-600 mb-1">{{ inventoryStats.totalItems }}</div>
              <div class="text-sm text-muted-color mb-2">商品品种</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+5.2%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-box text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-green-600 mb-1">{{ inventoryStats.totalQuantity }}</div>
              <div class="text-sm text-muted-color mb-2">总库存量</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+8.1%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-database text-xl"></i>
            </div>
          </div>
        </template>
            </Card>
      
      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-orange-600 mb-1">{{ inventoryStats.lowStockItems }}</div>
              <div class="text-sm text-muted-color mb-2">库存预警</div>
              <div class="flex items-center gap-1 text-sm text-red-600">
                <i class="pi pi-arrow-down"></i>
                <span>-2.3%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-exclamation-triangle text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card class="border border-surface-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary">
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-purple-600 mb-1">
                ¥{{ formatCurrency(inventoryStats.totalValue) }}
              </div>
              <div class="text-sm text-muted-color mb-2">库存总价值</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <i class="pi pi-arrow-up"></i>
                <span>+12.4%</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-border flex items-center justify-center text-white">
              <i class="pi pi-dollar text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 库存明细 -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold text-color">库存明细</h3>
          <span class="text-sm text-muted-color">共 {{ filteredInventoryItems.length }} 条记录</span>
        </div>
      </template>
      <template #content>
        <DataTable
          :value="filteredInventoryItems"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :total-records="filteredInventoryItems.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
          class="p-4"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-inbox text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无库存数据</h3>
              <p class="mb-4">当前筛选条件下没有找到相关数据</p>
            </div>
          </template>

          <Column field="product_code" header="商品编码" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono bg-surface-100 px-2 py-1 rounded text-primary text-sm">
                {{ slotProps.data.product_code }}
              </span>
            </template>
          </Column>

          <Column field="product_name" header="商品名称" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-100 rounded-border flex items-center justify-center">
                  <i class="pi pi-box text-primary"></i>
                </div>
                <div>
                  <div class="font-medium text-color mb-1">{{ slotProps.data.product_name }}</div>
                  <div class="text-sm text-muted-color">{{ getCategoryText(slotProps.data.category) }}</div>
                </div>
              </div>
            </template>
          </Column>

          <Column field="warehouse" header="仓库" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="getWarehouseText(slotProps.data.warehouse)"
                :severity="getWarehouseSeverity(slotProps.data.warehouse)"
              />
            </template>
          </Column>

          <Column field="current_stock" header="当前库存" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-lg">{{ slotProps.data.current_stock }}</span>
                <span class="text-sm text-muted-color">{{ slotProps.data.unit }}</span>
                <Tag
                  v-if="slotProps.data.current_stock <= slotProps.data.min_stock"
                  value="预警"
                  severity="warn"
                  class="text-xs"
                />
              </div>
            </template>
          </Column>

          <Column field="min_stock" header="安全库存" :sortable="true">
            <template #body="slotProps">
              <span class="text-muted-color">{{ slotProps.data.min_stock }} {{ slotProps.data.unit }}</span>
            </template>
          </Column>

          <Column field="unit_cost" header="单位成本" :sortable="true">
            <template #body="slotProps">
              <span class="font-medium">¥{{ formatCurrency(slotProps.data.unit_cost) }}</span>
            </template>
          </Column>

          <Column field="total_value" header="库存价值" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-green-600 text-lg">
                ¥{{ formatCurrency(slotProps.data.current_stock * slotProps.data.unit_cost) }}
              </span>
            </template>
          </Column>

          <Column field="last_updated" header="最后更新" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.last_updated) }}
              </span>
            </template>
          </Column>

          <Column header="操作" class="w-32">
            <template #body="slotProps">
              <div class="flex gap-2">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  outlined
                  rounded
                  size="small"
                  @click="viewItem(slotProps.data)"
                />
                <Button
                  v-tooltip="'库存记录'"
                  icon="pi pi-history"
                  outlined
                  rounded
                  size="small"
                  @click="viewHistory(slotProps.data)"
                />
        </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '库存报表 - ERP 管理系统'
})

// 页面状态
const loading = ref(false)
const warehouseFilter = ref('')
const categoryFilter = ref('')
const stockStatusFilter = ref('')
const searchQuery = ref('')

// 仓库选项
const warehouseOptions = ref([
  { label: '全部仓库', value: '' },
  { label: '主仓库', value: 'main' },
  { label: '原料仓', value: 'raw_material' },
  { label: '成品仓', value: 'finished_goods' },
  { label: '备用仓', value: 'backup' }
])

// 类别选项
const categoryOptions = ref([
  { label: '全部类别', value: '' },
  { label: '原材料', value: 'raw_material' },
  { label: '成品', value: 'finished_product' },
  { label: '半成品', value: 'semi_finished' },
  { label: '配件', value: 'accessory' }
])

// 库存状态选项
const stockStatusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '正常库存', value: 'normal' },
  { label: '库存预警', value: 'low' },
  { label: '库存不足', value: 'out' }
])

// 统计数据
const inventoryStats = ref({
  totalItems: 324,
  totalQuantity: 12580,
  lowStockItems: 28,
  totalValue: 2580000
})

// 库存明细数据
const inventoryItems = ref([
  {
    id: '1',
    product_code: 'P001',
    product_name: '智能控制器',
    category: 'finished_product',
    warehouse: 'main',
    current_stock: 50,
    min_stock: 20,
    unit: '个',
    unit_cost: 2500,
    last_updated: '2025-01-20'
  },
  {
    id: '2',
    product_code: 'R001',
    product_name: '电路板基材',
    category: 'raw_material',
    warehouse: 'raw_material',
    current_stock: 15,
    min_stock: 30,
    unit: '片',
    unit_cost: 150,
    last_updated: '2025-01-19'
  },
  {
    id: '3',
    product_code: 'S001',
    product_name: '半成品模块',
    category: 'semi_finished',
    warehouse: 'main',
    current_stock: 80,
    min_stock: 25,
    unit: '个',
    unit_cost: 800,
    last_updated: '2025-01-18'
  },
  {
    id: '4',
    product_code: 'A001',
    product_name: '连接器',
    category: 'accessory',
    warehouse: 'main',
    current_stock: 200,
    min_stock: 100,
    unit: '个',
    unit_cost: 50,
    last_updated: '2025-01-17'
  }
])

// 计算属性
const filteredInventoryItems = computed(() => {
  let result = inventoryItems.value

  if (searchQuery.value) {
    result = result.filter(item =>
      item.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || item.product_code.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (warehouseFilter.value) {
    result = result.filter(item => item.warehouse === warehouseFilter.value)
  }

  if (categoryFilter.value) {
    result = result.filter(item => item.category === categoryFilter.value)
  }

  if (stockStatusFilter.value) {
    result = result.filter((item) => {
      if (stockStatusFilter.value === 'normal') {
        return item.current_stock > item.min_stock
      }
      else if (stockStatusFilter.value === 'low') {
        return item.current_stock <= item.min_stock && item.current_stock > 0
      }
      else if (stockStatusFilter.value === 'out') {
        return item.current_stock === 0
      }
      return true
    })
  }

  return result
})

// 方法
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    raw_material: '原材料',
    finished_product: '成品',
    semi_finished: '半成品',
    accessory: '配件'
  }
  return categoryMap[category] || category
}

const getWarehouseText = (warehouse: string) => {
  const warehouseMap: Record<string, string> = {
    main: '主仓库',
    raw_material: '原料仓',
    finished_goods: '成品仓',
    backup: '备用仓'
  }
  return warehouseMap[warehouse] || warehouse
}

const getWarehouseSeverity = (warehouse: string) => {
  const severityMap: Record<string, string> = {
    main: 'success',
    raw_material: 'info',
    finished_goods: 'warn',
    backup: 'secondary'
  }
  return severityMap[warehouse] || 'secondary'
}

const exportReport = () => {
  console.log('导出库存报表')
  // 这里可以实现导出功能
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    console.log('数据已刷新')
  }, 1000)
}

const viewItem = (item: any) => {
  console.log('查看商品详情:', item)
  // 这里可以实现查看详情功能
}

const viewHistory = (item: any) => {
  console.log('查看库存记录:', item)
  // 这里可以实现查看库存记录功能
}
</script>


