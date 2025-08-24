<template>
  <div class="space-y-6 p-6 min-h-screen bg-background">
    <!-- 页面头部 -->
    <div
      class="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 -2xl p-8 text-white relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="absolute -top-4 -right-4 w-32 h-32 bg-white/5 -full"></div>
      <div class="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 -full"></div>
      <div class="relative z-10">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2 flex items-center">
              <Package class="mr-3 h-10 w-10" />
              库存管理
            </h1>
            <p class="text-orange-100 text-lg">实时监控库存状态，管理库存变动，优化库存配置</p>
          </div>
          <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              class="text-white border-white hover:bg-white hover:text-orange-600"
              @click="importInventory"
            >
              <Upload class="mr-2 h-4 w-4" />
              导入库存
            </Button>
            <Button
              class="bg-white text-orange-600 hover:bg-orange-50 border-0 shadow-lg"
              @click="showAdjustDialog = true"
            >
              <Plus class="mr-2 h-4 w-4" />
              库存调整
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- 库存统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg overflow-hidden">
        <CardContent class="p-6">
          <div class="relative">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 -full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white/20 -xl flex items-center justify-center">
                  <Package class="h-6 w-6 text-white" />
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-blue-100">
                    <TrendingUp class="mr-1 h-3 w-3" />
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
        </CardContent>
      </Card>

      <Card class="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg overflow-hidden">
        <CardContent class="p-6">
          <div class="relative">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 -full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white/20 -xl flex items-center justify-center">
                  <TrendingUp class="h-6 w-6 text-white" />
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-green-100">
                    <TrendingUp class="mr-1 h-3 w-3" />
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
        </CardContent>
      </Card>

      <Card class="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg overflow-hidden">
        <CardContent class="p-6">
          <div class="relative">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 -full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white/20 -xl flex items-center justify-center">
                  <AlertTriangle class="h-6 w-6 text-white" />
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-red-100">
                    <TrendingDown class="mr-1 h-3 w-3" />
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
        </CardContent>
      </Card>

      <Card class="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg overflow-hidden">
        <CardContent class="p-6">
          <div class="relative">
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 -full"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-4">
                <div class="w-14 h-14 bg-white/20 -xl flex items-center justify-center">
                  <Warehouse class="h-6 w-6 text-white" />
                </div>
                <div class="text-right">
                  <div class="flex items-center text-sm font-medium text-purple-100">
                    <TrendingUp class="mr-1 h-3 w-3" />
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
        </CardContent>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="mb-6 border-0 shadow-sm">
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div class="space-y-2">
            <Label class="text-sm font-medium text-gray-700">搜索产品</Label>
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input v-model="searchQuery" placeholder="搜索产品名称或编码" class="pl-10" />
            </div>
          </div>

          <!-- 仓库筛选 -->
          <div class="space-y-2">
            <Label class="text-sm font-medium text-gray-700">仓库</Label>
            <Select v-model="warehouseFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择仓库" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部仓库</SelectItem>
                <SelectItem v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                  {{ warehouse.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 分类筛选 -->
          <div class="space-y-2">
            <Label class="text-sm font-medium text-gray-700">分类</Label>
            <Select v-model="categoryFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分类</SelectItem>
                <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 库存状态筛选 -->
          <div class="space-y-2">
            <Label class="text-sm font-medium text-gray-700">库存状态</Label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem v-for="status in statusOptions" :key="status.value" :value="status.value">
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button variant="outline" class="flex items-center gap-2" @click="resetFilters">
            <FilterX class="h-4 w-4" />
            重置筛选
          </Button>
          <Button variant="outline" class="flex items-center gap-2" @click="exportInventory">
            <Download class="h-4 w-4" />
            导出数据
          </Button>
          <Button :disabled="loading" class="flex items-center gap-2" @click="refreshData">
            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loading }" />
            刷新数据
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 库存列表 -->
    <Card class="border-0 shadow-sm">
      <CardHeader>
        <div class="flex justify-between items-center">
          <div>
            <CardTitle class="flex items-center gap-2">
              <Package class="h-5 w-5 text-primary" />
              库存清单
            </CardTitle>
            <p class="text-sm text-muted-foreground mt-1">共 {{ filteredInventory.length }} 条记录</p>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" @click="exportInventory">
              <Download class="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="flex flex-col items-center gap-4">
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
            <p class="text-muted-foreground">正在加载库存数据...</p>
          </div>
        </div>

        <div v-else-if="filteredInventory.length === 0" class="flex flex-col items-center justify-center py-12">
          <Package class="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h4 class="text-lg font-semibold text-foreground mb-2">暂无库存数据</h4>
          <p class="text-muted-foreground text-center max-w-md mb-4">
            当前筛选条件下没有找到库存记录，请尝试调整筛选条件或添加新的库存。
          </p>
          <Button variant="outline" @click="resetFilters">
            <FilterX class="h-4 w-4 mr-2" />
            重置筛选
          </Button>
        </div>

        <div v-else class="-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[120px]">产品编码</TableHead>
                <TableHead class="w-[250px]">产品信息</TableHead>
                <TableHead class="w-[150px]">仓库位置</TableHead>
                <TableHead class="w-[120px] text-center">当前库存</TableHead>
                <TableHead class="w-[120px] text-center">可用库存</TableHead>
                <TableHead class="w-[120px] text-center">预留库存</TableHead>
                <TableHead class="w-[120px]">库存状态</TableHead>
                <TableHead class="w-[150px]">最后更新</TableHead>
                <TableHead class="w-[200px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in filteredInventory" :key="item.id">
                <TableCell>
                  <span class="font-mono text-sm bg-muted px-2 py-1 ">
                    {{ item.product_code }}
                  </span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-muted -lg flex items-center justify-center">
                      <Package class="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div class="font-semibold">{{ item.product_name }}</div>
                      <div class="text-sm text-muted-foreground">{{ item.category_name }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">{{ item.warehouse_name }}</div>
                    <div class="text-sm text-muted-foreground">A1-B2-C3</div>
                  </div>
                </TableCell>
                <TableCell class="text-center">
                  <div class="text-lg font-bold">
                    {{ item.current_stock }}
                  </div>
                  <div class="text-xs text-muted-foreground">{{ item.unit }}</div>
                </TableCell>
                <TableCell class="text-center">
                  <div class="text-lg font-semibold text-green-600">
                    {{ item.available_stock }}
                  </div>
                  <div class="text-xs text-muted-foreground">{{ item.unit }}</div>
                </TableCell>
                <TableCell class="text-center">
                  <div class="text-lg font-semibold text-orange-600">
                    {{ item.reserved_stock }}
                  </div>
                  <div class="text-xs text-muted-foreground">{{ item.unit }}</div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(item.stock_status)">
                    {{ getStatusDisplayName(item.stock_status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="text-sm">
                    <div>{{ formatDate(item.last_updated) }}</div>
                    <div class="text-muted-foreground">{{ formatTimeAgo(item.last_updated) }}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <Button variant="ghost" size="sm" @click="viewInventory(item)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="adjustInventory(item)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="viewHistory(item)">
                      <History class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="transferStock(item)">
                      <ArrowRightLeft class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 库存调整对话框 -->
    <Dialog v-model:open="showAdjustDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Package class="h-5 w-5" />
            库存调整
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-6">
          <!-- 基本信息 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <Info class="h-4 w-4" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>商品 *</Label>
                  <Select v-model="adjustForm.product_id">
                    <SelectTrigger>
                      <SelectValue placeholder="选择商品" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="product in products" :key="product.id" :value="product.id">
                        {{ product.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label>仓库 *</Label>
                  <Select v-model="adjustForm.warehouse_id">
                    <SelectTrigger>
                      <SelectValue placeholder="选择仓库" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                        {{ warehouse.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 调整信息 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <Settings class="h-4 w-4" />
                调整信息
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>调整类型 *</Label>
                  <Select v-model="adjustForm.adjust_type">
                    <SelectTrigger>
                      <SelectValue placeholder="选择调整类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="type in adjustTypes" :key="type.value" :value="type.value">
                        {{ type.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label>调整数量 *</Label>
                  <Input v-model.number="adjustForm.quantity" type="number" placeholder="调整数量" min="1" />
                </div>
              </div>

              <div class="space-y-2">
                <Label>调整原因</Label>
                <Textarea v-model="adjustForm.reason" placeholder="请输入调整原因..." rows="3" />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeAdjustDialog"> 取消 </Button>
          <Button :disabled="adjusting" @click="confirmAdjust">
            <Loader2 v-if="adjusting" class="h-4 w-4 mr-2 animate-spin" />
            确认调整
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入
// Vue 钩子也自动导入，无需手动导入

import {
  AlertTriangle,
  ArrowRightLeft,
  Download,
  Edit,
  Eye,
  FilterX,
  History,
  Info,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  Upload,
  Warehouse,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '库存管理 - 智能ERP管理系统',
})

// 状态管理
const loading = ref(false)
const adjusting = ref(false)
const showAdjustDialog = ref(false)

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
  reason: '',
})

// 选项数据
const warehouses = ref([
  { id: '1', name: '原料仓库A' },
  { id: '2', name: '成品仓库B' },
  { id: '3', name: '工具仓库C' },
  { id: '4', name: '备品仓库D' },
])

const categories = ref([
  { id: '1', name: '电子产品' },
  { id: '2', name: '服装鞋帽' },
  { id: '3', name: '食品饮料' },
  { id: '4', name: '办公用品' },
  { id: '5', name: '工业原料' },
])

const products = ref([
  { id: '1', name: 'iPhone 15 Pro' },
  { id: '2', name: '华为 Mate 60' },
  { id: '3', name: '小米 14' },
  { id: '4', name: '钢材A型' },
  { id: '5', name: '塑料原料B' },
])

const statusOptions = ref([
  { label: '正常', value: 'normal' },
  { label: '低库存', value: 'low' },
  { label: '缺货', value: 'out_of_stock' },
  { label: '超储', value: 'overstock' },
])

const adjustTypes = ref([
  { label: '入库', value: 'in' },
  { label: '出库', value: 'out' },
  { label: '盘点调整', value: 'adjust' },
  { label: '损耗', value: 'loss' },
  { label: '退货入库', value: 'return' },
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
    last_updated: new Date('2025-01-15'),
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
    last_updated: new Date('2025-01-14'),
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
    last_updated: new Date('2025-01-13'),
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
    last_updated: new Date('2025-01-16'),
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
    last_updated: new Date('2025-01-12'),
  },
])

// 计算属性
const filteredInventory = computed(() => {
  let result = mockInventory.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      item => item.product_name.toLowerCase().includes(query) || item.product_code.toLowerCase().includes(query),
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
    return total + item.current_stock * (item.cost_price || 0)
  }, 0)
})

const lowStockCount = computed(() => {
  return mockInventory.value.filter(item => item.stock_status === 'low' || item.stock_status === 'out_of_stock').length
})

// 状态映射
const statusMap: Record<string, string> = {
  normal: '正常',
  low: '低库存',
  out_of_stock: '缺货',
  overstock: '超储',
}

const statusVariantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  normal: 'default',
  low: 'secondary',
  out_of_stock: 'destructive',
  overstock: 'outline',
}

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status

const getStatusVariant = (status: string): 'default' | 'destructive' | 'outline' | 'secondary' =>
  statusVariantMap[status] || 'default'

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
  }
  catch (error) {
    console.error('刷新数据失败:', error)
  }
  finally {
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
    reason: '',
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
