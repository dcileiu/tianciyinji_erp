import { serverSupabaseServiceRole } from "#supabase/server";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  try {
    await assertPermission(event, "reports:view");
    const supabase = serverSupabaseServiceRole(event);

    const [
      products,
      customers,
      sales,
      purchase,
      stocks,
      receivables,
      payables,
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("sales_orders").select("total_amount, status"),
      supabase.from("purchase_orders").select("total_amount, status"),
      supabase
        .from("inventory_stocks")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("finance_receivables")
        .select("amount, paid_amount, status"),
      supabase.from("finance_payables").select("amount, paid_amount, status"),
    ]);

    const salesTotal = (sales.data || []).reduce(
      (s, r) => s + Number(r.total_amount || 0),
      0
    );
    const purchaseTotal = (purchase.data || []).reduce(
      (s, r) => s + Number(r.total_amount || 0),
      0
    );
    const openReceivable = (receivables.data || [])
      .filter((r) => r.status !== "paid" && r.status !== "cancelled")
      .reduce(
        (s, r) => s + (Number(r.amount || 0) - Number(r.paid_amount || 0)),
        0
      );
    const openPayable = (payables.data || [])
      .filter((r) => r.status !== "paid" && r.status !== "cancelled")
      .reduce(
        (s, r) => s + (Number(r.amount || 0) - Number(r.paid_amount || 0)),
        0
      );

    return {
      code: 0,
      message: "ok",
      data: {
        productCount: products.count || 0,
        customerCount: customers.count || 0,
        salesOrderCount: (sales.data || []).length,
        salesAmount: Math.round(salesTotal * 100) / 100,
        purchaseOrderCount: (purchase.data || []).length,
        purchaseAmount: Math.round(purchaseTotal * 100) / 100,
        inventorySkuCount: stocks.count || 0,
        openReceivable: Math.round(openReceivable * 100) / 100,
        openPayable: Math.round(openPayable * 100) / 100,
      },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
