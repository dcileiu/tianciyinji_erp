<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录到ERP系统
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          请输入您的账户信息
        </p>
      </div>
      <UForm :schema="schema" :state="state" class="mt-8 space-y-6" @submit="onSubmit">
        <div class="space-y-4">
          <UFormGroup label="邮箱" name="email">
            <UInput
              v-model="state.email"
              type="email"
              placeholder="请输入邮箱"
              icon="i-heroicons-envelope"
            />
          </UFormGroup>

          <UFormGroup label="密码" name="password">
            <UInput
              v-model="state.password"
              type="password"
              placeholder="请输入密码"
              icon="i-heroicons-lock-closed"
            />
          </UFormGroup>
        </div>

        <div class="flex items-center justify-between">
          <UCheckbox v-model="state.rememberMe" label="记住我" />
          <ULink to="/forgot-password" class="text-sm">
            忘记密码？
          </ULink>
        </div>

        <UButton
          type="submit"
          :loading="loading"
          block
          size="lg"
        >
          登录
        </UButton>

        <div class="text-center">
          <span class="text-sm text-gray-600">还没有账户？</span>
          <ULink to="/register" class="text-sm font-medium">
            立即注册
          </ULink>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  layout: false,
  auth: false
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const toast = useToast()

// 如果已登录，重定向到首页
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

const schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位字符')
})

const state = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const loading = ref(false)

async function onSubmit () {
  loading.value = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: state.email,
      password: state.password
    })

    if (error) {
      toast.add({
        title: '登录失败',
        description: error.message,
        color: 'red'
      })
      return
    }

    toast.add({
      title: '登录成功',
      description: '欢迎回来！',
      color: 'green'
    })

    // 登录成功后重定向
    await router.push('/')
  } catch (err) {
    toast.add({
      title: '登录失败',
      description: '发生未知错误，请稍后重试',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>
