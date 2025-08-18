import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { salesOrders } from '~/server/database/schema'

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
      .from(salesOrders)
      .where(eq(salesOrders.id, Number(orderId)))
      .limit(1)

    if (existingOrder.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '订单不存在'
      })
    }

    const order = existingOrder[0]

    // 检查订单状态
    if (order.status !== 'confirmed') {
      throw createError({
        statusCode: 400,
        statusMessage: '只能发货已确认状态的订单'
      })
    }

    // 更新订单状态为已发货
    const [updatedOrder] = await db
      .update(salesOrders)
      .set({
        status: 'shipped',
        updated_at: new Date()
      })
      .where(eq(salesOrders.id, Number(orderId)))
      .returning()

    return {
      success: true,
      message: '订单发货成功',
      data: updatedOrder
    }
  } catch (error) {
    console.error('订单发货失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '订单发货失败'
    })
  }
})
