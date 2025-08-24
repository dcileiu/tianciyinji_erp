<template>
  <div class="w-full max-w-md mx-auto">
    <Card class="p-8">
      <!-- 头部 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-foreground">注册账户</h1>
        <p class="text-sm text-muted-foreground mt-2">创建您的ERP管理系统账户</p>
      </div>

      <!-- 注册表单 -->
      <form class="space-y-6" @submit.prevent="handleRegister">
        <!-- 邮箱输入 -->
        <div>
          <label for="email" class="block text-sm font-medium text-foreground mb-2"> 邮箱地址 </label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            placeholder="请输入您的邮箱"
            class="w-full"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-destructive">
            {{ errors.email }}
          </p>
        </div>

        <!-- 密码输入 -->
        <div>
          <label for="password" class="block text-sm font-medium text-foreground mb-2"> 密码 </label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="new-password"
            placeholder="请输入密码"
            class="w-full"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-destructive">
            {{ errors.password }}
          </p>
        </div>

        <!-- 确认密码输入 -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-foreground mb-2"> 确认密码 </label>
          <Input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            placeholder="请再次输入密码"
            class="w-full"
          />
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-destructive">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- 注册按钮 -->
        <Button type="submit" class="w-full" :disabled="isLoading">
          <span v-if="isLoading">注册中...</span>
          <span v-else>注册</span>
        </Button>

        <!-- 错误信息 -->
        <div v-if="error" class="text-sm text-destructive text-center">
          {{ error }}
        </div>

        <!-- 成功信息 -->
        <div v-if="success" class="text-sm text-green-600 text-center">
          {{ success }}
        </div>

        <!-- 登录链接 -->
        <div class="text-center">
          <p class="text-sm text-muted-foreground">
            已有账户？
            <NuxtLink to="/login" class="text-primary hover:underline"> 立即登录 </NuxtLink>
          </p>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
const { register } = useAuth()

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = ref({
  email: '',
  password: '',
  confirmPassword: '',
})
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const validateForm = () => {
  errors.value = {
    email: '',
    password: '',
    confirmPassword: '',
  }

  if (!form.value.email) {
    errors.value.email = '请输入邮箱地址'
  }
  else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = '请输入有效的邮箱地址'
  }

  if (!form.value.password) {
    errors.value.password = '请输入密码'
  }
  else if (form.value.password.length < 6) {
    errors.value.password = '密码长度不能少于6个字符'
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = '请确认密码'
  }
  else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = '两次输入的密码不一致'
  }

  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) return

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await register(form.value.email, form.value.password)

    if (result.success) {
      if (result.needsEmailConfirmation) {
        success.value = '注册成功！请检查您的邮箱并点击确认链接。'
      }
      else {
        success.value = '注册成功！正在跳转...'
        setTimeout(() => {
          navigateTo('/dashboard')
        }, 1000)
      }
    }
    else {
      error.value = result.error?.message || '注册失败，请重试'
    }
  }
  catch (err: any) {
    error.value = err.message || '注册失败，请重试'
  }
  finally {
    isLoading.value = false
  }
}
</script>
