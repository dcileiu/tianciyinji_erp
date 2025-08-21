<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-foreground">系统日志</h1>
        <p class="text-muted-foreground">查看和管理系统操作日志</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="exportLogs">
          <Download class="w-4 h-4 mr-2" />
          导出日志
        </Button>
        <Button variant="outline" @click="clearLogs" class="text-red-600 hover:text-red-700">
          <Trash2 class="w-4 h-4 mr-2" />
          清空日志
        </Button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1">搜索</label>
            <Input
              v-model="searchQuery"
              placeholder="用户名、操作内容..."
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">日志类型</label>
            <select v-model="logTypeFilter" class="w-full px-3 py-2 border rounded-md">
              <option value="">全部类型</option>
              <option value="login">登录日志</option>
              <option value="operation">操作日志</option>
              <option value="error">错误日志</option>
              <option value="system">系统日志</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">开始日期</label>
            <Input v-model="dateRange.start" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">结束日期</label>
            <Input v-model="dateRange.end" type="date" />
          </div>
          <div class="flex gap-2">
            <Button @click="applyFilters" class="flex-1">
              <Search class="w-4 h-4 mr-2" />
              查询
            </Button>
            <Button variant="outline" @click="resetFilters" class="flex-1">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- 日志统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">总日志数</p>
              <p class="text-2xl font-bold text-blue-600">{{ logStats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">今日日志</p>
              <p class="text-2xl font-bold text-green-600">{{ logStats.today }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">错误日志</p>
              <p class="text-2xl font-bold text-red-600">{{ logStats.errors }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">活跃用户</p>
              <p class="text-2xl font-bold text-purple-600">{{ logStats.activeUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 日志列表 -->
    <Card>
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="text-lg font-semibold">日志列表</h2>
        <div class="text-sm text-muted-foreground">
          共 {{ filteredLogs.length }} 条日志
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b">
            <tr class="text-left">
              <th class="p-4 font-medium">时间</th>
              <th class="p-4 font-medium">用户</th>
              <th class="p-4 font-medium">类型</th>
              <th class="p-4 font-medium">操作</th>
              <th class="p-4 font-medium">IP地址</th>
              <th class="p-4 font-medium">状态</th>
              <th class="p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id" class="border-b hover:bg-muted/50">
              <td class="p-4 text-sm">{{ formatDateTime(log.created_at) }}</td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    {{ log.username?.charAt(0)?.toUpperCase() }}
                  </div>
                  <span class="font-medium">{{ log.username }}</span>
                </div>
              </td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-blue-100 text-blue-800': log.type === 'login',
                    'bg-green-100 text-green-800': log.type === 'operation',
                    'bg-red-100 text-red-800': log.type === 'error',
                    'bg-purple-100 text-purple-800': log.type === 'system'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getLogTypeName(log.type) }}
                </span>
              </td>
              <td class="p-4 max-w-xs">
                <div class="truncate" :title="log.action">
                  {{ log.action }}
                </div>
              </td>
              <td class="p-4 font-mono text-sm">{{ log.ip_address }}</td>
              <td class="p-4">
                <span 
                  :class="{
                    'bg-green-100 text-green-800': log.status === 'success',
                    'bg-red-100 text-red-800': log.status === 'error',
                    'bg-yellow-100 text-yellow-800': log.status === 'warning'
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusName(log.status) }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" @click="viewLogDetail(log)">
                    <Eye class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="7" class="p-8 text-center text-muted-foreground">
                暂无日志数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="p-4 border-t flex justify-between items-center">
        <div class="text-sm text-muted-foreground">
          显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredLogs.length) }} 条，共 {{ filteredLogs.length }} 条
        </div>
        <div class="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="currentPage--"
            :disabled="currentPage <= 1"
          >
            上一页
          </Button>
          <span class="px-3 py-2 text-sm">
            第 {{ currentPage }} 页
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            @click="currentPage++"
            :disabled="currentPage >= totalPages"
          >
            下一页
          </Button>
        </div>
      </div>
    </Card>

    <!-- 日志详情对话框 -->
    <div v-if="showLogDetail" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">日志详情</h3>
          <Button variant="outline" size="sm" @click="showLogDetail = false">
            <X class="w-4 h-4" />
          </Button>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">用户</label>
              <p class="text-sm">{{ selectedLog?.username }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">IP地址</label>
              <p class="text-sm font-mono">{{ selectedLog?.ip_address }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">日志类型</label>
              <p class="text-sm">{{ getLogTypeName(selectedLog?.type) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">状态</label>
              <p class="text-sm">{{ getStatusName(selectedLog?.status) }}</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">操作内容</label>
            <p class="text-sm bg-gray-50 p-3 rounded">{{ selectedLog?.action }}</p>
          </div>
          
          <div v-if="selectedLog?.details">
            <label class="block text-sm font-medium mb-1">详细信息</label>
            <pre class="text-sm bg-gray-50 p-3 rounded overflow-auto">{{ selectedLog.details }}</pre>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">时间</label>
            <p class="text-sm">{{ formatDateTime(selectedLog?.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Download, Trash2, Search, RefreshCw, FileText, Calendar, 
  AlertTriangle, Users, Eye, X 
} from 'lucide-vue-next'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '系统日志 - ERP 管理系统'
})

// 数据管理
const { logs, getLogStats, exportLogs: exportLogsData, clearLogs: clearLogsData } = useSystemLogs()

// 响应式数据
const searchQuery = ref('')
const logTypeFilter = ref('')
const dateRange = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
})
const currentPage = ref(1)
const pageSize = ref(20)
const showLogDetail = ref(false)
const selectedLog = ref<any>(null)

// 日志统计
const logStats = ref({
  total: 1250,
  today: 45,
  errors: 12,
  activeUsers: 28
})

// 计算属性
const filteredLogs = computed(() => {
  let filtered = logs.value
  
  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(log => 
      log.username?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 类型过滤
  if (logTypeFilter.value) {
    filtered = filtered.filter(log => log.type === logTypeFilter.value)
  }
  
  // 日期过滤
  if (dateRange.value.start) {
    filtered = filtered.filter(log => log.created_at >= dateRange.value.start)
  }
  if (dateRange.value.end) {
    filtered = filtered.filter(log => log.created_at <= dateRange.value.end)
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / pageSize.value))

// 方法
const applyFilters = async () => {
  // TODO: 根据筛选条件重新加载数据
  console.log('应用筛选条件:', {
    search: searchQuery.value,
    type: logTypeFilter.value,
    dateRange: dateRange.value
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  logTypeFilter.value = ''
  dateRange.value = {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  }
}

const exportLogs = async () => {
  try {
    await exportLogsData({
      search: searchQuery.value,
      type: logTypeFilter.value,
      dateRange: dateRange.value
    })
  } catch (error) {
    console.error('导出日志失败:', error)
  }
}

const clearLogs = async () => {
  if (confirm('确定要清空所有日志吗？此操作不可恢复！')) {
    try {
      await clearLogsData()
      // 重新加载数据
    } catch (error) {
      console.error('清空日志失败:', error)
    }
  }
}

const viewLogDetail = (log: any) => {
  selectedLog.value = log
  showLogDetail.value = true
}

const getLogTypeName = (type: string) => {
  const types = {
    login: '登录日志',
    operation: '操作日志',
    error: '错误日志',
    system: '系统日志'
  }
  return types[type as keyof typeof types] || type
}

const getStatusName = (status: string) => {
  const statuses = {
    success: '成功',
    error: '失败',
    warning: '警告'
  }
  return statuses[status as keyof typeof statuses] || status
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 初始化数据
onMounted(async () => {
  await applyFilters()
})
</script> 