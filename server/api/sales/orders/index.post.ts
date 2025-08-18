import { z } from 'zod'
import { serverSupabaseServiceRole } from '#supabase/server'

const orderItemSchema = z.object({
  product_id: z.number().int().positive('请选择产品'),
  quantity: z.number().int().positive('数量必须大于0'),
  unit_price: z.number().positive('单价必须大于0')
})

const createOrderSchema = z.object({
  customer_id: z.number().int().positive('请选择客户'),
  order_date: z.string().min(1, '订单日期不能为空'),
  delivery_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, '订单必须包含至少一个商品')
})

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)

  try {
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = createOrderSchema.parse(body)

    // 验证客户是否存在
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('id', validatedData.customer_id)
      .single()

    if (!customer) {
      throw createError({
        statusCode: 400,
        statusMessage: '客户不存在'
      })
    }

    // 验证所有产品是否存在并获取当前库存
    const productIds = validatedData.items.map(item => item.product_id)
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, stock_quantity, is_active')
      .in('id', productIds)

    if (productError) {
      throw createError({
        statusCode: 500,
        statusMessage: '验证产品失败: ' + productError.message
      })
    }

    if (products.length !== productIds.length) {
      throw createError({
        statusCode: 400,
        statusMessage: '部分产品不存在'
      })
    }

    // 检查产品是否激活和库存是否充足
    for (const item of validatedData.items) {
      const product = products.find(p => p.id === item.product_id)
      if (!product.is_active) {
        throw createError({
          statusCode: 400,
          statusMessage: `产品ID ${item.product_id} 已停用`
        })
      }
      if (product.stock_quantity < item.quantity) {
        throw createError({
          statusCode: 400,
          statusMessage: `产品ID ${item.product_id} 库存不足，当前库存：${product.stock_quantity}`
        })
      }
    }

    // 生成订单号
    const orderNumber = `SO${Date.now()}`

    // 计算总金额
    const totalAmount = validatedData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)

    // 创建销售订单
    const { data: order, error: orderError } = await supabase
      .from('sales_orders')
      .insert({
        order_number: orderNumber,
        customer_id: validatedData.customer_id,
        order_date: validatedData.order_date,
        delivery_date: validatedData.delivery_date,
        total_amount: totalAmount,
        status: 'pending',
        notes: validatedData.notes
      })
      .select()
      .single()

    if (orderError) {
      throw createError({
        statusCode: 500,
        statusMessage: '创建销售订单失败: ' + orderError.message
      })
    }

    // 创建订单明细
    const orderItems = validatedData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price
    }))

    const { error: itemsError } = await supabase
      .from('sales_order_items')
      .insert(orderItems)

    if (itemsError) {
      // 如果创建明细失败，删除已创建的订单
      await supabase.from('sales_orders').delete().eq('id', order.id)
      throw createError({
        statusCode: 500,
        statusMessage: '创建订单明细失败: ' + itemsError.message
      })
    }

    // 获取完整的订单信息
    const { data: fullOrder } = await supabase
      .from('sales_orders')
      .select(`
        *,
        customers(id, name, contact_person),
        sales_order_items(
          *,
          products(id, name, sku)
        )
      `)
      .eq('id', order.id)
      .single()

    return {
      success: true,
      data: fullOrder,
      message: '销售订单创建成功'
    }
  } catch (error) {
    if (error.issues) {
      // Zod 验证错误
      throw createError({
        statusCode: 400,
        statusMessage: '数据验证失败',
        data: error.issues
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})
