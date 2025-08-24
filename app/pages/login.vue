<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex align-items-center justify-content-center p-4 login-container">
    <div class="w-full max-w-md mx-auto px-4 sm:px-0">
      <!-- 登录卡片 -->
      <Panel
class="shadow-2xl border-0 overflow-hidden" :pt="{
        root: { class: 'border-none' },
        header: { class: 'hidden' },
        content: { class: 'p-4 sm:p-6' },
      }">
        <div class="text-center text-base sm:text-2xl font-bold text-surface-700 mb-6">
          欢迎回来，请登录您的账户
        </div>

        <form class="flex flex-column gap-4" @submit.prevent="handleLogin">
          <!-- 邮箱输入 -->
          <div class="field">
            <FloatLabel variant="on">
              <IconField class="w-full">
                <InputIcon class="pi pi-envelope" />
                <InputText
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="w-full"
                  :class="{ 'p-invalid': emailError }"
                  :disabled="loading"
                  required
                />
              </IconField>
              <label for="email">账号</label>
            </FloatLabel>
            <small v-if="emailError" class="p-error">{{ emailError }}</small>
          </div>

          <!-- 密码输入 -->
          <div class="field">
            <FloatLabel variant="on">
              <IconField class="w-full">
                <InputIcon class="pi pi-lock" />
                <Password
                  v-model="form.password"
                  :class="{ 'p-invalid': passwordError }"
                  class="w-full"
                  input-class="w-full pl-10"
                  toggle-mask
                  inputId="password"
                  :feedback="false"
                />
              </IconField>
              <label for="password">密码</label>
            </FloatLabel>
            <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
          </div>

          <!-- 错误提示 -->
          <Message v-if="error" severity="error" :closable="false">
            {{ error }}
          </Message>

          <!-- 登录按钮 -->
          <Button
            type="submit"
            label="登录"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="loading"
            :disabled="!isFormValid || loading"
            size="large"
          />

          <!-- 分割线 -->
          <Divider align="center" class="my-4">
            <Chip label="或" class="px-3" />
          </Divider>

          <!-- 其他操作 -->
          <div class="flex flex-column gap-3">
            <Button
              label="忘记密码？"
              icon="pi pi-question-circle"
              link
              class="w-full justify-content-center"
              @click="$router.push('/forgot-password')"
            />

            <div class="text-center text-sm text-surface-600">
              还没有账户？
              <Button
                label="立即注册"
                link
                class="p-0 text-primary"
                @click="$router.push('/register')"
              />
            </div>
          </div>
        </form>
      </Panel>

      <!-- 版权信息 -->
      <div class="text-center mt-4 text-sm text-surface-500">
        © 2025 ERP管理系统. 保留所有权利.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Panel from "primevue/panel";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Divider from "primevue/divider";
import FloatLabel from "primevue/floatlabel";
import Message from "primevue/message";
import Chip from "primevue/chip";
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
const form = ref<LoginForm>({
  email: "",
  password: "",
});

// 表单验证
const emailError = computed(() => {
  if (!form.value.email) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(form.value.email) ? "请输入有效的邮箱地址" : "";
});

const passwordError = computed(() => {
  if (!form.value.password) return "";
  return form.value.password.length < 6 ? "密码至少需要6个字符" : "";
});

const isFormValid = computed(() => {
  return (
    form.value.email
    && form.value.password
    && !emailError.value
    && !passwordError.value
  );
});

// 登录处理
const handleLogin = async () => {
  if (!isFormValid.value) return;

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
  } catch (err) {
    console.error("Login error:", err);
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


