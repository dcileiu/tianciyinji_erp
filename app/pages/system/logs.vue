<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-color">系统日志</h1>
        <p class="text-muted-color">查看和管理系统操作日志</p>
      </div>
      <div class="flex gap-2">
        <Button
          label="导出日志"
          icon="pi pi-download"
          outlined
          @click="exportLogs"
        />
        <Button
          label="清空日志"
          icon="pi pi-trash"
          severity="danger"
          outlined
          @click="confirmClearLogs"
        />
      </div>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label class="block text-sm font-medium mb-1 text-color">搜索</label>
            <InputText
              v-model="searchQuery"
              placeholder="用户名、操作内容..."
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-color">日志类型</label>
            <Dropdown
              v-model="logTypeFilter"
              :options="logTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="全部类型"
              show-clear
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-color">开始日期</label>
            <Calendar
              v-model="dateRange.start"
              placeholder="选择开始日期"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-color">结束日期</label>
            <Calendar
              v-model="dateRange.end"
              placeholder="选择结束日期"
              class="w-full"
            />
          </div>
          <div class="flex gap-2">
            <Button
              label="查询"
              icon="pi pi-search"
              class="flex-1"
              @click="applyFilters"
            />
            <Button
              label="重置"
              icon="pi pi-refresh"
              outlined
              class="flex-1"
              @click="resetFilters"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- 日志统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-color">总日志数</p>
              <p class="text-2xl font-bold text-blue-600">{{ logStats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <i class="pi pi-file text-blue-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-color">今日操作</p>
              <p class="text-2xl font-bold text-green-600">{{ logStats.today }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <i class="pi pi-calendar text-green-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-color">错误日志</p>
              <p class="text-2xl font-bold text-red-600">{{ logStats.errors }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>

      <Card>
        <template #content>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-color">活跃用户</p>
              <p class="text-2xl font-bold text-purple-600">{{ logStats.activeUsers }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <i class="pi pi-users text-purple-600 text-xl"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- 日志列表 -->
    <Card>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-color">日志记录</h3>
          <div class="text-sm text-muted-color">
            共 {{ filteredLogs.length }} 条记录
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="filteredLogs"
          :loading="loading"
          :paginator="true"
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          class="p-datatable-sm"
        >
          <Column field="type" header="类型" sortable>
            <template #body="slotProps">
              <Tag
                :value="getLogTypeDisplayName(slotProps.data.type)"
                :severity="getLogTypeSeverity(slotProps.data.type)"
              />
            </template>
          </Column>
          
          <Column field="user_name" header="用户" sortable>
            <template #body="slotProps">
              <div class="flex items-center space-x-2">
                <Avatar
                  :label="slotProps.data.user_name.charAt(0)"
                  shape="circle"
                  size="small"
                />
                <span class="font-medium">{{ slotProps.data.user_name }}</span>
              </div>
            </template>
          </Column>
          
          <Column field="action" header="操作" sortable>
            <template #body="slotProps">
              <span class="font-medium">{{ slotProps.data.action }}</span>
            </template>
          </Column>
          
          <Column field="resource" header="资源">
            <template #body="slotProps">
              <code class="bg-surface-100 px-2 py-1 rounded text-sm">
                {{ slotProps.data.resource }}
              </code>
            </template>
          </Column>
          
          <Column field="ip_address" header="IP地址">
            <template #body="slotProps">
              <span class="text-sm text-muted-color">{{ slotProps.data.ip_address }}</span>
            </template>
          </Column>
          
          <Column field="user_agent" header="用户代理">
            <template #body="slotProps">
              <span v-tooltip="slotProps.data.user_agent" class="text-sm text-muted-color">
                {{ truncateUserAgent(slotProps.data.user_agent) }}
              </span>
            </template>
          </Column>
          
          <Column field="status" header="状态" sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.status === 'success' ? '成功' : '失败'"
                :severity="slotProps.data.status === 'success' ? 'success' : 'danger'"
              />
            </template>
          </Column>
          
          <Column field="created_at" header="时间" sortable>
            <template #body="slotProps">
              <span class="text-sm text-muted-color">
                {{ formatDate(slotProps.data.created_at) }}
              </span>
            </template>
          </Column>
          
          <Column header="操作" :exportable="false">
            <template #body="slotProps">
              <Button
                v-tooltip="'查看详情'"
                icon="pi pi-eye"
                rounded
                text
                size="small"
                @click="viewLogDetail(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- 日志详情对话框 -->
    <Dialog
      v-model:visible="showLogDetail"
      header="日志详情"
      :style="{ width: '700px' }"
      modal
    >
      <template #default>
        <div v-if="selectedLog" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-color mb-1">日志类型</label>
              <Tag
                :value="getLogTypeDisplayName(selectedLog.type)"
                :severity="getLogTypeSeverity(selectedLog.type)"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-color mb-1">状态</label>
              <Tag
                :value="selectedLog.status === 'success' ? '成功' : '失败'"
                :severity="selectedLog.status === 'success' ? 'success' : 'danger'"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-color mb-1">用户</label>
              <p class="text-sm">{{ selectedLog.user_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-color mb-1">操作时间</label>
              <p class="text-sm">{{ formatDate(selectedLog.created_at) }}</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-color mb-1">操作</label>
            <p class="text-sm">{{ selectedLog.action }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-color mb-1">资源</label>
            <code class="bg-surface-100 px-2 py-1 rounded text-sm">
              {{ selectedLog.resource }}
            </code>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-color mb-1">IP地址</label>
              <p class="text-sm">{{ selectedLog.ip_address }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-color mb-1">请求方法</label>
              <p class="text-sm">{{ selectedLog.method }}</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-color mb-1">用户代理</label>
            <p class="text-sm break-words">{{ selectedLog.user_agent }}</p>
          </div>
          
          <div v-if="selectedLog.error_message">
            <label class="block text-sm font-medium text-color mb-1">错误信息</label>
            <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded border">
              <p class="text-sm text-red-600 dark:text-red-400">{{ selectedLog.error_message }}</p>
            </div>
          </div>
          
          <div v-if="selectedLog.request_data">
            <label class="block text-sm font-medium text-color mb-1">请求数据</label>
            <div class="bg-surface-100 p-3 rounded">
              <pre class="text-sm overflow-auto">{{ JSON.stringify(selectedLog.request_data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end">
          <Button
            label="关闭"
            icon="pi pi-times"
            outlined
            @click="showLogDetail = false"
          />
        </div>
      </template>
    </Dialog>
    
    <!-- 确认对话框 -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

// 页面配置
definePageMeta({
  layout: 'default'
})

useHead({
  title: '系统日志 - ERP 管理系统'
})

// 状态管理
const loading = ref(false)
const showLogDetail = ref(false)
const selectedLog = ref(null as any)
const confirm = useConfirm()

// 搜索和筛选
const searchQuery = ref('')
const logTypeFilter = ref('')
const dateRange = ref({
  start: null as Date | null,
  end: null as Date | null
})

// 统计数据
const logStats = ref({
  total: 12456,
  today: 234,
  errors: 12,
  activeUsers: 45
})

// 选项数据
const logTypeOptions = ref([
  { label: '登录日志', value: 'login' },
  { label: '操作日志', value: 'operation' },
  { label: '错误日志', value: 'error' },
  { label: '系统日志', value: 'system' }
])

// 模拟数据
const mockLogs = ref([
  {
    id: '1',
    type: 'login',
    user_name: '管理员',
    action: '用户登录',
    resource: '/api/auth/login',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    method: 'POST',
    status: 'success',
    created_at: new Date('2024-01-15 10:30:00'),
    request_data: { username: 'admin', remember: true },
    error_message: null
  },
  {
    id: '2',
    type: 'operation',
    user_name: '张三',
    action: '创建用户',
    resource: '/api/users',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    method: 'POST',
    status: 'success',
    created_at: new Date('2024-01-15 10:25:00'),
    request_data: { name: '李四', email: 'lisi@example.com' },
    error_message: null
  },
  {
    id: '3',
    type: 'error',
    user_name: '李四',
    action: '删除产品',
    resource: '/api/products/123',
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    method: 'DELETE',
    status: 'failed',
    created_at: new Date('2024-01-15 10:20:00'),
    request_data: null,
    error_message: '产品不存在或已被删除'
  },
  {
    id: '4',
    type: 'system',
    user_name: '系统',
    action: '系统启动',
    resource: '/system/startup',
    ip_address: '127.0.0.1',
    user_agent: 'System Process',
    method: 'SYSTEM',
    status: 'success',
    created_at: new Date('2024-01-15 09:00:00'),
    request_data: null,
    error_message: null
  }
])

// 计算属性
const filteredLogs = computed(() => {
  let result = mockLogs.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log =>
      log.user_name.toLowerCase().includes(query)
      || log.action.toLowerCase().includes(query)
      || log.resource.toLowerCase().includes(query)
    )
  }

  if (logTypeFilter.value) {
    result = result.filter(log => log.type === logTypeFilter.value)
  }

  if (dateRange.value.start && dateRange.value.end) {
    result = result.filter((log) => {
      const logDate = new Date(log.created_at)
      return logDate >= dateRange.value.start! && logDate <= dateRange.value.end!
    })
  }

  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

// 类型映射
const logTypeMap: Record<string, string> = {
  login: '登录日志',
  operation: '操作日志',
  error: '错误日志',
  system: '系统日志'
}

const logTypeSeverityMap: Record<string, string> = {
  login: 'info',
  operation: 'success',
  error: 'danger',
  system: 'secondary'
}

// 方法
const getLogTypeDisplayName = (type: string) => logTypeMap[type] || type

const getLogTypeSeverity = (type: string) => logTypeSeverityMap[type] || 'info'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const truncateUserAgent = (userAgent: string) => {
  return userAgent.length > 30 ? userAgent.substring(0, 30) + '...' : userAgent
}

const applyFilters = () => {
  // 筛选逻辑已在计算属性中处理
  console.log('应用筛选条件')
}

const resetFilters = () => {
  searchQuery.value = ''
  logTypeFilter.value = ''
  dateRange.value = {
    start: null,
    end: null
  }
}

const viewLogDetail = (log: any) => {
  selectedLog.value = log
  showLogDetail.value = true
}

const exportLogs = () => {
  console.log('导出日志')
}

const confirmClearLogs = () => {
  confirm.require({
    message: '确定要清空所有日志吗？此操作不可撤销！',
    header: '确认清空',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      clearLogs()
    }
  })
}

const clearLogs = () => {
  mockLogs.value = []
  logStats.value = {
    total: 0,
    today: 0,
    errors: 0,
    activeUsers: 0
  }
}

// 初始化
onMounted(() => {
  // 加载数据
})
</script> 
