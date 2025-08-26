<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold flex items-center gap-3">
          <Package class="h-8 w-8 text-blue-600" />
          产品管理
        </h1>
        <p class="text-muted-foreground mt-2">管理产品信息、库存设置和定价策略</p>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" @click="importProducts">
          <Upload class="h-4 w-4 mr-2" />
          批量导入
        </Button>
        <PermissionWrapper :has-permission="canCreateProduct">
          <Button class="bg-blue-600 hover:bg-blue-700" @click="openCreateDialog">
            <Plus class="h-4 w-4 mr-2" />
            新增产品
          </Button>
        </PermissionWrapper>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-500/10 -full">
              <Package class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">总产品数</p>
              <p class="text-2xl font-semibold">{{ productStats.totalProducts }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-500/10 -full">
              <TrendingUp class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">库存价值</p>
              <p class="text-2xl font-semibold">¥{{ formatCurrency(productStats.stockValue) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-500/10 -full">
              <AlertTriangle class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">低库存产品</p>
              <p class="text-2xl font-semibold">{{ productStats.lowStockCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-red-500/10 -full">
              <XCircle class="h-6 w-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">缺货产品</p>
              <p class="text-2xl font-semibold">{{ productStats.outOfStockCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input v-model="searchQuery" placeholder="搜索产品名称、编码或规格..." class="pl-10" />
          </div>
          <div class="flex gap-2">
            <Select v-model="categoryFilter">
              <SelectTrigger class="w-48">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span class="text-muted-foreground">全部分类</span>
                </SelectItem>
                <SelectItem
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="stockStatusFilter">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="库存状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span class="text-muted-foreground">全部</span>
                </SelectItem>
                <SelectItem
                  v-for="option in stockStatusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="statusFilter">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="产品状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span class="text-muted-foreground">全部</span>
                </SelectItem>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" title="重置筛选" @click="resetFilters">
              <FilterX class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 产品列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <List class="h-5 w-5" />
            产品列表
          </CardTitle>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="openCreateDialog">
              <Settings class="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" @click="importProducts">
              <Download class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
            <Skeleton class="h-12 w-12" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-[250px]" />
              <Skeleton class="h-4 w-[200px]" />
            </div>
          </div>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
          <Package class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">暂无产品数据</h3>
          <p class="text-muted-foreground mb-4">开始添加您的第一个产品</p>
          <Button @click="openCreateDialog">
            <Plus class="h-4 w-4 mr-2" />
            新增产品
          </Button>
        </div>

        <div v-else>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">
                  <input type="checkbox" class="" />
                </TableHead>
                <TableHead>产品编码</TableHead>
                <TableHead>产品名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead class="text-right">当前库存</TableHead>
                <TableHead class="text-right">单价</TableHead>
                <TableHead class="text-right">成本价</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead class="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="product in filteredProducts"
                :key="product.id"
                class="hover:bg-muted/50"
              >
                <TableCell>
                  <input type="checkbox" class="" />
                </TableCell>
                <TableCell>
                  <span class="font-mono text-sm">{{ product.product_no }}</span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 bg-muted flex items-center justify-center">
                      <Package class="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div class="font-medium">{{ product.name }}</div>
                      <div class="text-sm text-muted-foreground">{{ product.specification }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getCategorySeverity(product.category as any)">
                    {{ getCategoryDisplayName(product.category) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <div class="font-medium">{{ product.current_stock }}</div>
                  <div class="text-sm text-muted-foreground">{{ product.unit }}</div>
                </TableCell>
                <TableCell class="text-right font-medium">
                  ¥{{ formatCurrency(product.unit_price) }}
                </TableCell>
                <TableCell class="text-right text-muted-foreground">
                  ¥{{ formatCurrency(product.cost_price) }}
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(product.status as any)">
                    {{ getStatusDisplayName(product.status as any) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground">
                    {{ formatDate(product.created_at) }}
                  </span>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" @click="viewProduct(product)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <PermissionWrapper :has-permission="canCreateProduct">
                      <Button variant="ghost" size="sm" @click="openCreateDialog">
                        <Edit class="h-4 w-4" />
                      </Button>
                    </PermissionWrapper>
                    <Button variant="ghost" size="sm" @click="duplicateProduct(product)">
                      <Copy class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="showStockDetails(product)">
                      <BarChart3 class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="
                        toggleStatus(product, product.status === 'active' ? 'inactive' : 'active')
                      "
                    >
                      <component :is="product.status === 'active' ? Pause : Play" class="h-4 w-4" />
                    </Button>
                    <PermissionWrapper :has-permission="canCreateProduct">
                      <Button variant="ghost" size="sm" @click="confirmDeleteProduct(product)">
                        <Trash2 class="h-4 w-4 text-destructive" />
                      </Button>
                    </PermissionWrapper>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 产品对话框 -->
    <Dialog :open="showProductDialog" @update:open="showProductDialog = $event">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Package class="h-5 w-5" />
            {{ editingProduct ? '编辑产品' : '新增产品' }}
          </DialogTitle>
        </DialogHeader>

        <Tabs default-value="basic" class="w-full">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="pricing">价格库存</TabsTrigger>
            <TabsTrigger value="other">其他信息</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" class="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Info class="h-4 w-4" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label>产品编码</Label>
                    <Input v-model="productForm.product_no" disabled placeholder="系统自动生成" />
                  </div>

                  <div class="space-y-2">
                    <Label>
                      产品名称
                      <span class="text-destructive">*</span>
                    </Label>
                    <Input
                      v-model="productForm.name"
                      placeholder="请输入产品名称"
                      :disabled="dialogMode === 'view'"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label>
                      产品分类
                      <span class="text-destructive">*</span>
                    </Label>
                    <Select v-model="productForm.category" :disabled="dialogMode === 'view'">
                      <SelectTrigger>
                        <SelectValue placeholder="选择产品分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="option in categoryOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="space-y-2">
                    <Label>
                      计量单位
                      <span class="text-destructive">*</span>
                    </Label>
                    <Select v-model="productForm.unit" :disabled="dialogMode === 'view'">
                      <SelectTrigger>
                        <SelectValue placeholder="选择计量单位" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="option in unitOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label>产品规格</Label>
                  <Input
                    v-model="productForm.specification"
                    placeholder="请输入产品规格"
                    :disabled="dialogMode === 'view'"
                  />
                </div>

                <div class="space-y-2">
                  <Label>产品描述</Label>
                  <Textarea
                    v-model="productForm.description"
                    placeholder="请输入产品描述"
                    :disabled="dialogMode === 'view'"
                    rows="3"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" class="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <DollarSign class="h-4 w-4" />
                  价格库存
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <Label>
                      销售单价
                      <span class="text-destructive">*</span>
                    </Label>
                    <Input
                      v-model="productForm.unit_price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      :disabled="dialogMode === 'view'"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>
                      成本价
                      <span class="text-destructive">*</span>
                    </Label>
                    <Input
                      v-model="productForm.cost_price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      :disabled="dialogMode === 'view'"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>当前库存</Label>
                    <Input
                      v-model="productForm.current_stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      :disabled="dialogMode === 'view'"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label>最小库存</Label>
                    <Input
                      v-model="productForm.min_stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      :disabled="dialogMode === 'view'"
                    />
                  </div>

                  <div class="space-y-2">
                    <Label>最大库存</Label>
                    <Input
                      v-model="productForm.max_stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      :disabled="dialogMode === 'view'"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="other" class="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Settings class="h-4 w-4" />
                  其他信息
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label>产品状态</Label>
                    <Select v-model="productForm.status" :disabled="dialogMode === 'view'">
                      <SelectTrigger>
                        <SelectValue placeholder="选择产品状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          v-for="option in statusOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="space-y-2">
                    <Label>供应商</Label>
                    <Input
                      v-model="productForm.supplier"
                      placeholder="请输入供应商"
                      :disabled="dialogMode === 'view'"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label>备注</Label>
                  <Textarea
                    v-model="productForm.notes"
                    placeholder="请输入备注信息"
                    :disabled="dialogMode === 'view'"
                    rows="4"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter class="mt-6">
          <Button variant="outline" @click="closeProductDialog">
            <X class="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button v-if="dialogMode !== 'view'" :disabled="saving" @click="saveProduct">
            <Loader2 v-if="saving" class="h-4 w-4 mr-2 animate-spin" />
            <Check v-else class="h-4 w-4 mr-2" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// UI组件现在自动导入，无需手动导入

import {
  AlertTriangle,
  BarChart3,
  Check,
  Copy,
  DollarSign,
  Download,
  Edit,
  Eye,
  FilterX,
  Info,
  List,
  Loader2,
  Package,
  Pause,
  Play,
  Plus,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  Upload,
  X,
  XCircle,
} from 'lucide-vue-next'
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '产品管理 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showProductDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const editingProduct = ref<any>(null)

// 权限检查
const canCreateProduct = ref(true)

// 筛选条件
const searchQuery = ref('')
const categoryFilter = ref('')
const stockStatusFilter = ref('')
const statusFilter = ref('')

// 表单数据
const productForm = ref({
  product_no: '',
  name: '',
  category: '',
  unit: '',
  specification: '',
  description: '',
  unit_price: 0,
  cost_price: 0,
  current_stock: 0,
  min_stock: 0,
  max_stock: 0,
  status: 'active',
  supplier: '',
  notes: '',
})

// 统计数据
const productStats = ref({
  totalProducts: 1258,
  stockValue: 2850000,
  lowStockCount: 23,
  outOfStockCount: 5,
})

// 选项数据
const categoryOptions = ref([
  { label: '原材料', value: 'raw_material' },
  { label: '半成品', value: 'semi_finished' },
  { label: '成品', value: 'finished_product' },
  { label: '配件', value: 'accessory' },
])

const unitOptions = ref([
  { label: '件', value: 'pcs' },
  { label: '个', value: 'piece' },
  { label: '套', value: 'set' },
  { label: '米', value: 'm' },
  { label: '千克', value: 'kg' },
])

const stockStatusOptions = ref([
  { label: '正常', value: 'normal' },
  { label: '低库存', value: 'low' },
  { label: '缺货', value: 'out' },
])

const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
])

// 模拟数据
const mockProducts = ref([
  {
    id: '1',
    product_no: 'PRD-001',
    name: '智能手机屏幕',
    category: 'finished_product',
    specification: '6.1英寸 OLED',
    unit: 'pcs',
    current_stock: 150,
    min_stock: 50,
    max_stock: 500,
    unit_price: 280,
    cost_price: 200,
    status: 'active',
    supplier: 'ABC供应商',
    created_at: new Date('2024-01-15'),
    image: null,
    description: '高质量OLED显示屏',
    notes: '主要用于旗舰手机',
  },
  {
    id: '2',
    product_no: 'PRD-002',
    name: '电池组件',
    category: 'accessory',
    specification: '3000mAh',
    unit: 'pcs',
    current_stock: 25,
    min_stock: 30,
    max_stock: 200,
    unit_price: 120,
    cost_price: 80,
    status: 'active',
    supplier: 'XYZ电池厂',
    created_at: new Date('2024-01-10'),
    image: null,
    description: '锂电池组件',
    notes: '符合安全标准',
  },
])

// 计算属性
const filteredProducts = computed(() => {
  let result = mockProducts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      product =>
        product.product_no.toLowerCase().includes(query)
        || product.name.toLowerCase().includes(query),
    )
  }

  if (categoryFilter.value) {
    result = result.filter(product => product.category === categoryFilter.value)
  }

  if (stockStatusFilter.value) {
    result = result.filter((product) => {
      if (stockStatusFilter.value === 'low') {
        return product.current_stock <= product.min_stock
      }
      if (stockStatusFilter.value === 'out') {
        return product.current_stock === 0
      }
      return product.current_stock > product.min_stock
    })
  }

  if (statusFilter.value) {
    result = result.filter(product => product.status === statusFilter.value)
  }

  return result
})

// 映射对象
const categoryMap: Record<string, string> = {
  raw_material: '原材料',
  semi_finished: '半成品',
  finished_product: '成品',
  accessory: '配件',
}

const categorySeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  raw_material: 'secondary',
  semi_finished: 'outline',
  finished_product: 'default',
  accessory: 'secondary',
}

const statusMap: Record<string, string> = {
  active: '启用',
  inactive: '停用',
}

const _statusSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  active: 'default',
  inactive: 'destructive',
}

// 方法
const getCategoryDisplayName = (category: string) => categoryMap[category] || category
const getCategorySeverity = (category: string) => categorySeverityMap[category] || 'secondary'
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusVariant = (status: string) => {
  const variantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    active: 'default',
    inactive: 'secondary',
  }
  return variantMap[status] || 'outline'
}

const _getStockClass = (currentStock: number, minStock: number) => {
  if (currentStock === 0) return 'text-red-600'
  if (currentStock <= minStock) return 'text-orange-600'
  return 'text-color'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString()
}

const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  stockStatusFilter.value = ''
  statusFilter.value = ''
}

const openCreateDialog = () => {
  editingProduct.value = null
  dialogMode.value = 'create'
  productForm.value = {
    product_no: `PRD-${Date.now()}`,
    name: '',
    category: '',
    unit: '',
    specification: '',
    description: '',
    unit_price: 0,
    cost_price: 0,
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    status: 'active',
    supplier: '',
    notes: '',
  }
  showProductDialog.value = true
}

const viewProduct = (product: any) => {
  editingProduct.value = product
  dialogMode.value = 'view'
  Object.assign(productForm.value, product)
  showProductDialog.value = true
}

const _editProduct = (product: any) => {
  editingProduct.value = product
  dialogMode.value = 'edit'
  Object.assign(productForm.value, product)
  showProductDialog.value = true
}

const duplicateProduct = (product: any) => {
  editingProduct.value = null
  dialogMode.value = 'create'
  Object.assign(productForm.value, {
    ...product,
    product_no: `PRD-${Date.now()}`,
    name: `${product.name} (副本)`,
  })
  showProductDialog.value = true
}

const showStockDetails = (product: any) => {
  console.log('显示库存详情:', product.name)
}

const toggleStatus = async (product: any, newStatus: string) => {
  if (
    window.confirm(`确定要${newStatus === 'active' ? '启用' : '停用'}产品 ${product.name} 吗？`)
  ) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const index = mockProducts.value.findIndex(p => p.id === product.id)
      if (index !== -1) {
        if (mockProducts.value[index]) {
          mockProducts.value[index]!.status = newStatus
        }
      }
    }
    catch (error) {
      console.error('操作失败:', error)
    }
  }
}

const confirmDeleteProduct = (product: any) => {
  if (window.confirm(`确定要删除产品 ${product.name} 吗？`)) {
    deleteProduct(product.id)
  }
}

const deleteProduct = (productId: string) => {
  mockProducts.value = mockProducts.value.filter(product => product.id !== productId)
}

const closeProductDialog = () => {
  showProductDialog.value = false
  editingProduct.value = null
}

const saveProduct = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (dialogMode.value === 'create') {
      const newProduct = {
        id: Date.now().toString(),
        ...productForm.value,
        created_at: new Date(),
        image: null,
      }
      mockProducts.value.push(newProduct as any)
    }
    else if (dialogMode.value === 'edit') {
      const index = mockProducts.value.findIndex(p => p.id === editingProduct.value?.id)
      if (index !== -1 && mockProducts.value[index]) {
        mockProducts.value[index] = {
          ...mockProducts.value[index],
          ...productForm.value,
          id: mockProducts.value[index]!.id,
        }
      }
    }

    closeProductDialog()
  }
  catch (error) {
    console.error('保存产品失败:', error)
  }
  finally {
    saving.value = false
  }
}

const importProducts = () => {
  console.log('批量导入产品')
}

// 初始化
onMounted(() => {
  // 加载数据
})
</script>
