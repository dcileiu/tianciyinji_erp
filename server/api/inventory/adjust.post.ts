import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/database'
import { products, inventoryTransactions } from '~/server/database/schema'

// 库存调整验证模式
const inventoryAdjustSchema = z.object({
  product_id: z.number().int().positive('请选择产品'),
  adjustment_type: z.enum(['in', 'out'], { message: '调整类型必须是入库或出库' }),
  quantity: z.number().int().positive('数量必须大于0'),
  reason: z.string().min(1, '调整原因不能为空'),
  notes: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = inventoryAdjustSchema.parse(body)

    // 验证产品是否存在且启用
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, validatedData.product_id))
      .limit(1)

    if (product.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '产品不存在'
      })
    }

    if (!product[0].is_active) {
      throw createError({
        statusCode: 400,
        statusMessage: '产品已禁用，无法调整库存'
      })
    }

    const currentStock = product[0].stock_quantity

    // 检查出库时库存是否足够
    if (validatedData.adjustment_type === 'out' && currentStock < validatedData.quantity) {
      throw createError({
        statusCode: 400,
        statusMessage: `库存不足，当前库存: ${currentStock}，需要出库: ${validatedData.quantity}`
      })
    }

    // 计算调整后的库存数量
    const adjustmentQuantity = validatedData.adjustment_type === 'in'
      ? validatedData.quantity
      : -validatedData.quantity

    const newStock = currentStock + adjustmentQuantity

    // 开始事务
    const result = await db.transaction(async (tx) => {
      // 更新产品库存
      await tx
        .update(products)
        .set({
          stock_quantity: newStock,
          updated_at: new Date()
        })
        .where(eq(products.id, validatedData.product_id))

      // 记录库存变动
      const [transaction] = await tx
        .insert(inventoryTransactions)
        .values({
          product_id: validatedData.product_id,
          transaction_type: validatedData.adjustment_type === 'in' ? 'stock_in' : 'stock_out',
          quantity: validatedData.quantity,
          unit_price: product[0].cost_price || 0,
          total_amount: validatedData.quantity * (product[0].cost_price || 0),
          reference_type: 'adjustment',
          reference_id: null,
          reason: validatedData.reason,
          notes: validatedData.notes || null,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning()

      return {
        transaction,
        previous_stock: currentStock,
        new_stock: newStock,
        adjustment_quantity: adjustmentQuantity
      }
    })

    return {
      success: true,
      message: '库存调整成功',
      data: result
    }
  } catch (error) {
    console.error('库存调整失败:', error)

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
      statusMessage: '库存调整失败'
    })
  }
})
