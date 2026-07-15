<script lang="ts" setup>
  import { Plus, RefreshCw, Trash2 } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "bom:view",
  });

  useHead({ title: "物料清单 BOM" });

  type Bom = {
    id: string;
    product_id: string;
    version: string;
    status: string;
    products?: { name: string };
    items?: Array<{
      component_product_id: string;
      quantity: number;
      unit?: string;
      products?: { name: string };
    }>;
  };

  const rows = ref<Bom[]>([]);
  const products = ref<Array<{ id: string; name: string; unit?: string }>>([]);
  const loading = ref(false);
  const open = ref(false);
  const saving = ref(false);
  const editingId = ref<string | null>(null);
  const form = ref({
    product_id: "",
    version: "1.0",
    status: "active",
    items: [{ component_product_id: "", quantity: 1, unit: "" }],
  });

  const load = async () => {
    loading.value = true;
    try {
      const [b, p] = await Promise.all([
        $fetch<{ code: number; data: Bom[] }>("/api/boms"),
        $fetch<{
          code: number;
          data: Array<{ id: string; name: string; unit?: string }>;
        }>("/api/products"),
      ]);
      rows.value = b.data || [];
      products.value = p.data || [];
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "加载失败");
    } finally {
      loading.value = false;
    }
  };

  const save = async () => {
    if (!form.value.product_id) {
      toast.error("请选择成品");
      return;
    }
    saving.value = true;
    try {
      if (editingId.value) {
        await $fetch("/api/boms", {
          method: "PUT",
          body: { id: editingId.value, ...form.value },
        });
      } else {
        await $fetch("/api/boms", { method: "POST", body: form.value });
      }
      toast.success("保存成功");
      open.value = false;
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      saving.value = false;
    }
  };

  onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between">
      <div>
        <h1 class="text-3xl font-bold">物料清单 BOM</h1>
        <p class="text-muted-foreground">维护成品与组件用量关系</p>
      </div>
      <div class="flex gap-2">
        <Button size="sm" type="button" variant="outline" @click="load">
          <RefreshCw class="mr-2 h-4 w-4" />刷新
        </Button>
        <Button
          size="sm"
          type="button"
          @click="
            editingId = null;
            form = {
              product_id: '',
              version: '1.0',
              status: 'active',
              items: [{ component_product_id: '', quantity: 1, unit: '' }],
            };
            open = true;
          "
        >
          <Plus class="mr-2 h-4 w-4" />新建
        </Button>
      </div>
    </div>
    <Card>
      <CardContent class="p-0">
        <table class="w-full text-sm">
          <thead class="border-b bg-muted/40">
            <tr>
              <th class="px-4 py-3 text-left">成品</th>
              <th class="px-4 py-3 text-left">版本</th>
              <th class="px-4 py-3 text-left">组件数</th>
              <th class="px-4 py-3 text-left">状态</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b" v-for="row in rows" :key="row.id">
              <td class="px-4 py-3">{{ row.products?.name }}</td>
              <td class="px-4 py-3">{{ row.version }}</td>
              <td class="px-4 py-3">{{ row.items?.length || 0 }}</td>
              <td class="px-4 py-3">{{ row.status }}</td>
              <td class="px-4 py-3 text-right">
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  @click="
                    editingId = row.id;
                    form = {
                      product_id: row.product_id,
                      version: row.version,
                      status: row.status,
                      items:
                        row.items?.map((i) => ({
                          component_product_id: i.component_product_id,
                          quantity: Number(i.quantity),
                          unit: i.unit || '',
                        })) || [{ component_product_id: '', quantity: 1, unit: '' }],
                    };
                    open = true;
                  "
                >
                  编辑
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  @click="
                    $fetch('/api/boms', { method: 'DELETE', body: { id: row.id } }).then(load)
                  "
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
    <Dialog v-model:open="open">
      <DialogContent class="max-w-xl">
        <DialogHeader><DialogTitle>BOM</DialogTitle></DialogHeader>
        <div class="grid gap-3">
          <Select v-model="form.product_id">
            <SelectTrigger><SelectValue placeholder="成品" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="p in products" :key="p.id" :value="p.id"
                >{{ p.name }}</SelectItem
              >
            </SelectContent>
          </Select>
          <Input placeholder="版本" v-model="form.version" />
          <div
            class="grid grid-cols-12 gap-2"
            v-for="(item, idx) in form.items"
            :key="idx"
          >
            <div class="col-span-7">
              <Select v-model="item.component_product_id">
                <SelectTrigger
                  ><SelectValue placeholder="组件" /></SelectTrigger
                >
                <SelectContent>
                  <SelectItem v-for="p in products" :key="p.id" :value="p.id"
                    >{{ p.name }}</SelectItem
                  >
                </SelectContent>
              </Select>
            </div>
            <div class="col-span-4">
              <Input type="number" v-model.number="item.quantity" />
            </div>
            <div class="col-span-1">
              <Button
                size="sm"
                type="button"
                variant="ghost"
                @click="form.items.splice(idx, 1)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            type="button"
            variant="outline"
            @click="form.items.push({ component_product_id: '', quantity: 1, unit: '' })"
          >
            加组件
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" :disabled="saving" @click="save">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
