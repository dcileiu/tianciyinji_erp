<script lang="ts" setup>
  import { Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-vue-next";
  import { toast } from "vue-sonner";

  import type { MasterField } from "~/types/master-data";

  const props = defineProps<{
    title: string;
    description: string;
    endpoint: string;
    fields: MasterField[];
    codePrefix?: string;
  }>();

  const { items, loading, list, create, update, remove } = useMasterEntity<
    Record<string, unknown> & { id: string }
  >(props.endpoint);

  const search = ref("");
  const statusFilter = ref("all");
  const dialogOpen = ref(false);
  const saving = ref(false);
  const editingId = ref<string | null>(null);

  const emptyForm = () => {
    const next: Record<string, unknown> = { status: "active" };
    for (const field of props.fields) {
      if (field.key === "status") {
        next.status = "active";
      } else if (field.type === "number") {
        next[field.key] = 0;
      } else {
        next[field.key] = "";
      }
    }
    return next;
  };

  const form = ref(emptyForm());

  const filtered = computed(() => {
    let rows = items.value;
    if (search.value.trim()) {
      const q = search.value.trim().toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }
    if (statusFilter.value !== "all") {
      rows = rows.filter((row) => row.status === statusFilter.value);
    }
    return rows;
  });

  const displayFields = computed(() => props.fields.slice(0, 6));

  const openCreate = () => {
    editingId.value = null;
    form.value = emptyForm();
    if (props.codePrefix) {
      form.value.code = `${props.codePrefix}${Date.now().toString().slice(-6)}`;
    }
    dialogOpen.value = true;
  };

  const openEdit = (row: Record<string, unknown> & { id: string }) => {
    editingId.value = row.id;
    form.value = { ...emptyForm(), ...row };
    dialogOpen.value = true;
  };

  const save = async () => {
    for (const field of props.fields) {
      if (
        field.required &&
        !form.value[field.key] &&
        form.value[field.key] !== 0
      ) {
        toast.error(`请填写${field.label}`);
        return;
      }
    }
    saving.value = true;
    try {
      if (editingId.value) {
        await update({ ...form.value, id: editingId.value });
        toast.success("更新成功");
      } else {
        await create(form.value);
        toast.success("创建成功");
      }
      dialogOpen.value = false;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      saving.value = false;
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("确认删除该记录？")) {
      return;
    }
    try {
      await remove(id);
      toast.success("已删除");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const setField = (key: string, value: string | number) => {
    form.value[key] = value;
  };

  onMounted(() => {
    list().catch((err: unknown) => {
      toast.error(err instanceof Error ? err.message : "加载失败");
    });
  });
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ title }}</h1>
        <p class="text-muted-foreground">{{ description }}</p>
      </div>
      <div class="flex gap-2">
        <Button
          size="sm"
          type="button"
          variant="outline"
          :disabled="loading"
          @click="list()"
        >
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新
        </Button>
        <Button size="sm" type="button" @click="openCreate">
          <Plus class="mr-2 h-4 w-4" />
          新增
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <Search class="h-4 w-4" />
          筛选
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-4 md:grid-cols-3">
        <Input placeholder="搜索编码 / 名称..." v-model="search" />
        <Select v-model="statusFilter">
          <SelectTrigger>
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">启用</SelectItem>
            <SelectItem value="inactive">停用</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>

    <Card>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b bg-muted/40">
              <tr>
                <th
                  class="px-4 py-3 text-left font-medium"
                  v-for="field in displayFields"
                  :key="field.key"
                >
                  {{ field.label }}
                </th>
                <th class="px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td
                  class="px-4 py-8 text-center text-muted-foreground"
                  :colspan="displayFields.length + 1"
                >
                  加载中...
                </td>
              </tr>
              <tr v-else-if="filtered.length === 0">
                <td
                  class="px-4 py-8 text-center text-muted-foreground"
                  :colspan="displayFields.length + 1"
                >
                  暂无数据，请确认已执行
                  <code class="mx-1">pnpm db:push && pnpm db:seed</code>
                  后再新增
                </td>
              </tr>
              <tr
                class="border-b last:border-0"
                v-for="row in filtered"
                :key="String(row.id)"
              >
                <td
                  class="px-4 py-3"
                  v-for="field in displayFields"
                  :key="field.key"
                >
                  {{ row[field.key] ?? '-' }}
                </td>
                <td class="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    @click="openEdit(row)"
                  >
                    <Pencil class="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    @click="onDelete(String(row.id))"
                  >
                    <Trash2 class="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{ editingId ? '编辑' : '新增' }}{{ title }}
          </DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-2">
          <div class="space-y-2" v-for="field in fields" :key="field.key">
            <Label>
              {{ field.label }}
              <span class="text-destructive" v-if="field.required">*</span>
            </Label>
            <Select
              v-if="field.type === 'select'"
              :model-value="String(form[field.key] ?? '')"
              @update:model-value="(v) => setField(field.key, String(v))"
            >
              <SelectTrigger>
                <SelectValue :placeholder="field.placeholder || '请选择'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="opt in field.options || []"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              rows="3"
              v-else-if="field.type === 'textarea'"
              :model-value="String(form[field.key] ?? '')"
              :placeholder="field.placeholder"
              @update:model-value="(v) => setField(field.key, v)"
            />
            <Input
              v-else
              :model-value="
                form[field.key] === undefined || form[field.key] === null
                  ? ''
                  : String(form[field.key])
              "
              :placeholder="field.placeholder"
              :type="field.type === 'number' ? 'number' : 'text'"
              @update:model-value="
                (v) =>
                  setField(
                    field.key,
                    field.type === 'number' ? Number(v) : String(v)
                  )
              "
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="dialogOpen = false">
            取消
          </Button>
          <Button type="button" :disabled="saving" @click="save">
            {{ saving ? '保存中...' : '保存' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
