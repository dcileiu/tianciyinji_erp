<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">供应商管理</h1>
        <p class="text-muted-foreground mt-1">
          管理供应商基础信息，维护供应商关系和合作协议
        </p>
      </div>
      <Button @click="openCreateForm">
        <Plus class="mr-2 h-4 w-4" />
        新增供应商
      </Button>
    </div>

    <!-- 搜索和筛选 -->
    <Card>
      <CardContent class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- 搜索框 -->
          <div>
            <label class="block text-sm font-medium mb-2">搜索供应商</label>
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                placeholder="供应商名称、编号..."
                class="w-full pl-10"
              />
            </div>
          </div>

          <!-- 供应商类型筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2">供应商类型</label>
            <Select v-model="typeFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="全部类型" />
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

          <!-- 合作状态筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2">合作状态</label>
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

          <!-- 评级筛选 -->
          <div>
            <label class="block text-sm font-medium mb-2">供应商评级</label>
            <Select v-model="ratingFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="全部评级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in ratingOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 供应商统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">总供应商数</p>
              <p class="text-2xl font-bold">{{ stats.totalSuppliers }}</p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <Building2 class="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">活跃供应商</p>
              <p class="text-2xl font-bold text-green-600">
                {{ stats.activeSuppliers }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <CheckCircle class="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">A级供应商</p>
              <p class="text-2xl font-bold text-orange-600">
                {{ stats.aGradeSuppliers }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <Star class="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">本月新增</p>
              <p class="text-2xl font-bold text-purple-600">
                {{ stats.newThisMonth }}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <Plus class="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 供应商列表 -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>供应商列表</CardTitle>
          <div class="flex items-center gap-2">
            <Button size="sm">
              <Download class="mr-2 h-4 w-4" />
              导出数据
            </Button>
            <Button size="sm" variant="outline">
              <Filter class="mr-2 h-4 w-4" />
              重置筛选
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">
                  <Checkbox
                    :checked="
                      selectedSuppliers.length === filteredSuppliers.length
                    "
                    @update:checked="toggleSelectAll"
                  />
                </TableHead>
                <TableHead>供应商编号</TableHead>
                <TableHead>供应商名称</TableHead>
                <TableHead>供应商类型</TableHead>
                <TableHead>联系电话</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>评级</TableHead>
                <TableHead>订单总数</TableHead>
                <TableHead>累计金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading">
                <TableCell colspan="11" class="h-24 text-center">
                  <div class="flex items-center justify-center">
                    <Loader2 class="h-4 w-4 animate-spin mr-2" />
                    加载中...
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-else-if="filteredSuppliers.length === 0">
                <TableCell
                  colspan="11"
                  class="h-24 text-center text-muted-foreground"
                >
                  没有找到供应商数据
                </TableCell>
              </TableRow>
              <TableRow
                v-else
                v-for="supplier in paginatedSuppliers"
                :key="supplier.id"
                class="hover:bg-muted/50"
              >
                <TableCell>
                  <Checkbox
                    :checked="selectedSuppliers.includes(supplier.id)"
                    @update:checked="toggleSupplierSelection(supplier.id)"
                  />
                </TableCell>
                <TableCell>
                  <code class="bg-muted px-2 py-1 text-sm font-mono rounded">
                    {{ supplier.supplier_no }}
                  </code>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Avatar class="h-8 w-8">
                      <AvatarFallback>{{
                        supplier.name.charAt(0).toUpperCase()
                      }}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span class="font-medium">{{ supplier.name }}</span>
                      <p class="text-xs text-muted-foreground">
                        {{ supplier.contact_person }}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="getTypeSeverity(supplier.type)">
                    {{ getTypeDisplayName(supplier.type) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="text-sm">{{ supplier.phone }}</span>
                </TableCell>
                <TableCell>
                  <span class="text-sm text-muted-foreground">{{
                    supplier.email
                  }}</span>
                </TableCell>
                <TableCell>
                  <Badge :variant="getRatingSeverity(supplier.rating)">
                    {{ supplier.rating }}级
                  </Badge>
                </TableCell>
                <TableCell>
                  <span class="font-medium text-blue-600">{{
                    supplier.total_orders
                  }}</span>
                </TableCell>
                <TableCell>
                  <span class="font-medium text-green-600">
                    ¥{{ supplier.total_amount.toLocaleString() }}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusSeverity(supplier.status)">
                    {{ getStatusDisplayName(supplier.status) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="viewSupplier(supplier)"
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="editSupplier(supplier)"
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="viewOrders(supplier)"
                    >
                      <ShoppingCart class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="rateSupplier(supplier)"
                    >
                      <Star class="h-4 w-4" />
                    </Button>
                    <Button
                      v-if="supplier.status === 'active'"
                      variant="ghost"
                      size="sm"
                      @click="toggleStatus(supplier, 'suspended')"
                    >
                      <Pause class="h-4 w-4 text-yellow-600" />
                    </Button>
                    <Button
                      v-else
                      variant="ghost"
                      size="sm"
                      @click="toggleStatus(supplier, 'active')"
                    >
                      <Play class="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- 分页 -->
        <div class="flex items-center justify-between space-x-2 py-4">
          <div class="text-sm text-muted-foreground">
            已选择 {{ selectedSuppliers.length }} 个供应商，共
            {{ filteredSuppliers.length }} 个
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              @click="previousPage"
              :disabled="currentPage === 1"
            >
              上一页
            </Button>
            <span class="text-sm">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              @click="nextPage"
              :disabled="currentPage === totalPages"
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 供应商表单对话框 -->
    <Dialog v-model:open="showSupplierDialog">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{
              dialogMode === "create"
                ? "新增供应商"
                : dialogMode === "edit"
                ? "编辑供应商"
                : "查看供应商"
            }}
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>供应商编号</Label>
              <Input
                v-model="supplierForm.supplier_no"
                :disabled="true"
                placeholder="系统自动生成"
              />
            </div>

            <div class="space-y-2">
              <Label>供应商名称 *</Label>
              <Input
                v-model="supplierForm.name"
                placeholder="请输入供应商名称"
                :disabled="dialogMode === 'view'"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>供应商类型 *</Label>
              <Select
                v-model="supplierForm.type"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择供应商类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in typeOptions.filter(
                      (o) => o.value !== 'all'
                    )"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label>评级</Label>
              <Select
                v-model="supplierForm.rating"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择评级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in ratingOptions.filter(
                      (o) => o.value !== 'all'
                    )"
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
              <Label>联系人</Label>
              <Input
                v-model="supplierForm.contact_person"
                placeholder="请输入联系人姓名"
                :disabled="dialogMode === 'view'"
              />
            </div>

            <div class="space-y-2">
              <Label>联系电话</Label>
              <Input
                v-model="supplierForm.phone"
                placeholder="请输入联系电话"
                :disabled="dialogMode === 'view'"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>邮箱地址</Label>
              <Input
                v-model="supplierForm.email"
                placeholder="请输入邮箱地址"
                :disabled="dialogMode === 'view'"
              />
            </div>

            <div class="space-y-2">
              <Label>合作状态</Label>
              <Select
                v-model="supplierForm.status"
                :disabled="dialogMode === 'view'"
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="option in statusOptions.filter(
                      (o) => o.value !== 'all'
                    )"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label>详细地址</Label>
            <Textarea
              v-model="supplierForm.address"
              placeholder="请输入详细地址"
              :rows="2"
              :disabled="dialogMode === 'view'"
            />
          </div>

          <div class="space-y-2">
            <Label>备注信息</Label>
            <Textarea
              v-model="supplierForm.notes"
              placeholder="请输入备注信息"
              :rows="3"
              :disabled="dialogMode === 'view'"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeSupplierDialog">
            <X class="mr-2 h-4 w-4" />
            取消
          </Button>
          <Button
            v-if="dialogMode !== 'view'"
            @click="saveSupplier"
            :disabled="saving"
          >
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            <Save v-else class="mr-2 h-4 w-4" />
            {{ saving ? "保存中..." : "保存供应商" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import {
  Building2,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Filter,
  Loader2,
  Pause,
  Play,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Star,
  X,
} from 'lucide-vue-next';

// 页面配置
definePageMeta({
  layout: 'default',
});

useHead({
  title: '供应商管理 - ERP 管理系统',
});

// 状态管理
const loading = ref(false);
const saving = ref(false);
const showSupplierDialog = ref(false);
const dialogMode = ref<'view' | 'create' | 'edit'>('view');
const editingSupplier = ref(null as any);
const selectedSuppliers = ref<string[]>([]);

// 分页状态
const currentPage = ref(1);
const pageSize = ref(20);

// 筛选条件
const searchQuery = ref('');
const typeFilter = ref('all');
const statusFilter = ref('all');
const ratingFilter = ref('all');

// 表单数据
const supplierForm = ref({
  supplier_no: '',
  name: '',
  type: '',
  rating: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  notes: '',
});

// 选项数据
const typeOptions = ref([
  { label: '全部类型', value: 'all' },
  { label: '原材料供应商', value: 'raw_material' },
  { label: '设备供应商', value: 'equipment' },
  { label: '服务供应商', value: 'service' },
  { label: '物流供应商', value: 'logistics' },
]);

const statusOptions = ref([
  { label: '全部状态', value: 'all' },
  { label: '正常合作', value: 'active' },
  { label: '暂停合作', value: 'suspended' },
  { label: '终止合作', value: 'terminated' },
  { label: '潜在供应商', value: 'potential' },
]);

const ratingOptions = ref([
  { label: '全部评级', value: 'all' },
  { label: 'A级', value: 'A' },
  { label: 'B级', value: 'B' },
  { label: 'C级', value: 'C' },
  { label: 'D级', value: 'D' },
]);

// 统计数据
const stats = ref({
  totalSuppliers: 156,
  activeSuppliers: 128,
  aGradeSuppliers: 45,
  newThisMonth: 8,
});

// 模拟数据
const mockSuppliers = ref([
  {
    id: '1',
    supplier_no: 'SUP-001',
    name: 'ABC材料供应公司',
    type: 'raw_material',
    rating: 'A',
    contact_person: '王经理',
    phone: '010-12345678',
    email: 'wang@abc.com',
    address: '北京市朝阳区工业园区',
    total_orders: 45,
    total_amount: 850_000,
    status: 'active',
    created_at: new Date('2024-01-15'),
    notes: '优质供应商，长期合作伙伴',
  },
  {
    id: '2',
    supplier_no: 'SUP-002',
    name: 'XYZ设备制造厂',
    type: 'equipment',
    rating: 'B',
    contact_person: '李总',
    phone: '021-87654321',
    email: 'li@xyz.com',
    address: '上海市浦东新区制造基地',
    total_orders: 28,
    total_amount: 650_000,
    status: 'active',
    created_at: new Date('2024-01-10'),
    notes: '设备质量稳定，价格合理',
  },
  {
    id: '3',
    supplier_no: 'SUP-003',
    name: '快递物流服务有限公司',
    type: 'logistics',
    rating: 'A',
    contact_person: '张主管',
    phone: '400-123456',
    email: 'zhang@logistics.com',
    address: '广州市天河区物流园',
    total_orders: 67,
    total_amount: 320_000,
    status: 'active',
    created_at: new Date('2024-01-05'),
    notes: '物流效率高，服务好',
  },
]);

// 计算属性
const filteredSuppliers = computed(() => {
  let result = mockSuppliers.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (supplier) =>
        supplier.supplier_no.toLowerCase().includes(query) ||
        supplier.name.toLowerCase().includes(query) ||
        supplier.contact_person.toLowerCase().includes(query)
    );
  }

  if (typeFilter.value && typeFilter.value !== 'all') {
    result = result.filter((supplier) => supplier.type === typeFilter.value);
  }

  if (statusFilter.value && statusFilter.value !== 'all') {
    result = result.filter(
      (supplier) => supplier.status === statusFilter.value
    );
  }

  if (ratingFilter.value && ratingFilter.value !== 'all') {
    result = result.filter(
      (supplier) => supplier.rating === ratingFilter.value
    );
  }

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredSuppliers.value.length / pageSize.value);
});

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredSuppliers.value.slice(start, end);
});

// 映射对象
const typeMap: Record<string, string> = {
  raw_material: '原材料供应商',
  equipment: '设备供应商',
  service: '服务供应商',
  logistics: '物流供应商',
};

const typeSeverityMap: Record<
  string,
  'default' | 'destructive' | 'outline' | 'secondary'
> = {
  raw_material: 'secondary',
  equipment: 'default',
  service: 'outline',
  logistics: 'secondary',
};

const statusMap: Record<string, string> = {
  active: '正常合作',
  suspended: '暂停合作',
  terminated: '终止合作',
  potential: '潜在供应商',
};

const statusSeverityMap: Record<
  string,
  'default' | 'destructive' | 'outline' | 'secondary'
> = {
  active: 'default',
  suspended: 'outline',
  terminated: 'destructive',
  potential: 'secondary',
};

const ratingSeverityMap: Record<
  string,
  'default' | 'destructive' | 'outline' | 'secondary'
> = {
  A: 'default',
  B: 'secondary',
  C: 'outline',
  D: 'destructive',
};

// 方法
const getTypeDisplayName = (type: string) => typeMap[type] || type;
const getTypeSeverity = (type: string) => typeSeverityMap[type] || 'secondary';
const getStatusDisplayName = (status: string) => statusMap[status] || status;
const getStatusSeverity = (status: string) =>
  statusSeverityMap[status] || 'secondary';
const getRatingSeverity = (rating: string) =>
  ratingSeverityMap[rating] || 'secondary';

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedSuppliers.value = paginatedSuppliers.value.map((s) => s.id);
  } else {
    selectedSuppliers.value = [];
  }
};

const toggleSupplierSelection = (id: string) => {
  const index = selectedSuppliers.value.indexOf(id);
  if (index > -1) {
    selectedSuppliers.value.splice(index, 1);
  } else {
    selectedSuppliers.value.push(id);
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const openCreateForm = () => {
  editingSupplier.value = null;
  dialogMode.value = 'create';
  supplierForm.value = {
    supplier_no: `SUP-${Date.now()}`,
    name: '',
    type: '',
    rating: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
    notes: '',
  };
  showSupplierDialog.value = true;
};

const viewSupplier = (supplier: any) => {
  editingSupplier.value = supplier;
  dialogMode.value = 'view';
  Object.assign(supplierForm.value, supplier);
  showSupplierDialog.value = true;
};

const editSupplier = (supplier: any) => {
  editingSupplier.value = supplier;
  dialogMode.value = 'edit';
  Object.assign(supplierForm.value, supplier);
  showSupplierDialog.value = true;
};

const viewOrders = (_supplier: any) => {
  // 跳转到订单页面
};

const rateSupplier = (_supplier: any) => {
  // 打开评级对话框
};

const toggleStatus = async (supplier: any, newStatus: string) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const index = mockSuppliers.value.findIndex((s) => s.id === supplier.id);
    if (index !== -1 && mockSuppliers.value[index]) {
      mockSuppliers.value[index]!.status = newStatus;
    }
  } catch (_error) {
    // 处理错误
  }
};

const closeSupplierDialog = () => {
  showSupplierDialog.value = false;
  editingSupplier.value = null;
};

const saveSupplier = async () => {
  saving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (dialogMode.value === 'create') {
      const newSupplier = {
        id: Date.now().toString(),
        ...supplierForm.value,
        total_orders: 0,
        total_amount: 0,
        created_at: new Date(),
      };
      mockSuppliers.value.push(newSupplier);
    } else if (dialogMode.value === 'edit') {
      const index = mockSuppliers.value.findIndex(
        (s) => s.id === editingSupplier.value?.id
      );
      if (index !== -1 && mockSuppliers.value[index]) {
        mockSuppliers.value[index] = {
          ...mockSuppliers.value[index],
          ...supplierForm.value,
          id: mockSuppliers.value[index]?.id,
          total_orders: mockSuppliers.value[index]?.total_orders,
          total_amount: mockSuppliers.value[index]?.total_amount,
          created_at: mockSuppliers.value[index]?.created_at,
        };
      }
    }

    closeSupplierDialog();
  } catch (_error) {
    // 处理错误
  } finally {
    saving.value = false;
  }
};

// 初始化
onMounted(() => {
  // 加载数据
});
</script>
