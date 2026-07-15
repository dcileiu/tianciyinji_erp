<script lang="ts" setup>
  import { Plus, RefreshCw, Trash2 } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "finance:receivables",
  });

  useHead({ title: "应收账款" });

  type Row = {
    id: string;
    doc_no: string;
    customer_id: string;
    amount: number;
    paid_amount: number;
    status: string;
    due_date?: string;
    customers?: { name: string };
  };

  const { items, loading, list, create, remove } = useMasterEntity<Row>(
    "/api/finance/receivables"
  );
  const customers = ref<Array<{ id: string; name: string }>>([]);
  const open = ref(false);
  const form = ref({
    customer_id: "",
    amount: 0,
    due_date: "",
    remark: "",
  });

  onMounted(async () => {
    const c = await $fetch<{
      code: number;
      data: Array<{ id: string; name: string }>;
    }>("/api/customers");
    customers.value = c.data || [];
    await list();
  });

  const save = async () => {
    try {
      await create(form.value);
      toast.success("已创建");
      open.value = false;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "失败");
    }
  };
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between">
      <div>
        <h1 class="text-3xl font-bold">应收账款</h1>
        <p class="text-muted-foreground">
          登记客户应收，收款后自动回写已收金额
        </p>
      </div>
      <div class="flex gap-2">
        <Button size="sm" type="button" variant="outline" @click="list()">
          <RefreshCw class="mr-2 h-4 w-4" />刷新
        </Button>
        <Button size="sm" type="button" @click="open = true">
          <Plus class="mr-2 h-4 w-4" />新建
        </Button>
      </div>
    </div>
    <Card>
      <CardContent class="p-0">
        <table class="w-full text-sm">
          <thead class="border-b bg-muted/40">
            <tr>
              <th class="px-4 py-3 text-left">单号</th>
              <th class="px-4 py-3 text-left">客户</th>
              <th class="px-4 py-3 text-right">应收</th>
              <th class="px-4 py-3 text-right">已收</th>
              <th class="px-4 py-3 text-left">状态</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b" v-for="row in items" :key="row.id">
              <td class="px-4 py-3">{{ row.doc_no }}</td>
              <td class="px-4 py-3">{{ row.customers?.name }}</td>
              <td class="px-4 py-3 text-right">{{ row.amount }}</td>
              <td class="px-4 py-3 text-right">{{ row.paid_amount }}</td>
              <td class="px-4 py-3">{{ row.status }}</td>
              <td class="px-4 py-3 text-right">
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
        <DialogHeader><DialogTitle>新建应收</DialogTitle></DialogHeader>
        <div class="grid gap-3">
          <Select v-model="form.customer_id">
            <SelectTrigger><SelectValue placeholder="客户" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in customers" :key="c.id" :value="c.id"
                >{{ c.name }}</SelectItem
              >
            </SelectContent>
          </Select>
          <Input
            placeholder="金额"
            type="number"
            v-model.number="form.amount"
          />
          <Input type="date" v-model="form.due_date" />
        </div>
        <DialogFooter>
          <Button type="button" @click="save">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
