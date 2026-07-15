import { serverSupabaseServiceRole } from "#supabase/server";
import { assertPermission, rethrowIfHttpError } from "../../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const roleId = getRouterParam(event, "id");

  if (!roleId) {
    throw createError({ statusCode: 400, statusMessage: "角色 ID 不能为空" });
  }

  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "system:roles");

    if (method === "GET") {
      const { data, error } = await supabase
        .from("roles_menu")
        .select("menu_id")
        .eq("role_id", roleId);

      if (error) {
        throw error;
      }

      return {
        code: 0,
        message: "获取成功",
        data: data?.map((item) => item.menu_id) || [],
      };
    }

    if (method === "PUT") {
      const body = await readBody(event);
      const menuIds: string[] = Array.isArray(body?.menu_ids)
        ? body.menu_ids
        : [];

      const { error: deleteError } = await supabase
        .from("roles_menu")
        .delete()
        .eq("role_id", roleId);

      if (deleteError) {
        throw deleteError;
      }

      if (menuIds.length > 0) {
        const rows = menuIds.map((menuId) => ({
          role_id: roleId,
          menu_id: menuId,
        }));

        const { error: insertError } = await supabase
          .from("roles_menu")
          .insert(rows);

        if (insertError) {
          throw insertError;
        }
      }

      return {
        code: 0,
        message: "权限更新成功",
        data: menuIds,
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed",
    });
  } catch (error: unknown) {
    rethrowIfHttpError(error);
    const message = error instanceof Error ? error.message : "操作失败";
    return {
      code: -1,
      message,
      data: [],
    };
  }
});
