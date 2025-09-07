export default defineNuxtRouteMiddleware(async (to) => {
  // 跳过服务端渲染
  if (process.server) {
    return;
  }

  // 检查路由是否需要权限验证
  if (to.meta.requiresAuth === false) {
    return; // 公开路由，无需验证
  }

  // 如果没有权限要求，直接通过
  if (!to.meta.permission) {
    return;
  }

  const permissionsStore = usePermissionsStore();
  const { hasPermission, hasAnyPermission } = usePermissions();

  // 获取路由权限要求
  const requiredPermission = to.meta.permission;
  let hasAccess = false;

  if (typeof requiredPermission === 'string') {
    hasAccess = hasPermission(requiredPermission);
  } else if (Array.isArray(requiredPermission)) {
    hasAccess = hasAnyPermission(requiredPermission);
  }

  // 如果检查失败且权限未加载过，则尝试加载一次再判断
  if (!hasAccess) {
    const notLoaded = !permissionsStore.loaded;
    const notLoading = !permissionsStore.loading;
    if (notLoaded && notLoading) {
      await permissionsStore.fetchUserPermissions();
      if (typeof requiredPermission === 'string') {
        hasAccess = permissionsStore.permissions.includes(requiredPermission);
      } else if (Array.isArray(requiredPermission)) {
        hasAccess = requiredPermission.some((p) =>
          permissionsStore.permissions.includes(p)
        );
      }
    }
  }

  if (!hasAccess) {
    // 重定向到无权限页面
    throw createError({
      statusCode: 403,
      statusMessage: '访问被拒绝：您没有权限访问此页面',
    });
  }
});
