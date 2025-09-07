import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const query = getQuery(event);
  const action = query.action as string;

  try {
    // 获取用户认证信息
    const supabase = serverSupabaseServiceRole(event);
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户未登录',
      });
    }

    // 根据action参数分发到不同的处理函数
    if (action === 'profile' && method === 'GET') {
      return await getUserProfile(supabase, user);
    }
    if (action === 'permissions' && method === 'GET') {
      return await getUserPermissions(supabase, user);
    }
    if (action === 'menus' && method === 'GET') {
      return await getUserMenus(supabase, user);
    }
    // 默认返回用户基本信息
    return await getUserProfile(supabase, user);
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    return {
      code: 1,
      message: error.message || '服务器内部错误',
      data: null,
    };
  }
});

/**
 * 获取用户详细信息
 */
async function getUserProfile(supabase: any, user: any) {
  try {
    // 使用Supabase Admin API获取用户详细信息
    const { data: authUserData, error: authError } =
      await supabase.auth.admin.getUserById(user.id);

    if (authError || !authUserData.user) {
      return {
        code: 1,
        message: '获取用户信息失败',
        data: null,
      };
    }

    const authUser = authUserData.user;
    const metadata = authUser.user_metadata || {};

    // 查询用户的部门信息（如果有department_id）
    let departmentData = null;
    if (metadata.department_id) {
      const { data: dept } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('id', metadata.department_id)
        .single();
      departmentData = dept;
    }

    // 查询用户角色
    const { data: userRoles } = await supabase
      .from('users_role')
      .select(
        `
        roles (
          id,
          name,
          code,
          description
        )
      `
      )
      .eq('user_id', user.id);

    // 构建用户信息
    const userProfile = {
      id: authUser.id,
      name: metadata.name || authUser.email?.split('@')[0] || '',
      username: metadata.username || authUser.email?.split('@')[0] || '',
      email: authUser.email,
      phone: metadata.phone || '',
      avatar: metadata.avatar || '',
      department_id: metadata.department_id || null,
      position_id: metadata.position_id || null,
      status: metadata.status || 'active',
      remarks: metadata.remarks || '',
      is_online: metadata.is_online,
      login_count: metadata.login_count || 0,
      last_login_at: authUser.last_sign_in_at,
      created_at: authUser.created_at,
      updated_at: authUser.updated_at,
      department: departmentData,
      position: null, // 预留字段
      roles: userRoles?.map((ur: any) => ur.roles).filter(Boolean) || [],
    };

    return {
      code: 0,
      message: '获取成功',
      data: userProfile,
    };
  } catch (error: any) {
    return {
      code: 1,
      message: error.message || '获取用户信息失败',
      data: null,
    };
  }
}

/**
 * 获取用户权限列表
 */
async function getUserPermissions(supabase: any, user: any) {
  try {
    // 查询用户所有权限
    const { data: userMenus, error } = await supabase
      .from('menus')
      .select(
        `
        permission,
        roles_menu!inner(
          roles!inner(
            users_role!inner(user_id)
          )
        )
      `
      )
      .eq('roles_menu.roles.users_role.user_id', user.id)
      .eq('roles_menu.roles.status', 'active')
      .eq('status', 'active')
      .not('permission', 'is', null);

    if (error) {
      throw new Error('查询用户权限失败');
    }

    // 提取权限并去重
    const permissions = Array.from(
      new Set(
        userMenus?.map((item: any) => item.permission).filter(Boolean) || []
      )
    );

    return {
      code: 0,
      message: '获取成功',
      data: permissions,
    };
  } catch (error: any) {
    return {
      code: -1,
      message: error.message || '获取用户权限失败',
      data: [],
    };
  }
}

/**
 * 获取用户菜单列表
 */
async function getUserMenus(supabase: any, user: any) {
  try {
    // 查询用户有权限的菜单
    const { data: userMenus, error } = await supabase
      .from('menus')
      .select(
        `
        id,
        name,
        icon,
        path,
        parent_id,
        sort,
        permission,
        type,
        roles_menu!inner(
          roles!inner(
            users_role!inner(user_id)
          )
        )
      `
      )
      .eq('roles_menu.roles.users_role.user_id', user.id)
      .eq('roles_menu.roles.status', 'active')
      .eq('status', 'active')
      .in('type', ['directory', 'menu'])
      .order('sort');

    if (error) {
      throw new Error('查询用户菜单失败');
    }

    // 清理数据，移除重复的菜单
    const uniqueMenus =
      userMenus?.reduce((acc: any[], current: any) => {
        const exists = acc.find((item) => item.id === current.id);
        if (!exists) {
          acc.push({
            id: current.id,
            name: current.name,
            icon: current.icon,
            path: current.path,
            parent_id: current.parent_id,
            sort: current.sort,
            permission: current.permission,
            type: current.type,
          });
        }
        return acc;
      }, []) || [];

    return {
      code: 0,
      message: '获取成功',
      data: uniqueMenus,
    };
  } catch (error: any) {
    return {
      code: -1,
      message: error.message || '获取用户菜单失败',
      data: [],
    };
  }
}
