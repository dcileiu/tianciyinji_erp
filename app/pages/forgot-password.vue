<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <Card class="w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-foreground">
          找回密码
        </h1>
        <p class="text-sm text-muted-foreground mt-2">
          输入您的邮箱地址，我们将发送重置密码的链接
        </p>
      </div>

      <!-- 未发送状态 -->
      <form v-if="!emailSent" @submit.prevent="handleForgotPassword" class="space-y-6">
        <!-- 邮箱输入 -->
        <div>
          <label for="email" class="block text-sm font-medium text-foreground mb-2">
            邮箱地址
          </label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            :class="errors.email ? 'border-destructive' : ''"
            placeholder="请输入您的邮箱"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-destructive">
            {{ errors.email }}
          </p>
        </div>

        <!-- 错误提示 -->
        <div v-if="resetError" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertTriangle class="h-5 w-5 text-destructive" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-destructive">
                {{ resetError }}
              </p>
            </div>
          </div>
        </div>

        <!-- 发送按钮 -->
        <Button
          type="submit"
          :disabled="isLoading"
          class="w-full"
        >
          <span v-if="!isLoading">发送重置链接</span>
          <span v-else class="flex items-center justify-center">
            <Loader2 class="animate-spin mr-2 h-4 w-4" />
            发送中...
          </span>
        </Button>
      </form>

      <!-- 已发送状态 -->
      <div v-else class="space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircle class="h-5 w-5 text-green-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-600">
                重置密码邮件已发送到 <strong>{{ form.email }}</strong>
              </p>
              <p class="text-sm text-green-600 mt-1">
                请检查您的邮箱（包括垃圾邮件文件夹）并点击重置链接。
              </p>
            </div>
          </div>
        </div>

        <!-- 重新发送按钮 -->
        <Button
          @click="resendEmail"
          :disabled="isLoading || countdown > 0"
          variant="outline"
          class="w-full"
        >
          <span v-if="countdown > 0">
            {{ countdown }}秒后可重新发送
          </span>
          <span v-else-if="!isLoading">
            重新发送邮件
          </span>
          <span v-else class="flex items-center justify-center">
            <Loader2 class="animate-spin mr-2 h-4 w-4" />
            发送中...
          </span>
        </Button>
      </div>

      <!-- 返回登录 -->
      <div class="mt-6 text-center">
        <NuxtLink 
          to="/login" 
          class="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          返回登录
        </NuxtLink>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { AlertTriangle, Loader2, CheckCircle } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'

// 使用认证布局
definePageMeta({
  layout: 'auth',
})

// 页面标题
useHead({
  title: '找回密码 - ERP 管理系统',
})

interface ForgotPasswordForm {
  email: string
}

// 响应式数据
const form = reactive<ForgotPasswordForm>({
  email: ''
})

const errors = reactive({
  email: ''
})

const isLoading = ref(false)
const resetError = ref('')
const emailSent = ref(false)
const countdown = ref(0)

// 使用认证 composable
const { resetPassword } = useAuth()

// 表单验证
const validateForm = (): boolean => {
  // 重置错误
  errors.email = ''

  let isValid = true

  // 验证邮箱
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  return isValid
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 处理忘记密码
const handleForgotPassword = async () => {
  // 清除之前的错误
  resetError.value = ''

  // 验证表单
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const result = await resetPassword(form.email)

    if (result.success) {
      emailSent.value = true
      startCountdown()
    } else {
      resetError.value = result.error?.message || '发送重置邮件失败，请重试'
    }
  } catch (err) {
    console.error('Forgot password error:', err)
    resetError.value = '网络错误，请检查您的网络连接'
  } finally {
    isLoading.value = false
  }
}

// 重新发送邮件
const resendEmail = async () => {
  await handleForgotPassword()
}
</script> 