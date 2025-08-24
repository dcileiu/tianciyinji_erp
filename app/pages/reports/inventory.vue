<template>
  <div class="p-6 min-h-screen bg-surface-50">
    <!-- 页面标题 -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-3xl font-semibold text-color mb-2">库存报表</h1>
        <p class="text-muted-color">库存分析和盘点统计报表</p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" @click="exportReport">
          <Download class="w-4 h-4 mr-2" />
          导出报表
        </Button>
        <Button @click="refreshData">
          <RefreshCw class="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="text-lg font-semibold">筛选条件</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">仓库筛选</label>
            <Select v-model="warehouseFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择仓库" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in warehouseOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">商品类别</label>
            <Select v-model="categoryFilter">
              <SelectTrigger>
                <SelectValue placeholder="选择类别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">库存状态</label>
            <Select v-model="stockStatusFilter">
              <SelectTrigger>
                <SelectValue placeholder="库存状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in stockStatusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">搜索</label>
            <div class="relative">
              <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                placeholder="搜索商品名称、编码..."
                class="pl-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card
        class="border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-blue-600 mb-1">
                {{ inventoryStats.totalItems }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">商品品种</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="w-4 h-4" />
                <span>+5.2%</span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white"
            >
              <Box class="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-green-600 mb-1">
                {{ inventoryStats.totalQuantity }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">总库存量</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="w-4 h-4" />
                <span>+8.1%</span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white"
            >
              <Database class="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-orange-600 mb-1">
                {{ inventoryStats.lowStockItems }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">库存预警</div>
              <div class="flex items-center gap-1 text-sm text-red-600">
                <ArrowDown class="w-4 h-4" />
                <span>-2.3%</span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white"
            >
              <AlertTriangle class="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="border transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:border-primary"
      >
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-2xl font-semibold text-purple-600 mb-1">
                ¥{{ formatCurrency(inventoryStats.totalValue) }}
              </div>
              <div class="text-sm text-muted-foreground mb-2">库存总价值</div>
              <div class="flex items-center gap-1 text-sm text-green-600">
                <ArrowUp class="w-4 h-4" />
                <span>+12.4%</span>
              </div>
            </div>
            <div
              class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white"
            >
              <DollarSign class="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 库存明细 -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle class="text-lg font-semibold">库存明细</CardTitle>
          <span class="text-sm text-muted-foreground"
            >共 {{ filteredInventoryItems.length }} 条记录</span
          >
        </div>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border">
          <Table>
            <TableHeader v-if="!loading && filteredInventoryItems.length > 0">
              <TableRow>
                <TableHead>商品编码</TableHead>
                <TableHead>商品名称</TableHead>
                <TableHead>仓库</TableHead>
                <TableHead>当前库存</TableHead>
                <TableHead>安全库存</TableHead>
                <TableHead>单位成本</TableHead>
                <TableHead>库存价值</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead class="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <!-- 加载状态 -->
              <template v-if="loading">
                <TableRow v-for="i in 5" :key="i">
                  <TableCell v-for="j in 9" :key="j">
                    <Skeleton class="h-4 w-full" />
                  </TableCell>
                </TableRow>
              </template>
              <!-- 空状态 -->
              <template v-else-if="filteredInventoryItems.length === 0">
                <TableRow>
                  <TableCell colspan="9" class="text-center py-12">
                    <div class="text-muted-foreground">
                      <Inbox class="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 class="text-lg mb-2">暂无库存数据</h3>
                      <p class="mb-4">当前筛选条件下没有找到相关数据</p>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
              <!-- 数据行 -->
              <template v-else>
                <TableRow v-for="item in filteredInventoryItems" :key="item.id">
                  <TableCell>
                    <span
                      class="font-mono bg-muted px-2 py-1 rounded text-primary text-sm"
                    >
                      {{ item.product_code }}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"
                      >
                        <Box class="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div class="font-medium mb-1">
                          {{ item.product_name }}
                        </div>
                        <div class="text-sm text-muted-foreground">
                          {{ getCategoryText(item.category) }}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span>{{ getWarehouseText(item.warehouse) }}</span>
                  </TableCell>

                  <TableCell>
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ item.current_stock }}</span>
                      <span class="text-sm text-muted-foreground">{{
                        item.unit
                      }}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div class="flex items-center gap-2">
                      <span>{{ item.min_stock }}</span>
                      <span class="text-sm text-muted-foreground">{{
                        item.unit
                      }}</span>
                      <Badge
                        v-if="item.current_stock <= item.min_stock"
                        variant="destructive"
                        class="ml-2"
                      >
                        低库存
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span class="font-medium"
                      >¥{{ formatCurrency(item.unit_cost) }}</span
                    >
                  </TableCell>

                  <TableCell>
                    <span class="font-semibold text-green-600 text-lg">
                      ¥{{ formatCurrency(item.current_stock * item.unit_cost) }}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span class="text-sm text-muted-foreground">
                      {{ formatDate(item.last_updated) }}
                    </span>
                  </TableCell>

                  <TableCell class="w-32">
                    <div class="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="viewItem(item)"
                        title="查看详情"
                      >
                        <Eye class="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="viewHistory(item)"
                        title="库存记录"
                      >
                        <History class="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  RefreshCw,
  Download,
  ArrowUp,
  Box,
  Database,
  ArrowDown,
  AlertTriangle,
  DollarSign,
  Eye,
  History,
  Inbox,
} from "lucide-vue-next";

// 页面配置
definePageMeta({
  layout: "default",
});

useHead({
  title: "库存报表 - ERP 管理系统",
});

// 页面状态
const loading = ref(false);
const warehouseFilter = ref("");
const categoryFilter = ref("");
const stockStatusFilter = ref("");
const searchQuery = ref("");

// 仓库选项
const warehouseOptions = ref([
  { label: "全部仓库", value: "" },
  { label: "主仓库", value: "main" },
  { label: "原料仓", value: "raw_material" },
  { label: "成品仓", value: "finished_goods" },
  { label: "备用仓", value: "backup" },
]);

// 类别选项
const categoryOptions = ref([
  { label: "全部类别", value: "" },
  { label: "原材料", value: "raw_material" },
  { label: "成品", value: "finished_product" },
  { label: "半成品", value: "semi_finished" },
  { label: "配件", value: "accessory" },
]);

// 库存状态选项
const stockStatusOptions = ref([
  { label: "全部状态", value: "" },
  { label: "正常库存", value: "normal" },
  { label: "库存预警", value: "low" },
  { label: "库存不足", value: "out" },
]);

// 统计数据
const inventoryStats = ref({
  totalItems: 324,
  totalQuantity: 12580,
  lowStockItems: 28,
  totalValue: 2580000,
});

// 库存明细数据
const inventoryItems = ref([
  {
    id: "1",
    product_code: "P001",
    product_name: "智能控制器",
    category: "finished_product",
    warehouse: "main",
    current_stock: 50,
    min_stock: 20,
    unit: "个",
    unit_cost: 2500,
    last_updated: "2025-01-20",
  },
  {
    id: "2",
    product_code: "R001",
    product_name: "电路板基材",
    category: "raw_material",
    warehouse: "raw_material",
    current_stock: 15,
    min_stock: 30,
    unit: "片",
    unit_cost: 150,
    last_updated: "2025-01-19",
  },
  {
    id: "3",
    product_code: "S001",
    product_name: "半成品模块",
    category: "semi_finished",
    warehouse: "main",
    current_stock: 80,
    min_stock: 25,
    unit: "个",
    unit_cost: 800,
    last_updated: "2025-01-18",
  },
  {
    id: "4",
    product_code: "A001",
    product_name: "连接器",
    category: "accessory",
    warehouse: "main",
    current_stock: 200,
    min_stock: 100,
    unit: "个",
    unit_cost: 50,
    last_updated: "2025-01-17",
  },
]);

// 计算属性
const filteredInventoryItems = computed(() => {
  let result = inventoryItems.value;

  if (searchQuery.value) {
    result = result.filter(
      (item) =>
        item.product_name
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        item.product_code
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
    );
  }

  if (warehouseFilter.value) {
    result = result.filter((item) => item.warehouse === warehouseFilter.value);
  }

  if (categoryFilter.value) {
    result = result.filter((item) => item.category === categoryFilter.value);
  }

  if (stockStatusFilter.value) {
    result = result.filter((item) => {
      if (stockStatusFilter.value === "normal") {
        return item.current_stock > item.min_stock;
      } else if (stockStatusFilter.value === "low") {
        return item.current_stock <= item.min_stock && item.current_stock > 0;
      } else if (stockStatusFilter.value === "out") {
        return item.current_stock === 0;
      }
      return true;
    });
  }

  return result;
});

// 方法
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getCategoryText = (category: string) => {
  const categoryMap: Record<string, string> = {
    raw_material: "原材料",
    finished_product: "成品",
    semi_finished: "半成品",
    accessory: "配件",
  };
  return categoryMap[category] || category;
};

const getWarehouseText = (warehouse: string) => {
  const warehouseMap: Record<string, string> = {
    main: "主仓库",
    raw_material: "原料仓",
    finished_goods: "成品仓",
    backup: "备用仓",
  };
  return warehouseMap[warehouse] || warehouse;
};

const getWarehouseSeverity = (warehouse: string) => {
  const severityMap: Record<string, string> = {
    main: "success",
    raw_material: "info",
    finished_goods: "warn",
    backup: "secondary",
  };
  return severityMap[warehouse] || "secondary";
};

const exportReport = () => {
  console.log("导出库存报表");
  // 这里可以实现导出功能
};

const refreshData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    console.log("数据已刷新");
  }, 1000);
};

const viewItem = (item: any) => {
  console.log("查看商品详情:", item);
  // 这里可以实现查看详情功能
};

const viewHistory = (item: any) => {
  console.log("查看库存记录:", item);
  // 这里可以实现查看库存记录功能
};
</script>
