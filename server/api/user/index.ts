import { eq } from "drizzle-orm";
import { db } from "../../db";
import { departments } from "../../db/schema/system";
import { requireUser } from "../../utils/auth";
import {
  getUserMenuRows,
  getUserPermissionCodes,
  getUserRoleRows,
} from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const query = getQuery(event);
  const action = query.action as string;

  try {
    const user = await requireUser(event);

    if (action === "permissions" && method === "GET") {
      const permissions = await getUserPermissionCodes(user.id);
      return { code: 0, message: "获取成功", data: permissions };
    }

    if (action === "menus" && method === "GET") {
      const menuRows = await getUserMenuRows(user.id);
      return { code: 0, message: "获取成功", data: menuRows };
    }

    // profile（默认）
    let departmentData = null;
    if (user.departmentId) {
      const [dept] = await db
        .select({
          id: departments.id,
          name: departments.name,
          code: departments.code,
        })
        .from(departments)
        .where(eq(departments.id, user.departmentId))
        .limit(1);
      departmentData = dept ?? null;
    }

    const roleRows = await getUserRoleRows(user.id);

    return {
      code: 0,
      message: "获取成功",
      data: {
        id: user.id,
        name: user.name || user.email.split("@")[0] || "",
        username: user.username || user.email.split("@")[0] || "",
        email: user.email,
        phone: user.phone || "",
        avatar: "",
        department_id: user.departmentId,
        position_id: null,
        status: user.status,
        remarks: "",
        is_online: user.isOnline,
        login_count: user.loginCount,
        last_login_at: user.lastLoginAt,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        department: departmentData,
        position: null,
        roles: roleRows.map((role) => ({
          id: role.id,
          name: role.name,
          code: role.code,
          description: role.description,
        })),
      },
    };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      typeof (error as { statusCode: unknown }).statusCode === "number"
    ) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "服务器内部错误";
    return { code: 1, message, data: null };
  }
});
