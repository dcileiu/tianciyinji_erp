import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { salesOrders, salesOrderItems, customers, products } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const orderId = getRouterParam(event, 'id')

    if (!orderId || isNaN(Number(orderId))) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的订单ID'
      })
    }

    // 获取订单基本信息
    const orderResult = await db
      .select({
        id: salesOrders.id,
        order_number: salesOrders.order_number,
        customer_id: salesOrders.customer_id,
        order_date: salesOrders.order_date,
        delivery_date: salesOrders.delivery_date,
        total_amount: salesOrders.total_amount,
        status: salesOrders.status,
        notes: salesOrders.notes,
        created_at: salesOrders.created_at,
        updated_at: salesOrders.updated_at,
        customer_name: customers.name,
        customer_contact: customers.contact_person,
        customer_phone: customers.phone,
        customer_email: customers.email
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customer_id, customers.id))
      .where(eq(salesOrders.id, Number(orderId)))
      .limit(1)

    if (orderResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '订单不存在'
      })
    }

    const order = orderResult[0]

    // 获取订单明细
    const orderItems = await db
      .select({
        id: salesOrderItems.id,
        product_id: salesOrderItems.product_id,
        quantity: salesOrderItems.quantity,
        unit_price: salesOrderItems.unit_price,
        subtotal: salesOrderItems.subtotal,
        product_name: products.name,
        product_sku: products.sku,
        product_unit: products.unit
      })
      .from(salesOrderItems)
      .leftJoin(products, eq(salesOrderItems.product_id, products.id))
      .where(eq(salesOrderItems.sales_order_id, Number(orderId)))

    // 组装返回数据
    const orderDetail = {
      ...order,
      customers: {
        name: order.customer_name,
        contact_person: order.customer_contact,
        phone: order.customer_phone,
        email: order.customer_email
      },
      sales_order_items: orderItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        products: {
          name: item.product_name,
          sku: item.product_sku,
          unit: item.product_unit
        }
      }))
    }

    // 移除重复的客户字段
    delete orderDetail.customer_name
    delete orderDetail.customer_contact
    delete orderDetail.customer_phone
    delete orderDetail.customer_email

    return {
      success: true,
      data: orderDetail
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '获取订单详情失败'
    })
  }
})
