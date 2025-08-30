<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-color">生产计划管理</h1>
        <p class="text-muted-color mt-1">
          制定和调整生产计划，优化生产资源配置
        </p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        新建计划
      </Button>
    </div>

    <!-- 计划概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-500/10 rounded-full">
              <CalendarIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">本周计划</p>
              <p class="text-2xl font-semibold">
                {{ planStats?.thisWeekPlans || 0 }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-500/10 rounded-full">
              <CheckCircle class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">执行中</p>
              <p class="text-2xl font-semibold">
                {{ planStats?.executing || 0 }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-500/10 rounded-full">
              <Clock class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">待审核</p>
              <p class="text-2xl font-semibold">
                {{ planStats?.pending || 0 }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-500/10 rounded-full">
              <TrendingUp class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                产能利用率
              </p>
              <p class="text-2xl font-semibold">
                {{ planStats?.capacityUtilization || 0 }}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 筛选和搜索 -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label class="text-sm font-medium mb-2 block">计划名称</Label>
            <Input
              v-model="searchQuery"
              placeholder="输入计划名称搜索"
              class="w-full"
            />
          </div>
          <div>
            <Label class="text-sm font-medium mb-2 block">计划状态</Label>
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
            <Label class="text-sm font-medium mb-2 block">车间</Label>
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
          <div class="flex items-end">
            <Button class="w-full" @click="resetFilters">
              <Filter class="mr-2 h-4 w-4" />
              重置筛选
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 生产计划表格 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-semibold">生产计划列表</CardTitle>
          <div class="flex items-center gap-2">
            <Button size="sm">
              <Search class="mr-2 h-4 w-4" />
              查询
            </Button>
            <Button size="sm" variant="outline">
              <Plus class="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox />
              </TableHead>
              <TableHead>计划名称</TableHead>
              <TableHead>车间</TableHead>
              <TableHead>开始日期</TableHead>
              <TableHead>结束日期</TableHead>
              <TableHead>订单数量</TableHead>
              <TableHead>已完成</TableHead>
              <TableHead>产能利用率</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="plan in filteredPlans" :key="plan.id">
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback>{{
                      plan.plan_name.charAt(0)
                    }}</AvatarFallback>
                  </Avatar>
                  <span class="font-medium">{{ plan.plan_name }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{{ plan.workshop_name }}</Badge>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ formatDate(plan.start_date) }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ formatDate(plan.end_date) }}
                </span>
              </TableCell>
              <TableCell>
                <span class="font-medium">{{ plan.total_orders }}</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ plan.completed_orders }}</span>
                  <div class="w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      class="h-full bg-blue-500 rounded-full"
                      :style="{
                        width: `${
                          (plan.completed_orders / plan.total_orders) * 100
                        }%`,
                      }"
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <span class="font-medium"
                    >{{ plan.capacity_utilization }}%</span
                  >
                  <div class="w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      class="h-full bg-green-500 rounded-full"
                      :style="{ width: `${plan.capacity_utilization}%` }"
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusSeverity(plan.status)">
                  {{ getStatusDisplayName(plan.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-1">
                  <Button variant="ghost" size="sm" @click="viewPlan(plan)">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="plan.status === 'draft' || plan.status === 'pending'"
                    variant="ghost"
                    size="sm"
                    @click="editPlan(plan)"
                  >
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="plan.status === 'draft'"
                    variant="ghost"
                    size="sm"
                    @click="submitPlan(plan)"
                  >
                    <Send class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="plan.status === 'pending'"
                    variant="ghost"
                    size="sm"
                    @click="approvePlan(plan)"
                  >
                    <Check class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="plan.status === 'approved'"
                    variant="ghost"
                    size="sm"
                    @click="startPlan(plan)"
                  >
                    <Play class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="
                      plan.status !== 'completed' && plan.status !== 'cancelled'
                    "
                    variant="ghost"
                    size="sm"
                    @click="confirmDeletePlan(plan)"
                  >
                    <Trash2 class="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- 生产计划对话框 -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>新建生产计划</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>计划名称 *</Label>
              <Input
                v-model="planForm.plan_name"
                placeholder="请输入计划名称"
                required
              />
            </div>

            <div class="space-y-2">
              <Label>车间 *</Label>
              <Select v-model="planForm.workshop_id">
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
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-color"
                >开始日期 *</label
              >
              <Input type="date" v-model="planForm.start_date" required />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-color"
                >结束日期 *</label
              >
              <Input type="date" v-model="planForm.end_date" required />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-color">计划说明</label>
            <Textarea
              v-model="planForm.description"
              placeholder="请输入计划说明"
              :rows="4"
            />
          </div>

          <!-- 计划订单列表 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-sm font-medium text-color"
                >计划订单</label
              >
              <Button variant="ghost" size="sm" @click="addPlanOrder">
                <Plus class="mr-2 h-4 w-4" />
                添加订单
              </Button>
            </div>

            <div class="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>计划数量</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="(order, index) in planForm.orders"
                    :key="index"
                  >
                    <TableCell>
                      <Select v-model="order.order_no">
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="选择订单" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="option in availableOrders"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input v-model="order.quantity" type="number" :min="1" />
                    </TableCell>
                    <TableCell>
                      <Select v-model="order.priority">
                        <SelectTrigger class="w-full">
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
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="removePlanOrder(index)"
                      >
                        <Trash2 class="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showCreateDialog = false">
              <X class="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button @click="savePlan" :disabled="saving">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              <Check v-else class="mr-2 h-4 w-4" />
              {{ saving ? "保存中..." : "保存计划" }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import { CheckCircle, Clock, Plus, Trash2 } from 'lucide-vue-next';

// 页面配置
definePageMeta({
  layout: 'default',
});

useHead({
  title: '生产计划管理 - ERP 管理系统',
});

// 状态管理
const loading = ref(false);
const saving = ref(false);
const showCreateDialog = ref(false);
const selectedPlans = ref([]);
// const confirm = useConfirm() // 已移除
// 筛选条件
const searchQuery = ref('');
const statusFilter = ref('all');
const workshopFilter = ref('all');

// 表单数据
const planForm = ref({
  plan_name: '',
  workshop_id: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  description: '',
  orders: [] as any[],
});

// 统计数据
const planStats = ref({
  thisWeekPlans: 12,
  executing: 8,
  pending: 3,
  capacityUtilization: 85,
});

// 选项数据
const statusOptions = ref([
  { label: '全部状态', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '待审核', value: 'pending' },
  { label: '已审核', value: 'approved' },
  { label: '执行中', value: 'executing' },
  { label: '已完成', value: 'completed' },
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
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' },
]);

const availableOrders = ref([
  { label: 'PO-2024-001', value: 'PO-2024-001' },
  { label: 'PO-2024-002', value: 'PO-2024-002' },
  { label: 'PO-2024-003', value: 'PO-2024-003' },
]);

// 模拟数据
const mockPlans = ref([
  {
    id: '1',
    plan_name: '第一季度生产计划',
    workshop_name: '装配车间',
    start_date: new Date('2024-01-15'),
    end_date: new Date('2024-03-31'),
    total_orders: 25,
    completed_orders: 18,
    capacity_utilization: 85,
    status: 'executing',
  },
  {
    id: '2',
    plan_name: '紧急订单生产计划',
    workshop_name: '机加工车间',
    start_date: new Date('2024-01-20'),
    end_date: new Date('2024-02-15'),
    total_orders: 8,
    completed_orders: 8,
    capacity_utilization: 95,
    status: 'completed',
  },
]);

// 计算属性
const filteredPlans = computed(() => {
  let result = mockPlans.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((plan) =>
      plan.plan_name.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value && statusFilter.value !== 'all') {
    result = result.filter((plan) => plan.status === statusFilter.value);
  }

  if (workshopFilter.value && workshopFilter.value !== 'all') {
    result = result.filter(
      (plan) => plan.workshop_name === workshopFilter.value
    );
  }

  return result;
});

// 映射对象
const statusMap: Record<string, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已审核',
  executing: '执行中',
  completed: '已完成',
  cancelled: '已取消',
};

const statusSeverityMap: Record<
  string,
  'default' | 'destructive' | 'outline' | 'secondary'
> = {
  draft: 'secondary',
  pending: 'outline',
  approved: 'secondary',
  executing: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status;
const getStatusSeverity = (status: string) =>
  statusSeverityMap[status] || 'secondary';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = 'all';
  workshopFilter.value = 'all';
};

// 修复所有下划线函数
const viewPlan = (_plan: any) => {};

const editPlan = (_plan: any) => {};

const submitPlan = async (_plan: any) => {
  // TODO: 需要重新实现确认对话框
};

const approvePlan = async (_plan: any) => {
  // TODO: 需要重新实现确认对话框
};

const startPlan = async (_plan: any) => {
  // TODO: 需要重新实现确认对话框
};

const confirmDeletePlan = (_plan: any) => {
  // TODO: 需要重新实现确认对话框
};

const addPlanOrder = () => {
  planForm.value.orders.push({
    order_no: '',
    quantity: 1,
    priority: 'medium',
  });
};

const removePlanOrder = (index: number) => {
  planForm.value.orders.splice(index, 1);
};

const savePlan = async () => {
  saving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newPlan = {
      id: Date.now().toString(),
      ...planForm.value,
      workshop_name:
        workshopOptions.value.find(
          (w) => w.value === planForm.value.workshop_id
        )?.label || '',
      total_orders: planForm.value.orders.length,
      completed_orders: 0,
      capacity_utilization: 0,
      status: 'draft',
    };

    mockPlans.value.push(newPlan as any);
    showCreateDialog.value = false;

    // 重置表单
    planForm.value = {
      plan_name: '',
      workshop_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      description: '',
      orders: [],
    };
  } catch (_error) {
  } finally {
    saving.value = false;
  }
};

// 初始化
onMounted(() => {
  // 加载数据
});
</script>
