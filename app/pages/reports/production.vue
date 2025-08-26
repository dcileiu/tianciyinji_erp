<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">生产报表</h1>
        <p class="text-muted-foreground">生产数据分析和统计报表</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="exportReport">
          <Download class="w-4 h-4 mr-2" />
          导出报表
        </Button>
        <Button @click="refreshData">
          <RefreshCw class="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>
    </div>

    <!-- 时间筛选 -->
    <Card>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">开始日期</label>
            <Input v-model="dateRange.start" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">结束日期</label>
            <Input v-model="dateRange.end" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">车间筛选</label>
            <select v-model="workshopFilter" class="w-full px-3 py-2 border -md">
              <option value="">全部车间</option>
              <option v-for="workshop in workshops" :key="workshop.id" :value="workshop.id">
                {{ workshop.name }}
              </option>
            </select>
          </div>
          <div class="flex gap-2">
            <Button class="flex-1" @click="applyFilters">
              <Search class="w-4 h-4 mr-2" />
              查询
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 生产概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">生产订单数</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ productionStats.totalOrders }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 -lg flex items-center justify-center">
              <ClipboardList class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-blue-600">↗ +15.2%</span>
            <span class="text-xs text-muted-foreground ml-2">较上期</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">完成率</p>
              <p class="text-2xl font-bold text-green-600">{{ productionStats.completionRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-green-100 -lg flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-green-600">↗ +3.8%</span>
            <span class="text-xs text-muted-foreground ml-2">较上期</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">生产效率</p>
              <p class="text-2xl font-bold text-orange-600">{{ productionStats.efficiency }}%</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 -lg flex items-center justify-center">
              <TrendingUp class="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-orange-600">↗ +7.5%</span>
            <span class="text-xs text-muted-foreground ml-2">较上期</span>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">不良品率</p>
              <p class="text-2xl font-bold text-red-600">{{ productionStats.defectRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-red-100 -lg flex items-center justify-center">
              <AlertTriangle class="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-xs text-red-600">↘ -2.1%</span>
            <span class="text-xs text-muted-foreground ml-2">较上期</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- 生产趋势图 -->
    <Card>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">生产趋势分析</h3>
      </div>
      <div class="p-6">
        <div class="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 -lg">
          <div class="text-center text-muted-foreground">
            <BarChart3 class="w-16 h-16 mx-auto mb-4" />
            <p class="text-lg font-medium">生产趋势图</p>
            <p class="text-sm">图表组件将在后续版本中集成</p>
          </div>
        </div>
      </div>
    </Card>

    <!-- 生产明细表 -->
    <Card>
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold">生产订单明细</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">订单号</th>
              <th class="p-4 font-medium">产品名称</th>
              <th class="p-4 font-medium">计划数量</th>
              <th class="p-4 font-medium">完成数量</th>
              <th class="p-4 font-medium">车间</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in productionDetails"
              :key="order.id"
              class="border-b hover:bg-muted/50"
            >
              <td class="p-4 font-mono text-sm">{{ order.order_no }}</td>
              <td class="p-4">{{ order.product_name }}</td>
              <td class="p-4">{{ order.planned_quantity }}</td>
              <td class="p-4">{{ order.completed_quantity }}</td>
              <td class="p-4">{{ order.workshop_name }}</td>
              <td class="p-4">
                <span
                  :class="{
                    'bg-green-100 text-green-800': order.status === 'completed',
                    'bg-blue-100 text-blue-800': order.status === 'in_progress',
                    'bg-yellow-100 text-yellow-800': order.status === 'planned',
                    'bg-red-100 text-red-800': order.status === 'cancelled',
                  }"
                  class="px-2 py-1 -full text-xs font-medium"
                >
                  {{ getStatusName(order.status) }}
                </span>
              </td>
              <td class="p-4">
                <span
                  :class="
                    order.completion_rate >= 0.9
                      ? 'text-green-600'
                      : order.completion_rate >= 0.7
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  "
                >
                  {{ (order.completion_rate * 100).toFixed(1) }}%
                </span>
              </td>
            </tr>
            <tr v-if="productionDetails.length === 0">
              <td colspan="7" class="p-8 text-center text-muted-foreground">暂无生产数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- 车间生产排行 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">车间生产排行</h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div
              v-for="(workshop, index) in topWorkshops"
              :key="workshop.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 -full flex items-center justify-center text-white text-sm font-medium"
                  :class="{
                    'bg-yellow-500': index === 0,
                    'bg-gray-400': index === 1,
                    'bg-orange-500': index === 2,
                    'bg-blue-500': index > 2,
                  }"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium">{{ workshop.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ workshop.orders }}个订单</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">{{ workshop.completion_rate }}%</p>
                <p class="text-sm text-muted-foreground">{{ workshop.output }}件</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-4 border-b">
          <h3 class="text-lg font-semibold">产品生产排行</h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div
              v-for="(product, index) in topProducts"
              :key="product.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 -full flex items-center justify-center text-white text-sm font-medium"
                  :class="{
                    'bg-yellow-500': index === 0,
                    'bg-gray-400': index === 1,
                    'bg-orange-500': index === 2,
                    'bg-green-500': index > 2,
                  }"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium">{{ product.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ product.orders }}个订单</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-medium">{{ product.total_quantity }}件</p>
                <p class="text-sm text-muted-foreground">{{ product.completion_rate }}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Download,
  RefreshCw,
  Search,
  TrendingUp,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '生产报表 - ERP 管理系统',
})

// 数据管理
const { workshops } = useWorkshops()

// 响应式数据
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
})
const workshopFilter = ref('')

// 报表数据
const productionStats = ref({
  totalOrders: 156,
  completionRate: 87.5,
  efficiency: 92.3,
  defectRate: 2.1,
})

const productionDetails = ref([
  {
    id: '1',
    order_no: 'PO202501001',
    product_name: '智能手机A型',
    planned_quantity: 1000,
    completed_quantity: 950,
    workshop_name: '组装车间',
    status: 'completed',
    completion_rate: 0.95,
  },
  {
    id: '2',
    order_no: 'PO202501002',
    product_name: '笔记本电脑B型',
    planned_quantity: 500,
    completed_quantity: 420,
    workshop_name: '测试车间',
    status: 'in_progress',
    completion_rate: 0.84,
  },
  {
    id: '3',
    order_no: 'PO202501003',
    product_name: '平板电脑C型',
    planned_quantity: 800,
    completed_quantity: 720,
    workshop_name: '包装车间',
    status: 'in_progress',
    completion_rate: 0.9,
  },
])

const topWorkshops = ref([
  {
    id: '1',
    name: '组装车间',
    orders: 45,
    completion_rate: 95.2,
    output: 4500,
  },
  {
    id: '2',
    name: '测试车间',
    orders: 38,
    completion_rate: 88.7,
    output: 3800,
  },
  {
    id: '3',
    name: '包装车间',
    orders: 32,
    completion_rate: 92.1,
    output: 3200,
  },
  {
    id: '4',
    name: '质检车间',
    orders: 28,
    completion_rate: 85.3,
    output: 2800,
  },
  {
    id: '5',
    name: '维修车间',
    orders: 15,
    completion_rate: 78.9,
    output: 1500,
  },
])

const topProducts = ref([
  {
    id: '1',
    name: '智能手机A型',
    orders: 25,
    total_quantity: 25000,
    completion_rate: 96.5,
  },
  {
    id: '2',
    name: '笔记本电脑B型',
    orders: 18,
    total_quantity: 18000,
    completion_rate: 89.2,
  },
  {
    id: '3',
    name: '平板电脑C型',
    orders: 15,
    total_quantity: 15000,
    completion_rate: 91.8,
  },
  {
    id: '4',
    name: '智能手表D型',
    orders: 12,
    total_quantity: 12000,
    completion_rate: 87.3,
  },
  {
    id: '5',
    name: '耳机E型',
    orders: 10,
    total_quantity: 10000,
    completion_rate: 94.1,
  },
])

// 方法
const applyFilters = async () => {
  // TODO: 根据筛选条件重新加载数据
  console.log('应用筛选条件:', {
    dateRange: dateRange.value,
    workshop: workshopFilter.value,
  })
}

const refreshData = async () => {
  // TODO: 刷新报表数据
  console.log('刷新生产报表数据')
}

const exportReport = () => {
  // TODO: 导出报表
  console.log('导出生产报表')
}

const getStatusName = (status: string) => {
  const statuses = {
    planned: '已计划',
    in_progress: '生产中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return statuses[status as keyof typeof statuses] || status
}

// 初始化数据
onMounted(async () => {
  await applyFilters()
})
</script>
