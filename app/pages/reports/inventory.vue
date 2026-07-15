<script lang="ts" setup>
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "reports:inventory",
  });

  useHead({ title: "库存报表" });

  const report = ref<{
    totalSku: number;
    lowStockCount: number;
    lowStock: Array<Record<string, unknown>>;
    stocks: Array<Record<string, unknown>>;
  } | null>(null);

  onMounted(async () => {
    try {
      const res = await $fetch<{ code: number; data: typeof report.value }>(
        "/api/reports/inventory"
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
      <h1 class="text-3xl font-bold">库存报表</h1>
      <p class="text-muted-foreground">
        SKU {{ report?.totalSku ?? '-' }} · 低库存
        {{ report?.lowStockCount ?? '-' }}
      </p>
    </div>
    <Card>
      <CardHeader><CardTitle>低库存（数量 &lt; 10）</CardTitle></CardHeader>
      <CardContent class="p-0">
        <table class="w-full text-sm">
          <thead class="border-b bg-muted/40">
            <tr>
              <th class="px-4 py-2 text-left">仓库</th>
              <th class="px-4 py-2 text-left">产品</th>
              <th class="px-4 py-2 text-right">数量</th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="border-b"
              v-for="row in report?.lowStock || []"
              :key="String(row.id)"
            >
              <td class="px-4 py-2">
                {{ (row.warehouses as { name?: string } | undefined)?.name }}
              </td>
              <td class="px-4 py-2">
                {{ (row.products as { name?: string } | undefined)?.name }}
              </td>
              <td class="px-4 py-2 text-right">{{ row.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
</template>
