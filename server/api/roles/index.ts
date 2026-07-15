import { desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { roles, usersRole } from "../../db/schema/system";
import {
  assertPermission,
  RESERVED_ROLE_CODES,
  rethrowIfHttpError,
} from "../_utils/permissions";

function normalizeRoleStatus(status: unknown): "active" | "inactive" {
  if (status === "inactive" || status === 0 || status === "0") {
    return "inactive";
  }
  return "active";
}

function toRoleApi(row: typeof roles.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    status: row.status,
    is_system: row.isSystem,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  try {
    switch (method) {
      case "GET": {
        await assertPermission(event, "system:roles");
        const rows = await db
          .select()
          .from(roles)
          .orderBy(desc(roles.createdAt));
        return { code: 0, message: "获取成功", data: rows.map(toRoleApi) };
      }

      case "POST": {
        await assertPermission(event, "system:roles");
        const createData = await readBody(event);
        const code = String(createData.code || "").trim();

        if (!(code && createData.name)) {
          throw createError({
            statusCode: 400,
            statusMessage: "角色名称和编码不能为空",
          });
        }

        if (
          RESERVED_ROLE_CODES.includes(
            code as (typeof RESERVED_ROLE_CODES)[number]
          )
        ) {
          throw createError({
            statusCode: 400,
            statusMessage: "不能创建系统保留角色编码",
          });
        }

        const [newRole] = await db
          .insert(roles)
          .values({
            name: createData.name,
            code,
            description: createData.description || "",
            status: normalizeRoleStatus(createData.status),
            isSystem: false,
          })
          .returning();

        return { code: 0, message: "创建成功", data: toRoleApi(newRole) };
      }

      case "PUT": {
        await assertPermission(event, "system:roles");
        const updateData = await readBody(event);

        if (!updateData.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "角色 ID 不能为空",
          });
        }

        const [existing] = await db
          .select()
          .from(roles)
          .where(eq(roles.id, updateData.id))
          .limit(1);

        if (!existing) {
          throw createError({
            statusCode: 404,
            statusMessage: "角色不存在",
          });
        }

        const nextCode =
          updateData.code === undefined
            ? existing.code
            : String(updateData.code).trim();

        const isReserved =
          existing.isSystem ||
          RESERVED_ROLE_CODES.includes(
            existing.code as (typeof RESERVED_ROLE_CODES)[number]
          );

        if (isReserved) {
          const [updatedRole] = await db
            .update(roles)
            .set({
              name: updateData.name ?? existing.name,
              description:
                updateData.description === undefined
                  ? existing.description
                  : updateData.description,
              status:
                updateData.status === undefined
                  ? existing.status
                  : normalizeRoleStatus(updateData.status),
              updatedAt: new Date(),
            })
            .where(eq(roles.id, updateData.id))
            .returning();

          return { code: 0, message: "更新成功", data: toRoleApi(updatedRole) };
        }

        if (
          RESERVED_ROLE_CODES.includes(
            nextCode as (typeof RESERVED_ROLE_CODES)[number]
          )
        ) {
          throw createError({
            statusCode: 400,
            statusMessage: "不能将角色编码改为系统保留值",
          });
        }

        const [updatedRole] = await db
          .update(roles)
          .set({
            name: updateData.name,
            code: nextCode,
            description: updateData.description,
            status: normalizeRoleStatus(updateData.status),
            updatedAt: new Date(),
          })
          .where(eq(roles.id, updateData.id))
          .returning();

        return { code: 0, message: "更新成功", data: toRoleApi(updatedRole) };
      }

      case "DELETE": {
        await assertPermission(event, "system:roles");
        const deleteData = await readBody(event);

        const [existing] = await db
          .select()
          .from(roles)
          .where(eq(roles.id, deleteData.id))
          .limit(1);

        if (!existing) {
          throw createError({
            statusCode: 404,
            statusMessage: "角色不存在",
          });
        }

        if (
          existing.isSystem ||
          RESERVED_ROLE_CODES.includes(
            existing.code as (typeof RESERVED_ROLE_CODES)[number]
          )
        ) {
          throw createError({
            statusCode: 400,
            statusMessage: "系统角色不可删除",
          });
        }

        const linked = await db
          .select({ userId: usersRole.userId })
          .from(usersRole)
          .where(eq(usersRole.roleId, deleteData.id))
          .limit(1);

        if (linked.length > 0) {
          return { code: -1, message: "该角色已被用户使用，无法删除" };
        }

        await db.delete(roles).where(eq(roles.id, deleteData.id));
        return { code: 0, message: "删除成功" };
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: "Method not allowed",
        });
    }
  } catch (error: unknown) {
    rethrowIfHttpError(error);
    const message = error instanceof Error ? error.message : "操作失败";
    return { code: -1, message };
  }
});
