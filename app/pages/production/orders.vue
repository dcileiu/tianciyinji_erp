<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">生产订单管理</h1>
        <p class="text-muted-foreground mt-1">管理和跟踪生产订单的执行情况</p>
      </div>
      <Button @click="handleCreate">
        <Plus class="mr-2 h-4 w-4" />
        新增订单
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2"
              >订单号/产品名称</label
            >
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                placeholder="搜索订单号或产品名称"
                class="w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">订单状态</label>
            <Select v-model="statusFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">车间</label>
            <Select v-model="workshopFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="全部车间" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in workshopOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">优先级</label>
            <Select v-model="priorityFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="全部优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in priorityOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-end">
            <Button class="w-full" @click="resetFilters">
              <RotateCcw class="mr-2 h-4 w-4" />
              重置筛选
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">今日新增</p>
              <p class="text-2xl font-bold">
                {{ orderStats.todayNew }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <Plus class="text-blue-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">生产中</p>
              <p class="text-2xl font-bold">
                {{ orderStats.producing }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <Settings class="text-green-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">已完工</p>
              <p class="text-2xl font-bold">
                {{ orderStats.completed }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <CheckCircle class="text-purple-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">延期订单</p>
              <p class="text-2xl font-bold text-red-600">
                {{ orderStats.delayed }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <AlertTriangle class="text-red-600 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 生产订单列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-semibold">生产订单列表</CardTitle>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            共 {{ totalCount }} 条记录
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead>计划数量</TableHead>
              <TableHead>已生产</TableHead>
              <TableHead>车间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>优先级</TableHead>
              <TableHead>开始日期</TableHead>
              <TableHead>预期完成日期</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="order in filteredOrders" :key="order.id">
              <TableCell>
                <code class="bg-gray-100 px-2 py-1 text-sm font-mono rounded">
                  {{ order.order_no }}
                </code>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback>{{
                      order.product_name.charAt(0)
                    }}</AvatarFallback>
                  </Avatar>
                  <span class="font-medium">{{ order.product_name }}</span>
                </div>
              </TableCell>
              <TableCell>
                <span class="font-medium">{{
                  order.quantity.toLocaleString()
                }}</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <span class="font-medium">
                    {{ order.produced_quantity.toLocaleString() }}
                  </span>
                  <div class="w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      class="h-full bg-blue-500 rounded-full"
                      :style="{
                        width: `${
                          (order.produced_quantity / order.quantity) * 100
                        }%`,
                      }"
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{ order.workshop_name }}</Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusSeverity(order.status)">
                  {{ getStatusDisplayName(order.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="getPrioritySeverity(order.priority)">
                  {{ getPriorityDisplayName(order.priority) }}
                </Badge>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ formatDate(order.start_date) }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm" :class="getDueDateClass(order.due_date)">
                  {{ formatDate(order.due_date) }}
                </span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-1">
                  <Button variant="ghost" size="sm" @click="viewOrder(order)">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="
                      order.status !== 'completed' &&
                      order.status !== 'cancelled'
                    "
                    variant="ghost"
                    size="sm"
                    @click="editOrder(order)"
                  >
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="order.status === 'pending'"
                    variant="ghost"
                    size="sm"
                    @click="confirmOrder(order)"
                  >
                    <Check class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="order.status === 'confirmed'"
                    variant="ghost"
                    size="sm"
                    @click="startProduction(order)"
                  >
                    <Play class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="order.status === 'producing'"
                    variant="ghost"
                    size="sm"
                    @click="completeProduction(order)"
                  >
                    <CheckCircle class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="
                      order.status !== 'completed' &&
                      order.status !== 'cancelled'
                    "
                    variant="ghost"
                    size="sm"
                    @click="confirmCancelOrder(order)"
                  >
                    <X class="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 生产订单对话框 -->
    <Dialog v-model:open="showOrderDialog">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{{
            editingOrder ? "编辑生产订单" : "新建生产订单"
          }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>订单号</Label>
              <Input
                v-model="orderForm.order_no"
                :disabled="true"
                placeholder="系统自动生成"
              />
            </div>

            <div class="space-y-2">
              <Label>产品名称 *</Label>
              <Select
                v-model="orderForm.product_id"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择产品" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in productOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label>计划数量 *</Label>
              <Input
                v-model="orderForm.quantity"
                type="number"
                :min="1"
                placeholder="输入计划数量"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>

            <div class="space-y-2">
              <Label>车间 *</Label>
              <Select
                v-model="orderForm.workshop_id"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择车间" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in workshopOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>优先级</Label>
              <Select
                v-model="orderForm.priority"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择优先级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in priorityOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>开始日期 *</Label>
              <Input
                type="date"
                v-model="orderForm.start_date"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>

            <div class="space-y-2">
              <Label>预期完成日期 *</Label>
              <Input
                type="date"
                v-model="orderForm.due_date"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>订单说明</Label>
            <Textarea
              v-model="orderForm.notes"
              placeholder="请输入订单说明"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>
        </div>

        <DialogFooter>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="closeOrderDialog">
              <X class="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button
              v-if="dialogMode !== 'view'"
              :loading="saving"
              @click="saveOrder"
            >
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              <Save v-else class="mr-2 h-4 w-4" />
              {{ saving ? "保存中..." : "保存订单" }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Edit,
  Eye,
  Loader2,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  X,
} from 'lucide-vue-next';

// 页面配置
definePageMeta({
  layout: 'default',
  requiresAuth: true,
  permission: 'production-order:view',
});

useHead({
  title: '生产订单管理 - ERP 管理系统',
});

// 状态管理
const loading = ref(false);
const saving = ref(false);
const showOrderDialog = ref(false);
const dialogMode = ref<'view' | 'create' | 'edit'>('view');
const editingOrder = ref<any>(null);
// 筛选条件
const searchQuery = ref('');
const statusFilter = ref('all');
const workshopFilter = ref('all');
const priorityFilter = ref('all');

// 表单数据
const orderForm = ref({
  order_no: '',
  product_id: '',
  quantity: 1,
  workshop_id: '',
  priority: 'medium',
  start_date: new Date().toISOString().split('T')[0],
  due_date: '',
  notes: '',
});

// 选项数据
const statusOptions = ref([
  { label: '全部状态', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '生产中', value: 'producing' },
  { label: '已完工', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]);

const workshopOptions = ref([
  { label: '全部车间', value: 'all' },
  { label: '装配车间', value: 'assembly' },
  { label: '机加工车间', value: 'machining' },
  { label: '喷涂车间', value: 'painting' },
  { label: '包装车间', value: 'packaging' },
]);

const priorityOptions = ref([
  { label: '全部优先级', value: 'all' },
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
]);

const productOptions = ref([
  { label: '产品A', value: 'product-a' },
  { label: '产品B', value: 'product-b' },
  { label: '产品C', value: 'product-c' },
]);

// 统计数据
const orderStats = ref({
  todayNew: 8,
  producing: 15,
  completed: 42,
  delayed: 3,
});

// 模拟数据
const mockOrders = ref([
  {
    id: '1',
    order_no: 'PO-2024-001',
    product_name: '智能手机组件',
    quantity: 1000,
    produced_quantity: 750,
    workshop_name: '装配车间',
    status: 'producing',
    priority: 'high',
    start_date: new Date('2024-01-15'),
    due_date: new Date('2024-01-25'),
    notes: '紧急订单，需优先生产',
  },
  {
    id: '2',
    order_no: 'PO-2024-002',
    product_name: '电脑配件',
    quantity: 500,
    produced_quantity: 500,
    workshop_name: '机加工车间',
    status: 'completed',
    priority: 'medium',
    start_date: new Date('2024-01-10'),
    due_date: new Date('2024-01-20'),
    notes: '常规生产订单',
  },
]);

// 计算属性
const filteredOrders = computed(() => {
  let result = mockOrders.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (order) =>
        order.order_no.toLowerCase().includes(query) ||
        order.product_name.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value && statusFilter.value !== 'all') {
    result = result.filter((order) => order.status === statusFilter.value);
  }

  if (workshopFilter.value && workshopFilter.value !== 'all') {
    result = result.filter(
      (order) => order.workshop_name === workshopFilter.value
    );
  }

  if (priorityFilter.value && priorityFilter.value !== 'all') {
    result = result.filter((order) => order.priority === priorityFilter.value);
  }

  return result;
});

const totalCount = computed(() => mockOrders.value.length);

// 映射对象
const statusMap: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  producing: '生产中',
  completed: '已完工',
  cancelled: '已取消',
};

const statusSeverityMap: Record<
  string,
  'default' | 'destructive' | 'outline' | 'secondary'
> = {
  pending: 'outline',
  confirmed: 'secondary',
  producing: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

const priorityMap: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const prioritySeverityMap: Record<
  string,
  'default' | 'destructive' | 'outline' | 'secondary'
> = {
  low: 'secondary',
  medium: 'secondary',
  high: 'outline',
  urgent: 'destructive',
};

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status;
const getStatusSeverity = (status: string) =>
  statusSeverityMap[status] || 'secondary';
const getPriorityDisplayName = (priority: string) =>
  priorityMap[priority] || priority;
const getPrioritySeverity = (priority: string) =>
  prioritySeverityMap[priority] || 'secondary';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

const getDueDateClass = (dueDate: Date) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) {
    return 'text-red-600'; // 已过期
  }
  if (diffDays <= 3) {
    return 'text-orange-600'; // 即将到期
  }
  return 'text-muted-color'; // 正常
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  workshopFilter.value = 'all';
  priorityFilter.value = 'all';
};

const handleCreate = () => {
  editingOrder.value = null;
  dialogMode.value = 'create';
  orderForm.value = {
    order_no: `PO-${Date.now()}`,
    product_id: '',
    quantity: 1,
    workshop_id: '',
    priority: 'medium',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
  };
  showOrderDialog.value = true;
};

const viewOrder = (order: any) => {
  editingOrder.value = order;
  dialogMode.value = 'view';
  Object.assign(orderForm.value, {
    ...order,
    start_date:
      order.start_date instanceof Date
        ? order.start_date.toISOString().split('T')[0]
        : order.start_date,
    due_date:
      order.due_date instanceof Date
        ? order.due_date.toISOString().split('T')[0]
        : order.due_date,
  });
  showOrderDialog.value = true;
};

const editOrder = (order: any) => {
  editingOrder.value = order;
  dialogMode.value = 'edit';
  Object.assign(orderForm.value, {
    ...order,
    start_date:
      order.start_date instanceof Date
        ? order.start_date.toISOString().split('T')[0]
        : order.start_date,
    due_date:
      order.due_date instanceof Date
        ? order.due_date.toISOString().split('T')[0]
        : order.due_date,
  });
  showOrderDialog.value = true;
};

const confirmOrder = async (_order: any) => {
  // TODO: 需要重新实现确认对话框
};

const startProduction = async (_order: any) => {
  // TODO: 需要重新实现确认对话框
};

const completeProduction = async (_order: any) => {
  // TODO: 需要重新实现确认对话框
};

const confirmCancelOrder = (_order: any) => {
  // TODO: 需要重新实现确认对话框
};

const closeOrderDialog = () => {
  showOrderDialog.value = false;
  editingOrder.value = null;
};

const saveOrder = async () => {
  saving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (dialogMode.value === 'create') {
      const newOrder = {
        id: Date.now().toString(),
        ...orderForm.value,
        product_name:
          productOptions.value.find(
            (p) => p.value === orderForm.value.product_id
          )?.label || '',
        workshop_name:
          workshopOptions.value.find(
            (w) => w.value === orderForm.value.workshop_id
          )?.label || '',
        status: 'pending',
        produced_quantity: 0,
        start_date: orderForm.value.start_date
          ? new Date(orderForm.value.start_date)
          : new Date(),
        due_date: orderForm.value.due_date
          ? new Date(orderForm.value.due_date)
          : new Date(),
      };
      mockOrders.value.push(newOrder as any);
    } else if (dialogMode.value === 'edit') {
      const index = mockOrders.value.findIndex(
        (o) => o.id === editingOrder.value?.id
      );
      if (index !== -1 && mockOrders.value[index]) {
        mockOrders.value[index] = {
          ...mockOrders.value[index],
          ...orderForm.value,
          product_name:
            productOptions.value.find(
              (p) => p.value === orderForm.value.product_id
            )?.label || mockOrders.value[index]?.product_name,
          workshop_name:
            workshopOptions.value.find(
              (w) => w.value === orderForm.value.workshop_id
            )?.label || mockOrders.value[index]?.workshop_name,
          start_date: orderForm.value.start_date
            ? new Date(orderForm.value.start_date)
            : new Date(),
          due_date: orderForm.value.due_date
            ? new Date(orderForm.value.due_date)
            : new Date(),
        };
      }
    }

    closeOrderDialog();
  } catch (_error) {
  } finally {
    saving.value = false;
  }
};

// 初始化
onMounted(() => {
  // 这里可以加载实际数据
});
</script>
