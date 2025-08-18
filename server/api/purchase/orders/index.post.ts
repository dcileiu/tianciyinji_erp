import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { purchaseOrders, purchaseOrderItems, suppliers, products } from '~/server/database/schema'

// 采购订单明细验证模式
const purchaseOrderItemSchema = z.object({
  product_id: z.number().int().positive('请选择产品'),
  quantity: z.number().int().positive('数量必须大于0'),
  unit_price: z.number().positive('单价必须大于0')
})

// 采购订单验证模式
const purchaseOrderSchema = z.object({
  supplier_id: z.number().int().positive('请选择供应商'),
  order_date: z.string().min(1, '订单日期不能为空'),
  expected_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, '订单必须包含至少一个商品')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = purchaseOrderSchema.parse(body)

    // 验证供应商是否存在且启用
    const supplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, validatedData.supplier_id))
      .limit(1)

    if (supplier.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '供应商不存在'
      })
    }

    if (supplier[0].status !== 'active') {
      throw createError({
        statusCode: 400,
        statusMessage: '供应商已禁用，无法创建采购订单'
      })
    }

    // 验证所有产品是否存在且启用
    for (const item of validatedData.items) {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.product_id))
        .limit(1)

      if (product.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: `产品ID ${item.product_id} 不存在`
        })
      }

      if (!product[0].is_active) {
        throw createError({
          statusCode: 400,
          statusMessage: `产品 ${product[0].name} 已禁用`
        })
      }
    }

    // 生成采购订单号
    const orderNumber = `PO${Date.now()}`

    // 计算总金额
    const totalAmount = validatedData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)

    // 开始事务
    const result = await db.transaction(async (tx) => {
      // 创建采购订单
      const [newOrder] = await tx
        .insert(purchaseOrders)
        .values({
          order_number: orderNumber,
          supplier_id: validatedData.supplier_id,
          order_date: new Date(validatedData.order_date),
          expected_date: validatedData.expected_date ? new Date(validatedData.expected_date) : null,
          total_amount: totalAmount,
          status: 'pending',
          notes: validatedData.notes || null,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning()

      // 创建采购订单明细
      const orderItems = validatedData.items.map(item => ({
        purchase_order_id: newOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price,
        created_at: new Date(),
        updated_at: new Date()
      }))

      await tx
        .insert(purchaseOrderItems)
        .values(orderItems)

      return newOrder
    })

    return {
      success: true,
      message: '采购订单创建成功',
      data: result
    }
  } catch (error) {
    console.error('创建采购订单失败:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.errors[0].message
      })
    }

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '创建采购订单失败'
    })
  }
})
