<script lang="ts" setup>
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "reports:purchase",
  });

  useHead({ title: "采购报表" });

  const report = ref<{
    byStatus: Record<string, { count: number; amount: number }>;
    recent: Array<Record<string, unknown>>;
    totalAmount: number;
  } | null>(null);

  onMounted(async () => {
    try {
      const res = await $fetch<{ code: number; data: typeof report.value }>(
        "/api/reports/purchase"
      );
      if (res.code === 0) {
        report.value = res.data;
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载失败");
    }
  });
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">采购报表</h1>
      <p class="text-muted-foreground">
        合计金额：{{ report?.totalAmount?.toFixed?.(2) ?? '-' }}
      </p>
    </div>
    <div class="grid gap-4 md:grid-cols-3">
      <Card v-for="(stat, status) in report?.byStatus || {}" :key="status">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm">{{ status }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{{ stat.count }} 单</div>
          <div class="font-bold">{{ stat.amount.toFixed(2) }}</div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
