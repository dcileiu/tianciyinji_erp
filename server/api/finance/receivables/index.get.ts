import { createClient } from '@supabase/supabase-js'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      page = 1,
      limit = 10,
      search = '',
      customer_id = '',
      status = '',
      start_date = '',
      end_date = ''
    } = query

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let queryBuilder = supabase
      .from('receivables')
      .select(`
        *,
        customers!inner(id, name, contact_person),
        sales_orders!inner(id, order_number)
      `, { count: 'exact' })

    // 搜索条件
    if (search) {
      queryBuilder = queryBuilder.or(
        `customers.name.ilike.%${search}%,sales_orders.order_number.ilike.%${search}%,invoice_number.ilike.%${search}%`
      )
    }

    // 客户筛选
    if (customer_id) {
      queryBuilder = queryBuilder.eq('customer_id', customer_id)
    }

    // 状态筛选
    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    // 日期范围筛选
    if (start_date) {
      queryBuilder = queryBuilder.gte('due_date', start_date)
    }
    if (end_date) {
      queryBuilder = queryBuilder.lte('due_date', end_date)
    }

    // 分页和排序
    const offset = (Number(page) - 1) * Number(limit)
    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    const { data, error, count } = await queryBuilder

    if (error) {
      throw error
    }

    // 处理数据，添加状态文本和颜色
    const processedData = data?.map(item => ({
      ...item,
      customer_name: item.customers?.name,
      order_number: item.sales_orders?.order_number,
      status_text: getStatusText(item.status),
      status_color: getStatusColor(item.status),
      overdue_days: item.status === 'overdue'
        ? Math.floor((new Date().getTime() - new Date(item.due_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0
    })) || []

    return {
      success: true,
      data: {
        data: processedData,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      }
    }
  } catch (error) {
    console.error('获取应收账款失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取应收账款失败'
    })
  }
})

function getStatusText (status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待收款',
    partial: '部分收款',
    paid: '已收款',
    overdue: '逾期'
  }
  return statusMap[status] || status
}

function getStatusColor (status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'yellow',
    partial: 'blue',
    paid: 'green',
    overdue: 'red'
  }
  return colorMap[status] || 'gray'
}
