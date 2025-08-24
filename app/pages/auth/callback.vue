<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="space-y-4">
          <Loader2 class="h-8 w-8 animate-spin mx-auto text-primary" />
          <h2 class="text-xl font-semibold text-foreground">
            正在验证...
          </h2>
          <p class="text-sm text-muted-foreground">
            请稍候，我们正在验证您的邮箱。
          </p>
        </div>

        <!-- 成功状态 -->
        <div v-if="isSuccess" class="space-y-4">
          <CheckCircle class="h-8 w-8 mx-auto text-green-600" />
          <h2 class="text-xl font-semibold text-green-600">
            验证成功！
          </h2>
          <p class="text-sm text-muted-foreground">
            您的邮箱已成功验证，即将跳转到仪表板...
          </p>
        </div>

        <!-- 错误状态 -->
        <div v-if="errorMsg" class="space-y-4">
          <AlertTriangle class="h-8 w-8 mx-auto text-red-600" />
          <h2 class="text-xl font-semibold text-red-600">
            验证失败
          </h2>
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-700 font-medium">
              {{ errorMsg }}
            </p>
          </div>
          <div class="space-y-2">
            <Button class="w-full" @click="handleRetry">
              重新尝试
            </Button>
            <Button 
              outlined 
              class="w-full" 
              @click="$router.push('/login')"
            >
              返回登录
            </Button>
          </div>
          
          <!-- 调试信息（开发环境） -->
          <details v-if="$config.public.dev" class="mt-4">
            <summary class="text-xs text-gray-500 cursor-pointer">显示调试信息</summary>
            <div class="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p><strong>URL:</strong> {{ $route.fullPath }}</p>
              <p><strong>Query:</strong> {{ JSON.stringify($route.query) }}</p>
            </div>
          </details>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import Card from 'primevue/card'
import Button from 'primevue/button'

// 使用认证布局
definePageMeta({
  layout: false,
})

// 页面标题
useHead({
  title: '邮箱验证 - ERP 管理系统',
})

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()

const isLoading = ref(true)
const isSuccess = ref(false)
const errorMsg = ref('')

// 处理邮箱验证
const handleEmailConfirmation = async () => {
  try {
    isLoading.value = true
    errorMsg.value = ''

    // 检查新格式参数 (token_hash + type)
    const token_hash = route.query.token_hash as string
    const type = route.query.type as string
    
    if (token_hash && type) {
      // 新格式：使用 verifyOtp
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      })

      if (verifyError) {
        throw verifyError
      }
    } else {
      // 对于 PKCE 流程，@nuxtjs/supabase 模块会自动处理
      // 只需等待一下让模块处理完成，然后检查认证状态
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 检查用户是否已认证
      const user = useSupabaseUser()
      if (!user.value) {
        // 如果还没有用户，尝试刷新会话
        await supabase.auth.getSession()
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (!user.value) {
          throw new Error('验证链接无效或已过期')
        }
      }
    }

    isSuccess.value = true
    
    // 延迟跳转到仪表板
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }
  catch (err: any) {
    console.error('Email confirmation error:', err)
    
    // 处理常见的 Supabase 错误消息，转换为中文
    let errorMessage = getLocalizedErrorMessage(err.message)
    
    if (!errorMessage) {
      // 如果没有匹配的本地化消息，使用原始消息或默认消息
      if (err.message) {
        errorMessage = `验证失败：${err.message}`
      } else {
        errorMessage = '邮箱验证失败，请重试或联系管理员'
      }
    }
    
    errorMsg.value = errorMessage
    console.log('errorMsg.value：', errorMsg.value)
  }
  finally {
    isLoading.value = false
  }
}

// 错误消息本地化
const getLocalizedErrorMessage = (message: string): string | null => {
  const errorMessages: Record<string, string> = {
    'Invalid token_hash': '验证链接无效或已过期',
    'Token has expired': '验证链接已过期',
    'Invalid verification type': '验证类型无效',
    'Token not found': '验证令牌未找到',
    'User not found': '用户不存在',
    'Email not confirmed': '邮箱尚未验证',
    'Invalid code': '验证码无效',
    'Code has expired': '验证码已过期',
    'Signup not allowed for this email address': '此邮箱地址不允许注册',
    'Invalid login credentials': '登录凭据无效',
    'User already exists': '用户已存在',
    'Session not found': '会话未找到',
    'Invalid session': '会话无效',
    'Access denied': '访问被拒绝',
    'Invalid request': '请求无效',
    'Rate limit exceeded': '请求频率超过限制',
    'Service temporarily unavailable': '服务暂时不可用',
    'Network error': '网络错误',
    'Unexpected error': '意外错误',
    'Database error': '数据库错误',
    'Configuration error': '配置错误'
  }

  if (!message) return null
  
  // 精确匹配
  if (errorMessages[message]) {
    return errorMessages[message]
  }
  
  // 模糊匹配
  for (const [key, value] of Object.entries(errorMessages)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  return null
}

// 重新尝试
const handleRetry = () => {
  handleEmailConfirmation()
}

// 页面加载时执行验证
onMounted(() => {
  handleEmailConfirmation()
})
</script> 
