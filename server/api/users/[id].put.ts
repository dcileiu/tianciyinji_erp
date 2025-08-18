import { z } from 'zod'
import { supabase } from '~/lib/supabase'

// 用户更新验证模式
const updateUserSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址').optional(),
  full_name: z.string().min(1, '请输入姓名').optional(),
  phone: z.string().optional(),
  role_id: z.string().uuid('请选择有效的角色').optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  password: z.string().min(6, '密码至少6位').optional()
})

export default defineEventHandler(async (event) => {
  try {
    const userId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: '用户ID不能为空'
      })
    }

    // 验证请求数据
    const validatedData = updateUserSchema.parse(body)

    // 检查用户是否存在
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    }

    // 如果更新邮箱，检查邮箱是否已被其他用户使用
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const { data: emailUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', validatedData.email)
        .neq('id', userId)
        .single()

      if (emailUser) {
        throw createError({
          statusCode: 400,
          statusMessage: '该邮箱已被其他用户使用'
        })
      }
    }

    // 如果更新角色，检查角色是否存在且启用
    if (validatedData.role_id) {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id, name')
        .eq('id', validatedData.role_id)
        .eq('status', 'active')
        .single()

      if (roleError || !role) {
        throw createError({
          statusCode: 400,
          statusMessage: '选择的角色不存在或已禁用'
        })
      }
    }

    // 准备更新数据
    const updateData: any = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }

    // 移除密码字段，因为密码需要通过 Auth API 更新
    const { password, ...userUpdateData } = updateData

    // 更新用户表
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update(userUpdateData)
      .eq('id', userId)
      .select(`
        *,
        roles!inner(
          id,
          name,
          display_name
        )
      `)
      .single()

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: '更新用户失败',
        data: updateError
      })
    }

    // 如果需要更新密码，使用 Auth API
    if (password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        userId,
        { password }
      )

      if (passwordError) {
        console.error('更新密码失败:', passwordError)
        // 密码更新失败不影响其他字段的更新，只记录错误
      }
    }

    // 如果需要更新邮箱或其他 Auth 元数据
    if (validatedData.email || validatedData.full_name || validatedData.phone) {
      const authUpdateData: any = {}

      if (validatedData.email) {
        authUpdateData.email = validatedData.email
      }

      if (validatedData.full_name || validatedData.phone || validatedData.role_id || validatedData.department || validatedData.position) {
        authUpdateData.user_metadata = {
          full_name: validatedData.full_name || existingUser.full_name,
          phone: validatedData.phone || existingUser.phone,
          role_id: validatedData.role_id || existingUser.role_id,
          department: validatedData.department || existingUser.department,
          position: validatedData.position || existingUser.position
        }
      }

      if (Object.keys(authUpdateData).length > 0) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          authUpdateData
        )

        if (authError) {
          console.error('更新 Auth 用户失败:', authError)
          // Auth 更新失败不影响数据库更新，只记录错误
        }
      }
    }

    // 处理返回数据
    const processedUser = {
      ...user,
      status_text: getStatusText(user.status),
      status_color: getStatusColor(user.status),
      role_name: user.roles?.display_name || user.roles?.name
    }

    return {
      success: true,
      message: '用户更新成功',
      data: processedUser
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('更新用户错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新用户失败'
    })
  }
})

// 获取状态文本
function getStatusText (status: string): string {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    pending: '待激活'
  }
  return statusMap[status] || status
}

// 获取状态颜色
function getStatusColor (status: string): string {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'red',
    pending: 'yellow'
  }
  return colorMap[status] || 'gray'
}
