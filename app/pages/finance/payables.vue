<script lang="ts" setup>
  import { Plus, RefreshCw, Trash2 } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  definePageMeta({
    layout: "default",
    requiresAuth: true,
    permission: "finance:payables",
  });

  useHead({ title: "应付账款" });

  type Row = {
    id: string;
    doc_no: string;
    supplier_id: string;
    amount: number;
    paid_amount: number;
    status: string;
    suppliers?: { name: string };
  };

  const { items, loading, list, create, remove } = useMasterEntity<Row>(
    "/api/finance/payables"
  );
  const suppliers = ref<Array<{ id: string; name: string }>>([]);
  const open = ref(false);
  const form = ref({ supplier_id: "", amount: 0, due_date: "", remark: "" });

  onMounted(async () => {
    const s = await $fetch<{
      code: number;
      data: Array<{ id: string; name: string }>;
    }>("/api/suppliers");
    suppliers.value = s.data || [];
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
        <h1 class="text-3xl font-bold">应付账款</h1>
        <p class="text-muted-foreground">登记供应商应付，付款后自动回写</p>
      </div>
      <div class="flex gap-2">
        <Button size="sm" type="button" variant="outline" @click="list()"
          >刷新</Button
        >
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
              <th class="px-4 py-3 text-left">供应商</th>
              <th class="px-4 py-3 text-right">应付</th>
              <th class="px-4 py-3 text-right">已付</th>
              <th class="px-4 py-3 text-left">状态</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b" v-for="row in items" :key="row.id">
              <td class="px-4 py-3">{{ row.doc_no }}</td>
              <td class="px-4 py-3">{{ row.suppliers?.name }}</td>
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
          </tbody>
        </table>
      </CardContent>
    </Card>
    <Dialog v-model:open="open">
      <DialogContent>
        <DialogHeader><DialogTitle>新建应付</DialogTitle></DialogHeader>
        <div class="grid gap-3">
          <Select v-model="form.supplier_id">
            <SelectTrigger><SelectValue placeholder="供应商" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="s in suppliers" :key="s.id" :value="s.id"
                >{{ s.name }}</SelectItem
              >
            </SelectContent>
          </Select>
          <Input type="number" v-model.number="form.amount" />
          <Input type="date" v-model="form.due_date" />
        </div>
        <DialogFooter>
          <Button type="button" @click="save">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
