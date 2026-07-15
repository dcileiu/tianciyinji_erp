import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";
import { assertPermission } from "../_utils/permissions";

/**
 * 仅开发环境可用的 RBAC 调试接口。
 * 生产环境返回 404；开发环境需 system:roles 权限。
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  await assertPermission(event, "system:roles");

  const supabase = serverSupabaseServiceRole(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "未认证" });
  }

  const { data: userRoles, error: userRolesError } = await supabase
    .from("users_role")
    .select("*")
    .eq("user_id", user.id);

  const { data: allRoles, error: rolesError } = await supabase
    .from("roles")
    .select("id, name, code, status, is_system, created_at");

  const { data: roleMenus, error: roleMenusError } = await supabase
    .from("roles_menu")
    .select("role_id, menu_id");

  const { data: allMenus, error: menusError } = await supabase
    .from("menus")
    .select("id, name, permission, path, type, status, parent_id")
    .eq("status", "active");

  const { data: directQuery, error: directError } = await supabase
    .from("menus")
    .select(`
        id, name, permission,
        roles_menu!inner(
          role_id,
          roles!inner(
            id, name, status,
            users_role!inner(user_id)
          )
        )
      `)
    .eq("roles_menu.roles.users_role.user_id", user.id)
    .eq("status", "active");

  return {
    userId: user.id,
    userRoles: { data: userRoles, error: userRolesError },
    allRoles: { data: allRoles, error: rolesError },
    roleMenus: { data: roleMenus, error: roleMenusError },
    allMenus: { data: allMenus, error: menusError },
    directQuery: { data: directQuery, error: directError },
  };
});
