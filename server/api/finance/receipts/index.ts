import { desc, eq } from "drizzle-orm";
import { db } from "../../../db";
import { customers } from "../../../db/schema/master";
import { financeReceipts } from "../../../db/schema/ops";
import { generateOrderNo, handleApiError } from "../../_utils/crud";
import { assertPermission } from "../../_utils/permissions";

function toApi(row: typeof financeReceipts.$inferSelect) {
  return {
    id: row.id,
    receipt_no: row.receiptNo,
    customer_id: row.customerId,
    receivable_id: row.receivableId,
    amount: row.amount,
    receipt_date: row.receiptDate,
    method: row.method,
    remark: row.remark,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  try {
    await assertPermission(event, "receipt:view");
    if (method === "GET") {
      const rows = await db
        .select({
          row: financeReceipts,
          customer: {
            id: customers.id,
            code: customers.code,
            name: customers.name,
          },
        })
        .from(financeReceipts)
        .leftJoin(customers, eq(customers.id, financeReceipts.customerId))
        .orderBy(desc(financeReceipts.createdAt));
      return {
        code: 0,
        message: "获取成功",
        data: rows.map((r) => ({ ...toApi(r.row), customers: r.customer })),
      };
    }
    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.customer_id) {
        throw createError({ statusCode: 400, statusMessage: "客户不能为空" });
      }
      const [created] = await db
        .insert(financeReceipts)
        .values({
          receiptNo: body.receipt_no || generateOrderNo("RC"),
          customerId: body.customer_id,
          receivableId: body.receivable_id || null,
          amount: String(body.amount || 0),
          receiptDate: body.receipt_date || null,
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
      if (body.customer_id !== undefined) {
        patch.customerId = body.customer_id;
      }
      if (body.receivable_id !== undefined) {
        patch.receivableId = body.receivable_id;
      }
      if (body.amount !== undefined) {
        patch.amount = String(body.amount);
      }
      if (body.receipt_date !== undefined) {
        patch.receiptDate = body.receipt_date;
      }
      if (body.method !== undefined) {
        patch.method = body.method;
      }
      if (body.remark !== undefined) {
        patch.remark = body.remark;
      }
      const [updated] = await db
        .update(financeReceipts)
        .set(patch as any)
        .where(eq(financeReceipts.id, body.id))
        .returning();
      return { code: 0, message: "更新成功", data: toApi(updated) };
    }
    if (method === "DELETE") {
      const body = await readBody(event);
      await db.delete(financeReceipts).where(eq(financeReceipts.id, body.id));
      return { code: 0, message: "删除成功" };
    }
    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
