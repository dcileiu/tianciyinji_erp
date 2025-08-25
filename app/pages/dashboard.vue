<template>
  <div class="p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">仪表板</h1>
        <p class="text-muted-foreground mt-1">欢迎回来，查看您的业务概况</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Download class="w-4 h-4 mr-2" />
          导出报告
        </Button>
        <Button size="sm">
          <Plus class="w-4 h-4 mr-2" />
          新建订单
        </Button>
      </div>
    </div>

    <!-- 关键指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">总销售额</p>
              <p class="text-2xl font-bold text-foreground">¥2,345,678</p>
              <p class="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp class="w-3 h-3 mr-1" />
                +12.5% 较上月
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">订单数量</p>
              <p class="text-2xl font-bold text-foreground">1,234</p>
              <p class="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp class="w-3 h-3 mr-1" />
                +8.2% 较上月
              </p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">库存价值</p>
              <p class="text-2xl font-bold text-foreground">¥567,890</p>
              <p class="text-xs text-red-600 flex items-center mt-1">
                <TrendingDown class="w-3 h-3 mr-1" />
                -3.1% 较上月
              </p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package class="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-muted-foreground">客户数量</p>
              <p class="text-2xl font-bold text-foreground">456</p>
              <p class="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp class="w-3 h-3 mr-1" />
                +15.3% 较上月
              </p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users class="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 图表和数据 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 销售趋势图 -->
      <Card>
        <CardHeader>
          <CardTitle>销售趋势</CardTitle>
          <CardDescription>过去12个月的销售数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div class="text-center">
              <BarChart3 class="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p class="text-sm text-muted-foreground">销售趋势图表</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 库存状态 -->
      <Card>
        <CardHeader>
          <CardTitle>库存状态</CardTitle>
          <CardDescription>当前库存概况</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 -full"></div>
                <span class="text-sm">正常库存</span>
              </div>
              <span class="text-sm font-medium">85%</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-yellow-500 -full"></div>
                <span class="text-sm">库存不足</span>
              </div>
              <span class="text-sm font-medium">12%</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-red-500 -full"></div>
                <span class="text-sm">缺货</span>
              </div>
              <span class="text-sm font-medium">3%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 快捷操作和最近活动 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 快捷操作 -->
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <Button variant="outline" class="w-full justify-start">
            <Plus class="w-4 h-4 mr-2" />
            新建销售订单
          </Button>
          <Button variant="outline" class="w-full justify-start">
            <Package class="w-4 h-4 mr-2" />
            添加库存
          </Button>
          <Button variant="outline" class="w-full justify-start">
            <Users class="w-4 h-4 mr-2" />
            新增客户
          </Button>
          <Button variant="outline" class="w-full justify-start">
            <FileText class="w-4 h-4 mr-2" />
            生成报表
          </Button>
        </CardContent>
      </Card>

      <!-- 最近订单 -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>最近订单</CardTitle>
          <CardDescription>最新的销售订单</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p class="font-medium">订单 #SO-2025-001</p>
                <p class="text-sm text-muted-foreground">客户: 张三公司</p>
              </div>
              <div class="text-right">
                <p class="font-medium">¥12,345</p>
                <Badge variant="secondary">待处理</Badge>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p class="font-medium">订单 #SO-2025-002</p>
                <p class="text-sm text-muted-foreground">客户: 李四贸易</p>
              </div>
              <div class="text-right">
                <p class="font-medium">¥8,900</p>
                <Badge variant="default">已确认</Badge>
              </div>
            </div>
            <div class="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p class="font-medium">订单 #SO-2025-003</p>
                <p class="text-sm text-muted-foreground">客户: 王五集团</p>
              </div>
              <div class="text-right">
                <p class="font-medium">¥25,600</p>
                <Badge variant="outline">已发货</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import {
  BarChart3,
  DollarSign,
  Download,
  FileText,
  Package,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-vue-next'
</script>
