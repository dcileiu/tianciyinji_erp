<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          客户档案管理
        </h1>
        <p class="text-muted-foreground mt-1">
          管理客户基础信息，维护客户关系和联系方式
        </p>
      </div>
      <button @click="openCreateForm" class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <span>新增客户</span>
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-card p-6 rounded-lg border">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜索框 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            搜索客户
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              placeholder="客户名称、编号..."
              class="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- 客户类型筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            客户类型
          </label>
          <select v-model="typeFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部类型</option>
            <option value="enterprise">企业客户</option>
            <option value="individual">个人客户</option>
            <option value="distributor">经销商</option>
          </select>
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
          <label class="block text-sm font-medium text-foreground mb-2">
            客户状态
          </label>
          <select v-model="statusFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">不活跃</option>
            <option value="potential">潜在客户</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 客户统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">总客户数</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalCustomers }}</p>
          </div>
          <div class="p-2 bg-blue-500/10 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">活跃客户</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.activeCustomers }}</p>
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
            <p class="text-sm text-muted-foreground">本月新增</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.newCustomers }}</p>
          </div>
          <div class="p-2 bg-purple-500/10 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">总交易额</p>
            <p class="text-2xl font-bold text-foreground">¥{{ stats.totalRevenue.toLocaleString() }}</p>
          </div>
          <div class="p-2 bg-orange-500/10 rounded-lg">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 客户列表 -->
    <div class="bg-card rounded-lg border overflow-hidden">
      <div class="px-6 py-4 border-b">
        <h3 class="text-lg font-semibold text-foreground">客户列表</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-border">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">客户编号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">客户名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">联系人</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">联系电话</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">客户类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">所在地区</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-background divide-y divide-border">
            <tr
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="hover:bg-muted/20 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                {{ customer.customer_no }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-primary">
                      {{ customer.name.charAt(0) }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-foreground">{{ customer.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ customer.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ customer.contact_person }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ customer.contact_phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeColor(customer.customer_type)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getTypeText(customer.customer_type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ getRegionText(customer.region) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusColor(customer.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusText(customer.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button @click="viewCustomer(customer)" class="text-blue-600 hover:text-blue-900 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button @click="editCustomer(customer)" class="text-green-600 hover:text-green-900 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button @click="handleDeleteCustomer(customer)" class="text-red-600 hover:text-red-900 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="bg-background px-4 py-3 border-t border-border sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <p class="text-sm text-muted-foreground">
              显示 
              <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
              到
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredCustomers.length) }}</span>
              项，共
              <span class="font-medium">{{ filteredCustomers.length }}</span>
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
              :disabled="currentPage * pageSize >= filteredCustomers.length"
              class="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

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

// 响应式数据
const searchQuery = ref('')
const typeFilter = ref('')
const regionFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = 10
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

// 获取类型颜色
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    enterprise: 'bg-blue-100 text-blue-800',
    individual: 'bg-green-100 text-green-800',
    distributor: 'bg-purple-100 text-purple-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
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

// 获取状态颜色
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    potential: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
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