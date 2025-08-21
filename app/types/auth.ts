// 用户类型定义（简化版本，避免直接依赖@supabase/supabase-js）
export interface User {
  id: string
  email?: string
  [key: string]: any
}

// 登录表单数据
export interface LoginForm {
  email: string
  password: string
}

// 用户状态
export interface UserState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// 认证错误类型
export interface AuthError {
  message: string
  code?: string
}

// 登录响应
export interface LoginResponse {
  success: boolean
  error?: AuthError
  user?: User
} 