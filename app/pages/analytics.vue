<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-foreground">数据分析</h1>
        <p class="text-muted-foreground mt-1">深度分析业务数据趋势</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>销售趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-64 flex items-center justify-center bg-muted/50 rounded">
            <p class="text-muted-foreground">销售趋势图表</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>产品分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-64 flex items-center justify-center bg-muted/50 rounded">
            <p class="text-muted-foreground">产品分析图表</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});
</script>
