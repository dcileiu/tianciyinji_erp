<template>
  <div class="p-6 min-h-screen bg-gray-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div class="flex items-center gap-3">
        <Package class="h-8 w-8 text-blue-600" />
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-1">产品管理</h1>
          <p class="text-gray-600">管理产品信息、库存和定价</p>
        </div>
      </div>
      <Button class="bg-blue-600 hover:bg-blue-700" @click="openProductModal">
        <Plus class="h-4 w-4 mr-2" />
        新增产品
      </Button>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <CardContent class="p-6">
        <div class="flex gap-4 items-center flex-wrap">
          <div class="flex-1 min-w-80 relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input v-model="searchKeyword" placeholder="搜索产品名称、编码..." class="pl-10" />
          </div>

          <div class="flex gap-4 items-center">
            <Select v-model="selectedCategory">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="产品分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in categoryOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedStatus">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="产品状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" @click="resetFilters">
              <RefreshCw class="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent class="p-6 text-center">
          <div class="flex items-center justify-center mb-3">
            <Package class="h-6 w-6 text-blue-600" />
          </div>
          <div class="text-2xl font-bold text-gray-900 mb-1">{{ filteredProducts.length }}</div>
          <div class="text-sm text-gray-600">总产品数</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6 text-center">
          <div class="flex items-center justify-center mb-3">
            <CheckCircle class="h-6 w-6 text-green-600" />
          </div>
          <div class="text-2xl font-bold text-green-600 mb-1">{{ activeProductsCount }}</div>
          <div class="text-sm text-gray-600">在售产品</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6 text-center">
          <div class="flex items-center justify-center mb-3">
            <AlertTriangle class="h-6 w-6 text-orange-600" />
          </div>
          <div class="text-2xl font-bold text-orange-600 mb-1">{{ lowStockCount }}</div>
          <div class="text-sm text-gray-600">库存预警</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6 text-center">
          <div class="flex items-center justify-center mb-3">
            <XCircle class="h-6 w-6 text-red-600" />
          </div>
          <div class="text-2xl font-bold text-red-600 mb-1">{{ outOfStockCount }}</div>
          <div class="text-sm text-gray-600">缺货产品</div>
        </CardContent>
      </Card>
    </div>

    <!-- 产品列表 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <List class="h-5 w-5" />
          产品列表
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-12">
          <RefreshCw class="h-6 w-6 animate-spin text-gray-400" />
          <span class="ml-2 text-gray-600">加载中...</span>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
          <Package class="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无产品</h3>
          <p class="text-gray-600 mb-4">开始创建您的第一个产品</p>
          <Button class="bg-blue-600 hover:bg-blue-700" @click="openProductModal">
            <Plus class="h-4 w-4 mr-2" />
            新增产品
          </Button>
        </div>

        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>产品信息</TableHead>
                <TableHead>产品编码</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>库存</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead class="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 -full bg-blue-100 flex items-center justify-center">
                      <span class="text-blue-600 font-medium">{{ product.name.charAt(0) }}</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">{{ product.name }}</div>
                      <div class="text-sm text-gray-600">{{ product.description }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" class="font-mono">
                    {{ product.code }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="font-semibold text-green-600"> ¥{{ product.price.toLocaleString() }} </span>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ product.stock }}</span>
                    <Badge v-if="product.stock <= 10 && product.stock > 0" variant="destructive" class="text-xs">
                      库存不足
                    </Badge>
                    <Badge v-if="product.stock === 0" variant="destructive" class="text-xs"> 缺货 </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="product.status === 'active' ? 'default' : 'secondary'">
                    {{ product.status === 'active' ? '在售' : '停售' }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-gray-600">
                    {{ formatDate(product.updated_at) }}
                  </span>
                </TableCell>
                <TableCell>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" @click="viewProduct(product)">
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="editProduct(product)">
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="copyProduct(product)">
                      <Copy class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="text-red-600 hover:text-red-700"
                      @click="confirmDeleteProduct(product)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 产品详情/编辑对话框 -->
    <Dialog :open="showProductModal" @update:open="closeProductModal">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Package class="h-5 w-5" />
            {{ modalTitle }}
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
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="productCode">产品编码</Label>
                  <Input
                    id="productCode"
                    v-model="currentProduct.code"
                    placeholder="输入产品编码"
                    :disabled="isEditing"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="productName">产品名称</Label>
                  <Input id="productName" v-model="currentProduct.name" placeholder="输入产品名称" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="productCategory">产品分类</Label>
                  <Select v-model="currentProduct.category">
                    <SelectTrigger>
                      <SelectValue placeholder="选择产品分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in categoryOptions.filter(o => o.value)"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label for="productStatus">状态</Label>
                  <Select v-model="currentProduct.status">
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="option in statusOptions.filter(o => o.value)"
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
                <Label for="productDescription">产品描述</Label>
                <Textarea
                  id="productDescription"
                  v-model="currentProduct.description"
                  placeholder="输入产品描述"
                  rows="3"
                />
              </div>
            </CardContent>
          </Card>

          <!-- 价格和库存 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <DollarSign class="h-4 w-4" />
                价格和库存
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="productPrice">价格 (¥)</Label>
                  <Input
                    id="productPrice"
                    v-model.number="currentProduct.price"
                    type="number"
                    placeholder="输入价格"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="productStock">库存数量</Label>
                  <Input
                    id="productStock"
                    v-model.number="currentProduct.stock"
                    type="number"
                    placeholder="输入库存数量"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeProductModal">
            <X class="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button :disabled="saving" class="bg-blue-600 hover:bg-blue-700" @click="saveProduct">
            <Loader2 v-if="saving" class="h-4 w-4 mr-2 animate-spin" />
            <Check v-else class="h-4 w-4 mr-2" />
            {{ isEditing ? '更新' : '创建' }}
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
  Check,
  CheckCircle,
  Copy,
  DollarSign,
  Edit,
  Eye,
  Info,
  List,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-vue-next'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

// 对话框状态
const showProductModal = ref(false)
const isEditing = ref(false)

// 当前编辑的产品
const currentProduct = ref({
  id: '',
  code: '',
  name: '',
  description: '',
  category: '',
  price: 0,
  stock: 0,
  status: 'active',
  created_at: new Date(),
  updated_at: new Date(),
})

// 模拟产品数据
const products = ref([
  {
    id: '1',
    code: 'PRD-001',
    name: '高端智能手机',
    description: '最新款智能手机，配备先进的处理器和摄像头',
    category: 'electronics',
    price: 4999,
    stock: 50,
    status: 'active',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-15'),
  },
  {
    id: '2',
    code: 'PRD-002',
    name: '办公椅',
    description: '人体工学办公椅，舒适透气',
    category: 'furniture',
    price: 1299,
    stock: 8,
    status: 'active',
    created_at: new Date('2025-01-02'),
    updated_at: new Date('2025-01-16'),
  },
  {
    id: '3',
    code: 'PRD-003',
    name: '运动鞋',
    description: '专业跑步鞋，轻便透气',
    category: 'clothing',
    price: 699,
    stock: 0,
    status: 'inactive',
    created_at: new Date('2025-01-03'),
    updated_at: new Date('2025-01-17'),
  },
])

// 分类选项
const categoryOptions = [
  { label: '全部分类', value: '' },
  { label: '电子产品', value: 'electronics' },
  { label: '家具', value: 'furniture' },
  { label: '服装', value: 'clothing' },
  { label: '食品', value: 'food' },
]

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '在售', value: 'active' },
  { label: '停售', value: 'inactive' },
]

// 计算属性
const filteredProducts = computed(() => {
  let result = products.value

  if (searchKeyword.value) {
    result = result.filter(
      product =>
        product.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
        || product.code.toLowerCase().includes(searchKeyword.value.toLowerCase()),
    )
  }

  if (selectedCategory.value) {
    result = result.filter(product => product.category === selectedCategory.value)
  }

  if (selectedStatus.value) {
    result = result.filter(product => product.status === selectedStatus.value)
  }

  return result
})

const activeProductsCount = computed(() => {
  return products.value.filter(p => p.status === 'active').length
})

const lowStockCount = computed(() => {
  return products.value.filter(p => p.stock > 0 && p.stock <= 10).length
})

const outOfStockCount = computed(() => {
  return products.value.filter(p => p.stock === 0).length
})

const modalTitle = computed(() => {
  return isEditing.value ? '编辑产品' : '新增产品'
})

// 方法
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

const resetFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
}

const openProductModal = () => {
  isEditing.value = false
  currentProduct.value = {
    id: '',
    code: '',
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  }
  showProductModal.value = true
}

const editProduct = (product: any) => {
  isEditing.value = true
  currentProduct.value = { ...product }
  showProductModal.value = true
}

const viewProduct = (product: any) => {
  editProduct(product)
  // 可以设置为只读模式
}

const copyProduct = (product: any) => {
  isEditing.value = false
  currentProduct.value = {
    ...product,
    id: '',
    code: '',
    created_at: new Date(),
    updated_at: new Date(),
  }
  showProductModal.value = true
}

const confirmDeleteProduct = (product: any) => {
  if (window.confirm(`确定要删除产品 "${product.name}" 吗？此操作不可撤销。`)) {
    deleteProduct(product.id)
  }
}

const deleteProduct = async (productId: string) => {
  try {
    loading.value = true
    // 模拟删除操作
    const index = products.value.findIndex(p => p.id === productId)
    if (index !== -1) {
      products.value.splice(index, 1)
    }
  }
  catch (error) {
    console.error('删除产品失败:', error)
  }
  finally {
    loading.value = false
  }
}

const saveProduct = async () => {
  try {
    saving.value = true

    if (isEditing.value) {
      // 更新产品
      const index = products.value.findIndex(p => p.id === currentProduct.value.id)
      if (index !== -1) {
        products.value[index] = {
          ...currentProduct.value,
          updated_at: new Date(),
        }
      }
    }
    else {
      // 创建新产品
      const newProduct = {
        ...currentProduct.value,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date(),
      }
      products.value.push(newProduct)
    }

    closeProductModal()
  }
  catch (error) {
    console.error('保存产品失败:', error)
  }
  finally {
    saving.value = false
  }
}

const closeProductModal = () => {
  showProductModal.value = false
  isEditing.value = false
}
</script>
