import { computed, readonly, ref } from 'vue'
import type { LoginForm, UserState } from '~/types/auth'
import type { Database } from '~/types/database.types'

// 简单的AuthError类型定义
interface AuthError {
  message: string
}

// 全局用户状态
const userState = ref<UserState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
})

export const useAuth = () => {
  const supabase = useSupabaseClient<Database>()
  const router = useRouter()
  const { $config } = useNuxtApp()

  // 登录
  const login = async (credentials: LoginForm) => {
    try {
      userState.value.isLoading = true

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        throw new Error(getAuthErrorMessage(error))
      }

      if (data.user && data.session) {
        userState.value.user = data.user
        userState.value.isAuthenticated = true
        return { success: true, user: data.user }
      }

      throw new Error('登录失败')
    }
    catch (error: unknown) {
      const err = error as Error
      return {
        success: false,
        error: {
          message: err.message || '登录失败，请重试',
        },
      }
    }
    finally {
      userState.value.isLoading = false
    }
  }

  // 注册
  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      userState.value.isLoading = true

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${$config.public.siteUrl}/auth/callback`,
        },
      })

      if (error) {
        throw new Error(getAuthErrorMessage(error))
      }

      return {
        success: true,
        user: data.user,
        needsEmailConfirmation: !data.session,
      }
    }
    catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '注册失败，请重试',
        },
      }
    }
    finally {
      userState.value.isLoading = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      userState.value.isLoading = true

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      userState.value.user = null
      userState.value.isAuthenticated = false

      await router.push('/login')
      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '登出失败',
        },
      }
    }
    finally {
      userState.value.isLoading = false
    }
  }

  // 重置密码
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${$config.public.siteUrl}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '重置密码邮件发送失败',
        },
      }
    }
  }

  // 更新密码
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw error
      }

      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '密码更新失败',
        },
      }
    }
  }

  // 更新用户信息
  const updateProfile = async (updates: { email?: string, data?: Record<string, any> }) => {
    try {
      const { error } = await supabase.auth.updateUser(updates)

      if (error) {
        throw error
      }

      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        error: {
          message: error.message || '更新用户信息失败',
        },
      }
    }
  }

  // 获取用户会话
  const getSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      return data.session
    }
    catch (error) {
      console.error('获取会话失败:', error)
      return null
    }
  }

  // 刷新会话
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        throw error
      }

      if (data.user) {
        userState.value.user = data.user
        userState.value.isAuthenticated = true
      }

      return data.session
    }
    catch (error) {
      console.error('刷新会话失败:', error)
      return null
    }
  }

  // 初始化认证状态
  const initAuth = async () => {
    try {
      userState.value.isLoading = true
      const session = await getSession()
      if (session?.user) {
        userState.value.user = session.user
        userState.value.isAuthenticated = true
      }
      else {
        userState.value.user = null
        userState.value.isAuthenticated = false
      }
    }
    catch (error) {
      console.error('初始化认证状态失败:', error)
      userState.value.user = null
      userState.value.isAuthenticated = false
    }
    finally {
      userState.value.isLoading = false
    }
  }

  // 监听认证状态变化
  const watchAuthState = () => {
    supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log('Auth state changed:', event, session?.user?.email)
      if (session?.user) {
        userState.value.user = session.user
        userState.value.isAuthenticated = true
      }
      else {
        userState.value.user = null
        userState.value.isAuthenticated = false
      }
      userState.value.isLoading = false
    })
  }

  return {
    // 状态
    user: readonly(computed(() => userState.value.user)),
    isLoading: readonly(computed(() => userState.value.isLoading)),
    isAuthenticated: readonly(computed(() => userState.value.isAuthenticated)),
    // 方法
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    getSession,
    refreshSession,
    initAuth,
    watchAuthState,
  }
}

// 错误消息映射
function getAuthErrorMessage(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误，请检查后重试',
    'Email not confirmed': '邮箱尚未验证，请检查您的邮箱',
    'Too many requests': '请求过于频繁，请稍后再试',
    'User already registered': '该邮箱已被注册',
    'Weak password': '密码强度不够，请使用更强的密码',
    'Invalid email': '邮箱格式不正确',
    'Email rate limit exceeded': '邮件发送频率过高，请稍后再试',
    'Session not found': '会话已过期，请重新登录',
    'User not found': '用户不存在',
  }

  return errorMessages[error.message] || error.message || '操作失败，请重试'
}
