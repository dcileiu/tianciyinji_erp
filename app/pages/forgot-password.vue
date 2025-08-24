<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex align-items-center justify-content-center p-4 forgot-password-container"
  >
    <div class="w-full max-w-md mx-auto px-4 sm:px-0">
      <!-- 忘记密码卡片 -->
      <Card
        class="shadow-2xl border-0 overflow-hidden"
        :pt="{
          root: { class: 'border-none' },
          header: { class: 'hidden' },
          content: { class: 'p-4 sm:p-6' },
        }"
      >
        <div class="text-center mb-6">
          <h1 class="text-base sm:text-2xl font-bold text-surface-700 mb-2">忘记密码？</h1>
          <p class="text-sm text-surface-600">输入您的邮箱地址，我们将发送重置密码的链接</p>
        </div>

        <form class="flex flex-column gap-4" @submit.prevent="handleForgotPassword">
          <!-- 邮箱输入 -->
          <div class="field">
            <!-- FloatLabel 组件已移除 -->
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <Input
              id="email"
              v-model="form.email"
              type="email"
              class="w-full"
              :class="{ 'p-invalid': emailError }"
              :disabled="loading"
              required
            />
            <!-- /IconField -->
            <label for="email">邮箱地址</label>
            <!-- /FloatLabel -->
            <small v-if="emailError" class="p-error">{{ emailError }}</small>
          </div>

          <!-- 错误提示 -->
          <!-- Message 组件已移除 -->
          {{ error }}
          <!-- /Message -->

          <!-- 成功提示 -->
          <!-- Message 组件已移除 -->
          {{ success }}
          <!-- /Message -->

          <!-- 发送重置邮件按钮 -->
          <Button
            type="submit"
            class="w-full"
            :loading="loading"
            :disabled="!isFormValid || loading"
            size="lg"
          />

          <!-- 分割线 -->
          <!-- Divider 组件已移除 -->
          <!-- Chip 组件已移除 -->
          <!-- /Divider -->

          <!-- 其他操作 -->
          <div class="flex flex-column gap-3">
            <Button
              link
              class="w-full justify-content-center"
              @click="$router.push('/login')"
            />

            <div class="text-center text-sm text-surface-600">
              还没有账户？
              <Button link class="p-0 text-primary" @click="$router.push('/register')" />
            </div>
          </div>
        </form>
      </Card>

      <!-- 版权信息 -->
      <div class="text-center mt-4 text-sm text-surface-500">© 2025 ERP管理系统. 保留所有权利.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import Panel from 'primevue/panel' // 已移除PrimeVue导入
// import InputText from 'primevue/inputtext' // 已移除PrimeVue导入
// import Button from 'primevue/button' // 已移除PrimeVue导入
// import IconField from 'primevue/iconfield' // 已移除PrimeVue导入
// import InputIcon from 'primevue/inputicon' // 已移除PrimeVue导入
// import Divider from 'primevue/divider' // 已移除PrimeVue导入
// import FloatLabel from 'primevue/floatlabel' // 已移除PrimeVue导入
// import Message from 'primevue/message' // 已移除PrimeVue导入
// import Chip from 'primevue/chip' // 已移除PrimeVue导入
import { useAuth } from '~/composables/useAuth'

// 页面配置 - 禁用布局，让忘记密码页面全屏显示
definePageMeta({
  layout: false,
})

// 组合式函数
const { resetPassword } = useAuth()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const error = ref('')
const success = ref('')
const form = ref({
  email: '',
})

// 表单验证
const emailError = computed(() => {
  if (!form.value.email) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !emailRegex.test(form.value.email) ? '请输入有效的邮箱地址' : ''
})

const isFormValid = computed(() => {
  return form.value.email && !emailError.value
})

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!isFormValid.value) return

  try {
    loading.value = true
    error.value = ''
    success.value = ''

    const result = await resetPassword(form.value.email)

    if (result.success) {
      success.value = '重置密码邮件已发送！请检查您的邮箱并按照说明重置密码。'
      // 可以选择在一段时间后跳转回登录页面
      setTimeout(() => {
        router.push('/login')
      }, 5000)
    }
    else {
      error.value = result.error?.message || '发送重置邮件失败，请重试'
    }
  }
  catch (err) {
    console.error('Reset password error:', err)
    error.value = '发送重置邮件过程中发生错误，请重试'
  }
  finally {
    loading.value = false
  }
}

// 页面标题
useHead({
  title: '忘记密码 - ERP管理系统',
})
</script>
