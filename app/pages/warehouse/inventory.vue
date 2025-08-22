<template>
  <div class="container mx-auto py-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">库存管理</h1>
        <p class="text-muted-foreground">实时监控库存状态，管理库存变动</p>
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新
        </Button>
        <Button @click="showAdjustDialog = true">
          <Plus class="mr-2 h-4 w-4" />
          库存调整
        </Button>
      </div>
    </div>

    <!-- 库存统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-500/10 rounded-full">
              <Package class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">总商品数</p>
              <p class="text-2xl font-semibold">156</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-500/10 rounded-full">
              <TrendingUp class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">库存总值</p>
              <p class="text-2xl font-semibold">¥1,234,567</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-red-500/10 rounded-full">
              <AlertTriangle class="h-6 w-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">低库存预警</p>
              <p class="text-2xl font-semibold">12</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-500/10 rounded-full">
              <Warehouse class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">仓库数量</p>
              <p class="text-2xl font-semibold">3</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 搜索和筛选 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>搜索筛选</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label for="search">搜索商品</Label>
            <Input
              id="search"
              v-model="searchQuery"
              placeholder="商品名称或编码"
              class="mt-1"
            />
          </div>
          <div>
            <Label for="warehouse">仓库</Label>
            <select
              id="warehouse"
              v-model="selectedWarehouse"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部仓库</option>
              <option value="1">主仓库</option>
              <option value="2">原料仓库</option>
              <option value="3">成品仓库</option>
            </select>
          </div>
          <div>
            <Label for="category">商品分类</Label>
            <select
              id="category"
              v-model="selectedCategory"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部分类</option>
              <option value="raw_material">原材料</option>
              <option value="finished_product">成品</option>
              <option value="semi_finished">半成品</option>
            </select>
          </div>
          <div>
            <Label for="status">库存状态</Label>
            <select
              id="status"
              v-model="selectedStatus"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">全部状态</option>
              <option value="normal">正常</option>
              <option value="low">低库存</option>
              <option value="out">缺货</option>
            </select>
          </div>
          <div class="flex items-end">
            <Button @click="handleSearch" class="w-full">
              <Search class="mr-2 h-4 w-4" />
              搜索
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 库存列表 -->
    <Card>
      <CardHeader>
        <CardTitle>库存明细</CardTitle>
        <CardDescription>
          共 {{ mockInventoryData.length }} 个商品
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4 font-medium">商品信息</th>
                <th class="text-left py-3 px-4 font-medium">仓库</th>
                <th class="text-left py-3 px-4 font-medium">当前库存</th>
                <th class="text-left py-3 px-4 font-medium">可用库存</th>
                <th class="text-left py-3 px-4 font-medium">预留库存</th>
                <th class="text-left py-3 px-4 font-medium">安全库存</th>
                <th class="text-left py-3 px-4 font-medium">状态</th>
                <th class="text-left py-3 px-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in mockInventoryData"
                :key="item.id"
                class="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="py-3 px-4">
                  <div>
                    <p class="font-medium">{{ item.product_name }}</p>
                    <p class="text-sm text-muted-foreground">{{ item.product_no }}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm">{{ item.warehouse_name }}</p>
                </td>
                <td class="py-3 px-4">
                  <p class="font-medium">{{ item.current_stock }} {{ item.unit }}</p>
                </td>
                <td class="py-3 px-4">
                  <p class="text-green-600">{{ item.available_stock }} {{ item.unit }}</p>
                </td>
                <td class="py-3 px-4">
                  <p class="text-orange-600">{{ item.reserved_stock }} {{ item.unit }}</p>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm">{{ item.min_stock }} {{ item.unit }}</p>
                </td>
                <td class="py-3 px-4">
                  <Badge :variant="getStockStatusVariant(item.status)">
                    {{ getStockStatusText(item.status) }}
                  </Badge>
                </td>
                <td class="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="viewDetail(item)">
                        <Eye class="mr-2 h-4 w-4" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="adjustStock(item)">
                        <Edit class="mr-2 h-4 w-4" />
                        库存调整
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="viewLog(item)">
                        <History class="mr-2 h-4 w-4" />
                        库存日志
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- 库存调整对话框 -->
    <Dialog v-model:open="showAdjustDialog">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>库存调整</DialogTitle>
          <DialogDescription>调整商品库存数量</DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div>
            <Label>商品</Label>
            <p class="text-sm text-muted-foreground mt-1">产品A (PA001)</p>
          </div>
          <div>
            <Label>当前库存</Label>
            <p class="text-sm text-muted-foreground mt-1">150 件</p>
          </div>
          <div>
            <Label for="quantity">调整数量</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="请输入调整数量"
              class="mt-1"
            />
          </div>
          <div>
            <Label for="reason">调整原因</Label>
            <Input
              id="reason"
              placeholder="请输入调整原因"
              class="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showAdjustDialog = false">
            取消
          </Button>
          <Button @click="handleAdjust">
            确认调整
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, Search, RefreshCw, MoreHorizontal, Package, TrendingUp, 
  AlertTriangle, Warehouse, Eye, Edit, History
} from 'lucide-vue-next'

// 导入组件
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Badge from '~/components/ui/Badge.vue'
import Dialog from '~/components/ui/Dialog.vue'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu'

// 响应式数据
const searchQuery = ref('')
const selectedWarehouse = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const showAdjustDialog = ref(false)

// 模拟库存数据
const mockInventoryData = ref([
  {
    id: '1',
    product_name: '产品A',
    product_no: 'PA001',
    warehouse_name: '主仓库',
    current_stock: 150,
    available_stock: 120,
    reserved_stock: 30,
    min_stock: 50,
    unit: '件',
    status: 'normal'
  },
  {
    id: '2',
    product_name: '产品B',
    product_no: 'PB001',
    warehouse_name: '原料仓库',
    current_stock: 25,
    available_stock: 25,
    reserved_stock: 0,
    min_stock: 30,
    unit: '箱',
    status: 'low'
  },
  {
    id: '3',
    product_name: '产品C',
    product_no: 'PC001',
    warehouse_name: '成品仓库',
    current_stock: 0,
    available_stock: 0,
    reserved_stock: 0,
    min_stock: 20,
    unit: '个',
    status: 'out'
  }
])

// 方法
const refreshData = () => {
  console.log('刷新库存数据')
}

const handleSearch = () => {
  console.log('搜索库存')
}

const viewDetail = (item: any) => {
  console.log('查看详情:', item)
}

const adjustStock = (item: any) => {
  console.log('调整库存:', item)
  showAdjustDialog.value = true
}

const viewLog = (item: any) => {
  console.log('查看日志:', item)
}

const handleAdjust = () => {
  console.log('确认调整')
  showAdjustDialog.value = false
}

const getStockStatusVariant = (status: string) => {
  const variants = {
    normal: 'default' as const,
    low: 'secondary' as const,
    out: 'destructive' as const
  }
  return variants[status as keyof typeof variants] || 'default'
}

const getStockStatusText = (status: string) => {
  const texts: Record<string, string> = {
    normal: '正常',
    low: '低库存',
    out: '缺货'
  }
  return texts[status] || '未知'
}

// 页面元数据
definePageMeta({
  layout: 'default'
})
</script> 