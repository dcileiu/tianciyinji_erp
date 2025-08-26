<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">库存管理</h1>
        <p class="text-muted-foreground">实时监控库存状态，管理库存调整和预警</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="importInventory">
          <Upload class="mr-2 h-4 w-4" />
          导入库存
        </Button>
        <Button variant="outline" size="sm" @click="exportInventory">
          <Download class="mr-2 h-4 w-4" />
          导出数据
        </Button>
        <Button size="sm" @click="openAdjustDialog">
          <Plus class="mr-2 h-4 w-4" />
          库存调整
        </Button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Search class="h-5 w-5" />
          搜索与筛选
        </CardTitle>
        <CardDescription>快速查找库存信息</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>搜索产品</Label>
            <div class="relative">
              <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input v-model="searchQuery" placeholder="产品名称、编码..." class="pl-9" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>仓库</Label>
            <Select v-model="warehouseFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部仓库" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部仓库</SelectItem>
                <SelectItem
                  v-for="warehouse in warehouses"
                  :key="warehouse.id"
                  :value="warehouse.id"
                >
                  {{ warehouse.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>产品分类</Label>
            <Select v-model="categoryFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>库存状态</Label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem
                  v-for="status in statusOptions"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <Button variant="outline" @click="resetFilters">
            <FilterX class="mr-2 h-4 w-4" />
            重置筛选
          </Button>
          <Button variant="outline" @click="refreshData">
            <RefreshCw class="mr-2 h-4 w-4" />
            刷新数据
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 库存统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">库存总值</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-blue-600">
                  ¥{{ inventoryStats.totalValue.toLocaleString() }}
                </p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +5.2%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">较上月</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
            >
              <Warehouse class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">正常库存</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-green-600">{{ inventoryStats.normal }}</p>
                <Badge variant="secondary" class="text-xs">
                  {{ Math.round((inventoryStats.normal / inventoryStats.total) * 100) }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">产品数量</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            >
              <Package class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">低库存预警</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-orange-600">{{ inventoryStats.lowStock }}</p>
                <Badge variant="destructive" class="text-xs">需补货</Badge>
              </div>
              <p class="text-xs text-muted-foreground">产品数量</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900"
            >
              <AlertTriangle class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">缺货产品</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-red-600">{{ inventoryStats.outOfStock }}</p>
                <Badge variant="destructive" class="text-xs">紧急</Badge>
              </div>
              <p class="text-xs text-muted-foreground">产品数量</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
            >
              <Info class="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 库存列表 -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle class="flex items-center gap-2">
              <Package class="h-5 w-5" />
              库存列表
            </CardTitle>
            <CardDescription>
              当前共有 {{ filteredInventory.length }} 个产品库存记录
            </CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="pageSize">
              <SelectTrigger class="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
                <SelectItem value="100">100条/页</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 10" :key="i" class="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton class="h-12 w-12 rounded" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
            <Skeleton class="h-8 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
        </div>

        <div v-else-if="filteredInventory.length === 0" class="text-center py-16">
          <Package class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 class="text-xl font-semibold mb-4">暂无库存数据</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            没有找到符合条件的库存记录。请检查筛选条件或添加库存数据。
          </p>
          <Button @click="openAdjustDialog">
            <Plus class="mr-2 h-4 w-4" />
            添加库存
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="item in paginatedInventory"
            :key="`${item.product_id}-${item.warehouse_id}`"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div class="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                <Package class="h-6 w-6 text-primary" />
              </div>
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold">{{ item.product_name }}</h3>
                  <Badge :variant="getStatusVariant(item.status)" class="text-xs">
                    {{ getStatusText(item.status) }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground font-mono">{{ item.product_code }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ getWarehouseName(item.warehouse_id) }} •
                  {{ getCategoryName(item.category_id) }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-6">
              <div class="text-center">
                <p class="text-sm text-muted-foreground">当前库存</p>
                <p
                  class="text-lg font-bold"
                  :class="getStockColorClass(item.current_stock, item.min_stock)"
                >
                  {{ item.current_stock }} {{ item.unit }}
                </p>
              </div>

              <div class="text-center">
                <p class="text-sm text-muted-foreground">最低库存</p>
                <p class="text-sm font-medium">{{ item.min_stock }} {{ item.unit }}</p>
              </div>

              <div class="text-center">
                <p class="text-sm text-muted-foreground">库存价值</p>
                <p class="text-sm font-semibold text-green-600">
                  ¥{{ (item.current_stock * item.unit_cost).toLocaleString() }}
                </p>
              </div>

              <div class="flex items-center space-x-1">
                <Button variant="ghost" size="sm" @click="viewHistory(item)">
                  <History class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="adjustStock(item)">
                  <ArrowRightLeft class="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" @click="editInventory(item)">
                  <Settings class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="flex items-center justify-between pt-4">
            <p class="text-sm text-muted-foreground">
              显示第 {{ (currentPage - 1) * Number(pageSize) + 1 }} -
              {{ Math.min(currentPage * Number(pageSize), filteredInventory.length) }} 条，共
              {{ filteredInventory.length }} 条记录
            </p>
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <ChevronLeft class="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                下一页
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 库存调整对话框 -->
    <Dialog v-model:open="showAdjustDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <ArrowRightLeft class="h-5 w-5" />
            库存调整
          </DialogTitle>
          <DialogDescription>调整产品库存数量，记录调整原因</DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label>选择产品</Label>
            <Select v-model="adjustForm.product_id">
              <SelectTrigger>
                <SelectValue placeholder="选择要调整的产品" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>选择仓库</Label>
            <Select v-model="adjustForm.warehouse_id">
              <SelectTrigger>
                <SelectValue placeholder="选择仓库" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="warehouse in warehouses"
                  :key="warehouse.id"
                  :value="warehouse.id"
                >
                  {{ warehouse.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>调整类型</Label>
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
            <Label>调整数量</Label>
            <Input v-model="adjustForm.quantity" type="number" placeholder="输入调整数量" min="1" />
          </div>

          <div class="space-y-2">
            <Label>调整原因</Label>
            <Textarea v-model="adjustForm.reason" placeholder="请输入调整原因..." rows="3" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeAdjustDialog">取消</Button>
          <Button :disabled="adjusting" @click="saveAdjustment">
            <Loader2 v-if="adjusting" class="mr-2 h-4 w-4 animate-spin" />
            确认调整
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Download,
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

interface InventoryItem {
  product_id: string
  product_name: string
  product_code: string
  warehouse_id: string
  category_id: string
  current_stock: number
  min_stock: number
  max_stock: number
  unit_cost: number
  unit: string
  status: string
  last_updated: Date
}

// 状态管理
const loading = ref(false)
const adjusting = ref(false)
const showAdjustDialog = ref(false)
const pageSize = ref('20')
const currentPage = ref(1)

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

// 统计数据
const inventoryStats = ref({
  totalValue: 2856789,
  total: 156,
  normal: 128,
  lowStock: 18,
  outOfStock: 10,
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
  { id: '1', name: 'iPhone 15 Pro Max 256GB' },
  { id: '2', name: '华为 Mate 60 Pro 512GB' },
  { id: '3', name: '小米14 Ultra 16GB+1TB' },
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

// 模拟库存数据
const mockInventory = ref<InventoryItem[]>([
  {
    product_id: '1',
    product_name: 'iPhone 15 Pro Max 256GB',
    product_code: 'P001',
    warehouse_id: '2',
    category_id: '1',
    current_stock: 25,
    min_stock: 10,
    max_stock: 100,
    unit_cost: 7500,
    unit: '台',
    status: 'normal',
    last_updated: new Date('2024-01-20'),
  },
  {
    product_id: '2',
    product_name: '华为 Mate 60 Pro 512GB',
    product_code: 'P002',
    warehouse_id: '2',
    category_id: '1',
    current_stock: 8,
    min_stock: 15,
    max_stock: 80,
    unit_cost: 5200,
    unit: '台',
    status: 'low',
    last_updated: new Date('2024-01-19'),
  },
  {
    product_id: '3',
    product_name: '小米14 Ultra 16GB+1TB',
    product_code: 'P003',
    warehouse_id: '2',
    category_id: '1',
    current_stock: 32,
    min_stock: 20,
    max_stock: 120,
    unit_cost: 4800,
    unit: '台',
    status: 'normal',
    last_updated: new Date('2024-01-18'),
  },
  {
    product_id: '4',
    product_name: '商务西装套装',
    product_code: 'P004',
    warehouse_id: '1',
    category_id: '2',
    current_stock: 0,
    min_stock: 30,
    max_stock: 200,
    unit_cost: 650,
    unit: '套',
    status: 'out_of_stock',
    last_updated: new Date('2024-01-17'),
  },
  {
    product_id: '5',
    product_name: '办公椅人体工学座椅',
    product_code: 'P005',
    warehouse_id: '3',
    category_id: '4',
    current_stock: 18,
    min_stock: 25,
    max_stock: 100,
    unit_cost: 450,
    unit: '把',
    status: 'low',
    last_updated: new Date('2024-01-16'),
  },
])

// 计算属性
const filteredInventory = computed(() => {
  let result = mockInventory.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      item =>
        item.product_name.toLowerCase().includes(query) ||
        item.product_code.toLowerCase().includes(query)
    )
  }

  if (warehouseFilter.value) {
    result = result.filter(item => item.warehouse_id === warehouseFilter.value)
  }

  if (categoryFilter.value) {
    result = result.filter(item => item.category_id === categoryFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(item => item.status === statusFilter.value)
  }

  return result
})

const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * Number(pageSize.value)
  const end = start + Number(pageSize.value)
  return filteredInventory.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredInventory.value.length / Number(pageSize.value))
})

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    normal: '正常',
    low: '低库存',
    out_of_stock: '缺货',
    overstock: '超储',
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: string) => {
  const variantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    normal: 'default',
    low: 'outline',
    out_of_stock: 'destructive',
    overstock: 'secondary',
  }
  return variantMap[status] || 'secondary'
}

const getWarehouseName = (warehouseId: string) => {
  const warehouse = warehouses.value.find(w => w.id === warehouseId)
  return warehouse?.name || '未知仓库'
}

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || '未知分类'
}

const getStockColorClass = (currentStock: number, minStock: number) => {
  if (currentStock === 0) return 'text-red-600'
  if (currentStock < minStock) return 'text-orange-600'
  return 'text-green-600'
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
  } finally {
    loading.value = false
  }
}

const importInventory = () => {
  console.log('导入库存数据')
}

const exportInventory = () => {
  console.log('导出库存数据')
}

const openAdjustDialog = () => {
  adjustForm.value = {
    product_id: '',
    warehouse_id: '',
    adjust_type: 'in',
    quantity: 0,
    reason: '',
  }
  showAdjustDialog.value = true
}

const closeAdjustDialog = () => {
  showAdjustDialog.value = false
}

const viewHistory = (item: InventoryItem) => {
  console.log('查看库存历史:', item.product_name)
}

const adjustStock = (item: InventoryItem) => {
  adjustForm.value = {
    product_id: item.product_id,
    warehouse_id: item.warehouse_id,
    adjust_type: 'adjust',
    quantity: 0,
    reason: '',
  }
  showAdjustDialog.value = true
}

const editInventory = (item: InventoryItem) => {
  console.log('编辑库存设置:', item.product_name)
}

const saveAdjustment = async () => {
  try {
    adjusting.value = true
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 模拟库存调整
    const item = mockInventory.value.find(
      i =>
        i.product_id === adjustForm.value.product_id &&
        i.warehouse_id === adjustForm.value.warehouse_id
    )

    if (item) {
      const quantity = Number(adjustForm.value.quantity)
      if (adjustForm.value.adjust_type === 'in' || adjustForm.value.adjust_type === 'return') {
        item.current_stock += quantity
      } else {
        item.current_stock = Math.max(0, item.current_stock - quantity)
      }

      // 更新状态
      if (item.current_stock === 0) {
        item.status = 'out_of_stock'
      } else if (item.current_stock < item.min_stock) {
        item.status = 'low'
      } else if (item.current_stock > item.max_stock) {
        item.status = 'overstock'
      } else {
        item.status = 'normal'
      }

      item.last_updated = new Date()
    }

    closeAdjustDialog()
  } catch (error) {
    console.error('库存调整失败:', error)
  } finally {
    adjusting.value = false
  }
}

// 监听分页变化
watch([pageSize, filteredInventory], () => {
  currentPage.value = 1
})
</script>
