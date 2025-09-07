import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from '#supabase/server';

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event);
    const user = await serverSupabaseUser(event);

    if (!user) {
      return {
        code: 401,
        message: '未登录',
        data: null,
      };
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        is_online: false,
        last_logout_at: new Date().toISOString(),
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      code: 0,
      message: '登出状态已更新',
      data: true,
    };
  } catch (err: any) {
    return {
      code: -1,
      message: err?.message || '登出状态更新失败',
      data: null,
    };
  }
});
