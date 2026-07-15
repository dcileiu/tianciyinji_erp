<script lang="ts" setup>
  import { Plus, RefreshCw } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "warehouse:inventory",
  });

  useHead({ title: "库存管理" });

  type StockRow = {
    id: string;
    warehouse_id: string;
    product_id: string;
    quantity: number;
    products?: { code: string; name: string; unit?: string };
    warehouses?: { code: string; name: string };
  };

  type Option = { id: string; name: string; code?: string };

  const rows = ref<StockRow[]>([]);
  const loading = ref(false);
  const warehouses = ref<Option[]>([]);
  const products = ref<Option[]>([]);
  const dialogOpen = ref(false);
  const saving = ref(false);
  const form = ref({
    warehouse_id: "",
    product_id: "",
    quantity: 0,
  });

  const load = async () => {
    loading.value = true;
    try {
      const [stockRes, wRes, pRes] = await Promise.all([
        $fetch<{ code: number; data: StockRow[]; message: string }>(
          "/api/inventory"
        ),
        $fetch<{ code: number; data: Option[] }>("/api/warehouses"),
        $fetch<{ code: number; data: Option[] }>("/api/products"),
      ]);
      if (stockRes.code !== 0) {
        throw new Error(stockRes.message || "加载库存失败");
      }
      rows.value = stockRes.data || [];
      if (wRes.code === 0) {
        warehouses.value = wRes.data || [];
      }
      if (pRes.code === 0) {
        products.value = pRes.data || [];
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "加载失败");
    } finally {
      loading.value = false;
    }
  };

  const save = async () => {
    if (!(form.value.warehouse_id && form.value.product_id)) {
      toast.error("请选择仓库和产品");
      return;
    }
    saving.value = true;
    try {
      const result = await $fetch<{ code: number; message: string }>(
        "/api/inventory",
        {
          method: "POST",
          body: form.value,
        }
      );
      if (result.code !== 0) {
        throw new Error(result.message || "保存失败");
      }
      toast.success("库存已更新");
      dialogOpen.value = false;
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      saving.value = false;
    }
  };

  onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">库存管理</h1>
        <p class="text-muted-foreground">按仓库维护产品库存数量</p>
      </div>
      <div class="flex gap-2">
        <Button size="sm" type="button" variant="outline" @click="load">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新
        </Button>
        <Button size="sm" type="button" @click="dialogOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          调整库存
        </Button>
      </div>
    </div>

    <Card>
      <CardContent class="p-0">
        <table class="w-full text-sm">
          <thead class="border-b bg-muted/40">
            <tr>
              <th class="px-4 py-3 text-left">仓库</th>
              <th class="px-4 py-3 text-left">产品</th>
              <th class="px-4 py-3 text-left">单位</th>
              <th class="px-4 py-3 text-right">数量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td
                class="px-4 py-8 text-center text-muted-foreground"
                colspan="4"
              >
                加载中...
              </td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td
                class="px-4 py-8 text-center text-muted-foreground"
                colspan="4"
              >
                暂无库存记录
              </td>
            </tr>
            <tr
              class="border-b last:border-0"
              v-for="row in rows"
              :key="row.id"
            >
              <td class="px-4 py-3">
                {{ row.warehouses?.name || row.warehouse_id }}
              </td>
              <td class="px-4 py-3">
                {{ row.products?.name || row.product_id }}
              </td>
              <td class="px-4 py-3">{{ row.products?.unit || '-' }}</td>
              <td class="px-4 py-3 text-right">{{ row.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>

    <Dialog v-model:open="dialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>调整库存</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="space-y-2">
            <Label>仓库</Label>
            <Select v-model="form.warehouse_id">
              <SelectTrigger>
                <SelectValue placeholder="选择仓库" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="w in warehouses" :key="w.id" :value="w.id">
                  {{ w.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>产品</Label>
            <Select v-model="form.product_id">
              <SelectTrigger>
                <SelectValue placeholder="选择产品" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="p in products" :key="p.id" :value="p.id">
                  {{ p.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>数量</Label>
            <Input min="0" type="number" v-model.number="form.quantity" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="dialogOpen = false">
            取消
          </Button>
          <Button type="button" :disabled="saving" @click="save">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
