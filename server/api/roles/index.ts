import { serverSupabaseServiceRole } from "#supabase/server";
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

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    switch (method) {
      case "GET": {
        await assertPermission(event, "system:roles");
        const { data: roles, error: fetchError } = await supabase
          .from("roles")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        return {
          code: 0,
          message: "获取成功",
          data: roles || [],
        };
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

        const { data: newRole, error: insertError } = await supabase
          .from("roles")
          .insert([
            {
              name: createData.name,
              code,
              description: createData.description || "",
              status: normalizeRoleStatus(createData.status),
              is_system: false,
            },
          ])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return {
          code: 0,
          message: "创建成功",
          data: newRole,
        };
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

        const { data: existing, error: existingError } = await supabase
          .from("roles")
          .select("id, code, is_system")
          .eq("id", updateData.id)
          .single();

        if (existingError || !existing) {
          throw createError({
            statusCode: 404,
            statusMessage: "角色不存在",
          });
        }

        const nextCode =
          updateData.code === undefined
            ? existing.code
            : String(updateData.code).trim();

        if (
          existing.is_system ||
          RESERVED_ROLE_CODES.includes(
            existing.code as (typeof RESERVED_ROLE_CODES)[number]
          )
        ) {
          // 系统角色：仅允许改名称/描述/状态，禁止改 code / is_system
          const { data: updatedRole, error: updateError } = await supabase
            .from("roles")
            .update({
              name: updateData.name ?? undefined,
              description: updateData.description ?? undefined,
              status:
                updateData.status === undefined
                  ? undefined
                  : normalizeRoleStatus(updateData.status),
              updated_at: new Date().toISOString(),
            })
            .eq("id", updateData.id)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          return {
            code: 0,
            message: "更新成功",
            data: updatedRole,
          };
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

        const { data: updatedRole, error: updateError } = await supabase
          .from("roles")
          .update({
            name: updateData.name,
            code: nextCode,
            description: updateData.description,
            status: normalizeRoleStatus(updateData.status),
            updated_at: new Date().toISOString(),
          })
          .eq("id", updateData.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return {
          code: 0,
          message: "更新成功",
          data: updatedRole,
        };
      }

      case "DELETE": {
        await assertPermission(event, "system:roles");
        const deleteData = await readBody(event);

        const { data: existing, error: existingError } = await supabase
          .from("roles")
          .select("id, code, is_system")
          .eq("id", deleteData.id)
          .single();

        if (existingError || !existing) {
          throw createError({
            statusCode: 404,
            statusMessage: "角色不存在",
          });
        }

        if (
          existing.is_system ||
          RESERVED_ROLE_CODES.includes(
            existing.code as (typeof RESERVED_ROLE_CODES)[number]
          )
        ) {
          throw createError({
            statusCode: 400,
            statusMessage: "系统角色不可删除",
          });
        }

        const { data: userRoles, error: checkError } = await supabase
          .from("users_role")
          .select("user_id")
          .eq("role_id", deleteData.id)
          .limit(1);

        if (checkError) {
          throw checkError;
        }

        if (userRoles && userRoles.length > 0) {
          return {
            code: -1,
            message: "该角色已被用户使用，无法删除",
          };
        }

        const { error: deleteError } = await supabase
          .from("roles")
          .delete()
          .eq("id", deleteData.id);

        if (deleteError) {
          throw deleteError;
        }

        return {
          code: 0,
          message: "删除成功",
        };
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
    return {
      code: -1,
      message,
    };
  }
});
