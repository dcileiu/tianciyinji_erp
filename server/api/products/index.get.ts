import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string
    const category_id = query.category_id as string
    const is_active = query.is_active as string

    let queryBuilder = supabase
      .from('products')
      .select(`
        *,
        product_categories(id, name)
      `, { count: 'exact' })

    // 搜索功能
    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // 按分类筛选
    if (category_id) {
      queryBuilder = queryBuilder.eq('category_id', category_id)
    }

    // 按状态筛选
    if (is_active !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', is_active === 'true')
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await queryBuilder
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '获取产品列表失败: ' + error.message
      })
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})
