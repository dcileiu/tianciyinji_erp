import { serverSupabaseServiceRole } from "#supabase/server";
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

const ORDER_TABLE = "sales_orders";
const ITEM_TABLE = "sales_order_items";
const PERMISSION = "sales-order:view";
const ORDER_NO_PREFIX = "SO";

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

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, PERMISSION);

    switch (method) {
      case "GET": {
        const query = getQuery(event);

        if (query.id && typeof query.id === "string") {
          const { data: order, error: orderError } = await supabase
            .from(ORDER_TABLE)
            .select("*, customers(id, code, name), warehouses(id, code, name)")
            .eq("id", query.id)
            .single();

          if (orderError) {
            throw orderError;
          }

          const { data: items, error: itemsError } = await supabase
            .from(ITEM_TABLE)
            .select("*, products(id, code, name, unit)")
            .eq("order_id", query.id);

          if (itemsError) {
            throw itemsError;
          }

          return {
            code: 0,
            message: "获取成功",
            data: { ...order, items: items || [] },
          };
        }

        let dbQuery = supabase
          .from(ORDER_TABLE)
          .select("*, customers(id, code, name), warehouses(id, code, name)")
          .order("created_at", { ascending: false });

        if (query.search && typeof query.search === "string") {
          dbQuery = dbQuery.ilike("order_no", `%${query.search}%`);
        }

        if (
          query.status &&
          typeof query.status === "string" &&
          query.status !== "all"
        ) {
          dbQuery = dbQuery.eq("status", query.status);
        }

        const { data, error } = await dbQuery;
        if (error) {
          throw error;
        }

        return { code: 0, message: "获取成功", data: data || [] };
      }

      case "POST": {
        const body = await readBody(event);
        const customerId = body?.customer_id;
        const rawItems: OrderItemInput[] = Array.isArray(body?.items)
          ? body.items
          : [];
        const status = normalizeOrderStatus(body.status);
        const warehouseId = body.warehouse_id || null;

        if (!customerId) {
          throw createError({
            statusCode: 400,
            statusMessage: "客户不能为空",
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
            statusMessage: "确认/完成订单前必须选择出库仓库",
          });
        }

        const { items, totalAmount } = computeOrderItems(rawItems);
        const willApplyInventory = shouldApplyInventory(status);

        if (willApplyInventory) {
          await syncOrderInventoryOnStatusChange(supabase, {
            direction: "out",
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

        const { data: order, error: orderError } = await supabase
          .from(ORDER_TABLE)
          .insert([
            {
              order_no: generateOrderNo(ORDER_NO_PREFIX),
              customer_id: customerId,
              warehouse_id: warehouseId,
              status,
              order_date:
                body.order_date || new Date().toISOString().slice(0, 10),
              total_amount: totalAmount,
              remark: body.remark ?? null,
              created_by: body.created_by ?? null,
              inventory_applied: willApplyInventory,
            },
          ])
          .select()
          .single();

        if (orderError) {
          if (willApplyInventory) {
            await syncOrderInventoryOnStatusChange(supabase, {
              direction: "out",
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
          if (orderError.code === "23505") {
            throw createError({
              statusCode: 400,
              statusMessage: "订单编号已存在，请重试",
            });
          }
          throw orderError;
        }

        const { data: insertedItems, error: itemsError } = await supabase
          .from(ITEM_TABLE)
          .insert(items.map((item) => ({ ...item, order_id: order.id })))
          .select();

        if (itemsError) {
          await supabase.from(ORDER_TABLE).delete().eq("id", order.id);
          throw itemsError;
        }

        return {
          code: 0,
          message: "创建成功",
          data: { ...order, items: insertedItems || [] },
        };
      }

      case "PUT": {
        const body = await readBody(event);
        if (!body?.id) {
          throw createError({
            statusCode: 400,
            statusMessage: "订单 ID 不能为空",
          });
        }

        const { data: existing, error: existingError } = await supabase
          .from(ORDER_TABLE)
          .select("*")
          .eq("id", body.id)
          .single();
        if (existingError || !existing) {
          throw createError({ statusCode: 404, statusMessage: "订单不存在" });
        }

        const { data: existingItems, error: existingItemsError } =
          await supabase
            .from(ITEM_TABLE)
            .select("product_id, quantity")
            .eq("order_id", body.id);
        if (existingItemsError) {
          throw existingItemsError;
        }

        const updatePayload: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        for (const key of [
          "customer_id",
          "order_date",
          "remark",
          "warehouse_id",
        ] as const) {
          if (body[key] !== undefined) {
            updatePayload[key] = body[key];
          }
        }

        const nextStatus =
          body.status === undefined
            ? existing.status
            : normalizeOrderStatus(body.status);
        if (body.status !== undefined) {
          updatePayload.status = nextStatus;
        }

        const rawItems: OrderItemInput[] | undefined = Array.isArray(body.items)
          ? body.items
          : undefined;

        let nextItems = (existingItems || []).map((i) => ({
          product_id: i.product_id as string,
          quantity: Number(i.quantity),
        }));

        if (rawItems) {
          if (rawItems.length === 0) {
            throw createError({
              statusCode: 400,
              statusMessage: "订单明细不能为空",
            });
          }

          if (existing.inventory_applied) {
            throw createError({
              statusCode: 400,
              statusMessage: "已扣库存的订单不可修改明细，请先取消后再改",
            });
          }

          const { items, totalAmount } = computeOrderItems(rawItems);
          updatePayload.total_amount = totalAmount;
          nextItems = items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          }));

          const { error: deleteItemsError } = await supabase
            .from(ITEM_TABLE)
            .delete()
            .eq("order_id", body.id);
          if (deleteItemsError) {
            throw deleteItemsError;
          }

          const { error: insertItemsError } = await supabase
            .from(ITEM_TABLE)
            .insert(items.map((item) => ({ ...item, order_id: body.id })));
          if (insertItemsError) {
            throw insertItemsError;
          }
        }

        const warehouseId =
          (updatePayload.warehouse_id as string | null | undefined) ??
          existing.warehouse_id;

        const sync = await syncOrderInventoryOnStatusChange(supabase, {
          direction: "out",
          previousStatus: existing.status,
          nextStatus,
          inventoryApplied: Boolean(existing.inventory_applied),
          warehouseId,
          items: nextItems,
        });
        updatePayload.inventory_applied = sync.inventoryApplied;

        const { data: order, error: updateError } = await supabase
          .from(ORDER_TABLE)
          .update(updatePayload)
          .eq("id", body.id)
          .select("*, customers(id, code, name), warehouses(id, code, name)")
          .single();
        if (updateError) {
          throw updateError;
        }

        const { data: currentItems, error: currentItemsError } = await supabase
          .from(ITEM_TABLE)
          .select("*, products(id, code, name, unit)")
          .eq("order_id", body.id);
        if (currentItemsError) {
          throw currentItemsError;
        }

        return {
          code: 0,
          message: "更新成功",
          data: { ...order, items: currentItems || [] },
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

        const { data: existing } = await supabase
          .from(ORDER_TABLE)
          .select("*")
          .eq("id", body.id)
          .single();
        const { data: items } = await supabase
          .from(ITEM_TABLE)
          .select("product_id, quantity")
          .eq("order_id", body.id);

        if (existing?.inventory_applied) {
          await syncOrderInventoryOnStatusChange(supabase, {
            direction: "out",
            previousStatus: existing.status,
            nextStatus: "cancelled",
            inventoryApplied: true,
            warehouseId: existing.warehouse_id,
            items: (items || []).map((i) => ({
              product_id: i.product_id as string,
              quantity: Number(i.quantity),
            })),
          });
        }

        const { error } = await supabase
          .from(ORDER_TABLE)
          .delete()
          .eq("id", body.id);
        if (error) {
          throw error;
        }

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
