import type { Database } from '~/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

const supabase = useSupabaseClient<Database>();

export { supabase };

// 商品数据库操作
export const useProducts = () => {
  // 获取所有商品
  const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Product[];
  };

  // 根据ID获取商品
  const getProductById = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as Product;
  };

  // 创建商品
  const createProduct = async (product: ProductInsert): Promise<Product> => {
    const { data, error } = await (supabase as any)
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Product;
  };

  // 更新商品
  const updateProduct = async (
    id: string,
    updates: ProductUpdate
  ): Promise<Product> => {
    const { data, error } = await (supabase as any)
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Product;
  };

  // 删除商品
  const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw error;
    }
  };

  // 搜索商品
  const searchProducts = async (query: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(
        `name.ilike.%${query}%,product_no.ilike.%${query}%,specification.ilike.%${query}%`
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Product[];
  };

  // 按分类筛选商品
  const getProductsByCategory = async (
    category: string
  ): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Product[];
  };

  // 按状态筛选商品
  const getProductsByStatus = async (status: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Product[];
  };

  // 获取库存不足的商品
  const getLowStockProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .filter('current_stock', 'lte', 'min_stock')
      .gt('current_stock', 0)
      .order('current_stock', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as Product[];
  };

  // 获取缺货商品
  const getOutOfStockProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('current_stock', 0)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as Product[];
  };

  // 获取商品统计信息
  const getProductStats = async () => {
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('current_stock, min_stock, unit_price, status');

    if (error) {
      throw error;
    }

    const products = (allProducts || []) as any[];
    const totalProducts = products.length;
    const activeProducts = products.filter(
      (p: any) => p.status === 'active'
    ).length;
    const lowStockProducts = products.filter(
      (p: any) => p.current_stock <= p.min_stock && p.current_stock > 0
    ).length;
    const outOfStockProducts = products.filter(
      (p: any) => p.current_stock === 0
    ).length;
    const totalStockValue = products.reduce(
      (sum: number, p: any) => sum + p.current_stock * p.unit_price,
      0
    );

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
    };
  };

  return {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByCategory,
    getProductsByStatus,
    getLowStockProducts,
    getOutOfStockProducts,
    getProductStats,
  };
};
