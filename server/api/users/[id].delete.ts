import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户ID不能为空'
      })
    }

    // 检查用户是否存在
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    }

    // 检查用户是否有关联的业务数据
    // 检查销售订单
    const { data: salesOrders } = await supabase
      .from('sales_orders')
      .select('id')
      .eq('created_by', userId)
      .limit(1)

    if (salesOrders && salesOrders.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该用户有关联的销售订单，无法删除'
      })
    }

    // 检查采购订单
    const { data: purchaseOrders } = await supabase
      .from('purchase_orders')
      .select('id')
      .eq('created_by', userId)
      .limit(1)

    if (purchaseOrders && purchaseOrders.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该用户有关联的采购订单，无法删除'
      })
    }

    // 检查库存调整记录
    const { data: inventoryTransactions } = await supabase
      .from('inventory_transactions')
      .select('id')
      .eq('created_by', userId)
      .limit(1)

    if (inventoryTransactions && inventoryTransactions.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该用户有关联的库存调整记录，无法删除'
      })
    }

    // 检查收款记录
    const { data: receivablePayments } = await supabase
      .from('receivable_payments')
      .select('id')
      .eq('created_by', userId)
      .limit(1)

    if (receivablePayments && receivablePayments.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该用户有关联的收款记录，无法删除'
      })
    }

    // 检查付款记录
    const { data: payablePayments } = await supabase
      .from('payable_payments')
      .select('id')
      .eq('created_by', userId)
      .limit(1)

    if (payablePayments && payablePayments.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该用户有关联的付款记录，无法删除'
      })
    }

    // 开始事务删除
    // 首先从用户表删除
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: '删除用户失败',
        data: deleteError
      })
    }

    // 然后从 Auth 删除
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error('删除 Auth 用户失败:', authDeleteError)
      // Auth 删除失败不影响数据库删除，只记录错误
      // 因为用户表已经删除，用户无法登录
    }

    return {
      success: true,
      message: '用户删除成功'
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('删除用户错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '删除用户失败'
    })
  }
})
