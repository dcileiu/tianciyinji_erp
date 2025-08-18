<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        产品管理
      </h1>
      <UButton icon="i-heroicons-plus" size="lg" @click="showCreateModal = true">
        新增产品
      </UButton>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="搜索产品名称、SKU或描述..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1"
          @input="debouncedSearch"
        />
        <USelect
          v-model="selectedCategory"
          :options="categoryOptions"
          placeholder="选择分类"
          class="w-48"
          @change="loadProducts"
        />
        <USelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="选择状态"
          class="w-32"
          @change="loadProducts"
        />
        <UButton variant="outline" @click="loadProducts">
          搜索
        </UButton>
      </div>
    </div>

    <!-- 产品列表 -->
    <div class="bg-white rounded-lg shadow">
      <UTable
        :rows="products"
        :columns="columns"
        :loading="loading"
        class="w-full"
      >
        <template #is_active-data="{ row }">
          <UBadge :color="row.is_active ? 'green' : 'red'" variant="subtle">
            {{ row.is_active ? '启用' : '停用' }}
          </UBadge>
        </template>

        <template #stock_status-data="{ row }">
          <UBadge
            :color="getStockStatusColor(row.stock_quantity, row.min_stock_level)"
            variant="subtle"
          >
            {{ getStockStatusText(row.stock_quantity, row.min_stock_level) }}
          </UBadge>
        </template>

        <template #unit_price-data="{ row }">
          ¥{{ row.unit_price.toFixed(2) }}
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-pencil"
              size="sm"
              variant="outline"
              @click="editProduct(row)"
            />
            <UButton
              :icon="row.is_active ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              size="sm"
              :color="row.is_active ? 'orange' : 'green'"
              variant="outline"
              @click="toggleProductStatus(row)"
            />
          </div>
        </template>
      </UTable>

      <!-- 分页 -->
      <div class="flex justify-between items-center p-4 border-t">
        <div class="text-sm text-gray-500">
          共 {{ pagination.total }} 条记录
        </div>
        <UPagination
          v-model="pagination.page"
          :page-count="pagination.limit"
          :total="pagination.total"
          @update:model-value="loadProducts"
        />
      </div>
    </div>

    <!-- 创建/编辑产品模态框 -->
    <UModal v-model="showCreateModal" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingProduct ? '编辑产品' : '新增产品' }}
          </h3>
        </template>

        <UForm
          :schema="productSchema"
          :state="productForm"
          class="space-y-4"
          @submit="submitProduct"
        >
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="产品名称" name="name" required>
              <UInput v-model="productForm.name" placeholder="请输入产品名称" />
            </UFormGroup>

            <UFormGroup label="SKU" name="sku" required>
              <UInput v-model="productForm.sku" placeholder="请输入SKU" :disabled="!!editingProduct" />
            </UFormGroup>
          </div>

          <UFormGroup label="产品描述" name="description">
            <UTextarea v-model="productForm.description" placeholder="请输入产品描述" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="产品分类" name="category_id" required>
              <USelect
                v-model="productForm.category_id"
                :options="categoryOptions"
                placeholder="请选择分类"
              />
            </UFormGroup>

            <UFormGroup label="单价" name="unit_price" required>
              <UInput
                v-model.number="productForm.unit_price"
                type="number"
                step="0.01"
                placeholder="请输入单价"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="库存数量" name="stock_quantity">
              <UInput
                v-model.number="productForm.stock_quantity"
                type="number"
                placeholder="请输入库存数量"
              />
            </UFormGroup>

            <UFormGroup label="最低库存" name="min_stock_level">
              <UInput
                v-model.number="productForm.min_stock_level"
                type="number"
                placeholder="请输入最低库存"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="状态" name="is_active">
            <UToggle v-model="productForm.is_active" />
            <span class="ml-2 text-sm text-gray-600">
              {{ productForm.is_active ? '启用' : '停用' }}
            </span>
          </UFormGroup>

          <div class="flex justify-end gap-3 pt-4">
            <UButton variant="outline" @click="showCreateModal = false">
              取消
            </UButton>
            <UButton type="submit" :loading="submitting">
              {{ editingProduct ? '更新' : '创建' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { debounce } from 'lodash-es'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()

// 表格列定义
const columns = [
  { key: 'name', label: '产品名称' },
  { key: 'sku', label: 'SKU' },
  { key: 'category_name', label: '分类' },
  { key: 'unit_price', label: '单价' },
  { key: 'stock_quantity', label: '库存' },
  { key: 'stock_status', label: '库存状态' },
  { key: 'is_active', label: '状态' },
  { key: 'actions', label: '操作' }
]

// 产品表单验证
const productSchema = z.object({
  name: z.string().min(1, '产品名称不能为空'),
  sku: z.string().min(1, 'SKU不能为空'),
  description: z.string().optional(),
  category_id: z.number().int().positive('请选择产品分类'),
  unit_price: z.number().positive('单价必须大于0'),
  stock_quantity: z.number().int().min(0, '库存数量不能为负数'),
  min_stock_level: z.number().int().min(0, '最低库存不能为负数'),
  is_active: z.boolean()
})

// 响应式数据
const products = ref([])
const categories = ref([])
const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const editingProduct = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')

// 分页数据
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// 产品表单数据
const productForm = ref({
  name: '',
  sku: '',
  description: '',
  category_id: null,
  unit_price: 0,
  stock_quantity: 0,
  min_stock_level: 0,
  is_active: true
})

// 计算属性
const categoryOptions = computed(() => [
  { label: '全部分类', value: '' },
  ...categories.value.map(cat => ({ label: cat.name, value: cat.id }))
])

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 'true' },
  { label: '停用', value: 'false' }
]

// 防抖搜索
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  loadProducts()
}, 500)

// 获取库存状态颜色
const getStockStatusColor = (stock, minLevel) => {
  if (stock === 0) { return 'red' }
  if (stock <= minLevel) { return 'orange' }
  return 'green'
}

// 获取库存状态文本
const getStockStatusText = (stock, minLevel) => {
  if (stock === 0) { return '缺货' }
  if (stock <= minLevel) { return '库存不足' }
  return '正常'
}

// 加载产品分类
const loadCategories = async () => {
  try {
    const { data } = await $fetch('/api/categories')
    categories.value = data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载产品列表
const loadProducts = async () => {
  loading.value = true
  try {
    const { data } = await $fetch('/api/products', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        category_id: selectedCategory.value,
        is_active: selectedStatus.value
      }
    })

    products.value = data.data.map(product => ({
      ...product,
      category_name: product.product_categories?.name || '未分类'
    }))

    pagination.value = data.pagination
  } catch (error) {
    toast.add({
      title: '加载失败',
      description: error.data?.message || '获取产品列表失败',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// 提交产品表单
const submitProduct = async () => {
  submitting.value = true
  try {
    if (editingProduct.value) {
      // 更新产品
      await $fetch(`/api/products/${editingProduct.value.id}`, {
        method: 'PUT',
        body: productForm.value
      })
      toast.add({
        title: '更新成功',
        description: '产品信息已更新',
        color: 'green'
      })
    } else {
      // 创建产品
      await $fetch('/api/products', {
        method: 'POST',
        body: productForm.value
      })
      toast.add({
        title: '创建成功',
        description: '产品已创建',
        color: 'green'
      })
    }

    showCreateModal.value = false
    resetForm()
    loadProducts()
  } catch (error) {
    toast.add({
      title: '操作失败',
      description: error.data?.message || '操作失败',
      color: 'red'
    })
  } finally {
    submitting.value = false
  }
}

// 编辑产品
const editProduct = (product) => {
  editingProduct.value = product
  productForm.value = {
    name: product.name,
    sku: product.sku,
    description: product.description || '',
    category_id: product.category_id,
    unit_price: product.unit_price,
    stock_quantity: product.stock_quantity,
    min_stock_level: product.min_stock_level,
    is_active: product.is_active
  }
  showCreateModal.value = true
}

// 切换产品状态
const toggleProductStatus = async (product) => {
  try {
    await $fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: {
        ...product,
        is_active: !product.is_active
      }
    })

    toast.add({
      title: '状态更新成功',
      description: `产品已${!product.is_active ? '启用' : '停用'}`,
      color: 'green'
    })

    loadProducts()
  } catch (error) {
    toast.add({
      title: '状态更新失败',
      description: error.data?.message || '更新产品状态失败',
      color: 'red'
    })
  }
}

// 重置表单
const resetForm = () => {
  editingProduct.value = null
  productForm.value = {
    name: '',
    sku: '',
    description: '',
    category_id: null,
    unit_price: 0,
    stock_quantity: 0,
    min_stock_level: 0,
    is_active: true
  }
}

// 监听模态框关闭
watch(showCreateModal, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// 页面加载时获取数据
onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>
