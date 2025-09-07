import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event);
    const user = await serverSupabaseUser(event);

    if (!user) {
      return {
        code: 401,
        message: "未登录",
        data: null,
      };
    }

    // 更新用户元数据，设置为在线状态
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        is_online: true,
        last_login_at: new Date().toISOString(),
        login_count: (user.user_metadata?.login_count || 0) + 1,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      code: 0,
      message: "登录状态已更新",
      data: true,
    };
  } catch (err: any) {
    return {
      code: -1,
      message: err?.message || "登录状态更新失败",
      data: null,
    };
  }
});
