import { and, eq, inArray, isNotNull } from "drizzle-orm";
import type { H3Event } from "h3";
import { db } from "../../db";
import { menus, roles, rolesMenu, usersRole } from "../../db/schema/system";
import { requireUser } from "../../utils/auth";

/** roles.status 兼容历史数字与当前字符串 */
export function isRoleActive(status: unknown): boolean {
  return status === "active" || status === 1 || status === "1";
}

export const RESERVED_ROLE_CODES = ["super_admin"] as const;

/**
 * 若为 H3/HTTP 错误则原样抛出（避免被 catch 成 HTTP 200）
 */
export function rethrowIfHttpError(error: unknown): void {
  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    typeof (error as { statusCode: unknown }).statusCode === "number"
  ) {
    throw error;
  }
}

export async function getUserRoleRows(userId: string) {
  return db
    .select({
      code: roles.code,
      status: roles.status,
      id: roles.id,
      name: roles.name,
      description: roles.description,
    })
    .from(usersRole)
    .innerJoin(roles, eq(usersRole.roleId, roles.id))
    .where(eq(usersRole.userId, userId));
}

export async function isSuperAdminUser(userId: string): Promise<boolean> {
  const roleRows = await getUserRoleRows(userId);
  return roleRows.some(
    (role) => role.code === "super_admin" && isRoleActive(role.status)
  );
}

export async function getUserPermissionCodes(
  userId: string
): Promise<string[]> {
  if (await isSuperAdminUser(userId)) {
    const all = await db
      .select({ permission: menus.permission })
      .from(menus)
      .where(and(eq(menus.status, "active"), isNotNull(menus.permission)));
    return [
      ...new Set(
        all.map((row) => row.permission).filter((p): p is string => Boolean(p))
      ),
    ];
  }

  const rows = await db
    .select({ permission: menus.permission })
    .from(menus)
    .innerJoin(rolesMenu, eq(rolesMenu.menuId, menus.id))
    .innerJoin(roles, eq(roles.id, rolesMenu.roleId))
    .innerJoin(usersRole, eq(usersRole.roleId, roles.id))
    .where(
      and(
        eq(usersRole.userId, userId),
        eq(roles.status, "active"),
        eq(menus.status, "active"),
        isNotNull(menus.permission)
      )
    );

  return [
    ...new Set(
      rows.map((row) => row.permission).filter((p): p is string => Boolean(p))
    ),
  ];
}

export async function getUserMenuRows(userId: string) {
  if (await isSuperAdminUser(userId)) {
    return db
      .select({
        id: menus.id,
        name: menus.name,
        icon: menus.icon,
        path: menus.path,
        parent_id: menus.parentId,
        sort: menus.sort,
        permission: menus.permission,
        type: menus.type,
      })
      .from(menus)
      .where(
        and(
          eq(menus.status, "active"),
          inArray(menus.type, ["directory", "menu"])
        )
      )
      .orderBy(menus.sort);
  }

  const rows = await db
    .select({
      id: menus.id,
      name: menus.name,
      icon: menus.icon,
      path: menus.path,
      parent_id: menus.parentId,
      sort: menus.sort,
      permission: menus.permission,
      type: menus.type,
    })
    .from(menus)
    .innerJoin(rolesMenu, eq(rolesMenu.menuId, menus.id))
    .innerJoin(roles, eq(roles.id, rolesMenu.roleId))
    .innerJoin(usersRole, eq(usersRole.roleId, roles.id))
    .where(
      and(
        eq(usersRole.userId, userId),
        eq(roles.status, "active"),
        eq(menus.status, "active"),
        inArray(menus.type, ["directory", "menu"])
      )
    )
    .orderBy(menus.sort);

  const unique = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    unique.set(row.id, row);
  }
  return [...unique.values()].sort((a, b) => a.sort - b.sort);
}

/**
 * 检查当前请求用户是否拥有指定权限
 * - 未登录 -> 401
 * - 已登录但无权限 -> 403
 */
export async function assertPermission(
  event: H3Event,
  requiredPermission: string
) {
  const user = await requireUser(event);

  if (await isSuperAdminUser(user.id)) {
    return true;
  }

  const permissions = await getUserPermissionCodes(user.id);
  if (!permissions.includes(requiredPermission)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  return true;
}

export function ok<T>(data: T, message = "ok") {
  return { code: 0, message, data };
}
