// 用户元数据类型
export interface UserMetadata {
  full_name?: string
  avatar_url?: string
  [key: string]: string | number | boolean | undefined
}

// 用户类型定义（改进版本）
export interface User {
  id: string
  email?: string
  user_metadata?: UserMetadata
  app_metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
  last_sign_in_at?: string
}

// 登录表单数据
export interface LoginForm {
  email: string
  password: string
}

// 注册表单数据
export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  fullName?: string
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
  details?: string
}

// 登录响应
export interface LoginResponse {
  success: boolean
  error?: AuthError
  user?: User
}

// 注册响应
export interface RegisterResponse {
  success: boolean
  error?: AuthError
  user?: User
} 