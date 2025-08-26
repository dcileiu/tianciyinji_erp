<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">客户档案管理</h1>
        <p class="text-muted-foreground">管理客户基础信息，维护客户关系和联系方式</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="exportCustomers">
          <Download class="mr-2 h-4 w-4" />
          导出数据
        </Button>
        <Button size="sm" @click="openCreateForm">
          <Plus class="mr-2 h-4 w-4" />
          新增客户
        </Button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Search class="h-5 w-5" />
          搜索筛选
        </CardTitle>
        <CardDescription>快速找到您需要的客户信息</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>搜索客户</Label>
            <div class="relative">
              <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input v-model="searchQuery" placeholder="客户名称、编号..." class="pl-9" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>客户类型</Label>
            <Select v-model="typeFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem v-for="type in typeOptions" :key="type.value" :value="type.value">
                  {{ type.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>所在地区</Label>
            <Select v-model="regionFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部地区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部地区</SelectItem>
                <SelectItem
                  v-for="region in regionOptions"
                  :key="region.value"
                  :value="region.value"
                >
                  {{ region.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>客户状态</Label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem
                  v-for="status in statusOptions"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex gap-2 mt-4">
          <Button variant="outline" @click="resetFilters">
            <RotateCcw class="mr-2 h-4 w-4" />
            重置筛选
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 客户统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">总客户数</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-blue-600">{{ customerStats.total }}</p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +12
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">本月新增</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
            >
              <Users class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">活跃客户</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-green-600">{{ customerStats.active }}</p>
                <Badge variant="secondary" class="text-xs">
                  {{ Math.round((customerStats.active / customerStats.total) * 100) }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">活跃率</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            >
              <CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">企业客户</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-purple-600">{{ customerStats.enterprise }}</p>
                <Badge variant="secondary" class="text-xs">
                  {{ Math.round((customerStats.enterprise / customerStats.total) * 100) }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">占比</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900"
            >
              <Building class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">潜在客户</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-orange-600">{{ customerStats.potential }}</p>
                <Badge variant="secondary" class="text-xs">
                  {{ Math.round((customerStats.potential / customerStats.total) * 100) }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">占比</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900"
            >
              <Eye class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 客户列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <FileText class="h-5 w-5" />
              客户列表
            </CardTitle>
            <CardDescription>共 {{ filteredCustomers.length }} 个客户</CardDescription>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" @click="refreshData">
              <RefreshCw class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
            <Skeleton class="h-8 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
        </div>

        <div v-else-if="filteredCustomers.length === 0" class="text-center py-16">
          <Users class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 class="text-xl font-semibold mb-4">暂无客户数据</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            您还没有添加任何客户。点击下方按钮开始添加您的第一个客户。
          </p>
          <Button @click="openCreateForm">
            <Plus class="mr-2 h-4 w-4" />
            添加客户
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="customer in filteredCustomers"
            :key="customer.id"
            class="rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <Avatar class="h-12 w-12">
                  <AvatarFallback class="bg-primary/10 text-primary">
                    {{ customer.name.charAt(0) }}
                  </AvatarFallback>
                </Avatar>
                <div class="space-y-1">
                  <div class="flex items-center space-x-2">
                    <Badge variant="outline" class="font-mono text-xs">
                      {{ customer.customer_no }}
                    </Badge>
                    <Badge :variant="getStatusVariant(customer.status)">
                      {{ getStatusDisplayName(customer.status) }}
                    </Badge>
                    <Badge :variant="getTypeVariant(customer.type)">
                      {{ getTypeDisplayName(customer.type) }}
                    </Badge>
                  </div>
                  <p class="font-medium">{{ customer.name }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ customer.contact_person }} • {{ customer.phone }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ getRegionDisplayName(customer.region) }} •
                    {{ formatDate(customer.created_at) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="text-right space-y-1">
                  <p class="text-sm font-medium">{{ customer.total_orders }} 个订单</p>
                  <p class="text-lg font-bold text-green-600">
                    ¥{{ customer.total_amount.toLocaleString() }}
                  </p>
                  <p class="text-xs text-muted-foreground">累计金额</p>
                </div>
                <div class="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" @click="viewCustomer(customer)">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="editCustomer(customer)">
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="viewOrders(customer)">
                    <ShoppingBag class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="contactCustomer(customer)">
                    <Phone class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="customer.status === 'active'"
                    variant="ghost"
                    size="sm"
                    @click="toggleStatus(customer, 'inactive')"
                  >
                    <UserX class="h-4 w-4" />
                  </Button>
                  <Button
                    v-else
                    variant="ghost"
                    size="sm"
                    @click="toggleStatus(customer, 'active')"
                  >
                    <UserCheck class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 客户表单对话框 -->
    <Dialog v-model:open="showCustomerDialog">
      <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Users class="h-5 w-5" />
            {{ editingCustomer ? '编辑客户' : '新增客户' }}
          </DialogTitle>
          <DialogDescription>
            {{ dialogMode === 'view' ? '查看客户详细信息' : '填写客户基本信息' }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-6 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>客户编号</Label>
              <Input v-model="customerForm.customer_no" disabled placeholder="系统自动生成" />
            </div>

            <div class="space-y-2">
              <Label>客户名称 *</Label>
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
              <Label>客户类型 *</Label>
              <Select v-model="customerForm.type" :disabled="dialogMode === 'view'">
                <SelectTrigger>
                  <SelectValue placeholder="选择客户类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="type in typeOptions" :key="type.value" :value="type.value">
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>所在地区</Label>
              <Select v-model="customerForm.region" :disabled="dialogMode === 'view'">
                <SelectTrigger>
                  <SelectValue placeholder="选择地区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="region in regionOptions"
                    :key="region.value"
                    :value="region.value"
                  >
                    {{ region.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>联系人</Label>
              <Input
                v-model="customerForm.contact_person"
                placeholder="请输入联系人姓名"
                :disabled="dialogMode === 'view'"
              />
            </div>

            <div class="space-y-2">
              <Label>联系电话</Label>
              <Input
                v-model="customerForm.phone"
                placeholder="请输入联系电话"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>邮箱地址</Label>
              <Input
                v-model="customerForm.email"
                placeholder="请输入邮箱地址"
                :disabled="dialogMode === 'view'"
              />
            </div>

            <div class="space-y-2">
              <Label>客户状态</Label>
              <Select v-model="customerForm.status" :disabled="dialogMode === 'view'">
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in statusOptions"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label>详细地址</Label>
            <Textarea
              v-model="customerForm.address"
              placeholder="请输入详细地址"
              :rows="2"
              :disabled="dialogMode === 'view'"
            />
          </div>

          <div class="space-y-2">
            <Label>备注信息</Label>
            <Textarea
              v-model="customerForm.notes"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeCustomerDialog">取消</Button>
          <Button v-if="dialogMode !== 'view'" :disabled="saving" @click="saveCustomer">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ editingCustomer ? '更新客户' : '添加客户' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Building,
  CheckCircle,
  Download,
  Edit,
  Eye,
  FileText,
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '客户档案管理 - ERP 管理系统',
})

interface Customer {
  id: string
  customer_no: string
  name: string
  type: string
  region: string
  contact_person: string
  phone: string
  email: string
  address: string
  total_orders: number
  total_amount: number
  status: string
  created_at: Date
  notes: string
}

// 状态管理
const loading = ref(false)
const saving = ref(false)
const showCustomerDialog = ref(false)
const dialogMode = ref<'view' | 'create' | 'edit'>('view')
const editingCustomer = ref<Customer | null>(null)

// 筛选条件
const searchQuery = ref('')
const typeFilter = ref('all')
const regionFilter = ref('all')
const statusFilter = ref('all')

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
const mockCustomers = ref<Customer[]>([
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
  {
    id: '3',
    customer_no: 'CUS-003',
    name: '广州贸易有限公司',
    type: 'distributor',
    region: 'south',
    contact_person: '王主任',
    phone: '020-11111111',
    email: 'wang@example.com',
    address: '广州市天河区商务中心',
    total_orders: 32,
    total_amount: 720000,
    status: 'active',
    created_at: new Date('2024-01-05'),
    notes: '优质经销商',
  },
  {
    id: '4',
    customer_no: 'CUS-004',
    name: '深圳个人用户',
    type: 'individual',
    region: 'south',
    contact_person: '刘先生',
    phone: '0755-22222222',
    email: 'liu@example.com',
    address: '深圳市南山区',
    total_orders: 5,
    total_amount: 45000,
    status: 'potential',
    created_at: new Date('2024-01-20'),
    notes: '潜在大客户',
  },
])

// 计算属性
const filteredCustomers = computed(() => {
  let result = mockCustomers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      customer =>
        customer.customer_no.toLowerCase().includes(query) ||
        customer.name.toLowerCase().includes(query) ||
        customer.contact_person.toLowerCase().includes(query)
    )
  }

  if (typeFilter.value && typeFilter.value !== 'all') {
    result = result.filter(customer => customer.type === typeFilter.value)
  }

  if (regionFilter.value && regionFilter.value !== 'all') {
    result = result.filter(customer => customer.region === regionFilter.value)
  }

  if (statusFilter.value && statusFilter.value !== 'all') {
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

const typeVariantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
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

const statusVariantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  active: 'default',
  inactive: 'destructive',
  potential: 'outline',
}

// 方法
const getTypeDisplayName = (type: string) => typeMap[type] || type
const getTypeVariant = (type: string) => typeVariantMap[type] || 'secondary'
const getRegionDisplayName = (region: string) => regionMap[region] || region
const getStatusDisplayName = (status: string) => statusMap[status] || status
const getStatusVariant = (status: string) => statusVariantMap[status] || 'secondary'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const resetFilters = () => {
  searchQuery.value = ''
  typeFilter.value = 'all'
  regionFilter.value = 'all'
  statusFilter.value = 'all'
}

const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

const exportCustomers = () => {
  console.log('导出客户数据')
}

const openCreateForm = () => {
  editingCustomer.value = null
  dialogMode.value = 'create'
  customerForm.value = {
    customer_no: `CUS-${String(Date.now()).slice(-3)}`,
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

const viewCustomer = (customer: Customer) => {
  editingCustomer.value = customer
  dialogMode.value = 'view'
  Object.assign(customerForm.value, customer)
  showCustomerDialog.value = true
}

const editCustomer = (customer: Customer) => {
  editingCustomer.value = customer
  dialogMode.value = 'edit'
  Object.assign(customerForm.value, customer)
  showCustomerDialog.value = true
}

const viewOrders = (customer: Customer) => {
  console.log('查看订单:', customer.name)
  // 可以跳转到订单页面并筛选该客户的订单
}

const contactCustomer = (customer: Customer) => {
  console.log('联系客户:', customer.phone)
  // 可以打开拨号或邮件应用
}

const toggleStatus = async (customer: Customer, newStatus: string) => {
  try {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    const index = mockCustomers.value.findIndex(c => c.id === customer.id)
    if (index !== -1) {
      mockCustomers.value[index]!.status = newStatus
    }
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    loading.value = false
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
      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...customerForm.value,
        total_orders: 0,
        total_amount: 0,
        created_at: new Date(),
      }
      mockCustomers.value.push(newCustomer)
    } else if (dialogMode.value === 'edit' && editingCustomer.value) {
      const index = mockCustomers.value.findIndex(c => c.id === editingCustomer.value?.id)
      if (index !== -1) {
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
  } catch (error) {
    console.error('保存客户失败:', error)
  } finally {
    saving.value = false
  }
}
</script>
