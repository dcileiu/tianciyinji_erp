<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          客户档案管理
        </h1>
        <p class="text-muted-foreground mt-1">
          管理客户基础信息，维护客户关系和联系方式
        </p>
      </div>
      <Button @click="openCreateForm">
        <Plus class="mr-2 h-4 w-4" />
        新增客户
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardHeader>
        <CardTitle>搜索筛选</CardTitle>
      </CardHeader>
      <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜索框 -->
        <div>
          <label class="block text-sm font-medium mb-2">
            搜索客户
          </label>
          <div class="relative">
            <Input
              v-model="searchQuery"
              placeholder="客户名称、编号..."
              class="pl-10"
            />
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <!-- 客户类型筛选 -->
        <div>
          <label class="block text-sm font-medium mb-2">
            客户类型
          </label>
          <Select v-model="typeFilter">
            <SelectTrigger>
              <SelectValue placeholder="全部类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部类型</SelectItem>
              <SelectItem value="enterprise">企业客户</SelectItem>
              <SelectItem value="individual">个人客户</SelectItem>
              <SelectItem value="distributor">经销商</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- 地区筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            所在地区
          </label>
          <select v-model="regionFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部地区</option>
            <option value="north">华北地区</option>
            <option value="east">华东地区</option>
            <option value="south">华南地区</option>
            <option value="southwest">西南地区</option>
          </select>
        </div>

        <!-- 状态筛选 -->
        <div>
          <label class="block text-sm font-medium mb-2">
            客户状态
          </label>
          <Select v-model="statusFilter">
            <SelectTrigger>
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="active">活跃</SelectItem>
              <SelectItem value="inactive">不活跃</SelectItem>
              <SelectItem value="potential">潜在客户</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      </CardContent>
    </Card>

    <!-- 客户统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">总客户数</p>
              <p class="text-2xl font-bold text-foreground">{{ stats.totalCustomers }}</p>
            </div>
            <div class="p-2 bg-blue-500/10 rounded-lg">
              <Users class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">活跃客户</p>
              <p class="text-2xl font-bold text-foreground">{{ stats.activeCustomers }}</p>
            </div>
            <div class="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">本月新增</p>
              <p class="text-2xl font-bold text-foreground">{{ stats.newCustomers }}</p>
            </div>
            <div class="p-2 bg-purple-500/10 rounded-lg">
              <UserPlus class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">总交易额</p>
              <p class="text-2xl font-bold text-foreground">¥{{ stats.totalRevenue.toLocaleString() }}</p>
            </div>
            <div class="p-2 bg-orange-500/10 rounded-lg">
              <DollarSign class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 客户列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>客户列表</CardTitle>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-muted-foreground">共 {{ filteredCustomers.length }} 条记录</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
      
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>客户编号</TableHead>
              <TableHead>客户名称</TableHead>
              <TableHead>联系人</TableHead>
              <TableHead>联系电话</TableHead>
              <TableHead>客户类型</TableHead>
              <TableHead>所在地区</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="customer in filteredCustomers" :key="customer.id">
              <TableCell>{{ customer.customer_no }}</TableCell>
              <TableCell>
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-primary">
                      {{ customer.name.charAt(0) }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium">{{ customer.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ customer.email }}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{{ customer.contact_person }}</TableCell>
              <TableCell>{{ customer.contact_phone }}</TableCell>
              <TableCell>
                <Badge :variant="getTypeVariant(customer.customer_type)">
                  {{ getTypeText(customer.customer_type) }}
                </Badge>
              </TableCell>
              <TableCell>{{ getRegionText(customer.region) }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(customer.status)">
                  {{ getStatusText(customer.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center space-x-2">
                  <Button @click="viewCustomer(customer)" variant="ghost" size="sm">
                    查看
                  </Button>
                  <Button @click="editCustomer(customer)" variant="ghost" size="sm">
                    编辑
                  </Button>
                  <Button @click="handleDeleteCustomer(customer)" variant="ghost" size="sm">
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

      <!-- 分页 -->
      <div class="px-6 py-4 border-t bg-muted/20">
        <div class="flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredCustomers.length) }} 条，
            共 {{ filteredCustomers.length }} 条记录
          </div>
          <div class="flex items-center space-x-2">
            <Button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              variant="outline"
              size="sm"
            >
              上一页
            </Button>
            <span class="px-3 py-1 text-sm">
              第 {{ currentPage }} / {{ totalPages }} 页
            </span>
            <Button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              variant="outline"
              size="sm"
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 客户表单弹窗 -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <CustomerForm
            :customer="selectedCustomer"
            :is-edit="isEditMode"
            @close="closeForm"
            @success="handleFormSuccess"
          />
        </div>
      </div>
    </div>

    <!-- 客户详情弹窗 -->
    <div v-if="showDetail" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-foreground">客户详情</h3>
            <button @click="closeDetail" class="text-muted-foreground hover:text-foreground">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div v-if="selectedCustomer" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">客户编号</label>
                <p class="text-foreground">{{ selectedCustomer.customer_no }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">客户名称</label>
                <p class="text-foreground">{{ selectedCustomer.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">联系人</label>
                <p class="text-foreground">{{ selectedCustomer.contact_person }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">联系电话</label>
                <p class="text-foreground">{{ selectedCustomer.contact_phone }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">邮箱地址</label>
                <p class="text-foreground">{{ selectedCustomer.email || '未填写' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">客户类型</label>
                <p class="text-foreground">{{ getTypeText(selectedCustomer.customer_type) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">所在地区</label>
                <p class="text-foreground">{{ getRegionText(selectedCustomer.region) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">客户状态</label>
                <span :class="getStatusColor(selectedCustomer.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ getStatusText(selectedCustomer.status) }}
                </span>
              </div>
            </div>
            <div v-if="selectedCustomer.address">
              <label class="block text-sm font-medium text-muted-foreground mb-1">详细地址</label>
              <p class="text-foreground">{{ selectedCustomer.address }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">创建时间</label>
                <p class="text-foreground">{{ formatDate(selectedCustomer.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">更新时间</label>
                <p class="text-foreground">{{ formatDate(selectedCustomer.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import type { Customer } from '~/types/database'
import { Button } from '~/components/ui/Button.vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card.vue'
import { Input } from '~/components/ui/Input.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/Select.vue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/Table.vue'
import { Badge } from '~/components/ui/Badge.vue'
import { Plus, Search, Users, CheckCircle, Clock, TrendingUp, UserPlus, DollarSign } from 'lucide-vue-next'
import CustomerForm from '~/components/CustomerForm.vue'

// 响应式数据
const searchQuery = ref('')
const typeFilter = ref('')
const regionFilter = ref('')
const statusFilter = ref('')
// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / pageSize.value))

// 分页数据
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCustomers.value.slice(start, end)
})
const loading = ref(false)
const error = ref('')

// 表单状态
const showForm = ref(false)
const showDetail = ref(false)
const selectedCustomer = ref<Customer | null>(null)
const isEditMode = ref(false)

// 客户数据
const customers = ref<Customer[]>([])
const totalCustomers = ref(0)
const totalPages = ref(0)

// 统计数据
const stats = reactive({
  totalCustomers: 0,
  activeCustomers: 0,
  newCustomers: 0,
  totalRevenue: 0
})

// 使用客户管理composable
const { 
  getCustomers, 
  getCustomerStats, 
  deleteCustomer,
  deleteCustomers 
} = useCustomers()

// 加载客户数据
const loadCustomers = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const params = {
      page: currentPage.value,
      pageSize,
      search: searchQuery.value || undefined,
      type: typeFilter.value || undefined,
      region: regionFilter.value || undefined,
      status: statusFilter.value || undefined
    }
    
    const result = await getCustomers(params)
    customers.value = result.data
    totalCustomers.value = result.total
    totalPages.value = result.totalPages
  } catch (err) {
    console.error('加载客户数据失败:', err)
    error.value = '加载客户数据失败，请重试'
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const statsData = await getCustomerStats()
    Object.assign(stats, statsData)
  } catch (err) {
    console.error('加载统计数据失败:', err)
  }
}

// 删除客户
const handleDeleteCustomer = async (customer: Customer) => {
  if (!confirm(`确定要删除客户 "${customer.name}" 吗？`)) {
    return
  }
  
  try {
    await deleteCustomer(customer.id)
    await loadCustomers()
    await loadStats()
  } catch (err: any) {
    alert(err.message || '删除失败')
  }
}

// 表单操作
const openCreateForm = () => {
  selectedCustomer.value = null
  isEditMode.value = false
  showForm.value = true
}

const editCustomer = (customer: Customer) => {
  selectedCustomer.value = customer
  isEditMode.value = true
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedCustomer.value = null
  isEditMode.value = false
}

const handleFormSuccess = async (customer: Customer) => {
  closeForm()
  await loadCustomers()
  await loadStats()
}

// 详情操作
const viewCustomer = (customer: Customer) => {
  selectedCustomer.value = customer
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  selectedCustomer.value = null
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 监听筛选条件变化
watch([searchQuery, typeFilter, regionFilter, statusFilter], () => {
  currentPage.value = 1
  loadCustomers()
})

// 监听页码变化
watch(currentPage, () => {
  loadCustomers()
})

// 页面加载时获取数据
onMounted(() => {
  loadCustomers()
  loadStats()
})

// 计算显示的客户（用于分页显示）
const filteredCustomers = computed(() => customers.value)

// 获取类型变体
const getTypeVariant = (type: string): string => {
  const variants: Record<string, string> = {
    enterprise: 'default',
    individual: 'secondary',
    distributor: 'outline'
  }
  return variants[type] || 'default'
}

// 获取类型文本
const getTypeText = (type: string): string => {
  const texts: Record<string, string> = {
    enterprise: '企业客户',
    individual: '个人客户',
    distributor: '经销商'
  }
  return texts[type] || type
}

// 获取地区文本
const getRegionText = (region: string): string => {
  const texts: Record<string, string> = {
    north: '华北地区',
    east: '华东地区',
    south: '华南地区',
    southwest: '西南地区'
  }
  return texts[region] || region
}

// 获取状态变体
const getStatusVariant = (status: string): string => {
  const variants: Record<string, string> = {
    active: 'default',
    inactive: 'destructive',
    potential: 'secondary'
  }
  return variants[status] || 'default'
}



// 获取状态文本
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: '活跃',
    inactive: '不活跃',
    potential: '潜在客户'
  }
  return texts[status] || status
}

// 页面标题
useHead({
  title: '客户档案管理 - ERP 管理系统'
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>