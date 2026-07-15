import { useMasterEntity } from "~/composables/useMasterEntity";
import type { Database } from "~/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

/** 产品主数据（服务端 API） */
export const useProducts = () => {
  const api = useMasterEntity<Product>("/api/products");

  return {
    products: api.items,
    loading: api.loading,
    error: api.error,
    getProducts: (query?: { search?: string; status?: string }) =>
      api.list(query),
    createProduct: (body: Partial<Product>) => api.create(body),
    updateProduct: (id: string, body: Partial<Product>) =>
      api.update({ ...body, id }),
    deleteProduct: (id: string) => api.remove(id),
  };
};
