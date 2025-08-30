<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">库存调拨</h1>
        <p class="text-muted-foreground mt-2">管理仓库间库存调拨</p>
      </div>
      <Button @click="openTransferDialog()">
        <Plus class="mr-2 h-4 w-4" />
        新建调拨
      </Button>
    </div>

    <!-- 筛选区域 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Search class="h-5 w-5" />
          搜索与筛选
        </CardTitle>
        <CardDescription>快速查找调拨单信息</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Label>调出仓库</Label>
            <Select v-model="filters.from_warehouse">
              <SelectTrigger>
                <SelectValue placeholder="全部仓库" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部仓库</SelectItem>
                <SelectItem
                  v-for="warehouse in warehouses"
                  :key="warehouse.id"
                  :value="warehouse.id"
                >
                  {{ warehouse.name }}
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
                placeholder="搜索调拨单号、商品..."
                class="pl-9"
              />
            </div>
          </div>
          <div class="flex items-end gap-2">
            <Button variant="outline" @click="loadTransfers">
              <RefreshCw class="mr-2 h-4 w-4" />
              刷新
            </Button>
            <Button variant="outline" @click="exportTransfers">
              <Download class="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 调拨单列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <ArrowRightLeft class="h-5 w-5" />
              调拨单列表
            </CardTitle>
            <CardDescription> 共 {{ totalCount }} 条记录 </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="space-y-4">
          <div
            v-for="i in 10"
            :key="i"
            class="flex items-center space-x-4 p-4 border rounded-lg"
          >
            <Skeleton class="h-12 w-12 rounded" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
            <Skeleton class="h-8 w-20" />
            <Skeleton class="h-8 w-16" />
          </div>
        </div>

        <div
          v-else-if="filteredTransfers.length === 0"
          class="text-center py-16"
        >
          <ArrowRightLeft
            class="mx-auto h-16 w-16 text-muted-foreground mb-4"
          />
          <h3 class="text-xl font-semibold mb-4">暂无调拨记录</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            没有找到符合条件的调拨记录。请检查筛选条件或创建新的调拨单。
          </p>
          <Button @click="openTransferDialog()">
            <Plus class="mr-2 h-4 w-4" />
            新建调拨
          </Button>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="transfer in filteredTransfers"
            :key="transfer.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div
                class="flex h-12 w-12 items-center justify-center rounded bg-primary/10"
              >
                <ArrowRightLeft class="h-6 w-6 text-primary" />
              </div>
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <code class="bg-muted px-2 py-1 text-sm font-mono rounded">
                    {{ transfer.transfer_no }}
                  </code>
                  <Badge
                    :variant="getStatusSeverity(transfer.status)"
                    class="text-xs"
                  >
                    {{ getStatusDisplayName(transfer.status) }}
                  </Badge>
                </div>
                <div
                  class="flex items-center space-x-4 text-sm text-muted-foreground"
                >
                  <div class="flex items-center space-x-1">
                    <Warehouse class="h-4 w-4 text-blue-600" />
                    <span>{{ transfer.from_warehouse_name }}</span>
                  </div>
                  <ArrowRight class="h-4 w-4" />
                  <div class="flex items-center space-x-1">
                    <Warehouse class="h-4 w-4 text-green-600" />
                    <span>{{ transfer.to_warehouse_name }}</span>
                  </div>
                </div>
                <div
                  class="flex items-center space-x-4 text-sm text-muted-foreground"
                >
                  <span>{{ transfer.items.length }} 种商品</span>
                  <span>总计 {{ transfer.total_quantity }} 件</span>
                  <span>操作人: {{ transfer.operator_name }}</span>
                  <span>{{ formatDate(transfer.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-1">
              <Button variant="ghost" size="sm" @click="viewTransfer(transfer)">
                <Eye class="h-4 w-4" />
              </Button>
              <Button
                v-if="transfer.status === 'draft'"
                variant="ghost"
                size="sm"
                @click="editTransfer(transfer)"
              >
                <Edit class="h-4 w-4" />
              </Button>
              <Button
                v-if="transfer.status === 'pending'"
                variant="ghost"
                size="sm"
                @click="approveTransfer(transfer)"
              >
                <CheckCircle class="h-4 w-4" />
              </Button>
              <Button
                v-if="transfer.status === 'draft'"
                variant="ghost"
                size="sm"
                @click="confirmDeleteTransfer(transfer)"
              >
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 调拨单对话框 -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <ArrowRightLeft class="h-5 w-5" />
            {{ editingTransfer ? "编辑调拨单" : "新建调拨单" }}
          </DialogTitle>
          <DialogDescription>管理仓库间库存调拨</DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>调拨单号</Label>
              <Input
                v-model="transferForm.transfer_no"
                :disabled="true"
                placeholder="系统自动生成"
              />
            </div>

            <div class="space-y-2">
              <Label>状态</Label>
              <Select
                v-model="transferForm.status"
                :disabled="dialogMode === 'view'"
              >
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

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>调出仓库 *</Label>
              <Select
                v-model="transferForm.from_warehouse_id"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择调出仓库" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="warehouse in warehouses"
                    :key="warehouse.id"
                    :value="warehouse.id"
                  >
                    {{ warehouse.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>调入仓库 *</Label>
              <Select
                v-model="transferForm.to_warehouse_id"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择调入仓库" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="warehouse in warehouses"
                    :key="warehouse.id"
                    :value="warehouse.id"
                  >
                    {{ warehouse.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label>备注</Label>
            <Textarea
              v-model="transferForm.remark"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>

          <!-- 调拨商品列表 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>调拨商品</Label>
              <Button
                v-if="dialogMode !== 'view'"
                variant="outline"
                size="sm"
                @click="addTransferItem"
              >
                <Plus class="mr-2 h-4 w-4" />
                添加商品
              </Button>
            </div>

            <div
              v-if="transferForm.items.length === 0"
              class="text-center py-8 border rounded-lg"
            >
              <Package class="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p class="text-muted-foreground">暂无调拨商品</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="(item, index) in transferForm.items"
                :key="index"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <Package class="h-8 w-8 text-primary" />
                  <div>
                    <p class="font-medium">{{ item.product_name }}</p>
                    <p class="text-sm text-muted-foreground">
                      当前库存: {{ item.current_stock }} {{ item.unit }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-center">
                    <Label class="text-xs">调拨数量</Label>
                    <div v-if="dialogMode === 'view'">
                      <span>{{ item.transfer_quantity }} {{ item.unit }}</span>
                    </div>
                    <Input
                      v-else
                      v-model="item.transfer_quantity"
                      type="number"
                      :min="1"
                      :max="item.current_stock"
                      class="w-24"
                    />
                  </div>
                  <div class="text-center">
                    <Label class="text-xs">单位</Label>
                    <p class="text-sm text-muted-foreground">{{ item.unit }}</p>
                  </div>
                  <Button
                    v-if="dialogMode !== 'view'"
                    variant="ghost"
                    size="sm"
                    @click="removeTransferItem(index)"
                  >
                    <Trash2 class="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- 总计 -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium">总数量：</span>
              <span class="text-xl font-bold text-primary"
                >{{ totalQuantity }} 件</span
              >
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeTransferDialog">取消</Button>
          <Button
            v-if="dialogMode !== 'view'"
            :disabled="saving"
            @click="saveTransfer"
          >
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
  ArrowRight,
  ArrowRightLeft,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Warehouse,
} from "lucide-vue-next";
import type { Transfer } from "~/types/database";

// 页面配置
definePageMeta({
  layout: "default",
});

useHead({
  title: "库存调拨 - ERP 管理系统",
});

// 状态管理
const loading = ref(false);
const saving = ref(false);
const showDialog = ref(false);
const dialogMode = ref<"view" | "create" | "edit">("view");
const editingTransfer = ref<Transfer | null>(null);

// 筛选条件
const filters = ref({
  status: "all",
  from_warehouse: "all",
  search: "",
});

// 表单数据
const transferForm = ref({
  transfer_no: "",
  from_warehouse_id: "",
  to_warehouse_id: "",
  status: "draft",
  remark: "",
  items: [] as any[],
});

// 选项数据
const statusOptions = ref([
  { label: "草稿", value: "draft" },
  { label: "待审核", value: "pending" },
  { label: "已批准", value: "approved" },
  { label: "运输中", value: "in_transit" },
  { label: "已完成", value: "completed" },
  { label: "已取消", value: "cancelled" },
]);

const warehouses = ref([
  { id: "WH001", name: "主仓库" },
  { id: "WH002", name: "原料仓库" },
  { id: "WH003", name: "成品仓库" },
]);

// 模拟数据
const mockTransfers = ref([
  {
    id: "1",
    transfer_no: "TF202401001",
    from_warehouse_id: "WH001",
    from_warehouse_name: "主仓库",
    to_warehouse_id: "WH002",
    to_warehouse_name: "原料仓库",
    status: "pending",
    operator_name: "张三",
    total_quantity: 200,
    created_at: new Date("2024-01-15"),
    remark: "紧急调拨",
    items: [
      {
        product_name: "商品A",
        current_stock: 500,
        transfer_quantity: 100,
        unit: "个",
      },
      {
        product_name: "商品B",
        current_stock: 300,
        transfer_quantity: 100,
        unit: "个",
      },
    ],
  },
  {
    id: "2",
    transfer_no: "TF202401002",
    from_warehouse_id: "WH002",
    from_warehouse_name: "原料仓库",
    to_warehouse_id: "WH003",
    to_warehouse_name: "成品仓库",
    status: "completed",
    operator_name: "李四",
    total_quantity: 150,
    created_at: new Date("2024-01-14"),
    remark: "常规调拨",
    items: [
      {
        product_name: "商品C",
        current_stock: 200,
        transfer_quantity: 150,
        unit: "箱",
      },
    ],
  },
]);

// 计算属性
const filteredTransfers = computed(() => {
  let result = mockTransfers.value;

  if (filters.value.search) {
    const query = filters.value.search.toLowerCase();
    result = result.filter(
      (transfer) =>
        transfer.transfer_no.toLowerCase().includes(query) ||
        transfer.items.some((item) =>
          item.product_name.toLowerCase().includes(query)
        )
    );
  }

  if (filters.value.status && filters.value.status !== "all") {
    result = result.filter(
      (transfer) => transfer.status === filters.value.status
    );
  }

  if (filters.value.from_warehouse && filters.value.from_warehouse !== "all") {
    result = result.filter(
      (transfer) => transfer.from_warehouse_id === filters.value.from_warehouse
    );
  }

  return result;
});

const totalCount = computed(() => mockTransfers.value.length);

const totalQuantity = computed(() => {
  return transferForm.value.items.reduce((sum: number, item: any) => {
    return sum + (item.transfer_quantity || 0);
  }, 0);
});

// 状态映射
const statusMap: Record<string, string> = {
  draft: "草稿",
  pending: "待审核",
  approved: "已批准",
  in_transit: "运输中",
  completed: "已完成",
  cancelled: "已取消",
};

const statusSeverityMap: Record<
  string,
  "default" | "destructive" | "outline" | "secondary"
> = {
  draft: "secondary",
  pending: "outline",
  approved: "secondary",
  in_transit: "default",
  completed: "default",
  cancelled: "destructive",
};

// 方法
const getStatusDisplayName = (status: string) => statusMap[status] || status;

const getStatusSeverity = (status: string) =>
  statusSeverityMap[status] || "secondary";

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

// 加载调拨单数据
const loadTransfers = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (_error) {
  } finally {
    loading.value = false;
  }
};

const openTransferDialog = (transfer: any = null) => {
  if (transfer) {
    editingTransfer.value = transfer;
    dialogMode.value = "edit";
    Object.assign(transferForm.value, {
      transfer_no: transfer.transfer_no,
      from_warehouse_id: transfer.from_warehouse_id,
      to_warehouse_id: transfer.to_warehouse_id,
      status: transfer.status,
      remark: transfer.remark,
      items: [...transfer.items],
    });
  } else {
    editingTransfer.value = null;
    dialogMode.value = "create";
    transferForm.value = {
      transfer_no: `TF${Date.now()}`,
      from_warehouse_id: "",
      to_warehouse_id: "",
      status: "draft",
      remark: "",
      items: [],
    };
  }
  showDialog.value = true;
};

const viewTransfer = (transfer: any) => {
  editingTransfer.value = transfer;
  dialogMode.value = "view";
  Object.assign(transferForm.value, {
    transfer_no: transfer.transfer_no,
    from_warehouse_id: transfer.from_warehouse_id,
    to_warehouse_id: transfer.to_warehouse_id,
    status: transfer.status,
    remark: transfer.remark,
    items: [...transfer.items],
  });
  showDialog.value = true;
};

const editTransfer = (transfer: any) => {
  openTransferDialog(transfer);
};

const approveTransfer = async (_transfer: any) => {
  // TODO: 需要重新实现确认对话框
};

const confirmDeleteTransfer = (_transfer: any) => {
  // TODO: 需要重新实现确认对话框
};

const closeTransferDialog = () => {
  showDialog.value = false;
  editingTransfer.value = null;
};

const saveTransfer = () => {
  if (editingTransfer.value?.id) {
    // 编辑模式
    const index = mockTransfers.value.findIndex(
      (t) => t.id === editingTransfer.value?.id
    );
    if (index !== -1 && mockTransfers.value[index]) {
      mockTransfers.value[index] = {
        ...transferForm.value,
        id: editingTransfer.value.id,
        created_at: mockTransfers.value[index].created_at,
      } as Transfer;
    }
  } else {
    // 新增模式
    const newTransfer: Transfer = {
      ...transferForm.value,
      id: Date.now().toString(),
      created_at: new Date(),
    } as Transfer;
    mockTransfers.value.unshift(newTransfer);
  }

  closeTransferDialog();
};

const addTransferItem = () => {
  transferForm.value.items.push({
    product_name: "新商品",
    current_stock: 100,
    transfer_quantity: 1,
    unit: "个",
  });
};

const removeTransferItem = (index: number) => {
  transferForm.value.items.splice(index, 1);
};

const exportTransfers = () => {};

// 初始化
onMounted(() => {
  loadTransfers();
});
</script>
