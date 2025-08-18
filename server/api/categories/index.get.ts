import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)

  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '获取产品分类失败: ' + error.message
      })
    }

    return {
      data
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '服务器内部错误'
    })
  }
})
