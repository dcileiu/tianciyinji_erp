export interface RoleData {
  code: string;
  created_at: string;
  description: string | null;
  id: string;
  name: string;
  status: "active" | "inactive";
  type: "system" | "custom";
  updated_at: string;
}

export interface RoleForm {
  code: string;
  description?: string;
  name: string;
  status: "active" | "inactive";
  type: "system" | "custom";
}

export const useRoles = () => {
  // 响应式状态
  const roles = ref<RoleData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      loading.value = true;
      error.value = null;

      // 调用API获取角色数据
      const result = (await $fetch("/api/roles")) as any;

      if (result.code === 0) {
        roles.value = result.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          code: role.code,
          description: role.description,
          status: role.status,
          type: role.is_system ? "system" : "custom",
          created_at: role.created_at,
          updated_at: role.updated_at,
        }));
      }
    } catch (err: any) {
      error.value = err.message || "获取角色列表失败";
    } finally {
      loading.value = false;
    }
  };

  // 创建角色
  const createRole = async (roleData: RoleForm) => {
    try {
      loading.value = true;

      const result = await $fetch("/api/roles", {
        method: "POST",
        body: {
          name: roleData.name,
          code: roleData.code,
          description: roleData.description,
          status: roleData.status,
          is_system: roleData.type === "system",
        },
      });

      return result;
    } catch (err: any) {
      return {
        code: -1,
        message: err.message || "创建角色失败",
      };
    } finally {
      loading.value = false;
    }
  };

  // 更新角色
  const updateRole = async (id: string, roleData: RoleForm) => {
    try {
      loading.value = true;

      const result = await $fetch("/api/roles", {
        method: "PUT",
        body: {
          id,
          name: roleData.name,
          code: roleData.code,
          description: roleData.description,
          status: roleData.status,
          is_system: roleData.type === "system",
        },
      });

      return result;
    } catch (err: any) {
      return {
        code: -1,
        message: err.message || "更新角色失败",
      };
    } finally {
      loading.value = false;
    }
  };

  // 删除角色
  const deleteRole = async (id: string) => {
    try {
      loading.value = true;

      const result = await $fetch("/api/roles", {
        method: "DELETE",
        body: { id },
      });

      return result;
    } catch (err: any) {
      return {
        code: -1,
        message: err.message || "删除角色失败",
      };
    } finally {
      loading.value = false;
    }
  };

  // 获取角色菜单权限
  const getRoleMenuPermissions = async (roleId: string): Promise<string[]> => {
    try {
      const result = await $fetch<{
        code: number;
        data: string[];
        message: string;
      }>(`/api/roles/${roleId}/menus`);

      if (result.code !== 0) {
        throw new Error(result.message || "获取角色菜单失败");
      }

      return result.data || [];
    } catch {
      return [];
    }
  };

  // 更新角色菜单权限
  const updateRoleMenuPermissions = async (
    roleId: string,
    menuIds: string[]
  ) => {
    try {
      const result = await $fetch<{
        code: number;
        message: string;
      }>(`/api/roles/${roleId}/menus`, {
        method: "PUT",
        body: { menu_ids: menuIds },
      });

      if (result.code !== 0) {
        throw new Error(result.message || "更新权限失败");
      }

      return { code: 0, message: "权限更新成功" };
    } catch (err: unknown) {
      return {
        code: -1,
        message: err instanceof Error ? err.message : "更新权限失败",
      };
    }
  };

  return {
    // 状态
    roles,
    loading,
    error,

    // 方法
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getRoleMenuPermissions,
    updateRoleMenuPermissions,
  };
};
