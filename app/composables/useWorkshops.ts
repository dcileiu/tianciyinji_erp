export type Workshop = {
  id: string;
  code: string;
  name: string;
  status: string;
  remark?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const useWorkshops = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const workshops = ref<Workshop[]>([]);
  const currentWorkshop = ref<Workshop | null>(null);

  const fetchWorkshops = async (filters?: {
    status?: string;
    search?: string;
  }) => {
    try {
      loading.value = true;
      error.value = null;
      const res = await $fetch<{
        code: number;
        data: Workshop[];
        message: string;
      }>("/api/workshops", {
        query: {
          status: filters?.status || "all",
          search: filters?.search,
        },
      });
      if (res.code !== 0) {
        throw new Error(res.message || "获取车间列表失败");
      }
      workshops.value = res.data || [];
      return workshops.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取车间列表失败";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createWorkshop = async (payload: {
    code: string;
    name: string;
    status?: string;
    remark?: string;
  }) => {
    const res = await $fetch<{ code: number; data: Workshop; message: string }>(
      "/api/workshops",
      { method: "POST", body: payload }
    );
    if (res.code !== 0) {
      throw new Error(res.message || "创建失败");
    }
    await fetchWorkshops();
    return res.data;
  };

  const updateWorkshop = async (
    id: string,
    payload: Partial<Omit<Workshop, "id">>
  ) => {
    const res = await $fetch<{ code: number; data: Workshop; message: string }>(
      "/api/workshops",
      { method: "PUT", body: { id, ...payload } }
    );
    if (res.code !== 0) {
      throw new Error(res.message || "更新失败");
    }
    await fetchWorkshops();
    return res.data;
  };

  const deleteWorkshop = async (id: string) => {
    const res = await $fetch<{ code: number; message: string }>(
      "/api/workshops",
      { method: "DELETE", body: { id } }
    );
    if (res.code !== 0) {
      throw new Error(res.message || "删除失败");
    }
    workshops.value = workshops.value.filter((w) => w.id !== id);
    return true;
  };

  return {
    loading,
    error,
    workshops,
    currentWorkshop,
    fetchWorkshops,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
  };
};
