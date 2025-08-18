import { serverSupabaseServiceRole } from '#supabase/server'

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

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
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
        statusMessage: '获取客户信息失败: ' + error.message
      })
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})
