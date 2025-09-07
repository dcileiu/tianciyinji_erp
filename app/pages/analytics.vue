<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">数据分析</h1>
        <p class="text-muted-foreground mt-1">深度分析业务数据趋势</p>
      </div>
      <div class="flex items-center gap-2">
        <Select v-model="selectedPeriod">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="选择时间段" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">最近7天</SelectItem>
            <SelectItem value="30d">最近30天</SelectItem>
            <SelectItem value="90d">最近90天</SelectItem>
            <SelectItem value="1y">最近一年</SelectItem>
          </SelectContent>
        </Select>
        <Button @click="refreshData" size="sm" variant="outline">
          <RefreshCw class="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">总营收</p>
              <div class="flex items-center">
                <h3 class="text-2xl font-bold">{{ formatCurrency(kpiData.totalRevenue) }}</h3>
                <Badge :variant="kpiData.revenueGrowth >= 0 ? 'default' : 'destructive'" class="ml-2">
                  {{ kpiData.revenueGrowth >= 0 ? '+' : '' }}{{ kpiData.revenueGrowth }}%
                </Badge>
              </div>
            </div>
            <DollarSign class="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">订单数量</p>
              <div class="flex items-center">
                <h3 class="text-2xl font-bold">{{ kpiData.totalOrders.toLocaleString() }}</h3>
                <Badge :variant="kpiData.ordersGrowth >= 0 ? 'default' : 'destructive'" class="ml-2">
                  {{ kpiData.ordersGrowth >= 0 ? '+' : '' }}{{ kpiData.ordersGrowth }}%
                </Badge>
              </div>
            </div>
            <ShoppingCart class="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">客户数量</p>
              <div class="flex items-center">
                <h3 class="text-2xl font-bold">{{ kpiData.totalCustomers.toLocaleString() }}</h3>
                <Badge :variant="kpiData.customersGrowth >= 0 ? 'default' : 'destructive'" class="ml-2">
                  {{ kpiData.customersGrowth >= 0 ? '+' : '' }}{{ kpiData.customersGrowth }}%
                </Badge>
              </div>
            </div>
            <Users class="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-1">
              <p class="text-sm font-medium text-muted-foreground">转化率</p>
              <div class="flex items-center">
                <h3 class="text-2xl font-bold">{{ kpiData.conversionRate }}%</h3>
                <Badge :variant="kpiData.conversionGrowth >= 0 ? 'default' : 'destructive'" class="ml-2">
                  {{ kpiData.conversionGrowth >= 0 ? '+' : '' }}{{ kpiData.conversionGrowth }}%
                </Badge>
              </div>
            </div>
            <TrendingUp class="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 主要图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 销售趋势图 -->
      <Card>
        <CardHeader>
          <CardTitle>销售趋势</CardTitle>
          <CardDescription>{{ selectedPeriod === '7d' ? '过去7天' : selectedPeriod === '30d' ? '过去30天' : selectedPeriod === '90d' ? '过去90天' : '过去一年' }}的销售数据</CardDescription>
        </CardHeader>
        <CardContent>
          <AreaChart
            v-if="salesTrendData.length > 0"
            :data="salesTrendData"
            index="date"
            :categories="['revenue', 'orders']"
            :colors="['hsl(var(--chart-1))', 'hsl(var(--chart-2))']"
            :value-formatter="formatChartValue"
            class="h-80"
            :show-legend="true"
            :show-tooltip="true"
            :show-grid-line="true"
          />
          <div v-else class="h-80 flex items-center justify-center">
            <div class="flex items-center space-x-2 text-muted-foreground">
              <Loader2 class="h-4 w-4 animate-spin" />
              <span>加载中...</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 产品分类营收分布 -->
      <Card>
        <CardHeader>
          <CardTitle>产品分类营收</CardTitle>
          <CardDescription>各产品分类的营收分布</CardDescription>
        </CardHeader>
        <CardContent>
          <DonutChart
            v-if="categoryRevenueData.length > 0"
            :data="categoryRevenueData"
            index="category"
            category="revenue"
            :colors="['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']"
            :value-formatter="formatCurrency"
            class="h-80"
            :show-legend="true"
            :show-tooltip="true"
          />
          <div v-else class="h-80 flex items-center justify-center">
            <div class="flex items-center space-x-2 text-muted-foreground">
              <Loader2 class="h-4 w-4 animate-spin" />
              <span>加载中...</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 月度对比柱状图 -->
      <Card>
        <CardHeader>
          <CardTitle>月度业绩对比</CardTitle>
          <CardDescription>本年度各月份销售业绩对比</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            v-if="monthlyComparisonData.length > 0"
            :data="monthlyComparisonData"
            index="month"
            :categories="['currentYear', 'lastYear']"
            :colors="['hsl(var(--chart-1))', 'hsl(var(--chart-2))']"
            :value-formatter="formatCurrency"
            class="h-80"
            :show-legend="true"
            :show-tooltip="true"
            :show-grid-line="true"
            type="grouped"
          />
          <div v-else class="h-80 flex items-center justify-center">
            <div class="flex items-center space-x-2 text-muted-foreground">
              <Loader2 class="h-4 w-4 animate-spin" />
              <span>加载中...</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 销售漏斗分析 -->
      <Card>
        <CardHeader>
          <CardTitle>销售漏斗</CardTitle>
          <CardDescription>从潜在客户到成交的转化流程</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="stage in funnelData" :key="stage.stage" class="flex items-center">
              <div class="w-24 text-sm font-medium text-muted-foreground">{{ stage.stage }}</div>
              <div class="flex-1 mx-4">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium">{{ stage.count.toLocaleString() }}</span>
                  <span class="text-sm text-muted-foreground">{{ stage.percentage }}%</span>
                </div>
                <Progress :value="stage.percentage" class="h-2" />
              </div>
              <div class="w-20 text-right text-sm text-muted-foreground">
                {{ stage.conversion ? `${stage.conversion}%` : '-' }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 详细数据表格 -->
    <Card>
      <CardHeader>
        <CardTitle>热销产品排行</CardTitle>
        <CardDescription>{{ selectedPeriod === '7d' ? '过去7天' : selectedPeriod === '30d' ? '过去30天' : selectedPeriod === '90d' ? '过去90天' : '过去一年' }}热销产品TOP10</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[50px]">排名</TableHead>
                <TableHead>产品名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead class="text-right">销量</TableHead>
                <TableHead class="text-right">营收</TableHead>
                <TableHead class="text-right">增长率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(product, index) in topProductsData" :key="product.id">
                <TableCell class="font-medium">{{ index + 1 }}</TableCell>
                <TableCell>{{ product.name }}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{{ product.category }}</Badge>
                </TableCell>
                <TableCell class="text-right">{{ product.sales.toLocaleString() }}</TableCell>
                <TableCell class="text-right">{{ formatCurrency(product.revenue) }}</TableCell>
                <TableCell class="text-right">
                  <Badge :variant="product.growth >= 0 ? 'default' : 'destructive'">
                    {{ product.growth >= 0 ? '+' : '' }}{{ product.growth }}%
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  DollarSign,
  Loader2,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default',
});

// 数据状态
const selectedPeriod = ref('30d');
const loading = ref(false);

// 关键指标数据
const kpiData = ref({
  totalRevenue: 2_580_000,
  revenueGrowth: 12.5,
  totalOrders: 1847,
  ordersGrowth: 8.3,
  totalCustomers: 892,
  customersGrowth: 15.2,
  conversionRate: 3.8,
  conversionGrowth: 2.1,
});

// 销售趋势数据
const salesTrendData = ref([
  { date: '01-01', revenue: 45_000, orders: 123 },
  { date: '01-02', revenue: 52_000, orders: 145 },
  { date: '01-03', revenue: 48_000, orders: 132 },
  { date: '01-04', revenue: 61_000, orders: 167 },
  { date: '01-05', revenue: 55_000, orders: 151 },
  { date: '01-06', revenue: 67_000, orders: 184 },
  { date: '01-07', revenue: 72_000, orders: 198 },
  { date: '01-08', revenue: 58_000, orders: 159 },
  { date: '01-09', revenue: 63_000, orders: 173 },
  { date: '01-10', revenue: 69_000, orders: 189 },
  { date: '01-11', revenue: 75_000, orders: 206 },
  { date: '01-12', revenue: 82_000, orders: 225 },
]);

// 产品分类营收数据
const categoryRevenueData = ref([
  { category: '电子产品', revenue: 680_000 },
  { category: '服装配饰', revenue: 520_000 },
  { category: '家居用品', revenue: 380_000 },
  { category: '食品饮料', revenue: 450_000 },
  { category: '图书文具', revenue: 280_000 },
]);

// 月度对比数据
const monthlyComparisonData = ref([
  { month: '1月', currentYear: 185_000, lastYear: 162_000 },
  { month: '2月', currentYear: 198_000, lastYear: 175_000 },
  { month: '3月', currentYear: 221_000, lastYear: 189_000 },
  { month: '4月', currentYear: 235_000, lastYear: 198_000 },
  { month: '5月', currentYear: 258_000, lastYear: 215_000 },
  { month: '6月', currentYear: 271_000, lastYear: 228_000 },
  { month: '7月', currentYear: 289_000, lastYear: 245_000 },
  { month: '8月', currentYear: 305_000, lastYear: 261_000 },
  { month: '9月', currentYear: 292_000, lastYear: 248_000 },
  { month: '10月', currentYear: 318_000, lastYear: 275_000 },
  { month: '11月', currentYear: 335_000, lastYear: 289_000 },
  { month: '12月', currentYear: 352_000, lastYear: 305_000 },
]);

// 销售漏斗数据
const funnelData = ref([
  { stage: '访客', count: 15_420, percentage: 100, conversion: null },
  { stage: '浏览', count: 8932, percentage: 58, conversion: 58 },
  { stage: '加购物车', count: 3456, percentage: 22, conversion: 39 },
  { stage: '下单', count: 1847, percentage: 12, conversion: 53 },
  { stage: '支付', count: 1652, percentage: 11, conversion: 89 },
]);

// 热销产品数据
const topProductsData = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro',
    category: '电子产品',
    sales: 1245,
    revenue: 1_867_500,
    growth: 23.5,
  },
  {
    id: 2,
    name: '无线蓝牙耳机',
    category: '电子产品',
    sales: 2156,
    revenue: 431_200,
    growth: 18.2,
  },
  {
    id: 3,
    name: '运动休闲鞋',
    category: '服装配饰',
    sales: 892,
    revenue: 534_200,
    growth: 12.8,
  },
  {
    id: 4,
    name: '智能手表',
    category: '电子产品',
    sales: 756,
    revenue: 453_600,
    growth: 31.4,
  },
  {
    id: 5,
    name: '咖啡豆套装',
    category: '食品饮料',
    sales: 1456,
    revenue: 291_200,
    growth: 8.9,
  },
  {
    id: 6,
    name: '瑜伽垫',
    category: '家居用品',
    sales: 634,
    revenue: 190_200,
    growth: 15.6,
  },
  {
    id: 7,
    name: '护肤套装',
    category: '服装配饰',
    sales: 892,
    revenue: 267_600,
    growth: 22.1,
  },
  {
    id: 8,
    name: '蓝牙音箱',
    category: '电子产品',
    sales: 567,
    revenue: 170_100,
    growth: 6.3,
  },
  {
    id: 9,
    name: '办公笔记本',
    category: '图书文具',
    sales: 1234,
    revenue: 123_400,
    growth: -2.5,
  },
  {
    id: 10,
    name: '保温杯',
    category: '家居用品',
    sales: 789,
    revenue: 118_350,
    growth: 11.2,
  },
]);

// 工具函数
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatChartValue = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

// 刷新数据
const refreshData = async () => {
  loading.value = true;
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // 这里可以添加实际的API调用逻辑
  } finally {
    loading.value = false;
  }
};

// 监听时间段变化
watch(selectedPeriod, () => {
  refreshData();
});
</script>
