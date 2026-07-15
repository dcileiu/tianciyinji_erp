import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { menus } from "../../db/schema/system";
import { assertPermission, rethrowIfHttpError } from "../_utils/permissions";

function toMenuApi(row: typeof menus.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    path: row.path,
    parent_id: row.parentId,
    sort: row.sort,
    status: row.status,
    permission: row.permission,
    type: row.type,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  try {
    await assertPermission(event, "system:menus");

    switch (method) {
      case "GET": {
        const query = getQuery(event);
        const conditions = [];

        if (query.search && typeof query.search === "string") {
          conditions.push(
            or(
              ilike(menus.name, `%${query.search}%`),
              ilike(menus.path, `%${query.search}%`)
            )!
          );
        }
        if (
          query.status &&
          typeof query.status === "string" &&
          query.status !== "all"
        ) {
          conditions.push(eq(menus.status, query.status));
        }
        if (
          query.type &&
          typeof query.type === "string" &&
          query.type !== "all"
        ) {
          conditions.push(eq(menus.type, query.type));
        }

        const rows = await db
          .select()
          .from(menus)
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(asc(menus.sort), asc(menus.createdAt));

        return { code: 0, message: "获取成功", data: rows.map(toMenuApi) };
      }

      case "POST": {
        const body = await readBody(event);
        if (!(body?.name && body?.type)) {
          throw createError({
            statusCode: 400,
            statusMessage: "菜单名称和类型不能为空",
          });
        }

        const parentId =
          !body.parent_id || body.parent_id === "0" ? null : body.parent_id;

        const [created] = await db
          .insert(menus)
          .values({
            name: body.name,
            icon: body.icon || null,
            path: body.path || null,
            parentId,
            sort: body.sort ?? 0,
            status: body.status || "active",
            permission: body.permission || null,
            type: body.type,
          })
          .returning();

        return { code: 0, message: "创建成功", data: toMenuApi(created) };
      }

      case "PUT": {
        const body = await readBody(event);
        if (!body?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "菜单 ID 不能为空",
          });
        }

        const patch: Record<string, unknown> = { updatedAt: new Date() };
        for (const key of [
          "name",
          "icon",
          "path",
          "sort",
          "status",
          "permission",
          "type",
        ] as const) {
          if (body[key] !== undefined) {
            patch[key] = body[key];
          }
        }
        if (body.parent_id !== undefined) {
          patch.parentId =
            !body.parent_id || body.parent_id === "0" ? null : body.parent_id;
        }

        const [updated] = await db
          .update(menus)
          .set(patch as any)
          .where(eq(menus.id, body.id))
          .returning();

        return { code: 0, message: "更新成功", data: toMenuApi(updated) };
      }

      case "DELETE": {
        const body = await readBody(event);
        if (!body?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "菜单 ID 不能为空",
          });
        }
        await db.delete(menus).where(eq(menus.id, body.id));
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
    return { code: -1, message, data: null };
  }
});
