import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { inventoryStocks } from "../../db/schema/master";

type StockItem = { product_id: string; quantity: number };

async function adjustStock(
  warehouseId: string,
  productId: string,
  delta: number
) {
  const [existing] = await db
    .select({ id: inventoryStocks.id, quantity: inventoryStocks.quantity })
    .from(inventoryStocks)
    .where(
      and(
        eq(inventoryStocks.warehouseId, warehouseId),
        eq(inventoryStocks.productId, productId)
      )
    )
    .limit(1);

  const current = Number(existing?.quantity || 0);
  const next = Math.round((current + delta) * 1000) / 1000;

  if (next < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `库存不足：产品 ${productId} 当前 ${current}，需求变动 ${delta}`,
    });
  }

  if (existing?.id) {
    await db
      .update(inventoryStocks)
      .set({ quantity: String(next), updatedAt: new Date() })
      .where(eq(inventoryStocks.id, existing.id));
    return;
  }

  await db.insert(inventoryStocks).values({
    warehouseId,
    productId,
    quantity: String(next),
    updatedAt: new Date(),
  });
}

/** 订单确认后扣减(out)或增加(in)库存 */
export async function applyOrderInventory(opts: {
  direction: "out" | "in";
  warehouseId: string;
  items: StockItem[];
}) {
  if (!opts.warehouseId) {
    throw createError({
      statusCode: 400,
      statusMessage: "确认订单前请选择仓库",
    });
  }
  if (!opts.items.length) {
    return;
  }

  for (const item of opts.items) {
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) {
      continue;
    }
    const delta = opts.direction === "out" ? -qty : qty;
    await adjustStock(opts.warehouseId, item.product_id, delta);
  }
}

/** 撤销已应用的库存变动 */
export async function reverseOrderInventory(opts: {
  direction: "out" | "in";
  warehouseId: string;
  items: StockItem[];
}) {
  const reverseDirection = opts.direction === "out" ? "in" : "out";
  await applyOrderInventory({
    direction: reverseDirection,
    warehouseId: opts.warehouseId,
    items: opts.items,
  });
}

const APPLIED_STATUSES = new Set(["confirmed", "completed"]);

export function shouldApplyInventory(status: string): boolean {
  return APPLIED_STATUSES.has(status);
}

/**
 * 根据订单新旧状态同步库存，并返回是否应标记 inventory_applied
 */
export async function syncOrderInventoryOnStatusChange(opts: {
  direction: "out" | "in";
  previousStatus: string;
  nextStatus: string;
  inventoryApplied: boolean;
  warehouseId: string | null | undefined;
  items: StockItem[];
}): Promise<{ inventoryApplied: boolean }> {
  const wasApplied = opts.inventoryApplied;
  const shouldApply = shouldApplyInventory(opts.nextStatus);
  const wasShouldApply = shouldApplyInventory(opts.previousStatus);

  if (!wasApplied && shouldApply) {
    await applyOrderInventory({
      direction: opts.direction,
      warehouseId: String(opts.warehouseId || ""),
      items: opts.items,
    });
    return { inventoryApplied: true };
  }

  if (wasApplied && wasShouldApply && !shouldApply) {
    await reverseOrderInventory({
      direction: opts.direction,
      warehouseId: String(opts.warehouseId || ""),
      items: opts.items,
    });
    return { inventoryApplied: false };
  }

  return { inventoryApplied: wasApplied };
}
