import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  try {
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '客户ID不能为空'
      })
    }

    // 检查客户是否存在关联的销售订单
    const { data: orders, error: orderError } = await supabase
      .from('sales_orders')
      .select('id')
      .eq('customer_id', id)
      .limit(1)

    if (orderError) {
      throw createError({
        statusCode: 500,
        statusMessage: '检查关联订单失败: ' + orderError.message
      })
    }

    if (orders && orders.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该客户存在关联的销售订单，无法删除'
      })
    }

    // 删除客户
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '删除客户失败: ' + error.message
      })
    }

    return {
      success: true,
      message: '客户删除成功'
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})
