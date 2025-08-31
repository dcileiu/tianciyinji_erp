import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    switch (method) {
      case 'GET':
        return await getUsers(event)
      case 'POST':
        return await createUser(event)
      case 'PUT':
        return await updateUser(event)
      case 'DELETE':
        return await deleteUser(event)
      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed'
        })
    }
  } catch (error: any) {
    console.error(`${method} /api/users 错误:`, error)
    return {
      code: -1,
      message: error.message || '操作失败',
      data: null
    }
  }
})

// 获取用户列表
async function getUsers(event: any) {
  // 使用 Nuxt Supabase 服务端客户端（自动处理 Service Role）
  const client = serverSupabaseServiceRole(event)

  // 获取查询参数
  const query = getQuery(event)
  const { page = 1, pageSize = 20, search, role_id, department_id, status } = query

  // 使用 Admin API 获取用户列表
  const { data: authUsers, error: authError } = await client.auth.admin.listUsers({
    page: Number(page),
    perPage: Number(pageSize)
  })

  if (authError) {
    console.error('Supabase Admin API 错误:', authError)
    throw new Error(`Admin API Error: ${authError.message}`)
  }

  if (!authUsers?.users || authUsers.users.length === 0) {
    return {
      code: 0,
      message: '暂无用户数据',
      data: [],
      total: 0
    }
  }

  const userIds = authUsers.users.map((u: any) => u.id)

  // 获取用户角色信息
  const { data: userRoles, error: roleError } = await client
    .from('users_role')
    .select(`
      user_id,
      roles!inner(
        id,
        name,
        code
      )
    `)
    .in('user_id', userIds)

  if (roleError) {
    console.warn('获取用户角色失败:', roleError)
  }

  // 合并用户和角色数据
  const usersWithRoles = authUsers.users.map((user: any) => {
    const roles = userRoles
      ?.filter((ur: any) => ur.user_id === user.id)
      ?.map((ur: any) => ur.roles) || []

    const metadata = user.user_metadata || {}

    return {
      id: user.id,
      email: user.email || '',
      name: metadata.name || user.email?.split('@')[0] || '',
      username: metadata.username || user.email?.split('@')[0] || '',
      status: metadata.status || 'active',
      department_id: metadata.department_id || '',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      login_count: 0, // 需要额外统计
      is_online: false, // 需要额外逻辑
      roles
    }
  })

  // 应用搜索和过滤条件
  let filteredUsers = usersWithRoles

  if (search) {
    const searchLower = String(search).toLowerCase()
    filteredUsers = filteredUsers.filter((user: any) => {
      return (
        user.email?.toLowerCase().includes(searchLower) ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower)
      )
    })
  }

  if (role_id && role_id !== 'all') {
    filteredUsers = filteredUsers.filter((user: any) =>
      user.roles?.some((role: any) => role.id === role_id)
    )
  }

  if (department_id && department_id !== 'all') {
    filteredUsers = filteredUsers.filter((user: any) => user.department_id === department_id)
  }

  if (status && status !== 'all') {
    filteredUsers = filteredUsers.filter((user: any) => user.status === status)
  }

  return {
    code: 0,
    message: '获取成功',
    data: filteredUsers,
    total: filteredUsers.length
  }
}

// 创建用户
async function createUser(event: any) {
  const client = serverSupabaseServiceRole(event)

  // 获取请求体数据
  const body = await readBody(event)
  const { email, password, name, username, phone, department_id, role_ids, remarks, status } = body

  // 验证必填字段
  if (!email || !password || !name || !username) {
    throw new Error('邮箱、密码、姓名和用户名为必填字段')
  }

  // 创建用户
  const { data: newUser, error: createError } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 自动确认邮箱
    user_metadata: {
      name,
      username,
      phone: phone || '',
      department_id: department_id || '',
      remarks: remarks || '',
      status: status || 'active'
    }
  })

  if (createError) {
    console.error('创建用户失败:', createError)
    throw new Error(`创建用户失败: ${createError.message}`)
  }

  if (!newUser.user) {
    throw new Error('创建用户失败：未返回用户数据')
  }

  // 分配角色
  if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
    const roleAssignments = role_ids.map((roleId: string) => ({
      user_id: newUser.user.id,
      role_id: roleId,
      assigned_at: new Date().toISOString()
    }))

    const { error: roleError } = await client
      .from('users_role')
      .insert(roleAssignments)

    if (roleError) {
      console.error('分配角色失败:', roleError)
      console.warn(`用户创建成功但角色分配失败: ${roleError.message}`)
    }
  }

  return {
    code: 0,
    message: '创建用户成功',
    data: {
      id: newUser.user.id,
      email: newUser.user.email,
      name,
      username,
      phone,
      department_id,
      remarks,
      status,
      created_at: newUser.user.created_at
    }
  }
}

// 更新用户
async function updateUser(event: any) {
  const client = serverSupabaseServiceRole(event)

  // 获取请求体数据
  const body = await readBody(event)
  const { id, name, username, phone, department_id, role_ids, remarks, status } = body

  if (!id) {
    throw new Error('用户ID不能为空')
  }

  // 更新用户元数据
  const updateData: any = {}
  if (name !== undefined) updateData.name = name
  if (username !== undefined) updateData.username = username
  if (phone !== undefined) updateData.phone = phone
  if (department_id !== undefined) updateData.department_id = department_id
  if (remarks !== undefined) updateData.remarks = remarks
  if (status !== undefined) updateData.status = status

  // 使用 Admin API 更新用户元数据
  const { data: updatedUser, error: updateError } = await client.auth.admin.updateUserById(
    id,
    {
      user_metadata: updateData
    }
  )

  if (updateError) {
    console.error('更新用户元数据失败:', updateError)
    throw new Error(`更新用户信息失败: ${updateError.message}`)
  }

  // 更新用户角色
  if (role_ids && Array.isArray(role_ids)) {
    // 删除现有角色
    const { error: deleteRoleError } = await client
      .from('users_role')
      .delete()
      .eq('user_id', id)

    if (deleteRoleError) {
      console.error('删除现有角色失败:', deleteRoleError)
      throw new Error(`删除现有角色失败: ${deleteRoleError.message}`)
    }

    // 添加新角色
    if (role_ids.length > 0) {
      const roleAssignments = role_ids.map((roleId: string) => ({
        user_id: id,
        role_id: roleId,
        assigned_at: new Date().toISOString()
      }))

      const { error: roleError } = await client
        .from('users_role')
        .insert(roleAssignments)

      if (roleError) {
        console.error('添加新角色失败:', roleError)
        throw new Error(`添加新角色失败: ${roleError.message}`)
      }
    }
  }

  return {
    code: 0,
    message: '更新用户成功',
    data: {
      id,
      ...updateData,
      updated_at: new Date().toISOString()
    }
  }
}

// 删除用户
async function deleteUser(event: any) {
  const client = serverSupabaseServiceRole(event)

  const body = await readBody(event)
  const { id } = body

  if (!id) {
    throw new Error('用户ID不能为空')
  }

  // 删除用户角色关联
  const { error: deleteRoleError } = await client
    .from('users_role')
    .delete()
    .eq('user_id', id)

  if (deleteRoleError) {
    console.error('删除用户角色关联失败:', deleteRoleError)
    throw new Error(`删除用户角色关联失败: ${deleteRoleError.message}`)
  }

  // 删除用户账户
  const { error: deleteUserError } = await client.auth.admin.deleteUser(id)

  if (deleteUserError) {
    console.error('删除用户账户失败:', deleteUserError)
    throw new Error(`删除用户账户失败: ${deleteUserError.message}`)
  }

  return {
    code: 0,
    message: '删除用户成功',
    data: { id }
  }
}
