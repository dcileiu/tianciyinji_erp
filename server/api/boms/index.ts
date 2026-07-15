import { desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../../db";
import { products } from "../../db/schema/master";
import { bomItems, boms } from "../../db/schema/ops";
import { handleApiError, normalizeEntityStatus } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

const componentProducts = alias(products, "component_products");

function toBomApi(row: typeof boms.$inferSelect) {
  return {
    id: row.id,
    product_id: row.productId,
    version: row.version,
    status: row.status,
    remark: row.remark,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  try {
    await assertPermission(event, "bom:view");

    if (method === "GET") {
      const bomRows = await db
        .select({
          bom: boms,
          product: {
            id: products.id,
            code: products.code,
            name: products.name,
          },
        })
        .from(boms)
        .leftJoin(products, eq(products.id, boms.productId))
        .orderBy(desc(boms.createdAt));

      const ids = bomRows.map((r) => r.bom.id);
      const itemRows =
        ids.length === 0
          ? []
          : await db
              .select({
                item: bomItems,
                product: {
                  id: componentProducts.id,
                  code: componentProducts.code,
                  name: componentProducts.name,
                  unit: componentProducts.unit,
                },
              })
              .from(bomItems)
              .leftJoin(
                componentProducts,
                eq(componentProducts.id, bomItems.componentProductId)
              )
              .where(inArray(bomItems.bomId, ids));

      return {
        code: 0,
        message: "获取成功",
        data: bomRows.map((r) => ({
          ...toBomApi(r.bom),
          products: r.product,
          items: itemRows
            .filter((i) => i.item.bomId === r.bom.id)
            .map((i) => ({
              id: i.item.id,
              bom_id: i.item.bomId,
              component_product_id: i.item.componentProductId,
              quantity: i.item.quantity,
              unit: i.item.unit,
              products: i.product,
            })),
        })),
      };
    }

    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.product_id) {
        throw createError({ statusCode: 400, statusMessage: "成品不能为空" });
      }
      const [bom] = await db
        .insert(boms)
        .values({
          productId: body.product_id,
          version: body.version || "1.0",
          status: normalizeEntityStatus(body.status),
          remark: body.remark || null,
        })
        .returning();

      const rawItems = Array.isArray(body.items) ? body.items : [];
      if (rawItems.length) {
        await db.insert(bomItems).values(
          rawItems.map((item: any) => ({
            bomId: bom.id,
            componentProductId: item.component_product_id,
            quantity: String(item.quantity || 1),
            unit: item.unit || null,
          }))
        );
      }
      return { code: 0, message: "创建成功", data: toBomApi(bom) };
    }

    if (method === "PUT") {
      const body = await readBody(event);
      if (!body?.id) {
        throw createError({ statusCode: 400, statusMessage: "ID 不能为空" });
      }
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (body.product_id !== undefined) {
        patch.productId = body.product_id;
      }
      if (body.version !== undefined) {
        patch.version = body.version;
      }
      if (body.status !== undefined) {
        patch.status = normalizeEntityStatus(body.status);
      }
      if (body.remark !== undefined) {
        patch.remark = body.remark;
      }
      const [bom] = await db
        .update(boms)
        .set(patch as any)
        .where(eq(boms.id, body.id))
        .returning();

      if (Array.isArray(body.items)) {
        await db.delete(bomItems).where(eq(bomItems.bomId, body.id));
        if (body.items.length) {
          await db.insert(bomItems).values(
            body.items.map((item: any) => ({
              bomId: body.id,
              componentProductId: item.component_product_id,
              quantity: String(item.quantity || 1),
              unit: item.unit || null,
            }))
          );
        }
      }
      return { code: 0, message: "更新成功", data: toBomApi(bom) };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      await db.delete(boms).where(eq(boms.id, body.id));
      return { code: 0, message: "删除成功" };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
