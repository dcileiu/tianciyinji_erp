import { desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { products } from "../../../db/schema/master";
import {
  productionOrders,
  productionPlans,
  workshops,
} from "../../../db/schema/ops";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

function toApi(row: typeof productionOrders.$inferSelect) {
  return {
    id: row.id,
    order_no: row.orderNo,
    plan_id: row.planId,
    product_id: row.productId,
    workshop_id: row.workshopId,
    quantity: row.quantity,
    status: row.status,
    start_date: row.startDate,
    end_date: row.endDate,
    remark: row.remark,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  try {
    await assertPermission(event, "production-order:view");
    if (method === "GET") {
      const rows = await db
        .select({
          row: productionOrders,
          product: {
            id: products.id,
            code: products.code,
            name: products.name,
          },
          workshop: {
            id: workshops.id,
            code: workshops.code,
            name: workshops.name,
          },
          plan: { id: productionPlans.id, plan_no: productionPlans.planNo },
        })
        .from(productionOrders)
        .leftJoin(products, eq(products.id, productionOrders.productId))
        .leftJoin(workshops, eq(workshops.id, productionOrders.workshopId))
        .leftJoin(
          productionPlans,
          eq(productionPlans.id, productionOrders.planId)
        )
        .orderBy(desc(productionOrders.createdAt));
      return {
        code: 0,
        message: "获取成功",
        data: rows.map((r) => ({
          ...toApi(r.row),
          products: r.product,
          workshops: r.workshop,
          production_plans: r.plan,
        })),
      };
    }
    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.product_id) {
        throw createError({ statusCode: 400, statusMessage: "产品不能为空" });
      }
      const [created] = await db
        .insert(productionOrders)
        .values({
          orderNo: body.order_no || generateOrderNo("MO"),
          planId: body.plan_id || null,
          productId: body.product_id,
          workshopId: body.workshop_id || null,
          quantity: String(body.quantity || 0),
          status: body.status || "pending",
          startDate: body.start_date || null,
          endDate: body.end_date || null,
          remark: body.remark || null,
        })
        .returning();
      return { code: 0, message: "创建成功", data: toApi(created) };
    }
    if (method === "PUT") {
      const body = await readBody(event);
      if (!body?.id) {
        throw createError({ statusCode: 400, statusMessage: "ID 不能为空" });
      }
      const patch: Record<string, unknown> = { updatedAt: new Date() };
      for (const [from, to] of [
        ["plan_id", "planId"],
        ["product_id", "productId"],
        ["workshop_id", "workshopId"],
        ["status", "status"],
        ["start_date", "startDate"],
        ["end_date", "endDate"],
        ["remark", "remark"],
      ] as const) {
        if (body[from] !== undefined) {
          patch[to] = body[from];
        }
      }
      if (body.quantity !== undefined) {
        patch.quantity = String(body.quantity);
      }
      const [updated] = await db
        .update(productionOrders)
        .set(patch as any)
        .where(eq(productionOrders.id, body.id))
        .returning();
      return { code: 0, message: "更新成功", data: toApi(updated) };
    }
    if (method === "DELETE") {
      const body = await readBody(event);
      await db.delete(productionOrders).where(eq(productionOrders.id, body.id));
      return { code: 0, message: "删除成功" };
    }
    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
