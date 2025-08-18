import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { suppliers } from '~/server/database/schema'

// 供应商数据验证模式
const supplierSchema = z.object({
  name: z.string().min(1, '供应商名称不能为空').max(100, '供应商名称不能超过100个字符'),
  contact_person: z.string().min(1, '联系人不能为空').max(50, '联系人姓名不能超过50个字符'),
  phone: z.string().min(1, '联系电话不能为空').max(20, '联系电话不能超过20个字符'),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  address: z.string().max(200, '地址不能超过200个字符').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = supplierSchema.parse(body)

    // 检查供应商名称是否已存在
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.name, validatedData.name))
      .limit(1)

    if (existingSupplier.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '供应商名称已存在'
      })
    }

    // 创建供应商
    const [newSupplier] = await db
      .insert(suppliers)
      .values({
        ...validatedData,
        email: validatedData.email || null,
        address: validatedData.address || null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()

    return {
      success: true,
      message: '供应商创建成功',
      data: newSupplier
    }
  } catch (error) {
    console.error('创建供应商失败:', error)

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
      statusMessage: '创建供应商失败'
    })
  }
})
