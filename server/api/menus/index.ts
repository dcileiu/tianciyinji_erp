import { serverSupabaseServiceRole } from "#supabase/server";
import { assertPermission, rethrowIfHttpError } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "system:menus");

    switch (method) {
      case "GET": {
        const query = getQuery(event);
        let dbQuery = supabase
          .from("menus")
          .select("*")
          .order("sort", { ascending: true })
          .order("created_at", { ascending: true });

        if (query.search && typeof query.search === "string") {
          dbQuery = dbQuery.or(
            `name.ilike.%${query.search}%,path.ilike.%${query.search}%`
          );
        }

        if (
          query.status &&
          typeof query.status === "string" &&
          query.status !== "all"
        ) {
          dbQuery = dbQuery.eq("status", query.status);
        }

        if (
          query.type &&
          typeof query.type === "string" &&
          query.type !== "all"
        ) {
          dbQuery = dbQuery.eq("type", query.type);
        }

        const { data, error } = await dbQuery;
        if (error) {
          throw error;
        }

        return {
          code: 0,
          message: "获取成功",
          data: data || [],
        };
      }

      case "POST": {
        const body = await readBody(event);
        if (!(body?.name && body?.type)) {
          throw createError({
            statusCode: 400,
            statusMessage: "菜单名称和类型不能为空",
          });
        }

        const { data, error } = await supabase
          .from("menus")
          .insert([
            {
              name: body.name,
              icon: body.icon || null,
              path: body.path || null,
              parent_id: body.parent_id || "0",
              sort: body.sort ?? 0,
              status: body.status || "active",
              permission: body.permission || null,
              type: body.type,
            },
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        return { code: 0, message: "创建成功", data };
      }

      case "PUT": {
        const body = await readBody(event);
        if (!body?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "菜单 ID 不能为空",
          });
        }

        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        for (const key of [
          "name",
          "icon",
          "path",
          "parent_id",
          "sort",
          "status",
          "permission",
          "type",
        ] as const) {
          if (body[key] !== undefined) {
            updatePayload[key] = body[key];
          }
        }

        if (updatePayload.parent_id === undefined && body.parent_id === null) {
          updatePayload.parent_id = "0";
        }

        const { data, error } = await supabase
          .from("menus")
          .update(updatePayload)
          .eq("id", body.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return { code: 0, message: "更新成功", data };
      }

      case "DELETE": {
        const body = await readBody(event);
        const ids: string[] = Array.isArray(body?.ids)
          ? body.ids
          : body?.id
            ? [body.id]
            : [];

        if (ids.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: "菜单 ID 不能为空",
          });
        }

        const { data: children, error: childError } = await supabase
          .from("menus")
          .select("id")
          .in("parent_id", ids)
          .limit(1);

        if (childError) {
          throw childError;
        }

        if (children && children.length > 0) {
          return {
            code: -1,
            message: "无法删除有子菜单的菜单，请先删除子菜单",
          };
        }

        const { error } = await supabase.from("menus").delete().in("id", ids);

        if (error) {
          throw error;
        }

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
    return {
      code: -1,
      message,
      data: null,
    };
  }
});
