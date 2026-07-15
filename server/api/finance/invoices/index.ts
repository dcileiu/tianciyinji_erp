import { serverSupabaseServiceRole } from "#supabase/server";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "invoice:view");

    if (method === "GET") {
      const { data, error } = await supabase
        .from("finance_invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }
      return { code: 0, message: "获取成功", data: data || [] };
    }

    if (method === "POST") {
      const body = await readBody(event);
      if (!(body?.direction && body?.party_id)) {
        throw createError({
          statusCode: 400,
          statusMessage: "方向与往来方不能为空",
        });
      }
      const { data, error } = await supabase
        .from("finance_invoices")
        .insert([
          {
            invoice_no: body.invoice_no || generateOrderNo("INV"),
            direction: body.direction,
            party_id: body.party_id,
            amount: body.amount || 0,
            invoice_date:
              body.invoice_date || new Date().toISOString().slice(0, 10),
            status: body.status || "issued",
            remark: body.remark || null,
          },
        ])
        .select()
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
        "direction",
        "party_id",
        "amount",
        "invoice_date",
        "status",
        "remark",
      ]) {
        if (body[key] !== undefined) {
          payload[key] = body[key];
        }
      }
      const { data, error } = await supabase
        .from("finance_invoices")
        .update(payload)
        .eq("id", body.id)
        .select()
        .single();
      if (error) {
        throw error;
      }
      return { code: 0, message: "更新成功", data };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      const { error } = await supabase
        .from("finance_invoices")
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
