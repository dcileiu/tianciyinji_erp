import { z } from 'zod'
import { serverSupabaseServiceRole } from '#supabase/server'

const createProductSchema = z.object({
  name: z.string().min(1, '产品名称不能为空'),
  sku: z.string().min(1, 'SKU不能为空'),
  description: z.string().optional(),
  category_id: z.number().int().positive('请选择产品分类'),
  unit_price: z.number().positive('单价必须大于0'),
  stock_quantity: z.number().int().min(0, '库存数量不能为负数').default(0),
  min_stock_level: z.number().int().min(0, '最低库存不能为负数').default(0),
  is_active: z.boolean().default(true)
})

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)

  try {
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = createProductSchema.parse(body)

    // 检查SKU是否已存在
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id')
      .eq('sku', validatedData.sku)
      .single()

    if (existingProduct) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SKU已存在，请使用其他SKU'
      })
    }

    // 验证分类是否存在
    const { data: category } = await supabase
      .from('product_categories')
      .select('id')
      .eq('id', validatedData.category_id)
      .single()

    if (!category) {
      throw createError({
        statusCode: 400,
        statusMessage: '产品分类不存在'
      })
    }

    // 创建产品
    const { data, error } = await supabase
      .from('products')
      .insert(validatedData)
      .select(`
        *,
        product_categories(id, name)
      `)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '创建产品失败: ' + error.message
      })
    }

    return {
      success: true,
      data,
      message: '产品创建成功'
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
