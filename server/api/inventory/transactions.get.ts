import { like, desc, asc, count, eq, and } from 'drizzle-orm'
import { db } from '~/server/database'
import { inventoryTransactions, products } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search as string || ''
    const transaction_type = query.transaction_type as string || ''
    const product_id = query.product_id ? Number(query.product_id) : null
    const sortBy = query.sortBy as string || 'created_at'
    const sortOrder = query.sortOrder as string || 'desc'

    const offset = (page - 1) * limit

    // 构建查询条件
    const whereConditions = []

    if (search) {
      whereConditions.push(
        like(products.name, `%${search}%`)
      )
    }

    if (transaction_type) {
      whereConditions.push(
        eq(inventoryTransactions.transaction_type, transaction_type)
      )
    }

    if (product_id) {
      whereConditions.push(
        eq(inventoryTransactions.product_id, product_id)
      )
    }

    // 合并查询条件
    const whereClause = whereConditions.length > 0
      ? whereConditions.reduce((acc, condition) => and(acc, condition))
      : undefined

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(inventoryTransactions)
      .leftJoin(products, eq(inventoryTransactions.product_id, products.id))
      .where(whereClause)

    const total = totalResult[0].count

    // 获取库存变动记录列表
    const orderByClause = sortOrder === 'desc'
      ? desc(inventoryTransactions[sortBy])
      : asc(inventoryTransactions[sortBy])

    const transactionList = await db
      .select({
        id: inventoryTransactions.id,
        product_id: inventoryTransactions.product_id,
        product_name: products.name,
        product_sku: products.sku,
        transaction_type: inventoryTransactions.transaction_type,
        quantity: inventoryTransactions.quantity,
        unit_price: inventoryTransactions.unit_price,
        total_amount: inventoryTransactions.total_amount,
        reference_type: inventoryTransactions.reference_type,
        reference_id: inventoryTransactions.reference_id,
        reason: inventoryTransactions.reason,
        notes: inventoryTransactions.notes,
        created_at: inventoryTransactions.created_at
      })
      .from(inventoryTransactions)
      .leftJoin(products, eq(inventoryTransactions.product_id, products.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    // 添加交易类型文本
    const transactionsWithText = transactionList.map((transaction) => {
      let typeText = ''
      let typeColor = 'gray'

      switch (transaction.transaction_type) {
        case 'stock_in':
          typeText = '入库'
          typeColor = 'green'
          break
        case 'stock_out':
          typeText = '出库'
          typeColor = 'red'
          break
        case 'sale':
          typeText = '销售出库'
          typeColor = 'blue'
          break
        case 'purchase':
          typeText = '采购入库'
          typeColor = 'purple'
          break
        case 'return':
          typeText = '退货入库'
          typeColor = 'orange'
          break
        default:
          typeText = transaction.transaction_type
      }

      return {
        ...transaction,
        type_text: typeText,
        type_color: typeColor
      }
    })

    return {
      success: true,
      data: {
        data: transactionsWithText,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error) {
    console.error('获取库存变动记录失败:', error)

    throw createError({
      statusCode: 500,
      statusMessage: '获取库存变动记录失败'
    })
  }
})
