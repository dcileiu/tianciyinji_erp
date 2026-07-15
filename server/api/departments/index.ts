import { asc, eq } from "drizzle-orm";
import type { H3Event } from "h3";
import { db } from "../../db";
import { departments } from "../../db/schema/system";
import { handleApiError, normalizeEntityStatus } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

function toDeptApi(row: typeof departments.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    status: normalizeEntityStatus(row.status),
    parent_id: row.parentId,
    sort: row.sort,
    manager_id: row.managerId,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  try {
    await assertPermission(event, "system:departments");

    switch (method) {
      case "GET":
        return await getDepartments();
      case "POST":
        return await createDepartment(event);
      case "PUT":
        return await updateDepartment(event);
      case "DELETE":
        return await deleteDepartment(event);
      default:
        throw createError({
          statusCode: 405,
          statusMessage: "Method Not Allowed",
        });
    }
  } catch (error: unknown) {
    return handleApiError(error);
  }
});

async function getDepartments() {
  const rows = await db
    .select()
    .from(departments)
    .orderBy(asc(departments.sort));

  return {
    code: 0,
    message: "获取成功",
    data: rows.map(toDeptApi),
  };
}

async function createDepartment(event: H3Event) {
  const body = await readBody(event);
  const { name, code, description, parent_id, manager_id, sort, status } = body;

  if (!(name && code)) {
    throw createError({
      statusCode: 400,
      statusMessage: "部门名称和编码为必填字段",
    });
  }

  const [created] = await db
    .insert(departments)
    .values({
      name,
      code,
      description: description || "",
      parentId: parent_id || null,
      managerId: manager_id || null,
      sort: sort || 0,
      status: normalizeEntityStatus(status),
    })
    .returning();

  return { code: 0, message: "创建成功", data: toDeptApi(created) };
}

async function updateDepartment(event: H3Event) {
  const body = await readBody(event);
  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: "部门 ID 不能为空" });
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) {
    patch.name = body.name;
  }
  if (body.code !== undefined) {
    patch.code = body.code;
  }
  if (body.description !== undefined) {
    patch.description = body.description;
  }
  if (body.parent_id !== undefined) {
    patch.parentId = body.parent_id || null;
  }
  if (body.manager_id !== undefined) {
    patch.managerId = body.manager_id || null;
  }
  if (body.sort !== undefined) {
    patch.sort = body.sort;
  }
  if (body.status !== undefined) {
    patch.status = normalizeEntityStatus(body.status);
  }

  const [updated] = await db
    .update(departments)
    .set(patch as any)
    .where(eq(departments.id, body.id))
    .returning();

  return { code: 0, message: "更新成功", data: toDeptApi(updated) };
}

async function deleteDepartment(event: H3Event) {
  const body = await readBody(event);
  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: "部门 ID 不能为空" });
  }

  await db.delete(departments).where(eq(departments.id, body.id));
  return { code: 0, message: "删除成功" };
}
