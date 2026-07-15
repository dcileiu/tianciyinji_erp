import { serverSupabaseServiceRole } from "#supabase/server";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "production-order:view");

    if (method === "GET") {
      const { data, error } = await supabase
        .from("production_orders")
        .select(
          "*, products(id, code, name), workshops(id, code, name), production_plans(id, plan_no)"
        )
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
        .from("production_orders")
        .insert([
          {
            order_no: body.order_no || generateOrderNo("MO"),
            plan_id: body.plan_id || null,
            product_id: body.product_id,
            workshop_id: body.workshop_id || null,
            quantity: body.quantity || 0,
            status: body.status || "pending",
            start_date: body.start_date || null,
            end_date: body.end_date || null,
            remark: body.remark || null,
          },
        ])
        .select(
          "*, products(id, code, name), workshops(id, code, name), production_plans(id, plan_no)"
        )
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
        "plan_id",
        "product_id",
        "workshop_id",
        "quantity",
        "status",
        "start_date",
        "end_date",
        "remark",
      ]) {
        if (body[key] !== undefined) {
          payload[key] = body[key];
        }
      }
      const { data, error } = await supabase
        .from("production_orders")
        .update(payload)
        .eq("id", body.id)
        .select(
          "*, products(id, code, name), workshops(id, code, name), production_plans(id, plan_no)"
        )
        .single();
      if (error) {
        throw error;
      }
      return { code: 0, message: "更新成功", data };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      const { error } = await supabase
        .from("production_orders")
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
