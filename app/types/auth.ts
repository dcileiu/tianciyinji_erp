// 用户元数据类型
export interface UserMetadata {
  avatar_url?: string;
  full_name?: string;
  [key: string]: string | number | boolean | undefined;
}

// 用户类型定义（改进版本）
export interface User {
  app_metadata?: Record<string, unknown>;
  created_at?: string;
  email?: string;
  id: string;
  last_sign_in_at?: string;
  updated_at?: string;
  user_metadata?: UserMetadata;
}

// 登录表单数据
export interface LoginForm {
  email: string;
  password: string;
}

// 注册表单数据
export interface RegisterForm {
  confirmPassword: string;
  department?: string;
  email: string;
  name: string;
  password: string;
  position?: string;
}

// 用户状态
export interface UserState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

// 认证错误类型
export interface AuthError {
  code?: string;
  details?: string;
  message: string;
}

// 登录响应
export interface LoginResponse {
  error?: AuthError;
  success: boolean;
  user?: User;
}

// 注册响应
export interface RegisterResponse {
  error?: AuthError;
  success: boolean;
  user?: User;
}
