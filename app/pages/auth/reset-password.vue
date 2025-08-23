<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <Card class="w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-foreground">
          重置密码
        </h1>
        <p class="text-sm text-muted-foreground mt-2">
          请输入您的新密码
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="handleResetPassword">
        <!-- 新密码输入 -->
        <div>
          <label for="password" class="block text-sm font-medium text-foreground mb-2">
            新密码
          </label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="new-password"
            :class="errors.password ? 'border-destructive' : ''"
            placeholder="请输入新密码（至少6个字符）"
          />
          <p v-if="errors.password" class="mt-1 text-sm text-destructive">
            {{ errors.password }}
          </p>
        </div>

        <!-- 确认密码输入 -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-foreground mb-2">
            确认新密码
          </label>
          <Input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            :class="errors.confirmPassword ? 'border-destructive' : ''"
            placeholder="请再次输入新密码"
          />
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-destructive">
            {{ errors.confirmPassword }}
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

        <!-- 成功提示 -->
        <div v-if="resetSuccess" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircle class="h-5 w-5 text-green-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-600">
                密码重置成功！即将跳转到仪表板...
              </p>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <Button
          type="submit"
          :disabled="isLoading || resetSuccess"
          class="w-full"
        >
          <span v-if="!isLoading">重置密码</span>
          <span v-else class="flex items-center justify-center">
            <Loader2 class="animate-spin mr-2 h-4 w-4" />
            处理中...
          </span>
        </Button>
      </form>

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
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

// 使用认证布局
definePageMeta({
  layout: 'auth',
})

// 页面标题
useHead({
  title: '重置密码 - ERP 管理系统',
})

interface ResetForm {
  password: string
  confirmPassword: string
}

const router = useRouter()
const { updatePassword } = useAuth()

// 响应式数据
const form = reactive<ResetForm>({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const resetError = ref('')
const resetSuccess = ref(false)

// 表单验证
const validateForm = (): boolean => {
  // 重置错误
  errors.password = ''
  errors.confirmPassword = ''

  let isValid = true

  // 验证密码
  if (!form.password) {
    errors.password = '请输入新密码'
    isValid = false
  }
  else if (form.password.length < 6) {
    errors.password = '密码至少需要6个字符'
    isValid = false
  }

  // 验证确认密码
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认新密码'
    isValid = false
  }
  else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  return isValid
}

// 处理密码重置
const handleResetPassword = async () => {
  // 清除之前的错误
  resetError.value = ''
  resetSuccess.value = false

  // 验证表单
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const result = await updatePassword(form.password)

    if (result.success) {
      resetSuccess.value = true
      // 延迟跳转到仪表板
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
    else {
      resetError.value = result.error?.message || '密码重置失败，请重试'
    }
  }
  catch (err) {
    console.error('Reset password error:', err)
    resetError.value = '网络错误，请检查您的网络连接'
  }
  finally {
    isLoading.value = false
  }
}
</script> 
