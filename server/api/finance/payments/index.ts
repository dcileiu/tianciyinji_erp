import { serverSupabaseServiceRole } from "#supabase/server";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

async function bumpPayable(
  supabase: ReturnType<typeof serverSupabaseServiceRole>,
  payableId: string,
  amount: number
) {
  const { data: row, error } = await supabase
    .from("finance_payables")
    .select("id, amount, paid_amount")
    .eq("id", payableId)
    .single();
  if (error || !row) {
    throw (
      error || createError({ statusCode: 404, statusMessage: "应付不存在" })
    );
  }
  const paid = Number(row.paid_amount || 0) + amount;
  const total = Number(row.amount || 0);
  let status = "open";
  if (paid <= 0) {
    status = "open";
  } else if (paid >= total) {
    status = "paid";
  } else {
    status = "partial";
  }
  await supabase
    .from("finance_payables")
    .update({
      paid_amount: paid,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payableId);
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "payment:view");

    if (method === "GET") {
      const { data, error } = await supabase
        .from("finance_payments")
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
      const amount = Number(body.amount) || 0;
      const { data, error } = await supabase
        .from("finance_payments")
        .insert([
          {
            payment_no: body.payment_no || generateOrderNo("PM"),
            supplier_id: body.supplier_id,
            payable_id: body.payable_id || null,
            amount,
            payment_date:
              body.payment_date || new Date().toISOString().slice(0, 10),
            method: body.method || "transfer",
            remark: body.remark || null,
          },
        ])
        .select("*, suppliers(id, code, name)")
        .single();
      if (error) {
        throw error;
      }
      if (body.payable_id) {
        await bumpPayable(supabase, body.payable_id, amount);
      }
      return { code: 0, message: "创建成功", data };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      const { data: payment } = await supabase
        .from("finance_payments")
        .select("*")
        .eq("id", body.id)
        .single();
      const { error } = await supabase
        .from("finance_payments")
        .delete()
        .eq("id", body.id);
      if (error) {
        throw error;
      }
      if (payment?.payable_id) {
        await bumpPayable(
          supabase,
          payment.payable_id,
          -Number(payment.amount || 0)
        );
      }
      return { code: 0, message: "删除成功" };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
