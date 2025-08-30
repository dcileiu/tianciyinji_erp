<template>
  <div class="space-y-8">
    <!-- 页面标题和操作 -->
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">统计分析</h1>
        <p class="text-muted-foreground">深入分析业务数据，洞察经营趋势</p>
      </div>
      <div class="flex gap-3">
        <Select v-model="selectedPeriod">
          <SelectTrigger class="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">最近7天</SelectItem>
            <SelectItem value="30d">最近30天</SelectItem>
            <SelectItem value="90d">最近90天</SelectItem>
            <SelectItem value="1y">最近1年</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" @click="exportData">
          <Download class="mr-2 h-4 w-4" />
          导出数据
        </Button>
        <Button size="sm" @click="refreshStats">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>
    </div>

    <!-- 核心指标概览 -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">总销售额</CardTitle>
            <TrendingUp class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">
              ¥{{ formatCurrency(totalRevenue) }}
            </div>
            <p class="text-xs text-muted-foreground">
              <span
                :class="revenueChange >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ revenueChange >= 0 ? "+" : "" }}{{ revenueChange }}%
              </span>
              较{{ getPeriodLabel() }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">订单总数</CardTitle>
            <ShoppingBag class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">
              {{ totalOrders.toLocaleString() }}
            </div>
            <p class="text-xs text-muted-foreground">
              <span
                :class="orderChange >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ orderChange >= 0 ? "+" : "" }}{{ orderChange }}%
              </span>
              较{{ getPeriodLabel() }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">平均订单价值</CardTitle>
            <Calculator class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">
              ¥{{ formatCurrency(avgOrderValue) }}
            </div>
            <p class="text-xs text-muted-foreground">
              <span :class="aovChange >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ aovChange >= 0 ? "+" : "" }}{{ aovChange }}%
              </span>
              较{{ getPeriodLabel() }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">客户转化率</CardTitle>
            <Target class="h-4 w-4 text-muted-foreground" />
          </div>
          <div class="space-y-1">
            <div class="text-2xl font-bold">{{ conversionRate }}%</div>
            <p class="text-xs text-muted-foreground">
              <span
                :class="
                  conversionChange >= 0 ? 'text-green-600' : 'text-red-600'
                "
              >
                {{ conversionChange >= 0 ? "+" : "" }}{{ conversionChange }}%
              </span>
              较{{ getPeriodLabel() }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 图表分析 -->
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- 销售趋势图 -->
      <Card>
        <CardHeader>
          <CardTitle>销售趋势分析</CardTitle>
          <CardDescription
            >{{ getPeriodLabel() }}的销售数据变化</CardDescription
          >
        </CardHeader>
        <CardContent>
          <div
            class="h-[350px] w-full rounded-md border border-dashed flex items-center justify-center"
          >
            <div class="text-center space-y-3">
              <TrendingUp class="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">销售趋势折线图</p>
                <p class="text-xs text-muted-foreground">
                  显示{{ getPeriodLabel() }}销售额变化趋势
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 订单分布图 -->
      <Card>
        <CardHeader>
          <CardTitle>订单状态分布</CardTitle>
          <CardDescription>各状态订单数量占比</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            class="h-[350px] w-full rounded-md border border-dashed flex items-center justify-center"
          >
            <div class="text-center space-y-3">
              <PieChart class="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">订单状态饼图</p>
                <p class="text-xs text-muted-foreground">
                  显示不同状态订单的分布情况
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 详细数据表格 -->
    <div class="grid gap-4 lg:grid-cols-3">
      <!-- 销售排行榜 -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">销售排行榜</CardTitle>
          <CardDescription>{{ getPeriodLabel() }}销售业绩</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="(item, index) in topSales"
              :key="item.id"
              class="flex items-center space-x-4"
            >
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full"
                :class="getRankingColor(index)"
              >
                <span class="text-sm font-bold text-white">{{
                  index + 1
                }}</span>
              </div>
              <div class="flex-1 space-y-1">
                <p class="text-sm font-medium leading-none">{{ item.name }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ item.department }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">
                  ¥{{ formatCurrency(item.amount) }}
                </p>
                <p class="text-xs text-muted-foreground">{{ item.orders }}单</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 产品分析 -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">热销产品</CardTitle>
          <CardDescription>{{ getPeriodLabel() }}销量统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="(product, index) in topProducts"
              :key="product.id"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="text-sm font-medium">{{ product.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ product.category }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium">{{ product.sales }}件</p>
                <p class="text-xs text-muted-foreground">
                  ¥{{ formatCurrency(product.revenue) }}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 客户分析 -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">客户分析</CardTitle>
          <CardDescription>{{ getPeriodLabel() }}客户数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div class="space-y-1">
                <p class="text-sm font-medium">新增客户</p>
                <p class="text-xs text-muted-foreground">
                  {{ getPeriodLabel() }}新注册
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-green-600">
                  +{{ newCustomers }}
                </p>
                <p class="text-xs text-muted-foreground">
                  较上期 +{{ customerGrowth }}%
                </p>
              </div>
            </div>
            <div
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div class="space-y-1">
                <p class="text-sm font-medium">活跃客户</p>
                <p class="text-xs text-muted-foreground">
                  {{ getPeriodLabel() }}有交易
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-blue-600">
                  {{ activeCustomers }}
                </p>
                <p class="text-xs text-muted-foreground">
                  活跃率 {{ activityRate }}%
                </p>
              </div>
            </div>
            <div
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div class="space-y-1">
                <p class="text-sm font-medium">客户留存</p>
                <p class="text-xs text-muted-foreground">重复购买率</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-purple-600">
                  {{ retentionRate }}%
                </p>
                <p class="text-xs text-muted-foreground">
                  较上期 +{{ retentionChange }}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 地域分析 -->
    <Card>
      <CardHeader>
        <CardTitle>地域销售分析</CardTitle>
        <CardDescription>{{ getPeriodLabel() }}各地区销售数据</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center"
          >
            <div class="text-center space-y-3">
              <Map class="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p class="text-sm font-medium">销售地图</p>
                <p class="text-xs text-muted-foreground">
                  各地区销售额分布热力图
                </p>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div
              v-for="region in regionData"
              :key="region.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="flex h-2 w-2 rounded-full"
                  :style="{ backgroundColor: region.color }"
                ></div>
                <span class="text-sm font-medium">{{ region.name }}</span>
              </div>
              <div class="text-right space-x-4">
                <span class="text-sm font-medium"
                  >¥{{ formatCurrency(region.sales) }}</span
                >
                <span class="text-xs text-muted-foreground"
                  >{{ region.percentage }}%</span
                >
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  Calculator,
  Download,
  Map,
  PieChart,
  RefreshCw,
  ShoppingBag,
  Target,
} from "lucide-vue-next";

// 响应式数据
const selectedPeriod = ref("30d");
const totalRevenue = ref(2_345_678);
const revenueChange = ref(12.5);
const totalOrders = ref(1234);
const orderChange = ref(8.2);
const avgOrderValue = ref(1900);
const aovChange = ref(5.3);
const conversionRate = ref(3.2);
const conversionChange = ref(0.5);
const newCustomers = ref(156);
const customerGrowth = ref(15.3);
const activeCustomers = ref(892);
const activityRate = ref(68.5);
const retentionRate = ref(45.2);
const retentionChange = ref(3.1);

// 销售排行榜数据
const topSales = ref([
  { id: 1, name: "张三", department: "华东区", amount: 156_800, orders: 45 },
  { id: 2, name: "李四", department: "华南区", amount: 143_200, orders: 38 },
  { id: 3, name: "王五", department: "华北区", amount: 128_900, orders: 42 },
  { id: 4, name: "赵六", department: "西南区", amount: 115_600, orders: 35 },
  { id: 5, name: "钱七", department: "东北区", amount: 98_400, orders: 28 },
]);

// 热销产品数据
const topProducts = ref([
  {
    id: 1,
    name: "智能手机 Pro",
    category: "电子产品",
    sales: 245,
    revenue: 588_000,
  },
  { id: 2, name: "无线耳机", category: "配件", sales: 189, revenue: 132_300 },
  {
    id: 3,
    name: "平板电脑",
    category: "电子产品",
    sales: 156,
    revenue: 468_000,
  },
  { id: 4, name: "智能手表", category: "可穿戴", sales: 134, revenue: 201_000 },
  { id: 5, name: "充电宝", category: "配件", sales: 98, revenue: 29_400 },
]);

// 地域数据
const regionData = ref([
  { name: "华东地区", sales: 856_200, percentage: 35.2, color: "#3b82f6" },
  { name: "华南地区", sales: 642_800, percentage: 26.4, color: "#10b981" },
  { name: "华北地区", sales: 523_400, percentage: 21.5, color: "#f59e0b" },
  { name: "西南地区", sales: 298_600, percentage: 12.3, color: "#ef4444" },
  { name: "东北地区", sales: 114_500, percentage: 4.7, color: "#8b5cf6" },
]);

// 工具函数
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getPeriodLabel = () => {
  switch (selectedPeriod.value) {
    case "7d":
      return "上周";
    case "30d":
      return "上月";
    case "90d":
      return "上季度";
    case "1y":
      return "去年";
    default:
      return "上期";
  }
};

const getRankingColor = (index: number) => {
  switch (index) {
    case 0:
      return "bg-yellow-500";
    case 1:
      return "bg-gray-400";
    case 2:
      return "bg-orange-600";
    default:
      return "bg-muted-foreground";
  }
};

// 方法
const refreshStats = () => {
  // 模拟数据刷新
  totalRevenue.value = Math.floor(Math.random() * 1_000_000) + 2_000_000;
  revenueChange.value = Math.floor(Math.random() * 30) - 10;
  totalOrders.value = Math.floor(Math.random() * 500) + 1000;
  orderChange.value = Math.floor(Math.random() * 20) - 5;
};

const exportData = () => {
  // 模拟数据导出
};

// 监听时间段变化
watch(selectedPeriod, (_newPeriod) => {
  // 根据选择的时间段更新数据
  refreshStats();
});

// 页面元信息
definePageMeta({
  layout: "default",
});
</script>
