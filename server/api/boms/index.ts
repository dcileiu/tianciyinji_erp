import { serverSupabaseServiceRole } from "#supabase/server";
import { handleApiError, normalizeEntityStatus } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "bom:view");

    if (method === "GET") {
      const { data: boms, error } = await supabase
        .from("boms")
        .select("*, products(id, code, name)")
        .order("created_at", { ascending: false });
      if (error) {
        throw error;
      }

      const ids = (boms || []).map((b) => b.id);
      let items: Array<Record<string, unknown>> = [];
      if (ids.length) {
        const { data: bomItems, error: itemsError } = await supabase
          .from("bom_items")
          .select("*, products:component_product_id(id, code, name, unit)")
          .in("bom_id", ids);
        if (itemsError) {
          throw itemsError;
        }
        items = bomItems || [];
      }

      const data = (boms || []).map((bom) => ({
        ...bom,
        items: items.filter((i) => i.bom_id === bom.id),
      }));
      return { code: 0, message: "获取成功", data };
    }

    if (method === "POST") {
      const body = await readBody(event);
      if (!body?.product_id) {
        throw createError({ statusCode: 400, statusMessage: "成品不能为空" });
      }
      const { data: bom, error } = await supabase
        .from("boms")
        .insert([
          {
            product_id: body.product_id,
            version: body.version || "1.0",
            status: normalizeEntityStatus(body.status),
            remark: body.remark || null,
          },
        ])
        .select()
        .single();
      if (error) {
        throw error;
      }

      const rawItems = Array.isArray(body.items) ? body.items : [];
      if (rawItems.length) {
        const { error: itemsError } = await supabase.from("bom_items").insert(
          rawItems.map(
            (item: {
              component_product_id: string;
              quantity: number;
              unit?: string;
            }) => ({
              bom_id: bom.id,
              component_product_id: item.component_product_id,
              quantity: item.quantity || 1,
              unit: item.unit || null,
            })
          )
        );
        if (itemsError) {
          await supabase.from("boms").delete().eq("id", bom.id);
          throw itemsError;
        }
      }
      return { code: 0, message: "创建成功", data: bom };
    }

    if (method === "PUT") {
      const body = await readBody(event);
      if (!body?.id) {
        throw createError({ statusCode: 400, statusMessage: "ID 不能为空" });
      }
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      for (const key of ["product_id", "version", "remark"] as const) {
        if (body[key] !== undefined) {
          payload[key] = body[key];
        }
      }
      if (body.status !== undefined) {
        payload.status = normalizeEntityStatus(body.status);
      }
      const { data: bom, error } = await supabase
        .from("boms")
        .update(payload)
        .eq("id", body.id)
        .select()
        .single();
      if (error) {
        throw error;
      }

      if (Array.isArray(body.items)) {
        await supabase.from("bom_items").delete().eq("bom_id", body.id);
        if (body.items.length) {
          const { error: itemsError } = await supabase.from("bom_items").insert(
            body.items.map(
              (item: {
                component_product_id: string;
                quantity: number;
                unit?: string;
              }) => ({
                bom_id: body.id,
                component_product_id: item.component_product_id,
                quantity: item.quantity || 1,
                unit: item.unit || null,
              })
            )
          );
          if (itemsError) {
            throw itemsError;
          }
        }
      }
      return { code: 0, message: "更新成功", data: bom };
    }

    if (method === "DELETE") {
      const body = await readBody(event);
      const { error } = await supabase.from("boms").delete().eq("id", body.id);
      if (error) {
        throw error;
      }
      return { code: 0, message: "删除成功" };
    }

    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  } catch (error: unknown) {
    return handleApiError(error);
  }
});
