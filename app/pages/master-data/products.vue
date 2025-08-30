<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">产品管理</h1>
        <p class="text-muted-foreground">
          管理产品基础信息，维护产品分类和规格数据
        </p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="importProducts">
          <Upload class="mr-2 h-4 w-4" />
          导入产品
        </Button>
        <Button variant="outline" size="sm" @click="exportProducts">
          <Download class="mr-2 h-4 w-4" />
          导出数据
        </Button>
        <Button size="sm" @click="openProductModal">
          <Plus class="mr-2 h-4 w-4" />
          新增产品
        </Button>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Search class="h-5 w-5" />
          搜索与筛选
        </CardTitle>
        <CardDescription>快速找到您需要的产品信息</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <Label>搜索产品</Label>
            <div class="relative">
              <Search
                class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
              />
              <Input
                v-model="searchKeyword"
                placeholder="产品名称、编码、规格..."
                class="pl-9"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>产品分类</Label>
            <Select v-model="selectedCategory">
              <SelectTrigger>
                <SelectValue placeholder="全部分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                <SelectItem
                  v-for="category in categories"
                  :key="category.value"
                  :value="category.value"
                >
                  {{ category.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>产品状态</Label>
            <Select v-model="selectedStatus">
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
            <Label class="opacity-0">操作</Label>
            <div class="flex gap-2">
              <Button variant="outline" class="flex-1" @click="resetFilters">
                <RotateCcw class="mr-2 h-4 w-4" />
                重置
              </Button>
              <Button variant="outline" @click="refreshData">
                <RefreshCw class="mr-2 h-4 w-4" />
                刷新
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 统计信息卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">总产品数</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-blue-600">
                  {{ productStats.total }}
                </p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +{{ productStats.newThisMonth }}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">本月新增</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
            >
              <Package class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">在售产品</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-green-600">
                  {{ productStats.active }}
                </p>
                <Badge variant="secondary" class="text-xs">
                  {{
                    Math.round(
                      (productStats.active / productStats.total) * 100
                    )
                  }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">占比</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            >
              <CheckCircle class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">低库存</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-orange-600">
                  {{ productStats.lowStock }}
                </p>
                <Badge variant="destructive" class="text-xs">需补货</Badge>
              </div>
              <p class="text-xs text-muted-foreground">产品数量</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900"
            >
              <AlertTriangle
                class="h-6 w-6 text-orange-600 dark:text-orange-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">产品分类</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold text-purple-600">
                  {{ productStats.categories }}
                </p>
                <Badge variant="outline" class="text-xs">分类</Badge>
              </div>
              <p class="text-xs text-muted-foreground">管理中</p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900"
            >
              <Layers class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 产品列表 -->
    <Card>
      <CardHeader>
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <CardTitle class="flex items-center gap-2">
              <Package class="h-5 w-5" />
              产品列表
            </CardTitle>
            <CardDescription
              >当前共有 {{ filteredProducts.length }} 个产品</CardDescription
            >
          </div>
          <div class="flex items-center gap-2">
            <Select v-model="pageSize">
              <SelectTrigger class="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12条/页</SelectItem>
                <SelectItem value="24">24条/页</SelectItem>
                <SelectItem value="48">48条/页</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          v-if="loading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div v-for="i in 8" :key="i" class="space-y-3">
            <Skeleton class="h-48 w-full rounded-lg" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
            </div>
          </div>
        </div>

        <div
          v-else-if="filteredProducts.length === 0"
          class="text-center py-16"
        >
          <Package class="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 class="text-xl font-semibold mb-4">暂无产品数据</h3>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            您还没有添加任何产品。点击下方按钮开始添加您的第一个产品。
          </p>
          <Button @click="openProductModal">
            <Plus class="mr-2 h-4 w-4" />
            添加产品
          </Button>
        </div>

        <div v-else>
          <!-- 产品网格 -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="group relative rounded-lg border bg-card hover:shadow-lg transition-all duration-200"
            >
              <!-- 产品图片 -->
              <div
                class="aspect-square rounded-t-lg bg-muted/50 flex items-center justify-center"
              >
                <Package class="h-16 w-16 text-muted-foreground" />
              </div>

              <!-- 产品信息 -->
              <div class="p-4 space-y-3">
                <div class="space-y-2">
                  <div class="flex items-start justify-between">
                    <h3
                      class="font-semibold text-sm leading-tight line-clamp-2"
                    >
                      {{ product.name }}
                    </h3>
                    <Badge
                      :variant="getStatusVariant(product.status)"
                      class="ml-2 text-xs"
                    >
                      {{ getStatusText(product.status) }}
                    </Badge>
                  </div>
                  <p class="text-xs text-muted-foreground font-mono">
                    {{ product.code }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ product.category }}
                  </p>
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">售价:</span>
                    <span class="font-semibold text-green-600">
                      ¥{{ product.price.toLocaleString() }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground">库存:</span>
                    <span
                      :class="
                        product.stock < product.min_stock
                          ? 'text-red-600 font-semibold'
                          : 'text-foreground'
                      "
                    >
                      {{ product.stock }} {{ product.unit }}
                    </span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex items-center justify-between pt-2 border-t">
                  <div class="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="viewProduct(product)"
                    >
                      <Eye class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="editProduct(product)"
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="copyProduct(product)"
                    >
                      <Copy class="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    :class="
                      product.status === 'active'
                        ? 'text-red-600 hover:text-red-700'
                        : 'text-green-600 hover:text-green-700'
                    "
                    @click="toggleStatus(product)"
                  >
                    <Power class="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <!-- 库存预警标识 -->
              <div
                v-if="product.stock < product.min_stock"
                class="absolute top-2 left-2"
              >
                <Badge variant="destructive" class="text-xs">
                  <AlertTriangle class="mr-1 h-3 w-3" />
                  低库存
                </Badge>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="flex items-center justify-between pt-6">
            <p class="text-sm text-muted-foreground">
              显示第 {{ (currentPage - 1) * Number(pageSize) + 1 }} -
              {{
                Math.min(
                  currentPage * Number(pageSize),
                  filteredProducts.length
                )
              }}
              条，共 {{ filteredProducts.length }} 条记录
            </p>
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <ChevronLeft class="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                下一页
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 产品详情/编辑对话框 -->
    <Dialog v-model:open="showProductModal">
      <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Package class="h-5 w-5" />
            {{ modalTitle }}
          </DialogTitle>
          <DialogDescription>
            {{ isEditing ? "编辑产品信息" : "创建新的产品" }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-6 py-4">
          <!-- 基本信息 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <Info class="h-4 w-4" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>产品编码</Label>
                  <Input
                    v-model="currentProduct.code"
                    placeholder="系统自动生成"
                    :disabled="isEditing"
                    class="font-mono"
                  />
                </div>
                <div class="space-y-2">
                  <Label>产品名称 *</Label>
                  <Input
                    v-model="currentProduct.name"
                    placeholder="请输入产品名称"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <Label>产品分类 *</Label>
                  <Select v-model="currentProduct.category">
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="category in categories"
                        :key="category.value"
                        :value="category.value"
                      >
                        {{ category.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label>计量单位</Label>
                  <Select v-model="currentProduct.unit">
                    <SelectTrigger>
                      <SelectValue placeholder="选择单位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="个">个</SelectItem>
                      <SelectItem value="件">件</SelectItem>
                      <SelectItem value="套">套</SelectItem>
                      <SelectItem value="台">台</SelectItem>
                      <SelectItem value="公斤">公斤</SelectItem>
                      <SelectItem value="米">米</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 价格和库存 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <DollarSign class="h-4 w-4" />
                价格与库存
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label>销售价格 *</Label>
                  <Input
                    v-model="currentProduct.price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label>成本价格</Label>
                  <Input
                    v-model="currentProduct.cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div class="space-y-2">
                  <Label>当前库存</Label>
                  <Input
                    v-model="currentProduct.stock"
                    type="number"
                    placeholder="0"
                  />
                </div>
                <div class="space-y-2">
                  <Label>最低库存</Label>
                  <Input
                    v-model="currentProduct.min_stock"
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- 产品描述 -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <FileText class="h-4 w-4" />
                产品描述
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label>产品规格</Label>
                  <Input
                    v-model="currentProduct.specifications"
                    placeholder="请输入产品规格"
                  />
                </div>
                <div class="space-y-2">
                  <Label>产品描述</Label>
                  <Textarea
                    v-model="currentProduct.description"
                    placeholder="请输入产品详细描述..."
                    rows="4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeProductModal">取消</Button>
          <Button :disabled="saving" @click="saveProduct">
            <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditing ? "更新产品" : "创建产品" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Edit,
  Eye,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  Upload,
} from "lucide-vue-next";

// 页面配置
definePageMeta({
  layout: "default",
});

useHead({
  title: "产品管理 - 智能ERP管理系统",
});

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  unit: string;
  status: string;
  specifications: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

// 页面状态
const loading = ref(false);
const saving = ref(false);
const searchKeyword = ref("");
const selectedCategory = ref("all");
const selectedStatus = ref("all");
const pageSize = ref("12");
const currentPage = ref(1);

// 对话框状态
const showProductModal = ref(false);
const isEditing = ref(false);

// 当前编辑的产品
const currentProduct = ref({
  id: "",
  code: "",
  name: "",
  category: "",
  price: 0,
  cost: 0,
  stock: 0,
  min_stock: 0,
  unit: "个",
  status: "active",
  specifications: "",
  description: "",
  created_at: new Date(),
  updated_at: new Date(),
});

// 统计数据
const productStats = ref({
  total: 156,
  active: 132,
  lowStock: 12,
  categories: 8,
  newThisMonth: 15,
});

// 选项数据
const categories = [
  { label: "全部分类", value: "all" },
  { label: "电子产品", value: "electronics" },
  { label: "服装鞋帽", value: "clothing" },
  { label: "食品饮料", value: "food" },
  { label: "办公用品", value: "office" },
  { label: "工业原料", value: "industrial" },
  { label: "家居用品", value: "home" },
  { label: "汽车配件", value: "auto" },
  { label: "医疗器械", value: "medical" },
];

const statusOptions = [
  { label: "全部状态", value: "all" },
  { label: "在售", value: "active" },
  { label: "停售", value: "inactive" },
  { label: "缺货", value: "out_of_stock" },
  { label: "预售", value: "pre_sale" },
];

// 模拟产品数据
const products = ref<Product[]>([
  {
    id: "1",
    code: "P001",
    name: "iPhone 15 Pro Max 256GB",
    category: "electronics",
    price: 9999,
    cost: 7500,
    stock: 25,
    min_stock: 10,
    unit: "台",
    status: "active",
    specifications: "6.7英寸，钛合金边框，A17 Pro芯片",
    description: "苹果最新旗舰手机，配备先进的摄像系统和强劲的A17 Pro芯片",
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: "2",
    code: "P002",
    name: "华为 Mate 60 Pro 512GB",
    category: "electronics",
    price: 6999,
    cost: 5200,
    stock: 8,
    min_stock: 15,
    unit: "台",
    status: "active",
    specifications: "6.82英寸，麒麟9000s，卫星通话",
    description: "华为回归力作，支持卫星通话功能的高端智能手机",
    created_at: new Date("2024-01-10"),
    updated_at: new Date("2024-01-10"),
  },
  {
    id: "3",
    code: "P003",
    name: "小米14 Ultra 16GB+1TB",
    category: "electronics",
    price: 6499,
    cost: 4800,
    stock: 32,
    min_stock: 20,
    unit: "台",
    status: "active",
    specifications: "6.73英寸，骁龙8 Gen3，徕卡影像",
    description: "小米影像旗舰，与徕卡合作打造专业摄影体验",
    created_at: new Date("2024-01-08"),
    updated_at: new Date("2024-01-08"),
  },
  {
    id: "4",
    code: "P004",
    name: "商务西装套装",
    category: "clothing",
    price: 1299,
    cost: 650,
    stock: 45,
    min_stock: 30,
    unit: "套",
    status: "active",
    specifications: "100%羊毛，意大利进口面料",
    description: "高端商务西装，适合正式场合穿着",
    created_at: new Date("2024-01-05"),
    updated_at: new Date("2024-01-05"),
  },
  {
    id: "5",
    code: "P005",
    name: "办公椅人体工学座椅",
    category: "office",
    price: 899,
    cost: 450,
    stock: 18,
    min_stock: 25,
    unit: "把",
    status: "active",
    specifications: "网布材质，多维度调节，承重150kg",
    description: "人体工学设计的办公椅，提供舒适的办公体验",
    created_at: new Date("2024-01-03"),
    updated_at: new Date("2024-01-03"),
  },
  {
    id: "6",
    code: "P006",
    name: "有机绿茶叶500g",
    category: "food",
    price: 168,
    cost: 85,
    stock: 120,
    min_stock: 50,
    unit: "盒",
    status: "active",
    specifications: "有机认证，春茶头采，真空包装",
    description: "优质有机绿茶，来自高山茶园的春茶头采",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01"),
  },
]);

// 计算属性
const filteredProducts = computed(() => {
  let result = products.value;

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.code.toLowerCase().includes(keyword) ||
        product.specifications.toLowerCase().includes(keyword)
    );
  }

  if (selectedCategory.value && selectedCategory.value !== "all") {
    result = result.filter(
      (product) => product.category === selectedCategory.value
    );
  }

  if (selectedStatus.value && selectedStatus.value !== "all") {
    result = result.filter(
      (product) => product.status === selectedStatus.value
    );
  }

  return result;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * Number(pageSize.value);
  const end = start + Number(pageSize.value);
  return filteredProducts.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / Number(pageSize.value));
});

const modalTitle = computed(() => {
  return isEditing.value ? "编辑产品" : "新增产品";
});

// 方法
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: "在售",
    inactive: "停售",
    out_of_stock: "缺货",
    pre_sale: "预售",
  };
  return statusMap[status] || status;
};

const getStatusVariant = (status: string) => {
  const variantMap: Record<
    string,
    "default" | "destructive" | "outline" | "secondary"
  > = {
    active: "default",
    inactive: "secondary",
    out_of_stock: "destructive",
    pre_sale: "outline",
  };
  return variantMap[status] || "secondary";
};

const resetFilters = () => {
  searchKeyword.value = "";
  selectedCategory.value = "all";
  selectedStatus.value = "all";
};

const refreshData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } finally {
    loading.value = false;
  }
};

const importProducts = () => {};

const exportProducts = () => {};

const openProductModal = () => {
  isEditing.value = false;
  currentProduct.value = {
    id: "",
    code: `P${String(products.value.length + 1).padStart(3, "0")}`,
    name: "",
    category: "",
    price: 0,
    cost: 0,
    stock: 0,
    min_stock: 0,
    unit: "个",
    status: "active",
    specifications: "",
    description: "",
    created_at: new Date(),
    updated_at: new Date(),
  };
  showProductModal.value = true;
};

const viewProduct = (product: Product) => {
  editProduct(product);
};

const editProduct = (product: Product) => {
  isEditing.value = true;
  currentProduct.value = { ...product };
  showProductModal.value = true;
};

const copyProduct = (product: Product) => {
  isEditing.value = false;
  currentProduct.value = {
    ...product,
    id: "",
    code: `P${String(products.value.length + 1).padStart(3, "0")}`,
    name: `${product.name} (副本)`,
    created_at: new Date(),
    updated_at: new Date(),
  };
  showProductModal.value = true;
};

const toggleStatus = async (product: Product) => {
  try {
    const newStatus = product.status === "active" ? "inactive" : "active";
    const index = products.value.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      products.value[index]!.status = newStatus;
      products.value[index]!.updated_at = new Date();
    }
  } catch (_error) {}
};

const saveProduct = async () => {
  try {
    saving.value = true;

    if (isEditing.value) {
      const index = products.value.findIndex(
        (p) => p.id === currentProduct.value.id
      );
      if (index !== -1) {
        products.value[index] = {
          ...currentProduct.value,
          price: Number(currentProduct.value.price),
          cost: Number(currentProduct.value.cost),
          stock: Number(currentProduct.value.stock),
          min_stock: Number(currentProduct.value.min_stock),
          updated_at: new Date(),
        };
      }
    } else {
      const newProduct: Product = {
        ...currentProduct.value,
        id: Date.now().toString(),
        price: Number(currentProduct.value.price),
        cost: Number(currentProduct.value.cost),
        stock: Number(currentProduct.value.stock),
        min_stock: Number(currentProduct.value.min_stock),
        created_at: new Date(),
        updated_at: new Date(),
      };
      products.value.push(newProduct);
    }

    closeProductModal();
  } catch (_error) {
  } finally {
    saving.value = false;
  }
};

const closeProductModal = () => {
  showProductModal.value = false;
  isEditing.value = false;
};

// 监听分页变化
watch([pageSize, filteredProducts], () => {
  currentPage.value = 1;
});
</script>
