type ApiResult<T> = {
  code: number;
  message: string;
  data: T;
};

/**
 * 主数据 / 单据通用 CRUD（走服务端 API + 权限校验）
 */
export function useMasterEntity<T extends { id: string }>(
  endpoint: string,
  options?: {
    idField?: string;
  }
) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const error = ref<string | null>(null);
  const idField = options?.idField || "id";

  const list = async (query?: Record<string, string | undefined>) => {
    try {
      loading.value = true;
      error.value = null;
      const result = await $fetch<ApiResult<T[]>>(endpoint, { query });
      if (result.code !== 0) {
        throw new Error(result.message || "获取列表失败");
      }
      items.value = result.data || [];
      return items.value;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取列表失败";
      error.value = message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const create = async (body: Partial<T>) => {
    const result = await $fetch<ApiResult<T>>(endpoint, {
      method: "POST",
      body,
    });
    if (result.code !== 0) {
      throw new Error(result.message || "创建失败");
    }
    await list();
    return result.data;
  };

  const update = async (body: Partial<T> & { id: string }) => {
    const result = await $fetch<ApiResult<T>>(endpoint, {
      method: "PUT",
      body,
    });
    if (result.code !== 0) {
      throw new Error(result.message || "更新失败");
    }
    await list();
    return result.data;
  };

  const remove = async (id: string) => {
    const result = await $fetch<{ code: number; message: string }>(endpoint, {
      method: "DELETE",
      body: { [idField]: id, id },
    });
    if (result.code !== 0) {
      throw new Error(result.message || "删除失败");
    }
    await list();
  };

  return {
    items,
    loading,
    error,
    list,
    create,
    update,
    remove,
  };
}
