import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { purchaseOrders, purchaseOrderItems, suppliers, products } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const orderId = getRouterParam(event, 'id')

    if (!orderId || isNaN(Number(orderId))) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的订单ID'
      })
    }

    // 获取采购订单基本信息
    const orderResult = await db
      .select({
        id: purchaseOrders.id,
        order_number: purchaseOrders.order_number,
        supplier_id: purchaseOrders.supplier_id,
        order_date: purchaseOrders.order_date,
        expected_date: purchaseOrders.expected_date,
        total_amount: purchaseOrders.total_amount,
        status: purchaseOrders.status,
        notes: purchaseOrders.notes,
        created_at: purchaseOrders.created_at,
        updated_at: purchaseOrders.updated_at,
        supplier_name: suppliers.name,
        supplier_contact: suppliers.contact_person,
        supplier_phone: suppliers.phone
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplier_id, suppliers.id))
      .where(eq(purchaseOrders.id, Number(orderId)))
      .limit(1)

    if (orderResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '采购订单不存在'
      })
    }

    const order = orderResult[0]

    // 获取订单明细
    const items = await db
      .select({
        id: purchaseOrderItems.id,
        product_id: purchaseOrderItems.product_id,
        quantity: purchaseOrderItems.quantity,
        unit_price: purchaseOrderItems.unit_price,
        subtotal: purchaseOrderItems.subtotal,
        product_name: products.name,
        product_sku: products.sku,
        product_unit: products.unit
      })
      .from(purchaseOrderItems)
      .leftJoin(products, eq(purchaseOrderItems.product_id, products.id))
      .where(eq(purchaseOrderItems.purchase_order_id, Number(orderId)))

    return {
      success: true,
      data: {
        ...order,
        items
      }
    }
  } catch (error) {
    console.error('获取采购订单详情失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '获取采购订单详情失败'
    })
  }
})
