<script lang="ts" setup>
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "reports:view",
  });

  useHead({ title: "报表总览" });

  const data = ref<Record<string, number> | null>(null);

  onMounted(async () => {
    try {
      const res = await $fetch<{ code: number; data: Record<string, number> }>(
        "/api/reports/overview"
      );
      if (res.code === 0) {
        data.value = res.data;
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载失败");
    }
  });
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">报表总览</h1>
      <p class="text-muted-foreground">基于真实业务数据的经营概览</p>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="(val, key) in data || {}" :key="key">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm text-muted-foreground">{{ key }}</CardTitle>
        </CardHeader>
        <CardContent class="text-2xl font-bold">{{ val }}</CardContent>
      </Card>
    </div>
    <p class="text-muted-foreground" v-if="!data">加载中或暂无权限/数据...</p>
  </div>
</template>
