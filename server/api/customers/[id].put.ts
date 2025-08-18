import { z } from 'zod'
import { serverSupabaseServiceRole } from '#supabase/server'

const updateCustomerSchema = z.object({
  name: z.string().min(1, '客户名称不能为空'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  address: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  try {
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: '客户ID不能为空'
      })
    }

    const body = await readBody(event)

    // 验证请求数据
    const validatedData = updateCustomerSchema.parse(body)

    // 更新客户
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: '客户不存在'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: '更新客户失败: ' + error.message
      })
    }

    return {
      success: true,
      data,
      message: '客户更新成功'
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
