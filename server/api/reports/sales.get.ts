import { db } from "../../db";
import { salesOrders } from "../../db/schema/master";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  try {
    await assertPermission(event, "reports:sales");
    const rows = await db
      .select({
        totalAmount: salesOrders.totalAmount,
        status: salesOrders.status,
        orderDate: salesOrders.orderDate,
      })
      .from(salesOrders);
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      const amount = Number(row.totalAmount || 0);
      total += amount;
      byStatus[row.status] = (byStatus[row.status] || 0) + amount;
    }
    return {
      code: 0,
      message: "获取成功",
      data: { total, by_status: byStatus, count: rows.length },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
