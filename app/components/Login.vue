<template>
  <div class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-primary-100 to-primary-200">
    <Card class="w-full max-w-md shadow-2xl">
      <template #header>
        <div class="text-center p-6">
          <h1 class="text-2xl font-semibold text-color mb-2">欢迎登录</h1>
          <p class="text-sm text-muted-color">请输入您的账户信息</p>
        </div>
      </template>

      <template #content>
        <form class="flex flex-col gap-6" @submit.prevent="handleLogin">
          <!-- 邮箱输入 -->
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-medium text-color">邮箱地址</label>
            <div class="p-inputgroup">
              <span class="p-inputgroup-addon">
                <i class="pi pi-envelope"></i>
              </span>
              <InputText
                id="email"
                v-model="form.email"
                type="email"
                placeholder="请输入邮箱地址"
                :class="{ 'p-invalid': emailError }"
                @blur="validateEmail"
              />
            </div>
            <small v-if="emailError" class="p-error">{{ emailError }}</small>
          </div>

          <!-- 密码输入 -->
          <div class="flex flex-col gap-2">
            <label for="password" class="text-sm font-medium text-color">密码</label>
            <div class="p-inputgroup">
              <span class="p-inputgroup-addon">
                <i class="pi pi-lock"></i>
              </span>
              <Password
                id="password"
                v-model="form.password"
                placeholder="请输入密码"
                :feedback="false"
                toggle-mask
                :class="{ 'p-invalid': passwordError }"
                @blur="validatePassword"
              />
            </div>
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>

          <!-- 错误信息 -->
          <InlineMessage v-if="error" severity="error" class="w-full">
            {{ error }}
          </InlineMessage>

          <!-- 登录按钮 -->
          <Button
            type="submit"
            label="登录"
            :loading="loading"
            class="w-full mt-2"
            severity="primary"
          />

          <!-- 其他选项 -->
          <div class="text-center">
            <NuxtLink to="/forgot-password" class="text-sm text-primary hover:text-primary-emphasis no-underline hover:underline">
              忘记密码？
            </NuxtLink>
          </div>

          <!-- 分割线 -->
          <Divider align="center">
            <span class="text-sm text-muted-color bg-surface-0 px-4">或</span>
          </Divider>

          <!-- 第三方登录 -->
          <Button
            label="使用 Google 登录"
            severity="secondary"
            outlined
            class="w-full"
            @click="loginWithGoogle"
          >
            <template #icon>
              <i class="pi pi-google text-lg"></i>
            </template>
          </Button>

          <!-- 注册链接 -->
          <div class="text-center text-sm">
            <span class="text-muted-color">还没有账户？</span>
            <NuxtLink to="/register" class="text-primary hover:text-primary-emphasis font-medium ml-1 no-underline hover:underline">
              立即注册
            </NuxtLink>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import InlineMessage from 'primevue/inlinemessage'
import Divider from 'primevue/divider'

// 响应式表单数据
const form = reactive({
  email: '',
  password: ''
})

// 状态管理
const loading = ref(false)
const error = ref('')
const emailError = ref('')
const passwordError = ref('')

// Supabase 客户端
const { auth } = useSupabaseClient()

// 验证邮箱
const validateEmail = () => {
  if (!form.email) {
    emailError.value = '请输入邮箱地址'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    emailError.value = '请输入有效的邮箱地址'
    return false
  }
  emailError.value = ''
  return true
}

// 验证密码
const validatePassword = () => {
  if (!form.password) {
    passwordError.value = '请输入密码'
    return false
  }
  if (form.password.length < 6) {
    passwordError.value = '密码长度至少6位'
    return false
  }
  passwordError.value = ''
  return true
}

// 处理登录
const handleLogin = async () => {
  // 清除之前的错误
  error.value = ''
  
  // 验证表单
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  
  if (!isEmailValid || !isPasswordValid) {
    return
  }

  loading.value = true

  try {
    const { error: signInError } = await auth.signInWithPassword({
      email: form.email,
      password: form.password
    })

    if (signInError) {
      throw signInError
    }

    // 登录成功，重定向到仪表板
    await navigateTo('/dashboard')
  }
  catch (err: any) {
    console.error('登录失败:', err)
    error.value = err.message || '登录失败，请重试'
  }
  finally {
    loading.value = false
  }
}

// Google 登录
const loginWithGoogle = async () => {
  try {
    const { error: googleError } = await auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (googleError) {
      throw googleError
    }
  }
  catch (err: any) {
    console.error('Google 登录失败:', err)
    error.value = err.message || 'Google 登录失败'
  }
}
</script> 
