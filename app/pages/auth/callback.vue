<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <Card class="w-full max-w-md p-8">
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
        <div v-else-if="isSuccess" class="space-y-4">
          <CheckCircle class="h-8 w-8 mx-auto text-green-600" />
          <h2 class="text-xl font-semibold text-green-600">
            验证成功！
          </h2>
          <p class="text-sm text-muted-foreground">
            您的邮箱已成功验证，即将跳转到仪表板...
          </p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="space-y-4">
          <AlertTriangle class="h-8 w-8 mx-auto text-destructive" />
          <h2 class="text-xl font-semibold text-destructive">
            验证失败
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ error }}
          </p>
          <Button class="mt-4" @click="handleRetry">
            重新尝试
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import Card from 'primevue/card'
import Button from 'primevue/button'

// 使用认证布局
definePageMeta({
  layout: 'auth',
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
const error = ref('')

// 处理邮箱验证
const handleEmailConfirmation = async () => {
  try {
    isLoading.value = true
    error.value = ''

    // 从 URL 参数中获取 token 和 type
    const token_hash = route.query.token_hash as string
    const type = route.query.type as string

    if (!token_hash || !type) {
      throw new Error('验证链接无效或已过期')
    }

    // 验证邮箱
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any
    })

    if (verifyError) {
      throw verifyError
    }

    isSuccess.value = true
    
    // 延迟跳转到仪表板
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  }
  catch (err: any) {
    console.error('Email confirmation error:', err)
    error.value = err.message || '邮箱验证失败，请重试'
  }
  finally {
    isLoading.value = false
  }
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
