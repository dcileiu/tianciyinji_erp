import { z } from 'zod'
import { supabase } from '~/lib/supabase'

// 角色更新验证模式
const updateRoleSchema = z.object({
  name: z.string().min(1, '请输入角色名称').regex(/^[a-zA-Z0-9_]+$/, '角色名称只能包含字母、数字和下划线').optional(),
  display_name: z.string().min(1, '请输入显示名称').optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional()
})

export default defineEventHandler(async (event) => {
  try {
    const roleId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!roleId) {
      throw createError({
        statusCode: 400,
        statusMessage: '角色ID不能为空'
      })
    }

    // 验证请求数据
    const validatedData = updateRoleSchema.parse(body)

    // 检查角色是否存在
    const { data: existingRole, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single()

    if (roleError || !existingRole) {
      throw createError({
        statusCode: 404,
        statusMessage: '角色不存在'
      })
    }

    // 检查是否为系统内置角色
    if (existingRole.name === 'admin' || existingRole.name === 'user') {
      // 系统内置角色只能修改描述和权限
      if (validatedData.name || validatedData.display_name || validatedData.status) {
        throw createError({
          statusCode: 400,
          statusMessage: '系统内置角色不能修改名称、显示名称和状态'
        })
      }
    }

    // 如果修改角色名称，检查是否已存在
    if (validatedData.name && validatedData.name !== existingRole.name) {
      const { data: nameExists } = await supabase
        .from('roles')
        .select('id')
        .eq('name', validatedData.name)
        .neq('id', roleId)
        .single()

      if (nameExists) {
        throw createError({
          statusCode: 400,
          statusMessage: '角色名称已存在'
        })
      }
    }

    // 如果修改显示名称，检查是否已存在
    if (validatedData.display_name && validatedData.display_name !== existingRole.display_name) {
      const { data: displayNameExists } = await supabase
        .from('roles')
        .select('id')
        .eq('display_name', validatedData.display_name)
        .neq('id', roleId)
        .single()

      if (displayNameExists) {
        throw createError({
          statusCode: 400,
          statusMessage: '显示名称已存在'
        })
      }
    }

    // 如果要禁用角色，检查是否有关联用户
    if (validatedData.status === 'inactive' && existingRole.status === 'active') {
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role_id', roleId)
        .eq('status', 'active')

      if (userCount && userCount > 0) {
        throw createError({
          statusCode: 400,
          statusMessage: '该角色下还有启用的用户，无法禁用'
        })
      }
    }

    // 更新角色
    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }

    const { data: role, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', roleId)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '更新角色失败',
        data: error
      })
    }

    // 获取用户数量
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', roleId)

    // 处理返回数据
    const processedRole = {
      ...role,
      user_count: userCount || 0,
      status_text: getStatusText(role.status),
      status_color: getStatusColor(role.status)
    }

    return {
      success: true,
      message: '角色更新成功',
      data: processedRole
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('更新角色错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新角色失败'
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
