import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "../../../db";
import {
  products,
  purchaseOrderItems,
  purchaseOrders,
  suppliers,
  warehouses,
} from "../../../db/schema/master";
import type { OrderItemInput } from "../../_utils/crud";
import {
  computeOrderItems,
  generateOrderNo,
  handleApiError,
} from "../../_utils/crud";
import {
  shouldApplyInventory,
  syncOrderInventoryOnStatusChange,
} from "../../_utils/inventory";
import { assertPermission } from "../../_utils/permissions";

const PERMISSION = "purchase-order:view";
const ORDER_NO_PREFIX = "PO";
const ORDER_STATUSES = [
  "draft",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;

function normalizeOrderStatus(
  status: unknown
): (typeof ORDER_STATUSES)[number] {
  if (
    typeof status === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(status)
  ) {
    return status as (typeof ORDER_STATUSES)[number];
  }
  return "draft";
}

function toOrderApi(row: typeof purchaseOrders.$inferSelect) {
  return {
    id: row.id,
    order_no: row.orderNo,
    supplier_id: row.supplierId,
    warehouse_id: row.warehouseId,
    status: row.status,
    order_date: row.orderDate,
    total_amount: row.totalAmount,
    inventory_applied: row.inventoryApplied,
    remark: row.remark,
    created_by: row.createdBy,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  try {
    await assertPermission(event, PERMISSION);

    switch (method) {
      case "GET": {
        const query = getQuery(event);

        if (query.id && typeof query.id === "string") {
          const [order] = await db
            .select({
              order: purchaseOrders,
              customer: {
                id: suppliers.id,
                code: suppliers.code,
                name: suppliers.name,
              },
              warehouse: {
                id: warehouses.id,
                code: warehouses.code,
                name: warehouses.name,
              },
            })
            .from(purchaseOrders)
            .leftJoin(suppliers, eq(suppliers.id, purchaseOrders.supplierId))
            .leftJoin(warehouses, eq(warehouses.id, purchaseOrders.warehouseId))
            .where(eq(purchaseOrders.id, query.id))
            .limit(1);

          if (!order) {
            throw createError({ statusCode: 404, statusMessage: "订单不存在" });
          }

          const items = await db
            .select({
              item: purchaseOrderItems,
              product: {
                id: products.id,
                code: products.code,
                name: products.name,
                unit: products.unit,
              },
            })
            .from(purchaseOrderItems)
            .leftJoin(products, eq(products.id, purchaseOrderItems.productId))
            .where(eq(purchaseOrderItems.orderId, query.id));

          return {
            code: 0,
            message: "获取成功",
            data: {
              ...toOrderApi(order.order),
              suppliers: order.customer,
              warehouses: order.warehouse,
              items: items.map((row) => ({
                id: row.item.id,
                order_id: row.item.orderId,
                product_id: row.item.productId,
                quantity: row.item.quantity,
                unit_price: row.item.unitPrice,
                amount: row.item.amount,
                products: row.product,
              })),
            },
          };
        }

        const conditions = [];
        if (query.search && typeof query.search === "string") {
          conditions.push(ilike(purchaseOrders.orderNo, `%${query.search}%`));
        }
        if (
          query.status &&
          typeof query.status === "string" &&
          query.status !== "all"
        ) {
          conditions.push(eq(purchaseOrders.status, query.status));
        }

        const rows = await db
          .select({
            order: purchaseOrders,
            customer: {
              id: suppliers.id,
              code: suppliers.code,
              name: suppliers.name,
            },
            warehouse: {
              id: warehouses.id,
              code: warehouses.code,
              name: warehouses.name,
            },
          })
          .from(purchaseOrders)
          .leftJoin(suppliers, eq(suppliers.id, purchaseOrders.supplierId))
          .leftJoin(warehouses, eq(warehouses.id, purchaseOrders.warehouseId))
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(desc(purchaseOrders.createdAt));

        return {
          code: 0,
          message: "获取成功",
          data: rows.map((row) => ({
            ...toOrderApi(row.order),
            suppliers: row.customer,
            warehouses: row.warehouse,
          })),
        };
      }

      case "POST": {
        const body = await readBody(event);
        const supplierId = body?.supplier_id;
        const rawItems: OrderItemInput[] = Array.isArray(body?.items)
          ? body.items
          : [];
        const status = normalizeOrderStatus(body.status);
        const warehouseId = body.warehouse_id || null;

        if (!supplierId) {
          throw createError({
            statusCode: 400,
            statusMessage: "供应商不能为空",
          });
        }
        if (rawItems.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: "订单明细不能为空",
          });
        }
        if (shouldApplyInventory(status) && !warehouseId) {
          throw createError({
            statusCode: 400,
            statusMessage: "确认/完成订单前必须选择入库仓库",
          });
        }

        const { items, totalAmount } = computeOrderItems(rawItems);
        const willApplyInventory = shouldApplyInventory(status);

        if (willApplyInventory) {
          await syncOrderInventoryOnStatusChange({
            direction: "in",
            previousStatus: "draft",
            nextStatus: status,
            inventoryApplied: false,
            warehouseId,
            items: items.map((i) => ({
              product_id: i.product_id,
              quantity: i.quantity,
            })),
          });
        }

        try {
          const [order] = await db
            .insert(purchaseOrders)
            .values({
              orderNo: generateOrderNo(ORDER_NO_PREFIX),
              supplierId,
              warehouseId,
              status,
              orderDate:
                body.order_date || new Date().toISOString().slice(0, 10),
              totalAmount: String(totalAmount),
              remark: body.remark ?? null,
              createdBy: body.created_by ?? null,
              inventoryApplied: willApplyInventory,
            })
            .returning();

          const insertedItems = await db
            .insert(purchaseOrderItems)
            .values(
              items.map((item) => ({
                orderId: order.id,
                productId: item.product_id,
                quantity: String(item.quantity),
                unitPrice: String(item.unit_price),
                amount: String(item.amount),
              }))
            )
            .returning();

          return {
            code: 0,
            message: "创建成功",
            data: {
              ...toOrderApi(order),
              items: insertedItems.map((item) => ({
                id: item.id,
                order_id: item.orderId,
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                amount: item.amount,
              })),
            },
          };
        } catch (error) {
          if (willApplyInventory) {
            await syncOrderInventoryOnStatusChange({
              direction: "in",
              previousStatus: status,
              nextStatus: "cancelled",
              inventoryApplied: true,
              warehouseId: String(warehouseId),
              items: items.map((i) => ({
                product_id: i.product_id,
                quantity: i.quantity,
              })),
            });
          }
          throw error;
        }
      }

      case "PUT": {
        const body = await readBody(event);
        if (!body?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "订单 ID 不能为空",
          });
        }

        const [existing] = await db
          .select()
          .from(purchaseOrders)
          .where(eq(purchaseOrders.id, body.id))
          .limit(1);
        if (!existing) {
          throw createError({ statusCode: 404, statusMessage: "订单不存在" });
        }

        const existingItems = await db
          .select({
            product_id: purchaseOrderItems.productId,
            quantity: purchaseOrderItems.quantity,
          })
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.orderId, body.id));

        const patch: Record<string, unknown> = { updatedAt: new Date() };
        if (body.supplier_id !== undefined) {
          patch.supplierId = body.supplier_id;
        }
        if (body.order_date !== undefined) {
          patch.orderDate = body.order_date;
        }
        if (body.remark !== undefined) {
          patch.remark = body.remark;
        }
        if (body.warehouse_id !== undefined) {
          patch.warehouseId = body.warehouse_id;
        }

        const nextStatus =
          body.status === undefined
            ? existing.status
            : normalizeOrderStatus(body.status);
        if (body.status !== undefined) {
          patch.status = nextStatus;
        }

        let nextItems = existingItems.map((i) => ({
          product_id: i.product_id,
          quantity: Number(i.quantity),
        }));

        const rawItems: OrderItemInput[] | undefined = Array.isArray(body.items)
          ? body.items
          : undefined;

        if (rawItems) {
          if (rawItems.length === 0) {
            throw createError({
              statusCode: 400,
              statusMessage: "订单明细不能为空",
            });
          }
          if (existing.inventoryApplied) {
            throw createError({
              statusCode: 400,
              statusMessage: "已入账库存的订单不可修改明细，请先取消后再改",
            });
          }

          const computed = computeOrderItems(rawItems);
          patch.totalAmount = String(computed.totalAmount);
          nextItems = computed.items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          }));

          await db
            .delete(purchaseOrderItems)
            .where(eq(purchaseOrderItems.orderId, body.id));
          await db.insert(purchaseOrderItems).values(
            computed.items.map((item) => ({
              orderId: body.id,
              productId: item.product_id,
              quantity: String(item.quantity),
              unitPrice: String(item.unit_price),
              amount: String(item.amount),
            }))
          );
        }

        const warehouseId =
          (patch.warehouseId as string | null | undefined) ??
          existing.warehouseId;

        const sync = await syncOrderInventoryOnStatusChange({
          direction: "in",
          previousStatus: existing.status,
          nextStatus,
          inventoryApplied: Boolean(existing.inventoryApplied),
          warehouseId,
          items: nextItems,
        });
        patch.inventoryApplied = sync.inventoryApplied;

        const [order] = await db
          .update(purchaseOrders)
          .set(patch as any)
          .where(eq(purchaseOrders.id, body.id))
          .returning();

        const currentItems = await db
          .select({
            item: purchaseOrderItems,
            product: {
              id: products.id,
              code: products.code,
              name: products.name,
              unit: products.unit,
            },
          })
          .from(purchaseOrderItems)
          .leftJoin(products, eq(products.id, purchaseOrderItems.productId))
          .where(eq(purchaseOrderItems.orderId, body.id));

        return {
          code: 0,
          message: "更新成功",
          data: {
            ...toOrderApi(order),
            items: currentItems.map((row) => ({
              id: row.item.id,
              order_id: row.item.orderId,
              product_id: row.item.productId,
              quantity: row.item.quantity,
              unit_price: row.item.unitPrice,
              amount: row.item.amount,
              products: row.product,
            })),
          },
        };
      }

      case "DELETE": {
        const body = await readBody(event);
        if (!body?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "订单 ID 不能为空",
          });
        }

        const [existing] = await db
          .select()
          .from(purchaseOrders)
          .where(eq(purchaseOrders.id, body.id))
          .limit(1);
        const items = await db
          .select({
            product_id: purchaseOrderItems.productId,
            quantity: purchaseOrderItems.quantity,
          })
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.orderId, body.id));

        if (existing?.inventoryApplied) {
          await syncOrderInventoryOnStatusChange({
            direction: "in",
            previousStatus: existing.status,
            nextStatus: "cancelled",
            inventoryApplied: true,
            warehouseId: existing.warehouseId,
            items: items.map((i) => ({
              product_id: i.product_id,
              quantity: Number(i.quantity),
            })),
          });
        }

        await db.delete(purchaseOrders).where(eq(purchaseOrders.id, body.id));
        return { code: 0, message: "删除成功" };
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
