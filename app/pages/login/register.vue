<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex align-items-center justify-content-center p-4 register-container"
  >
    <div class="w-full max-w-md mx-auto px-4 sm:px-0">
      <!-- 注册卡片 -->
      <Card
        class="shadow-2xl border-0 overflow-hidden"
        :pt="{
          root: { class: 'border-none' },
          header: { class: 'hidden' },
          content: { class: 'p-4 sm:p-6' },
        }"
      >
        <div class="text-center text-base sm:text-2xl font-bold text-surface-700 mb-6">
          创建您的账户
        </div>

        <form class="flex flex-column gap-4" @submit.prevent="handleRegister">
          <!-- 姓名输入 -->
          <div class="field">
            <!-- FloatLabel 组件已移除 -->
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <Input
              id="name"
              v-model="form.name"
              type="text"
              class="w-full"
              :class="{ 'p-invalid': nameError }"
              :disabled="loading"
              required
            />
            <!-- /IconField -->
            <label for="name">姓名</label>
            <!-- /FloatLabel -->
            <small v-if="nameError" class="p-error">{{ nameError }}</small>
          </div>

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
            <label for="email">邮箱</label>
            <!-- /FloatLabel -->
            <small v-if="emailError" class="p-error">{{ emailError }}</small>
          </div>

          <!-- 密码输入 -->
          <div class="field">
            <!-- FloatLabel 组件已移除 -->
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <Input
              v-model="form.password"
              type="password"
              :class="{ 'p-invalid': passwordError }"
              class="w-full"
              input-class="w-full pl-10"
              toggle-mask
              inputId="password"
              :feedback="true"
            />
            <!-- /IconField -->
            <label for="password">密码</label>
            <!-- /FloatLabel -->
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>

          <!-- 确认密码输入 -->
          <div class="field">
            <!-- FloatLabel 组件已移除 -->
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <Input
              v-model="form.confirmPassword"
              type="password"
              :class="{ 'p-invalid': confirmPasswordError }"
              class="w-full"
              input-class="w-full pl-10"
              toggle-mask
              inputId="confirmPassword"
              :feedback="false"
            />
            <!-- /IconField -->
            <label for="confirmPassword">确认密码</label>
            <!-- /FloatLabel -->
            <small v-if="confirmPasswordError" class="p-error">{{ confirmPasswordError }}</small>
          </div>

          <!-- 部门输入（可选） -->
          <div class="field">
            <!-- FloatLabel 组件已移除 -->
            <!-- IconField 已移除 -->
            <!-- InputIcon 已移除 -->
            <Input
              id="department"
              v-model="form.department"
              type="text"
              class="w-full"
              :disabled="loading"
            />
            <!-- /IconField -->
            <label for="department">部门（可选）</label>
            <!-- /FloatLabel -->
          </div>

          <!-- 错误提示 -->
          <!-- Message 组件已移除 -->
          {{ error }}
          <!-- /Message -->

          <!-- 成功提示 -->
          <!-- Message 组件已移除 -->
          {{ success }}
          <!-- /Message -->

          <!-- 注册按钮 -->
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
            <div class="text-center text-sm text-surface-600">
              已有账户？
              <Button link class="p-0 text-primary" @click="$router.push('/login')" />
            </div>
          </div>
        </form>
      </Card>

      <!-- 版权信息 -->
      <div class="text-center mt-4 text-sm text-surface-500">
        © 2025 ERP管理系统. 保留所有权利.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import Panel from 'primevue/panel' // 已移除PrimeVue导入
// import InputText from 'primevue/inputtext' // 已移除PrimeVue导入
// import Password from 'primevue/password' // 已移除PrimeVue导入
// import Button from 'primevue/button' // 已移除PrimeVue导入
// import IconField from 'primevue/iconfield' // 已移除PrimeVue导入
// import InputIcon from 'primevue/inputicon' // 已移除PrimeVue导入
// import Divider from 'primevue/divider' // 已移除PrimeVue导入
// import FloatLabel from 'primevue/floatlabel' // 已移除PrimeVue导入
// import Message from 'primevue/message' // 已移除PrimeVue导入
// import Chip from 'primevue/chip' // 已移除PrimeVue导入
import { useAuth } from '~/composables/useAuth'
import type { RegisterForm } from '~/composables/useAuth'

// 页面配置 - 禁用布局，让注册页面全屏显示
definePageMeta({
  layout: false,
})

// 组合式函数
const { register } = useAuth()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const error = ref('')
const success = ref('')
const form = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  department: '',
})

// 表单验证
const nameError = computed(() => {
  if (!form.value.name) return ''
  return form.value.name.length < 2 ? '姓名至少需要2个字符' : ''
})

const emailError = computed(() => {
  if (!form.value.email) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !emailRegex.test(form.value.email) ? '请输入有效的邮箱地址' : ''
})

const passwordError = computed(() => {
  if (!form.value.password) return ''
  if (form.value.password.length < 6) return '密码至少需要6个字符'
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.value.password)) {
    return '密码必须包含大小写字母和数字'
  }
  return ''
})

const confirmPasswordError = computed(() => {
  if (!form.value.confirmPassword) return ''
  return form.value.password !== form.value.confirmPassword ? '两次输入的密码不一致' : ''
})

const isFormValid = computed(() => {
  return (
    form.value.name
    && form.value.email
    && form.value.password
    && form.value.confirmPassword
    && !nameError.value
    && !emailError.value
    && !passwordError.value
    && !confirmPasswordError.value
  )
})

// 注册处理
const handleRegister = async () => {
  if (!isFormValid.value) return

  try {
    loading.value = true
    error.value = ''
    success.value = ''

    const result = await register(form.value.email, form.value.password, {
      name: form.value.name,
      department: form.value.department,
    })

    if (result.success) {
      success.value = '注册成功！正在跳转到登录页面...'
      // 延迟跳转，让用户看到成功信息
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    else {
      error.value = result.error?.message || '注册失败，请重试'
    }
  }
  catch (err) {
    console.error('Register error:', err)
    error.value = '注册过程中发生错误，请重试'
  }
  finally {
    loading.value = false
  }
}

// 页面标题
useHead({
  title: '注册 - ERP管理系统',
})
</script>
