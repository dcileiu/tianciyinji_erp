<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md mx-auto px-4 sm:px-0">
      <!-- 登录卡片 -->
      <Card class="shadow-2xl">
        <CardContent class="p-6">
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-primary -2xl flex items-center justify-center mx-auto mb-4"
            >
              <Building2 class="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 class="text-2xl font-bold text-foreground mb-2">欢迎回来</h1>
            <p class="text-muted-foreground">请登录您的账户</p>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
            <!-- 邮箱输入 -->
            <div class="space-y-2">
              <Label for="email">账号</Label>
              <div class="relative">
                <Mail
                  class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  class="pl-10"
                  :class="{ 'border-destructive': emailError }"
                  :disabled="loading"
                  required
                />
              </div>
              <p v-if="emailError" class="text-sm text-destructive">
                {{ emailError }}
              </p>
            </div>

            <!-- 密码输入 -->
            <div class="space-y-2">
              <Label for="password">密码</Label>
              <div class="relative">
                <Lock
                  class="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                />
                <Input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="pl-10 pr-10"
                  :class="{ 'border-destructive': passwordError }"
                  :disabled="loading"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </Button>
              </div>
              <p v-if="passwordError" class="text-sm text-destructive">
                {{ passwordError }}
              </p>
            </div>

            <!-- 错误提示 -->
            <Alert v-if="error" variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>
                {{ error }}
              </AlertDescription>
            </Alert>

            <!-- 登录按钮 -->
            <Button
              type="submit"
              class="w-full"
              :disabled="!isFormValid || loading"
              size="lg"
            >
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              <LogIn v-else class="mr-2 h-4 w-4" />
              {{ loading ? "登录中..." : "登录" }}
            </Button>

            <!-- 分割线 -->
            <div class="relative my-4">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t"></span>
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">或</span>
              </div>
            </div>

            <!-- 其他操作 -->
            <div class="flex flex-col gap-3">
              <Button
                variant="ghost"
                class="w-full"
                @click="$router.push('/login/forgot-password')"
              >
                <HelpCircle class="mr-2 h-4 w-4" />
                忘记密码？
              </Button>

              <div class="text-center text-sm text-muted-foreground">
                还没有账户？
                <Button
                  variant="link"
                  class="p-0 h-auto font-normal"
                  @click="$router.push('/login/register')"
                >
                  立即注册
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- 版权信息 -->
      <div class="text-center mt-4 text-sm text-muted-foreground">
        © 2025 ERP管理系统. 保留所有权利.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 手动导入 Lucide 图标
import {
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-vue-next";

import { useAuth } from "~/composables/useAuth";
import type { LoginForm } from "~/types/auth";

// 页面配置 - 禁用布局，让登录页面全屏显示
definePageMeta({
  layout: false,
});

// 组合式函数
const { login } = useAuth();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const form = ref<LoginForm>({
  email: "",
  password: "",
});

// 表单验证
const emailError = computed(() => {
  if (!form.value.email) {
    return "";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(form.value.email) ? "" : "请输入有效的邮箱地址";
});

const passwordError = computed(() => {
  if (!form.value.password) {
    return "";
  }
  return form.value.password.length < 6 ? "密码至少需要6个字符" : "";
});

const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    !emailError.value &&
    !passwordError.value
  );
});

// 登录处理
const handleLogin = async () => {
  if (!isFormValid.value) {
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    const result = await login(form.value);

    if (result.success) {
      // 登录成功，跳转到仪表盘
      await router.push("/dashboard");
    } else {
      // 显示错误信息
      error.value = result.error?.message || "登录失败，请重试";
    }
  } catch (_err) {
    error.value = "登录过程中发生错误，请重试";
  } finally {
    loading.value = false;
  }
};

// 页面标题
useHead({
  title: "登录 - ERP管理系统",
});
</script>
