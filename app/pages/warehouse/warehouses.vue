<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">仓库管理</h1>
        <p class="text-muted-foreground mt-2">管理仓库基础信息和库位设置</p>
      </div>
      <Button @click="openWarehouseDialog()">
        <Plus class="mr-2 h-4 w-4" />
        新建仓库
      </Button>
    </div>

    <!-- 筛选区域 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Search class="h-5 w-5" />
          搜索与筛选
        </CardTitle>
        <CardDescription>快速查找仓库信息</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>仓库类型</Label>
            <Select v-model="filters.type">
              <SelectTrigger>
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem
                  v-for="type in typeOptions"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>状态</Label>
            <Select v-model="filters.status">
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem
                  v-for="status in statusOptions"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>搜索</Label>
            <div class="relative">
              <Search
                class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                v-model="filters.search"
                placeholder="搜索仓库名称、编码..."
                class="pl-9"
              />
            </div>
          </div>
          <div class="flex items-end gap-2">
            <Button variant="outline" @click="loadWarehouses">
              <RefreshCw class="mr-2 h-4 w-4" />
              刷新
            </Button>
            <Button variant="outline" @click="exportWarehouses">
              <Download class="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 仓库列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <Warehouse class="h-5 w-5" />
              仓库列表
            </CardTitle>
            <CardDescription> 共 {{ totalCount }} 个仓库 </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-4">
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-center space-x-4 p-4 border rounded-lg"
          >
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
            <Skeleton class="h-8 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
        </div>

        <div
          v-else-if="filteredWarehouses.length === 0"
          class="text-center py-16"
        >
          <Warehouse class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 class="text-xl font-semibold mb-4">暂无仓库</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            没有找到符合条件的仓库。请检查筛选条件或创建新的仓库。
          </p>
          <Button @click="openWarehouseDialog()">
            <Plus class="mr-2 h-4 w-4" />
            新建仓库
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="warehouse in filteredWarehouses"
            :key="warehouse.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
              >
                <Warehouse class="h-6 w-6 text-primary" />
              </div>
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold">{{ warehouse.name }}</h3>
                  <Badge
                    :variant="getStatusSeverity(warehouse.status)"
                    class="text-xs"
                  >
                    {{ getStatusDisplayName(warehouse.status) }}
                  </Badge>
                  <Badge
                    :variant="getTypeSeverity(warehouse.type)"
                    class="text-xs"
                  >
                    {{ getTypeDisplayName(warehouse.type) }}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground font-mono">
                  {{ warehouse.warehouse_no }}
                </p>
                <div
                  class="flex items-center space-x-4 text-sm text-muted-foreground"
                >
                  <div
                    v-if="warehouse.location"
                    class="flex items-center space-x-1"
                  >
                    <MapPin class="h-4 w-4" />
                    <span>{{ warehouse.location }}</span>
                  </div>
                  <div
                    v-if="warehouse.manager"
                    class="flex items-center space-x-1"
                  >
                    <User class="h-4 w-4" />
                    <span>{{ warehouse.manager }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                @click="viewWarehouse(warehouse)"
              >
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="editWarehouse(warehouse)"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="manageLocations(warehouse)"
              >
                <Settings class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="confirmDeleteWarehouse(warehouse)"
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 仓库对话框 -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Warehouse class="h-5 w-5" />
            {{ editingWarehouse ? "编辑仓库" : "新建仓库" }}
          </DialogTitle>
          <DialogDescription>管理仓库基础信息</DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>仓库编码 *</Label>
              <Input
                v-model="warehouseForm.warehouse_no"
                placeholder="请输入仓库编码"
              />
            </div>

            <div class="space-y-2">
              <Label>仓库名称 *</Label>
              <Input
                v-model="warehouseForm.name"
                placeholder="请输入仓库名称"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>仓库类型 *</Label>
              <Select v-model="warehouseForm.type">
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="type in typeOptions"
                    :key="type.value"
                    :value="type.value"
                  >
                    {{ type.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>状态</Label>
              <Select v-model="warehouseForm.status">
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in statusOptions"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label>仓库地址</Label>
            <Input
              v-model="warehouseForm.location"
              placeholder="请输入仓库地址"
            />
          </div>

          <div class="space-y-2">
            <Label>负责人</Label>
            <Input
              v-model="warehouseForm.manager"
              placeholder="请输入负责人姓名"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeDialog">取消</Button>
          <Button :disabled="saving" @click="saveWarehouse">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            确认保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Download,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  User,
  Warehouse,
} from 'lucide-vue-next';
import type { Warehouse as WarehouseType } from '~/types/database';

// 页面配置
definePageMeta({
  layout: 'default',
  requiresAuth: true,
  permission: 'warehouse:settings',
});

useHead({
  title: '仓库管理 - ERP 管理系统',
});

// 状态管理
const loading = ref(false);
const saving = ref(false);
const showDialog = ref(false);
const editingWarehouse = ref(null as any);

// 筛选条件
const filters = ref({
  type: 'all',
  status: 'all',
  search: '',
});

// 表单数据
const warehouseForm = ref({
  warehouse_no: '',
  name: '',
  type: 'raw_material' as 'main' | 'raw_material' | 'finished_goods' | 'backup',
  location: '',
  manager: '',
  status: 'active' as 'active' | 'inactive',
});

// 选项数据
const typeOptions = ref([
  { label: '主仓库', value: 'main' },
  { label: '原料仓', value: 'raw_material' },
  { label: '成品仓', value: 'finished_goods' },
  { label: '备用仓', value: 'backup' },
]);

const statusOptions = ref([
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
]);

// 模拟数据
const mockWarehouses = ref<WarehouseType[]>([
  {
    id: '1',
    warehouse_no: 'WH001',
    name: '原料仓库A',
    type: 'raw_material',
    location: '工业园区A栋1层',
    manager: '张三',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    warehouse_no: 'WH002',
    name: '成品仓库B',
    type: 'finished_goods',
    location: '工业园区B栋2层',
    manager: '李四',
    status: 'active',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    warehouse_no: 'WH003',
    name: '工具仓库C',
    type: 'backup',
    location: '工业园区C栋1层',
    manager: '王五',
    status: 'inactive',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
]);

// 计算属性
const filteredWarehouses = computed(() => {
  let result = mockWarehouses.value;

  if (filters.value.search) {
    const query = filters.value.search.toLowerCase();
    result = result.filter(
      (warehouse) =>
        warehouse.name.toLowerCase().includes(query) ||
        warehouse.warehouse_no.toLowerCase().includes(query)
    );
  }

  if (filters.value.type && filters.value.type !== 'all') {
    result = result.filter(
      (warehouse) => warehouse.type === filters.value.type
    );
  }

  if (filters.value.status && filters.value.status !== 'all') {
    result = result.filter(
      (warehouse) => warehouse.status === filters.value.status
    );
  }

  return result;
});

const totalCount = computed(() => mockWarehouses.value.length);

// 类型映射
const typeMap: Record<string, string> = {
  main: '主仓库',
  raw_material: '原料仓',
  finished_goods: '成品仓',
  backup: '备用仓',
};

const statusMap: Record<string, string> = {
  active: '启用',
  inactive: '停用',
};

const typeSeverityMap: Record<
  string,
  'default' | 'destructive' | 'outline' | 'secondary'
> = {
  main: 'secondary',
  raw_material: 'secondary',
  finished_goods: 'default',
  backup: 'secondary',
};

const statusSeverityMap: Record<
  string,
  'default' | 'destructive' | 'outline' | 'secondary'
> = {
  active: 'default',
  inactive: 'destructive',
};

// 方法
const getTypeDisplayName = (type: string) => typeMap[type] || type;

const getTypeSeverity = (type: string) => typeSeverityMap[type] || 'secondary';

const getStatusDisplayName = (status: string) => statusMap[status] || status;

const getStatusSeverity = (status: string) =>
  statusSeverityMap[status] || 'secondary';

const loadWarehouses = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (_error) {
  } finally {
    loading.value = false;
  }
};

const openWarehouseDialog = (warehouse: any = null) => {
  if (warehouse) {
    editingWarehouse.value = warehouse;
    Object.assign(warehouseForm.value, {
      warehouse_no: warehouse.warehouse_no,
      name: warehouse.name,
      type: warehouse.type,
      location: warehouse.location,
      manager: warehouse.manager,
      status: warehouse.status,
    });
  } else {
    editingWarehouse.value = null;
    Object.assign(warehouseForm.value, {
      warehouse_no: '',
      name: '',
      type: 'raw_material',
      location: '',
      manager: '',
      status: 'active',
    });
  }
  showDialog.value = true;
};

const viewWarehouse = (_warehouse: any) => {};

const editWarehouse = (warehouse: any) => {
  openWarehouseDialog(warehouse);
};

const manageLocations = (_warehouse: any) => {};

const closeDialog = () => {
  showDialog.value = false;
  editingWarehouse.value = null;
};

const saveWarehouse = async () => {
  saving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (editingWarehouse.value) {
      // 更新仓库
      const index = mockWarehouses.value.findIndex(
        (w) => w.id === editingWarehouse.value.id
      );
      if (index !== -1) {
        const existingWarehouse = mockWarehouses.value[index];
        if (existingWarehouse) {
          mockWarehouses.value[index] = {
            id: existingWarehouse.id, // 确保 id 始终存在
            warehouse_no: warehouseForm.value.warehouse_no,
            name: warehouseForm.value.name,
            type: warehouseForm.value.type,
            location: warehouseForm.value.location,
            manager: warehouseForm.value.manager,
            status: warehouseForm.value.status,
            created_at: existingWarehouse.created_at, // 保持原创建时间
            updated_at: new Date().toISOString(),
          };
        }
      }
    } else {
      // 新增仓库
      const newWarehouse: WarehouseType = {
        id: Date.now().toString(),
        warehouse_no: warehouseForm.value.warehouse_no,
        name: warehouseForm.value.name,
        type: warehouseForm.value.type,
        location: warehouseForm.value.location,
        manager: warehouseForm.value.manager,
        status: warehouseForm.value.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockWarehouses.value.push(newWarehouse);
    }

    closeDialog();
  } catch (_error) {
  } finally {
    saving.value = false;
  }
};

const confirmDeleteWarehouse = (_warehouse: any) => {
  // TODO: 需要重新实现确认对话框
};

const exportWarehouses = () => {};

// 初始化
onMounted(() => {
  loadWarehouses();
});
</script>
