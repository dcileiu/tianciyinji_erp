<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-color">客户档案管理</h1>
        <p class="text-muted-color mt-1">管理客户基础信息，维护客户关系和联系方式</p>
      </div>
      <Button @click="openCreateForm" />
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold text-color">搜索筛选</h3>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium text-color mb-2"> 搜索客户 </label>
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <i class="pi pi-search"></i>
            <!-- /InputIcon -->
            <Input v-model="searchQuery" placeholder="客户名称、编号..." class="w-full" />
            <!-- /IconField -->
          </div>

          <!-- 客户类型筛选 -->
          <div>
            <label class="block text-sm font-medium text-color mb-2"> 客户类型 </label>
            <Select
              v-model="typeFilter"
              :options="typeOptions"
              option-option-value="value"
              placeholder="全部类型"
              show-clear
              class="w-full"
            />
          </div>

          <!-- 地区筛选 -->
          <div>
            <label class="block text-sm font-medium text-color mb-2"> 所在地区 </label>
            <Select
              v-model="regionFilter"
              :options="regionOptions"
              option-option-value="value"
              placeholder="全部地区"
              show-clear
              class="w-full"
            />
          </div>

          <!-- 状态筛选 -->
          <div>
            <label class="block text-sm font-medium text-color mb-2"> 客户状态 </label>
            <Select
              v-model="statusFilter"
              :options="statusOptions"
              option-option-value="value"
              placeholder="全部状态"
              show-clear
              class="w-full"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 客户统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">总客户数</p>
              <p class="text-2xl font-bold text-blue-600">{{ customerStats.total }}</p>
              <div class="mt-2">
                <span class="text-xs text-blue-600">↗ +12</span>
                <span class="text-xs text-muted-color ml-2">本月新增</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-blue-100 -lg flex items-center justify-center">
              <i class="pi pi-users text-blue-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">活跃客户</p>
              <p class="text-2xl font-bold text-green-600">{{ customerStats.active }}</p>
              <div class="mt-2">
                <span class="text-xs text-green-600"
                >{{ Math.round((customerStats.active / customerStats.total) * 100) }}%</span
                >
                <span class="text-xs text-muted-color ml-2">活跃率</span>
              </div>
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
              <p class="text-sm text-muted-color">企业客户</p>
              <p class="text-2xl font-bold text-purple-600">{{ customerStats.enterprise }}</p>
              <div class="mt-2">
                <span class="text-xs text-purple-600"
                >{{ Math.round((customerStats.enterprise / customerStats.total) * 100) }}%</span
                >
                <span class="text-xs text-muted-color ml-2">占比</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-purple-100 -lg flex items-center justify-center">
              <i class="pi pi-building text-purple-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-muted-color">潜在客户</p>
              <p class="text-2xl font-bold text-orange-600">{{ customerStats.potential }}</p>
              <div class="mt-2">
                <span class="text-xs text-orange-600"
                >{{ Math.round((customerStats.potential / customerStats.total) * 100) }}%</span
                >
                <span class="text-xs text-muted-color ml-2">占比</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-orange-100 -lg flex items-center justify-center">
              <i class="pi pi-eye text-orange-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 客户列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">客户列表</h3>
          <div class="flex items-center gap-2">
            <Button size="sm" />
            <Button size="sm" />
          </div>
        </div>
      </template>

      <template #content>
        <Table
          v-model:selection="selectedCustomers"
          :value="filteredCustomers"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          class="p-datatable-sm"
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

          <TableHead field="customer_no" header="客户编号" sortable>
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 text-sm font-mono">
                {{ slotProps.data.customer_no }}
              </code>
            </template>
          </TableHead>

          <TableHead field="name" header="客户名称" sortable>
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

          <TableHead field="type" header="客户类型" sortable>
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

          <TableHead field="region" header="地区" sortable>
            <template #body="slotProps">
              <span class="text-sm">{{ getRegionDisplayName(slotProps.data.region) }}</span>
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

          <TableHead field="created_at" header="创建时间" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.created_at) }}
              </span>
            </template>
          </TableHead>

          <TableHead header="操作" :exportable="false">
            <template #body="slotProps">
              <div class="flex align-items-center gap-1">
                <Button
                  text
                  size="sm"
                  @click="viewCustomer(slotProps.data)"
                />
                <Button
                  text
                  size="sm"
                  @click="editCustomer(slotProps.data)"
                />
                <Button
                  text
                  size="sm"
                  @click="viewOrders(slotProps.data)"
                />
                <Button
                  text
                  size="sm"
                  @click="contactCustomer(slotProps.data)"
                />
                <Button
                  v-if="slotProps.data.status === 'active'"
                  text
                  size="sm"
                  severity="warning"
                  @click="toggleStatus(slotProps.data, 'inactive')"
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

    <!-- 客户表单对话框 -->
    <Dialog
      v-model:visible="showCustomerDialog"
      :header="editingCustomer ? '编辑客户' : '新增客户'"
      :style="{ width: '800px' }"
      modal
      class="p-fluid"
    >
      <template #default>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">客户编号</label>
              <Input v-model="customerForm.customer_no" :disabled="true" placeholder="系统自动生成" />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">客户名称 *</label>
              <Input
                v-model="customerForm.name"
                placeholder="请输入客户名称"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">客户类型 *</label>
              <Select
                v-model="customerForm.type"
                :options="typeOptions"
                option-option-value="value"
                placeholder="选择客户类型"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">所在地区</label>
              <Select
                v-model="customerForm.region"
                :options="regionOptions"
                option-option-value="value"
                placeholder="选择地区"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">联系人</label>
              <Input
                v-model="customerForm.contact_person"
                placeholder="请输入联系人姓名"
                :disabled="dialogMode === 'view'"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">联系电话</label>
              <Input v-model="customerForm.phone" placeholder="请输入联系电话" :disabled="dialogMode === 'view'" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">邮箱地址</label>
              <Input v-model="customerForm.email" placeholder="请输入邮箱地址" :disabled="dialogMode === 'view'" />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color">客户状态</label>
              <Select
                v-model="customerForm.status"
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
              v-model="customerForm.address"
              placeholder="请输入详细地址"
              :rows="2"
              :disabled="dialogMode === 'view'"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">备注信息</label>
            <Textarea
              v-model="customerForm.notes"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="closeCustomerDialog" />
          <Button
            v-if="dialogMode !== 'view'"
            :loading="saving"
            @click="saveCustomer"
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
// import Dialog from 'primevue/dialog' // 已移除PrimeVue导入
// import Skeleton from 'primevue/skeleton' // 已移除PrimeVue导入
// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '客户档案管理 - ERP 管理系统',
})

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showCustomerDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const editingCustomer = ref(null as any)
const selectedCustomers = ref([])

// 筛选条件
const searchQuery = ref('')
const typeFilter = ref('')
const regionFilter = ref('')
const statusFilter = ref('')

// 表单数据
const customerForm = ref({
  customer_no: '',
  name: '',
  type: '',
  region: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  notes: '',
})

// 选项数据
const typeOptions = ref([
  { label: '企业客户', value: 'enterprise' },
  { label: '个人客户', value: 'individual' },
  { label: '经销商', value: 'distributor' },
])

const regionOptions = ref([
  { label: '华北地区', value: 'north' },
  { label: '华东地区', value: 'east' },
  { label: '华南地区', value: 'south' },
  { label: '西南地区', value: 'southwest' },
])

const statusOptions = ref([
  { label: '活跃', value: 'active' },
  { label: '不活跃', value: 'inactive' },
  { label: '潜在客户', value: 'potential' },
])

// 统计数据
const customerStats = ref({
  total: 1248,
  active: 985,
  enterprise: 456,
  potential: 123,
})

// 模拟数据
const mockCustomers = ref([
  {
    id: '1',
    customer_no: 'CUS-001',
    name: '北京科技有限公司',
    type: 'enterprise',
    region: 'north',
    contact_person: '张经理',
    phone: '010-12345678',
    email: 'zhang@example.com',
    address: '北京市朝阳区科技园区',
    total_orders: 25,
    total_amount: 580000,
    status: 'active',
    created_at: new Date('2024-01-15'),
    notes: '重要客户，长期合作伙伴',
  },
  {
    id: '2',
    customer_no: 'CUS-002',
    name: '上海制造集团',
    type: 'enterprise',
    region: 'east',
    contact_person: '李总',
    phone: '021-87654321',
    email: 'li@example.com',
    address: '上海市浦东新区工业园',
    total_orders: 18,
    total_amount: 420000,
    status: 'active',
    created_at: new Date('2024-01-10'),
    notes: '新兴客户，发展潜力大',
  },
])

// 计算属性
const filteredCustomers = computed(() => {
  let result = mockCustomers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      customer =>
        customer.customer_no.toLowerCase().includes(query)
        || customer.name.toLowerCase().includes(query)
        || customer.contact_person.toLowerCase().includes(query),
    )
  }

  if (typeFilter.value) {
    result = result.filter(customer => customer.type === typeFilter.value)
  }

  if (regionFilter.value) {
    result = result.filter(customer => customer.region === regionFilter.value)
  }

  if (statusFilter.value) {
    result = result.filter(customer => customer.status === statusFilter.value)
  }

  return result
})

// 映射对象
const typeMap: Record<string, string> = {
  enterprise: '企业客户',
  individual: '个人客户',
  distributor: '经销商',
}

const typeSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  enterprise: 'secondary',
  individual: 'default',
  distributor: 'outline',
}

const regionMap: Record<string, string> = {
  north: '华北地区',
  east: '华东地区',
  south: '华南地区',
  southwest: '西南地区',
}

const statusMap: Record<string, string> = {
  active: '活跃',
  inactive: '不活跃',
  potential: '潜在客户',
}

const statusSeverityMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  active: 'default',
  inactive: 'destructive',
  potential: 'outline',
}

// 方法
const getTypeDisplayName = (type: string) => typeMap[type] || type
const getTypeSeverity = (type: string) => typeSeverityMap[type] || 'secondary'
const getRegionDisplayName = (region: string) => regionMap[region] || region
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusSeverity = (status: string) => statusSeverityMap[status] || 'secondary'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const openCreateForm = () => {
  editingCustomer.value = null
  dialogMode.value = 'create'
  customerForm.value = {
    customer_no: `CUS-${Date.now()}`,
    name: '',
    type: '',
    region: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
    notes: '',
  }
  showCustomerDialog.value = true
}

const viewCustomer = (customer: any) => {
  editingCustomer.value = customer
  dialogMode.value = 'view'
  Object.assign(customerForm.value, customer)
  showCustomerDialog.value = true
}

const editCustomer = (customer: any) => {
  editingCustomer.value = customer
  dialogMode.value = 'edit'
  Object.assign(customerForm.value, customer)
  showCustomerDialog.value = true
}

const viewOrders = (customer: any) => {
  console.log('查看订单:', customer.name)
}

const contactCustomer = (customer: any) => {
  console.log('联系客户:', customer.phone)
}

const toggleStatus = async (customer: any, newStatus: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const index = mockCustomers.value.findIndex(c => c.id === customer.id)
    if (index !== -1 && mockCustomers.value[index]) {
      mockCustomers.value[index]!.status = newStatus
    }
  }
  catch (error) {
    console.error('操作失败:', error)
  }
}

const closeCustomerDialog = () => {
  showCustomerDialog.value = false
  editingCustomer.value = null
}

const saveCustomer = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (dialogMode.value === 'create') {
      const newCustomer = {
        id: Date.now().toString(),
        ...customerForm.value,
        total_orders: 0,
        total_amount: 0,
        created_at: new Date(),
      }
      mockCustomers.value.push(newCustomer)
    }
    else if (dialogMode.value === 'edit') {
      const index = mockCustomers.value.findIndex(c => c.id === editingCustomer.value?.id)
      if (index !== -1 && mockCustomers.value[index]) {
        mockCustomers.value[index] = {
          ...mockCustomers.value[index],
          ...customerForm.value,
          id: mockCustomers.value[index]!.id,
          total_orders: mockCustomers.value[index]!.total_orders,
          total_amount: mockCustomers.value[index]!.total_amount,
          created_at: mockCustomers.value[index]!.created_at,
        }
      }
    }

    closeCustomerDialog()
  }
  catch (error) {
    console.error('保存客户失败:', error)
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
