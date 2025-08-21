import type { PaginationParams, PaginationResponse, ApiResponse } from '../types/database'

export const useDatabase = () => {
  const supabase = useSupabaseClient()

  // 通用查询方法
  const findMany = async <T>(
    table: string,
    params: PaginationParams & { filters?: Record<string, any> } = { page: 1, pageSize: 10 }
  ): Promise<PaginationResponse<T>> => {
    try {
      let query = supabase.from(table).select('*', { count: 'exact' })

      // 应用筛选条件
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'string' && key.includes('search')) {
              query = query.ilike(key.replace('_search', ''), `%${value}%`)
            } else {
              query = query.eq(key, value)
            }
          }
        })
      }

      // 排序
      if (params.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // 分页
      const from = (params.page - 1) * params.pageSize
      const to = from + params.pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        data: data as T[],
        total: count || 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil((count || 0) / params.pageSize)
      }
    } catch (error) {
      console.error(`Error fetching ${table}:`, error)
      throw error
    }
  }

  // 根据ID查询单条记录
  const findById = async <T>(table: string, id: string): Promise<T | null> => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as T || null
    } catch (error) {
      console.error(`Error fetching ${table} by id:`, error)
      throw error
    }
  }

  // 创建记录
  const create = async <T>(table: string, data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single()

      if (error) {
        throw error
      }

      return result as T
    } catch (error) {
      console.error(`Error creating ${table}:`, error)
      throw error
    }
  }

  // 更新记录
  const update = async <T>(
    table: string, 
    id: string, 
    data: Partial<Omit<T, 'id' | 'created_at'>>
  ): Promise<T> => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return result as T
    } catch (error) {
      console.error(`Error updating ${table}:`, error)
      throw error
    }
  }

  // 删除记录
  const remove = async (table: string, id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error(`Error deleting ${table}:`, error)
      throw error
    }
  }

  // 批量删除
  const removeMany = async (table: string, ids: string[]): Promise<void> => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error(`Error batch deleting ${table}:`, error)
      throw error
    }
  }

  // 检查记录是否存在
  const exists = async (
    table: string, 
    conditions: Record<string, any> | Array<{column: string, value: any}>
  ): Promise<boolean> => {
    try {
      let query = supabase.from(table).select('id')
      
      if (Array.isArray(conditions)) {
        // 支持多条件查询
        conditions.forEach(condition => {
          query = query.eq(condition.column, condition.value)
        })
      } else {
        // 支持对象形式的条件
        Object.entries(conditions).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      const { data, error } = await query.maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error(`Error checking existence in ${table}:`, error)
      throw error
    }
  }

  // 获取统计数据
  const getStats = async (
    table: string, 
    metric?: 'count' | 'sum',
    conditions?: Array<{column: string, value: any, operator?: string}>, 
    column?: string
  ): Promise<number> => {
    try {
      let query = supabase.from(table)
      
      if (metric === 'sum' && column) {
        query = query.select(column)
      } else {
        query = query.select('*', { count: 'exact', head: true })
      }

      if (conditions) {
        conditions.forEach(condition => {
          if (condition.operator === 'gte') {
            query = query.gte(condition.column, condition.value)
          } else {
            query = query.eq(condition.column, condition.value)
          }
        })
      }

      const { data, count, error } = await query

      if (error) {
        throw error
      }

      if (metric === 'sum' && column && data) {
        return data.reduce((sum, row) => sum + (row[column] || 0), 0)
      }

      return count || 0
    } catch (error) {
      console.error(`Error getting stats for ${table}:`, error)
      throw error
    }
  }

  return {
    findMany,
    findById,
    create,
    update,
    remove,
    removeMany,
    exists,
    getStats
  }
} 