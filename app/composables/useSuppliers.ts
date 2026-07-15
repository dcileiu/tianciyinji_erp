import { computed } from "vue";
import { useMasterEntity } from "~/composables/useMasterEntity";
import type { Database } from "~/types/database.types";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];

export const useSuppliers = () => {
  const api = useMasterEntity<Supplier>("/api/suppliers");

  const supplierStats = computed(() => {
    const total = api.items.value.length;
    const active = api.items.value.filter((s) => s.status === "active").length;
    const inactive = api.items.value.filter(
      (s) => s.status === "inactive"
    ).length;
    return { total, active, inactive };
  });

  return {
    suppliers: api.items,
    loading: api.loading,
    error: api.error,
    supplierStats,
    getSuppliers: (filters?: { status?: string; name?: string }) =>
      api.list({
        status: filters?.status,
        search: filters?.name,
      }),
    createSupplier: (body: Partial<Supplier>) => api.create(body),
    updateSupplier: (id: string, body: Partial<Supplier>) =>
      api.update({ ...body, id }),
    deleteSupplier: (id: string) => api.remove(id),
  };
};
