<script lang="ts" setup>
  import { Plus, RefreshCw, Trash2 } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "receipt:view",
  });

  useHead({ title: "收款单" });

  type Row = {
    id: string;
    receipt_no: string;
    customer_id: string;
    amount: number;
    receipt_date: string;
    customers?: { name: string };
  };

  const rows = ref<Row[]>([]);
  const customers = ref<Array<{ id: string; name: string }>>([]);
  const receivables = ref<Array<{ id: string; doc_no: string }>>([]);
  const open = ref(false);
  const form = ref({
    customer_id: "",
    receivable_id: "",
    amount: 0,
    receipt_date: new Date().toISOString().slice(0, 10),
    method: "transfer",
  });

  const load = async () => {
    const [r, c, ar] = await Promise.all([
      $fetch<{ code: number; data: Row[] }>("/api/finance/receipts"),
      $fetch<{ code: number; data: Array<{ id: string; name: string }> }>(
        "/api/customers"
      ),
      $fetch<{ code: number; data: Array<{ id: string; doc_no: string }> }>(
        "/api/finance/receivables"
      ),
    ]);
    rows.value = r.data || [];
    customers.value = c.data || [];
    receivables.value = ar.data || [];
  };

  const save = async () => {
    try {
      const res = await $fetch<{ code: number; message: string }>(
        "/api/finance/receipts",
        { method: "POST", body: form.value }
      );
      if (res.code !== 0) {
        throw new Error(res.message);
      }
      toast.success("收款成功");
      open.value = false;
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "失败");
    }
  };

  onMounted(load);
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between">
      <div>
        <h1 class="text-3xl font-bold">收款单</h1>
        <p class="text-muted-foreground">登记收款并可关联应收单据</p>
      </div>
      <div class="flex gap-2">
        <Button size="sm" type="button" variant="outline" @click="load">
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
              <th class="px-4 py-3 text-left">日期</th>
              <th class="px-4 py-3 text-right">金额</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b" v-for="row in rows" :key="row.id">
              <td class="px-4 py-3">{{ row.receipt_no }}</td>
              <td class="px-4 py-3">{{ row.customers?.name }}</td>
              <td class="px-4 py-3">{{ row.receipt_date }}</td>
              <td class="px-4 py-3 text-right">{{ row.amount }}</td>
              <td class="px-4 py-3 text-right">
                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  @click="
                    $fetch('/api/finance/receipts', {
                      method: 'DELETE',
                      body: { id: row.id },
                    }).then(load)
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
      <DialogContent>
        <DialogHeader><DialogTitle>新建收款</DialogTitle></DialogHeader>
        <div class="grid gap-3">
          <Select v-model="form.customer_id">
            <SelectTrigger><SelectValue placeholder="客户" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in customers" :key="c.id" :value="c.id"
                >{{ c.name }}</SelectItem
              >
            </SelectContent>
          </Select>
          <Select v-model="form.receivable_id">
            <SelectTrigger
              ><SelectValue placeholder="关联应收（可选）" /></SelectTrigger
            >
            <SelectContent>
              <SelectItem v-for="a in receivables" :key="a.id" :value="a.id">
                {{ a.doc_no }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" v-model.number="form.amount" />
          <Input type="date" v-model="form.receipt_date" />
        </div>
        <DialogFooter>
          <Button type="button" @click="save">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
