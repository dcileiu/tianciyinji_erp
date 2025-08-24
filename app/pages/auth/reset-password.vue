<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 reset-password-container"
  >
    <div class="w-full max-w-md mx-auto px-4 sm:px-0">
      <!-- 密码重置卡片 -->
      <Card class="shadow-2xl border-0 overflow-hidden">
        <template #content>
          <div class="p-4 sm:p-6">
            <div class="text-center mb-6">
              <h1 class="text-base sm:text-2xl font-bold text-gray-700 mb-2">
                设置新密码
              </h1>
              <p class="text-sm text-gray-600">请输入您的新密码</p>
            </div>

            <form @submit.prevent="handleResetPassword">
              <!-- 新密码输入 -->
              <div class="mb-6">
                <FloatLabel variant="on">
                  <IconField class="w-full">
                    <Password
                      v-model="form.password"
                      :class="{ 'p-invalid': passwordError }"
                      class="w-full"
                      input-class="w-full pl-10 text-sm sm:text-base"
                      toggle-mask
                      inputId="password"
                      placeholder="请输入新密码"
                    />
                  </IconField>
                  <label for="password">新密码</label>
                </FloatLabel>
                <small v-if="passwordError" class="text-red-500">{{
                  passwordError
                }}</small>
              </div>

              <!-- 确认密码输入 -->
              <div class="mb-6">
                <FloatLabel variant="on">
                  <IconField class="w-full">
                    <Password
                      v-model="form.confirmPassword"
                      :class="{ 'p-invalid': confirmPasswordError }"
                      class="w-full"
                      input-class="w-full pl-10 text-sm sm:text-base"
                      toggle-mask
                      inputId="confirmPassword"
                      placeholder="请再次输入新密码"
                    />
                  </IconField>
                  <label for="confirmPassword">确认新密码</label>
                </FloatLabel>
                <small v-if="confirmPasswordError" class="text-red-500">{{
                  confirmPasswordError
                }}</small>
              </div>

              <!-- 错误提示 -->
              <div
                v-if="error"
                class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div class="flex items-center">
                  <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                  <span class="text-red-700 text-sm">{{ error }}</span>
                </div>
              </div>

              <!-- 成功提示 -->
              <div
                v-if="success"
                class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
              >
                <div class="flex items-center">
                  <i class="pi pi-check-circle text-green-500 mr-2"></i>
                  <span class="text-green-700 text-sm">{{ success }}</span>
                </div>
              </div>

              <!-- 更新密码按钮 -->
              <Button
                type="submit"
                label="更新密码"
                class="w-full mb-6"
                :loading="loading"
                :disabled="!isFormValid || loading"
                size="large"
              />

              <!-- 分割线 -->
              <Divider align="center" class="my-6">
                <span class="text-gray-500 text-sm">或</span>
              </Divider>

              <!-- 其他操作 -->
              <div class="space-y-3">
                <Button
                  label="返回登录"
                  link
                  class="w-full text-center"
                  @click="$router.push('/login')"
                />
              </div>
            </form>
          </div>
        </template>
      </Card>

      <!-- 版权信息 -->
      <div class="text-center mt-8 text-sm text-gray-500">
        © 2025 ERP管理系统. 保留所有权利.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Card from "primevue/card";
import Password from "primevue/password";
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import Divider from "primevue/divider";
import FloatLabel from "primevue/floatlabel";
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

// 表单验证
const passwordError = computed(() => {
  if (!form.value.password) return "";
  return form.value.password.length < 6 ? "密码至少需要6个字符" : "";
});

const confirmPasswordError = computed(() => {
  if (!form.value.confirmPassword) return "";
  return form.value.password !== form.value.confirmPassword
    ? "两次输入的密码不一致"
    : "";
});

const isFormValid = computed(() => {
  return (
    form.value.password
    && form.value.confirmPassword
    && !passwordError.value
    && !confirmPasswordError.value
  );
});

// 处理密码重置
const handleResetPassword = async () => {
  if (!isFormValid.value) return;

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
  } catch (err) {
    console.error("Reset password error:", err);
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
