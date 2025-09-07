<template>
  <div>
    <!-- 页面标题和操作 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">部门管理</h1>
        <p class="text-muted-foreground">
          管理组织架构和部门层级关系
        </p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="refreshData">
          <RefreshCw class="mr-2 h-4 w-4" />
          刷新数据
        </Button>
        <Button size="sm" @click="openDepartmentModal">
          <Building class="mr-2 h-4 w-4" />
          新增部门
        </Button>
      </div>
    </div>

    <!-- 部门表格 -->
    <DepartmentTable
      :departments="departments"
      :loading="loading"
      :can-delete-department="canDeleteDepartment"
      @edit-department="editDepartment"
      @add-sub-department="addSubDepartment"
      @delete-department="confirmDelete"
      @create-department="openDepartmentModal"
    />

    <!-- 部门编辑对话框 -->
    <DepartmentModal
      :open="showDepartmentModal"
      :department="currentDepartment"
      :departments="departments"
      :saving="saving"
      @close="closeDepartmentModal"
      @save="saveDepartment"
    />

    <!-- 删除确认对话框 -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除部门 "{{ deletingDepartment?.name }}" 吗？
            <br />
            <span class="text-red-600 font-medium">此操作不可撤销！</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            :disabled="deleting"
            @click="handleDelete"
            class="bg-red-600 hover:bg-red-700"
          >
            <Loader2 v-if="deleting" class="mr-2 h-4 w-4 animate-spin" />
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { Building, Loader2, RefreshCw } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type {
  DepartmentData,
  DepartmentForm,
} from '~/composables/useDepartments';
import DepartmentModal from './components/DepartmentModal.vue';
import DepartmentTable from './components/DepartmentTable.vue';

// 页面配置
definePageMeta({
  layout: 'default',
});

useHead({
  title: '部门管理 - 智能ERP管理系统',
});

// Composables
const {
  departments,
  loading,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment: deleteDept,
  canDeleteDepartment,
} = useDepartments();

// 状态管理
const saving = ref(false);
const deleting = ref(false);
const showDepartmentModal = ref(false);
const showDeleteDialog = ref(false);
const currentDepartment = ref<DepartmentData | null>(null);
const deletingDepartment = ref<DepartmentData | null>(null);

// 方法
const loadDepartments = async () => {
  try {
    const result = await getDepartments();
    if (result.code !== 0) {
      toast.error('获取部门列表失败', {
        description: result.message,
      });
    }
  } catch (error: any) {
    toast.error('获取部门列表失败', {
      description: error.message || '网络错误',
    });
  }
};

const refreshData = () => {
  loadDepartments();
};

// 部门操作方法
const openDepartmentModal = () => {
  currentDepartment.value = null;
  showDepartmentModal.value = true;
};

const editDepartment = (department: DepartmentData) => {
  currentDepartment.value = department;
  showDepartmentModal.value = true;
};

const addSubDepartment = (parentDepartment: DepartmentData) => {
  // 创建一个临时对象，设置parent_id为上级部门
  currentDepartment.value = {
    ...({} as DepartmentData),
    parent_id: parentDepartment.id,
  };
  showDepartmentModal.value = true;
};

const closeDepartmentModal = () => {
  showDepartmentModal.value = false;
  currentDepartment.value = null;
};

const saveDepartment = async (formData: any) => {
  try {
    saving.value = true;

    const departmentData: DepartmentForm = {
      name: formData.name,
      code: formData.code,
      description: formData.description || '',
      parent_id: formData.parent_id || undefined,
      sort: formData.sort || 1,
      status: formData.status || 'active',
    };

    let result: { code: number; message?: string };
    if (formData.id) {
      result = await updateDepartment(formData.id, departmentData);
    } else {
      result = await createDepartment(departmentData);
    }

    if (result.code === 0) {
      toast.success(formData.id ? '更新部门成功' : '创建部门成功');
      closeDepartmentModal();
      loadDepartments();
    } else {
      toast.error(formData.id ? '更新部门失败' : '创建部门失败', {
        description: (result as any).message || '操作失败',
      });
    }
  } catch (error: any) {
    toast.error('操作失败', {
      description: error.message || '网络错误',
    });
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (department: DepartmentData) => {
  if (!canDeleteDepartment(department.id)) {
    toast.error('无法删除', {
      description: '该部门下还有子部门，请先删除子部门',
    });
    return;
  }

  deletingDepartment.value = department;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  if (!deletingDepartment.value) {
    return;
  }

  try {
    deleting.value = true;

    const result = await deleteDept(deletingDepartment.value.id);

    if (result.code === 0) {
      toast.success('删除部门成功');
      showDeleteDialog.value = false;
      deletingDepartment.value = null;
      loadDepartments();
    } else {
      toast.error('删除部门失败', {
        description: (result as any).message || '删除失败',
      });
    }
  } catch (error: any) {
    toast.error('删除部门失败', {
      description: error.message || '网络错误',
    });
  } finally {
    deleting.value = false;
  }
};

// 初始化
onMounted(() => {
  loadDepartments();
});
</script>
