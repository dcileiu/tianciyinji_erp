<template>
  <div class="p-6 space-y-6">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">生产订单管理</h1>
        <p class="text-gray-600 mt-1">管理和跟踪生产订单的执行情况</p>
      </div>
      <button 
        @click="handleCreate"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        新建订单
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">订单号/产品名称</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索订单号或产品名称"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">订单状态</label>
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已确认</option>
            <option value="producing">生产中</option>
            <option value="completed">已完工</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">车间</label>
          <select
            v-model="workshopFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部车间</option>
            <option v-for="workshop in workshops" :key="workshop.id" :value="workshop.id">
              {{ workshop.workshop_name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">优先级</label>
          <select
            v-model="priorityFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部优先级</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="urgent">紧急</option>
          </select>
        </div>
        
        <div class="flex items-end">
          <button class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
            <Filter class="w-4 h-4" />
            重置筛选
          </button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">今日新增</p>
            <p class="text-2xl font-bold text-gray-900">{{ orderStats.todayNew }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plus class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">待确认</p>
            <p class="text-2xl font-bold text-gray-900">{{ orderStats.pending }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">生产中</p>
            <p class="text-2xl font-bold text-gray-900">{{ orderStats.producing }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Factory class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">本月完工</p>
            <p class="text-2xl font-bold text-gray-900">{{ orderStats.monthCompleted }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Package class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>
      
      <div v-else-if="error" class="p-8 text-center text-red-600">
        <p>{{ error }}</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品信息</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量/进度</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">车间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态/优先级</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">计划时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in paginatedOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ order.order_code }}</div>
                  <div class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ order.product_name }}</div>
                  <div class="text-sm text-gray-500">{{ order.product_code }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ order.quantity }}</div>
                  <div class="text-sm text-gray-500">已完成: {{ order.completed_quantity || 0 }}</div>
                  <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      :style="{ width: getProgress(order) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getWorkshopName(order.workshop_id) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="space-y-1">
                  <span :class="getStatusColor(order.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getStatusText(order.status) }}
                  </span>
                  <div>
                    <span :class="getPriorityColor(order.priority)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getPriorityText(order.priority) }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div>开始: {{ formatDate(order.plan_start_date) }}</div>
                  <div>结束: {{ formatDate(order.plan_end_date) }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button 
                    v-if="order.status === 'pending'"
                    @click="handleConfirm(order.id)"
                    class="text-blue-600 hover:text-blue-900" 
                    title="确认订单"
                  >
                    <CheckCircle class="w-4 h-4" />
                  </button>
                  <button 
                    v-if="order.status === 'confirmed'"
                    @click="handleStart(order.id)"
                    class="text-green-600 hover:text-green-900" 
                    title="开始生产"
                  >
                    <Play class="w-4 h-4" />
                  </button>
                  <button 
                    @click="handleEdit(order)"
                    class="text-indigo-600 hover:text-indigo-900" 
                    title="编辑"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button 
                    @click="handleDelete(order.id)"
                    class="text-red-600 hover:text-red-900" 
                    title="删除"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="flex-1 flex justify-between sm:hidden">
          <button 
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            上一页
          </button>
          <button 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              显示第 <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> 到 
              <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredOrders.length) }}</span> 条，
              共 <span class="font-medium">{{ filteredOrders.length }}</span> 条记录
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button 
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  currentPage === page 
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button 
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建订单模态框 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">创建生产订单</h3>
          <form @submit.prevent="submitCreate" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">产品编码</label>
              <input v-model="orderForm.product_code" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">产品名称</label>
              <input v-model="orderForm.product_name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">生产数量</label>
              <input v-model.number="orderForm.quantity" type="number" required min="1" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">车间</label>
              <select v-model="orderForm.workshop_id" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">请选择车间</option>
                <option v-for="workshop in workshops" :key="workshop.id" :value="workshop.id">
                  {{ workshop.workshop_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">优先级</label>
              <select v-model="orderForm.priority" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">计划开始日期</label>
                <input v-model="orderForm.plan_start_date" type="date" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">计划完成日期</label>
                <input v-model="orderForm.plan_end_date" type="date" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">备注</label>
              <textarea v-model="orderForm.notes" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="showCreateModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                取消
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                创建
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 编辑订单模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">编辑生产订单</h3>
          <form @submit.prevent="submitEdit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">产品编码</label>
              <input v-model="orderForm.product_code" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">产品名称</label>
              <input v-model="orderForm.product_name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">生产数量</label>
              <input v-model.number="orderForm.quantity" type="number" required min="1" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">车间</label>
              <select v-model="orderForm.workshop_id" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">请选择车间</option>
                <option v-for="workshop in workshops" :key="workshop.id" :value="workshop.id">
                  {{ workshop.workshop_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">优先级</label>
              <select v-model="orderForm.priority" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">计划开始日期</label>
                <input v-model="orderForm.plan_start_date" type="date" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">计划完成日期</label>
                <input v-model="orderForm.plan_end_date" type="date" required class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">备注</label>
              <textarea v-model="orderForm.notes" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
            </div>
            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="showEditModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                取消
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <XCircle class="mx-auto h-12 w-12 text-red-600" />
          <h3 class="text-lg font-medium text-gray-900 mt-4">确认删除</h3>
          <p class="text-sm text-gray-500 mt-2">确定要删除这个生产订单吗？此操作无法撤销。</p>
          <div class="flex justify-center space-x-3 mt-6">
            <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              取消
            </button>
            <button @click="confirmDelete" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  Factory, 
  Package, 
  CheckCircle,
  Play,
  XCircle
} from 'lucide-vue-next'
import { useProduction } from '~/composables/useProduction'
import { useWorkshops } from '~/composables/useWorkshops'
import type { ProductionOrder } from '~/types/production'

// 页面元数据
definePageMeta({
  title: '生产订单管理',
  layout: 'default'
})

// 使用 composables
const { 
  orders, 
  loading, 
  error, 
  orderStats,
  createOrder, 
  updateOrder, 
  deleteOrder,
  confirmOrder,
  startProduction,
  completeOrder,
  fetchOrders
} = useProduction()

const { workshops, fetchWorkshops } = useWorkshops()

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const workshopFilter = ref('')
const priorityFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedOrderId = ref('')

// 表单数据
const orderForm = ref({
  product_id: '',
  product_code: '',
  product_name: '',
  quantity: 0,
  workshop_id: '',
  bom_id: '',
  priority: 'medium',
  plan_start_date: '',
  plan_end_date: '',
  notes: ''
})

// 筛选后的订单
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesSearch = !searchQuery.value || 
      order.order_code?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.product_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !statusFilter.value || order.status === statusFilter.value
    const matchesWorkshop = !workshopFilter.value || order.workshop_id === workshopFilter.value
    const matchesPriority = !priorityFilter.value || order.priority === priorityFilter.value
    
    return matchesSearch && matchesStatus && matchesWorkshop && matchesPriority
  })
})

// 分页数据
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize.value)
})

// 辅助函数
const getWorkshopName = (workshopId: string) => {
  const workshop = workshops.value.find(w => w.id === workshopId)
  return workshop?.workshop_name || '未分配'
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const getProgress = (order: any) => {
  if (order.quantity === 0) return 0
  return Math.round((order.completed_quantity || 0) / order.quantity * 100)
}

// 操作函数
const handleCreate = () => {
  orderForm.value = {
    product_id: '',
    product_code: '',
    product_name: '',
    quantity: 0,
    workshop_id: '',
    bom_id: '',
    priority: 'medium',
    plan_start_date: '',
    plan_end_date: '',
    notes: ''
  }
  showCreateModal.value = true
}

const handleEdit = (order: any) => {
  orderForm.value = {
    product_id: order.product_id || '',
    product_code: order.product_code || '',
    product_name: order.product_name || '',
    quantity: order.quantity || 0,
    workshop_id: order.workshop_id || '',
    bom_id: order.bom_id || '',
    priority: order.priority || 'medium',
    plan_start_date: order.plan_start_date?.split('T')[0] || '',
    plan_end_date: order.plan_end_date?.split('T')[0] || '',
    notes: order.notes || ''
  }
  selectedOrderId.value = order.id
  showEditModal.value = true
}

const handleDelete = (orderId: string) => {
  selectedOrderId.value = orderId
  showDeleteModal.value = true
}

const submitCreate = async () => {
  try {
    await createOrder(orderForm.value)
    showCreateModal.value = false
    await fetchOrders()
  } catch (err) {
    console.error('创建订单失败:', err)
  }
}

const submitEdit = async () => {
  try {
    await updateOrder(selectedOrderId.value, orderForm.value)
    showEditModal.value = false
    await fetchOrders()
  } catch (err) {
    console.error('更新订单失败:', err)
  }
}

const confirmDelete = async () => {
  try {
    await deleteOrder(selectedOrderId.value)
    showDeleteModal.value = false
    await fetchOrders()
  } catch (err) {
    console.error('删除订单失败:', err)
  }
}

const handleConfirm = async (orderId: string) => {
  try {
    await confirmOrder(orderId)
    await fetchOrders()
  } catch (err) {
    console.error('确认订单失败:', err)
  }
}

const handleStart = async (orderId: string) => {
  try {
    await startOrder(orderId)
    await fetchOrders()
  } catch (err) {
    console.error('开始生产失败:', err)
  }
}

const handleComplete = async (orderId: string) => {
  try {
    await completeOrder(orderId)
    await fetchOrders()
  } catch (err) {
    console.error('完成订单失败:', err)
  }
}

const handleCancel = async (orderId: string) => {
  try {
    await cancelOrder(orderId, '用户取消')
    await fetchOrders()
  } catch (err) {
    console.error('取消订单失败:', err)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchWorkshops()
  ])
})
</script>