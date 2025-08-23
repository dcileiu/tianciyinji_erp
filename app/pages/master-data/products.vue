<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">产品管理</h1>
        <p class="text-muted-color">管理产品信息、库存和定价</p>
      </div>
      <div>
        <Button
          label="新增产品"
          icon="pi pi-plus"
          class="create-btn"
          @click="openProductModal"
        />
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card class="mb-6">
      <template #content>
        <div class="flex gap-4 items-center flex-wrap p-4">
          <div class="flex-1 min-w-80">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <InputText
                v-model="searchKeyword"
                placeholder="搜索产品名称、编码..."
                class="w-full"
              />
            </span>
          </div>

          <div class="flex gap-4 items-center">
            <Dropdown
              v-model="selectedCategory"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="产品分类"
              class="w-40"
            />
            <Dropdown
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="产品状态"
              class="w-40"
            />
            <Button
              label="重置"
              icon="pi pi-refresh"
              outlined
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 统计信息 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-surface-0 border border-surface rounded-border p-6 text-center">
        <div class="text-2xl font-semibold text-primary mb-2">{{ filteredProducts.length }}</div>
        <div class="text-sm text-muted-color">总产品数</div>
      </div>
      <div class="bg-surface-0 border border-surface rounded-border p-6 text-center">
        <div class="text-2xl font-semibold text-green-600 mb-2">{{ activeProductsCount }}</div>
        <div class="text-sm text-muted-color">在售产品</div>
      </div>
      <div class="bg-surface-0 border border-surface rounded-border p-6 text-center">
        <div class="text-2xl font-semibold text-orange-600 mb-2">{{ lowStockCount }}</div>
        <div class="text-sm text-muted-color">库存预警</div>
      </div>
      <div class="bg-surface-0 border border-surface rounded-border p-6 text-center">
        <div class="text-2xl font-semibold text-red-600 mb-2">{{ outOfStockCount }}</div>
        <div class="text-sm text-muted-color">缺货产品</div>
      </div>
    </div>

    <!-- 产品列表 -->
    <Card>
      <template #content>
        <DataTable
          :value="filteredProducts"
          :loading="loading"
          :paginator="true"
          :rows="pageSize"
          :total-records="filteredProducts.length"
          :rows-per-page-options="[10, 20, 50]"
          striped-rows
          show-gridlines
          responsive-layout="scroll"
          class="p-4"
        >
          <template #empty>
            <div class="text-center py-12 text-muted-color">
              <i class="pi pi-inbox text-6xl mb-4 opacity-50"></i>
              <h3 class="text-lg mb-2">暂无产品</h3>
              <p class="mb-4">开始创建您的第一个产品</p>
                    <Button 
                label="新增产品"
                icon="pi pi-plus"
                @click="openProductModal"
              />
            </div>
          </template>

          <Column field="name" header="产品名称" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-3">
                <Avatar
                  :label="slotProps.data.name.charAt(0)"
                  shape="circle"
                  size="large"
                  class="bg-primary text-primary-contrast"
                />
                <div class="flex-1">
                  <div class="font-medium text-color mb-1">{{ slotProps.data.name }}</div>
                  <div class="text-sm text-muted-color">{{ slotProps.data.description }}</div>
            </div>
          </div>
            </template>
          </Column>

          <Column field="code" header="产品编码" :sortable="true">
            <template #body="slotProps">
              <span class="font-mono bg-surface-100 px-2 py-1 rounded text-primary text-sm">
                {{ slotProps.data.code }}
              </span>
            </template>
          </Column>
      
          <Column field="price" header="价格" :sortable="true">
            <template #body="slotProps">
              <span class="font-semibold text-green-600">
                ¥{{ slotProps.data.price.toLocaleString() }}
              </span>
            </template>
          </Column>

          <Column field="stock" header="库存" :sortable="true">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ slotProps.data.stock }}</span>
                <Tag 
                  v-if="slotProps.data.stock <= 10"
                  value="库存不足" 
                  severity="warn" 
                  class="text-xs"
            />
          </div>
            </template>
          </Column>

          <Column field="status" header="状态" :sortable="true">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.status === 'active' ? '在售' : '停售'"
                :severity="slotProps.data.status === 'active' ? 'success' : 'danger'"
              />
            </template>
          </Column>

          <Column field="updated_at" header="更新时间" :sortable="true">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.updated_at) }}
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
                  @click="viewProduct(slotProps.data)"
            />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  outlined
                  rounded
                  size="small"
                  @click="editProduct(slotProps.data)"
                />
                <Button
                  v-tooltip="'复制'"
                  icon="pi pi-copy"
                  outlined
                  rounded
                  size="small"
                  @click="copyProduct(slotProps.data)"
                />
                <Button
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  outlined
                  rounded
                  size="small"
                  severity="danger"
                  @click="confirmDelete(slotProps.data)"
            />
          </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 产品详情/编辑对话框 -->
    <Dialog
      v-model:visible="showProductModal"
      :header="modalTitle"
      modal
      :style="{ width: '600px' }"
      class="product-modal"
    >
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="productCode" class="text-sm font-medium text-color">产品编码</label>
            <InputText
              id="productCode"
              v-model="currentProduct.code"
              placeholder="输入产品编码"
              :disabled="isEditing"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="productName" class="text-sm font-medium text-color">产品名称</label>
            <InputText
              id="productName"
              v-model="currentProduct.name"
              placeholder="输入产品名称"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="productCategory" class="text-sm font-medium text-color">产品分类</label>
            <Dropdown
              id="productCategory"
              v-model="currentProduct.category"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="选择产品分类"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="productStatus" class="text-sm font-medium text-color">状态</label>
            <Dropdown
              id="productStatus"
              v-model="currentProduct.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="选择状态"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="productPrice" class="text-sm font-medium text-color">价格</label>
            <InputNumber
              id="productPrice"
              v-model="currentProduct.price"
              mode="currency"
              currency="CNY"
              locale="zh-CN"
              placeholder="输入价格"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="productStock" class="text-sm font-medium text-color">库存数量</label>
            <InputNumber
              id="productStock"
              v-model="currentProduct.stock"
              placeholder="输入库存数量"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="productDescription" class="text-sm font-medium text-color">产品描述</label>
          <Textarea
            id="productDescription"
            v-model="currentProduct.description"
            placeholder="输入产品描述"
            rows="3"
          />
        </div>
        </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            outlined
            @click="closeProductModal"
          />
          <Button
            :label="isEditing ? '更新' : '创建'"
            :loading="saving"
            @click="saveProduct"
          />
        </div>
      </template>
  </Dialog>

    <!-- 删除确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面状态
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const pageSize = ref(10)

// 对话框状态
const showProductModal = ref(false)
const isEditing = ref(false)
const confirm = useConfirm()

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
  updated_at: new Date()
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
    updated_at: new Date('2025-01-15')
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
    updated_at: new Date('2025-01-16')
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
    updated_at: new Date('2025-01-17')
  }
])

// 分类选项
const categoryOptions = [
  { label: '全部分类', value: '' },
  { label: '电子产品', value: 'electronics' },
  { label: '家具', value: 'furniture' },
  { label: '服装', value: 'clothing' },
  { label: '食品', value: 'food' }
]

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '在售', value: 'active' },
  { label: '停售', value: 'inactive' }
]

// 计算属性
const filteredProducts = computed(() => {
  let result = products.value

  if (searchKeyword.value) {
    result = result.filter(product =>
      product.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
      || product.code.toLowerCase().includes(searchKeyword.value.toLowerCase())
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
    day: '2-digit'
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
    updated_at: new Date()
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
    updated_at: new Date()
  }
  showProductModal.value = true
}

const confirmDelete = (product: any) => {
  confirm.require({
    message: `确定要删除产品 "${product.name}" 吗？此操作不可撤销。`,
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteProduct(product.id)
    }
  })
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
          updated_at: new Date()
        }
      }
    }
    else {
      // 创建新产品
      const newProduct = {
        ...currentProduct.value,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date()
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
