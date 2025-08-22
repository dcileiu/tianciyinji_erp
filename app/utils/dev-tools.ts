// 开发环境代码质量工具

import { log } from './logger'

// 替换console.log的开发工具
export const devLog = {
  // 查看操作
  view: (itemType: string, item: Record<string, unknown>) => {
    log.action(`查看${itemType}`, { id: item.id, ...item })
  },
  
  // 编辑操作
  edit: (itemType: string, item: Record<string, unknown>) => {
    log.action(`编辑${itemType}`, { id: item.id })
  },
  
  // 删除操作
  delete: (itemType: string, itemId: string | number) => {
    log.action(`删除${itemType}`, { id: itemId })
  },
  
  // 导出操作
  export: (itemType: string, count?: number) => {
    log.action(`导出${itemType}`, { count })
  },
  
  // 刷新操作
  refresh: (itemType: string) => {
    log.action(`刷新${itemType}数据`)
  },
  
  // 筛选操作
  filter: (itemType: string, filters: Record<string, unknown>) => {
    log.action(`应用${itemType}筛选条件`, filters)
  }
}

// 类型安全的错误处理
export function safeAction<T>(
  action: () => T,
  errorMessage: string = '操作失败'
): T | null {
  try {
    return action()
  } catch (error) {
    log.error(errorMessage, error)
    return null
  }
}

// 类型安全的异步错误处理
export async function safeAsyncAction<T>(
  action: () => Promise<T>,
  errorMessage: string = '异步操作失败'
): Promise<T | null> {
  try {
    return await action()
  } catch (error) {
    log.error(errorMessage, error)
    return null
  }
}

// 通用的确认对话框
export function confirmAction(message: string): boolean {
  return confirm(message)
}

// 通用的提示框
export function alertMessage(message: string): void {
  alert(message)
}

// 开发环境检查
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// 生产环境检查
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// 条件日志 - 只在开发环境输出
export function devOnly(fn: () => void): void {
  if (isDevelopment()) {
    fn()
  }
}

// 类型守卫
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// 数组类型守卫
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

// 安全的对象属性访问
export function safeGet<T>(
  obj: Record<string, unknown>, 
  key: string, 
  defaultValue?: T
): T | undefined {
  return (obj[key] as T) ?? defaultValue
}

// 延迟执行
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 格式化日期的通用函数
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('zh-CN')
  } catch {
    return '-'
  }
}

// 格式化时间的通用函数
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('zh-CN')
  } catch {
    return '-'
  }
}

// 格式化金额
export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  return `¥${amount.toLocaleString()}`
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
} 