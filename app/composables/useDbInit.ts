import type { Database } from '~/types/database.types'

// 使用 Nuxt 3 + Supabase 最佳实践
// 参考: https://supabase.com/docs/guides/getting-started/tutorials/with-nuxt-3

export interface InitStep {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
}

export interface InitLog {
  id: string
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
}

export interface RetryConfig {
  maxRetries: number
  delay: number
  backoff: boolean
}

export const useDbInit = () => {
  const supabase = useSupabaseClient<Database>()
  const currentUser = useSupabaseUser()
  const isInitializing = ref(false)
  const logs = ref<InitLog[]>([])
  const connectionStatus = ref<'checking' | 'connected' | 'error'>('checking')
  const initializationProgress = ref(0)

  // 安全性检查 - 确保只有在开发环境或特定条件下才能执行初始化
  const canInitialize = computed(() => {
    // 在生产环境中，需要额外的安全检查
    if (import.meta.env.PROD) {
      // 生产环境下，只有在明确允许的情况下才能初始化
      return import.meta.env.VITE_ALLOW_DB_INIT === 'true'
    }
    // 开发环境允许初始化
    return true
  })

  // 重试配置
  const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    delay: 1000,
    backoff: true,
  }

  const steps = ref<InitStep[]>([
    {
      id: 'check-connection',
      title: '检查数据库连接',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'check-tables',
      title: '检查数据库表结构',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'check-admin-role',
      title: '检查管理员角色',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'create-admin',
      title: '创建管理员账号',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'assign-role',
      title: '分配管理员角色',
      status: 'pending',
      progress: 0,
    },
  ])

  const addLog = (level: InitLog['level'], message: string, details?: any) => {
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const logEntry: InitLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      level,
      message: details ? `${message} ${JSON.stringify(details)}` : message,
    }

    logs.value.push(logEntry)

    // 在开发环境下同时输出到控制台
    if (import.meta.dev) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'
      console[consoleMethod](`[DB Init ${level.toUpperCase()}]`, message, details || '')
    }
  }

  const updateStepStatus = (stepId: string, status: InitStep['status'], progress: number = 0) => {
    const step = steps.value.find(s => s.id === stepId)
    if (step) {
      step.status = status
      step.progress = progress

      // 更新总体进度
      const completedSteps = steps.value.filter(s => s.status === 'completed').length
      const totalSteps = steps.value.length
      initializationProgress.value = Math.round((completedSteps / totalSteps) * 100)

      addLog('info', `步骤 "${step.title}" 状态更新: ${status} (${progress}%)`)
    }
  }

  // 重试机制辅助函数
  const withRetry = async <T>(
    operation: () => Promise<T>,
    operationName: string,
    config: RetryConfig = defaultRetryConfig
  ): Promise<T> => {
    let lastError: Error

    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        addLog('info', `执行 ${operationName} (尝试 ${attempt}/${config.maxRetries})`)
        const result = await operation()
        if (attempt > 1) {
          addLog('success', `${operationName} 在第 ${attempt} 次尝试后成功`)
        }
        return result
      } catch (error: any) {
        lastError = error
        addLog('warning', `${operationName} 第 ${attempt} 次尝试失败: ${error.message}`)

        if (attempt < config.maxRetries) {
          const delay = config.backoff ? config.delay * attempt : config.delay
          addLog('info', `等待 ${delay}ms 后重试...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  // 权限验证辅助函数
  const checkUserPermission = async (userId: string, resourceCode: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_user_permission', {
        p_user_id: userId,
        p_resource_code: resourceCode,
      } as any)

      if (error) {
        addLog('warning', `权限检查失败: ${error.message}`)
        return false
      }

      return data || false
    } catch (error: any) {
      addLog('error', `权限检查异常: ${error.message}`)
      return false
    }
  }

  // 验证管理员权限
  const validateAdminPermissions = async (userId: string): Promise<boolean> => {
    try {
      addLog('info', '验证管理员权限...')

      // 检查关键权限
      const criticalPermissions = [
        'user_management_create',
        'user_management_read',
        'user_management_update',
        'user_management_delete',
        'role_management_create',
        'role_management_read',
        'role_management_update',
        'role_management_delete',
      ]

      const permissionResults = await Promise.all(
        criticalPermissions.map(async permission => {
          const hasPermission = await checkUserPermission(userId, permission)
          addLog(hasPermission ? 'success' : 'warning', `权限 ${permission}: ${hasPermission ? '✓' : '✗'}`)
          return { permission, hasPermission }
        })
      )

      const missingPermissions = permissionResults
        .filter(result => !result.hasPermission)
        .map(result => result.permission)

      if (missingPermissions.length > 0) {
        addLog('warning', `管理员缺少以下权限: ${missingPermissions.join(', ')}`)
        return false
      }

      addLog('success', '管理员权限验证通过')
      return true
    } catch (error: any) {
      addLog('error', `权限验证失败: ${error.message}`)
      return false
    }
  }

  // 使用 Nuxt 3 推荐的方式获取当前用户
  // 参考官方文档: useSupabaseUser() 提供响应式用户状态
  const getCurrentUser = () => {
    const user = useSupabaseUser()
    return user.value
  }

  // 异步获取用户信息（用于需要最新状态的场景）
  const refreshCurrentUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        addLog('error', '刷新用户信息失败', { error: error.message })
        return null
      }
      addLog('info', '用户信息已刷新', { userId: user?.id })
      return user
    } catch (error: any) {
      addLog('error', '刷新用户信息异常', { error: error.message })
      return null
    }
  }

  // 检查数据库连接 - 使用更安全的方式
  const checkConnection = async () => {
    try {
      updateStepStatus('check-connection', 'running', 10)
      connectionStatus.value = 'checking'
      addLog('info', '正在检查数据库连接...')

      // 检查当前用户状态
      if (currentUser.value) {
        addLog('info', `当前用户: ${currentUser.value.email}`, {
          userId: currentUser.value.id,
        })
      } else {
        addLog('info', '当前无认证用户')
      }

      // 使用重试机制检查数据库连接
      await withRetry(async () => {
        // 使用 RPC 调用来测试连接，避免直接查询可能不存在的表
        const { data, error } = await supabase.rpc('check_connection' as any)

        if (error && error.code !== '42883') {
          // 42883 表示函数不存在，这是正常的
          // 如果 RPC 失败，尝试简单的认证状态检查
          const {
            data: { user },
            error: authError,
          } = await supabase.auth.getUser()
          if (authError) {
            throw new Error(`数据库连接错误: ${authError.message}`)
          }
        }

        // 额外的连接健康检查
        const { error: healthError } = await supabase.from('roles').select('count').limit(1)
        if (healthError && healthError.code !== 'PGRST116') {
          throw new Error(`数据库健康检查失败: ${healthError.message}`)
        }

        return true
      }, '数据库连接检查')

      connectionStatus.value = 'connected'
      updateStepStatus('check-connection', 'completed', 100)
      addLog('success', '数据库连接成功')
      return true
    } catch (error: any) {
      connectionStatus.value = 'error'
      updateStepStatus('check-connection', 'error', 0)
      addLog('error', `数据库连接失败: ${error.message}`, {
        error: error.stack,
      })
      return false
    }
  }

  // 检查表结构
  const checkTables = async () => {
    try {
      updateStepStatus('check-tables', 'running', 20)
      addLog('info', '检查数据库表结构...')

      const requiredTables = [
        'departments',
        'roles',
        'users',
        'menus',
        'resources',
        'role_menus',
        'role_resources',
        'user_roles',
        'permission_logs',
      ]

      const tableCheckResults = []

      for (let i = 0; i < requiredTables.length; i++) {
        const table = requiredTables[i]
        const progress = Math.round(((i + 1) / requiredTables.length) * 80) + 20

        try {
          await withRetry(
            async () => {
              const { data, error } = await supabase
                .from(table as any)
                .select('*')
                .limit(1)
              if (error && error.code === 'PGRST116') {
                throw new Error(`表 ${table} 不存在`)
              }
              if (error) {
                throw new Error(`表 ${table} 访问错误: ${error.message}`)
              }
              return data
            },
            `表 ${table} 检查`,
            { maxRetries: 2, delay: 500, backoff: false }
          )

          addLog('success', `表 ${table} 检查通过`)
          tableCheckResults.push({ table, status: 'ok' })
          updateStepStatus('check-tables', 'running', progress)
        } catch (error: any) {
          addLog('error', `表 ${table} 检查失败: ${error.message}`)
          tableCheckResults.push({
            table,
            status: 'error',
            error: error.message,
          })
          throw error
        }
      }

      updateStepStatus('check-tables', 'completed', 100)
      addLog('success', '所有必需的表结构检查完成', {
        results: tableCheckResults,
      })
      return true
    } catch (error: any) {
      updateStepStatus('check-tables', 'error', 0)
      addLog('error', `表结构检查失败: ${error.message}`, {
        error: error.stack,
      })
      return false
    }
  }

  // 检查管理员角色
  const checkAdminRole = async () => {
    try {
      updateStepStatus('check-admin-role', 'running', 30)
      addLog('info', '检查管理员角色...')

      // 使用重试机制检查admin角色
      const adminRole = await withRetry(async () => {
        const { data, error } = await supabase.from('roles').select('*').eq('code', 'admin').single()

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('admin角色不存在，请先运行数据库迁移')
          }
          throw new Error(`查询admin角色失败: ${error.message}`)
        }

        return data
      }, 'admin角色查询')

      addLog('success', `找到管理员角色: ${(adminRole as any).name}`, {
        roleId: (adminRole as any).id,
      })
      updateStepStatus('check-admin-role', 'running', 60)

      // 检查角色是否有资源权限
      try {
        const { data: roleResources, error: resourceError } = await supabase
          .from('role_resources')
          .select('*, resources(*)')
          .eq('role_id', (adminRole as any).id)

        if (resourceError) {
          addLog('warning', `检查角色权限失败: ${resourceError.message}`, {
            error: resourceError,
          })
        } else {
          const resourceCount = roleResources?.length || 0
          addLog('info', `管理员角色拥有 ${resourceCount} 个资源权限`)

          if (resourceCount === 0) {
            addLog('warning', '管理员角色暂无资源权限，可能需要重新运行迁移')
          } else {
            // 显示部分权限详情
            const sampleResources = roleResources
              ?.slice(0, 3)
              .map(r => (r as any).resources?.name)
              .filter(Boolean)
            if (sampleResources && sampleResources.length > 0) {
              addLog('info', `权限示例: ${sampleResources.join(', ')}${resourceCount > 3 ? '...' : ''}`)
            }
          }
        }
      } catch (permissionError: any) {
        addLog('warning', `权限检查异常: ${permissionError.message}`)
      }

      updateStepStatus('check-admin-role', 'completed', 100)
      addLog('success', '管理员角色检查完成')
      return adminRole
    } catch (error: any) {
      updateStepStatus('check-admin-role', 'error', 0)
      addLog('error', `检查管理员角色失败: ${error.message}`, {
        error: error.stack,
      })
      return null
    }
  }

  // 权限验证辅助函数
  const checkUserPermissions = async (userId: string) => {
    try {
      addLog('info', '检查用户权限...', { userId })

      // 检查用户角色
      const { data: userRoles, error: roleError } = await (supabase as any)
        .from('user_roles')
        .select(
          `
          role_id,
          roles (
            id,
            name,
            permissions
          )
        `
        )
        .eq('user_id', userId)

      if (roleError) {
        addLog('warning', '无法获取用户角色信息', { error: roleError.message })
        return { hasAdminRole: false, permissions: [] }
      }

      const hasAdminRole = userRoles?.some((ur: any) => ur.roles?.name === 'admin')
      const allPermissions = userRoles?.flatMap((ur: any) => ur.roles?.permissions || []) || []

      addLog('info', '用户权限检查完成', {
        hasAdminRole,
        roleCount: userRoles?.length || 0,
        permissionCount: allPermissions.length,
      })

      return { hasAdminRole, permissions: allPermissions }
    } catch (error: any) {
      addLog('error', '权限检查异常', { error: error.message })
      return { hasAdminRole: false, permissions: [] }
    }
  }

  // 创建管理员账号 - 改进的实现
  const createAdmin = async () => {
    try {
      updateStepStatus('create-admin', 'running', 60)
      addLog('info', '创建管理员账号...')

      const adminEmail = 'tc@outlook.com'
      const adminPassword = '123456'

      // 使用 Nuxt 3 推荐的方式检查当前用户
      const currentUserData = getCurrentUser()
      if (currentUserData && currentUserData.email === adminEmail) {
        addLog('info', '当前用户就是目标管理员账号', {
          currentUserId: currentUserData.id,
        })

        // 验证当前用户是否已有管理员权限
        const { hasAdminRole } = await checkUserPermissions(currentUserData.id)
        if (hasAdminRole) {
          addLog('success', '当前用户已具备管理员权限')
          updateStepStatus('create-admin', 'completed', 100)
          return { success: true, userId: currentUserData.id }
        }
      }

      // 使用重试机制检查 auth.users 中是否已存在管理员
      const authUserCheck = await withRetry(
        async () => {
          const { data: authUser, error } = await supabase.auth.admin.listUsers()
          if (error) {
            throw new Error(`获取认证用户列表失败: ${error.message}`)
          }
          return authUser?.users?.find(user => user.email === adminEmail) || null
        },
        '认证用户检查',
        { maxRetries: 2, delay: 1000, backoff: false }
      )

      let userId: string

      if (authUserCheck) {
        addLog('success', '管理员认证账号已存在', {
          userId: authUserCheck.id,
          email: authUserCheck.email,
          createdAt: authUserCheck.created_at,
        })
        userId = authUserCheck.id
        updateStepStatus('create-admin', 'running', 70)

        // 检查自定义 users 表中是否存在
        const customUserCheck = await withRetry(
          async () => {
            const { data, error } = await (supabase as any).from('users').select('*').eq('id', userId).single()

            if (error && error.code !== 'PGRST116') {
              throw new Error(`查询用户信息失败: ${error.message}`)
            }

            return error?.code === 'PGRST116' ? null : data
          },
          '用户信息检查',
          { maxRetries: 2, delay: 1000, backoff: false }
        )

        if (customUserCheck) {
          addLog('success', '管理员用户信息已存在', {
            userId: (customUserCheck as any).id,
            name: (customUserCheck as any).name,
            status: (customUserCheck as any).status,
          })
          updateStepStatus('create-admin', 'completed', 100)
          return { success: true, userId }
        }

        // 在自定义 users 表中创建用户信息 - 改进版本
        const insertUserResult = await withRetry(
          async () => {
            addLog('info', '创建用户记录...', { userId, email: adminEmail })

            const { data, error } = await (supabase as any)
              .from('users')
              .insert({
                id: userId,
                email: adminEmail,
                name: '系统管理员',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()

            if (error) {
              if (error.code === '23505') {
                // 唯一约束违反
                addLog('warning', '用户记录已存在，跳过创建')
                // 获取现有记录
                const { data: existingUser, error: selectError } = await (supabase as any)
                  .from('users')
                  .select('*')
                  .eq('id', userId)
                  .single()

                if (selectError) {
                  throw selectError
                }

                return existingUser
              }
              throw error
            }

            return data
          },
          '创建用户记录',
          { maxRetries: 2, delay: 1000, backoff: false }
        )

        if (!insertUserResult) {
          addLog('error', '创建管理员用户信息失败')
          updateStepStatus('create-admin', 'error', 0)
          return { success: false }
        }

        addLog('success', '用户记录处理成功', {
          userId: (insertUserResult as any).id,
          name: (insertUserResult as any).name,
          email: (insertUserResult as any).email,
          status: (insertUserResult as any).status,
        })
      } else {
        // 创建新的管理员认证账号
        addLog('info', '创建新的管理员认证账号...', { email: adminEmail })
        updateStepStatus('create-admin', 'running', 75)

        const createUserResult = await withRetry(
          async () => {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
              email: adminEmail,
              password: adminPassword,
              email_confirm: true,
            })

            if (createError) {
              throw new Error(`创建管理员认证账号失败: ${createError.message}`)
            }

            if (!newUser.user) {
              throw new Error('创建管理员认证账号失败: 未返回用户信息')
            }

            return newUser.user
          },
          '创建认证账号',
          { maxRetries: 2, delay: 1500, backoff: false }
        )

        userId = createUserResult.id
        addLog('success', '管理员认证账号创建成功', {
          userId: createUserResult.id,
          email: createUserResult.email,
        })

        // 在自定义 users 表中插入管理员信息
        addLog('info', '在 users 表中插入管理员信息...', { userId })
        updateStepStatus('create-admin', 'running', 85)

        const insertUserResult = await withRetry(
          async () => {
            addLog('info', '创建用户记录...', { userId, email: adminEmail })

            const { data, error: insertError } = await (supabase as any)
              .from('users')
              .insert({
                id: userId,
                name: '系统管理员',
                email: adminEmail,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()

            if (insertError) {
              if (insertError.code === '23505') {
                // 唯一约束违反
                addLog('warning', '用户记录已存在，跳过创建')
                // 获取现有记录
                const { data: existingUser, error: selectError } = await (supabase as any)
                  .from('users')
                  .select('*')
                  .eq('id', userId)
                  .single()

                if (selectError) {
                  throw selectError
                }

                return existingUser
              }
              throw new Error(`插入管理员用户信息失败: ${insertError.message}`)
            }

            return data
          },
          '插入用户信息',
          { maxRetries: 2, delay: 1500, backoff: false }
        )

        addLog('success', '管理员用户信息创建成功', {
          userId: (insertUserResult as any).id,
          name: (insertUserResult as any).name,
          email: (insertUserResult as any).email,
          status: (insertUserResult as any).status,
        })
      }

      // 验证创建的管理员是否具有正确权限
      const { hasAdminRole } = await checkUserPermissions(userId)
      if (!hasAdminRole) {
        addLog('warning', '管理员账号创建成功，但尚未分配管理员角色')
      } else {
        addLog('success', '管理员账号创建完成，权限验证通过')
      }

      updateStepStatus('create-admin', 'completed', 100)
      addLog('success', `管理员账号创建完成: ${adminEmail}`)
      return { success: true, userId }
    } catch (error: any) {
      updateStepStatus('create-admin', 'error', 0)
      addLog('error', `创建管理员账号失败: ${error.message}`)
      return { success: false }
    }
  }

  // 分配管理员角色
  const assignAdminRole = async (userId: string) => {
    try {
      updateStepStatus('assign-role', 'running', 80)
      addLog('info', '分配管理员角色...', { userId })

      // 使用重试机制获取 admin 角色
      const adminRole = await withRetry(async () => {
        const { data, error } = await supabase.from('roles').select('*').eq('code', 'admin').single()

        if (error) {
          throw new Error(`获取 admin 角色失败: ${error.message}`)
        }

        if (!data) {
          throw new Error('未找到 admin 角色')
        }

        return data
      }, '获取管理员角色')

      addLog('success', '找到管理员角色', {
        roleId: (adminRole as any).id,
        roleName: (adminRole as any).name,
        roleCode: (adminRole as any).code,
      })
      updateStepStatus('assign-role', 'running', 85)

      // 检查是否已分配角色
      const existingRoleCheck = await withRetry(async () => {
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .eq('role_id', (adminRole as any).id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw new Error(`检查用户角色失败: ${error.message}`)
        }

        return error?.code === 'PGRST116' ? null : data
      }, '检查用户角色')

      if (existingRoleCheck) {
        addLog('success', '管理员角色已分配', {
          userRoleId: (existingRoleCheck as any).id,
          assignedAt: (existingRoleCheck as any).created_at,
        })
      } else {
        // 分配角色
        addLog('info', '正在分配管理员角色...')
        updateStepStatus('assign-role', 'running', 90)

        const assignRoleResult = await withRetry(
          async () => {
            const { data, error: roleError } = await (supabase as any)
              .from('user_roles')
              .insert({
                user_id: userId,
                role_id: (adminRole as any).id,
                status: 'active',
              })
              .select()
              .single()

            if (roleError) {
              throw new Error(`分配管理员角色失败: ${roleError.message}`)
            }

            return data
          },
          '分配管理员角色',
          { maxRetries: 2, delay: 1500, backoff: false }
        )

        addLog('success', '管理员角色分配成功', {
          userRoleId: (assignRoleResult as any).id,
          userId: (assignRoleResult as any).user_id,
          roleId: (assignRoleResult as any).role_id,
        })
      }

      // 验证管理员权限
      updateStepStatus('assign-role', 'running', 95)
      const hasValidPermissions = await validateAdminPermissions(userId)

      if (hasValidPermissions) {
        addLog('success', '管理员权限验证通过')
      } else {
        addLog('warning', 'admin 角色权限验证失败，请检查角色权限配置', {
          roleId: (adminRole as any).id,
          roleName: (adminRole as any).name,
        })
      }

      // 检查 admin 角色是否已有资源权限
      const { data: roleResources } = await supabase
        .from('role_resources')
        .select('*')
        .eq('role_id', (adminRole as any).id)

      if (roleResources && roleResources.length > 0) {
        addLog('info', `admin 角色已有 ${roleResources.length} 个资源权限`)
      } else {
        addLog('warning', 'admin 角色暂无资源权限，请检查迁移文件是否正确执行')
      }

      updateStepStatus('assign-role', 'completed', 100)
      addLog('success', '管理员角色分配完成')
      return true
    } catch (error: any) {
      updateStepStatus('assign-role', 'error', 0)
      addLog('error', `分配管理员角色失败: ${error.message}`)
      return false
    }
  }

  // 安全的初始化流程 - 包含权限检查和环境验证
  const initializeAll = async () => {
    try {
      // 安全性检查
      if (!canInitialize.value) {
        const errorMsg = '初始化被拒绝：当前环境不允许执行数据库初始化'
        addLog('error', `🚫 ${errorMsg}`)
        addLog('info', '💡 如需在生产环境初始化，请设置环境变量 VITE_ALLOW_DB_INIT=true')
        return false
      }

      isInitializing.value = true
      initializationProgress.value = 0
      logs.value = []

      addLog('info', '🚀 开始数据库初始化流程...', {
        timestamp: new Date().toISOString(),
        currentUser: currentUser.value?.email || '未登录',
      })
      addLog('info', `🌍 当前环境: ${import.meta.env.MODE}`)
      addLog('info', '📋 初始化步骤: 连接检查 → 表结构验证 → 角色检查 → 管理员创建 → 权限分配')

      // 预检查：验证 Supabase 配置
      const config = useRuntimeConfig()
      if (!config.public.supabase?.url || !config.public.supabase?.key) {
        throw new Error('Supabase 配置不完整，请检查环境变量')
      }
      addLog('info', '✅ Supabase 配置验证通过')

      // 重置所有步骤状态
      steps.value.forEach(step => {
        step.status = 'pending'
        step.progress = 0
      })

      // 1. 检查数据库连接
      addLog('info', '🔗 步骤 1/5: 检查数据库连接')
      const connectionOk = await checkConnection()
      if (!connectionOk) {
        addLog('error', '❌ 数据库连接失败，请检查 Supabase 配置')
        return false
      }
      addLog('success', '✅ 数据库连接正常')

      // 2. 检查表结构
      addLog('info', '🗃️ 步骤 2/5: 验证表结构')
      const tablesOk = await checkTables()
      if (!tablesOk) {
        addLog('error', '❌ 表结构检查失败，请确保数据库迁移已正确执行')
        return false
      }
      addLog('success', '✅ 表结构验证通过')

      // 3. 检查管理员角色
      addLog('info', '👑 步骤 3/5: 检查管理员角色')
      const adminRoleOk = await checkAdminRole()
      if (!adminRoleOk) {
        addLog('error', '❌ 管理员角色检查失败，请检查角色配置')
        return false
      }
      addLog('success', '✅ 管理员角色配置正确')

      // 4. 创建管理员账号
      addLog('info', '👤 步骤 4/5: 创建管理员账号')
      const adminResult = await createAdmin()
      if (!adminResult.success) {
        addLog('error', '❌ 管理员账号创建失败')
        return false
      }
      addLog('success', '✅ 管理员账号创建成功')

      // 5. 分配管理员角色
      addLog('info', '🔐 步骤 5/5: 分配管理员权限')
      const roleAssignOk = await assignAdminRole(adminResult.userId!)
      if (!roleAssignOk) {
        addLog('error', '❌ 管理员角色分配失败', {
          userId: adminResult.userId,
        })
        return false
      }
      addLog('success', '✅ 管理员权限分配完成')

      // 最终验证
      addLog('info', '🔍 执行最终权限验证...')
      const finalValidation = await validateAdminPermissions(adminResult.userId!)

      if (finalValidation) {
        addLog('success', '🎉 数据库初始化完成！管理员权限验证通过', {
          adminUserId: adminResult.userId,
          completedAt: new Date().toISOString(),
        })
      } else {
        addLog('warning', '⚠️ 初始化完成，但权限验证未通过，请手动检查权限配置')
      }

      addLog('info', '📝 管理员登录信息:', {
        email: 'tc@outlook.com',
        password: '123456',
        note: '请在生产环境中修改默认密码',
      })

      initializationProgress.value = 100
      return true
    } catch (error: any) {
      addLog('error', `❌ 初始化失败: ${error.message}`, {
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
      addLog('info', '💡 建议检查: 1) Supabase 连接配置 2) 数据库迁移状态 3) RLS 策略设置')
      initializationProgress.value = 0
      return false
    } finally {
      isInitializing.value = false
    }
  }

  // 重置初始化状态
  const resetInitialization = () => {
    logs.value = []
    steps.value.forEach(step => {
      step.status = 'pending'
      step.progress = 0
    })
    connectionStatus.value = 'checking'
    isInitializing.value = false
  }

  // 组件挂载时检查连接
  onMounted(() => {
    checkConnection()
  })

  // 导出接口 - 基于 Nuxt 3 + Supabase 最佳实践
  return {
    // 状态管理
    isInitializing: readonly(isInitializing),
    initializationProgress: readonly(initializationProgress),
    logs: readonly(logs),
    steps: readonly(steps),
    connectionStatus: readonly(connectionStatus),
    currentUser: readonly(currentUser),
    canInitialize: readonly(canInitialize),

    // 核心方法
    initializeAll,
    resetInitialization,

    // 用户管理方法（基于官方最佳实践）
    getCurrentUser,
    refreshCurrentUser,
    checkUserPermissions,

    // 数据库检查方法
    checkConnection,
    checkTables,
    checkAdminRole,

    // 管理员管理方法
    createAdmin,
    assignAdminRole,

    // 权限验证方法
    checkUserPermission,
    validateAdminPermissions,

    // 工具方法
    clearLogs: () => {
      logs.value = []
      initializationProgress.value = 0
    },

    addLog, // 允许外部添加日志

    // 重试工具（可复用）
    withRetry,

    // 计算属性
    hasErrors: computed(() => logs.value.some(log => log.level === 'error')),
    hasWarnings: computed(() => logs.value.some(log => log.level === 'warning')),
    isCompleted: computed(() => steps.value.every(step => step.status === 'completed')),

    // 环境信息
    isDevelopment: computed(() => import.meta.env.DEV),
    isProduction: computed(() => import.meta.env.PROD),

    // 快速状态检查
    getInitializationSummary: () => ({
      isInitializing: isInitializing.value,
      progress: initializationProgress.value,
      totalSteps: steps.value.length,
      completedSteps: steps.value.filter(s => s.status === 'completed').length,
      errorSteps: steps.value.filter(s => s.status === 'error').length,
      canInitialize: canInitialize.value,
      environment: import.meta.env.MODE,
    }),
  }
}
