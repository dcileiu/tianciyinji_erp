// 日志级别
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// 日志配置
interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
}

// 默认配置
const defaultConfig: LogConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: process.env.NODE_ENV !== 'production',
  enableRemote: false
}

class Logger {
  private config: LogConfig

  constructor(config: Partial<LogConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  private log(level: LogLevel, message: string, ...args: unknown[]) {
    if (level < this.config.level) return

    if (this.config.enableConsole) {
      const timestamp = new Date().toISOString()
      const levelText = LogLevel[level]
      const prefix = `[${timestamp}] [${levelText}]`

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, ...args)
          break
        case LogLevel.INFO:
          console.info(prefix, message, ...args)
          break
        case LogLevel.WARN:
          console.warn(prefix, message, ...args)
          break
        case LogLevel.ERROR:
          console.error(prefix, message, ...args)
          break
      }
    }

    // 这里可以添加远程日志发送逻辑
    if (this.config.enableRemote) {
      this.sendToRemote(level, message, args)
    }
  }

  private sendToRemote(level: LogLevel, message: string, args: unknown[]) {
    // 发送到远程日志服务的逻辑
    // 例如发送到服务器、第三方日志服务等
  }

  debug(message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, message, ...args)
  }

  info(message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, message, ...args)
  }

  warn(message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, message, ...args)
  }

  error(message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, message, ...args)
  }

  // 便捷方法
  action(action: string, data?: unknown) {
    this.info(`Action: ${action}`, data)
  }

  api(method: string, url: string, data?: unknown) {
    this.debug(`API ${method.toUpperCase()}: ${url}`, data)
  }
}

// 创建全局日志实例
export const logger = new Logger()

// 导出便捷方法
export const log = {
  debug: (message: string, ...args: unknown[]) => logger.debug(message, ...args),
  info: (message: string, ...args: unknown[]) => logger.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => logger.error(message, ...args),
  action: (action: string, data?: unknown) => logger.action(action, data),
  api: (method: string, url: string, data?: unknown) => logger.api(method, url, data)
} 