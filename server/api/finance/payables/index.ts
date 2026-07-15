import { serverSupabaseServiceRole } from "#supabase/server";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "finance:payables");

    if (method === "GET") {
      const { data, error } = await supabase
        .from("finance_payables")
        .select("*, suppliers(id, code, name)")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return { code: 0, message: "获取成功", data: data || [] };
    }

    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.supplier_id) {
        throw createError({ statusCode: 400, statusMessage: "供应商不能为空" });
      }
      const { data, error } = await supabase
        .from("finance_payables")
        .insert([
          {
            doc_no: body.doc_no || generateOrderNo("AP"),
            supplier_id: body.supplier_id,
            purchase_order_id: body.purchase_order_id || null,
            amount: body.amount || 0,
            paid_amount: body.paid_amount || 0,
            due_date: body.due_date || null,
            status: body.status || "open",
            remark: body.remark || null,
          },
        ])
        .select("*, suppliers(id, code, name)")
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
        "supplier_id",
        "purchase_order_id",
        "amount",
        "paid_amount",
        "due_date",
        "status",
        "remark",
      ]) {
        if (body[key] !== undefined) {
          payload[key] = body[key];
        }
      }
      const { data, error } = await supabase
        .from("finance_payables")
        .update(payload)
        .eq("id", body.id)
        .select("*, suppliers(id, code, name)")
        .single();
      if (error) {
        throw error;
      }
      return { code: 0, message: "更新成功", data };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      const { error } = await supabase
        .from("finance_payables")
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
