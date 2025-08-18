import { like, desc, asc, count, eq, and, or, lt } from 'drizzle-orm'
import { db } from '~/server/database'
import { products, productCategories } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search as string || ''
    const category_id = query.category_id ? Number(query.category_id) : null
    const low_stock = query.low_stock === 'true'
    const sortBy = query.sortBy as string || 'updated_at'
    const sortOrder = query.sortOrder as string || 'desc'

    const offset = (page - 1) * limit

    // 构建查询条件
    const whereConditions = [eq(products.is_active, true)]

    if (search) {
      whereConditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.sku, `%${search}%`)
        )
      )
    }

    if (category_id) {
      whereConditions.push(
        eq(products.category_id, category_id)
      )
    }

    if (low_stock) {
      whereConditions.push(
        lt(products.stock_quantity, products.min_stock_level)
      )
    }

    // 合并查询条件
    const whereClause = whereConditions.length > 0
      ? whereConditions.reduce((acc, condition) => and(acc, condition))
      : undefined

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(products)
      .leftJoin(productCategories, eq(products.category_id, productCategories.id))
      .where(whereClause)

    const total = totalResult[0].count

    // 获取库存列表
    const orderByClause = sortOrder === 'desc'
      ? desc(products[sortBy])
      : asc(products[sortBy])

    const inventoryList = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        category_id: products.category_id,
        category_name: productCategories.name,
        stock_quantity: products.stock_quantity,
        min_stock_level: products.min_stock_level,
        max_stock_level: products.max_stock_level,
        unit: products.unit,
        cost_price: products.cost_price,
        selling_price: products.selling_price,
        location: products.location,
        updated_at: products.updated_at
      })
      .from(products)
      .leftJoin(productCategories, eq(products.category_id, productCategories.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    // 计算库存状态
    const inventoryWithStatus = inventoryList.map((item) => {
      let stockStatus = 'normal'
      let stockStatusText = '正常'

      if (item.stock_quantity <= 0) {
        stockStatus = 'out_of_stock'
        stockStatusText = '缺货'
      } else if (item.stock_quantity < item.min_stock_level) {
        stockStatus = 'low_stock'
        stockStatusText = '库存不足'
      } else if (item.stock_quantity > item.max_stock_level) {
        stockStatus = 'overstock'
        stockStatusText = '库存过多'
      }

      return {
        ...item,
        stock_status: stockStatus,
        stock_status_text: stockStatusText,
        stock_value: item.stock_quantity * (item.cost_price || 0)
      }
    })

    return {
      success: true,
      data: {
        data: inventoryWithStatus,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error) {
    console.error('获取库存列表失败:', error)

    throw createError({
      statusCode: 500,
      statusMessage: '获取库存列表失败'
    })
  }
})
