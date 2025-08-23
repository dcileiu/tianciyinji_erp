// 错误类型定义
export interface AppError {
  code: string
  message: string
  details?: string
  originalError?: Error
}

// 常见错误代码
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 错误消息映射
const errorMessages: Record<string, string> = {
  [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络状态',
  [ErrorCode.VALIDATION_ERROR]: '数据验证失败',
  [ErrorCode.AUTH_ERROR]: '认证失败，请重新登录',
  [ErrorCode.PERMISSION_ERROR]: '权限不足，无法执行此操作',
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.SERVER_ERROR]: '服务器内部错误',
  [ErrorCode.UNKNOWN_ERROR]: '发生未知错误'
}

// 创建应用错误
export function createAppError(
  code: ErrorCode, 
  customMessage?: string, 
  originalError?: Error
): AppError {
  return {
    code,
    message: customMessage || errorMessages[code] || '未知错误',
    originalError,
    details: originalError?.message
  }
}

// 解析错误
export function parseError(error: unknown): AppError {
  // 如果已经是 AppError
  if (isAppError(error)) {
    return error
  }

  // 如果是 Error 对象
  if (error instanceof Error) {
    // 检查常见的错误类型
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return createAppError(ErrorCode.NETWORK_ERROR, undefined, error)
    }
    
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return createAppError(ErrorCode.AUTH_ERROR, undefined, error)
    }
    
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      return createAppError(ErrorCode.PERMISSION_ERROR, undefined, error)
    }
    
    if (error.message.includes('not found') || error.message.includes('404')) {
      return createAppError(ErrorCode.NOT_FOUND, undefined, error)
    }
    
    return createAppError(ErrorCode.UNKNOWN_ERROR, error.message, error)
  }

  // 如果是字符串
  if (typeof error === 'string') {
    return createAppError(ErrorCode.UNKNOWN_ERROR, error)
  }

  // 如果是对象但有 message 属性
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: unknown }).message)
    return createAppError(ErrorCode.UNKNOWN_ERROR, message)
  }

  // 默认情况
  return createAppError(ErrorCode.UNKNOWN_ERROR, '发生了意外错误')
}

// 检查是否为 AppError
export function isAppError(error: unknown): error is AppError {
  return (
    error !== null
    && typeof error === 'object'
    && 'code' in error
    && 'message' in error
  )
}

// 处理错误并记录日志
export function handleError(error: unknown, context?: string): AppError {
  const appError = parseError(error)
  
  // 记录错误日志到控制台
  const contextInfo = context ? ` in ${context}` : ''
  console.error(`Error${contextInfo}:`, {
    code: appError.code,
    message: appError.message,
    details: appError.details
  })

  return appError
}

// 处理异步操作的错误
export async function handleAsyncError<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ success: true, data: T } | { success: false, error: AppError }> {
  try {
    const data = await operation()
    return { success: true, data }
  }
  catch (error) {
    const appError = handleError(error, context)
    return { success: false, error: appError }
  }
}

// 显示用户友好的错误消息
export function getDisplayMessage(error: AppError): string {
  // 根据错误代码返回用户友好的消息
  switch (error.code) {
    case ErrorCode.NETWORK_ERROR:
      return '网络连接失败，请检查网络后重试'
    case ErrorCode.AUTH_ERROR:
      return '登录状态已过期，请重新登录'
    case ErrorCode.PERMISSION_ERROR:
      return '您没有权限执行此操作'
    case ErrorCode.VALIDATION_ERROR:
      return error.message || '输入的数据格式不正确'
    default:
      return error.message || '操作失败，请稍后重试'
  }
} 
