<template>
  <div class="container mx-auto py-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">供应商管理</h1>
        <p class="text-muted-foreground">管理供应商信息和合作关系</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        新增供应商
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>搜索筛选</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label for="search">搜索供应商</Label>
            <Input
              id="search"
              v-model="searchQuery"
              placeholder="输入供应商名称或编码"
              class="mt-1"
            />
          </div>
          <div>
            <Label for="status">状态</Label>
            <select
              id="status"
              v-model="selectedStatus"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">停用</option>
            </select>
          </div>
          <div>
            <Label for="type">供应商类型</Label>
            <select
              id="type"
              v-model="selectedType"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部类型</option>
              <option value="raw_material">原材料</option>
              <option value="equipment">设备</option>
              <option value="service">服务</option>
              <option value="logistics">物流</option>
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

    <!-- 供应商列表 -->
    <Card>
      <CardHeader>
        <CardTitle>供应商列表</CardTitle>
        <CardDescription>
          共 {{ filteredSuppliers.length }} 个供应商
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          加载中...
        </div>
        <div v-else-if="filteredSuppliers.length === 0" class="text-center py-8">
          <Truck class="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p class="text-muted-foreground">暂无供应商数据</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="supplier in filteredSuppliers"
            :key="supplier.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Truck class="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 class="font-semibold">{{ supplier.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ supplier.supplier_no }}</p>
                <p class="text-sm text-muted-foreground">{{ supplier.contact_person }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <div class="flex items-center space-x-2">
                  <Badge :variant="supplier.status === 'active' ? 'default' : 'secondary'">
                    {{ getStatusText(supplier.status) }}
                  </Badge>
                  <Badge variant="outline">
                    {{ getTypeText(supplier.type) }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{ supplier.phone }}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="viewSupplier(supplier)">
                    <Eye class="mr-2 h-4 w-4" />
                    查看详情
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="editSupplier(supplier)">
                    <Edit class="mr-2 h-4 w-4" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    @click="deleteSupplier(supplier)"
                    class="text-destructive"
                  >
                    <Trash2 class="mr-2 h-4 w-4" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 创建/编辑供应商对话框 -->
    <Dialog v-model:open="showSupplierDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{ editingSupplier ? '编辑供应商' : '新增供应商' }}</DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div>
            <Label for="supplier-name">供应商名称 <span class="text-destructive">*</span></Label>
            <Input
              id="supplier-name"
              v-model="supplierForm.name"
              placeholder="请输入供应商名称"
              class="mt-1"
            />
          </div>
          
          <div>
            <Label for="contact-person">联系人 <span class="text-destructive">*</span></Label>
            <Input
              id="contact-person"
              v-model="supplierForm.contact_person"
              placeholder="请输入联系人姓名"
              class="mt-1"
            />
          </div>
          
          <div>
            <Label for="phone">联系电话 <span class="text-destructive">*</span></Label>
            <Input
              id="phone"
              v-model="supplierForm.phone"
              placeholder="请输入联系电话"
              class="mt-1"
            />
          </div>
          
          <div>
            <Label for="type">供应商类型 <span class="text-destructive">*</span></Label>
            <select
              id="type"
              v-model="supplierForm.type"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">请选择类型</option>
              <option value="raw_material">原材料</option>
              <option value="equipment">设备</option>
              <option value="service">服务</option>
              <option value="logistics">物流</option>
            </select>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" @click="showSupplierDialog = false">
            取消
          </Button>
          <Button @click="handleSubmit" :disabled="submitting">
            <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingSupplier ? '更新' : '创建' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, Search, MoreHorizontal, Truck, 
  Eye, Edit, Trash2, Loader2 
} from 'lucide-vue-next'

// 导入组件
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Badge from '~/components/ui/Badge.vue'
import Dialog from '~/components/ui/Dialog.vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'

// 使用 composables
const { suppliers, loading, getSuppliers } = useSuppliers()

// 响应式数据
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedType = ref('')
const showSupplierDialog = ref(false)
const editingSupplier = ref(null)
const submitting = ref(false)

// 表单数据
const supplierForm = reactive({
  name: '',
  contact_person: '',
  phone: '',
  type: ''
})

// 计算属性
const filteredSuppliers = computed(() => {
  let result = suppliers.value || []
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(supplier => 
      supplier.name.toLowerCase().includes(query) ||
      supplier.supplier_no.toLowerCase().includes(query)
    )
  }
  
  if (selectedStatus.value) {
    result = result.filter(supplier => supplier.status === selectedStatus.value)
  }
  
  if (selectedType.value) {
    result = result.filter(supplier => supplier.type === selectedType.value)
  }
  
  return result
})

// 方法
const openCreateDialog = () => {
  editingSupplier.value = null
  resetForm()
  showSupplierDialog.value = true
}

const editSupplier = (supplier: any) => {
  editingSupplier.value = supplier
  Object.assign(supplierForm, supplier)
  showSupplierDialog.value = true
}

const viewSupplier = (supplier: any) => {
  console.log('查看供应商:', supplier)
}

const deleteSupplier = async (supplier: any) => {
  if (confirm(`确定要删除供应商 "${supplier.name}" 吗？`)) {
    console.log('删除供应商:', supplier)
  }
}

const handleSubmit = async () => {
  console.log('提交表单:', supplierForm)
  showSupplierDialog.value = false
}

const resetForm = () => {
  Object.assign(supplierForm, {
    name: '',
    contact_person: '',
    phone: '',
    type: ''
  })
}

const handleSearch = () => {
  // 搜索逻辑已在 computed 中实现
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '活跃',
    inactive: '停用',
    suspended: '暂停',
    terminated: '终止',
    potential: '潜在'
  }
  return texts[status] || status
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    raw_material: '原材料',
    equipment: '设备',
    service: '服务',
    logistics: '物流'
  }
  return texts[type] || type
}

// 页面加载时获取数据
onMounted(async () => {
  try {
    const result = await getSuppliers()
    suppliers.value = result.data || []
  } catch (error) {
    console.error('获取供应商数据失败:', error)
  }
})

// 页面元数据
definePageMeta({
  layout: 'default'
})
</script> 