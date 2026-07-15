import { serverSupabaseServiceRole } from "#supabase/server";
import { handleApiError } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

const TABLE = "inventory_stocks";
const PERMISSION = "warehouse:inventory";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, PERMISSION);

    switch (method) {
      case "GET": {
        const query = getQuery(event);
        let dbQuery = supabase
          .from(TABLE)
          .select(
            "*, products!inner(id, code, name, unit), warehouses!inner(id, code, name)"
          )
          .order("updated_at", { ascending: false });

        if (query.warehouse_id && typeof query.warehouse_id === "string") {
          dbQuery = dbQuery.eq("warehouse_id", query.warehouse_id);
        }

        if (query.product_id && typeof query.product_id === "string") {
          dbQuery = dbQuery.eq("product_id", query.product_id);
        }

        if (query.search && typeof query.search === "string") {
          dbQuery = dbQuery.or(
            `name.ilike.%${query.search}%,code.ilike.%${query.search}%`,
            { referencedTable: "products" }
          );
        }

        const { data, error } = await dbQuery;
        if (error) {
          throw error;
        }

        return { code: 0, message: "获取成功", data: data || [] };
      }

      case "POST": {
        const body = await readBody(event);
        const warehouseId = body?.warehouse_id;
        const productId = body?.product_id;

        if (!(warehouseId && productId)) {
          throw createError({
            statusCode: 400,
            statusMessage: "仓库和产品不能为空",
          });
        }

        const quantity = Number(body.quantity);
        if (Number.isNaN(quantity) || quantity < 0) {
          throw createError({
            statusCode: 400,
            statusMessage: "库存数量必须为非负数字",
          });
        }

        const { data, error } = await supabase
          .from(TABLE)
          .upsert(
            [
              {
                warehouse_id: warehouseId,
                product_id: productId,
                quantity,
                updated_at: new Date().toISOString(),
              },
            ],
            { onConflict: "warehouse_id,product_id" }
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        return { code: 0, message: "库存更新成功", data };
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
