<template>
  <Dialog :open="open" @update:open="$emit('close')">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Building class="h-5 w-5" />
          {{ modalTitle }}
        </DialogTitle>
        <DialogDescription>
          {{ isEditing ? "编辑部门信息和层级关系" : "创建新的部门" }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>部门名称 *</Label>
            <Input
              :model-value="formData.name"
              @update:model-value="formData.name = $event as string"
              placeholder="请输入部门名称"
            />
          </div>
          <div class="space-y-2">
            <Label>部门编码 *</Label>
            <Input
              :model-value="formData.code"
              @update:model-value="formData.code = $event as string"
              placeholder="请输入部门编码"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label>部门描述</Label>
          <Textarea
            :model-value="formData.description"
            @update:model-value="formData.description = $event as string"
            placeholder="请输入部门描述..."
            :rows="3"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>上级部门</Label>
            <Select
              :model-value="formData.parent_id"
              @update:model-value="formData.parent_id = $event as string"
            >
              <SelectTrigger>
                <SelectValue placeholder="选择上级部门" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">无上级部门</SelectItem>
                <SelectItem
                  v-for="dept in availableParentDepartments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>排序</Label>
            <Input
              :model-value="formData.sort"
              @update:model-value="formData.sort = parseInt($event as string) || 1"
              type="number"
              placeholder="排序数字"
              min="1"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label>状态</Label>
                      <Select
              :model-value="formData.status"
              @update:model-value="formData.status = $event as 'active' | 'inactive'"
            >
            <SelectTrigger>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">启用</SelectItem>
              <SelectItem value="inactive">停用</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('close')">取消</Button>
        <Button :disabled="saving" @click="handleSave">
          <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
          {{ isEditing ? "更新部门" : "创建部门" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Building, Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { DepartmentData } from '~/composables/useDepartments';

interface Props {
  open: boolean;
  department?: DepartmentData | null;
  departments: DepartmentData[];
  saving: boolean;
}

interface FormData {
  id?: string;
  name: string;
  code: string;
  description: string;
  parent_id: string;
  sort: number;
  status: 'active' | 'inactive';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  save: [data: FormData];
}>();

const isEditing = computed(() => !!props.department);
const modalTitle = computed(() => (isEditing.value ? '编辑部门' : '新增部门'));

const formData = reactive<FormData>({
  name: '',
  code: '',
  description: '',
  parent_id: '',
  sort: 1,
  status: 'active',
});

// 可选的上级部门（排除自己和自己的子部门）
const availableParentDepartments = computed(() => {
  return props.departments.filter((dept) => {
    if (isEditing.value && props.department) {
      return (
        dept.id !== props.department.id &&
        dept.parent_id !== props.department.id
      );
    }
    return true;
  });
});

// 监听部门变化，初始化表单数据
watch(
  () => props.department,
  (department) => {
    if (department) {
      Object.assign(formData, {
        id: department.id,
        name: department.name,
        code: department.code,
        description: department.description || '',
        parent_id: department.parent_id || '',
        sort: department.sort || 1,
        status: department.status,
      });
    } else {
      // 重置表单
      Object.assign(formData, {
        id: undefined,
        name: '',
        code: '',
        description: '',
        parent_id: '',
        sort: 1,
        status: 'active',
      });
    }
  },
  { immediate: true }
);

const handleSave = () => {
  // 验证必填字段
  if (!(formData.name && formData.code)) {
    toast.error('请填写必填字段');
    return;
  }

  emit('save', { ...formData });
};
</script>
