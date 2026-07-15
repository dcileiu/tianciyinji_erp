import { serverSupabaseServiceRole } from "#supabase/server";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

function groupByStatus(rows: Array<{ status?: string }>) {
  const map: Record<string, number> = {};
  for (const row of rows) {
    const status = row.status || "unknown";
    map[status] = (map[status] || 0) + 1;
  }
  return map;
}

export default defineEventHandler(async (event) => {
  try {
    await assertPermission(event, "reports:production");
    const supabase = serverSupabaseServiceRole(event);
    const [plans, orders, workshops] = await Promise.all([
      supabase.from("production_plans").select("id, status, quantity"),
      supabase.from("production_orders").select("id, status, quantity"),
      supabase
        .from("workshops")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

    if (plans.error) {
      throw plans.error;
    }
    if (orders.error) {
      throw orders.error;
    }

    return {
      code: 0,
      message: "ok",
      data: {
        workshopCount: workshops.count || 0,
        plansByStatus: groupByStatus(plans.data || []),
        ordersByStatus: groupByStatus(orders.data || []),
        planCount: (plans.data || []).length,
        orderCount: (orders.data || []).length,
      },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
