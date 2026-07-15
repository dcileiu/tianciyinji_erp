<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 reset-password-container"
  >
    <div class="w-full max-w-md mx-auto px-4 sm:px-0">
      <!-- 密码重置卡片 -->
      <Card class="shadow-2xl border-0 overflow-hidden">
        <CardContent class="p-4 sm:p-6">
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-blue-100 -full flex items-center justify-center mx-auto mb-4"
            >
              <Lock class="w-8 h-8 text-blue-600" />
            </div>
            <h1 class="text-base sm:text-2xl font-bold text-foreground mb-2">
              设置新密码
            </h1>
            <p class="text-sm text-muted-foreground">请输入您的新密码</p>
          </div>

          <form @submit.prevent="handleResetPassword">
            <!-- 新密码输入 -->
            <div class="mb-6">
              <Label for="password">新密码</Label>
              <div class="relative mt-1">
                <Input
                  class="pr-10"
                  id="password"
                  placeholder="请输入新密码"
                  v-model="form.password"
                  :class="{ 'border-red-500': passwordError }"
                  :type="showPassword ? 'text' : 'password'"
                />
                <button
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  type="button"
                  @click="showPassword = !showPassword"
                >
                  <Eye
                    class="w-4 h-4 text-muted-foreground"
                    v-if="!showPassword"
                  />
                  <EyeOff class="w-4 h-4 text-muted-foreground" v-else />
                </button>
              </div>
              <p class="text-sm text-red-500 mt-1" v-if="passwordError">
                {{ passwordError }}
              </p>
            </div>

            <!-- 确认密码输入 -->
            <div class="mb-6">
              <Label for="confirmPassword">确认新密码</Label>
              <div class="relative mt-1">
                <Input
                  class="pr-10"
                  id="confirmPassword"
                  placeholder="请再次输入新密码"
                  v-model="form.confirmPassword"
                  :class="{ 'border-red-500': confirmPasswordError }"
                  :type="showConfirmPassword ? 'text' : 'password'"
                />
                <button
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <Eye
                    class="w-4 h-4 text-muted-foreground"
                    v-if="!showConfirmPassword"
                  />
                  <EyeOff class="w-4 h-4 text-muted-foreground" v-else />
                </button>
              </div>
              <p class="text-sm text-red-500 mt-1" v-if="confirmPasswordError">
                {{ confirmPasswordError }}
              </p>
            </div>

            <!-- 错误提示 -->
            <Alert class="mb-6" variant="destructive" v-if="error">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>
                {{ error }}
              </AlertDescription>
            </Alert>

            <!-- 成功提示 -->
            <Alert class="mb-6 border-green-200 bg-green-50" v-if="success">
              <CheckCircle class="h-4 w-4 text-green-600" />
              <AlertDescription class="text-green-700">
                {{ success }}
              </AlertDescription>
            </Alert>

            <!-- 更新密码按钮 -->
            <Button
              class="w-full mb-6"
              type="submit"
              :disabled="!isFormValid || loading"
            >
              <Loader2 class="w-4 h-4 mr-2 animate-spin" v-if="loading" />
              更新密码
            </Button>

            <!-- 分割线 -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t"></span>
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">或</span>
              </div>
            </div>

            <!-- 其他操作 -->
            <div class="space-y-3">
              <Button
                class="w-full"
                variant="ghost"
                @click="$router.push('/login')"
              >
                返回登录
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- 版权信息 -->
      <div class="text-center mt-8 text-sm text-gray-500">
        © 2025 ERP管理系统. 保留所有权利.
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // 手动导入 Lucide 图标
  import {
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Loader2,
    Lock,
  } from "lucide-vue-next";

  import { useAuth } from "~/composables/useAuth";

  // 页面配置 - 禁用布局，让密码重置页面全屏显示
  definePageMeta({
    layout: false,
  });

  // 组合式函数
  const { updatePassword } = useAuth();
  const router = useRouter();
  const route = useRoute();

  // 响应式数据
  const loading = ref(false);
  const error = ref("");
  const success = ref("");
  const form = ref({
    password: "",
    confirmPassword: "",
  });

  const showPassword = ref(false);
  const showConfirmPassword = ref(false);

  // 表单验证
  const passwordError = computed(() => {
    if (!form.value.password) {
      return "";
    }
    return form.value.password.length < 6 ? "密码至少需要6个字符" : "";
  });

  const confirmPasswordError = computed(() => {
    if (!form.value.confirmPassword) {
      return "";
    }
    return form.value.password === form.value.confirmPassword
      ? ""
      : "两次输入的密码不一致";
  });

  const isFormValid = computed(
    () =>
      form.value.password &&
      form.value.confirmPassword &&
      !passwordError.value &&
      !confirmPasswordError.value
  );

  // 处理密码重置
  const handleResetPassword = async () => {
    if (!isFormValid.value) {
      return;
    }

    try {
      loading.value = true;
      error.value = "";
      success.value = "";

      const result = await updatePassword(form.value.password);

      if (result.success) {
        success.value = "密码更新成功！即将跳转到登录页面...";
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        error.value = result.error?.message || "密码更新失败，请重试";
      }
    } catch (_err) {
      error.value = "密码更新过程中发生错误，请重试";
    } finally {
      loading.value = false;
    }
  };

  // 检查是否有有效的重置 token
  onMounted(() => {
    const token = route.query.token || route.hash;
    if (!token) {
      error.value = "无效的密码重置链接，请重新申请";
    }
  });

  // 页面标题
  useHead({
    title: "重置密码 - ERP管理系统",
  });
</script>

<style scoped>
  /* 自定义样式 */
  .reset-password-container {
    animation: fadeIn 0.5s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    width: 100%;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* PrimeVue 组件自定义样式 */
  :deep(.p-card) {
    border-radius: 16px;
    transition: all 0.3s ease;
  }

  :deep(.p-card:hover) {
    transform: translateY(-2px);
  }

  :deep(.p-button) {
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  :deep(.p-inputtext),
  :deep(.p-password input) {
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  :deep(.p-inputtext:focus),
  :deep(.p-password input:focus) {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
</style>
