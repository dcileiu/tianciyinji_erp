export default defineNuxtRouteMiddleware((to) => {
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

  const { hasPermission, hasAnyPermission, permissions } = usePermissions();

  // 获取路由权限要求
  const requiredPermission = to.meta.permission;
  let hasAccess = false;

  if (typeof requiredPermission === 'string') {
    hasAccess = hasPermission(requiredPermission);
  } else if (Array.isArray(requiredPermission)) {
    hasAccess = hasAnyPermission(requiredPermission);
  }

  // 如果权限检查失败且权限数据为空，可能是权限未加载
  if (!hasAccess && permissions.value.length === 0) {
    // 暂时允许访问，避免用户无法使用系统
    return;
  }

  if (!hasAccess) {
    // 重定向到无权限页面
    throw createError({
      statusCode: 403,
      statusMessage: '访问被拒绝：您没有权限访问此页面',
    });
  }
});
