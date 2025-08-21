<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">
          供应商管理
        </h1>
        <p class="text-muted-foreground mt-1">
          管理供应商基础信息，维护供应商关系和合作协议
        </p>
      </div>
      <button @click="openCreateForm" class="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <span>新增供应商</span>
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-card p-6 rounded-lg border">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜索框 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            搜索供应商
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              placeholder="供应商名称、编号..."
              class="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- 供应商类型筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            供应商类型
          </label>
          <select v-model="typeFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部类型</option>
            <option value="raw_material">原材料供应商</option>
            <option value="equipment">设备供应商</option>
            <option value="service">服务供应商</option>
            <option value="logistics">物流供应商</option>
          </select>
        </div>

        <!-- 合作状态筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            合作状态
          </label>
          <select v-model="statusFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部状态</option>
            <option value="active">正常合作</option>
            <option value="suspended">暂停合作</option>
            <option value="terminated">终止合作</option>
            <option value="potential">潜在供应商</option>
          </select>
        </div>

        <!-- 评级筛选 -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            供应商评级
          </label>
          <select v-model="ratingFilter" class="w-full h-10 px-3 rounded-md border border-input bg-background">
            <option value="">全部评级</option>
            <option value="A">A级</option>
            <option value="B">B级</option>
            <option value="C">C级</option>
            <option value="D">D级</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 供应商统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">总供应商数</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.totalSuppliers }}</p>
          </div>
          <div class="p-2 bg-blue-500/10 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">合作中</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.activeSuppliers }}</p>
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
            <p class="text-sm text-muted-foreground">A级供应商</p>
            <p class="text-2xl font-bold text-foreground">{{ stats.aGradeSuppliers }}</p>
          </div>
          <div class="p-2 bg-yellow-500/10 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-card p-6 rounded-lg border">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">本月采购额</p>
            <p class="text-2xl font-bold text-foreground">¥{{ stats.monthlyPurchase.toLocaleString() }}</p>
          </div>
          <div class="p-2 bg-purple-500/10 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 供应商列表 -->
    <div class="bg-card rounded-lg border overflow-hidden">
      <div class="px-6 py-4 border-b">
        <h3 class="text-lg font-semibold text-foreground">供应商列表</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-border">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">供应商编号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">供应商名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">联系人</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">联系电话</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">供应商类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">评级</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-background divide-y divide-border">
            <tr
              v-for="supplier in filteredSuppliers"
              :key="supplier.id"
              class="hover:bg-muted/20 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                {{ supplier.supplier_no }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-primary">
                      {{ supplier.name.charAt(0) }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-foreground">{{ supplier.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ supplier.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ supplier.contact_person }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                {{ supplier.contact_phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeColor(supplier.supplier_type)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getTypeText(supplier.supplier_type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRatingColor(supplier.rating)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ supplier.rating }}级
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusColor(supplier.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusText(supplier.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button @click="viewSupplier(supplier)" class="text-blue-600 hover:text-blue-900 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                  <button @click="editSupplier(supplier)" class="text-green-600 hover:text-green-900 p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button @click="handleDeleteSupplier(supplier)" class="text-red-600 hover:text-red-900 p-1">
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
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredSuppliers.length) }}</span>
              项，共
              <span class="font-medium">{{ filteredSuppliers.length }}</span>
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
              :disabled="currentPage * pageSize >= filteredSuppliers.length"
              class="px-3 py-1 text-sm border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 供应商表单弹窗 -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <SupplierForm
            :supplier="selectedSupplier"
            :is-edit="isEditMode"
            @close="closeForm"
            @success="handleFormSuccess"
          />
        </div>
      </div>
    </div>

    <!-- 供应商详情弹窗 -->
    <div v-if="showDetail" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-medium text-foreground">供应商详情</h3>
            <button @click="closeDetail" class="text-muted-foreground hover:text-foreground">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div v-if="selectedSupplier" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">供应商编号</label>
                <p class="text-foreground">{{ selectedSupplier.supplier_no }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">供应商名称</label>
                <p class="text-foreground">{{ selectedSupplier.name }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">联系人</label>
                <p class="text-foreground">{{ selectedSupplier.contact_person }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">联系电话</label>
                <p class="text-foreground">{{ selectedSupplier.contact_phone }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">邮箱地址</label>
                <p class="text-foreground">{{ selectedSupplier.email || '未填写' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">供应商类型</label>
                <p class="text-foreground">{{ getTypeText(selectedSupplier.supplier_type) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">供应商评级</label>
                <span :class="getRatingColor(selectedSupplier.rating)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ selectedSupplier.rating }}级
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">供应商状态</label>
                <span :class="getStatusColor(selectedSupplier.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ getStatusText(selectedSupplier.status) }}
                </span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">创建时间</label>
                <p class="text-foreground">{{ formatDate(selectedSupplier.created_at) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">更新时间</label>
                <p class="text-foreground">{{ formatDate(selectedSupplier.updated_at) }}</p>
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
import type { Supplier } from '~/types/database'
import { useSuppliers } from '~/composables/useSuppliers'

// 响应式数据
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const ratingFilter = ref('')
const currentPage = ref(1)
const pageSize = 10

// 加载状态和错误处理
const loading = ref(false)
const error = ref('')

// 统计数据
const stats = reactive({
  totalSuppliers: 0,
  activeSuppliers: 0,
  aGradeSuppliers: 0,
  monthlyPurchase: 0
})

// 供应商数据
const suppliers = ref<Supplier[]>([])

// 表单状态
const showForm = ref(false)
const showDetail = ref(false)
const selectedSupplier = ref<Supplier | null>(null)
const isEditMode = ref(false)

// 使用供应商管理composable
const { getSuppliers, getSupplierStats, deleteSupplier } = useSuppliers()

// 获取供应商列表
const fetchSuppliers = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const result = await getSuppliers({
      search: searchQuery.value,
      type: typeFilter.value,
      status: statusFilter.value,
      page: currentPage.value,
      pageSize: pageSize
    })
    
    suppliers.value = result.data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取供应商列表失败'
    console.error('获取供应商列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const statsData = await getSupplierStats()
    Object.assign(stats, statsData)
  } catch (err) {
    console.error('获取统计数据失败:', err)
  }
}

// 删除供应商
const handleDeleteSupplier = async (supplier: Supplier) => {
  if (!confirm(`确定要删除供应商 "${supplier.name}" 吗？`)) {
    return
  }
  
  try {
    await deleteSupplier(supplier.id)
    await fetchSuppliers()
    await fetchStats()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '删除供应商失败'
    alert(errorMessage)
  }
}

// 表单操作
const openCreateForm = () => {
  selectedSupplier.value = null
  isEditMode.value = false
  showForm.value = true
}

const editSupplier = (supplier: Supplier) => {
  selectedSupplier.value = supplier
  isEditMode.value = true
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedSupplier.value = null
  isEditMode.value = false
}

const handleFormSuccess = async (supplier: Supplier) => {
  closeForm()
  await fetchSuppliers()
  await fetchStats()
}

// 详情操作
const viewSupplier = (supplier: Supplier) => {
  selectedSupplier.value = supplier
  showDetail.value = true
}

const closeDetail = () => {
  showDetail.value = false
  selectedSupplier.value = null
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 筛选供应商
const filteredSuppliers = computed(() => {
  let filtered = suppliers.value

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(supplier => 
      supplier.name.toLowerCase().includes(query) ||
      supplier.supplierNo.toLowerCase().includes(query) ||
      supplier.contactPerson.toLowerCase().includes(query)
    )
  }

  // 类型筛选
  if (typeFilter.value) {
    filtered = filtered.filter(supplier => supplier.type === typeFilter.value)
  }

  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(supplier => supplier.status === statusFilter.value)
  }

  // 评级筛选
  if (ratingFilter.value) {
    filtered = filtered.filter(supplier => supplier.rating === ratingFilter.value)
  }

  return filtered
})

// 获取类型颜色
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    raw_material: 'bg-blue-100 text-blue-800',
    equipment: 'bg-green-100 text-green-800',
    service: 'bg-purple-100 text-purple-800',
    logistics: 'bg-orange-100 text-orange-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// 获取类型文本
const getTypeText = (type: string): string => {
  const texts: Record<string, string> = {
    raw_material: '原材料',
    equipment: '设备',
    service: '服务',
    logistics: '物流'
  }
  return texts[type] || type
}

// 获取评级颜色
const getRatingColor = (rating: string): string => {
  const colors: Record<string, string> = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-red-100 text-red-800'
  }
  return colors[rating] || 'bg-gray-100 text-gray-800'
}

// 获取状态颜色
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800',
    potential: 'bg-purple-100 text-purple-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    active: '正常合作',
    suspended: '暂停合作',
    terminated: '终止合作',
    potential: '潜在供应商'
  }
  return texts[status] || status
}

// 监听筛选条件变化
watch([searchQuery, typeFilter, statusFilter, ratingFilter], () => {
  currentPage.value = 1
  fetchSuppliers()
})

// 监听页码变化
watch(currentPage, () => {
  fetchSuppliers()
})

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchSuppliers(),
    fetchStats()
  ])
})

// 页面标题
useHead({
  title: '供应商管理 - ERP 管理系统'
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>