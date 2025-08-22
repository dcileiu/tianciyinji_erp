<template>
  <div class="container mx-auto py-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">产品管理</h1>
        <p class="text-muted-foreground">管理产品信息、库存设置和定价策略</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="importProducts">
          <Upload class="mr-2 h-4 w-4" />
          批量导入
        </Button>
        <PermissionWrapper :has-permission="canCreateProduct">
          <Button @click="openCreateDialog">
            <Plus class="mr-2 h-4 w-4" />
            新增产品
          </Button>
        </PermissionWrapper>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-500/10 rounded-full">
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
            <div class="p-3 bg-green-500/10 rounded-full">
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
            <div class="p-3 bg-yellow-500/10 rounded-full">
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
            <div class="p-3 bg-red-500/10 rounded-full">
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
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>搜索筛选</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label for="search">搜索产品</Label>
            <Input
              id="search"
              v-model="searchQuery"
              placeholder="产品名称或编码"
              class="mt-1"
            />
          </div>
          <div>
            <Label for="category">产品分类</Label>
            <select
              id="category"
              v-model="selectedCategory"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部分类</option>
              <option value="raw_material">原材料</option>
              <option value="finished_product">成品</option>
              <option value="semi_finished">半成品</option>
              <option value="accessory">配件</option>
            </select>
          </div>
          <div>
            <Label for="status">产品状态</Label>
            <select
              id="status"
              v-model="selectedStatus"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部状态</option>
              <option value="active">正常</option>
              <option value="inactive">停用</option>
              <option value="discontinued">停产</option>
            </select>
          </div>
          <div>
            <Label for="stock-status">库存状态</Label>
            <select
              id="stock-status"
              v-model="selectedStockStatus"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部库存</option>
              <option value="normal">正常</option>
              <option value="low">低库存</option>
              <option value="out">缺货</option>
            </select>
          </div>
          <div class="flex items-end">
            <Button @click="handleSearch" class="w-full">
              <Search class="mr-2 h-4 w-4" />
              搜索
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 产品列表 -->
    <Card>
      <CardHeader>
        <CardTitle>产品列表</CardTitle>
        <CardDescription>
          共 {{ filteredProducts.length }} 个产品
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          加载中...
        </div>
        <div v-else-if="filteredProducts.length === 0" class="text-center py-8">
          <Package class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p class="text-muted-foreground">暂无产品数据</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4 font-medium">产品信息</th>
                <th class="text-left py-3 px-4 font-medium">分类</th>
                <th class="text-left py-3 px-4 font-medium">库存</th>
                <th class="text-left py-3 px-4 font-medium">价格</th>
                <th class="text-left py-3 px-4 font-medium">状态</th>
                <th class="text-left py-3 px-4 font-medium">更新时间</th>
                <th class="text-left py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                class="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Package class="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p class="font-medium">{{ product.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ product.product_no }}</p>
                      <p class="text-xs text-muted-foreground">{{ product.specification }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <Badge :variant="getCategoryVariant(product.category)">
                    {{ getCategoryText(product.category) }}
                  </Badge>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm">
                    <p class="font-medium">{{ product.current_stock }} {{ product.unit }}</p>
                    <p class="text-muted-foreground">安全库存: {{ product.min_stock }}</p>
                    <Badge :variant="getStockStatusVariant(product)" size="sm">
                      {{ getStockStatusText(product) }}
                    </Badge>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm">
                    <p class="font-medium">¥{{ formatCurrency(product.unit_price) }}</p>
                    <p class="text-muted-foreground">成本: ¥{{ formatCurrency(product.cost_price) }}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <Badge :variant="getStatusVariant(product.status)">
                    {{ getStatusText(product.status) }}
                  </Badge>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm text-muted-foreground">
                    {{ formatDate(product.updated_at) }}
                  </p>
                </td>
                <td class="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="viewProduct(product)">
                        <Eye class="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <PermissionWrapper :has-permission="canEditProduct">
                        <DropdownMenuItem @click="editProduct(product)">
                          <Edit class="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                      </PermissionWrapper>
                      <DropdownMenuItem @click="duplicateProduct(product)">
                        <Copy class="mr-2 h-4 w-4" />
                        复制
                      </DropdownMenuItem>
                      <PermissionWrapper :has-permission="canDeleteProduct">
                        <DropdownMenuItem 
                          @click="deleteProduct(product)"
                          class="text-destructive"
                        >
                          <Trash2 class="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </PermissionWrapper>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- 创建/编辑产品对话框 -->
    <Dialog v-model:open="showProductDialog">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ editingProduct ? '编辑产品' : '新增产品' }}</DialogTitle>
          <DialogDescription>
            {{ editingProduct ? '修改产品信息' : '添加新的产品信息' }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4 max-h-[400px] overflow-y-auto">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="product-name">产品名称 <span class="text-destructive">*</span></Label>
              <Input
                id="product-name"
                v-model="productForm.name"
                placeholder="请输入产品名称"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="product-no">产品编码 <span class="text-destructive">*</span></Label>
              <Input
                id="product-no"
                v-model="productForm.product_no"
                placeholder="请输入产品编码"
                class="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label for="description">产品描述</Label>
            <Textarea
              id="description"
              v-model="productForm.description"
              placeholder="请输入产品描述"
              class="mt-1"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="category">产品分类 <span class="text-destructive">*</span></Label>
              <select
                id="category"
                v-model="productForm.category"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
              >
                <option value="">请选择分类</option>
                <option value="raw_material">原材料</option>
                <option value="finished_product">成品</option>
                <option value="semi_finished">半成品</option>
                <option value="accessory">配件</option>
              </select>
            </div>
            <div>
              <Label for="unit">单位 <span class="text-destructive">*</span></Label>
              <Input
                id="unit"
                v-model="productForm.unit"
                placeholder="如：件、箱、公斤"
                class="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label for="specification">规格型号</Label>
            <Input
              id="specification"
              v-model="productForm.specification"
              placeholder="请输入规格型号"
              class="mt-1"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="unit-price">销售价格</Label>
              <Input
                id="unit-price"
                v-model.number="productForm.unit_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="cost-price">成本价格</Label>
              <Input
                id="cost-price"
                v-model.number="productForm.cost_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="mt-1"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <Label for="min-stock">安全库存</Label>
              <Input
                id="min-stock"
                v-model.number="productForm.min_stock"
                type="number"
                placeholder="0"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="max-stock">最大库存</Label>
              <Input
                id="max-stock"
                v-model.number="productForm.max_stock"
                type="number"
                placeholder="0"
                class="mt-1"
              />
            </div>
            <div>
              <Label for="current-stock">当前库存</Label>
              <Input
                id="current-stock"
                v-model.number="productForm.current_stock"
                type="number"
                placeholder="0"
                class="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label for="barcode">条形码</Label>
            <Input
              id="barcode"
              v-model="productForm.barcode"
              placeholder="请输入条形码"
              class="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" @click="showProductDialog = false">
            取消
          </Button>
          <Button @click="handleSubmit" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingProduct ? '更新' : '创建' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, Search, Upload, MoreHorizontal, Package, TrendingUp, 
  AlertTriangle, XCircle, Eye, Edit, Copy, Trash2, Loader2 
} from 'lucide-vue-next'

// 导入组件
import Button from '~/components/ui/Button.vue'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Badge from '~/components/ui/Badge.vue'
import Dialog, { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/Dialog.vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedStockStatus = ref('')
const showProductDialog = ref(false)
const editingProduct = ref(null)
const submitting = ref(false)
const loading = ref(false)

// 权限检查（模拟）
const canCreateProduct = ref(true)
const canEditProduct = ref(true)
const canDeleteProduct = ref(true)

// 统计数据
const productStats = reactive({
  totalProducts: 0,
  stockValue: 0,
  lowStockCount: 0,
  outOfStockCount: 0
})

// 表单数据
const productForm = reactive({
  name: '',
  product_no: '',
  description: '',
  category: '',
  specification: '',
  unit: '',
  unit_price: 0,
  cost_price: 0,
  min_stock: 0,
  max_stock: 0,
  current_stock: 0,
  barcode: ''
})

// 模拟产品数据
const products = ref([
  {
    id: '1',
    name: '笔记本电脑',
    product_no: 'PRD001',
    description: '高性能商务笔记本电脑',
    category: 'finished_product',
    specification: '14寸 16GB 512GB',
    unit: '台',
    unit_price: 5999.00,
    cost_price: 4500.00,
    min_stock: 10,
    max_stock: 100,
    current_stock: 25,
    barcode: '1234567890123',
    status: 'active',
    updated_at: '2024-12-26T10:00:00Z'
  },
  {
    id: '2',
    name: '无线鼠标',
    product_no: 'PRD002',
    description: '人体工程学无线鼠标',
    category: 'accessory',
    specification: '2.4G无线 1600DPI',
    unit: '个',
    unit_price: 89.00,
    cost_price: 45.00,
    min_stock: 50,
    max_stock: 500,
    current_stock: 15,
    barcode: '1234567890124',
    status: 'active',
    updated_at: '2024-12-26T09:30:00Z'
  },
  {
    id: '3',
    name: '电路板原料',
    product_no: 'PRD003',
    description: '高质量PCB电路板',
    category: 'raw_material',
    specification: 'FR4 1.6mm',
    unit: '片',
    unit_price: 15.00,
    cost_price: 8.00,
    min_stock: 100,
    max_stock: 1000,
    current_stock: 0,
    barcode: '1234567890125',
    status: 'active',
    updated_at: '2024-12-26T08:15:00Z'
  }
])

// 计算属性
const filteredProducts = computed(() => {
  let result = products.value || []
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.product_no.toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value) {
    result = result.filter(product => product.category === selectedCategory.value)
  }
  
  if (selectedStatus.value) {
    result = result.filter(product => product.status === selectedStatus.value)
  }
  
  if (selectedStockStatus.value) {
    result = result.filter(product => getStockStatus(product) === selectedStockStatus.value)
  }
  
  return result
})

// 方法
const openCreateDialog = () => {
  editingProduct.value = null
  resetForm()
  showProductDialog.value = true
}

const editProduct = (product: any) => {
  editingProduct.value = product
  Object.assign(productForm, product)
  showProductDialog.value = true
}

const viewProduct = (product: any) => {
  console.log('查看产品:', product)
}

const duplicateProduct = (product: any) => {
  editingProduct.value = null
  Object.assign(productForm, {
    ...product,
    name: product.name + ' (副本)',
    product_no: product.product_no + '_COPY'
  })
  showProductDialog.value = true
}

const deleteProduct = async (product: any) => {
  if (confirm(`确定要删除产品 "${product.name}" 吗？`)) {
    console.log('删除产品:', product)
  }
}

const importProducts = () => {
  console.log('批量导入产品')
}

const handleSubmit = async () => {
  if (!productForm.name || !productForm.product_no || !productForm.category || !productForm.unit) {
    alert('请填写必填字段')
    return
  }
  
  submitting.value = true
  try {
    console.log('提交产品:', productForm)
    showProductDialog.value = false
    updateStats()
  } catch (error) {
    alert('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(productForm, {
    name: '',
    product_no: '',
    description: '',
    category: '',
    specification: '',
    unit: '',
    unit_price: 0,
    cost_price: 0,
    min_stock: 0,
    max_stock: 0,
    current_stock: 0,
    barcode: ''
  })
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

const updateStats = () => {
  const items = products.value || []
  productStats.totalProducts = items.length
  productStats.stockValue = items.reduce((sum, item) => sum + (item.current_stock * item.unit_price), 0)
  productStats.lowStockCount = items.filter(item => getStockStatus(item) === 'low').length
  productStats.outOfStockCount = items.filter(item => getStockStatus(item) === 'out').length
}

const getStockStatus = (product: any) => {
  if (product.current_stock <= 0) return 'out'
  if (product.current_stock <= product.min_stock) return 'low'
  return 'normal'
}

const getCategoryVariant = (category: string) => {
  const variants = {
    raw_material: 'secondary' as const,
    finished_product: 'default' as const,
    semi_finished: 'outline' as const,
    accessory: 'destructive' as const
  }
  return variants[category as keyof typeof variants] || 'secondary'
}

const getCategoryText = (category: string) => {
  const texts = {
    raw_material: '原材料',
    finished_product: '成品',
    semi_finished: '半成品',
    accessory: '配件'
  }
  return texts[category as keyof typeof texts] || category
}

const getStatusVariant = (status: string) => {
  const variants = {
    active: 'default' as const,
    inactive: 'secondary' as const,
    discontinued: 'destructive' as const
  }
  return variants[status as keyof typeof variants] || 'secondary'
}

const getStatusText = (status: string) => {
  const texts = {
    active: '正常',
    inactive: '停用',
    discontinued: '停产'
  }
  return texts[status as keyof typeof texts] || status
}

const getStockStatusVariant = (product: any) => {
  const status = getStockStatus(product)
  const variants = {
    normal: 'default' as const,
    low: 'secondary' as const,
    out: 'destructive' as const
  }
  return variants[status as keyof typeof variants] || 'default'
}

const getStockStatusText = (product: any) => {
  const status = getStockStatus(product)
  const texts = {
    normal: '正常',
    low: '低库存',
    out: '缺货'
  }
  return texts[status as keyof typeof texts] || '未知'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN').format(amount || 0)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 页面加载时更新统计
onMounted(() => {
  updateStats()
})

// 页面元数据
definePageMeta({
  layout: 'default',
  middleware: 'auth' as any
})
</script> 