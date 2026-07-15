import { and, asc, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { H3Event } from "h3";
import { db } from "../../db";
import {
  customers,
  products,
  suppliers,
  warehouses,
} from "../../db/schema/master";
import { workshops } from "../../db/schema/ops";
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
  table: "products" | "customers" | "suppliers" | "warehouses" | "workshops";
  permission: string;
  searchFields?: string[];
  createFields: string[];
  updateFields: string[];
  requiredCreate?: string[];
  normalizeStatus?: boolean;
  uniqueMessage?: string;
};

const tableMap = {
  products,
  customers,
  suppliers,
  warehouses,
  workshops,
} as const;

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function toApiRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const snake = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
    out[snake] = value;
  }
  return out;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function isFkViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23503"
  );
}

/** 简单主数据 CRUD 工厂（Drizzle） */
export function defineSimpleCrudHandler(options: SimpleCrudOptions) {
  const table = tableMap[options.table] as PgTable & {
    id: any;
    createdAt?: any;
    updatedAt?: any;
    status?: any;
    name?: any;
    code?: any;
  };

  return defineEventHandler(async (event: H3Event) => {
    const method = getMethod(event);

    try {
      await assertPermission(event, options.permission);

      switch (method) {
        case "GET": {
          const query = getQuery(event);
          const conditions: SQL[] = [];

          if (query.search && typeof query.search === "string") {
            const fields = options.searchFields || ["name", "code"];
            const searchConds = fields
              .map((field) => {
                const col = (table as Record<string, unknown>)[
                  snakeToCamel(field)
                ];
                if (!col) {
                  return null;
                }
                return ilike(col as any, `%${query.search}%`);
              })
              .filter(Boolean) as SQL[];
            if (searchConds.length) {
              conditions.push(or(...searchConds)!);
            }
          }

          if (
            query.status &&
            typeof query.status === "string" &&
            query.status !== "all" &&
            table.status
          ) {
            conditions.push(eq(table.status, query.status));
          }

          const rows = await db
            .select()
            .from(table)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(table.createdAt ? desc(table.createdAt) : asc(table.id));

          return {
            code: 0,
            message: "获取成功",
            data: rows.map((row) => toApiRow(row as Record<string, unknown>)),
          };
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
              row[snakeToCamel(key)] = body[key];
            }
          }
          if (options.normalizeStatus) {
            row.status = normalizeEntityStatus(body?.status);
          }

          try {
            const [created] = await db
              .insert(table)
              .values(row as any)
              .returning();
            return {
              code: 0,
              message: "创建成功",
              data: toApiRow(created as Record<string, unknown>),
            };
          } catch (error) {
            if (isUniqueViolation(error)) {
              throw createError({
                statusCode: 400,
                statusMessage: options.uniqueMessage || "编码已存在",
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
              statusMessage: "ID 不能为空",
            });
          }

          const updatePayload: Record<string, unknown> = {
            updatedAt: new Date(),
          };
          for (const key of options.updateFields) {
            if (body[key] !== undefined) {
              updatePayload[snakeToCamel(key)] = body[key];
            }
          }
          if (options.normalizeStatus && body.status !== undefined) {
            updatePayload.status = normalizeEntityStatus(body.status);
          }

          try {
            const [updated] = await db
              .update(table)
              .set(updatePayload as any)
              .where(eq(table.id, body.id))
              .returning();
            return {
              code: 0,
              message: "更新成功",
              data: toApiRow(updated as Record<string, unknown>),
            };
          } catch (error) {
            if (isUniqueViolation(error)) {
              throw createError({
                statusCode: 400,
                statusMessage: options.uniqueMessage || "编码已存在",
              });
            }
            throw error;
          }
        }

        case "DELETE": {
          const body = await readBody(event);
          if (!body?.id) {
            throw createError({
              statusCode: 400,
              statusMessage: "ID 不能为空",
            });
          }
          try {
            await db.delete(table).where(eq(table.id, body.id));
            return { code: 0, message: "删除成功" };
          } catch (error) {
            if (isFkViolation(error)) {
              throw createError({
                statusCode: 400,
                statusMessage: "存在关联数据，无法删除",
              });
            }
            throw error;
          }
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
