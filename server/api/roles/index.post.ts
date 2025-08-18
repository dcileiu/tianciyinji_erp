import { z } from 'zod'
import { supabase } from '~/lib/supabase'

// 角色创建验证模式
const createRoleSchema = z.object({
  name: z.string().min(1, '请输入角色名称').regex(/^[a-zA-Z0-9_]+$/, '角色名称只能包含字母、数字和下划线'),
  display_name: z.string().min(1, '请输入显示名称'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive']).default('active')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = createRoleSchema.parse(body)

    // 检查角色名称是否已存在
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', validatedData.name)
      .single()

    if (existingRole) {
      throw createError({
        statusCode: 400,
        statusMessage: '角色名称已存在'
      })
    }

    // 检查显示名称是否已存在
    const { data: existingDisplayName } = await supabase
      .from('roles')
      .select('id')
      .eq('display_name', validatedData.display_name)
      .single()

    if (existingDisplayName) {
      throw createError({
        statusCode: 400,
        statusMessage: '显示名称已存在'
      })
    }

    // 创建角色
    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name: validatedData.name,
        display_name: validatedData.display_name,
        description: validatedData.description,
        permissions: validatedData.permissions,
        status: validatedData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '创建角色失败',
        data: error
      })
    }

    // 处理返回数据
    const processedRole = {
      ...role,
      user_count: 0,
      status_text: getStatusText(role.status),
      status_color: getStatusColor(role.status)
    }

    return {
      success: true,
      message: '角色创建成功',
      data: processedRole
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('创建角色错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '创建角色失败'
    })
  }
})

// 获取状态文本
function getStatusText (status: string): string {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用'
  }
  return statusMap[status] || status
}

// 获取状态颜色
function getStatusColor (status: string): string {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'red'
  }
  return colorMap[status] || 'gray'
}
