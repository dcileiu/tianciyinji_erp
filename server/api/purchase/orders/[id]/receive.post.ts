import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/database'
import { purchaseOrders, purchaseOrderItems, products } from '~/server/database/schema'

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
    if (order.status !== 'confirmed') {
      throw createError({
        statusCode: 400,
        statusMessage: '只有已确认状态的订单才能收货'
      })
    }

    // 获取订单明细
    const orderItems = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchase_order_id, Number(orderId)))

    // 开始事务处理收货
    await db.transaction(async (tx) => {
      // 更新订单状态为已收货
      await tx
        .update(purchaseOrders)
        .set({
          status: 'received',
          updated_at: new Date()
        })
        .where(eq(purchaseOrders.id, Number(orderId)))

      // 更新产品库存
      for (const item of orderItems) {
        await tx
          .update(products)
          .set({
            stock_quantity: sql`stock_quantity + ${item.quantity}`,
            updated_at: new Date()
          })
          .where(eq(products.id, item.product_id))
      }
    })

    return {
      success: true,
      message: '采购订单收货成功，库存已更新'
    }
  } catch (error) {
    console.error('采购订单收货失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '采购订单收货失败'
    })
  }
})
