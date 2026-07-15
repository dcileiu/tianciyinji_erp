import { hash } from "bcryptjs";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import type { H3Event } from "h3";
import { db } from "../../db";
import { users } from "../../db/schema/auth";
import { roles, usersRole } from "../../db/schema/system";
import { requireUser } from "../../utils/auth";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  try {
    switch (method) {
      case "GET":
        await assertPermission(event, "system:users");
        return await getUsers(event);
      case "POST":
        await assertPermission(event, "system:users");
        return await createUser(event);
      case "PUT":
        await assertPermission(event, "system:users");
        return await updateUser(event);
      case "DELETE":
        await assertPermission(event, "system:users");
        return await deleteUser(event);
      default:
        throw createError({
          statusCode: 405,
          statusMessage: "Method Not Allowed",
        });
    }
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      typeof (error as { statusCode: unknown }).statusCode === "number"
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "操作失败";
    return { code: -1, message, data: null };
  }
});

async function getUsers(event: H3Event) {
  const query = getQuery(event);
  const {
    page = 1,
    pageSize = 20,
    search,
    role_id,
    department_id,
    status,
  } = query;

  const conditions = [];
  if (search && typeof search === "string") {
    conditions.push(
      or(
        ilike(users.email, `%${search}%`),
        ilike(users.name, `%${search}%`),
        ilike(users.username, `%${search}%`)
      )!
    );
  }
  if (status && typeof status === "string" && status !== "all") {
    conditions.push(eq(users.status, status));
  }
  if (department_id && typeof department_id === "string") {
    conditions.push(eq(users.departmentId, department_id));
  }

  let userRows = await db
    .select()
    .from(users)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(users.createdAt));

  if (role_id && typeof role_id === "string") {
    const linked = await db
      .select({ userId: usersRole.userId })
      .from(usersRole)
      .where(eq(usersRole.roleId, role_id));
    const ids = new Set(linked.map((r) => r.userId));
    userRows = userRows.filter((u) => ids.has(u.id));
  }

  const total = userRows.length;
  const start = (Number(page) - 1) * Number(pageSize);
  const pageRows = userRows.slice(start, start + Number(pageSize));
  const pageIds = pageRows.map((u) => u.id);

  const roleLinks =
    pageIds.length === 0
      ? []
      : await db
          .select({
            userId: usersRole.userId,
            id: roles.id,
            name: roles.name,
            code: roles.code,
          })
          .from(usersRole)
          .innerJoin(roles, eq(roles.id, usersRole.roleId))
          .where(inArray(usersRole.userId, pageIds));

  const rolesByUser = new Map<
    string,
    Array<{ id: string; name: string; code: string }>
  >();
  for (const link of roleLinks) {
    const list = rolesByUser.get(link.userId) || [];
    list.push({ id: link.id, name: link.name, code: link.code });
    rolesByUser.set(link.userId, list);
  }

  return {
    code: 0,
    message: "获取成功",
    total,
    data: pageRows.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      phone: user.phone,
      department_id: user.departmentId,
      status: user.status,
      is_online: user.isOnline,
      login_count: user.loginCount,
      last_sign_in_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      roles: rolesByUser.get(user.id) || [],
    })),
  };
}

async function createUser(event: any) {
  const body = await readBody(event);
  const email = String(body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(body?.password || "");
  const name = String(body?.name || "").trim();
  const username = String(body?.username || "").trim();

  if (!(email && password && name)) {
    throw createError({
      statusCode: 400,
      statusMessage: "邮箱、密码和姓名不能为空",
    });
  }

  const passwordHash = await hash(password, 10);
  const [created] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      username: username || email.split("@")[0],
      phone: body.phone || null,
      departmentId: body.department_id || null,
      status: body.status || "active",
    })
    .returning();

  const roleIds: string[] = Array.isArray(body.role_ids) ? body.role_ids : [];
  if (roleIds.length) {
    await db.insert(usersRole).values(
      roleIds.map((roleId) => ({
        userId: created.id,
        roleId,
      }))
    );
  }

  return {
    code: 0,
    message: "创建成功",
    data: { id: created.id, email: created.email },
  };
}

async function updateUser(event: any) {
  const body = await readBody(event);
  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: "用户 ID 不能为空" });
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  for (const [from, to] of [
    ["name", "name"],
    ["username", "username"],
    ["phone", "phone"],
    ["status", "status"],
  ] as const) {
    if (body[from] !== undefined) {
      patch[to] = body[from];
    }
  }
  if (body.department_id !== undefined) {
    patch.departmentId = body.department_id;
  }
  if (body.password) {
    patch.passwordHash = await hash(String(body.password), 10);
  }

  await db
    .update(users)
    .set(patch as any)
    .where(eq(users.id, body.id));

  if (Array.isArray(body.role_ids)) {
    await db.delete(usersRole).where(eq(usersRole.userId, body.id));
    if (body.role_ids.length) {
      await db.insert(usersRole).values(
        body.role_ids.map((roleId: string) => ({
          userId: body.id,
          roleId,
        }))
      );
    }
  }

  return { code: 0, message: "更新成功", data: true };
}

async function deleteUser(event: any) {
  const body = await readBody(event);
  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: "用户 ID 不能为空" });
  }

  const current = await requireUser(event);
  if (current.id === body.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "不能删除当前登录用户",
    });
  }

  await db.delete(users).where(eq(users.id, body.id));
  return { code: 0, message: "删除成功", data: true };
}
