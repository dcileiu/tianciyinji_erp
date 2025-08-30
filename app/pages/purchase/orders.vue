<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">采购订单管理</h1>
        <p class="text-muted-foreground mt-1">
          管理所有采购订单，跟踪采购进度和供应商信息
        </p>
      </div>
      <Button @click="handleCreate">
        <Plus class="mr-2 h-4 w-4" />
        新增订单
      </Button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <ShoppingBag class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                本月采购订单
              </p>
              <p class="text-2xl font-semibold">
                {{ orderStats.monthlyOrders }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Clock class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">待审核</p>
              <p class="text-2xl font-semibold">
                {{ orderStats.pendingApproval }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">已完成</p>
              <p class="text-2xl font-semibold">
                {{ orderStats.completed }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <DollarSign class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">
                本月采购金额
              </p>
              <p class="text-2xl font-semibold">
                ¥{{ orderStats.monthlyAmount.toLocaleString() }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium mb-2">搜索</label>
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                placeholder="订单号、供应商..."
                class="w-full pl-10"
              />
            </div>
          </div>

          <!-- 状态筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2">状态</label>
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

          <!-- 供应商筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2">供应商</label>
            <Select v-model="supplierFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="全部供应商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in supplierOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- 日期范围 -->
          <div>
            <label class="block text-sm font-medium mb-2">日期范围</label>
            <Input type="date" v-model="dateRange" class="w-full" />
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-end gap-2">
            <Button class="flex-1" @click="resetFilters">
              <Filter class="mr-2 h-4 w-4" />
              重置筛选
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 采购订单列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-semibold">采购订单列表</CardTitle>
          <div class="flex items-center gap-2">
            <Button size="sm" @click="exportOrders">
              <Download class="mr-2 h-4 w-4" />
              导出订单
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>供应商</TableHead>
              <TableHead>订单金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>订单日期</TableHead>
              <TableHead>预期到货</TableHead>
              <TableHead>商品数量</TableHead>
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
                      order.supplier_name.charAt(0)
                    }}</AvatarFallback>
                  </Avatar>
                  <span class="font-medium">{{ order.supplier_name }}</span>
                </div>
              </TableCell>
              <TableCell>
                <span class="font-medium text-green-600">
                  ¥{{ order.total_amount.toLocaleString() }}
                </span>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusSeverity(order.status)">
                  {{ getStatusDisplayName(order.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ formatDate(order.order_date) }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ formatDate(order.expected_date) }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm">{{ order.items.length }} 种商品</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-1">
                  <Button variant="ghost" size="sm" @click="viewOrder(order)">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="order.status === 'draft'"
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
                    @click="approveOrder(order)"
                  >
                    <Check class="h-4 w-4" />
                  </Button>
                  <Button
                    v-if="order.status === 'draft'"
                    variant="ghost"
                    size="sm"
                    @click="confirmDeleteOrder(order)"
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

    <!-- 订单详情对话框 -->
    <Dialog v-model:open="showOrderDialog">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{{
            dialogMode === "create" ? "新增采购订单" : "订单详情"
          }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>订单号</Label>
              <Input
                v-model="orderForm.order_no"
                :disabled="dialogMode !== 'create'"
                placeholder="系统自动生成"
              />
            </div>

            <div class="space-y-2">
              <Label>供应商 *</Label>
              <Select
                v-model="orderForm.supplier_id"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择供应商" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="supplier in suppliers"
                    :key="supplier.id"
                    :value="supplier.id"
                  >
                    {{ supplier.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>订单日期 *</Label>
              <Input
                type="date"
                v-model="orderForm.order_date"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>

            <div class="space-y-2">
              <Label>预期到货日期</Label>
              <Input
                type="date"
                v-model="orderForm.expected_date"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>备注</Label>
            <Textarea
              v-model="orderForm.remark"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>

          <!-- 订单项列表 -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>订单项</Label>
              <Button
                v-if="dialogMode !== 'view'"
                variant="ghost"
                size="sm"
                @click="addOrderItem"
              >
                <Plus class="mr-2 h-4 w-4" />
                添加商品
              </Button>
            </div>

            <div class="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品名称</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>单价</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead v-if="dialogMode !== 'view'">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="(item, index) in orderForm.items"
                    :key="index"
                  >
                    <TableCell>
                      <span class="font-medium">{{ item.product_name }}</span>
                    </TableCell>
                    <TableCell>
                      <span>{{ item.quantity }} {{ item.unit }}</span>
                    </TableCell>
                    <TableCell>
                      <span>¥{{ item.unit_price.toLocaleString() }}</span>
                    </TableCell>
                    <TableCell>
                      <span class="font-medium">
                        ¥{{
                          (item.quantity * item.unit_price).toLocaleString()
                        }}
                      </span>
                    </TableCell>
                    <TableCell v-if="dialogMode !== 'view'">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="removeOrderItem(index)"
                      >
                        <Trash2 class="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <!-- 总计 -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium">总计：</span>
              <span class="text-xl font-bold text-green-600">
                ¥{{ totalAmount.toLocaleString() }}
              </span>
            </div>
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
              @click="saveOrder"
              :disabled="saving"
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
  Check,
  Download,
  Edit,
  Eye,
  Loader2,
  Plus,
  Trash2,
} from "lucide-vue-next";

// 页面配置
definePageMeta({
  layout: "default",
});

useHead({
  title: "采购订单管理 - ERP 管理系统",
});

// 状态管理
const loading = ref(false);
const saving = ref(false);
const showOrderDialog = ref(false);
const dialogMode = ref<"view" | "create" | "edit">("view");

// 筛选条件
const searchQuery = ref("");
const statusFilter = ref("all");
const supplierFilter = ref("all");
const dateRange = ref("");

// 表单数据
const orderForm = ref({
  order_no: "",
  supplier_id: "",
  order_date: new Date().toISOString().split("T")[0],
  expected_date: "",
  remark: "",
  items: [] as Array<{
    product_name: string;
    quantity: number;
    unit: string;
    unit_price: number;
  }>,
});

// 统计数据
const orderStats = ref({
  monthlyOrders: 156,
  pendingApproval: 23,
  completed: 89,
  monthlyAmount: 2_456_789,
});

// 选项数据
const statusOptions = ref([
  { label: "全部状态", value: "all" },
  { label: "草稿", value: "draft" },
  { label: "待审核", value: "pending" },
  { label: "已批准", value: "approved" },
  { label: "进行中", value: "in_progress" },
  { label: "已完成", value: "completed" },
  { label: "已取消", value: "cancelled" },
]);

const suppliers = ref([
  { id: "1", name: "供应商A" },
  { id: "2", name: "供应商B" },
  { id: "3", name: "供应商C" },
]);

const supplierOptions = ref([
  { label: "全部供应商", value: "all" },
  { label: "供应商A", value: "1" },
  { label: "供应商B", value: "2" },
  { label: "供应商C", value: "3" },
]);

// 模拟数据
const mockOrders = ref([
  {
    id: "1",
    order_no: "PO202401001",
    supplier_id: "1",
    supplier_name: "供应商A",
    total_amount: 156_780,
    status: "pending",
    order_date: new Date("2024-01-15"),
    expected_date: new Date("2024-01-25"),
    items: [
      { product_name: "商品A", quantity: 100, unit: "个", unit_price: 50 },
      { product_name: "商品B", quantity: 200, unit: "个", unit_price: 30 },
    ],
    remark: "紧急采购",
  },
  {
    id: "2",
    order_no: "PO202401002",
    supplier_id: "2",
    supplier_name: "供应商B",
    total_amount: 89_560,
    status: "approved",
    order_date: new Date("2024-01-14"),
    expected_date: new Date("2024-01-24"),
    items: [
      { product_name: "商品C", quantity: 150, unit: "箱", unit_price: 45 },
    ],
    remark: "",
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
        order.supplier_name.toLowerCase().includes(query)
    );
  }

  if (statusFilter.value && statusFilter.value !== "all") {
    result = result.filter((order) => order.status === statusFilter.value);
  }

  if (supplierFilter.value && supplierFilter.value !== "all") {
    result = result.filter(
      (order) => order.supplier_id === supplierFilter.value
    );
  }

  return result;
});

const totalAmount = computed(() => {
  return orderForm.value.items.reduce((sum: number, item: any) => {
    return sum + item.quantity * item.unit_price;
  }, 0);
});

// 状态映射
const statusMap: Record<string, string> = {
  draft: "草稿",
  pending: "待审核",
  approved: "已批准",
  in_progress: "进行中",
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
  in_progress: "default",
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

const resetFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "all";
  supplierFilter.value = "all";
  dateRange.value = "";
};

const handleCreate = () => {
  dialogMode.value = "create";
  orderForm.value = {
    order_no: `PO${Date.now()}`,
    supplier_id: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_date: "",
    remark: "",
    items: [],
  };
  showOrderDialog.value = true;
};

const viewOrder = (order: any) => {
  dialogMode.value = "view";
  Object.assign(orderForm.value, {
    ...order,
    order_date: new Date(order.order_date).toISOString().split("T")[0],
    expected_date: order.expected_date
      ? new Date(order.expected_date).toISOString().split("T")[0]
      : "",
  });
  showOrderDialog.value = true;
};

const editingOrder = ref<any>(null);

const editOrder = (order: any) => {
  dialogMode.value = "edit";
  editingOrder.value = order;
  Object.assign(orderForm.value, {
    ...order,
    order_date: new Date(order.order_date).toISOString().split("T")[0],
    expected_date: order.expected_date
      ? new Date(order.expected_date).toISOString().split("T")[0]
      : "",
  });
  showOrderDialog.value = true;
};

const approveOrder = async (_order: any) => {
  // TODO: 需要重新实现确认对话框
};

const confirmDeleteOrder = (_order: any) => {
  // TODO: 需要重新实现确认对话框
};

const closeOrderDialog = () => {
  showOrderDialog.value = false;
};

const saveOrder = async () => {
  saving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (dialogMode.value === "create") {
      const newOrder = {
        id: Date.now().toString(),
        ...orderForm.value,
        supplier_name:
          suppliers.value.find((s) => s.id === orderForm.value.supplier_id)
            ?.name || "",
        total_amount: totalAmount.value,
        status: "draft",
        order_date: orderForm.value.order_date
          ? new Date(orderForm.value.order_date)
          : new Date(),
        expected_date: orderForm.value.expected_date
          ? new Date(orderForm.value.expected_date)
          : new Date(),
      };
      mockOrders.value.push(newOrder);
    } else if (dialogMode.value === "edit") {
      const index = mockOrders.value.findIndex(
        (o) => o.id === editingOrder.value?.id
      );
      if (index !== -1 && mockOrders.value[index]) {
        mockOrders.value[index] = {
          ...mockOrders.value[index],
          ...orderForm.value,
          id: mockOrders.value[index]?.id,
          supplier_name:
            suppliers.value.find((s) => s.id === orderForm.value.supplier_id)
              ?.name || "",
          total_amount: totalAmount.value,
          order_date: orderForm.value.order_date
            ? new Date(orderForm.value.order_date)
            : new Date(),
          expected_date: orderForm.value.expected_date
            ? new Date(orderForm.value.expected_date)
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

const addOrderItem = () => {
  orderForm.value.items.push({
    product_name: "新商品",
    quantity: 1,
    unit: "个",
    unit_price: 0,
  });
};

const removeOrderItem = (index: number) => {
  orderForm.value.items.splice(index, 1);
};

const exportOrders = () => {};

// 初始化
onMounted(() => {
  // 加载数据
});
</script>
