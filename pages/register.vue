<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          注册ERP系统账户
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          创建您的账户以开始使用
        </p>
      </div>
      <UForm :schema="schema" :state="state" class="mt-8 space-y-6" @submit="onSubmit">
        <div class="space-y-4">
          <UFormGroup label="姓名" name="name">
            <UInput
              v-model="state.name"
              placeholder="请输入姓名"
              icon="i-heroicons-user"
            />
          </UFormGroup>

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
              placeholder="请输入密码（至少6位）"
              icon="i-heroicons-lock-closed"
            />
          </UFormGroup>

          <UFormGroup label="确认密码" name="confirmPassword">
            <UInput
              v-model="state.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              icon="i-heroicons-lock-closed"
            />
          </UFormGroup>

          <UFormGroup label="角色" name="role">
            <USelect
              v-model="state.role"
              :options="roleOptions"
              placeholder="请选择角色"
            />
          </UFormGroup>
        </div>

        <div class="flex items-center">
          <UCheckbox v-model="state.agreeTerms" label="我同意服务条款和隐私政策" />
        </div>

        <UButton
          type="submit"
          :loading="loading"
          block
          size="lg"
        >
          注册
        </UButton>

        <div class="text-center">
          <span class="text-sm text-gray-600">已有账户？</span>
          <ULink to="/login" class="text-sm font-medium">
            立即登录
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

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '销售员', value: 'sales' },
  { label: '采购员', value: 'purchase' },
  { label: '仓库管理员', value: 'warehouse' },
  { label: '财务', value: 'finance' },
  { label: '普通用户', value: 'user' }
]

const schema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位字符'),
  confirmPassword: z.string(),
  role: z.string().min(1, '请选择角色'),
  agreeTerms: z.boolean().refine(val => val === true, '请同意服务条款')
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword']
})

const state = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  agreeTerms: false
})

const loading = ref(false)

async function onSubmit () {
  loading.value = true

  try {
    // 注册用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: state.email,
      password: state.password,
      options: {
        data: {
          name: state.name,
          role: state.role
        }
      }
    })

    if (authError) {
      toast.add({
        title: '注册失败',
        description: authError.message,
        color: 'red'
      })
      return
    }

    // 如果注册成功，创建用户记录
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: state.email,
          name: state.name,
          role: state.role
        })

      if (dbError) {
        console.error('创建用户记录失败:', dbError)
      }
    }

    toast.add({
      title: '注册成功',
      description: '请检查您的邮箱以验证账户',
      color: 'green'
    })

    // 注册成功后重定向到登录页
    await router.push('/login')
  } catch (err) {
    toast.add({
      title: '注册失败',
      description: '发生未知错误，请稍后重试',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>
