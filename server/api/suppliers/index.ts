import { serverSupabaseServiceRole } from "#supabase/server";
import { handleApiError, normalizeEntityStatus } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

const TABLE = "suppliers";
const PERMISSION = "supplier:view";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, PERMISSION);

    switch (method) {
      case "GET": {
        const query = getQuery(event);
        let dbQuery = supabase
          .from(TABLE)
          .select("*")
          .order("created_at", { ascending: false });

        if (query.search && typeof query.search === "string") {
          dbQuery = dbQuery.or(
            `name.ilike.%${query.search}%,code.ilike.%${query.search}%`
          );
        }

        if (
          query.status &&
          typeof query.status === "string" &&
          query.status !== "all"
        ) {
          dbQuery = dbQuery.eq("status", query.status);
        }

        const { data, error } = await dbQuery;
        if (error) {
          throw error;
        }

        return { code: 0, message: "获取成功", data: data || [] };
      }

      case "POST": {
        const body = await readBody(event);
        const code = String(body?.code || "").trim();
        const name = String(body?.name || "").trim();

        if (!(code && name)) {
          throw createError({
            statusCode: 400,
            statusMessage: "供应商编码和名称不能为空",
          });
        }

        const { data, error } = await supabase
          .from(TABLE)
          .insert([
            {
              code,
              name,
              contact_name: body.contact_name ?? null,
              phone: body.phone ?? null,
              email: body.email ?? null,
              address: body.address ?? null,
              status: normalizeEntityStatus(body.status),
              remark: body.remark ?? null,
            },
          ])
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            throw createError({
              statusCode: 400,
              statusMessage: "供应商编码已存在",
            });
          }
          throw error;
        }

        return { code: 0, message: "创建成功", data };
      }

      case "PUT": {
        const body = await readBody(event);
        if (!body?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "供应商 ID 不能为空",
          });
        }

        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        for (const key of [
          "code",
          "name",
          "contact_name",
          "phone",
          "email",
          "address",
          "remark",
        ] as const) {
          if (body[key] !== undefined) {
            updatePayload[key] = body[key];
          }
        }

        if (body.status !== undefined) {
          updatePayload.status = normalizeEntityStatus(body.status);
        }

        const { data, error } = await supabase
          .from(TABLE)
          .update(updatePayload)
          .eq("id", body.id)
          .select()
          .single();

        if (error) {
          if (error.code === "23505") {
            throw createError({
              statusCode: 400,
              statusMessage: "供应商编码已存在",
            });
          }
          throw error;
        }

        return { code: 0, message: "更新成功", data };
      }

      case "DELETE": {
        const body = await readBody(event);
        if (!body?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "供应商 ID 不能为空",
          });
        }

        const { error } = await supabase.from(TABLE).delete().eq("id", body.id);

        if (error) {
          if (error.code === "23503") {
            throw createError({
              statusCode: 400,
              statusMessage: "该供应商已被采购订单引用，无法删除",
            });
          }
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
    return handleApiError(error);
  }
});
