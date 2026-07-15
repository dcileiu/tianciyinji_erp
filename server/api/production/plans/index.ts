import { serverSupabaseServiceRole } from "#supabase/server";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);
  const perm = "production-plan:view";

  try {
    await assertPermission(event, perm);

    if (method === "GET") {
      const { data, error } = await supabase
        .from("production_plans")
        .select("*, products(id, code, name), workshops(id, code, name)")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return { code: 0, message: "获取成功", data: data || [] };
    }

    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.product_id) {
        throw createError({ statusCode: 400, statusMessage: "产品不能为空" });
      }
      const { data, error } = await supabase
        .from("production_plans")
        .insert([
          {
            plan_no: body.plan_no || generateOrderNo("PP"),
            product_id: body.product_id,
            workshop_id: body.workshop_id || null,
            quantity: body.quantity || 0,
            planned_start: body.planned_start || null,
            planned_end: body.planned_end || null,
            status: body.status || "draft",
            remark: body.remark || null,
          },
        ])
        .select("*, products(id, code, name), workshops(id, code, name)")
        .single();
      if (error) {
        throw error;
      }
      return { code: 0, message: "创建成功", data };
    }

    if (method === "PUT") {
      const body = await readBody(event);
      if (!body?.id) {
        throw createError({ statusCode: 400, statusMessage: "ID 不能为空" });
      }
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      for (const key of [
        "product_id",
        "workshop_id",
        "quantity",
        "planned_start",
        "planned_end",
        "status",
        "remark",
      ]) {
        if (body[key] !== undefined) {
          payload[key] = body[key];
        }
      }
      const { data, error } = await supabase
        .from("production_plans")
        .update(payload)
        .eq("id", body.id)
        .select("*, products(id, code, name), workshops(id, code, name)")
        .single();
      if (error) {
        throw error;
      }
      return { code: 0, message: "更新成功", data };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      const { error } = await supabase
        .from("production_plans")
        .delete()
        .eq("id", body.id);
      if (error) {
        throw error;
      }
      return { code: 0, message: "删除成功" };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
