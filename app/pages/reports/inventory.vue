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
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-2">仓库筛选</label>
            <Select v-model="warehouseFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部仓库" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部仓库</SelectItem>
                <SelectItem value="main">主仓库</SelectItem>
                <SelectItem value="raw_material">原料仓</SelectItem>
                <SelectItem value="finished_goods">成品仓</SelectItem>
                <SelectItem value="backup">备用仓</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">商品类别</label>
            <Select v-model="categoryFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部类别</SelectItem>
                <SelectItem value="raw_material">原材料</SelectItem>
                <SelectItem value="finished_product">成品</SelectItem>
                <SelectItem value="semi_finished">半成品</SelectItem>
                <SelectItem value="accessory">配件</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">库存状态</label>
            <Select v-model="stockStatusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="normal">正常</SelectItem>
                <SelectItem value="low">低库存</SelectItem>
                <SelectItem value="out">缺货</SelectItem>
                <SelectItem value="excess">积压</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex gap-2">
            <Button @click="applyFilters" class="flex-1">
              <Search class="w-4 h-4 mr-2" />
              查询
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 库存概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
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
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
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
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
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
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
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
        </CardContent>
      </Card>
    </div>

    <!-- 库存分布 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 按仓库分布 -->
      <Card>
        <CardHeader>
          <CardTitle>按仓库分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="warehouse in warehouseDistribution" :key="warehouse.id" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: warehouse.color }"></div>
                <span class="text-sm font-medium">{{ warehouse.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold">¥{{ warehouse.value.toLocaleString() }}</div>
                <div class="text-xs text-muted-foreground">{{ warehouse.percentage }}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 按商品类别分布 -->
      <Card>
        <CardHeader>
          <CardTitle>按商品类别分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="category in categoryDistribution" :key="category.id" class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: category.color }"></div>
                <span class="text-sm font-medium">{{ category.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-sm font-semibold">¥{{ category.value.toLocaleString() }}</div>
                <div class="text-xs text-muted-foreground">{{ category.percentage }}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 库存明细 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>库存明细</CardTitle>
          <Button @click="exportReport" class="gap-2">
            <Download class="w-4 h-4" />
            导出报表
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品编号</TableHead>
                <TableHead>商品名称</TableHead>
                <TableHead>仓库</TableHead>
                <TableHead>当前库存</TableHead>
                <TableHead>安全库存</TableHead>
                <TableHead>单位成本</TableHead>
                <TableHead>库存价值</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               <TableRow v-for="item in inventoryDetails" :key="item.id">
                 <TableCell class="font-medium">{{ item.sku }}</TableCell>
                 <TableCell>
                   <div class="font-medium">{{ item.name }}</div>
                   <div class="text-sm text-muted-foreground">{{ item.category }}</div>
                 </TableCell>
                 <TableCell>{{ item.warehouse }}</TableCell>
                 <TableCell>{{ item.currentStock }}</TableCell>
                 <TableCell>{{ item.safetyStock }}</TableCell>
                 <TableCell>¥{{ item.unitCost.toFixed(2) }}</TableCell>
                 <TableCell>¥{{ item.totalValue.toLocaleString() }}</TableCell>
                 <TableCell>
                   <Badge :variant="getStockStatusVariant(item.status)">
                     {{ getStockStatusName(item.status) }}
                   </Badge>
                 </TableCell>
               </TableRow>
             </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

const getStockStatusVariant = (status: string) => {
  const variantMap = {
    normal: 'default',
    low: 'secondary',
    out: 'destructive',
    excess: 'outline'
  }
  return variantMap[status as keyof typeof variantMap] || 'default'
}

// 初始化数据
onMounted(async () => {
  await applyFilters()
})
</script>