<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">库存报表</h1>
        <p class="text-muted-foreground">库存分析和盘点统计报表</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="exportReport">
          <Download class="w-4 h-4 mr-2" />
          导出报表
        </Button>
        <Button @click="refreshData">
          <RefreshCw class="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <Card>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">仓库筛选</label>
            <select v-model="warehouseFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部仓库</option>
              <option value="main">主仓库</option>
              <option value="raw_material">原料仓</option>
              <option value="finished_goods">成品仓</option>
              <option value="backup">备用仓</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">商品类别</label>
            <select v-model="categoryFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部类别</option>
              <option value="raw_material">原材料</option>
              <option value="finished_product">成品</option>
              <option value="semi_finished">半成品</option>
              <option value="accessory">配件</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">库存状态</label>
            <select v-model="stockStatusFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="low">低库存</option>
              <option value="out">缺货</option>
              <option value="excess">积压</option>
            </select>
          </div>
          <div class="flex gap-2">
            <Button @click="applyFilters" class="flex-1">
              <Search class="w-4 h-4 mr-2" />
              查询
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 库存概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">库存总值</p>
              <p class="text-2xl font-bold text-blue-600">¥{{ inventoryStats.totalValue.toLocaleString() }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-blue-600">库存总量: {{ inventoryStats.totalQuantity.toLocaleString() }}</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">商品种类</p>
              <p class="text-2xl font-bold text-green-600">{{ inventoryStats.totalProducts }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Boxes class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-green-600">在售: {{ inventoryStats.activeProducts }}</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">低库存预警</p>
              <p class="text-2xl font-bold text-yellow-600">{{ inventoryStats.lowStockItems }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-yellow-600">需要补货</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">缺货商品</p>
              <p class="text-2xl font-bold text-red-600">{{ inventoryStats.outOfStockItems }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle class="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-red-600">紧急补货</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- 库存分布 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">仓库库存分布</h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div v-for="warehouse in warehouseDistribution" :key="warehouse.name" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: warehouse.color }"></div>
                <div>
                  <p class="font-medium">{{ warehouse.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ warehouse.items }}种商品</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">¥{{ warehouse.value.toLocaleString() }}</p>
                <p class="text-sm text-muted-foreground">{{ warehouse.percentage }}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">商品类别分布</h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div v-for="category in categoryDistribution" :key="category.name" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: category.color }"></div>
                <div>
                  <p class="font-medium">{{ category.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ category.items }}种</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">{{ category.quantity.toLocaleString() }}件</p>
                <p class="text-sm text-muted-foreground">{{ category.percentage }}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 库存明细表 -->
    <Card>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">库存明细</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">商品编号</th>
              <th class="p-4 font-medium">商品名称</th>
              <th class="p-4 font-medium">仓库</th>
              <th class="p-4 font-medium">当前库存</th>
              <th class="p-4 font-medium">安全库存</th>
              <th class="p-4 font-medium">单位成本</th>
              <th class="p-4 font-medium">库存价值</th>
              <th class="p-4 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventoryDetails" :key="item.id" class="border-b hover:bg-muted/50">
              <td class="p-4 font-mono text-sm">{{ item.product_no }}</td>
              <td class="p-4">{{ item.product_name }}</td>
              <td class="p-4">{{ item.warehouse }}</td>
              <td class="p-4 font-medium">{{ item.current_stock }}</td>
              <td class="p-4 text-muted-foreground">{{ item.safety_stock }}</td>
              <td class="p-4">¥{{ item.unit_cost.toLocaleString() }}</td>
              <td class="p-4 font-medium">¥{{ item.total_value.toLocaleString() }}</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': item.status === 'normal',
                    'bg-yellow-100 text-yellow-800': item.status === 'low',
                    'bg-red-100 text-red-800': item.status === 'out',
                    'bg-orange-100 text-orange-800': item.status === 'excess'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStockStatusName(item.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="inventoryDetails.length === 0">
              <td colspan="8" class="p-8 text-center text-muted-foreground">
                暂无库存数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { 
  Download, RefreshCw, Search, Package, Boxes, 
  AlertTriangle, XCircle 
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '库存报表 - ERP 管理系统'
})

// 响应式数据
const warehouseFilter = ref('')
const categoryFilter = ref('')
const stockStatusFilter = ref('')

// 库存统计数据
const inventoryStats = ref({
  totalValue: 2850000,
  totalQuantity: 15420,
  totalProducts: 238,
  activeProducts: 215,
  lowStockItems: 15,
  outOfStockItems: 3
})

const warehouseDistribution = ref([
  { name: '主仓库', value: 1200000, items: 150, percentage: 42, color: '#3B82F6' },
  { name: '原料仓', value: 850000, items: 80, percentage: 30, color: '#10B981' },
  { name: '成品仓', value: 600000, items: 45, percentage: 21, color: '#F59E0B' },
  { name: '备用仓', value: 200000, items: 25, percentage: 7, color: '#8B5CF6' }
])

const categoryDistribution = ref([
  { name: '原材料', quantity: 8500, items: 95, percentage: 55, color: '#3B82F6' },
  { name: '成品', quantity: 3200, items: 60, percentage: 21, color: '#10B981' },
  { name: '半成品', quantity: 2800, items: 45, percentage: 18, color: '#F59E0B' },
  { name: '配件', quantity: 920, items: 38, percentage: 6, color: '#EF4444' }
])

const inventoryDetails = ref([
  {
    id: '1',
    product_no: 'P001',
    product_name: '钢材原料 Q235',
    warehouse: '原料仓',
    current_stock: 1200,
    safety_stock: 500,
    unit_cost: 4.5,
    total_value: 5400,
    status: 'normal'
  },
  {
    id: '2',
    product_no: 'P002',
    product_name: '智能控制器 Model-A',
    warehouse: '成品仓',
    current_stock: 45,
    safety_stock: 50,
    unit_cost: 1200,
    total_value: 54000,
    status: 'low'
  },
  {
    id: '3',
    product_no: 'P003',
    product_name: '传感器套装 Pro',
    warehouse: '成品仓',
    current_stock: 0,
    safety_stock: 20,
    unit_cost: 800,
    total_value: 0,
    status: 'out'
  },
  {
    id: '4',
    product_no: 'P004',
    product_name: '电子元件 IC芯片',
    warehouse: '主仓库',
    current_stock: 2800,
    safety_stock: 300,
    unit_cost: 25,
    total_value: 70000,
    status: 'excess'
  }
])

// 方法
const applyFilters = async () => {
  // TODO: 根据筛选条件重新加载数据
  console.log('应用筛选条件:', {
    warehouse: warehouseFilter.value,
    category: categoryFilter.value,
    stockStatus: stockStatusFilter.value
  })
}

const refreshData = async () => {
  // TODO: 刷新库存数据
  console.log('刷新库存数据')
}

const exportReport = () => {
  // TODO: 导出库存报表
  console.log('导出库存报表')
}

const getStockStatusName = (status: string) => {
  const statuses = {
    normal: '正常',
    low: '低库存',
    out: '缺货',
    excess: '积压'
  }
  return statuses[status as keyof typeof statuses] || status
}

// 初始化数据
onMounted(async () => {
  await applyFilters()
})
</script> 