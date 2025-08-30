<template>
  <div class="min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">车间管理</h1>
        <p class="text-muted-color">
          管理生产车间和工作中心，监控设备状态和产能
        </p>
      </div>
      <div>
        <Button class="create-btn" @click="showCreateDialog = true">
          <Plus class="mr-2 h-4 w-4" />
          新建车间
        </Button>
      </div>
    </div>

    <!-- 车间概览统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card
        class="border border-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-blue-600 mb-1">
                {{ stats.totalWorkshops }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">总车间数</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="h-3 w-3" />
                <span>+2</span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white"
            >
              <Factory class="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="border border-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-green-600 mb-1">
                {{ stats.activeWorkshops }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">运行中</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle class="h-3 w-3" />
                <span>正常</span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white"
            >
              <CheckCircle class="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="border border-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-orange-600 mb-1">
                {{ stats.maintenanceWorkshops }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">维护中</div>
              <div class="flex items-center gap-1 text-sm text-orange-600">
                <AlertTriangle class="h-3 w-3" />
                <span>需关注</span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white"
            >
              <AlertTriangle class="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="border border-border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-purple-600 mb-1">
                {{ stats.totalEquipment }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">设备总数</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="h-3 w-3" />
                <span>+5</span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white"
            >
              <Settings class="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 筛选器 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">筛选条件</CardTitle>
      </CardHeader>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-2">
            <Label>车间状态</Label>
            <Select v-model="statusFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
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

          <div class="flex flex-col gap-2">
            <Label>车间类型</Label>
            <Select v-model="typeFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <Label>负责人</Label>
            <Select v-model="managerFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择负责人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in managerOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <Label>搜索</Label>
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                placeholder="搜索车间名称、编码..."
                class="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 车间列表 -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle class="text-lg font-semibold">车间列表</CardTitle>
          <span class="text-sm text-muted-foreground"
            >共 {{ filteredWorkshops.length }} 个车间</span
          >
        </div>
      </CardHeader>
      <CardContent>
        <div
          v-if="filteredWorkshops.length === 0"
          class="text-center py-12 text-muted-foreground"
        >
          <Factory class="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 class="text-lg mb-2">暂无车间数据</h3>
          <p class="mb-4">开始创建您的第一个车间</p>
          <Button @click="showCreateDialog = true">
            <Plus class="mr-2 h-4 w-4" />
            新建车间
          </Button>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>车间名称</TableHead>
              <TableHead>车间类型</TableHead>
              <TableHead>负责人</TableHead>
              <TableHead>设备数量</TableHead>
              <TableHead>设计产能</TableHead>
              <TableHead>产能利用率</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="workshop in filteredWorkshops" :key="workshop.id">
              <TableCell>
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    <Factory class="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div class="font-medium mb-1">
                      {{ workshop.name }}
                    </div>
                    <div class="text-sm text-muted-foreground font-mono">
                      {{ workshop.code }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getTypeSeverity(workshop.type)">
                  {{ getTypeText(workshop.type) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback>{{
                      workshop.manager?.charAt(0) || "N"
                    }}</AvatarFallback>
                  </Avatar>
                  <span class="font-medium">{{
                    workshop.manager || "未指定"
                  }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-lg">{{
                    workshop.equipment_count
                  }}</span>
                  <span class="text-sm text-muted-foreground">台</span>
                </div>
              </TableCell>
              <TableCell>
                <span class="font-medium">{{ workshop.capacity }} 件/日</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <div class="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="{
                        'bg-green-500': workshop.utilization >= 80,
                        'bg-orange-500':
                          workshop.utilization >= 60 &&
                          workshop.utilization < 80,
                        'bg-red-500': workshop.utilization < 60,
                      }"
                      :style="{ width: `${workshop.utilization}%` }"
                    />
                  </div>
                  <span class="text-sm font-medium"
                    >{{ workshop.utilization }}%</span
                  >
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusSeverity(workshop.status)">
                  {{ getStatusText(workshop.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="viewWorkshop(workshop)"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="editWorkshop(workshop)"
                  >
                    <Edit class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="manageEquipment(workshop)"
                  >
                    <Settings class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="confirmDelete(workshop)"
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

    <!-- 新建/编辑车间对话框 -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{
            editingWorkshop ? "编辑车间" : "新建车间"
          }}</DialogTitle>
        </DialogHeader>

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label for="workshopCode">车间编码</Label>
              <Input
                id="workshopCode"
                v-model="workshopForm.code"
                placeholder="输入车间编码"
                :disabled="!!editingWorkshop"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="workshopName">车间名称</Label>
              <Input
                id="workshopName"
                v-model="workshopForm.name"
                placeholder="输入车间名称"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label for="workshopType">车间类型</Label>
              <Select v-model="workshopForm.type">
                <SelectTrigger id="workshopType">
                  <SelectValue placeholder="选择车间类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in typeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-col gap-2">
              <Label for="workshopStatus">状态</Label>
              <Select v-model="workshopForm.status">
                <SelectTrigger id="workshopStatus">
                  <SelectValue placeholder="选择状态" />
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
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label for="workshopManager">负责人</Label>
              <Input
                id="workshopManager"
                v-model="workshopForm.manager"
                placeholder="输入负责人姓名"
              />
            </div>
            <div class="flex flex-col gap-2">
              <Label for="workshopCapacity">设计产能（件/日）</Label>
              <Input
                id="workshopCapacity"
                v-model="workshopForm.capacity"
                type="number"
                placeholder="输入设计产能"
                :min="0"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Label for="workshopLocation">车间位置</Label>
            <Input
              id="workshopLocation"
              v-model="workshopForm.location"
              placeholder="输入车间位置"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label for="workshopDescription">描述</Label>
            <Textarea
              id="workshopDescription"
              v-model="workshopForm.description"
              placeholder="输入车间描述"
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <div class="flex justify-end gap-3">
            <Button variant="outline" @click="closeCreateDialog">
              <X class="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button @click="saveWorkshop" :disabled="saving">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              <Check v-else class="mr-2 h-4 w-4" />
              {{ saving ? "保存中..." : "保存车间" }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <!-- ConfirmDialog 已移除，需要手动实现确认对话框 -->
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import { Check, Loader2, Plus, Search, Trash2 } from 'lucide-vue-next';

// 页面状态
const loading = ref(false);
const saving = ref(false);
const statusFilter = ref('all');
const typeFilter = ref('all');
const managerFilter = ref('all');
const searchQuery = ref('');

// 对话框状态
const showCreateDialog = ref(false);
const editingWorkshop = ref<any>(null);

// 车间表单
const workshopForm = ref({
  code: '',
  name: '',
  type: '',
  status: 'active',
  manager: '',
  capacity: 0,
  location: '',
  description: '',
});

// 统计数据
const stats = ref({
  totalWorkshops: 12,
  activeWorkshops: 8,
  maintenanceWorkshops: 2,
  totalEquipment: 156,
});

// 状态选项
const statusOptions = ref([
  { label: '全部状态', value: 'all' },
  { label: '运行中', value: 'active' },
  { label: '维护中', value: 'maintenance' },
  { label: '停产', value: 'inactive' },
]);

// 类型选项
const typeOptions = ref([
  { label: '全部类型', value: 'all' },
  { label: '机械加工', value: 'machining' },
  { label: '装配', value: 'assembly' },
  { label: '检测', value: 'testing' },
  { label: '包装', value: 'packaging' },
  { label: '喷涂', value: 'painting' },
]);

// 负责人选项
const managerOptions = ref([
  { label: '全部负责人', value: 'all' },
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
]);

// 模拟车间数据
const workshops = ref([
  {
    id: '1',
    code: 'WS001',
    name: '机械加工车间A',
    type: 'machining',
    status: 'active',
    manager: '张三',
    equipment_count: 25,
    capacity: 500,
    utilization: 85,
    location: '1号厂房',
    description: '主要负责金属零件的精密加工',
  },
  {
    id: '2',
    code: 'WS002',
    name: '装配车间B',
    type: 'assembly',
    status: 'active',
    manager: '李四',
    equipment_count: 18,
    capacity: 300,
    utilization: 72,
    location: '2号厂房',
    description: '产品最终装配和调试',
  },
  {
    id: '3',
    code: 'WS003',
    name: '检测车间C',
    type: 'testing',
    status: 'maintenance',
    manager: '王五',
    equipment_count: 12,
    capacity: 200,
    utilization: 45,
    location: '3号厂房',
    description: '产品质量检测和认证',
  },
  {
    id: '4',
    code: 'WS004',
    name: '包装车间D',
    type: 'packaging',
    status: 'active',
    manager: '赵六',
    equipment_count: 8,
    capacity: 800,
    utilization: 90,
    location: '4号厂房',
    description: '产品包装和发货准备',
  },
]);

// 计算属性
const filteredWorkshops = computed(() => {
  let result = workshops.value;

  if (searchQuery.value) {
    result = result.filter(
      (workshop) =>
        workshop.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        workshop.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (statusFilter.value && statusFilter.value !== 'all') {
    result = result.filter(
      (workshop) => workshop.status === statusFilter.value
    );
  }

  if (typeFilter.value && typeFilter.value !== 'all') {
    result = result.filter((workshop) => workshop.type === typeFilter.value);
  }

  if (managerFilter.value && managerFilter.value !== 'all') {
    result = result.filter(
      (workshop) => workshop.manager === managerFilter.value
    );
  }

  return result;
});

// 方法
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    machining: '机械加工',
    assembly: '装配',
    testing: '检测',
    packaging: '包装',
    painting: '喷涂',
  };
  return typeMap[type] || type;
};

const getTypeSeverity = (type: string) => {
  const severityMap: Record<
    string,
    'default' | 'destructive' | 'outline' | 'secondary'
  > = {
    machining: 'secondary',
    assembly: 'default',
    testing: 'outline',
    packaging: 'secondary',
    painting: 'outline',
  };
  return severityMap[type] || 'secondary';
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '运行中',
    maintenance: '维护中',
    inactive: '停产',
  };
  return statusMap[status] || status;
};

const getStatusSeverity = (status: string) => {
  const severityMap: Record<
    string,
    'default' | 'destructive' | 'outline' | 'secondary'
  > = {
    active: 'default',
    maintenance: 'outline',
    inactive: 'destructive',
  };
  return severityMap[status] || 'secondary';
};

const viewWorkshop = (_workshop: any) => {
  // 这里可以实现查看详情功能
};

const editWorkshop = (workshop: any) => {
  editingWorkshop.value = workshop;
  Object.assign(workshopForm.value, {
    code: workshop.code,
    name: workshop.name,
    type: workshop.type,
    status: workshop.status,
    manager: workshop.manager,
    capacity: workshop.capacity,
    location: workshop.location,
    description: workshop.description,
  });
  showCreateDialog.value = true;
};

const manageEquipment = (_workshop: any) => {
  // 这里可以实现设备管理功能
};

const confirmDelete = (_workshop: any) => {
  // TODO: 需要重新实现确认对话框
};

const closeCreateDialog = () => {
  showCreateDialog.value = false;
  editingWorkshop.value = null;
  workshopForm.value = {
    code: '',
    name: '',
    type: '',
    status: 'active',
    manager: '',
    capacity: 0,
    location: '',
    description: '',
  };
};

const saveWorkshop = async () => {
  saving.value = true;
  try {
    if (editingWorkshop.value) {
      // 更新车间
      const index = workshops.value.findIndex(
        (w) => w.id === editingWorkshop.value?.id
      );
      if (index !== -1 && workshops.value[index]) {
        workshops.value[index] = {
          ...workshops.value[index],
          id: workshops.value[index]?.id,
          code: workshopForm.value.code,
          name: workshopForm.value.name,
          type: workshopForm.value.type,
          status: workshopForm.value.status,
          manager: workshopForm.value.manager,
          capacity: workshopForm.value.capacity,
          location: workshopForm.value.location,
          description: workshopForm.value.description,
        };
      }
    } else {
      // 新增车间
      const newWorkshop = {
        id: Date.now().toString(),
        code: workshopForm.value.code,
        name: workshopForm.value.name,
        type: workshopForm.value.type,
        status: workshopForm.value.status,
        manager: workshopForm.value.manager,
        equipment_count: 0,
        capacity: workshopForm.value.capacity,
        utilization: 0,
        location: workshopForm.value.location,
        description: workshopForm.value.description,
      };
      workshops.value.push(newWorkshop);
    }

    closeCreateDialog();
  } finally {
    saving.value = false;
  }
};
</script>
