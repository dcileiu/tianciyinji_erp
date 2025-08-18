import { z } from 'zod'
import { supabase } from '~/lib/supabase'

// 用户创建验证模式
const createUserSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  full_name: z.string().min(1, '请输入姓名'),
  phone: z.string().optional(),
  role_id: z.string().uuid('请选择有效的角色'),
  department: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('pending')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // 验证请求数据
    const validatedData = createUserSchema.parse(body)

    // 检查邮箱是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: '该邮箱已被使用'
      })
    }

    // 检查角色是否存在且启用
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

    // 使用 Supabase Auth 创建用户
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true,
      user_metadata: {
        full_name: validatedData.full_name,
        phone: validatedData.phone,
        role_id: validatedData.role_id,
        department: validatedData.department,
        position: validatedData.position
      }
    })

    if (authError) {
      throw createError({
        statusCode: 400,
        statusMessage: authError.message
      })
    }

    // 在用户表中创建记录
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: validatedData.email,
        full_name: validatedData.full_name,
        phone: validatedData.phone,
        role_id: validatedData.role_id,
        department: validatedData.department,
        position: validatedData.position,
        status: validatedData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        roles!inner(
          id,
          name,
          display_name
        )
      `)
      .single()

    if (userError) {
      // 如果用户表插入失败，删除 Auth 用户
      await supabase.auth.admin.deleteUser(authUser.user.id)

      throw createError({
        statusCode: 500,
        statusMessage: '创建用户失败',
        data: userError
      })
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
      message: '用户创建成功',
      data: processedUser
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('创建用户错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '创建用户失败'
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
