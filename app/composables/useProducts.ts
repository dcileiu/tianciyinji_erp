import { useMasterEntity } from "~/composables/useMasterEntity";

export type Product = {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  specification?: string | null;
  unit?: string | null;
  price?: string | number;
  cost?: string | number;
  status?: string;
  remark?: string | null;
  created_at?: string;
  updated_at?: string;
};

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
