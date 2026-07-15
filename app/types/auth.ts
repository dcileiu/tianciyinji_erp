// 登录表单数据
export interface LoginForm {
  email: string;
  password: string;
}

// 注册表单数据（公开注册已关闭，类型仅保留兼容）
export interface RegisterForm {
  confirmPassword: string;
  department?: string;
  email: string;
  name: string;
  password: string;
  position?: string;
}

/** Session 登录用户（与 /api/auth/login、useAuth 对齐） */
export interface AuthUser {
  email: string;
  id: string;
  name?: string | null;
  username?: string | null;
}

// 用户状态
export interface UserState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
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
  user?: AuthUser;
}

// 注册响应
export interface RegisterResponse {
  error?: AuthError;
  success: boolean;
  user?: AuthUser;
}
