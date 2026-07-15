import { count } from "drizzle-orm";
import { db } from "../../db";
import {
  productionOrders,
  productionPlans,
  workshops,
} from "../../db/schema/ops";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  try {
    await assertPermission(event, "reports:production");
    const [plans, orders, shops] = await Promise.all([
      db.select({ value: count() }).from(productionPlans),
      db.select({ status: productionOrders.status }).from(productionOrders),
      db.select({ value: count() }).from(workshops),
    ]);
    const byStatus: Record<string, number> = {};
    for (const row of orders) {
      byStatus[row.status] = (byStatus[row.status] || 0) + 1;
    }
    return {
      code: 0,
      message: "获取成功",
      data: {
        plans: plans[0]?.value || 0,
        workshops: shops[0]?.value || 0,
        orders_by_status: byStatus,
        orders: orders.length,
      },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
