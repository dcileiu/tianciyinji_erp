export interface UserData {
  avatar?: string;
  created_at: string;
  department_id?: string;
  email: string;
  email_confirmed_at?: string | null;
  id: string;
  is_online: boolean;
  last_sign_in_at?: string | null;
  login_count: number;
  // 扩展字段
  name?: string;
  phone?: string | null;
  position_id?: string;
  remarks?: string;
  // 关联的角色信息
  roles?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  // 状态和统计信息
  status: "active" | "inactive" | "pending";
  updated_at: string;
  username?: string;
}

// 用户表单类型
export interface UserForm {
  confirmPassword?: string;
  department_id?: string;
  email: string;
  name: string;
  password?: string;
  phone?: string;
  remarks?: string;
  role_ids: string[];
  status: "active" | "inactive" | "pending";
  username: string;
}

// 查询参数类型
export interface UserQuery {
  department_id?: string;
  page?: number;
  pageSize?: number;
  role_id?: string;
  search?: string;
  status?: string;
}

// 用户统计类型
export interface UserStats {
  active: number;
  admins: number;
  inactive: number;
  newThisMonth: number;
  online: number;
  pending: number;
  total: number;
}

export const useUsers = () => {
  // 状态
  const users = ref<UserData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取用户列表
  const getUsers = async (query: UserQuery = {}) => {
    try {
      loading.value = true;
      error.value = null;

      // 使用认证错误处理包装器
      const result = await withAuthErrorHandling(async () => {
        // 调用服务端 API
        return (await $fetch("/api/users", {
          query,
        })) as any;
      });

      if (result.code === 0) {
        // 转换数据格式
        const transformedUsers = result.data.map(transformUserData);
        users.value = transformedUsers;

        return {
          code: 0,
          message: result.message,
          data: transformedUsers,
          total: result.total,
        };
      }
      return result;
    } catch (err: any) {
      error.value = err.message || "获取用户列表失败";
      return {
        code: -1,
        message: err.message || "获取用户列表失败",
        data: [],
        total: 0,
      };
    } finally {
      loading.value = false;
    }
  };

  // 获取单个用户
  const getUser = async (id: string) => {
    try {
      const result = (await $fetch("/api/users", {
        query: { page: 1, pageSize: 500 },
      })) as {
        code: number;
        message: string;
        data: any[];
      };

      if (result.code !== 0) {
        throw new Error(result.message || "获取用户失败");
      }

      const rawUser = (result.data || []).find((u) => u.id === id);
      if (!rawUser) {
        return {
          code: -1,
          message: "用户不存在",
          data: null,
        };
      }

      return {
        code: 0,
        message: "获取成功",
        data: transformUserData(rawUser),
      };
    } catch (err: any) {
      return {
        code: -1,
        message: err.message || "获取用户失败",
        data: null,
      };
    }
  };

  // 创建用户
  const createUser = async (userData: UserForm) => {
    try {
      loading.value = true;
      error.value = null;

      // 调用服务端 API 创建用户
      const result = await $fetch("/api/users", {
        method: "POST",
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          username: userData.username,
          phone: userData.phone,
          department_id: userData.department_id,
          role_ids: userData.role_ids,
          remarks: userData.remarks,
          status: userData.status,
        },
      });

      return result;
    } catch (err: any) {
      error.value = err.message || "创建用户失败";
      return {
        code: -1,
        message: err.message || "创建用户失败",
        data: null,
      };
    } finally {
      loading.value = false;
    }
  };

  // 更新用户
  const updateUser = async (id: string, userData: Partial<UserForm>) => {
    try {
      loading.value = true;
      error.value = null;

      // 调用服务端 API 更新用户信息和角色
      const result = await $fetch("/api/users", {
        method: "PUT",
        body: {
          id,
          name: userData.name,
          username: userData.username,
          phone: userData.phone,
          department_id: userData.department_id,
          role_ids: userData.role_ids,
          remarks: userData.remarks,
          status: userData.status,
        },
      });

      return result;
    } catch (err: any) {
      error.value = err.message || "更新用户失败";
      return {
        code: -1,
        message: err.message || "更新用户失败",
        data: null,
      };
    } finally {
      loading.value = false;
    }
  };

  // 删除用户
  const deleteUser = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      // 调用服务端 API 删除用户
      const result = await $fetch("/api/users", {
        method: "DELETE",
        body: { id },
      });

      return result;
    } catch (err: any) {
      error.value = err.message || "删除用户失败";
      return {
        code: -1,
        message: err.message || "删除用户失败",
        data: null,
      };
    } finally {
      loading.value = false;
    }
  };

  // 重置密码（暂时禁用，需要服务端支持）
  const resetPassword = async (_id: string, _newPassword: string) => ({
    code: -1,
    message: "重置密码功能需要服务端API支持，请联系管理员",
    data: null,
  });

  // 切换用户状态（暂时禁用，需要服务端支持）
  const toggleUserStatus = async (
    _id: string,
    _status: "active" | "inactive"
  ) => ({
    code: -1,
    message: "状态切换功能需要服务端API支持，请联系管理员",
    data: null,
  });

  // 获取部门列表
  const getDepartments = async () => {
    try {
      // 调用部门API获取数据
      const result = (await $fetch("/api/departments", {
        method: "GET",
      })) as any;

      if (result?.code === 0) {
        return result.data || [];
      }
      return [];
    } catch (err: any) {
      return [];
    }
  };

  return {
    // 状态
    users,
    loading,
    error,

    // 方法
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    toggleUserStatus,
    getDepartments,
  };
};

// 转换用户数据格式的辅助函数
function transformUserData(rawUser: any): UserData {
  return {
    id: rawUser.id,
    email: rawUser.email,
    phone: rawUser.phone,
    email_confirmed_at: rawUser.email_confirmed_at,
    last_sign_in_at: rawUser.last_sign_in_at,
    created_at: rawUser.created_at,
    updated_at: rawUser.updated_at,
    name: rawUser.name || rawUser.email?.split("@")[0] || "",
    username: rawUser.username || rawUser.email?.split("@")[0] || "",
    avatar: rawUser.avatar,
    department_id: rawUser.department_id,
    position_id: rawUser.position_id,
    remarks: rawUser.remarks,
    status: rawUser.status || "active",
    is_online: rawUser.is_online,
    login_count: rawUser.login_count || 0,
    roles: rawUser.roles || [],
  };
}
