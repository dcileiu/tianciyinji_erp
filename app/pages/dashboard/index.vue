<template>
  <div class="space-y-8">
    <!-- 页面标题和快捷操作 -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p class="text-muted-foreground">
          欢迎回来，{{
            user?.email?.split("@")[0] || "用户"
          }}！这里是您的业务概览
        </p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新数据
        </Button>
        <Button size="sm" @click="navigateTo('/sales/orders')">
          <Plus class="mr-2 h-4 w-4" />
          新建订单
        </Button>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">今日销售</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold">
                  ¥{{ formatNumber(todaySales) }}
                </p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +{{ salesGrowth }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">
                较昨日 {{ salesGrowth > 0 ? "增长" : "下降" }}
              </p>
            </div>
            <div class="ml-auto">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
              >
                <DollarSign class="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">
                待处理订单
              </p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold">{{ pendingOrders }}</p>
                <Badge variant="destructive" class="text-xs">紧急</Badge>
              </div>
              <p class="text-xs text-muted-foreground">需要及时处理</p>
            </div>
            <div class="ml-auto">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900"
              >
                <ShoppingCart
                  class="h-4 w-4 text-orange-600 dark:text-orange-400"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">库存预警</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold">{{ lowStockItems }}</p>
                <Badge variant="outline" class="text-xs">
                  {{ lowStockItems > 20 ? "严重" : "轻微" }}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">商品库存不足</p>
            </div>
            <div class="ml-auto">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
              >
                <Package class="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="space-y-2">
              <p class="text-sm font-medium text-muted-foreground">活跃客户</p>
              <div class="flex items-baseline space-x-3">
                <p class="text-2xl font-bold">{{ activeCustomers }}</p>
                <Badge variant="secondary" class="text-xs">
                  <TrendingUp class="mr-1 h-3 w-3" />
                  +{{ customerGrowth }}%
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">
                本月新增 {{ newCustomers }} 位
              </p>
            </div>
            <div class="ml-auto">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
              >
                <Users class="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 图表和数据分析 -->
    <div class="grid gap-4 lg:grid-cols-7">
      <!-- 销售趋势 -->
      <Card class="col-span-4">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>销售趋势</CardTitle>
              <CardDescription>过去30天的销售数据走势</CardDescription>
            </div>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-muted': chartPeriod === '7d' }"
                @click="chartPeriod = '7d'"
              >
                7天
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-muted': chartPeriod === '30d' }"
                @click="chartPeriod = '30d'"
              >
                30天
              </Button>
              <Button
                variant="outline"
                size="sm"
                :class="{ 'bg-muted': chartPeriod === '90d' }"
                @click="chartPeriod = '90d'"
              >
                90天
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            class="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center"
          >
            <div class="text-center space-y-3">
              <BarChart3 class="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">销售趋势图表</p>
                <p class="text-xs text-muted-foreground">
                  图表组件将在此处显示
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 快捷操作和通知 -->
      <div class="col-span-3 space-y-4">
        <!-- 快捷操作 -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">快捷操作</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button
              variant="outline"
              class="w-full justify-start h-auto p-3"
              @click="navigateTo('/sales/orders')"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded bg-blue-100 dark:bg-blue-900"
                >
                  <Plus class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium">新建订单</p>
                  <p class="text-xs text-muted-foreground">创建销售订单</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start h-auto p-3"
              @click="navigateTo('/warehouse/inventory')"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded bg-green-100 dark:bg-green-900"
                >
                  <Package class="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium">库存管理</p>
                  <p class="text-xs text-muted-foreground">查看库存状态</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              class="w-full justify-start h-auto p-3"
              @click="navigateTo('/reports')"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded bg-purple-100 dark:bg-purple-900"
                >
                  <FileText
                    class="h-4 w-4 text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium">生成报表</p>
                  <p class="text-xs text-muted-foreground">查看业务报表</p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <!-- 系统通知 -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">系统通知</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div class="flex items-start space-x-3 rounded-lg border p-3">
                <div class="flex h-2 w-2 mt-2 rounded-full bg-red-500"></div>
                <div class="space-y-1">
                  <p class="text-sm font-medium">库存预警</p>
                  <p class="text-xs text-muted-foreground">
                    {{ lowStockItems }} 个商品库存不足，请及时补货
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatTime(new Date()) }}
                  </p>
                </div>
              </div>
              <div class="flex items-start space-x-3 rounded-lg border p-3">
                <div class="flex h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                <div class="space-y-1">
                  <p class="text-sm font-medium">订单提醒</p>
                  <p class="text-xs text-muted-foreground">
                    有 {{ pendingOrders }} 个订单待处理
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatTime(new Date()) }}
                  </p>
                </div>
              </div>
              <div class="flex items-start space-x-3 rounded-lg border p-3">
                <div class="flex h-2 w-2 mt-2 rounded-full bg-green-500"></div>
                <div class="space-y-1">
                  <p class="text-sm font-medium">系统更新</p>
                  <p class="text-xs text-muted-foreground">
                    系统已更新到最新版本
                  </p>
                  <p class="text-xs text-muted-foreground">2小时前</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 最近活动和数据表格 -->
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- 最近订单 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>最近订单</CardTitle>
              <CardDescription>最新的销售订单记录</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              @click="navigateTo('/sales/orders')"
            >
              查看全部
              <ArrowRight class="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="order in recentOrders"
              :key="order.id"
              class="flex items-center justify-between rounded-lg border p-4"
            >
              <div class="space-y-1">
                <p class="text-sm font-medium">{{ order.orderNo }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ order.customer }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ formatTime(order.createdAt) }}
                </p>
              </div>
              <div class="text-right space-y-1">
                <p class="text-sm font-medium">
                  ¥{{ formatNumber(order.amount) }}
                </p>
                <Badge :variant="getOrderStatusVariant(order.status)">
                  {{ order.status }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 热销产品 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>热销产品</CardTitle>
              <CardDescription>本月销量排行榜</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              @click="navigateTo('/master-data/products')"
            >
              查看全部
              <ArrowRight class="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="(product, index) in topProducts"
              :key="product.id"
              class="flex items-center space-x-4"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium"
              >
                {{ index + 1 }}
              </div>
              <div class="flex-1 space-y-1">
                <p class="text-sm font-medium">{{ product.name }}</p>
                <p class="text-xs text-muted-foreground">
                  销量: {{ product.sales }} 件
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">
                  ¥{{ formatNumber(product.revenue) }}
                </p>
                <p class="text-xs text-muted-foreground">营收</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowRight,
  DollarSign,
  FileText,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-vue-next";

// 获取用户信息
const user = useSupabaseUser();

// 响应式数据
const chartPeriod = ref("30d");
const todaySales = ref(125_680);
const salesGrowth = ref(12.5);
const pendingOrders = ref(23);
const lowStockItems = ref(15);
const activeCustomers = ref(1248);
const customerGrowth = ref(8.3);
const newCustomers = ref(42);

// 最近订单数据
const recentOrders = ref([
  {
    id: 1,
    orderNo: "SO-2025-001",
    customer: "张三科技有限公司",
    amount: 15_680,
    status: "待确认",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
  },
  {
    id: 2,
    orderNo: "SO-2025-002",
    customer: "李四贸易公司",
    amount: 23_400,
    status: "已确认",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
  },
  {
    id: 3,
    orderNo: "SO-2025-003",
    customer: "王五集团",
    amount: 45_200,
    status: "已发货",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5小时前
  },
  {
    id: 4,
    orderNo: "SO-2025-004",
    customer: "赵六实业",
    amount: 12_800,
    status: "已完成",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
  },
]);

// 热销产品数据
const topProducts = ref([
  { id: 1, name: "智能手机 Pro Max", sales: 245, revenue: 588_000 },
  { id: 2, name: "无线蓝牙耳机", sales: 189, revenue: 132_300 },
  { id: 3, name: "平板电脑 Air", sales: 156, revenue: 468_000 },
  { id: 4, name: "智能手表 Series", sales: 134, revenue: 201_000 },
  { id: 5, name: "便携充电宝", sales: 98, revenue: 29_400 },
]);

// 工具函数
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("zh-CN").format(num);
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 60) {
    return `${minutes}分钟前`;
  }
  if (hours < 24) {
    return `${hours}小时前`;
  }

  return `${days}天前`;
};

const getOrderStatusVariant = (status: string) => {
  switch (status) {
    case "待确认":
      return "secondary";
    case "已确认":
      return "default";
    case "已发货":
      return "outline";
    case "已完成":
      return "secondary";
    default:
      return "secondary";
  }
};

// 刷新数据
const refreshData = () => {
  // 模拟数据刷新
  todaySales.value = Math.floor(Math.random() * 200_000) + 100_000;
  salesGrowth.value = Math.floor(Math.random() * 20) + 5;
  pendingOrders.value = Math.floor(Math.random() * 30) + 10;
  lowStockItems.value = Math.floor(Math.random() * 25) + 5;
  activeCustomers.value = Math.floor(Math.random() * 500) + 1000;
};

// 页面元信息
definePageMeta({
  layout: "default",
});
</script>
