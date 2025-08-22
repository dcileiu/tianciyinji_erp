import { ref, computed } from 'vue'

// 全局加载状态管理
const loadingTasks = ref(new Set<string>())
const loadingMessages = ref(new Map<string, string>())

export const useGlobalLoading = () => {
  // 计算属性
  const isLoading = computed(() => loadingTasks.value.size > 0)
  const currentMessage = computed(() => {
    const messages = Array.from(loadingMessages.value.values())
    return messages[messages.length - 1] || '加载中...'
  })

  // 开始加载
  const startLoading = (taskId: string, message = '加载中...') => {
    loadingTasks.value.add(taskId)
    loadingMessages.value.set(taskId, message)
  }

  // 停止加载
  const stopLoading = (taskId: string) => {
    loadingTasks.value.delete(taskId)
    loadingMessages.value.delete(taskId)
  }

  // 更新加载消息
  const updateMessage = (taskId: string, message: string) => {
    if (loadingTasks.value.has(taskId)) {
      loadingMessages.value.set(taskId, message)
    }
  }

  // 清除所有加载状态
  const clearAll = () => {
    loadingTasks.value.clear()
    loadingMessages.value.clear()
  }

  // 包装异步函数，自动管理加载状态
  const withLoading = async <T>(
    fn: () => Promise<T>,
    taskId: string = Math.random().toString(36).substr(2, 9),
    message = '加载中...'
  ): Promise<T> => {
    try {
      startLoading(taskId, message)
      const result = await fn()
      return result
    } finally {
      stopLoading(taskId)
    }
  }

  // 获取加载状态
  const getLoadingState = () => ({
    isLoading: isLoading.value,
    message: currentMessage.value,
    tasks: Array.from(loadingTasks.value),
    taskCount: loadingTasks.value.size
  })

  return {
    isLoading,
    currentMessage,
    startLoading,
    stopLoading,
    updateMessage,
    clearAll,
    withLoading,
    getLoadingState
  }
}

// 常用加载任务ID
export const LoadingTasks = {
  PAGE_INIT: 'page-init',
  DATA_FETCH: 'data-fetch',
  FORM_SUBMIT: 'form-submit',
  FILE_UPLOAD: 'file-upload',
  API_REQUEST: 'api-request',
  USER_LOGIN: 'user-login',
  USER_LOGOUT: 'user-logout'
} as const

// 预定义加载消息
export const LoadingMessages = {
  PAGE_LOADING: '页面加载中...',
  DATA_LOADING: '数据加载中...',
  SAVING: '保存中...',
  DELETING: '删除中...',
  UPLOADING: '上传中...',
  PROCESSING: '处理中...',
  SIGNING_IN: '登录中...',
  SIGNING_OUT: '退出中...',
  VALIDATING: '验证中...',
  CONNECTING: '连接中...'
} as const 