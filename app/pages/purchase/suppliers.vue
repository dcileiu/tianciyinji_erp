<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">供应商管理</h1>
        <p class="text-muted-color mt-1">管理供应商基础信息，维护供应商关系和合作协议</p>
      </div>
      <Button @click="openCreateForm" />
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium text-color mb-2"> 搜索供应商 </label>
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <i class="pi pi-search"></i>
            <!-- /InputIcon -->
            <Input v-model="searchQuery" placeholder="供应商名称、编号..." class="w-full" />
            <!-- /IconField -->
          </div>

          <!-- 供应商类型筛选 -->
          <div>
            <label class="block text-sm font-medium text-color mb-2"> 供应商类型 </label>
            <Select
              v-model="typeFilter"
              :options="typeOptions"
              option-option-value="value"
              placeholder="全部类型"
              show-clear
              class="w-full"
            />
          </div>

          <!-- 合作状态筛选 -->
          <div>
            <label class="block text-sm font-medium text-color mb-2"> 合作状态 </label>
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              option-option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>

          <!-- 评级筛选 -->
          <div>
            <label class="block text-sm font-medium text-color mb-2"> 供应商评级 </label>
            <Select
              v-model="ratingFilter"
              :options="ratingOptions"
              option-option-value="value"
              placeholder="全部评级"
              show-clear
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 供应商统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">总供应商数</p>
              <p class="text-2xl font-bold text-color">{{ stats.totalSuppliers }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 -lg flex items-center justify-center">
              <i class="pi pi-building text-blue-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">活跃供应商</p>
              <p class="text-2xl font-bold text-green-600">{{ stats.activeSuppliers }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 -lg flex items-center justify-center">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">A级供应商</p>
              <p class="text-2xl font-bold text-orange-600">{{ stats.aGradeSuppliers }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 -lg flex items-center justify-center">
              <i class="pi pi-star text-orange-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">本月新增</p>
              <p class="text-2xl font-bold text-purple-600">{{ stats.newThisMonth }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 -lg flex items-center justify-center">
              <i class="pi pi-plus text-purple-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 供应商列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">供应商列表</h3>
          <div class="flex items-center gap-2">
            <Button size="sm" />
            <Button size="sm" />
          </div>
        </div>
      </template>

      <template #content>
        <Table
          v-model:selection="selectedSuppliers"
          :value="filteredSuppliers"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          selection-mode="multiple"
        >
          <template #loading>
            <div class="p-6">
              <div v-for="i in 5" :key="i" class="flex align-items-center gap-4 mb-4">
                <Skeleton shape="circle" size="3rem" />
                <div class="flex-1">
                  <Skeleton width="100%" height="1.5rem" class="mb-2" />
                  <Skeleton width="70%" height="1rem" />
                </div>
                <Skeleton width="8rem" height="1.5rem" />
                <Skeleton width="6rem" height="1.5rem" />
              </div>
            </div>
          </template>
          <TableHead selection-mode="multiple" :exportable="false"/>

          <TableHead field="supplier_no" header="供应商编号" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 text-sm font-mono">
                {{ slotProps.data.supplier_no }}
              </code>
            </template>
          </TableHead>

          <TableHead field="name" header="供应商名称" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <Avatar :shape="'circle'" size="sm" />
                <div>
                  <span class="font-medium">{{ slotProps.data.name }}</span>
                  <p class="text-xs text-muted-color">{{ slotProps.data.contact_person }}</p>
                </div>
              </div>
            </template>
          </TableHead>

          <TableHead field="type" header="供应商类型" sortable>
            <template #body="slotProps">
              <Tag :value="getTypeDisplayName(slotProps.data.type)" :severity="getTypeSeverity(slotProps.data.type)" />
            </template>
          </TableHead>

          <TableHead field="phone" header="联系电话" sortable>
            <template #body="slotProps">
              <span class="text-sm">{{ slotProps.data.phone }}</span>
            </template>
          </TableHead>

          <TableHead field="email" header="邮箱" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">{{ slotProps.data.email }}</span>
            </template>
          </TableHead>

          <TableHead field="rating" header="评级" sortable>
            <template #body="slotProps">
              <div class="flex align-items-center gap-2">
                <Tag :value="slotProps.data.rating + '级'" :severity="getRatingSeverity(slotProps.data.rating)" />
                <!-- Rating 组件已移除 -->
              </div>
            </template>
          </TableHead>

          <TableHead field="total_orders" header="订单总数" sortable>
            <template #body="slotProps">
              <span class="font-medium text-blue-600">{{ slotProps.data.total_orders }}</span>
            </template>
          </TableHead>

          <TableHead field="total_amount" header="累计金额" sortable>
            <template #body="slotProps">
              <span class="font-medium text-green-600"> ¥{{ slotProps.data.total_amount.toLocaleString() }} </span>
            </template>
          </TableHead>

          <TableHead field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="getStatusDisplayName(slotProps.data.status)"
                :severity="getStatusSeverity(slotProps.data.status)"
              />
            </template>
          </TableHead>

          <TableHead header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex align-items-center gap-1">
                <Button
                  text
                  size="sm"
                  @click="viewSupplier(slotProps.data)"
                />
                <Button
                  text
                  size="sm"
                  @click="editSupplier(slotProps.data)"
                />
                <Button
                  text
                  size="sm"
                  @click="viewOrders(slotProps.data)"
                />
                <Button
                  text
                  size="sm"
                  @click="rateSupplier(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'active'"
                  text
                  size="sm"
                  severity="warning"
                  @click="toggleStatus(slotProps.data, 'suspended')"
                />
                <Button
                  v-else
                  text
                  size="sm"
                  severity="success"
                  @click="toggleStatus(slotProps.data, 'active')"
                />
              </div>
            </template>
          </TableHead>
        </Table>
      </template>
    </Card>

    <!-- 供应商表单对话框 -->
    <Dialog
      v-model:visible="showSupplierDialog"
      :header="editingSupplier ? '编辑供应商' : '新增供应商'"
      :style="{ width: '900px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">供应商编号</label>
              <Input v-model="supplierForm.supplier_no" :disabled="true" placeholder="系统自动生成" />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">供应商名称 *</label>
              <Input
                v-model="supplierForm.name"
                placeholder="请输入供应商名称"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">供应商类型 *</label>
              <Select
                v-model="supplierForm.type"
                :options="typeOptions"
                option-option-value="value"
                placeholder="选择供应商类型"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">评级</label>
              <Select
                v-model="supplierForm.rating"
                :options="ratingOptions"
                option-option-value="value"
                placeholder="选择评级"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">联系人</label>
              <Input
                v-model="supplierForm.contact_person"
                placeholder="请输入联系人姓名"
                :disabled="dialogMode === 'view'"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">联系电话</label>
              <Input v-model="supplierForm.phone" placeholder="请输入联系电话" :disabled="dialogMode === 'view'" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">邮箱地址</label>
              <Input v-model="supplierForm.email" placeholder="请输入邮箱地址" :disabled="dialogMode === 'view'" />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">合作状态</label>
              <Select
                v-model="supplierForm.status"
                :options="statusOptions"
                option-option-value="value"
                placeholder="选择状态"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">详细地址</label>
            <Textarea
              v-model="supplierForm.address"
              placeholder="请输入详细地址"
              :rows="2"
              :disabled="dialogMode === 'view'"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">备注信息</label>
            <Textarea
              v-model="supplierForm.notes"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeSupplierDialog" />
          <Button
            v-if="dialogMode !== 'view'"
            :loading="saving"
            @click="saveSupplier"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// import Card from 'primevue/card' // 已移除PrimeVue导入
// import Button from 'primevue/button' // 已移除PrimeVue导入
// import InputText from 'primevue/inputtext' // 已移除PrimeVue导入
// import IconField from 'primevue/iconfield' // 已移除PrimeVue导入
// import InputIcon from 'primevue/inputicon' // 已移除PrimeVue导入
// import Dropdown from 'primevue/dropdown' // 已移除PrimeVue导入
// import Textarea from 'primevue/textarea' // 已移除PrimeVue导入
// import DataTable from 'primevue/datatable' // 已移除PrimeVue导入
// import Column from 'primevue/column' // 已移除PrimeVue导入
// import Tag from 'primevue/tag' // 已移除PrimeVue导入
// import Avatar from 'primevue/avatar' // 已移除PrimeVue导入
// import Rating from 'primevue/rating' // 已移除PrimeVue导入
// import Dialog from 'primevue/dialog' // 已移除PrimeVue导入
// import Skeleton from 'primevue/skeleton' // 已移除PrimeVue导入
// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '供应商管理 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showSupplierDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const editingSupplier = ref(null as any)
const selectedSuppliers = ref([])

// 筛选条件
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const ratingFilter = ref('')

// 表单数据
const supplierForm = ref({
  supplier_no: '',
  name: '',
  type: '',
  rating: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  notes: '',
})

// 选项数据
const typeOptions = ref([
  { label: '原材料供应商', value: 'raw_material' },
  { label: '设备供应商', value: 'equipment' },
  { label: '服务供应商', value: 'service' },
  { label: '物流供应商', value: 'logistics' },
])

const statusOptions = ref([
  { label: '正常合作', value: 'active' },
  { label: '暂停合作', value: 'suspended' },
  { label: '终止合作', value: 'terminated' },
  { label: '潜在供应商', value: 'potential' },
])

const ratingOptions = ref([
  { label: 'A级', value: 'A' },
  { label: 'B级', value: 'B' },
  { label: 'C级', value: 'C' },
  { label: 'D级', value: 'D' },
])

// 统计数据
const stats = ref({
  totalSuppliers: 156,
  activeSuppliers: 128,
  aGradeSuppliers: 45,
  newThisMonth: 8,
})

// 模拟数据
const mockSuppliers = ref([
  {
    id: '1',
    supplier_no: 'SUP-001',
    name: 'ABC材料供应公司',
    type: 'raw_material',
    rating: 'A',
    contact_person: '王经理',
    phone: '010-12345678',
    email: 'wang@abc.com',
    address: '北京市朝阳区工业园区',
    total_orders: 45,
    total_amount: 850000,
    status: 'active',
    created_at: new Date('2024-01-15'),
    notes: '优质供应商，长期合作伙伴',
  },
  {
    id: '2',
    supplier_no: 'SUP-002',
    name: 'XYZ设备制造厂',
    type: 'equipment',
    rating: 'B',
    contact_person: '李总',
    phone: '021-87654321',
    email: 'li@xyz.com',
    address: '上海市浦东新区制造基地',
    total_orders: 28,
    total_amount: 650000,
    status: 'active',
    created_at: new Date('2024-01-10'),
    notes: '设备质量稳定，价格合理',
  },
])

// 计算属性
const filteredSuppliers = computed(() => {
  let result = mockSuppliers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      supplier =>
        supplier.supplier_no.toLowerCase().includes(query)
        || supplier.name.toLowerCase().includes(query)
        || supplier.contact_person.toLowerCase().includes(query),
    )
  }

  if (typeFilter.value) {
    result = result.filter(supplier => supplier.type === typeFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(supplier => supplier.status === statusFilter.value)
  }

  if (ratingFilter.value) {
    result = result.filter(supplier => supplier.rating === ratingFilter.value)
  }

  return result
})

// 映射对象
const typeMap: Record<string, string> = {
  raw_material: '原材料供应商',
  equipment: '设备供应商',
  service: '服务供应商',
  logistics: '物流供应商',
}

const typeSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  raw_material: 'secondary',
  equipment: 'default',
  service: 'outline',
  logistics: 'secondary',
}

const statusMap: Record<string, string> = {
  active: '正常合作',
  suspended: '暂停合作',
  terminated: '终止合作',
  potential: '潜在供应商',
}

const statusSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  active: 'default',
  suspended: 'outline',
  terminated: 'destructive',
  potential: 'secondary',
}

const ratingSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  A: 'default',
  B: 'secondary',
  C: 'outline',
  D: 'destructive',
}

// 方法
const getTypeDisplayName = (type: string) => typeMap[type] || type
const getTypeSeverity = (type: string) => typeSeverityMap[type] || 'secondary'
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'secondary'
const getRatingSeverity = (rating: string) => ratingSeverityMap[rating] || 'secondary'

const openCreateForm = () => {
  editingSupplier.value = null
  dialogMode.value = 'create'
  supplierForm.value = {
    supplier_no: `SUP-${Date.now()}`,
    name: '',
    type: '',
    rating: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
    notes: '',
  }
  showSupplierDialog.value = true
}

const viewSupplier = (supplier: any) => {
  editingSupplier.value = supplier
  dialogMode.value = 'view'
  Object.assign(supplierForm.value, supplier)
  showSupplierDialog.value = true
}

const editSupplier = (supplier: any) => {
  editingSupplier.value = supplier
  dialogMode.value = 'edit'
  Object.assign(supplierForm.value, supplier)
  showSupplierDialog.value = true
}

const viewOrders = (supplier: any) => {
  console.log('查看订单:', supplier.name)
}

const rateSupplier = (supplier: any) => {
  console.log('评级供应商:', supplier.name)
}

const toggleStatus = async (supplier: any, newStatus: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const index = mockSuppliers.value.findIndex(s => s.id === supplier.id)
    if (index !== -1 && mockSuppliers.value[index]) {
      mockSuppliers.value[index]!.status = newStatus
    }
  }
  catch (error) {
    console.error('操作失败:', error)
  }
}

const closeSupplierDialog = () => {
  showSupplierDialog.value = false
  editingSupplier.value = null
}

const saveSupplier = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (dialogMode.value === 'create') {
      const newSupplier = {
        id: Date.now().toString(),
        ...supplierForm.value,
        total_orders: 0,
        total_amount: 0,
        created_at: new Date(),
      }
      mockSuppliers.value.push(newSupplier)
    }
    else if (dialogMode.value === 'edit') {
      const index = mockSuppliers.value.findIndex(s => s.id === editingSupplier.value?.id)
      if (index !== -1 && mockSuppliers.value[index]) {
        mockSuppliers.value[index] = {
          ...mockSuppliers.value[index],
          ...supplierForm.value,
          id: mockSuppliers.value[index]!.id,
          total_orders: mockSuppliers.value[index]!.total_orders,
          total_amount: mockSuppliers.value[index]!.total_amount,
          created_at: mockSuppliers.value[index]!.created_at,
        }
      }
    }

    closeSupplierDialog()
  }
  catch (error) {
    console.error('保存供应商失败:', error)
  }
  finally {
    saving.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载数据
})
</script>
