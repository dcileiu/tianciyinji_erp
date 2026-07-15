// 菜单类型定义
export interface Menu {
  children?: Menu[];
  created_at?: string;
  icon?: string | null;
  id: string;
  name: string;
  parent_id: string; // '0' 表示根菜单
  path?: string | null;
  permission?: string | null;
  sort: number;
  status: "active" | "inactive";
  type: "directory" | "menu" | "permission";
  updated_at?: string;
}

// 菜单表单类型
export interface MenuForm {
  icon?: string | null;
  name: string;
  parent_id: string;
  path?: string | null;
  permission?: string | null;
  sort: number;
  status: "active" | "inactive";
  type: "directory" | "menu" | "permission";
}

// 菜单查询参数
export interface MenuQuery {
  parent_id?: string | null;
  search?: string;
  status?: string;
  type?: string;
}

type ApiResult<T> = {
  code: number;
  message: string;
  data: T;
};

export const useMenus = () => {
  const menus = ref<Menu[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchMenus = async (query?: MenuQuery) => {
    try {
      loading.value = true;
      error.value = null;

      const result = await $fetch<ApiResult<Menu[]>>("/api/menus", {
        query: {
          search: query?.search,
          status: query?.status,
          type: query?.type,
        },
      });

      if (result.code !== 0) {
        throw new Error(result.message || "获取菜单失败");
      }

      const menuTree = buildMenuTree(result.data || []);
      menus.value = menuTree;

      return { data: menuTree, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取菜单失败";
      error.value = message;
      return { data: null, error: message };
    } finally {
      loading.value = false;
    }
  };

  const fetchMenu = async (id: string) => {
    try {
      const result = await $fetch<ApiResult<Menu[]>>("/api/menus");
      if (result.code !== 0) {
        throw new Error(result.message || "获取菜单失败");
      }
      const found = (result.data || []).find((item) => item.id === id) || null;
      return { data: found, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取菜单失败";
      return { data: null, error: message };
    }
  };

  const createMenu = async (menuData: MenuForm) => {
    try {
      loading.value = true;
      error.value = null;

      const processedData = {
        ...menuData,
        parent_id: menuData.parent_id || "0",
        icon: menuData.icon || null,
        path: menuData.path || null,
        permission: menuData.permission || null,
      };

      const result = await $fetch<ApiResult<Menu>>("/api/menus", {
        method: "POST",
        body: processedData,
      });

      if (result.code !== 0) {
        throw new Error(result.message || "创建菜单失败");
      }

      await fetchMenus();
      return { data: result.data, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "创建菜单失败";
      error.value = message;
      return { data: null, error: message };
    } finally {
      loading.value = false;
    }
  };

  const updateMenu = async (id: string, menuData: Partial<MenuForm>) => {
    try {
      loading.value = true;
      error.value = null;

      const processedData: Record<string, unknown> = {
        id,
        ...menuData,
      };

      if (menuData.parent_id !== undefined) {
        processedData.parent_id = menuData.parent_id || "0";
      }
      if (menuData.icon !== undefined) {
        processedData.icon = menuData.icon || null;
      }
      if (menuData.path !== undefined) {
        processedData.path = menuData.path || null;
      }
      if (menuData.permission !== undefined) {
        processedData.permission = menuData.permission || null;
      }

      const result = await $fetch<ApiResult<Menu>>("/api/menus", {
        method: "PUT",
        body: processedData,
      });

      if (result.code !== 0) {
        throw new Error(result.message || "更新菜单失败");
      }

      await fetchMenus();
      return { data: result.data, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "更新菜单失败";
      error.value = message;
      return { data: null, error: message };
    } finally {
      loading.value = false;
    }
  };

  const deleteMenu = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      const result = await $fetch<{ code: number; message: string }>(
        "/api/menus",
        {
          method: "DELETE",
          body: { id },
        }
      );

      if (result.code !== 0) {
        throw new Error(result.message || "删除菜单失败");
      }

      await fetchMenus();
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "删除菜单失败";
      error.value = message;
      return { error: message };
    } finally {
      loading.value = false;
    }
  };

  const deleteMenus = async (ids: string[]) => {
    try {
      loading.value = true;
      error.value = null;

      const result = await $fetch<{ code: number; message: string }>(
        "/api/menus",
        {
          method: "DELETE",
          body: { ids },
        }
      );

      if (result.code !== 0) {
        throw new Error(result.message || "批量删除菜单失败");
      }

      await fetchMenus();
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "批量删除菜单失败";
      error.value = message;
      return { error: message };
    } finally {
      loading.value = false;
    }
  };

  const updateMenuStatus = async (
    id: string,
    status: "active" | "inactive"
  ) => {
    try {
      const result = await $fetch<ApiResult<Menu>>("/api/menus", {
        method: "PUT",
        body: { id, status },
      });

      if (result.code !== 0) {
        throw new Error(result.message || "更新状态失败");
      }

      await fetchMenus();
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "更新状态失败";
      return { error: message };
    }
  };

  const getParentMenuOptions = () => {
    const options: Array<{ label: string; value: string }> = [];

    const addMenuOptions = (menuList: Menu[], prefix = "") => {
      for (const menu of menuList) {
        if (menu.type === "directory" || menu.type === "menu") {
          options.push({
            label: `${prefix}${menu.name}`,
            value: menu.id,
          });

          if (menu.children && menu.children.length > 0) {
            addMenuOptions(menu.children, `${prefix}${menu.name} / `);
          }
        }
      }
    };

    addMenuOptions(menus.value);
    return options;
  };

  return {
    menus: readonly(menus),
    loading: readonly(loading),
    error: readonly(error),
    fetchMenus,
    fetchMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    deleteMenus,
    updateMenuStatus,
    getParentMenuOptions,
  };
};

function buildMenuTree(flatMenus: Menu[]): Menu[] {
  const menuMap = new Map<string, Menu>();
  const rootMenus: Menu[] = [];

  for (const menu of flatMenus) {
    menuMap.set(menu.id, {
      ...menu,
      children: [],
    });
  }

  for (const menu of flatMenus) {
    const menuNode = menuMap.get(menu.id);
    if (!menuNode) {
      continue;
    }

    if (!menu.parent_id || menu.parent_id === "0") {
      rootMenus.push(menuNode);
    } else {
      const parentNode = menuMap.get(menu.parent_id);
      if (parentNode) {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(menuNode);
      }
    }
  }

  return rootMenus;
}
