import { ref, computed } from 'vue'
import type { Database } from '~/types/database.types'

type Supplier = Database['public']['Tables']['suppliers']['Row']
type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']
type SupplierUpdate = Database['public']['Tables']['suppliers']['Update']

export const useSuppliers = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // 供应商相关状态
  const suppliers = ref<Supplier[]>([])
  const currentSupplier = ref<Supplier | null>(null)

  // 统计数据
  const supplierStats = computed(() => {
    const total = suppliers.value.length
    const active = suppliers.value.filter(s => s.status === 'active').length
    const inactive = suppliers.value.filter(s => s.status === 'inactive').length

    return {
      total,
      active,
      inactive,
    }
  })

  // 获取供应商列表
  const getSuppliers = async (filters?: { status?: string; type?: string; name?: string }) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase.from('suppliers').select('*').order('created_at', { ascending: false })

      // 应用筛选条件
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.type) {
        query = query.eq('supplier_type', filters.type)
      }
      if (filters?.name) {
        query = query.ilike('name', `%${filters.name}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      suppliers.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取供应商列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取单个供应商详情
  const getSupplier = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase.from('suppliers').select('*').eq('id', id).single()

      if (fetchError) throw fetchError

      currentSupplier.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取供应商详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建供应商
  const createSupplier = async (supplierData: SupplierInsert) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: createError } = await (supabase as any)
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single()

      if (createError) throw createError

      // 刷新供应商列表
      await getSuppliers()

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建供应商失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新供应商
  const updateSupplier = async (id: string, updates: SupplierUpdate) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await (supabase as any)
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // 更新本地状态
      const index = suppliers.value.findIndex(s => s.id === id)
      if (index !== -1) {
        suppliers.value[index] = data
      }

      if (currentSupplier.value?.id === id) {
        currentSupplier.value = data
      }

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新供应商失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除供应商
  const deleteSupplier = async (id: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase.from('suppliers').delete().eq('id', id)

      if (deleteError) throw deleteError

      // 从本地状态中移除
      suppliers.value = suppliers.value.filter(s => s.id !== id)

      if (currentSupplier.value?.id === id) {
        currentSupplier.value = null
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除供应商失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    loading,
    error,
    suppliers,
    currentSupplier,
    supplierStats,

    // 方法
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  }
}
