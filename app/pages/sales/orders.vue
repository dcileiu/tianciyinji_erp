<script lang="ts" setup>
  import { Plus, RefreshCw, Trash2 } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "sales-order:view",
  });

  useHead({ title: "销售订单" });

  type OrderRow = {
    id: string;
    order_no: string;
    customer_id: string;
    warehouse_id?: string;
    status: string;
    order_date: string;
    total_amount: number;
    remark?: string;
    inventory_applied?: boolean;
    items?: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
  };

  type Option = { id: string; name: string; code?: string; price?: number };

  const { items, loading, list, create, update, remove } =
    useMasterEntity<OrderRow>("/api/sales/orders");

  const customers = ref<Option[]>([]);
  const products = ref<Option[]>([]);
  const warehouses = ref<Option[]>([]);
  const dialogOpen = ref(false);
  const saving = ref(false);
  const editingId = ref<string | null>(null);

  const form = ref({
    customer_id: "",
    warehouse_id: "",
    status: "draft",
    order_date: new Date().toISOString().slice(0, 10),
    remark: "",
    items: [{ product_id: "", quantity: 1, unit_price: 0 }],
  });

  const loadOptions = async () => {
    const [cRes, pRes, wRes] = await Promise.all([
      $fetch<{ code: number; data: Option[] }>("/api/customers"),
      $fetch<{ code: number; data: Option[] }>("/api/products"),
      $fetch<{ code: number; data: Option[] }>("/api/warehouses"),
    ]);
    if (cRes.code === 0) {
      customers.value = cRes.data || [];
    }
    if (pRes.code === 0) {
      products.value = pRes.data || [];
    }
    if (wRes.code === 0) {
      warehouses.value = wRes.data || [];
    }
  };

  const openCreate = () => {
    editingId.value = null;
    form.value = {
      customer_id: "",
      warehouse_id: "",
      status: "draft",
      order_date: new Date().toISOString().slice(0, 10),
      remark: "",
      items: [{ product_id: "", quantity: 1, unit_price: 0 }],
    };
    dialogOpen.value = true;
  };

  const openEdit = async (row: OrderRow) => {
    try {
      const detail = await $fetch<{
        code: number;
        data: OrderRow;
        message: string;
      }>("/api/sales/orders", { query: { id: row.id } });
      if (detail.code !== 0 || !detail.data) {
        throw new Error(detail.message || "加载订单失败");
      }
      const order = detail.data;
      editingId.value = order.id;
      form.value = {
        customer_id: order.customer_id,
        warehouse_id: order.warehouse_id || "",
        status: order.status,
        order_date: order.order_date,
        remark: order.remark || "",
        items:
          order.items && order.items.length > 0
            ? order.items.map((i) => ({
                product_id: i.product_id,
                quantity: Number(i.quantity),
                unit_price: Number(i.unit_price),
              }))
            : [{ product_id: "", quantity: 1, unit_price: 0 }],
      };
      dialogOpen.value = true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "加载订单失败");
    }
  };

  const addItem = () => {
    form.value.items.push({ product_id: "", quantity: 1, unit_price: 0 });
  };

  const removeItem = (index: number) => {
    form.value.items.splice(index, 1);
  };

  const onProductChange = (index: number, productId: string) => {
    form.value.items[index].product_id = productId;
    const product = products.value.find((p) => p.id === productId);
    if (product?.price != null) {
      form.value.items[index].unit_price = Number(product.price);
    }
  };

  const customerName = (id: string) =>
    customers.value.find((c) => c.id === id)?.name || id;

  const save = async () => {
    if (!form.value.customer_id) {
      toast.error("请选择客户");
      return;
    }
    if (form.value.items.some((i) => !i.product_id)) {
      toast.error("请完善订单明细");
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
      dialogOpen.value = false;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      saving.value = false;
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("确认删除该订单？")) {
      return;
    }
    try {
      await remove(id);
      toast.success("已删除");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  onMounted(async () => {
    try {
      await Promise.all([list(), loadOptions()]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "加载失败");
    }
  });
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">销售订单</h1>
        <p class="text-muted-foreground">创建、确认与跟踪销售订单</p>
      </div>
      <div class="flex gap-2">
        <Button size="sm" type="button" variant="outline" @click="list()">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新
        </Button>
        <Button size="sm" type="button" @click="openCreate">
          <Plus class="mr-2 h-4 w-4" />
          新建订单
        </Button>
      </div>
    </div>

    <Card>
      <CardContent class="p-0">
        <table class="w-full text-sm">
          <thead class="border-b bg-muted/40">
            <tr>
              <th class="px-4 py-3 text-left">订单号</th>
              <th class="px-4 py-3 text-left">客户</th>
              <th class="px-4 py-3 text-left">日期</th>
              <th class="px-4 py-3 text-left">状态</th>
              <th class="px-4 py-3 text-right">金额</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td
                class="px-4 py-8 text-center text-muted-foreground"
                colspan="6"
              >
                加载中...
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td
                class="px-4 py-8 text-center text-muted-foreground"
                colspan="6"
              >
                暂无订单
              </td>
            </tr>
            <tr
              class="border-b last:border-0"
              v-for="row in items"
              :key="row.id"
            >
              <td class="px-4 py-3">{{ row.order_no }}</td>
              <td class="px-4 py-3">{{ customerName(row.customer_id) }}</td>
              <td class="px-4 py-3">{{ row.order_date }}</td>
              <td class="px-4 py-3">{{ row.status }}</td>
              <td class="px-4 py-3 text-right">{{ row.total_amount }}</td>
              <td class="px-4 py-3 text-right">
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  @click="openEdit(row)"
                >
                  编辑
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  @click="onDelete(row.id)"
                >
                  <Trash2 class="h-4 w-4 text-destructive" />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingId ? '编辑订单' : '新建订单' }}</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label>客户 *</Label>
              <Select v-model="form.customer_id">
                <SelectTrigger>
                  <SelectValue placeholder="选择客户" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="c in customers" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>出库仓库（确认时必填）</Label>
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
              <Label>状态</Label>
              <Select v-model="form.status">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">draft</SelectItem>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="confirmed">confirmed</SelectItem>
                  <SelectItem value="completed">completed</SelectItem>
                  <SelectItem value="cancelled">cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>订单日期</Label>
              <Input type="date" v-model="form.order_date" />
            </div>
            <div class="space-y-2">
              <Label>备注</Label>
              <Input v-model="form.remark" />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label>明细</Label>
              <Button
                size="sm"
                type="button"
                variant="outline"
                @click="addItem"
              >
                加行
              </Button>
            </div>
            <div
              class="grid grid-cols-12 gap-2"
              v-for="(item, index) in form.items"
              :key="index"
            >
              <div class="col-span-5">
                <Select
                  :model-value="item.product_id"
                  @update:model-value="(v) => onProductChange(index, String(v))"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="产品" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="p in products" :key="p.id" :value="p.id">
                      {{ p.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="col-span-3">
                <Input min="0" type="number" v-model.number="item.quantity" />
              </div>
              <div class="col-span-3">
                <Input min="0" type="number" v-model.number="item.unit_price" />
              </div>
              <div class="col-span-1">
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  @click="removeItem(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
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
