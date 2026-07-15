import { eq } from "drizzle-orm";
import { db } from "../../db";
import { inventoryStocks, products, warehouses } from "../../db/schema/master";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  try {
    await assertPermission(event, "reports:inventory");
    const rows = await db
      .select({
        quantity: inventoryStocks.quantity,
        product: { id: products.id, code: products.code, name: products.name },
        warehouse: {
          id: warehouses.id,
          code: warehouses.code,
          name: warehouses.name,
        },
      })
      .from(inventoryStocks)
      .leftJoin(products, eq(products.id, inventoryStocks.productId))
      .leftJoin(warehouses, eq(warehouses.id, inventoryStocks.warehouseId));

    return {
      code: 0,
      message: "获取成功",
      data: {
        lines: rows.length,
        total_qty: rows.reduce((s, r) => s + Number(r.quantity || 0), 0),
        items: rows,
      },
    };
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
