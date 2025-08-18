import { supabase } from '~/lib/supabase'

export default defineEventHandler(async (event) => {
  try {
    const roleId = getRouterParam(event, 'id')

    if (!roleId) {
      throw createError({
        statusCode: 400,
        statusMessage: '角色ID不能为空'
      })
    }

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
      throw createError({
        statusCode: 400,
        statusMessage: '系统内置角色不能删除'
      })
    }

    // 检查是否有关联用户
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', roleId)

    if (userCount && userCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '该角色下还有用户，无法删除'
      })
    }

    // 删除角色
    const { error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: '删除角色失败',
        data: deleteError
      })
    }

    return {
      success: true,
      message: '角色删除成功'
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('删除角色错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '删除角色失败'
    })
  }
})
