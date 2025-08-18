import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string

    let queryBuilder = supabase
      .from('customers')
      .select('*', { count: 'exact' })

    // 搜索功能
    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
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
        statusMessage: '获取客户列表失败: ' + error.message
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
