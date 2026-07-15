import { serverSupabaseServiceRole } from "#supabase/server";
import { handleApiError, normalizeEntityStatus } from "../_utils/crud";
import { assertPermission } from "../_utils/permissions";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const client = serverSupabaseServiceRole(event);

  try {
    await assertPermission(event, "system:departments");

    switch (method) {
      case "GET":
        return await getDepartments(client);
      case "POST":
        return await createDepartment(client, event);
      case "PUT":
        return await updateDepartment(client, event);
      case "DELETE":
        return await deleteDepartment(client, event);
      default:
        throw createError({
          statusCode: 405,
          statusMessage: "Method Not Allowed",
        });
    }
  } catch (error: unknown) {
    return handleApiError(error);
  }
});

async function getDepartments(
  client: ReturnType<typeof serverSupabaseServiceRole>
) {
  const { data: departments, error } = await client
    .from("departments")
    .select(
      "id, name, code, description, status, parent_id, sort, manager_id, created_at, updated_at"
    )
    .order("sort", { ascending: true });

  if (error) {
    throw new Error(`获取部门列表失败: ${error.message}`);
  }

  return {
    code: 0,
    message: "获取成功",
    data: (departments || []).map((dept) => ({
      ...dept,
      status: normalizeEntityStatus(dept.status),
    })),
  };
}

async function createDepartment(
  client: ReturnType<typeof serverSupabaseServiceRole>,
  event: Parameters<typeof readBody>[0]
) {
  const body = await readBody(event);
  const { name, code, description, parent_id, manager_id, sort, status } = body;

  if (!(name && code)) {
    throw createError({
      statusCode: 400,
      statusMessage: "部门名称和编码为必填字段",
    });
  }

  const { data, error } = await client
    .from("departments")
    .insert({
      name,
      code,
      description: description || "",
      parent_id: parent_id || null,
      manager_id: manager_id || null,
      sort: sort || 0,
      status: normalizeEntityStatus(status),
    })
    .select();

  if (error) {
    if (error.code === "23505") {
      throw createError({
        statusCode: 400,
        statusMessage: "部门编码已存在",
      });
    }
    throw new Error(`创建部门失败: ${error.message}`);
  }

  return {
    code: 0,
    message: "创建部门成功",
    data: data?.[0]
      ? { ...data[0], status: normalizeEntityStatus(data[0].status) }
      : null,
  };
}

async function updateDepartment(
  client: ReturnType<typeof serverSupabaseServiceRole>,
  event: Parameters<typeof readBody>[0]
) {
  const body = await readBody(event);
  const { id, name, code, description, parent_id, manager_id, sort, status } =
    body;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "部门ID不能为空",
    });
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (name !== undefined) {
    updateData.name = name;
  }
  if (code !== undefined) {
    updateData.code = code;
  }
  if (description !== undefined) {
    updateData.description = description;
  }
  if (parent_id !== undefined) {
    updateData.parent_id = parent_id || null;
  }
  if (manager_id !== undefined) {
    updateData.manager_id = manager_id || null;
  }
  if (sort !== undefined) {
    updateData.sort = sort;
  }
  if (status !== undefined) {
    updateData.status = normalizeEntityStatus(status);
  }

  const { data, error } = await client
    .from("departments")
    .update(updateData)
    .eq("id", id)
    .select();

  if (error) {
    if (error.code === "23505") {
      throw createError({
        statusCode: 400,
        statusMessage: "部门编码已存在",
      });
    }
    throw new Error(`更新部门失败: ${error.message}`);
  }

  return {
    code: 0,
    message: "更新部门成功",
    data: data?.[0]
      ? { ...data[0], status: normalizeEntityStatus(data[0].status) }
      : null,
  };
}

async function deleteDepartment(
  client: ReturnType<typeof serverSupabaseServiceRole>,
  event: Parameters<typeof readBody>[0]
) {
  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "部门ID不能为空",
    });
  }

  const { data: children, error: checkError } = await client
    .from("departments")
    .select("id")
    .eq("parent_id", id);

  if (checkError) {
    throw new Error(`检查子部门失败: ${checkError.message}`);
  }

  if (children && children.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "该部门下还有子部门，不能删除",
    });
  }

  const { error } = await client.from("departments").delete().eq("id", id);

  if (error) {
    throw new Error(`删除部门失败: ${error.message}`);
  }

  return {
    code: 0,
    message: "删除部门成功",
    data: { id },
  };
}
