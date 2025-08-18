import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { suppliers, purchaseOrders } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const supplierId = getRouterParam(event, 'id')

    if (!supplierId || isNaN(Number(supplierId))) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的供应商ID'
      })
    }

    // 检查供应商是否存在
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, Number(supplierId)))
      .limit(1)

    if (existingSupplier.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: '供应商不存在'
      })
    }

    // 检查是否有关联的采购订单
    const relatedOrders = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.supplier_id, Number(supplierId)))
      .limit(1)

    if (relatedOrders.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该供应商存在关联的采购订单，无法删除'
      })
    }

    // 删除供应商
    await db
      .delete(suppliers)
      .where(eq(suppliers.id, Number(supplierId)))

    return {
      success: true,
      message: '供应商删除成功'
    }
  } catch (error) {
    console.error('删除供应商失败:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: '删除供应商失败'
    })
  }
})
