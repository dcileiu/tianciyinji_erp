<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md mx-auto">
      <!-- 注册卡片 -->
      <Card class="shadow-2xl border-0 overflow-hidden">
        <CardContent class="p-6">
          <div class="text-center text-2xl font-bold text-gray-700 mb-6">
            创建您的账户
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
            <!-- 姓名输入 -->
            <div class="space-y-2">
              <Label for="name">姓名</Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                class="w-full"
                :class="{ 'border-red-500': nameError }"
                :disabled="loading"
                required
                placeholder="请输入您的姓名"
              />
              <p v-if="nameError" class="text-sm text-red-500">
                {{ nameError }}
              </p>
            </div>

            <!-- 邮箱输入 -->
            <div class="space-y-2">
              <Label for="email">邮箱</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                class="w-full"
                :class="{ 'border-red-500': emailError }"
                :disabled="loading"
                required
                placeholder="请输入您的邮箱"
              />
              <p v-if="emailError" class="text-sm text-red-500">
                {{ emailError }}
              </p>
            </div>

            <!-- 密码输入 -->
            <div class="space-y-2">
              <Label for="password">密码</Label>
              <Input
                id="password"
                v-model="form.password"
                type="password"
                class="w-full"
                :class="{ 'border-red-500': passwordError }"
                :disabled="loading"
                required
                placeholder="请输入密码"
              />
              <p v-if="passwordError" class="text-sm text-red-500">
                {{ passwordError }}
              </p>
            </div>

            <!-- 确认密码输入 -->
            <div class="space-y-2">
              <Label for="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                class="w-full"
                :class="{ 'border-red-500': confirmPasswordError }"
                :disabled="loading"
                required
                placeholder="请再次输入密码"
              />
              <p v-if="confirmPasswordError" class="text-sm text-red-500">
                {{ confirmPasswordError }}
              </p>
            </div>

            <!-- 部门输入（可选） -->
            <div class="space-y-2">
              <Label for="department">部门（可选）</Label>
              <Input
                id="department"
                v-model="form.department"
                type="text"
                class="w-full"
                :disabled="loading"
                placeholder="请输入所在部门"
              />
            </div>

            <!-- 错误提示 -->
            <Alert v-if="error" variant="destructive">
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>

            <!-- 成功提示 -->
            <Alert v-if="success" class="border-green-200 bg-green-50">
              <AlertDescription class="text-green-800">{{
                success
              }}</AlertDescription>
            </Alert>

            <!-- 注册按钮 -->
            <Button
              type="submit"
              class="w-full"
              :disabled="!isFormValid || loading"
              size="lg"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ loading ? "注册中..." : "创建账户" }}
            </Button>

            <!-- 分割线 -->
            <Separator class="my-4" />

            <!-- 其他操作 -->
            <div class="text-center">
              <p class="text-sm text-gray-600">
                已有账户？
                <Button
                  variant="link"
                  class="p-0 h-auto text-blue-600 hover:text-blue-800"
                  @click="$router.push('/login')"
                >
                  立即登录
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- 版权信息 -->
      <div class="text-center mt-4 text-sm text-gray-500">
        © 2025 ERP管理系统. 保留所有权利.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import { Loader2 } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';
import type { RegisterForm } from '~/types/auth';

// 页面配置 - 禁用布局，让注册页面全屏显示
definePageMeta({
  layout: false,
});

// 组合式函数
const { register } = useAuth();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const error = ref('');
const success = ref('');
const form = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  department: '',
});

// 表单验证
const nameError = computed(() => {
  if (!form.value.name) {
    return '';
  }
  return form.value.name.length < 2 ? '姓名至少需要2个字符' : '';
});

const emailError = computed(() => {
  if (!form.value.email) {
    return '';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(form.value.email) ? '' : '请输入有效的邮箱地址';
});

const passwordError = computed(() => {
  if (!form.value.password) {
    return '';
  }
  if (form.value.password.length < 6) {
    return '密码至少需要6个字符';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.value.password)) {
    return '密码必须包含大小写字母和数字';
  }
  return '';
});

const confirmPasswordError = computed(() => {
  if (!form.value.confirmPassword) {
    return '';
  }
  return form.value.password !== form.value.confirmPassword
    ? '两次输入的密码不一致'
    : '';
});

const isFormValid = computed(() => {
  return (
    form.value.name &&
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    !nameError.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  );
});

// 注册处理
const handleRegister = async () => {
  if (!isFormValid.value) {
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    success.value = '';

    const result = await register(form.value.email, form.value.password, {
      name: form.value.name,
      department: form.value.department,
    });

    if (result.success) {
      success.value = '注册成功！正在跳转到登录页面...';
      // 延迟跳转，让用户看到成功信息
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      error.value = result.error?.message || '注册失败，请重试';
    }
  } catch (_err) {
    error.value = '注册过程中发生错误，请重试';
  } finally {
    loading.value = false;
  }
};

// 页面标题
useHead({
  title: '注册 - ERP管理系统',
});
</script>
