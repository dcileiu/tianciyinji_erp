/**
 * 权限管理 Composable - 现在使用 Pinia Store
 */
export const usePermissions = () => {
  const userStore = useUserStore();
  const permissionsStore = usePermissionsStore();

  return {
    // 状态
    permissions: readonly(computed(() => userStore.permissions)),
    menus: readonly(computed(() => permissionsStore.menus)),
    roles: readonly(computed(() => userStore.roles)),
    loading: readonly(
      computed(() => userStore.permissionsLoading || permissionsStore.loading)
    ),
    error: readonly(computed(() => userStore.error || permissionsStore.error)),
    authorizedMenus: computed(() => permissionsStore.authorizedMenus),

    // 方法 - 优先使用用户store的权限检查方法
    fetchUserPermissions: async () => {
      await Promise.all([
        userStore.fetchUserPermissions(),
        permissionsStore.fetchUserPermissions(),
      ]);
    },
    hasPermission: userStore.hasPermission,
    hasAnyPermission: userStore.hasAnyPermission,
    hasAllPermissions: userStore.hasAllPermissions,
    hasRoutePermission: userStore.hasPermission, // 简化路由权限检查
    clearPermissions: () => {
      userStore.clearUserData();
      permissionsStore.clearPermissions();
    },
    refreshPermissions: async () => {
      await Promise.all([
        userStore.refreshUserData(),
        permissionsStore.refreshPermissions(),
      ]);
    },

    // 工具方法
    buildMenuTree: permissionsStore.buildMenuTree,
    filterAuthorizedMenus: () => permissionsStore.authorizedMenus,
  };
};
