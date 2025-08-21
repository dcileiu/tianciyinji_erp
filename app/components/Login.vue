<template>
  <div class="w-full max-w-md mx-auto">
    <Card class="p-8">
      <!-- 头部 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-foreground">
          ERP 管理系统
        </h1>
        <p class="text-sm text-muted-foreground mt-2">
          请登录您的账户
        </p>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="space-y-6">
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

        <!-- 密码输入 -->
        <div>
          <label for="password" class="block text-sm font-medium text-foreground mb-2">
            密码
          </label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            :class="errors.password ? 'border-destructive' : ''"
            placeholder="请输入您的密码"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-destructive">
            {{ errors.password }}
          </p>
        </div>

        <!-- 忘记密码 -->
        <div class="text-right">
          <NuxtLink 
            to="/forgot-password" 
            class="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            忘记密码？
          </NuxtLink>
        </div>

        <!-- 错误提示 -->
        <div v-if="loginError" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertTriangle class="h-5 w-5 text-destructive" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-destructive">
                {{ loginError }}
              </p>
            </div>
          </div>
        </div>

        <!-- 登录按钮 -->
        <Button
          type="submit"
          :disabled="isLoading"
          class="w-full"
        >
          <span v-if="!isLoading">登录</span>
          <span v-else class="flex items-center justify-center">
            <Loader2 class="animate-spin mr-2 h-4 w-4" />
            登录中...
          </span>
        </Button>
      </form>

      <!-- 注册提示 -->
      <div class="mt-6 text-center">
        <p class="text-sm text-muted-foreground">
          还没有账户？
          <NuxtLink 
            to="/register" 
            class="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            立即注册
          </NuxtLink>
        </p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { AlertTriangle, Loader2 } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import type { LoginForm } from '~/types/auth'

// 响应式数据
const form = reactive<LoginForm>({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const loginError = ref('')

// 使用认证 composable
const { login } = useAuth()

// 表单验证
const validateForm = (): boolean => {
  // 重置错误
  errors.email = ''
  errors.password = ''

  let isValid = true

  // 验证邮箱
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码至少需要6个字符'
    isValid = false
  }

  return isValid
}

// 处理登录
const handleLogin = async () => {
  // 清除之前的错误
  loginError.value = ''

  // 验证表单
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const result = await login(form)

    if (result.success) {
      // 登录成功，重定向到仪表板
      await navigateTo('/dashboard')
    } else {
      loginError.value = result.error?.message || '登录失败，请重试'
    }
  } catch (err) {
    console.error('Login error:', err)
    loginError.value = '网络错误，请检查您的网络连接'
  } finally {
    isLoading.value = false
  }
}
</script> 