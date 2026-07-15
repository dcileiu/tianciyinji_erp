import { desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { products } from "../../../db/schema/master";
import { productionPlans, workshops } from "../../../db/schema/ops";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

function toApi(row: typeof productionPlans.$inferSelect) {
  return {
    id: row.id,
    plan_no: row.planNo,
    product_id: row.productId,
    workshop_id: row.workshopId,
    quantity: row.quantity,
    planned_start: row.plannedStart,
    planned_end: row.plannedEnd,
    status: row.status,
    remark: row.remark,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  try {
    await assertPermission(event, "production-plan:view");
    if (method === "GET") {
      const rows = await db
        .select({
          row: productionPlans,
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
        })
        .from(productionPlans)
        .leftJoin(products, eq(products.id, productionPlans.productId))
        .leftJoin(workshops, eq(workshops.id, productionPlans.workshopId))
        .orderBy(desc(productionPlans.createdAt));
      return {
        code: 0,
        message: "获取成功",
        data: rows.map((r) => ({
          ...toApi(r.row),
          products: r.product,
          workshops: r.workshop,
        })),
      };
    }
    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.product_id) {
        throw createError({ statusCode: 400, statusMessage: "产品不能为空" });
      }
      const [created] = await db
        .insert(productionPlans)
        .values({
          planNo: body.plan_no || generateOrderNo("PP"),
          productId: body.product_id,
          workshopId: body.workshop_id || null,
          quantity: String(body.quantity || 0),
          plannedStart: body.planned_start || null,
          plannedEnd: body.planned_end || null,
          status: body.status || "draft",
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
      if (body.product_id !== undefined) {
        patch.productId = body.product_id;
      }
      if (body.workshop_id !== undefined) {
        patch.workshopId = body.workshop_id;
      }
      if (body.quantity !== undefined) {
        patch.quantity = String(body.quantity);
      }
      if (body.planned_start !== undefined) {
        patch.plannedStart = body.planned_start;
      }
      if (body.planned_end !== undefined) {
        patch.plannedEnd = body.planned_end;
      }
      if (body.status !== undefined) {
        patch.status = body.status;
      }
      if (body.remark !== undefined) {
        patch.remark = body.remark;
      }
      const [updated] = await db
        .update(productionPlans)
        .set(patch as any)
        .where(eq(productionPlans.id, body.id))
        .returning();
      return { code: 0, message: "更新成功", data: toApi(updated) };
    }
    if (method === "DELETE") {
      const body = await readBody(event);
      await db.delete(productionPlans).where(eq(productionPlans.id, body.id));
      return { code: 0, message: "删除成功" };
    }
    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
