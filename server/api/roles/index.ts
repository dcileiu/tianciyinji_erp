import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const supabase = serverSupabaseServiceRole(event);

  try {
    switch (method) {
      case 'GET': {
        // 获取角色列表
        const { data: roles, error: fetchError } = await supabase
          .from('roles')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        return {
          code: 0,
          message: '获取成功',
          data: roles || [],
        };
      }

      case 'POST': {
        // 创建角色
        const createData = await readBody(event);

        const { data: newRole, error: insertError } = await supabase
          .from('roles')
          .insert([
            {
              name: createData.name,
              code: createData.code,
              description: createData.description,
              status: createData.status,
              is_system: createData.is_system,
            },
          ])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return {
          code: 0,
          message: '创建成功',
          data: newRole,
        };
      }

      case 'PUT': {
        // 更新角色
        const updateData = await readBody(event);

        const { data: updatedRole, error: updateError } = await supabase
          .from('roles')
          .update({
            name: updateData.name,
            code: updateData.code,
            description: updateData.description,
            status: updateData.status,
            is_system: updateData.is_system,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updateData.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return {
          code: 0,
          message: '更新成功',
          data: updatedRole,
        };
      }

      case 'DELETE': {
        // 删除角色
        const deleteData = await readBody(event);

        // 检查是否有用户使用该角色
        const { data: userRoles, error: checkError } = await supabase
          .from('users_role')
          .select('user_id')
          .eq('role_id', deleteData.id)
          .limit(1);

        if (checkError) {
          throw checkError;
        }

        if (userRoles && userRoles.length > 0) {
          return {
            code: -1,
            message: '该角色已被用户使用，无法删除',
          };
        }

        const { error: deleteError } = await supabase
          .from('roles')
          .delete()
          .eq('id', deleteData.id);

        if (deleteError) {
          throw deleteError;
        }

        return {
          code: 0,
          message: '删除成功',
        };
      }

      default:
        throw createError({
          statusCode: 405,
          statusMessage: 'Method not allowed',
        });
    }
  } catch (error: any) {
    return {
      code: -1,
      message: error.message || '操作失败',
    };
  }
});
