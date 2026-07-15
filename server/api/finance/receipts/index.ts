import { serverSupabaseServiceRole } from "#supabase/server";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

async function bumpReceivable(
  supabase: ReturnType<typeof serverSupabaseServiceRole>,
  receivableId: string,
  amount: number
) {
  const { data: rec, error } = await supabase
    .from("finance_receivables")
    .select("id, amount, paid_amount")
    .eq("id", receivableId)
    .single();
  if (error || !rec) {
    throw (
      error || createError({ statusCode: 404, statusMessage: "应收不存在" })
    );
  }
  const paid = Number(rec.paid_amount || 0) + amount;
  const total = Number(rec.amount || 0);
  let status = "open";
  if (paid <= 0) {
    status = "open";
  } else if (paid >= total) {
    status = "paid";
  } else {
    status = "partial";
  }
  await supabase
    .from("finance_receivables")
    .update({
      paid_amount: paid,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", receivableId);
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "receipt:view");

    if (method === "GET") {
      const { data, error } = await supabase
        .from("finance_receipts")
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
      const amount = Number(body.amount) || 0;
      const { data, error } = await supabase
        .from("finance_receipts")
        .insert([
          {
            receipt_no: body.receipt_no || generateOrderNo("RC"),
            customer_id: body.customer_id,
            receivable_id: body.receivable_id || null,
            amount,
            receipt_date:
              body.receipt_date || new Date().toISOString().slice(0, 10),
            method: body.method || "transfer",
            remark: body.remark || null,
          },
        ])
        .select("*, customers(id, code, name)")
        .single();
      if (error) {
        throw error;
      }
      if (body.receivable_id) {
        await bumpReceivable(supabase, body.receivable_id, amount);
      }
      return { code: 0, message: "创建成功", data };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      const { data: receipt } = await supabase
        .from("finance_receipts")
        .select("*")
        .eq("id", body.id)
        .single();
      const { error } = await supabase
        .from("finance_receipts")
        .delete()
        .eq("id", body.id);
      if (error) {
        throw error;
      }
      if (receipt?.receivable_id) {
        await bumpReceivable(
          supabase,
          receipt.receivable_id,
          -Number(receipt.amount || 0)
        );
      }
      return { code: 0, message: "删除成功" };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
