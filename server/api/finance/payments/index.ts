import { desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { suppliers } from "../../../db/schema/master";
import { financePayments } from "../../../db/schema/ops";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

function toApi(row: typeof financePayments.$inferSelect) {
  return {
    id: row.id,
    payment_no: row.paymentNo,
    supplier_id: row.supplierId,
    payable_id: row.payableId,
    amount: row.amount,
    payment_date: row.paymentDate,
    method: row.method,
    remark: row.remark,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  try {
    await assertPermission(event, "payment:view");
    if (method === "GET") {
      const rows = await db
        .select({
          row: financePayments,
          supplier: {
            id: suppliers.id,
            code: suppliers.code,
            name: suppliers.name,
          },
        })
        .from(financePayments)
        .leftJoin(suppliers, eq(suppliers.id, financePayments.supplierId))
        .orderBy(desc(financePayments.createdAt));
      return {
        code: 0,
        message: "获取成功",
        data: rows.map((r) => ({ ...toApi(r.row), suppliers: r.supplier })),
      };
    }
    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.supplier_id) {
        throw createError({ statusCode: 400, statusMessage: "供应商不能为空" });
      }
      const [created] = await db
        .insert(financePayments)
        .values({
          paymentNo: body.payment_no || generateOrderNo("PY"),
          supplierId: body.supplier_id,
          payableId: body.payable_id || null,
          amount: String(body.amount || 0),
          paymentDate: body.payment_date || null,
          method: body.method || "transfer",
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
      if (body.supplier_id !== undefined) {
        patch.supplierId = body.supplier_id;
      }
      if (body.payable_id !== undefined) {
        patch.payableId = body.payable_id;
      }
      if (body.amount !== undefined) {
        patch.amount = String(body.amount);
      }
      if (body.payment_date !== undefined) {
        patch.paymentDate = body.payment_date;
      }
      if (body.method !== undefined) {
        patch.method = body.method;
      }
      if (body.remark !== undefined) {
        patch.remark = body.remark;
      }
      const [updated] = await db
        .update(financePayments)
        .set(patch as any)
        .where(eq(financePayments.id, body.id))
        .returning();
      return { code: 0, message: "更新成功", data: toApi(updated) };
    }
    if (method === "DELETE") {
      const body = await readBody(event);
      await db.delete(financePayments).where(eq(financePayments.id, body.id));
      return { code: 0, message: "删除成功" };
    }
    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
