import { serverSupabaseServiceRole } from "#supabase/server";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  try {
    await assertPermission(event, "reports:sales");
    const supabase = serverSupabaseServiceRole(event);
    const { data, error } = await supabase
      .from("sales_orders")
      .select("id, order_no, status, total_amount, order_date, customers(name)")
      .order("order_date", { ascending: false })
      .limit(50);
    if (error) {
      throw error;
    }

    const byStatus: Record<string, { count: number; amount: number }> = {};
    for (const row of data || []) {
      const status = row.status || "unknown";
      if (!byStatus[status]) {
        byStatus[status] = { count: 0, amount: 0 };
      }
      byStatus[status].count += 1;
      byStatus[status].amount += Number(row.total_amount || 0);
    }

    return {
      code: 0,
      message: "ok",
      data: {
        byStatus,
        recent: data || [],
        totalAmount: (data || []).reduce(
          (s, r) => s + Number(r.total_amount || 0),
          0
        ),
      },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
