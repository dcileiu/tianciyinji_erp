// 性能监控工具

import { log } from './logger'

// 性能计时器
class PerformanceTimer {
  private timers: Map<string, number> = new Map()

  start(name: string): void {
    this.timers.set(name, performance.now())
    log.debug(`Performance: Started timer "${name}"`)
  }

  end(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      log.warn(`Performance: Timer "${name}" not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)
    
    log.info(`Performance: "${name}" took ${duration.toFixed(2)}ms`)
    return duration
  }

  measure<T>(name: string, fn: () => T): T {
    this.start(name)
    try {
      const result = fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name)
    try {
      const result = await fn()
      this.end(name)
      return result
    } catch (error) {
      this.end(name)
      throw error
    }
  }
}

// 全局性能计时器实例
export const perf = new PerformanceTimer()

// 内存使用监控
export function logMemoryUsage(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    log.info('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    })
  }
}

// 页面加载性能监控
export function logPageLoadMetrics(): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
        firstPaint: 0,
        firstContentfulPaint: 0
      }

      // 获取首次绘制时间
      const paintEntries = performance.getEntriesByType('paint')
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime
        }
      })

      log.info('Page Load Metrics:', metrics)
    }
  }
}

// 资源加载监控
export function logResourceMetrics(): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    const resourceSummary = resources.reduce((acc, resource) => {
      const type = resource.initiatorType || 'other'
      if (!acc[type]) {
        acc[type] = { count: 0, totalTime: 0, totalSize: 0 }
      }
      
      acc[type].count++
      acc[type].totalTime += resource.responseEnd - resource.requestStart
      acc[type].totalSize += resource.transferSize || 0
      
      return acc
    }, {} as Record<string, { count: number; totalTime: number; totalSize: number }>)

    log.info('Resource Load Summary:', resourceSummary)
  }
}

// API响应时间监控
export function measureApiCall<T>(
  url: string, 
  method: string, 
  apiCall: () => Promise<T>
): Promise<T> {
  return perf.measureAsync(`API ${method.toUpperCase()} ${url}`, apiCall)
}

// 组件渲染时间监控
export function measureComponentRender<T>(
  componentName: string, 
  renderFn: () => T
): T {
  return perf.measure(`Component Render: ${componentName}`, renderFn)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 缓存装饰器
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

// 批处理函数
export function batchProcess<T>(
  items: T[],
  processor: (batch: T[]) => Promise<void>,
  batchSize: number = 10,
  delay: number = 0
): Promise<void> {
  return new Promise((resolve, reject) => {
    let index = 0
    
    const processBatch = async () => {
      try {
        const batch = items.slice(index, index + batchSize)
        if (batch.length === 0) {
          resolve()
          return
        }
        
        await processor(batch)
        index += batchSize
        
        if (delay > 0) {
          setTimeout(processBatch, delay)
        } else {
          processBatch()
        }
      } catch (error) {
        reject(error)
      }
    }
    
    processBatch()
  })
} 