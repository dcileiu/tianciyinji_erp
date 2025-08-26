<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">系统监控</h1>
        <p class="text-muted-foreground mt-1">实时监控系统运行状态</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>系统状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="text-sm">正常运行</span>
          </div>
          <p class="text-xs text-muted-foreground mt-2">运行时间: 72小时</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CPU使用率</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">23%</p>
          <p class="text-xs text-muted-foreground">当前使用率</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>内存使用</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">4.2GB</p>
          <p class="text-xs text-muted-foreground">已使用 / 8GB</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
</script>
