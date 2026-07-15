import { defineStore } from "pinia";

export interface MenuPermission {
  children?: MenuPermission[];
  icon: string | null;
  id: string;
  name: string;
  parent_id: string | null;
  path: string | null;
  permission: string | null;
  sort: number;
  status: string;
  type: string;
}

export interface UserRoleData {
  code: string;
  description?: string;
  id: string;
  name: string;
}

interface PermissionsState {
  error: string | null;
  // 标记是否已加载过（即使结果为空也视为已加载）
  loaded: boolean;
  loading: boolean;
  menus: MenuPermission[];
  permissions: string[];
  roles: UserRoleData[];
}

export const usePermissionsStore = defineStore("permissions", {
  state: (): PermissionsState => ({
    permissions: [],
    menus: [],
    roles: [],
    loading: false,
    error: null,
    loaded: false,
  }),

  getters: {
    /**
     * 获取用户有权限的菜单树
     */
    authorizedMenus: (state) => {
      const filterAuthorizedMenus = (
        menuList: MenuPermission[]
      ): MenuPermission[] => {
        return menuList.filter((menu) => {
          // 如果菜单没有权限要求，直接显示
          if (!menu.permission) {
            return true;
          }

          // 检查用户是否有该菜单权限
          if (!state.permissions.includes(menu.permission)) {
            return false;
          }

          // 如果有子菜单，递归过滤
          if (menu.children && menu.children.length > 0) {
            menu.children = filterAuthorizedMenus(menu.children);
            // 如果子菜单全部被过滤掉，则隐藏父菜单
            return menu.children.length > 0;
          }

          return true;
        });
      };

      return filterAuthorizedMenus([...state.menus]);
    },

    /**
     * 检查是否有特定权限
     */
    hasPermission:
      (state) =>
      (permission: string): boolean => {
        if (!permission) {
          return true;
        }
        return state.permissions.includes(permission);
      },

    /**
     * 检查是否有任意一个权限
     */
    hasAnyPermission:
      (state) =>
      (checkPermissions: string[]): boolean => {
        if (!checkPermissions || checkPermissions.length === 0) {
          return true;
        }
        return checkPermissions.some((permission) =>
          state.permissions.includes(permission)
        );
      },

    /**
     * 检查是否有所有权限
     */
    hasAllPermissions:
      (state) =>
      (checkPermissions: string[]): boolean => {
        if (!checkPermissions || checkPermissions.length === 0) {
          return true;
        }
        return checkPermissions.every((permission) =>
          state.permissions.includes(permission)
        );
      },
  },

  actions: {
    /**
     * 获取用户权限和菜单数据
     */
    async fetchUserPermissions(): Promise<void> {
      // 防止重复请求
      if (this.loading || this.loaded) {
        return;
      }

      try {
        this.loading = true;
        this.error = null;

        // 并行获取权限和菜单数据
        const [permissionsRes, menusRes] = await Promise.all([
          $fetch<{ code: number; data: string[]; message: string }>(
            "/api/user",
            {
              query: { action: "permissions" },
            }
          ),
          $fetch<{ code: number; data: MenuPermission[]; message: string }>(
            "/api/user",
            {
              query: { action: "menus" },
            }
          ),
        ]);

        if (permissionsRes.code === 0) {
          this.permissions = permissionsRes.data || [];
        }

        if (menusRes.code === 0) {
          this.menus = this.buildMenuTree(menusRes.data || []);
        }
      } catch (err: any) {
        this.error = err.message || "获取用户权限失败";
        this.permissions = [];
        this.menus = [];
      } finally {
        this.loading = false;
        this.loaded = true;
      }
    },

    /**
     * 构建菜单树结构
     */
    buildMenuTree(flatMenus: MenuPermission[]): MenuPermission[] {
      const menuMap = new Map<string, MenuPermission>();
      const rootMenus: MenuPermission[] = [];

      // 创建菜单映射
      for (const menu of flatMenus) {
        menuMap.set(menu.id, { ...menu, children: [] });
      }

      // 构建树结构
      for (const menu of menuMap.values()) {
        if (menu.parent_id && menuMap.has(menu.parent_id)) {
          const parent = menuMap.get(menu.parent_id)!;
          parent.children = parent.children || [];
          parent.children.push(menu);
        } else {
          rootMenus.push(menu);
        }
      }

      return rootMenus.sort((a, b) => a.sort - b.sort);
    },

    /**
     * 路由权限检查
     */
    hasRoutePermission(
      route: string | { meta?: { permission?: string | string[] } }
    ): boolean {
      if (typeof route === "string") {
        return this.hasPermission(route);
      }

      const permission = route.meta?.permission;
      if (!permission) {
        return true;
      }

      if (typeof permission === "string") {
        return this.hasPermission(permission);
      }

      if (Array.isArray(permission)) {
        return this.hasAnyPermission(permission);
      }

      return true;
    },

    /**
     * 清空权限数据
     */
    clearPermissions(): void {
      this.permissions = [];
      this.menus = [];
      this.roles = [];
      this.error = null;
      this.loaded = false;
    },

    /**
     * 刷新权限数据
     */
    async refreshPermissions(): Promise<void> {
      // 清空现有数据，强制重新加载
      this.permissions = [];
      this.menus = [];
      this.loaded = false;
      await this.fetchUserPermissions();
    },
  },
});
