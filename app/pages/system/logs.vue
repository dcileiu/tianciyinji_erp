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
        <Button variant="outline" @click="confirmClearLogs">
          <Trash2 class="w-4 h-4 mr-2" />
          清空日志
        </Button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <Card>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <Label class="text-sm font-medium mb-1">搜索</Label>
            <Input
              v-model="searchQuery"
              placeholder="用户名、操作内容..."
              class="w-full"
            />
          </div>
          <div>
            <Label class="text-sm font-medium mb-1">日志类型</Label>
            <Select v-model="logTypeFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem
                  v-for="option in logTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="text-sm font-medium mb-1">开始日期</Label>
            <Input v-model="dateRange.start" type="date" class="w-full" />
          </div>
          <div>
            <Label class="text-sm font-medium mb-1">结束日期</Label>
            <Input v-model="dateRange.end" type="date" class="w-full" />
          </div>
          <div class="flex gap-2">
            <Button class="flex-1" @click="applyFilters">
              <Search class="w-4 h-4 mr-2" />
              查询
            </Button>
            <Button variant="outline" class="flex-1" @click="resetFilters">
              <RefreshCw class="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 日志统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">总日志数</p>
              <p class="text-2xl font-bold text-blue-600">
                {{ logStats.total }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center"
            >
              <FileText class="text-blue-600 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">今日操作</p>
              <p class="text-2xl font-bold text-green-600">
                {{ logStats.today }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center"
            >
              <Calendar class="text-green-600 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">错误日志</p>
              <p class="text-2xl font-bold text-red-600">
                {{ logStats.errors }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center"
            >
              <AlertTriangle class="text-red-600 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">活跃用户</p>
              <p class="text-2xl font-bold text-purple-600">
                {{ logStats.activeUsers }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center"
            >
              <Users class="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 日志列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-semibold">日志记录</CardTitle>
          <div class="text-sm text-muted-foreground">
            共 {{ filteredLogs.length }} 条记录
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类型</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>资源</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>用户代理</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading">
                <TableCell colspan="9" class="text-center py-8">
                  <div class="flex items-center justify-center">
                    <div
                      class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"
                    ></div>
                    <span class="ml-2">加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-else-if="filteredLogs.length === 0">
                <TableCell
                  colspan="9"
                  class="text-center py-8 text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
              <TableRow v-for="log in filteredLogs" v-else :key="log.id">
                <TableCell>
                  <Badge
                    :variant="
                      getLogTypeSeverity(log.type) === 'destructive'
                        ? 'destructive'
                        : getLogTypeSeverity(log.type) === 'default'
                        ? 'default'
                        : 'secondary'
                    "
                  >
                    {{ getLogTypeDisplayName(log.type) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium"
                    >
                      {{ log.user_name.charAt(0) }}
                    </div>
                    <span class="font-medium">{{ log.user_name }}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span class="font-medium">{{ log.action }}</span>
                </TableCell>
                <TableCell>
                  <code class="bg-muted px-2 py-1 text-sm">
                    {{ log.resource }}
                  </code>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground">{{
                    log.ip_address
                  }}</span>
                </TableCell>
                <TableCell>
                  <span
                    class="text-sm text-muted-foreground"
                    :title="log.user_agent"
                  >
                    {{ truncateUserAgent(log.user_agent) }}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    :variant="
                      log.status === 'default' ? 'default' : 'destructive'
                    "
                  >
                    {{ log.status === "default" ? "成功" : "失败" }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground">
                    {{ formatDate(log.created_at) }}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" @click="viewLogDetail(log)">
                    <Eye class="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- 日志详情对话框 -->
    <Dialog v-model:open="showLogDetail">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>日志详情</DialogTitle>
        </DialogHeader>
        <div v-if="selectedLog" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium">日志类型</Label>
              <div class="mt-1">
                <Badge
                  :variant="
                    getLogTypeSeverity(selectedLog.type) === 'destructive'
                      ? 'destructive'
                      : getLogTypeSeverity(selectedLog.type) === 'default'
                      ? 'default'
                      : 'secondary'
                  "
                >
                  {{ getLogTypeDisplayName(selectedLog.type) }}
                </Badge>
              </div>
            </div>
            <div>
              <Label class="text-sm font-medium">状态</Label>
              <div class="mt-1">
                <Badge
                  :variant="
                    selectedLog.status === 'default' ? 'default' : 'destructive'
                  "
                >
                  {{ selectedLog.status === "default" ? "成功" : "失败" }}
                </Badge>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium">用户</Label>
              <p class="text-sm mt-1">{{ selectedLog.user_name }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium">操作时间</Label>
              <p class="text-sm mt-1">
                {{ formatDate(selectedLog.created_at) }}
              </p>
            </div>
          </div>

          <div>
            <Label class="text-sm font-medium">操作</Label>
            <p class="text-sm mt-1">{{ selectedLog.action }}</p>
          </div>

          <div>
            <Label class="text-sm font-medium">资源</Label>
            <code class="bg-muted px-2 py-1 text-sm mt-1 block">
              {{ selectedLog.resource }}
            </code>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium">IP地址</Label>
              <p class="text-sm mt-1">{{ selectedLog.ip_address }}</p>
            </div>
            <div>
              <Label class="text-sm font-medium">请求方法</Label>
              <p class="text-sm mt-1">{{ selectedLog.method }}</p>
            </div>
          </div>

          <div>
            <Label class="text-sm font-medium">用户代理</Label>
            <p class="text-sm break-words mt-1">{{ selectedLog.user_agent }}</p>
          </div>

          <div v-if="selectedLog.error_message">
            <Label class="text-sm font-medium">错误信息</Label>
            <div class="bg-red-50 dark:bg-red-900/20 p-3 border mt-1">
              <p class="text-sm text-red-600 dark:text-red-400">
                {{ selectedLog.error_message }}
              </p>
            </div>
          </div>

          <div v-if="selectedLog.request_data">
            <Label class="text-sm font-medium">请求数据</Label>
            <div class="bg-muted p-3 mt-1">
              <pre class="text-sm overflow-auto">{{
                JSON.stringify(selectedLog.request_data, null, 2)
              }}</pre>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showLogDetail = false">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import {
  AlertTriangle,
  Calendar,
  Download,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-vue-next";

import { toast } from "vue-sonner";

// 页面配置
definePageMeta({
  layout: "default",
});

useHead({
  title: "系统日志 - ERP 管理系统",
});

// 状态管理
const loading = ref(false);
const showLogDetail = ref(false);
const selectedLog = ref(null as any);

// 搜索和筛选
const searchQuery = ref("");
const logTypeFilter = ref("all");
const dateRange = ref({
  start: undefined as string | undefined,
  end: undefined as string | undefined,
});

// 统计数据
const logStats = ref({
  total: 12_456,
  today: 234,
  errors: 12,
  activeUsers: 45,
});

// 选项数据
const logTypeOptions = ref([
  { label: "登录日志", value: "login" },
  { label: "操作日志", value: "operation" },
  { label: "错误日志", value: "error" },
  { label: "系统日志", value: "system" },
]);

// 模拟数据
const mockLogs = ref([
  {
    id: "1",
    type: "login",
    user_name: "管理员",
    action: "用户登录",
    resource: "/api/auth/login",
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    method: "POST",
    status: "default",
    created_at: new Date("2024-01-15 10:30:00"),
    request_data: { username: "admin", remember: true },
    error_message: null,
  },
  {
    id: "2",
    type: "operation",
    user_name: "张三",
    action: "创建用户",
    resource: "/api/users",
    ip_address: "192.168.1.101",
    user_agent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    method: "POST",
    status: "default",
    created_at: new Date("2024-01-15 10:25:00"),
    request_data: { name: "李四", email: "lisi@example.com" },
    error_message: null,
  },
  {
    id: "3",
    type: "error",
    user_name: "李四",
    action: "删除产品",
    resource: "/api/products/123",
    ip_address: "192.168.1.102",
    user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    method: "DELETE",
    status: "failed",
    created_at: new Date("2024-01-15 10:20:00"),
    request_data: null,
    error_message: "产品不存在或已被删除",
  },
  {
    id: "4",
    type: "system",
    user_name: "系统",
    action: "系统启动",
    resource: "/system/startup",
    ip_address: "127.0.0.1",
    user_agent: "System Process",
    method: "SYSTEM",
    status: "default",
    created_at: new Date("2024-01-15 09:00:00"),
    request_data: null,
    error_message: null,
  },
]);

// 计算属性
const filteredLogs = computed(() => {
  let result = mockLogs.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (log) =>
        log.user_name.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query)
    );
  }

  if (logTypeFilter.value && logTypeFilter.value !== "all") {
    result = result.filter((log) => log.type === logTypeFilter.value);
  }

  if (dateRange.value.start && dateRange.value.end) {
    result = result.filter((log) => {
      const logDate = new Date(log.created_at);
      return (
        logDate >= new Date(dateRange.value.start!) &&
        logDate <= new Date(dateRange.value.end!)
      );
    });
  }

  return result.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

// 类型映射
const logTypeMap: Record<string, string> = {
  login: "登录日志",
  operation: "操作日志",
  error: "错误日志",
  system: "系统日志",
};

const logTypeSeverityMap: Record<
  string,
  "default" | "destructive" | "outline" | "secondary"
> = {
  login: "secondary",
  operation: "default",
  error: "destructive",
  system: "secondary",
};

// 方法
const getLogTypeDisplayName = (type: string) => logTypeMap[type] || type;

const getLogTypeSeverity = (type: string) =>
  logTypeSeverityMap[type] || "secondary";

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString("zh-CN");
};

const truncateUserAgent = (userAgent: string) => {
  return userAgent.length > 30 ? `${userAgent.substring(0, 30)}...` : userAgent;
};

const applyFilters = () => {};

const resetFilters = () => {
  searchQuery.value = "";
  logTypeFilter.value = "all";
  dateRange.value = {
    start: undefined,
    end: undefined,
  };
};

const viewLogDetail = (log: any) => {
  selectedLog.value = log;
  showLogDetail.value = true;
};

const exportLogs = () => {
  // 这里实现导出逻辑
  toast.success("日志已成功导出");
};

const confirmClearLogs = () => {
  if (confirm("确定要清空所有日志吗？此操作不可撤销。")) {
    clearLogs();
  }
};

const clearLogs = () => {
  // 这里实现清空逻辑
  mockLogs.value = [];
  logStats.value = {
    total: 0,
    today: 0,
    errors: 0,
    activeUsers: 0,
  };
  toast.success("所有日志已清空");
};

// 初始化
onMounted(() => {
  // 加载数据
});
</script>
