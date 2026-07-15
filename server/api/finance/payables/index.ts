import { desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { suppliers } from "../../../db/schema/master";
import { financePayables } from "../../../db/schema/ops";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

function toApi(row: typeof financePayables.$inferSelect) {
  return {
    id: row.id,
    doc_no: row.docNo,
    supplier_id: row.supplierId,
    purchase_order_id: row.purchaseOrderId,
    amount: row.amount,
    paid_amount: row.paidAmount,
    due_date: row.dueDate,
    status: row.status,
    remark: row.remark,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  try {
    await assertPermission(event, "finance:payables");

    if (method === "GET") {
      const rows = await db
        .select({
          row: financePayables,
          customer: {
            id: suppliers.id,
            code: suppliers.code,
            name: suppliers.name,
          },
        })
        .from(financePayables)
        .leftJoin(suppliers, eq(suppliers.id, financePayables.supplierId))
        .orderBy(desc(financePayables.createdAt));
      return {
        code: 0,
        message: "获取成功",
        data: rows.map((r) => ({ ...toApi(r.row), suppliers: r.customer })),
      };
    }

    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.supplier_id) {
        throw createError({ statusCode: 400, statusMessage: "供应商不能为空" });
      }
      const [created] = await db
        .insert(financePayables)
        .values({
          docNo: body.doc_no || generateOrderNo("AP"),
          supplierId: body.supplier_id,
          purchaseOrderId: body.purchase_order_id || null,
          amount: String(body.amount || 0),
          paidAmount: String(body.paid_amount || 0),
          dueDate: body.due_date || null,
          status: body.status || "open",
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
      if (body.purchase_order_id !== undefined) {
        patch.purchaseOrderId = body.purchase_order_id;
      }
      if (body.amount !== undefined) {
        patch.amount = String(body.amount);
      }
      if (body.paid_amount !== undefined) {
        patch.paidAmount = String(body.paid_amount);
      }
      if (body.due_date !== undefined) {
        patch.dueDate = body.due_date;
      }
      if (body.status !== undefined) {
        patch.status = body.status;
      }
      if (body.remark !== undefined) {
        patch.remark = body.remark;
      }
      const [updated] = await db
        .update(financePayables)
        .set(patch as any)
        .where(eq(financePayables.id, body.id))
        .returning();
      return { code: 0, message: "更新成功", data: toApi(updated) };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      if (!body?.id) {
        throw createError({ statusCode: 400, statusMessage: "ID 不能为空" });
      }
      await db.delete(financePayables).where(eq(financePayables.id, body.id));
      return { code: 0, message: "删除成功" };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
