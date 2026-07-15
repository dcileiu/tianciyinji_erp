import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event);
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "未登录" });
    }

    const { data: currentUser, error: fetchError } =
      await supabase.auth.admin.getUserById(user.id);

    if (fetchError) {
      throw createError({
        statusCode: 500,
        statusMessage: "获取用户信息失败",
      });
    }

    // 合并现有元数据，避免覆盖 name / department_id 等字段
    const updatedMetadata = {
      ...currentUser.user?.user_metadata,
      is_online: false,
      last_logout_at: new Date().toISOString(),
    };

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: updatedMetadata,
    });

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "登出状态更新失败",
      });
    }

    return {
      code: 0,
      message: "登出状态已更新",
      data: true,
    };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "statusCode" in err &&
      typeof (err as { statusCode: unknown }).statusCode === "number"
    ) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "登出状态更新失败",
    });
  }
});
