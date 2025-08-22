<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">生产计划管理</h1>
        <p class="text-muted-foreground mt-1">
          制定和调整生产计划，优化生产资源配置
        </p>
      </div>
      <Button @click="showCreateDialog = true">
         <Plus class="w-4 h-4 mr-2" />
         新建生产计划
       </Button>
    </div>

    <!-- 计划概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-blue-500/10 rounded-full">
            <Calendar class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              本周计划
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ planStats?.thisWeekPlans || 0 }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-green-500/10 rounded-full">
            <CheckCircle class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              执行中
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ planStats?.executing || 0 }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-yellow-500/10 rounded-full">
            <Clock class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              待审核
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ planStats?.pending || 0 }}
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-6">
        <div class="flex items-center">
          <div class="p-3 bg-purple-500/10 rounded-full">
            <TrendingUp class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-muted-foreground">
              产能利用率
            </p>
            <p class="text-2xl font-semibold text-foreground">
              {{ planStats?.capacityUtilization || 0 }}%
            </p>
          </div>
        </div>
      </Card>
    </div>

    <!-- 筛选和搜索 -->
    <Card class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            计划名称
          </label>
          <Input
            v-model="searchQuery"
            placeholder="输入计划名称搜索"
            class="w-full"
          />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            计划状态
          </label>
          <Select v-model="selectedStatus">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="approved">已审核</SelectItem>
              <SelectItem value="executing">执行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            计划周期
          </label>
          <Select v-model="selectedPeriod">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="全部周期" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部周期</SelectItem>
              <SelectItem value="daily">日计划</SelectItem>
              <SelectItem value="weekly">周计划</SelectItem>
              <SelectItem value="monthly">月计划</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">
            负责车间
          </label>
          <Select v-model="selectedWorkshop">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="全部车间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部车间</SelectItem>
              <SelectItem value="workshop_1">第一车间</SelectItem>
              <SelectItem value="workshop_2">第二车间</SelectItem>
              <SelectItem value="workshop_3">第三车间</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>

    <!-- 生产计划列表 -->
    <Card class="p-6">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>计划名称</TableHead>
              <TableHead>计划周期</TableHead>
              <TableHead>负责车间</TableHead>
              <TableHead>计划产量</TableHead>
              <TableHead>完成进度</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>计划时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="plan in paginatedPlans"
              :key="plan.id"
            >
              <TableCell>
                <div class="font-medium text-foreground">
                  {{ plan.plan_name }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ plan.plan_code || plan.plan_no }}
                </div>
              </TableCell>
              <TableCell>
                <span class="text-sm text-foreground">
                  {{ getPeriodText(plan.period_type) }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-foreground">
                  {{ getWorkshopName(plan.workshop_id) }}
                </span>
              </TableCell>
              <TableCell>
                <div class="font-medium text-foreground">
                  {{ plan.target_quantity || plan.planned_quantity || 0 }}
                </div>
                <div class="text-sm text-muted-foreground">
                  已完成: {{ plan.completed_quantity || 0 }}
                </div>
              </TableCell>
              <TableCell>
                <div class="space-y-2">
                  <Progress :value="getProgress(plan)" class="w-full" />
                  <div class="text-sm text-muted-foreground">
                    {{ getProgress(plan) }}%
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(plan.status)">
                  {{ getStatusText(plan.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="text-sm text-foreground">
                  {{ formatDate(plan.start_date) }}
                </div>
                <div class="text-sm text-muted-foreground">
                  至 {{ formatDate(plan.end_date) }}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewPlan(plan)">
                      <Eye class="w-4 h-4 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleEdit(plan)">
                      <Edit class="w-4 h-4 mr-2" />
                      编辑计划
                    </DropdownMenuItem>
                    <DropdownMenuSeparator v-if="plan.status === 'pending' || plan.status === 'approved'" />
                    <DropdownMenuItem 
                      v-if="plan.status === 'pending'"
                      @click="handleApprove(plan.id)"
                    >
                      <CheckCircle class="w-4 h-4 mr-2" />
                      审核通过
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      v-if="plan.status === 'approved'"
                      @click="handleStart(plan.id)"
                    >
                      <Play class="w-4 h-4 mr-2" />
                      开始执行
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      @click="handleDelete(plan.id)"
                      class="text-destructive focus:text-destructive"
                    >
                      <Trash2 class="w-4 h-4 mr-2" />
                      删除计划
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- 分页 -->
      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-muted-foreground">
          显示 {{ (currentPage - 1) * pageSize + 1 }} 到 
          {{ Math.min(currentPage * pageSize, filteredPlans.length) }} 条，
          共 {{ filteredPlans.length }} 条记录
        </div>
        <Pagination
          v-model:page="currentPage"
          :total="filteredPlans.length"
          :sibling-count="1"
          :show-edges="true"
          :items-per-page="pageSize"
        />
      </div>
    </Card>

    <!-- 创建计划对话框 -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建生产计划</DialogTitle>
          <DialogDescription>
            填写以下信息创建新的生产计划
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="space-y-4">
            <div class="space-y-2">
              <Label for="name">计划名称</Label>
              <Input
                id="name"
                v-model="form.name"
                placeholder="请输入计划名称"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="product">产品</Label>
              <Select v-model="form.product" required>
                <SelectTrigger>
                  <SelectValue placeholder="请选择产品" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="产品A">产品A</SelectItem>
                  <SelectItem value="产品B">产品B</SelectItem>
                  <SelectItem value="产品C">产品C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="quantity">计划产量</Label>
              <Input
                id="quantity"
                v-model.number="form.quantity"
                type="number"
                placeholder="请输入计划产量"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="startDate">开始日期</Label>
              <Input
                id="startDate"
                v-model="form.startDate"
                type="date"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="endDate">结束日期</Label>
              <Input
                id="endDate"
                v-model="form.endDate"
                type="date"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="manager">负责人</Label>
              <Select v-model="form.manager" required>
                <SelectTrigger>
                  <SelectValue placeholder="请选择负责人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="张三">张三</SelectItem>
                  <SelectItem value="李四">李四</SelectItem>
                  <SelectItem value="王五">王五</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="cancelForm">
              取消
            </Button>
            <Button type="submit">
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- 编辑计划模态框 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">编辑生产计划</h3>
        <form @submit.prevent="submitEdit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">计划名称</label>
              <input
                v-model="planForm.plan_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入计划名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">计划周期</label>
              <select
                v-model="planForm.period_type"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">周计划</option>
                <option value="month">月计划</option>
                <option value="quarter">季度计划</option>
                <option value="year">年度计划</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">负责车间</label>
              <select
                v-model="planForm.workshop_id"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择车间</option>
                <option v-for="workshop in workshops" :key="workshop.id" :value="workshop.id">
                  {{ workshop.workshop_name || workshop.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">目标产量</label>
              <input
                v-model.number="planForm.target_quantity"
                type="number"
                min="1"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入目标产量"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                <input
                  v-model="planForm.start_date"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                <input
                  v-model="planForm.end_date"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
              <textarea
                v-model="planForm.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入备注信息"
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? '更新中...' : '更新' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
        <h3 class="text-lg font-semibold mb-4">确认删除</h3>
        <p class="text-gray-600 mb-6">确定要删除这个生产计划吗？此操作不可撤销。</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            :disabled="loading"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ loading ? '删除中...' : '删除' }}
          </button>
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
  Calendar, 
  Factory, 
  Package, 
  CheckCircle,
  Clock,
  BarChart3,
  Play,
  XCircle,
  TrendingUp
} from 'lucide-vue-next'
import { useProductionPlans } from '~/composables/useProductionPlans'
import { useWorkshops } from '~/composables/useWorkshops'
import type { ProductionPlan } from '~/types/production'
import Card from '~/components/ui/Card.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'

// 页面元数据
useHead({
  title: '生产计划管理 - ERP系统'
})

// 使用 composables
const { 
  plans, 
  loading, 
  error, 
  planStats,
  createPlan, 
  updatePlan, 
  deletePlan,
  approvePlan,
  startPlan,
  completePlan,
  fetchPlans
} = useProductionPlans()

const { workshops, fetchWorkshops } = useWorkshops()

// 响应式数据
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedPeriod = ref('')
const selectedWorkshop = ref('')
const statusFilter = ref('')
const periodFilter = ref('')
const workshopFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedPlanId = ref<string | null>(null)
const editingPlan = ref<ProductionPlan | null>(null)

// 表单数据
const planForm = ref({
  plan_name: '',
  period_type: 'month',
  start_date: '',
  end_date: '',
  workshop_id: '',
  target_quantity: 0,
  notes: ''
})

// 统计数据 - 使用 composable 的数据或回退到默认值
const stats = computed(() => {
  return planStats.value || {
    weeklyPlans: 8,
    executing: 5,
    pending: 3,
    utilization: 85
  }
})

// 使用 plans 而不是 productionPlans
const productionPlans = computed(() => plans.value)

// 计算属性
const filteredPlans = computed(() => {
  return productionPlans.value.filter(plan => {
    const matchesSearch = !searchQuery.value || 
      plan.plan_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (plan.plan_code && plan.plan_code.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    const matchesStatus = (!selectedStatus.value && !statusFilter.value) || 
      plan.status === selectedStatus.value || plan.status === statusFilter.value
    
    const matchesPeriod = (!selectedPeriod.value && !periodFilter.value) || 
      plan.period_type === selectedPeriod.value || plan.period_type === periodFilter.value
    
    const matchesWorkshop = (!selectedWorkshop.value && !workshopFilter.value) || 
      plan.workshop_id === selectedWorkshop.value || plan.workshop_id === workshopFilter.value
    
    return matchesSearch && matchesStatus && matchesPeriod && matchesWorkshop
  })
})

// 分页后的计划
const paginatedPlans = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPlans.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredPlans.value.length / pageSize.value)
})

// 辅助函数
const getWorkshopName = (workshopId: string): string => {
  const workshop = workshops.value.find(w => w.id === workshopId)
  return workshop?.workshop_name || workshop?.name || '未知车间'
}

const getPeriodText = (periodType: string): string => {
  const periods: Record<string, string> = {
    daily: '日计划',
    weekly: '周计划',
    monthly: '月计划',
    quarter: '季度计划',
    year: '年度计划'
  }
  return periods[periodType] || '未知周期'
}

const getProgress = (plan: any): number => {
  const targetQuantity = plan.planned_quantity || plan.target_quantity || 0
  const completedQuantity = plan.completed_quantity || 0
  if (!targetQuantity || targetQuantity === 0) return 0
  return Math.round((completedQuantity / targetQuantity) * 100)
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    approved: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    executing: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    draft: '草稿',
    approved: '已审核',
    pending: '待审核',
    executing: '执行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || '未知状态'
}

const formatDate = (date: Date | string | null): string => {
  if (!date) return '-'
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('zh-CN')
  }
  return date.toLocaleDateString('zh-CN')
}

// 重置表单
const resetForm = () => {
  planForm.value = {
    plan_name: '',
    period_type: 'month',
    start_date: '',
    end_date: '',
    workshop_id: '',
    target_quantity: 0,
    notes: ''
  }
}

// 处理创建计划
const handleCreate = () => {
  resetForm()
  showCreateModal.value = true
}

// 提交创建
const submitCreate = async () => {
  try {
    await createPlan(planForm.value)
    showCreateModal.value = false
    resetForm()
    await fetchPlans()
  } catch (error) {
    console.error('创建计划失败:', error)
  }
}

// 处理编辑计划
const handleEdit = (plan: ProductionPlan) => {
  editingPlan.value = plan
  planForm.value = {
    plan_name: plan.plan_name,
    period_type: plan.period_type,
    start_date: plan.start_date ? plan.start_date.split('T')[0] : '',
    end_date: plan.end_date ? plan.end_date.split('T')[0] : '',
    workshop_id: plan.workshop_id,
    target_quantity: plan.target_quantity || plan.planned_quantity || 0,
    notes: plan.notes || ''
  }
  showEditModal.value = true
}

// 提交编辑
const submitEdit = async () => {
  if (!editingPlan.value) return
  
  try {
    await updatePlan(editingPlan.value.id, planForm.value)
    showEditModal.value = false
    editingPlan.value = null
    resetForm()
    await fetchPlans()
  } catch (error) {
    console.error('更新计划失败:', error)
  }
}

// 处理删除计划
const handleDelete = (planId: string | number) => {
  selectedPlanId.value = String(planId)
  showDeleteModal.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!selectedPlanId.value) return
  
  try {
    await deletePlan(selectedPlanId.value)
    showDeleteModal.value = false
    selectedPlanId.value = null
    await fetchPlans()
  } catch (error) {
    console.error('删除计划失败:', error)
  }
}

// 审核计划
const handleApprove = async (planId: string) => {
  try {
    await approvePlan(planId)
    await fetchPlans()
  } catch (error) {
    console.error('审核计划失败:', error)
  }
}

// 开始计划
const handleStart = async (planId: string) => {
  try {
    await startPlan(planId)
    await fetchPlans()
  } catch (error) {
    console.error('开始计划失败:', error)
  }
}

// 完成计划
const handleComplete = async (planId: string) => {
  try {
    await completePlan(planId)
    await fetchPlans()
  } catch (error) {
    console.error('完成计划失败:', error)
  }
}

// 操作函数 - 保持向后兼容
const viewPlan = (plan: any) => {
  console.log('查看计划:', plan)
}

const editPlan = (plan: any) => {
  handleEdit(plan)
}

const deletePlan_old = (planId: number) => {
  handleDelete(planId)
}

// 生命周期
onMounted(async () => {
  try {
    await Promise.all([
      fetchPlans(),
      fetchWorkshops()
    ])
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
})

// 页面元数据
definePageMeta({
  middleware: 'auth'
})
</script>