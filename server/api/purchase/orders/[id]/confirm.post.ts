import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { purchaseOrders } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const orderId = getRouterParam(event, 'id')

    if (!orderId || isNaN(Number(orderId))) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的订单ID'
      })
    }

    // 检查订单是否存在
    const existingOrder = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, Number(orderId)))
      .limit(1)

    if (existingOrder.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '采购订单不存在'
      })
    }

    const order = existingOrder[0]

    // 检查订单状态
    if (order.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: '只有待确认状态的订单才能确认'
      })
    }

    // 更新订单状态为已确认
    await db
      .update(purchaseOrders)
      .set({
        status: 'confirmed',
        updated_at: new Date()
      })
      .where(eq(purchaseOrders.id, Number(orderId)))

    return {
      success: true,
      message: '采购订单确认成功'
    }
  } catch (error) {
    console.error('确认采购订单失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '确认采购订单失败'
    })
  }
})
