<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <Card class="w-full max-w-md">
      <template #content>
        <div class="p-8">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-color">
              找回密码
            </h1>
            <p class="text-sm text-muted-color mt-2">
              输入您的邮箱地址，我们将发送重置密码的链接
            </p>
          </div>

          <!-- 未发送状态 -->
          <form v-if="!emailSent" class="space-y-6" @submit.prevent="handleForgotPassword">
            <!-- 邮箱输入 -->
            <div>
              <label for="email" class="block text-sm font-medium text-color mb-2">
                邮箱地址
              </label>
              <InputText
                id="email"
                v-model="form.email"
                type="email"
                required
                autocomplete="email"
                :class="errors.email ? 'p-invalid' : ''"
                placeholder="请输入您的邮箱"
                class="w-full"
              />
              <small v-if="errors.email" class="p-error">
                {{ errors.email }}
              </small>
            </div>

            <!-- 错误提示 -->
            <InlineMessage v-if="resetError" severity="error" class="w-full">
              <div class="flex items-center">
                <i class="pi pi-exclamation-triangle mr-2"></i>
                <span>{{ resetError }}</span>
              </div>
            </InlineMessage>

            <!-- 发送按钮 -->
            <Button
              type="submit"
              :disabled="isLoading"
              :loading="isLoading"
              label="发送重置链接"
              class="w-full"
            />
          </form>

          <!-- 已发送状态 -->
          <div v-else class="space-y-6">
            <InlineMessage severity="success" class="w-full">
              <div class="flex items-start">
                <i class="pi pi-check-circle mr-2 mt-0.5"></i>
                <div>
                  <p class="text-sm">
                    重置密码邮件已发送到 <strong>{{ form.email }}</strong>
                  </p>
                  <p class="text-sm mt-1">
                    请检查您的邮箱（包括垃圾邮件文件夹）并点击重置链接。
                  </p>
                </div>
              </div>
            </InlineMessage>

            <!-- 重新发送按钮 -->
            <Button
              :disabled="isLoading || countdown > 0"
              :loading="isLoading"
              outlined
              class="w-full"
              @click="resendEmail"
            >
              <template v-if="countdown > 0">
                {{ countdown }}秒后可重新发送
              </template>
              <template v-else-if="!isLoading">
                重新发送邮件
              </template>
            </Button>
          </div>

          <!-- 返回登录 -->
          <div class="mt-6 text-center">
            <NuxtLink 
              to="/login" 
              class="text-sm text-primary hover:text-primary-700 flex items-center justify-center"
            >
              <i class="pi pi-arrow-left mr-2"></i>
              返回登录
            </NuxtLink>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import InlineMessage from 'primevue/inlinemessage'

// 页面配置
definePageMeta({
  layout: 'auth'
})

useHead({
  title: '找回密码 - ERP 管理系统'
})

// 状态管理
const isLoading = ref(false)
const emailSent = ref(false)
const countdown = ref(0)
const resetError = ref('')
let countdownTimer: NodeJS.Timeout | null = null

// 表单数据
const form = ref({
  email: ''
})

// 表单验证错误
const errors = ref({
  email: ''
})

// 验证邮箱格式
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证表单
const validateForm = () => {
  errors.value = { email: '' }
  let isValid = true

  if (!form.value.email) {
    errors.value.email = '请输入邮箱地址'
    isValid = false
  }
  else if (!validateEmail(form.value.email)) {
    errors.value.email = '请输入有效的邮箱地址'
    isValid = false
  }

  return isValid
}

// 处理密码重置请求
const handleForgotPassword = async () => {
  resetError.value = ''
  
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟成功响应
    emailSent.value = true
    startCountdown()
  }
  catch (error) {
    resetError.value = '发送失败，请稍后重试'
    console.error('密码重置失败:', error)
  }
  finally {
    isLoading.value = false
  }
}

// 重新发送邮件
const resendEmail = async () => {
  if (countdown.value > 0) return
  
  isLoading.value = true
  resetError.value = ''

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    startCountdown()
  }
  catch (error) {
    resetError.value = '重新发送失败，请稍后重试'
    console.error('重新发送失败:', error)
  }
  finally {
    isLoading.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script> 
