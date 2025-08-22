<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          商品管理
        </h1>
        <p class="text-muted-foreground mt-1">
          管理产品和物料的基础信息，维护商品规格和库存设置
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <button class="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
          </svg>
          <span>批量导入</span>
        </button>
        <button 
          @click="openProductDialog()"
          class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span>新增商品</span>
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              搜索商品
            </label>
            <div class="relative">
              <Input
                v-model="searchQuery"
                placeholder="商品名称、编号、规格..."
                class="pl-10"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- 商品分类筛选 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              商品分类
            </label>
            <Select v-model="categoryFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分类</SelectItem>
                <SelectItem value="raw_material">原材料</SelectItem>
                <SelectItem value="finished_product">成品</SelectItem>
                <SelectItem value="semi_finished">半成品</SelectItem>
                <SelectItem value="accessory">配件</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 状态筛选 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              商品状态
            </label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
                <SelectItem value="discontinued">停产</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 库存状态筛选 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              库存状态
            </label>
            <Select v-model="stockFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部库存" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部库存</SelectItem>
                <SelectItem value="sufficient">库存充足</SelectItem>
                <SelectItem value="low">库存不足</SelectItem>
                <SelectItem value="out">缺货</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-end">
            <Button variant="secondary" class="w-full">
              重置筛选
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 商品统计 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">商品总数</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalProducts }}</p>
          </div>
          <div class="p-2 bg-blue-500/10 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">在售商品</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.activeProducts }}</p>
          </div>
          <div class="p-2 bg-green-500/10 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">库存不足</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.lowStockProducts }}</p>
          </div>
          <div class="p-2 bg-yellow-500/10 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.16 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">缺货商品</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.outOfStockProducts }}</p>
          </div>
          <div class="p-2 bg-red-500/10 rounded-lg">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">库存总值</p>
            <p class="text-2xl font-bold text-foreground">¥{{ stats.totalStockValue.toLocaleString() }}</p>
          </div>
          <div class="p-2 bg-purple-500/10 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>商品列表</CardTitle>
          <div class="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              批量操作
            </Button>
            <Button variant="outline" size="sm">
              导出数据
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>商品编号</TableHead>
                <TableHead>商品信息</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>规格型号</TableHead>
                <TableHead>单位</TableHead>
                <TableHead>当前库存</TableHead>
                <TableHead>单价</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="product in filteredProducts"
                :key="product.id"
              >
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell class="font-medium">
                  {{ product.product_no }}
                </TableCell>
                <TableCell>
                  <div class="flex items-center">
                    <div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium">{{ product.name }}</div>
                      <div class="text-sm text-muted-foreground">{{ product.description || '暂无描述' }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getCategoryVariant(product.category)">
                    {{ getCategoryText(product.category) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  {{ product.specification }}
                </TableCell>
                <TableCell>
                  {{ product.unit }}
                </TableCell>
                <TableCell>
                  <div class="text-sm font-medium">{{ product.current_stock }}</div>
                  <div class="text-xs text-muted-foreground">
                    最低: {{ product.min_stock }} | 最高: {{ product.max_stock }}
                  </div>
                </TableCell>
                <TableCell>
                  ¥{{ product.unit_price.toFixed(2) }}
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(product.status)">
                    {{ getStatusText(product.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" title="查看详情">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button 
                      @click="openProductDialog(product)"
                      variant="ghost" 
                      size="sm"
                      title="编辑"
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="库存调整">
                      <Package class="h-4 w-4" />
                    </Button>
                    <Button 
                      @click="deleteProduct(product.id)"
                      variant="ghost" 
                      size="sm"
                      title="删除"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="复制商品">
                      <Copy class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

      <!-- 分页 -->
      <div class="bg-background px-4 py-3 border-t border-border sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <p class="text-sm text-muted-foreground">
              显示 
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              到
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredProducts.length) }}</span>
              项，共
              <span class="font-medium">{{ filteredProducts.length }}</span>
              项
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage * pageSize >= filteredProducts.length"
              class="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 商品表单对话框 -->
  <Dialog v-model:open="showProductDialog">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ editingProduct ? '编辑商品' : '新增商品' }}</DialogTitle>
      </DialogHeader>
      
      <form @submit.prevent="saveProduct" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 商品编号 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              商品编号 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="productForm.product_no"
              :disabled="editingProduct"
              placeholder="自动生成或手动输入"
              required
            />
          </div>

          <!-- 商品名称 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              商品名称 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="productForm.name"
              placeholder="请输入商品名称"
              required
            />
          </div>

          <!-- 商品描述 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-foreground mb-2">
              商品描述
            </label>
            <Textarea
              v-model="productForm.description"
              placeholder="请输入商品描述"
              rows="3"
            />
          </div>

          <!-- 分类 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              分类 <span class="text-red-500">*</span>
            </label>
            <Select v-model="productForm.category" required>
              <SelectTrigger>
                <SelectValue placeholder="请选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw_material">原材料</SelectItem>
                <SelectItem value="finished_product">成品</SelectItem>
                <SelectItem value="semi_finished">半成品</SelectItem>
                <SelectItem value="accessory">配件</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <!-- 单位 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              单位 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="productForm.unit"
              placeholder="如：个、套、米"
              required
            />
          </div>

          <!-- 状态 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              状态 <span class="text-red-500">*</span>
            </label>
            <Select v-model="productForm.status" required>
              <SelectTrigger>
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
                <SelectItem value="discontinued">停产</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- 库存信息 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              当前库存 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model.number="productForm.current_stock"
              type="number"
              min="0"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              最低库存 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model.number="productForm.min_stock"
              type="number"
              min="0"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              最高库存 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model.number="productForm.max_stock"
              type="number"
              min="0"
              placeholder="0"
              required
            />
          </div>
        </div>

        <!-- 价格信息 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              销售单价 <span class="text-red-500">*</span>
            </label>
            <Input
              v-model.number="productForm.unit_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              成本价格
            </label>
            <Input
              v-model.number="productForm.cost_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              规格型号
            </label>
            <Input
              v-model="productForm.specification"
              placeholder="请输入规格型号"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              条形码
            </label>
            <Input
              v-model="productForm.barcode"
              placeholder="请输入条形码"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            供应商
          </label>
          <Input
            v-model="productForm.supplier_name"
            placeholder="请输入供应商名称"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="closeProductDialog"
          >
            取消
          </Button>
          <Button
            type="submit"
            :disabled="saving"
          >
            {{ saving ? '保存中...' : '保存' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useProducts } from '~/composables/useSupabase'
import type { Product } from '~/types/database'
import { Eye, Edit, Package, Trash2, Copy } from 'lucide-vue-next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

// 商品表单数据
const showProductDialog = ref(false)
const editingProduct = ref<Product | null>(null)
const saving = ref(false)

// 商品表单
const productForm = reactive({
  product_no: '',
  name: '',
  description: '',
  category: '',
  specification: '',
  unit: '',
  current_stock: 0,
  min_stock: 0,
  max_stock: 0,
  unit_price: 0,
  cost_price: 0,
  barcode: '',
  supplier_name: '',
  status: 'active'
})

// 打开商品对话框
const openProductDialog = (product?: Product) => {
  if (product) {
    editingProduct.value = product
    Object.assign(productForm, {
      product_no: product.product_no,
      name: product.name,
      description: product.description || '',
      category: product.category,
      specification: product.specification || '',
      unit: product.unit,
      current_stock: product.current_stock,
      min_stock: product.min_stock,
      max_stock: product.max_stock,
      unit_price: product.unit_price,
      cost_price: product.cost_price || 0,
      barcode: product.barcode || '',
      supplier_name: product.supplier_name || '',
      status: product.status
    })
  } else {
    editingProduct.value = null
    Object.assign(productForm, {
      product_no: '',
      name: '',
      description: '',
      category: '',
      specification: '',
      unit: '',
      current_stock: 0,
      min_stock: 0,
      max_stock: 0,
      unit_price: 0,
      cost_price: 0,
      barcode: '',
      supplier_name: '',
      status: 'active'
    })
  }
  showProductDialog.value = true
}

// 关闭商品对话框
const closeProductDialog = () => {
  showProductDialog.value = false
  editingProduct.value = null
}

// 保存商品
const saveProduct = async () => {
  try {
    saving.value = true
    
    if (editingProduct.value) {
      // 编辑商品
      await updateProduct(editingProduct.value.id, productForm)
    } else {
      // 新增商品
      await createProduct(productForm)
    }
    
    closeProductDialog()
    await loadProducts()
    await loadStats()
  } catch (err: any) {
    error.value = err.message || '保存商品失败'
    console.error('保存商品失败:', err)
  } finally {
    saving.value = false
  }
}

// 响应式数据
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const stockFilter = ref('')
const currentPage = ref(1)
const pageSize = 12
const loading = ref(false)
const error = ref('')

// 统计数据
const stats = reactive({
  totalProducts: 0,
  activeProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,
  totalStockValue: 0
})

// 商品数据
const products = ref<Product[]>([
])

// 使用商品数据操作
const {
  getProducts,
  getProductStats,
  createProduct,
  updateProduct,
  deleteProduct: removeProduct,
  searchProducts,
  getProductsByCategory,
  getProductsByStatus,
  getLowStockProducts,
  getOutOfStockProducts
} = useProducts()

// 删除商品
const deleteProduct = async (id: string) => {
  if (!confirm('确定要删除这个商品吗？')) {
    return
  }
  
  try {
    await removeProduct(id)
    await loadProducts()
    await loadStats()
  } catch (err: any) {
    error.value = err.message || '删除商品失败'
    console.error('删除商品失败:', err)
  }
}

// 加载商品数据
const loadProducts = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await getProducts()
    products.value = data
  } catch (err: any) {
    error.value = err.message || '加载商品数据失败'
    console.error('加载商品数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const data = await getProductStats()
    Object.assign(stats, data)
  } catch (err: any) {
    console.error('加载统计数据失败:', err)
  }
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
  stockFilter.value = ''
  currentPage.value = 1
}

// 组件挂载时加载数据
onMounted(async () => {
  await Promise.all([loadProducts(), loadStats()])
})

// 筛选商品
const filteredProducts = computed(() => {
  let filtered = products.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.product_no.toLowerCase().includes(query) ||
      (product.specification && product.specification.toLowerCase().includes(query))
    )
  }

  // 分类筛选
  if (categoryFilter.value) {
    filtered = filtered.filter(product => product.category === categoryFilter.value)
  }

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(product => product.status === statusFilter.value)
  }

  // 库存状态筛选
  if (stockFilter.value) {
    filtered = filtered.filter(product => {
      if (stockFilter.value === 'sufficient') {
        return product.current_stock > product.min_stock
      } else if (stockFilter.value === 'low') {
        return product.current_stock <= product.min_stock && product.current_stock > 0
      } else if (stockFilter.value === 'out') {
        return product.current_stock === 0
      }
      return true
    })
  }

  return filtered
})

// 获取分类变体
const getCategoryVariant = (category: string): string => {
  const variants: Record<string, string> = {
    raw_material: 'secondary',
    finished_product: 'default',
    semi_finished: 'outline',
    accessory: 'destructive'
  }
  return variants[category] || 'secondary'
}

// 获取分类文本
const getCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    raw_material: '原材料',
    finished_product: '成品',
    semi_finished: '半成品',
    accessory: '配件'
  }
  return texts[category] || category
}

// 获取状态变体
const getStatusVariant = (status: string): string => {
  const variants: Record<string, string> = {
    active: 'default',
    inactive: 'secondary',
    discontinued: 'destructive'
  }
  return variants[status] || 'secondary'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    discontinued: '停产'
  }
  return texts[status] || status
}

// 页面标题
useHead({
  title: '商品管理 - ERP 管理系统'
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>