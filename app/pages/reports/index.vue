<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">报表分析</h1>
        <p class="text-muted-foreground">查看各类业务报表和数据分析，洞察经营趋势</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="exportAllReports">
          <Download class="mr-2 h-4 w-4" />
          导出报表
        </Button>
        <Button variant="outline" size="sm" @click="scheduleReports">
          <Calendar class="mr-2 h-4 w-4" />
          定时报表
        </Button>
      </div>
    </div>

    <!-- 报表概览统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">今日报表生成</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-blue-600">{{ reportStats.todayGenerated }}</p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +{{ reportStats.growthRate }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">较昨日增长</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
            >
              <FileText class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">热门报表</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-green-600">{{ reportStats.popularReports }}</p>
                <Badge variant="secondary" class="text-xs">销售报表</Badge>
              </div>
              <p class="text-xs text-muted-foreground">最受欢迎</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            >
              <BarChart3 class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">定时任务</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-orange-600">{{ reportStats.scheduledTasks }}</p>
                <Badge variant="outline" class="text-xs">活跃</Badge>
              </div>
              <p class="text-xs text-muted-foreground">正在运行</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900"
            >
              <Clock class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">数据更新</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-purple-600">
                  {{ reportStats.lastUpdateMinutes }}
                </p>
                <Badge variant="secondary" class="text-xs">分钟前</Badge>
              </div>
              <p class="text-xs text-muted-foreground">最后更新</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900"
            >
              <RefreshCw class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 报表分类 -->
    <div class="space-y-6">
      <!-- 销售报表 -->
      <div>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp class="h-5 w-5 text-green-600" />
          销售报表
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500"
            @click="navigateTo('/reports/sales')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <TrendingUp class="h-5 w-5 text-green-600" />
                    <h3 class="font-semibold">销售报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">销售数据统计和趋势分析</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 销售额统计</span>
                    <span>• 客户分析</span>
                    <span>• 产品排行</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
            @click="navigateTo('/reports/sales')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Users class="h-5 w-5 text-blue-600" />
                    <h3 class="font-semibold">客户报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">客户活跃度和价值分析</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 客户分布</span>
                    <span>• 消费习惯</span>
                    <span>• 留存率</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500"
            @click="navigateTo('/reports/sales')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Package class="h-5 w-5 text-purple-600" />
                    <h3 class="font-semibold">产品销量报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">产品销售表现和库存分析</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 销量排行</span>
                    <span>• 库存周转</span>
                    <span>• 毛利分析</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- 库存报表 -->
      <div>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package class="h-5 w-5 text-blue-600" />
          库存报表
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500"
            @click="navigateTo('/reports/inventory')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Package class="h-5 w-5 text-blue-600" />
                    <h3 class="font-semibold">库存状态报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">当前库存状态和预警分析</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 库存余量</span>
                    <span>• 预警提醒</span>
                    <span>• 安全库存</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500"
            @click="navigateTo('/reports/inventory')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <ArrowRightLeft class="h-5 w-5 text-orange-600" />
                    <h3 class="font-semibold">库存流转报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">库存流入流出和周转分析</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 出入库记录</span>
                    <span>• 周转率</span>
                    <span>• 滞销分析</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500"
            @click="navigateTo('/reports/inventory')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <AlertTriangle class="h-5 w-5 text-red-600" />
                    <h3 class="font-semibold">库存异常报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">库存异常和损耗统计</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 盘点差异</span>
                    <span>• 损耗统计</span>
                    <span>• 异常处理</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- 生产报表 -->
      <div>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings class="h-5 w-5 text-indigo-600" />
          生产报表
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500"
            @click="navigateTo('/reports/production')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Settings class="h-5 w-5 text-indigo-600" />
                    <h3 class="font-semibold">生产效率报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">生产线效率和产能分析</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 产能利用率</span>
                    <span>• 效率统计</span>
                    <span>• 设备状态</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500"
            @click="navigateTo('/reports/production')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <CheckCircle class="h-5 w-5 text-teal-600" />
                    <h3 class="font-semibold">质量控制报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">产品质量和合格率统计</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 合格率</span>
                    <span>• 缺陷统计</span>
                    <span>• 质量趋势</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-amber-500"
            @click="navigateTo('/reports/production')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <Clock class="h-5 w-5 text-amber-600" />
                    <h3 class="font-semibold">生产计划报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">生产计划执行和进度跟踪</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 计划完成率</span>
                    <span>• 交期达成</span>
                    <span>• 资源配置</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- 财务报表 -->
      <div>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign class="h-5 w-5 text-emerald-600" />
          财务报表
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500"
            @click="navigateTo('/finance/receipts')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <DollarSign class="h-5 w-5 text-emerald-600" />
                    <h3 class="font-semibold">收入报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">营业收入和利润分析</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 收入统计</span>
                    <span>• 利润分析</span>
                    <span>• 成本核算</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-rose-500"
            @click="navigateTo('/finance/payments')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <CreditCard class="h-5 w-5 text-rose-600" />
                    <h3 class="font-semibold">支出报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">运营支出和费用统计</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 支出分类</span>
                    <span>• 费用控制</span>
                    <span>• 预算对比</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          <Card
            class="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-cyan-500"
            @click="navigateTo('/finance/invoices')"
          >
            <CardContent class="p-6">
              <div class="flex items-start justify-between">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <FileText class="h-5 w-5 text-cyan-600" />
                    <h3 class="font-semibold">发票报表</h3>
                  </div>
                  <p class="text-sm text-muted-foreground">发票开具和税务统计</p>
                  <div class="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>• 开票统计</span>
                    <span>• 税额分析</span>
                    <span>• 合规检查</span>
                  </div>
                </div>
                <ChevronRight
                  class="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- 最近生成的报表 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <History class="h-5 w-5" />
          最近生成的报表
        </CardTitle>
        <CardDescription>查看最近生成的报表记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="report in recentReports"
            :key="report.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full"
                :class="getReportIconBg(report.type)"
              >
                <component
                  :is="getReportIcon(report.type)"
                  class="h-5 w-5"
                  :class="getReportIconColor(report.type)"
                />
              </div>
              <div class="space-y-1">
                <h4 class="font-medium">{{ report.name }}</h4>
                <p class="text-sm text-muted-foreground">{{ report.description }}</p>
                <div class="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{{ formatDate(report.createdAt) }}</span>
                  <span>{{ report.size }}</span>
                  <Badge :variant="getStatusVariant(report.status)" class="text-xs">
                    {{ getStatusText(report.status) }}
                  </Badge>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button variant="ghost" size="sm" @click="previewReport(report)">
                <Eye class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="downloadReport(report)">
                <Download class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="shareReport(report)">
                <Share class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  History,
  Package,
  RefreshCw,
  Settings,
  Share,
  TrendingUp,
  Users,
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default',
})

useHead({
  title: '报表分析 - 智能ERP管理系统',
})

interface ReportItem {
  id: string
  name: string
  description: string
  type: string
  status: string
  size: string
  createdAt: Date
}

// 统计数据
const reportStats = ref({
  todayGenerated: 24,
  growthRate: 15,
  popularReports: 5,
  scheduledTasks: 8,
  lastUpdateMinutes: 5,
})

// 最近生成的报表
const recentReports = ref<ReportItem[]>([
  {
    id: '1',
    name: '销售月度报表',
    description: '2024年1月销售数据统计',
    type: 'sales',
    status: 'completed',
    size: '2.4MB',
    createdAt: new Date('2024-01-20 14:30:00'),
  },
  {
    id: '2',
    name: '库存状态报表',
    description: '当前库存状态和预警分析',
    type: 'inventory',
    status: 'completed',
    size: '1.8MB',
    createdAt: new Date('2024-01-20 10:15:00'),
  },
  {
    id: '3',
    name: '生产效率报表',
    description: '本周生产线效率统计',
    type: 'production',
    status: 'processing',
    size: '3.2MB',
    createdAt: new Date('2024-01-19 16:45:00'),
  },
  {
    id: '4',
    name: '财务收支报表',
    description: '第一季度财务收支分析',
    type: 'finance',
    status: 'completed',
    size: '4.1MB',
    createdAt: new Date('2024-01-19 09:20:00'),
  },
  {
    id: '5',
    name: '客户分析报表',
    description: '客户活跃度和价值分析',
    type: 'customer',
    status: 'failed',
    size: '0MB',
    createdAt: new Date('2024-01-18 15:10:00'),
  },
])

// 方法
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const getReportIcon = (type: string) => {
  const iconMap: Record<string, typeof TrendingUp> = {
    sales: TrendingUp,
    inventory: Package,
    production: Settings,
    finance: DollarSign,
    customer: Users,
  }
  return iconMap[type] || FileText
}

const getReportIconBg = (type: string) => {
  const bgMap: Record<string, string> = {
    sales: 'bg-green-100 dark:bg-green-900',
    inventory: 'bg-blue-100 dark:bg-blue-900',
    production: 'bg-indigo-100 dark:bg-indigo-900',
    finance: 'bg-emerald-100 dark:bg-emerald-900',
    customer: 'bg-purple-100 dark:bg-purple-900',
  }
  return bgMap[type] || 'bg-gray-100 dark:bg-gray-900'
}

const getReportIconColor = (type: string) => {
  const colorMap: Record<string, string> = {
    sales: 'text-green-600 dark:text-green-400',
    inventory: 'text-blue-600 dark:text-blue-400',
    production: 'text-indigo-600 dark:text-indigo-400',
    finance: 'text-emerald-600 dark:text-emerald-400',
    customer: 'text-purple-600 dark:text-purple-400',
  }
  return colorMap[type] || 'text-gray-600 dark:text-gray-400'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    processing: '生成中',
    failed: '失败',
    scheduled: '已安排',
  }
  return statusMap[status] || status
}

const getStatusVariant = (status: string) => {
  const variantMap: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    completed: 'default',
    processing: 'secondary',
    failed: 'destructive',
    scheduled: 'outline',
  }
  return variantMap[status] || 'secondary'
}

const exportAllReports = () => {
  console.log('导出所有报表')
}

const scheduleReports = () => {
  console.log('设置定时报表')
}

const previewReport = (report: ReportItem) => {
  console.log('预览报表:', report.name)
}

const downloadReport = (report: ReportItem) => {
  console.log('下载报表:', report.name)
}

const shareReport = (report: ReportItem) => {
  console.log('分享报表:', report.name)
}
</script>
