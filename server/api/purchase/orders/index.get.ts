import { like, desc, asc, count, eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { purchaseOrders, suppliers } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search as string || ''
    const status = query.status as string || ''
    const supplier_id = query.supplier_id ? Number(query.supplier_id) : null
    const sortBy = query.sortBy as string || 'created_at'
    const sortOrder = query.sortOrder as string || 'desc'

    const offset = (page - 1) * limit

    // 构建查询条件
    const whereConditions = []

    if (search) {
      whereConditions.push(
        like(purchaseOrders.order_number, `%${search}%`)
      )
    }

    if (status) {
      whereConditions.push(
        eq(purchaseOrders.status, status)
      )
    }

    if (supplier_id) {
      whereConditions.push(
        eq(purchaseOrders.supplier_id, supplier_id)
      )
    }

    // 合并查询条件
    const whereClause = whereConditions.length > 0
      ? whereConditions.reduce((acc, condition) => acc && condition)
      : undefined

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplier_id, suppliers.id))
      .where(whereClause)

    const total = totalResult[0].count

    // 获取采购订单列表
    const orderByClause = sortOrder === 'desc'
      ? desc(purchaseOrders[sortBy])
      : asc(purchaseOrders[sortBy])

    const orderList = await db
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
        supplier_name: suppliers.name
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplier_id, suppliers.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    return {
      success: true,
      data: {
        data: orderList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error) {
    console.error('获取采购订单列表失败:', error)

    throw createError({
      statusCode: 500,
      statusMessage: '获取采购订单列表失败'
    })
  }
})
