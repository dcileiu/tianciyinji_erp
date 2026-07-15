import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { inventoryStocks, products, warehouses } from "../../db/schema/master";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

const PERMISSION = "warehouse:inventory";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  try {
    await assertPermission(event, PERMISSION);

    switch (method) {
      case "GET": {
        const query = getQuery(event);
        const conditions = [];

        if (query.warehouse_id && typeof query.warehouse_id === "string") {
          conditions.push(eq(inventoryStocks.warehouseId, query.warehouse_id));
        }
        if (query.product_id && typeof query.product_id === "string") {
          conditions.push(eq(inventoryStocks.productId, query.product_id));
        }
        if (query.search && typeof query.search === "string") {
          conditions.push(
            or(
              ilike(products.name, `%${query.search}%`),
              ilike(products.code, `%${query.search}%`)
            )!
          );
        }

        const rows = await db
          .select({
            id: inventoryStocks.id,
            warehouse_id: inventoryStocks.warehouseId,
            product_id: inventoryStocks.productId,
            quantity: inventoryStocks.quantity,
            updated_at: inventoryStocks.updatedAt,
            products: {
              id: products.id,
              code: products.code,
              name: products.name,
              unit: products.unit,
            },
            warehouses: {
              id: warehouses.id,
              code: warehouses.code,
              name: warehouses.name,
            },
          })
          .from(inventoryStocks)
          .innerJoin(products, eq(products.id, inventoryStocks.productId))
          .innerJoin(warehouses, eq(warehouses.id, inventoryStocks.warehouseId))
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(desc(inventoryStocks.updatedAt));

        return { code: 0, message: "获取成功", data: rows };
      }

      case "POST": {
        const body = await readBody(event);
        const warehouseId = body?.warehouse_id;
        const productId = body?.product_id;

        if (!(warehouseId && productId)) {
          throw createError({
            statusCode: 400,
            statusMessage: "仓库和产品不能为空",
          });
        }

        const quantity = Number(body.quantity);
        if (Number.isNaN(quantity) || quantity < 0) {
          throw createError({
            statusCode: 400,
            statusMessage: "库存数量必须为非负数字",
          });
        }

        const [existing] = await db
          .select()
          .from(inventoryStocks)
          .where(
            and(
              eq(inventoryStocks.warehouseId, warehouseId),
              eq(inventoryStocks.productId, productId)
            )
          )
          .limit(1);

        let row: typeof inventoryStocks.$inferSelect;
        if (existing) {
          [row] = await db
            .update(inventoryStocks)
            .set({ quantity: String(quantity), updatedAt: new Date() })
            .where(eq(inventoryStocks.id, existing.id))
            .returning();
        } else {
          [row] = await db
            .insert(inventoryStocks)
            .values({
              warehouseId,
              productId,
              quantity: String(quantity),
              updatedAt: new Date(),
            })
            .returning();
        }

        return {
          code: 0,
          message: "保存成功",
          data: {
            id: row.id,
            warehouse_id: row.warehouseId,
            product_id: row.productId,
            quantity: row.quantity,
            updated_at: row.updatedAt,
          },
        };
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: "Method not allowed",
        });
    }
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
