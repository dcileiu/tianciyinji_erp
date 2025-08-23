import type { Product } from '~/types/database'
import type { Database } from '~/types/database.types'

const supabase = useSupabaseClient<Database>()

export { supabase }

// 商品数据库操作
export const useProducts = () => {
  // 获取所有商品
  const getProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取商品列表失败:', error)
      throw error
    }
    
    return (data || []) as Product[]
  }

  // 根据ID获取商品
  const getProductById = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('获取商品详情失败:', error)
      throw error
    }
    
    return data as Product
  }

  // 创建商品
  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) {
      console.error('创建商品失败:', error)
      throw error
    }
    
    return data as Product
  }

  // 更新商品
  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('更新商品失败:', error)
      throw error
    }
    
    return data as Product
  }

  // 删除商品
  const deleteProduct = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除商品失败:', error)
      throw error
    }
  }

  // 搜索商品
  const searchProducts = async (query: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,product_no.ilike.%${query}%,specification.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('搜索商品失败:', error)
      throw error
    }
    
    return (data || []) as Product[]
  }

  // 按分类筛选商品
  const getProductsByCategory = async (category: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('按分类获取商品失败:', error)
      throw error
    }
    
    return (data || []) as Product[]
  }

  // 按状态筛选商品
  const getProductsByStatus = async (status: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('按状态获取商品失败:', error)
      throw error
    }
    
    return (data || []) as Product[]
  }

  // 获取库存不足的商品
  const getLowStockProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .filter('current_stock', 'lte', 'min_stock')
      .gt('current_stock', 0)
      .order('current_stock', { ascending: true })
    
    if (error) {
      console.error('获取库存不足商品失败:', error)
      throw error
    }
    
    return (data || []) as Product[]
  }

  // 获取缺货商品
  const getOutOfStockProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('current_stock', 0)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('获取缺货商品失败:', error)
      throw error
    }
    
    return (data || []) as Product[]
  }

  // 获取商品统计信息
  const getProductStats = async () => {
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('current_stock, min_stock, unit_price, status')
    
    if (error) {
      console.error('获取商品统计失败:', error)
      throw error
    }

    const products = (allProducts || []) as any[]
    const totalProducts = products.length
    const activeProducts = products.filter((p: any) => p.status === 'active').length
    const lowStockProducts = products.filter((p: any) => p.current_stock <= p.min_stock && p.current_stock > 0).length
    const outOfStockProducts = products.filter((p: any) => p.current_stock === 0).length
    const totalStockValue = products.reduce((sum: number, p: any) => sum + (p.current_stock * p.unit_price), 0)

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue
    }
  }

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
    getProductStats
  }
}
