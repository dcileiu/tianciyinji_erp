import type { SupabaseClient } from "@supabase/supabase-js";

type StockItem = { product_id: string; quantity: number };

async function adjustStock(
  supabase: SupabaseClient,
  warehouseId: string,
  productId: string,
  delta: number
) {
  const { data: existing, error: fetchError } = await supabase
    .from("inventory_stocks")
    .select("id, quantity")
    .eq("warehouse_id", warehouseId)
    .eq("product_id", productId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  const current = Number(existing?.quantity || 0);
  const next = Math.round((current + delta) * 1000) / 1000;

  if (next < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `库存不足：产品 ${productId} 当前 ${current}，需求变动 ${delta}`,
    });
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("inventory_stocks")
      .update({
        quantity: next,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      throw error;
    }
    return;
  }

  const { error } = await supabase.from("inventory_stocks").insert([
    {
      warehouse_id: warehouseId,
      product_id: productId,
      quantity: next,
      updated_at: new Date().toISOString(),
    },
  ]);
  if (error) {
    throw error;
  }
}

/** 订单确认后扣减(out)或增加(in)库存 */
export async function applyOrderInventory(
  supabase: SupabaseClient,
  opts: {
    direction: "out" | "in";
    warehouseId: string;
    items: StockItem[];
  }
) {
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
    await adjustStock(supabase, opts.warehouseId, item.product_id, delta);
  }
}

/** 撤销已应用的库存变动 */
export async function reverseOrderInventory(
  supabase: SupabaseClient,
  opts: {
    direction: "out" | "in";
    warehouseId: string;
    items: StockItem[];
  }
) {
  // 原 out 撤销 => in；原 in 撤销 => out
  const reverseDirection = opts.direction === "out" ? "in" : "out";
  await applyOrderInventory(supabase, {
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
export async function syncOrderInventoryOnStatusChange(
  supabase: SupabaseClient,
  opts: {
    direction: "out" | "in";
    previousStatus: string;
    nextStatus: string;
    inventoryApplied: boolean;
    warehouseId: string | null | undefined;
    items: StockItem[];
  }
): Promise<{ inventoryApplied: boolean }> {
  const wasApplied = opts.inventoryApplied;
  const shouldApply = shouldApplyInventory(opts.nextStatus);
  const wasShouldApply = shouldApplyInventory(opts.previousStatus);

  if (!wasApplied && shouldApply) {
    await applyOrderInventory(supabase, {
      direction: opts.direction,
      warehouseId: String(opts.warehouseId || ""),
      items: opts.items,
    });
    return { inventoryApplied: true };
  }

  if (wasApplied && wasShouldApply && !shouldApply) {
    await reverseOrderInventory(supabase, {
      direction: opts.direction,
      warehouseId: String(opts.warehouseId || ""),
      items: opts.items,
    });
    return { inventoryApplied: false };
  }

  return { inventoryApplied: wasApplied };
}
