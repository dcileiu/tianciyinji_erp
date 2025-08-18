import { like, desc, asc, count } from 'drizzle-orm'
import { db } from '~/server/database'
import { suppliers } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search as string || ''
    const sortBy = query.sortBy as string || 'created_at'
    const sortOrder = query.sortOrder as string || 'desc'

    const offset = (page - 1) * limit

    // 构建查询条件
    const whereConditions = []

    if (search) {
      whereConditions.push(
        like(suppliers.name, `%${search}%`)
      )
    }

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(suppliers)
      .where(whereConditions.length > 0 ? whereConditions[0] : undefined)

    const total = totalResult[0].count

    // 获取供应商列表
    const orderByClause = sortOrder === 'desc' ? desc(suppliers[sortBy]) : asc(suppliers[sortBy])

    const supplierList = await db
      .select({
        id: suppliers.id,
        name: suppliers.name,
        contact_person: suppliers.contact_person,
        phone: suppliers.phone,
        email: suppliers.email,
        address: suppliers.address,
        status: suppliers.status,
        created_at: suppliers.created_at,
        updated_at: suppliers.updated_at
      })
      .from(suppliers)
      .where(whereConditions.length > 0 ? whereConditions[0] : undefined)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    return {
      success: true,
      data: {
        data: supplierList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error) {
    console.error('获取供应商列表失败:', error)

    throw createError({
      statusCode: 500,
      statusMessage: '获取供应商列表失败'
    })
  }
})
