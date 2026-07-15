import { serverSupabaseServiceRole } from "#supabase/server";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "finance:receivables");

    if (method === "GET") {
      const { data, error } = await supabase
        .from("finance_receivables")
        .select("*, customers(id, code, name)")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return { code: 0, message: "获取成功", data: data || [] };
    }

    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.customer_id) {
        throw createError({ statusCode: 400, statusMessage: "客户不能为空" });
      }
      const { data, error } = await supabase
        .from("finance_receivables")
        .insert([
          {
            doc_no: body.doc_no || generateOrderNo("AR"),
            customer_id: body.customer_id,
            sales_order_id: body.sales_order_id || null,
            amount: body.amount || 0,
            paid_amount: body.paid_amount || 0,
            due_date: body.due_date || null,
            status: body.status || "open",
            remark: body.remark || null,
          },
        ])
        .select("*, customers(id, code, name)")
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
        "customer_id",
        "sales_order_id",
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
        .from("finance_receivables")
        .update(payload)
        .eq("id", body.id)
        .select("*, customers(id, code, name)")
        .single();
      if (error) {
        throw error;
      }
      return { code: 0, message: "更新成功", data };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      const { error } = await supabase
        .from("finance_receivables")
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
