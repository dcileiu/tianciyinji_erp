<script lang="ts" setup>
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "reports:production",
  });

  useHead({ title: "生产报表" });

  const report = ref<{
    workshopCount: number;
    planCount: number;
    orderCount: number;
    plansByStatus: Record<string, number>;
    ordersByStatus: Record<string, number>;
  } | null>(null);

  onMounted(async () => {
    try {
      const res = await $fetch<{ code: number; data: typeof report.value }>(
        "/api/reports/production"
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
      <h1 class="text-3xl font-bold">生产报表</h1>
      <p class="text-muted-foreground">
        车间 {{ report?.workshopCount ?? '-' }} · 计划
        {{ report?.planCount ?? '-' }}
        · 工单
        {{ report?.orderCount ?? '-' }}
      </p>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>计划状态分布</CardTitle></CardHeader>
        <CardContent>
          <div
            class="flex justify-between border-b py-2"
            v-for="(count, status) in report?.plansByStatus || {}"
            :key="status"
          >
            <span>{{ status }}</span>
            <span class="font-bold">{{ count }}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>工单状态分布</CardTitle></CardHeader>
        <CardContent>
          <div
            class="flex justify-between border-b py-2"
            v-for="(count, status) in report?.ordersByStatus || {}"
            :key="status"
          >
            <span>{{ status }}</span>
            <span class="font-bold">{{ count }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
