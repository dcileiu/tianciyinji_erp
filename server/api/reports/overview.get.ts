import { count } from "drizzle-orm";
import { db } from "../../db";
import {
  customers,
  inventoryStocks,
  products,
  purchaseOrders,
  salesOrders,
} from "../../db/schema/master";
import { financePayables, financeReceivables } from "../../db/schema/ops";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  try {
    await assertPermission(event, "reports:view");

    const [
      productCount,
      customerCount,
      sales,
      purchase,
      stockCount,
      receivables,
      payables,
    ] = await Promise.all([
      db.select({ value: count() }).from(products),
      db.select({ value: count() }).from(customers),
      db
        .select({
          totalAmount: salesOrders.totalAmount,
          status: salesOrders.status,
        })
        .from(salesOrders),
      db
        .select({
          totalAmount: purchaseOrders.totalAmount,
          status: purchaseOrders.status,
        })
        .from(purchaseOrders),
      db.select({ value: count() }).from(inventoryStocks),
      db
        .select({
          amount: financeReceivables.amount,
          paidAmount: financeReceivables.paidAmount,
          status: financeReceivables.status,
        })
        .from(financeReceivables),
      db
        .select({
          amount: financePayables.amount,
          paidAmount: financePayables.paidAmount,
          status: financePayables.status,
        })
        .from(financePayables),
    ]);

    const salesTotal = sales.reduce(
      (s, r) => s + Number(r.totalAmount || 0),
      0
    );
    const purchaseTotal = purchase.reduce(
      (s, r) => s + Number(r.totalAmount || 0),
      0
    );
    const openReceivable = receivables
      .filter((r) => r.status !== "paid" && r.status !== "cancelled")
      .reduce(
        (s, r) => s + (Number(r.amount || 0) - Number(r.paidAmount || 0)),
        0
      );
    const openPayable = payables
      .filter((r) => r.status !== "paid" && r.status !== "cancelled")
      .reduce(
        (s, r) => s + (Number(r.amount || 0) - Number(r.paidAmount || 0)),
        0
      );

    return {
      code: 0,
      message: "获取成功",
      data: {
        products: productCount[0]?.value || 0,
        customers: customerCount[0]?.value || 0,
        sales_order_amount: salesTotal,
        purchase_order_amount: purchaseTotal,
        inventory_skus: stockCount[0]?.value || 0,
        open_receivable: openReceivable,
        open_payable: openPayable,
      },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
