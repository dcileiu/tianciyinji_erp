<script lang="ts" setup>
  import { Plus, RefreshCw, Trash2 } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "production-order:view",
  });

  useHead({ title: "生产工单" });

  type Row = {
    id: string;
    order_no: string;
    product_id: string;
    workshop_id?: string;
    quantity: number;
    status: string;
    products?: { name: string };
    workshops?: { name: string };
  };

  const { items, loading, list, create, update, remove } = useMasterEntity<Row>(
    "/api/production/orders"
  );
  const products = ref<Array<{ id: string; name: string }>>([]);
  const workshops = ref<Array<{ id: string; name: string }>>([]);
  const open = ref(false);
  const saving = ref(false);
  const editingId = ref<string | null>(null);
  const form = ref({
    product_id: "",
    workshop_id: "",
    quantity: 1,
    status: "pending",
    remark: "",
  });

  onMounted(async () => {
    const [p, w] = await Promise.all([
      $fetch<{ code: number; data: Array<{ id: string; name: string }> }>(
        "/api/products"
      ),
      $fetch<{ code: number; data: Array<{ id: string; name: string }> }>(
        "/api/workshops"
      ),
      list(),
    ]);
    products.value = p.data || [];
    workshops.value = w.data || [];
  });

  const save = async () => {
    if (!form.value.product_id) {
      toast.error("请选择产品");
      return;
    }
    saving.value = true;
    try {
      if (editingId.value) {
        await update({ id: editingId.value, ...form.value });
      } else {
        await create(form.value);
      }
      toast.success("保存成功");
      open.value = false;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      saving.value = false;
    }
  };
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between">
      <div>
        <h1 class="text-3xl font-bold">生产工单</h1>
        <p class="text-muted-foreground">下达与跟踪生产工单</p>
      </div>
      <div class="flex gap-2">
        <Button size="sm" type="button" variant="outline" @click="list()">
          <RefreshCw class="mr-2 h-4 w-4" />刷新
        </Button>
        <Button
          size="sm"
          type="button"
          @click="
            editingId = null;
            form = { product_id: '', workshop_id: '', quantity: 1, status: 'pending', remark: '' };
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
              <th class="px-4 py-3 text-left">工单号</th>
              <th class="px-4 py-3 text-left">产品</th>
              <th class="px-4 py-3 text-left">车间</th>
              <th class="px-4 py-3 text-right">数量</th>
              <th class="px-4 py-3 text-left">状态</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b" v-for="row in items" :key="row.id">
              <td class="px-4 py-3">{{ row.order_no }}</td>
              <td class="px-4 py-3">{{ row.products?.name }}</td>
              <td class="px-4 py-3">{{ row.workshops?.name || '-' }}</td>
              <td class="px-4 py-3 text-right">{{ row.quantity }}</td>
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
                      workshop_id: row.workshop_id || '',
                      quantity: Number(row.quantity),
                      status: row.status,
                      remark: '',
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
                  @click="remove(row.id)"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </td>
            </tr>
            <tr v-if="!loading && items.length === 0">
              <td
                class="px-4 py-8 text-center text-muted-foreground"
                colspan="6"
              >
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
    <Dialog v-model:open="open">
      <DialogContent>
        <DialogHeader><DialogTitle>工单</DialogTitle></DialogHeader>
        <div class="grid gap-3">
          <Select v-model="form.product_id">
            <SelectTrigger><SelectValue placeholder="产品" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="p in products" :key="p.id" :value="p.id"
                >{{ p.name }}</SelectItem
              >
            </SelectContent>
          </Select>
          <Select v-model="form.workshop_id">
            <SelectTrigger><SelectValue placeholder="车间" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="w in workshops" :key="w.id" :value="w.id"
                >{{ w.name }}</SelectItem
              >
            </SelectContent>
          </Select>
          <Input type="number" v-model.number="form.quantity" />
          <Select v-model="form.status">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">pending</SelectItem>
              <SelectItem value="in_progress">in_progress</SelectItem>
              <SelectItem value="completed">completed</SelectItem>
              <SelectItem value="cancelled">cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" :disabled="saving" @click="save">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
