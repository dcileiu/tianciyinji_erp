<template>
  <div>
    <!-- 页面标题和操作 -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">用户管理</h1>
        <p class="text-muted-foreground">
          管理系统用户账户，分配角色权限和访问控制
        </p>
      </div>
      <div class="flex gap-3">
        <Button variant="outline" size="sm" @click="importUsers">
          <Upload class="mr-2 h-4 w-4" />
          批量导入
        </Button>
        <Button variant="outline" size="sm" @click="exportUsers">
          <Download class="mr-2 h-4 w-4" />
          导出用户
        </Button>
        <Button size="sm" @click="openUserModal">
          <Plus class="mr-2 h-4 w-4" />
          新增用户
        </Button>
      </div>
    </div>

    <!-- 用户表格 -->
    <UserTable
      :users="users"
      :departments="departments"
      :loading="loading"
      @view-user="viewUser"
      @edit-user="editUser"
      @toggle-status="toggleStatus"
      @create-user="openUserModal"
    />

    <!-- 用户编辑对话框 -->
    <UserModal
      :open="showUserModal"
      :user="currentUser"
      :departments="departments"
      :roles="roles"
      :saving="saving"
      @close="closeUserModal"
      @save="saveUser"
    />
  </div>
</template>

<script setup lang="ts">
// 页面权限配置 - 必须放在最前面
definePageMeta({
  layout: 'default',
  requiresAuth: true,
  // 临时移除权限要求进行调试
  // permission: 'system:users'
});

import { Download, Plus, Upload } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { Button } from '@/components/ui/button';
import type { RoleData } from '~/composables/useRoles';
import type { UserData, UserForm } from '~/composables/useUsers';
import UserModal from './components/UserModal.vue';
import UserTable from './components/UserTable.vue';

useHead({
  title: '用户管理 - 智能ERP管理系统',
});

// Composables
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword: resetUserPassword,
  toggleUserStatus,
  getDepartments,
} = useUsers();

const { roles: rolesData, fetchRoles } = useRoles();

// 状态管理
const loading = ref(false);
const saving = ref(false);
const showUserModal = ref(false);
const currentUser = ref<UserData | null>(null);

// 数据
const users = ref<UserData[]>([]);
const roles = ref<RoleData[]>([]);
const departments = ref<any[]>([]);

// 方法
const loadUsers = async () => {
  loading.value = true;
  try {
    const result = await getUsers({
      page: 1,
      pageSize: 1000, // 获取所有数据，在前端进行分页和筛选
    });

    if (result.code === 0) {
      users.value = result.data;
    } else {
      toast.error('获取用户列表失败', {
        description: result.message,
      });
    }
  } catch (error: any) {
    toast.error('获取用户列表失败', {
      description: error.message || '网络错误',
    });
  } finally {
    loading.value = false;
  }
};

const loadRoles = async () => {
  try {
    await fetchRoles();
    if (rolesData.value) {
      roles.value = [...rolesData.value];
    }
  } catch (error) {
    roles.value = [];
  }
};

const loadDepartments = async () => {
  try {
    const result = await getDepartments();

    if (Array.isArray(result)) {
      departments.value = result;
    } else if (result && Array.isArray(result.data)) {
      departments.value = result.data;
    } else {
      departments.value = [];
    }
  } catch (error) {
    departments.value = [];
  }
};

// 用户操作方法
const openUserModal = () => {
  currentUser.value = null;
  showUserModal.value = true;
};

const viewUser = (user: UserData) => {
  editUser(user);
};

const editUser = (user: UserData) => {
  currentUser.value = user;
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
  currentUser.value = null;
};

const saveUser = async (formData: any) => {
  try {
    saving.value = true;

    const userData: UserForm = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department_id: formData.department_id,
      role_ids: [formData.role_id],
      remarks: formData.remarks,
      status: formData.status,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    let result: { code: number; message?: string };
    if (formData.id) {
      result = await updateUser(formData.id, userData);
    } else {
      result = await createUser(userData);
    }

    if (result.code === 0) {
      toast.success(formData.id ? '更新用户成功' : '创建用户成功');
      closeUserModal();
      loadUsers();
    } else {
      toast.error(formData.id ? '更新用户失败' : '创建用户失败', {
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

const toggleStatus = async (user: UserData) => {
  try {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const result = await toggleUserStatus(user.id, newStatus);

    if (result.code === 0) {
      toast.success('更新状态成功');
      loadUsers();
    } else {
      toast.error('更新状态失败', {
        description: (result as any).message || '操作失败',
      });
    }
  } catch (error: any) {
    toast.error('更新状态失败', {
      description: error.message || '网络错误',
    });
  }
};

const importUsers = () => {
  toast.info('功能开发中', {
    description: '批量导入功能即将上线',
  });
};

const exportUsers = () => {
  toast.info('功能开发中', {
    description: '导出功能即将上线',
  });
};

// 初始化
onMounted(async () => {
  // 先加载基础数据，再加载用户数据
  await Promise.all([loadRoles(), loadDepartments()]);

  // 确保基础数据加载完成后再加载用户数据
  await loadUsers();
});
</script>
