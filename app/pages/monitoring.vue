<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground flex items-center">
          <Monitor class="mr-3 h-8 w-8" />
          系统监控
        </h1>
        <p class="text-muted-foreground mt-1">实时监控系统运行状态和性能指标</p>
      </div>
      <Button variant="outline" @click="refreshData">
        <RefreshCw class="mr-2 h-4 w-4" />
        刷新数据
      </Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Activity class="mr-2 h-5 w-5 text-green-600" />
            系统状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium">正常运行</span>
          </div>
          <p class="text-xs text-muted-foreground mt-2 flex items-center">
            <Clock class="mr-1 h-3 w-3" />
            运行时间: 72小时
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Cpu class="mr-2 h-5 w-5 text-blue-600" />
            CPU使用率
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">23%</p>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: 23%"></div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">当前使用率</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <MemoryStick class="mr-2 h-5 w-5 text-purple-600" />
            内存使用
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">4.2GB</p>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              class="bg-purple-600 h-2 rounded-full"
              style="width: 52.5%"
            ></div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">已使用 / 8GB</p>
        </CardContent>
      </Card>
    </div>

    <!-- 详细监控信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Server class="mr-2 h-5 w-5 text-orange-600" />
            服务器信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">操作系统</span>
              <span class="font-medium">Linux Ubuntu 22.04</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Node.js 版本</span>
              <span class="font-medium">v20.10.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">数据库状态</span>
              <Badge class="text-xs" variant="default">
                <CheckCircle class="mr-1 h-3 w-3" />
                正常
              </Badge>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">连接数</span>
              <span class="font-medium">15 / 100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center">
            <Network class="mr-2 h-5 w-5 text-green-600" />
            网络状况
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">网络延迟</span>
              <span class="font-medium text-green-600">12ms</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">下载速度</span>
              <span class="font-medium">25.6 MB/s</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">上传速度</span>
              <span class="font-medium">8.3 MB/s</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">连接状态</span>
              <Badge class="text-xs" variant="default">
                <Wifi class="mr-1 h-3 w-3" />
                稳定
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // 手动导入 Lucide 图标
  import {
    Activity,
    CheckCircle,
    Clock,
    Cpu,
    MemoryStick,
    Monitor,
    Network,
    RefreshCw,
    Server,
    Wifi,
  } from "lucide-vue-next";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "monitoring:view",
  });

  useHead({
    title: "系统监控 - ERP 管理系统",
  });

  const refreshData = () => {
    // 刷新监控数据的逻辑
  };
</script>
