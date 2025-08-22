<template>
  <div v-if="hasError" class="min-h-[400px] flex items-center justify-center">
    <Card class="w-full max-w-md">
      <CardContent class="p-6 text-center">
        <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle class="h-8 w-8 text-red-600" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">
          出现错误
        </h3>
        <p class="text-muted-foreground mb-4">
          {{ errorMessage || '应用程序遇到意外错误，请稍后重试。' }}
        </p>
        <div class="space-y-2">
          <Button @click="retry" class="w-full">
            <RefreshCw class="mr-2 h-4 w-4" />
            重试
          </Button>
          <Button variant="outline" @click="reload" class="w-full">
            刷新页面
          </Button>
        </div>
        <details v-if="isDev && errorStack" class="mt-4 text-left">
          <summary class="text-sm text-muted-foreground cursor-pointer">
            查看错误详情
          </summary>
          <pre class="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">{{ errorStack }}</pre>
        </details>
      </CardContent>
    </Card>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
import { AlertTriangle, RefreshCw } from 'lucide-vue-next'
import Button from './Button.vue'
import Card from './Card.vue'

interface Props {
  fallback?: string
  onError?: (error: Error) => void
}

const props = withDefaults(defineProps<Props>(), {
  fallback: '应用程序遇到意外错误，请稍后重试。'
})

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const isDev = ref(process.env.NODE_ENV === 'development')

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
}

const reload = () => {
  window.location.reload()
}

// 错误处理
onErrorCaptured((error: Error) => {
  hasError.value = true
  errorMessage.value = error.message || props.fallback
  errorStack.value = error.stack || ''
  
  // 调用外部错误处理器
  if (props.onError) {
    props.onError(error)
  }
  
  // 记录错误日志
  console.error('ErrorBoundary captured error:', error)
  
  // 阻止错误继续传播
  return false
})

// 全局错误监听
if (process.client) {
  window.addEventListener('error', (event) => {
    hasError.value = true
    errorMessage.value = event.error?.message || event.message || props.fallback
    errorStack.value = event.error?.stack || ''
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    hasError.value = true
    errorMessage.value = event.reason?.message || String(event.reason) || props.fallback
    errorStack.value = event.reason?.stack || ''
  })
}
</script> 