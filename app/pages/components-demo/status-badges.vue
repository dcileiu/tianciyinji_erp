<template>
  <div class="container mx-auto p-6 space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold">状态徽章组件演示</h1>
      <p class="text-muted-foreground">
        通用的状态徽章组件，支持多种状态类型、尺寸和自定义标签
      </p>
    </div>

    <!-- 基本状态 -->
    <Card>
      <CardHeader>
        <CardTitle>基本状态</CardTitle>
        <CardDescription>
          所有可用的状态类型，每种都有对应的颜色和图标
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-3">
          <StatusBadge status="in-process" />
          <StatusBadge status="done" />
          <StatusBadge status="failed" />
          <StatusBadge status="pending" />
          <StatusBadge status="paused" />
          <StatusBadge status="running" />
          <StatusBadge status="warning" />
          <StatusBadge status="loading" />
        </div>
      </CardContent>
    </Card>

    <!-- 不同尺寸 -->
    <Card>
      <CardHeader>
        <CardTitle>不同尺寸</CardTitle>
        <CardDescription>
          支持小、中、大三种尺寸
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="space-y-2">
            <h4 class="text-sm font-medium">小尺寸 (sm)</h4>
            <div class="flex flex-wrap gap-2">
              <StatusBadge status="in-process" size="sm" />
              <StatusBadge status="done" size="sm" />
              <StatusBadge status="failed" size="sm" />
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="text-sm font-medium">中等尺寸 (md) - 默认</h4>
            <div class="flex flex-wrap gap-2">
              <StatusBadge status="in-process" />
              <StatusBadge status="done" />
              <StatusBadge status="failed" />
            </div>
          </div>
          
          <div class="space-y-2">
            <h4 class="text-sm font-medium">大尺寸 (lg)</h4>
            <div class="flex flex-wrap gap-2">
              <StatusBadge status="in-process" size="lg" />
              <StatusBadge status="done" size="lg" />
              <StatusBadge status="failed" size="lg" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 自定义标签 -->
    <Card>
      <CardHeader>
        <CardTitle>自定义标签</CardTitle>
        <CardDescription>
          使用 customLabel 属性自定义显示文本
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-3">
          <StatusBadge status="in-process" customLabel="进行中" />
          <StatusBadge status="done" customLabel="已完成" />
          <StatusBadge status="failed" customLabel="失败" />
          <StatusBadge status="pending" customLabel="等待中" />
          <StatusBadge status="running" customLabel="运行中" />
        </div>
      </CardContent>
    </Card>

    <!-- 只显示图标 -->
    <Card>
      <CardHeader>
        <CardTitle>仅图标模式</CardTitle>
        <CardDescription>
          设置 showLabel 为 false，只显示图标
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-3">
          <StatusBadge status="in-process" :showLabel="false" />
          <StatusBadge status="done" :showLabel="false" />
          <StatusBadge status="failed" :showLabel="false" />
          <StatusBadge status="pending" :showLabel="false" />
          <StatusBadge status="running" :showLabel="false" />
          <StatusBadge status="warning" :showLabel="false" />
          <StatusBadge status="loading" :showLabel="false" />
        </div>
      </CardContent>
    </Card>

    <!-- 实际使用示例 -->
    <Card>
      <CardHeader>
        <CardTitle>实际应用示例</CardTitle>
        <CardDescription>
          在表格或列表中的典型使用场景
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <!-- 任务列表示例 -->
          <div>
            <h4 class="text-sm font-medium mb-3">任务列表</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <span class="font-medium">数据库迁移</span>
                <StatusBadge status="done" customLabel="已完成" size="sm" />
              </div>
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <span class="font-medium">API接口开发</span>
                <StatusBadge status="in-process" customLabel="开发中" size="sm" />
              </div>
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <span class="font-medium">前端页面制作</span>
                <StatusBadge status="pending" customLabel="待开始" size="sm" />
              </div>
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <span class="font-medium">单元测试</span>
                <StatusBadge status="failed" customLabel="测试失败" size="sm" />
              </div>
            </div>
          </div>

          <!-- 订单状态示例 -->
          <div>
            <h4 class="text-sm font-medium mb-3">订单状态</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p class="font-medium">#12345</p>
                  <p class="text-sm text-muted-foreground">用户订单</p>
                </div>
                <StatusBadge status="running" customLabel="处理中" />
              </div>
              <div class="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p class="font-medium">#12346</p>
                  <p class="text-sm text-muted-foreground">批量订单</p>
                </div>
                <StatusBadge status="done" customLabel="已发货" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 使用方法 -->
    <Card>
      <CardHeader>
        <CardTitle>使用方法</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-medium mb-2">基本用法</h4>
            <div class="bg-muted p-3 rounded-md font-mono text-sm">
              &lt;StatusBadge status="done" /&gt;
            </div>
          </div>
          
          <div>
            <h4 class="text-sm font-medium mb-2">自定义标签和尺寸</h4>
            <div class="bg-muted p-3 rounded-md font-mono text-sm">
              &lt;StatusBadge status="in-process" customLabel="处理中" size="lg" /&gt;
            </div>
          </div>
          
          <div>
            <h4 class="text-sm font-medium mb-2">仅图标</h4>
            <div class="bg-muted p-3 rounded-md font-mono text-sm">
              &lt;StatusBadge status="loading" :showLabel="false" /&gt;
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

useHead({
  title: '状态徽章组件演示',
});
</script> 