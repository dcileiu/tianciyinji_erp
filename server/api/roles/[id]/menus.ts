import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { rolesMenu } from "../../../db/schema/system";
import { assertPermission, rethrowIfHttpError } from "../../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const roleId = getRouterParam(event, "id");

  if (!roleId) {
    throw createError({ statusCode: 400, statusMessage: "角色 ID 不能为空" });
  }

  try {
    await assertPermission(event, "system:roles");

    if (method === "GET") {
      const data = await db
        .select({ menu_id: rolesMenu.menuId })
        .from(rolesMenu)
        .where(eq(rolesMenu.roleId, roleId));

      return {
        code: 0,
        message: "获取成功",
        data: data.map((item) => item.menu_id),
      };
    }

    if (method === "PUT") {
      const body = await readBody(event);
      const menuIds: string[] = Array.isArray(body?.menu_ids)
        ? body.menu_ids
        : [];

      await db.delete(rolesMenu).where(eq(rolesMenu.roleId, roleId));

      if (menuIds.length > 0) {
        await db.insert(rolesMenu).values(
          menuIds.map((menuId) => ({
            roleId,
            menuId,
          }))
        );
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
