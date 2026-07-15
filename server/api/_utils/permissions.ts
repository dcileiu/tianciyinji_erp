import type { H3Event } from "h3";
import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

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

/**
 * 检查当前请求用户是否拥有指定权限
 * - 未登录 -> 401
 * - 已登录但无权限 -> 403
 */
export async function assertPermission(
  event: H3Event,
  requiredPermission: string
) {
  const supabase = serverSupabaseServiceRole(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "未认证" });
  }

  const { data: roles } = await supabase
    .from("users_role")
    .select("roles!inner(code, status)")
    .eq("user_id", user.id);

  const isSuperAdmin = (roles || []).some((row) => {
    const role = row.roles as unknown as {
      code?: string;
      status?: string | number;
    } | null;
    return role?.code === "super_admin" && isRoleActive(role?.status);
  });

  if (isSuperAdmin) {
    return true;
  }

  const { data: userPerms } = await supabase
    .from("menus")
    .select(
      "permission, roles_menu!inner(roles!inner(users_role!inner(user_id)))"
    )
    .eq("roles_menu.roles.users_role.user_id", user.id)
    .eq("roles_menu.roles.status", "active")
    .eq("status", "active")
    .not("permission", "is", null);

  const has = new Set(
    (userPerms || [])
      .map((p) => p.permission)
      .filter((p): p is string => Boolean(p))
  ).has(requiredPermission);

  if (!has) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  return true;
}

export function ok<T>(data: T, message = "ok") {
  return { code: 0, message, data };
}
