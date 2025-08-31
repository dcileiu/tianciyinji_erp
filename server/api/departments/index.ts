import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    switch (method) {
      case 'GET':
        return await getDepartments(event)
      case 'POST':
        return await createDepartment(event)
      case 'PUT':
        return await updateDepartment(event)
      case 'DELETE':
        return await deleteDepartment(event)
      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method Not Allowed'
        })
    }
  } catch (error: any) {
    console.error(`${method} /api/departments 错误:`, error)
    return {
      code: -1,
      message: error.message || '操作失败',
      data: null
    }
  }
})

// 获取部门列表
async function getDepartments(event: any) {
  const client = serverSupabaseServiceRole(event)

  // 查询部门列表 (包含所有状态的部门)
  const { data: departments, error } = await (client as any)
    .from('departments')
    .select('id, name, code, description, status, parent_id, sort, manager_id, created_at, updated_at')
    .order('sort', { ascending: true })

  if (error) {
    console.error('获取部门列表失败:', error)
    throw new Error(`获取部门列表失败: ${error.message}`)
  }

  return {
    code: 0,
    message: '获取成功',
    data: departments || []
  }
}

// 创建部门
async function createDepartment(event: any) {
  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)
  const { name, code, description, parent_id, manager_id, sort, status } = body

  // 验证必填字段
  if (!name || !code) {
    throw new Error('部门名称和编码为必填字段')
  }

  // 插入新部门
  const { data, error } = await (client as any)
    .from('departments')
    .insert({
      name,
      code,
      description: description || '',
      parent_id: parent_id || null,
      manager_id: manager_id || null,
      sort: sort || 0,
      status: status || 'active'
    })
    .select()

  if (error) {
    console.error('创建部门失败:', error)
    if (error.code === '23505') {
      throw new Error('部门编码已存在')
    }
    throw new Error(`创建部门失败: ${error.message}`)
  }

  return {
    code: 0,
    message: '创建部门成功',
    data: data?.[0] || null
  }
}

// 更新部门
async function updateDepartment(event: any) {
  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)
  const { id, name, code, description, parent_id, manager_id, sort, status } = body

  if (!id) {
    throw new Error('部门ID不能为空')
  }

  // 更新部门信息
  const updateData: any = {}
  if (name !== undefined) updateData.name = name
  if (code !== undefined) updateData.code = code
  if (description !== undefined) updateData.description = description
  if (parent_id !== undefined) updateData.parent_id = parent_id || null
  if (manager_id !== undefined) updateData.manager_id = manager_id || null
  if (sort !== undefined) updateData.sort = sort
  if (status !== undefined) updateData.status = status

  const { data, error } = await (client as any)
    .from('departments')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) {
    console.error('更新部门失败:', error)
    if (error.code === '23505') {
      throw new Error('部门编码已存在')
    }
    throw new Error(`更新部门失败: ${error.message}`)
  }

  return {
    code: 0,
    message: '更新部门成功',
    data: data?.[0] || null
  }
}

// 删除部门
async function deleteDepartment(event: any) {
  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)
  const { id } = body

  if (!id) {
    throw new Error('部门ID不能为空')
  }

  // 检查是否有子部门
  const { data: children, error: checkError } = await (client as any)
    .from('departments')
    .select('id')
    .eq('parent_id', id)

  if (checkError) {
    console.error('检查子部门失败:', checkError)
    throw new Error(`检查子部门失败: ${checkError.message}`)
  }

  if (children && children.length > 0) {
    throw new Error('该部门下还有子部门，不能删除')
  }

  // 删除部门
  const { error } = await (client as any)
    .from('departments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('删除部门失败:', error)
    throw new Error(`删除部门失败: ${error.message}`)
  }

  return {
    code: 0,
    message: '删除部门成功',
    data: { id }
  }
}
