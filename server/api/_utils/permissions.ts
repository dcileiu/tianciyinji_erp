import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';

/**
 * 检查当前请求用户是否拥有指定权限
 * - 没有登录 -> 401
 * - 已登录但无权限 -> 403
 * - 返回 true 表示拥有权限
 */
export async function assertPermission(event: any, requiredPermission: string) {
  const supabase = serverSupabaseServiceRole(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: '未认证' });
  }

  // 超级管理员放行（角色代码 super_admin）
  const { data: roles } = await supabase
    .from('users_role')
    .select('roles!inner(code, status)')
    .eq('user_id', user.id);
  const isSuperAdmin = (roles || []).some(
    (r: any) => r.roles?.code === 'super_admin' && r.roles?.status === 1
  );
  if (isSuperAdmin) {
    return true;
  }

  // 从菜单权限中判断
  const { data: userPerms } = await supabase
    .from('menus')
    .select(
      'permission, roles_menu!inner(roles!inner(users_role!inner(user_id)))'
    )
    .eq('roles_menu.roles.users_role.user_id', user.id)
    .eq('roles_menu.roles.status', 'active')
    .eq('status', 'active')
    .not('permission', 'is', null);

  const has = new Set(
    (userPerms || []).map((p: any) => p.permission).filter(Boolean)
  ).has(requiredPermission);

  if (!has) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  return true;
}

/**
 * 辅助：包装返回体，统一 403 时返回空数据
 */
export function ok<T>(data: T, message = 'ok') {
  return { code: 0, message, data };
}

export function forbiddenEmpty(message = '无权限') {
  return { code: 0, message, data: Array.isArray([]) ? [] : null } as any;
}
