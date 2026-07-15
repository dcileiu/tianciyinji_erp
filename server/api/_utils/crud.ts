import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { assertPermission, rethrowIfHttpError } from "./permissions";

/** 通用状态归一化：非 'inactive'/0/'0' 均视为 'active' */
export function normalizeEntityStatus(
  status: unknown,
  fallback: "active" | "inactive" = "active"
): "active" | "inactive" {
  if (status === "inactive" || status === 0 || status === "0") {
    return "inactive";
  }
  if (status === "active" || status === 1 || status === "1") {
    return "active";
  }
  return fallback;
}

/**
 * 统一的 API 错误处理：HTTP/H3 错误原样抛出，其余转换为 { code: -1, message } 结构
 * 用法：`catch (error) { return handleApiError(error); }`
 */
export function handleApiError(error: unknown, fallbackMessage = "操作失败") {
  rethrowIfHttpError(error);
  const message = error instanceof Error ? error.message : fallbackMessage;
  return {
    code: -1,
    message,
    data: null,
  };
}

/** 生成单据编号，例如 SO2026071508001234（前缀 + 14 位时间戳 + 3 位随机数） */
export function generateOrderNo(prefix: string): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}${stamp}${random}`;
}

export type OrderItemInput = {
  product_id: string;
  quantity: number | string;
  unit_price: number | string;
};

export type NormalizedOrderItem = {
  product_id: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

/** 校验并计算订单明细金额与合计金额 */
export function computeOrderItems(items: OrderItemInput[]): {
  items: NormalizedOrderItem[];
  totalAmount: number;
} {
  const normalized = items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const amount = Math.round(quantity * unitPrice * 100) / 100;

    return {
      product_id: item.product_id,
      quantity,
      unit_price: unitPrice,
      amount,
    };
  });

  const totalAmount =
    Math.round(normalized.reduce((sum, item) => sum + item.amount, 0) * 100) /
    100;

  return { items: normalized, totalAmount };
}

type SimpleCrudOptions = {
  table: string;
  permission: string;
  searchFields?: string[];
  createFields: string[];
  updateFields: string[];
  requiredCreate?: string[];
  normalizeStatus?: boolean;
  select?: string;
  uniqueMessage?: string;
};

/** 简单主数据 CRUD 工厂 */
export function defineSimpleCrudHandler(options: SimpleCrudOptions) {
  return defineEventHandler(async (event: H3Event) => {
    const method = getMethod(event);
    const supabase = serverSupabaseServiceRole(event);

    try {
      await assertPermission(event, options.permission);

      switch (method) {
        case "GET": {
          const query = getQuery(event);
          let dbQuery = supabase
            .from(options.table)
            .select(options.select || "*")
            .order("created_at", { ascending: false });

          if (query.search && typeof query.search === "string") {
            const fields = options.searchFields || ["name", "code"];
            dbQuery = dbQuery.or(
              fields.map((f) => `${f}.ilike.%${query.search}%`).join(",")
            );
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
          for (const key of options.requiredCreate || []) {
            if (!body?.[key] && body?.[key] !== 0) {
              throw createError({
                statusCode: 400,
                statusMessage: `${key} 不能为空`,
              });
            }
          }

          const row: Record<string, unknown> = {};
          for (const key of options.createFields) {
            if (body?.[key] !== undefined) {
              row[key] = body[key];
            }
          }
          if (options.normalizeStatus) {
            row.status = normalizeEntityStatus(body?.status);
          }

          const { data, error } = await supabase
            .from(options.table)
            .insert([row])
            .select(options.select || "*")
            .single();

          if (error) {
            if (error.code === "23505") {
              throw createError({
                statusCode: 400,
                statusMessage: options.uniqueMessage || "编码已存在",
              });
            }
            throw error;
          }
          return { code: 0, message: "创建成功", data };
        }

        case "PUT": {
          const body = await readBody(event);
          if (!body?.id) {
            throw createError({
              statusCode: 400,
              statusMessage: "ID 不能为空",
            });
          }

          const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };
          for (const key of options.updateFields) {
            if (body[key] !== undefined) {
              updatePayload[key] = body[key];
            }
          }
          if (options.normalizeStatus && body.status !== undefined) {
            updatePayload.status = normalizeEntityStatus(body.status);
          }

          const { data, error } = await supabase
            .from(options.table)
            .update(updatePayload)
            .eq("id", body.id)
            .select(options.select || "*")
            .single();

          if (error) {
            if (error.code === "23505") {
              throw createError({
                statusCode: 400,
                statusMessage: options.uniqueMessage || "编码已存在",
              });
            }
            throw error;
          }
          return { code: 0, message: "更新成功", data };
        }

        case "DELETE": {
          const body = await readBody(event);
          if (!body?.id) {
            throw createError({
              statusCode: 400,
              statusMessage: "ID 不能为空",
            });
          }
          const { error } = await supabase
            .from(options.table)
            .delete()
            .eq("id", body.id);
          if (error) {
            if (error.code === "23503") {
              throw createError({
                statusCode: 400,
                statusMessage: "存在关联数据，无法删除",
              });
            }
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
}
