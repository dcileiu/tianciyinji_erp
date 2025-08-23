<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-color">产品管理</h1>
        <p class="text-muted-color">管理产品信息、库存设置和定价策略</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button 
          label="批量导入"
          icon="pi pi-upload"
          outlined
          @click="importProducts"
        />
        <PermissionWrapper :has-permission="canCreateProduct">
          <Button 
            label="新增产品"
            icon="pi pi-plus"
            @click="openCreateDialog"
          />
        </PermissionWrapper>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-blue-500/10 rounded-full">
              <i class="pi pi-box text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">总产品数</p>
              <p class="text-2xl font-semibold text-color">{{ productStats.totalProducts }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-green-500/10 rounded-full">
              <i class="pi pi-chart-line text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">库存价值</p>
              <p class="text-2xl font-semibold text-color">¥{{ formatCurrency(productStats.stockValue) }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-yellow-500/10 rounded-full">
              <i class="pi pi-exclamation-triangle text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">低库存产品</p>
              <p class="text-2xl font-semibold text-color">{{ productStats.lowStockCount }}</p>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center">
            <div class="p-3 bg-red-500/10 rounded-full">
              <i class="pi pi-times-circle text-red-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-color">缺货产品</p>
              <p class="text-2xl font-semibold text-color">{{ productStats.outOfStockCount }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">搜索筛选</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-color mb-2">搜索产品</label>
            <InputText
              v-model="searchQuery"
              placeholder="产品名称或编码"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-2">产品分类</label>
            <Dropdown
              v-model="categoryFilter"
              :options="categoryOptions"
              option-label="label"
              option-value="value"
              placeholder="全部分类"
              show-clear
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-2">库存状态</label>
            <Dropdown
              v-model="stockStatusFilter"
              :options="stockStatusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-color mb-2">产品状态</label>
            <Dropdown
              v-model="statusFilter"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>
          <div class="flex items-end">
            <Button
              label="重置筛选"
              icon="pi pi-filter-slash"
              outlined
              class="w-full"
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 产品列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">产品列表</h3>
          <div class="flex items-center gap-2">
            <Button
              label="批量操作"
              icon="pi pi-cog"
              outlined
              size="small"
            />
            <Button
              label="导出数据"
              icon="pi pi-download"
              outlined
              size="small"
            />
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          v-model:selection="selectedProducts"
          :value="filteredProducts"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          class="p-datatable-sm"
          selection-mode="multiple"
        >
          <Column selection-mode="multiple" :exportable="false"></Column>
          
          <Column field="product_no" header="产品编码" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm font-mono">
                {{ slotProps.data.product_no }}
              </code>
            </template>
          </Column>
          
          <Column field="name" header="产品名称" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <Avatar
                  v-if="slotProps.data.image"
                  :image="slotProps.data.image"
                  shape="circle"
                  size="small"
                />
                <Avatar
                  v-else
                  :label="slotProps.data.name.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <div>
                  <span class="font-medium">{{ slotProps.data.name }}</span>
                  <p class="text-xs text-muted-color">{{ slotProps.data.specification }}</p>
                </div>
              </div>
            </template>
          </Column>
          
          <Column field="category" header="分类" sortable>
            <template #body="slotProps">
              <Tag
                :value="getCategoryDisplayName(slotProps.data.category)"
                :severity="getCategorySeverity(slotProps.data.category)"
              />
            </template>
          </Column>
          
          <Column field="current_stock" header="当前库存" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <span 
                  :class="getStockClass(slotProps.data.current_stock, slotProps.data.min_stock)"
                  class="font-medium"
                >
                  {{ slotProps.data.current_stock }}
                </span>
                <span class="text-xs text-muted-color">{{ slotProps.data.unit }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="unit_price" header="单价" sortable>
            <template #body="slotProps">
              <span class="font-medium text-green-600">
                ¥{{ slotProps.data.unit_price.toLocaleString() }}
              </span>
            </template>
          </Column>
          
          <Column field="cost_price" header="成本价" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                ¥{{ slotProps.data.cost_price.toLocaleString() }}
              </span>
            </template>
          </Column>
          
          <Column field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </Column>
          
          <Column field="created_at" header="创建时间" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.created_at) }}
              </span>
            </template>
          </Column>
          
          <Column header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex items-center space-x-1">
                <Button
                  v-tooltip="'查看详情'"
                  icon="pi pi-eye"
                  rounded
                  text
                  size="small"
                  @click="viewProduct(slotProps.data)"
                />
                <Button
                  v-tooltip="'编辑'"
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="editProduct(slotProps.data)"
                />
                <Button
                  v-tooltip="'复制'"
                  icon="pi pi-copy"
                  rounded
                  text
                  size="small"
                  @click="duplicateProduct(slotProps.data)"
                />
                <Button
                  v-tooltip="'库存详情'"
                  icon="pi pi-chart-bar"
                  rounded
                  text
                  size="small"
                  @click="showStockDetails(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'active'"
                  v-tooltip="'停用'"
                  icon="pi pi-pause"
                  rounded
                  text
                  size="small"
                  severity="warning"
                  @click="toggleStatus(slotProps.data, 'inactive')"
                />
                <Button
                  v-else
                  v-tooltip="'启用'"
                  icon="pi pi-play"
                  rounded
                  text
                  size="small"
                  severity="success"
                  @click="toggleStatus(slotProps.data, 'active')"
                />
                <Button
                  v-tooltip="'删除'"
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDeleteProduct(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 产品对话框 -->
    <Dialog
      v-model:visible="showProductDialog"
      :header="editingProduct ? '编辑产品' : '新增产品'"
      :style="{ width: '900px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <TabView>
          <TabPanel header="基本信息" value="basic">
            <div class="space-y-4 pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">产品编码</label>
                  <InputText
                    v-model="productForm.product_no"
                    :disabled="true"
                    placeholder="系统自动生成"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">产品名称 *</label>
                  <InputText
                    v-model="productForm.name"
                    placeholder="请输入产品名称"
                    :disabled="dialogMode === 'view'"
                    required
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">产品分类 *</label>
                  <Dropdown
                    v-model="productForm.category"
                    :options="categoryOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="选择产品分类"
                    :disabled="dialogMode === 'view'"
                    required
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">计量单位 *</label>
                  <Dropdown
                    v-model="productForm.unit"
                    :options="unitOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="选择计量单位"
                    :disabled="dialogMode === 'view'"
                    required
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-color">产品规格</label>
                <InputText
                  v-model="productForm.specification"
                  placeholder="请输入产品规格"
                  :disabled="dialogMode === 'view'"
                />
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-color">产品描述</label>
                <Textarea
                  v-model="productForm.description"
                  placeholder="请输入产品描述"
                  :rows="3"
                  :disabled="dialogMode === 'view'"
                />
              </div>
            </div>
          </TabPanel>
          
          <TabPanel header="价格库存" value="pricing">
            <div class="space-y-4 pt-4">
              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">销售单价 *</label>
                  <InputNumber
                    v-model="productForm.unit_price"
                    mode="currency"
                    currency="CNY"
                    :min="0"
                    :disabled="dialogMode === 'view'"
                    required
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">成本价 *</label>
                  <InputNumber
                    v-model="productForm.cost_price"
                    mode="currency"
                    currency="CNY"
                    :min="0"
                    :disabled="dialogMode === 'view'"
                    required
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">当前库存</label>
                  <InputNumber
                    v-model="productForm.current_stock"
                    :min="0"
                    show-buttons
                    :disabled="dialogMode === 'view'"
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">最小库存</label>
                  <InputNumber
                    v-model="productForm.min_stock"
                    :min="0"
                    show-buttons
                    :disabled="dialogMode === 'view'"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">最大库存</label>
                  <InputNumber
                    v-model="productForm.max_stock"
                    :min="0"
                    show-buttons
                    :disabled="dialogMode === 'view'"
                  />
                </div>
              </div>
            </div>
          </TabPanel>
          
          <TabPanel header="其他信息" value="other">
            <div class="space-y-4 pt-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">产品状态</label>
                  <Dropdown
                    v-model="productForm.status"
                    :options="statusOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="选择产品状态"
                    :disabled="dialogMode === 'view'"
                  />
                </div>
                
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-color">供应商</label>
                  <InputText
                    v-model="productForm.supplier"
                    placeholder="请输入供应商"
                    :disabled="dialogMode === 'view'"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <label class="block text-sm font-medium text-color">备注</label>
                <Textarea
                  v-model="productForm.notes"
                  placeholder="请输入备注信息"
                  :rows="4"
                  :disabled="dialogMode === 'view'"
                />
              </div>
            </div>
          </TabPanel>
        </TabView>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            label="取消"
            icon="pi pi-times"
            outlined
            @click="closeProductDialog"
          />
          <Button
            v-if="dialogMode !== 'view'"
            label="保存"
            icon="pi pi-check"
            :loading="saving"
            @click="saveProduct"
          />
        </div>
      </template>
    </Dialog>
    
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import PermissionWrapper from '~/components/PermissionWrapper.vue'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '产品管理 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showProductDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const editingProduct = ref(null as any)
const selectedProducts = ref([])
const confirm = useConfirm()

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
  notes: ''
})

// 统计数据
const productStats = ref({
  totalProducts: 1258,
  stockValue: 2850000,
  lowStockCount: 23,
  outOfStockCount: 5
})

// 选项数据
const categoryOptions = ref([
  { label: '原材料', value: 'raw_material' },
  { label: '半成品', value: 'semi_finished' },
  { label: '成品', value: 'finished_product' },
  { label: '配件', value: 'accessory' }
])

const unitOptions = ref([
  { label: '件', value: 'pcs' },
  { label: '个', value: 'piece' },
  { label: '套', value: 'set' },
  { label: '米', value: 'm' },
  { label: '千克', value: 'kg' }
])

const stockStatusOptions = ref([
  { label: '正常', value: 'normal' },
  { label: '低库存', value: 'low' },
  { label: '缺货', value: 'out' }
])

const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
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
    notes: '主要用于旗舰手机'
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
    notes: '符合安全标准'
  }
])

// 计算属性
const filteredProducts = computed(() => {
  let result = mockProducts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(product =>
      product.product_no.toLowerCase().includes(query)
      || product.name.toLowerCase().includes(query)
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
  accessory: '配件'
}

const categorySeverityMap: Record<string, string> = {
  raw_material: 'info',
  semi_finished: 'warning',
  finished_product: 'success',
  accessory: 'secondary'
}

const statusMap: Record<string, string> = {
  active: '启用',
  inactive: '停用'
}

const statusSeverityMap: Record<string, string> = {
  active: 'success',
  inactive: 'danger'
}

// 方法
const getCategoryDisplayName = (category: string) => categoryMap[category] || category
const getCategorySeverity = (category: string) => categorySeverityMap[category] || 'info'
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'info'

const getStockClass = (currentStock: number, minStock: number) => {
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
    notes: ''
  }
  showProductDialog.value = true
}

const viewProduct = (product: any) => {
  editingProduct.value = product
  dialogMode.value = 'view'
  Object.assign(productForm.value, product)
  showProductDialog.value = true
}

const editProduct = (product: any) => {
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
    name: `${product.name} (副本)`
  })
  showProductDialog.value = true
}

const showStockDetails = (product: any) => {
  console.log('显示库存详情:', product.name)
}

const toggleStatus = async (product: any, newStatus: string) => {
  confirm.require({
    message: `确定要${newStatus === 'active' ? '启用' : '停用'}产品 ${product.name} 吗？`,
    header: newStatus === 'active' ? '启用产品' : '停用产品',
    icon: 'pi pi-question',
    accept: async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const index = mockProducts.value.findIndex(p => p.id === product.id)
        if (index !== -1) {
          mockProducts.value[index].status = newStatus
        }
      }
      catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}

const confirmDeleteProduct = (product: any) => {
  confirm.require({
    message: `确定要删除产品 ${product.name} 吗？`,
    header: '确认删除',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      deleteProduct(product.id)
    }
  })
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
        image: null
      }
      mockProducts.value.push(newProduct as any)
    }
    else if (dialogMode.value === 'edit') {
      const index = mockProducts.value.findIndex(p => p.id === editingProduct.value.id)
      if (index !== -1) {
        mockProducts.value[index] = {
          ...mockProducts.value[index],
          ...productForm.value
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
