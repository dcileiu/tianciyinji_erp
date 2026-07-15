import { serverSupabaseServiceRole } from "#supabase/server";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  try {
    await assertPermission(event, "reports:inventory");
    const supabase = serverSupabaseServiceRole(event);
    const { data, error } = await supabase
      .from("inventory_stocks")
      .select(
        "id, quantity, products(id, code, name, unit), warehouses(id, code, name)"
      )
      .order("quantity", { ascending: true });
    if (error) {
      throw error;
    }

    const rows = data || [];
    const lowStock = rows.filter((r) => Number(r.quantity) < 10);

    return {
      code: 0,
      message: "ok",
      data: {
        totalSku: rows.length,
        lowStockCount: lowStock.length,
        lowStock,
        stocks: rows,
      },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
