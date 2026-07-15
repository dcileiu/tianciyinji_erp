<template>
  <div class="min-h-screen bg-surface-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <Card class="mb-8">
        <template #header>
          <div class="p-6 bg-primary-50">
            <h1 class="text-2xl font-bold text-surface-900">
              🧪 认证功能测试页面
            </h1>
            <p class="text-surface-600 mt-2">测试 Session 认证功能</p>
          </div>
        </template>

        <template #content>
          <div class="p-6">
            <!-- 当前状态 -->
            <div class="mb-8 p-4 bg-surface-100 border-round-lg">
              <h2 class="text-lg font-semibold mb-4">📊 当前认证状态</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  class="bg-surface-0 p-4 border-round border-1 border-surface"
                >
                  <p class="text-sm text-surface-600">加载状态</p>
                  <p
                    class="text-lg font-semibold"
                    :class="isLoading ? 'text-yellow-600' : 'text-green-600'"
                  >
                    {{ isLoading ? "加载中" : "已加载" }}
                  </p>
                </div>
                <div
                  class="bg-surface-0 p-4 border-round border-1 border-surface"
                >
                  <p class="text-sm text-surface-600">认证状态</p>
                  <p
                    class="text-lg font-semibold"
                    :class="isAuthenticated ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ isAuthenticated ? "已登录" : "未登录" }}
                  </p>
                </div>
                <div
                  class="bg-surface-0 p-4 border-round border-1 border-surface"
                >
                  <p class="text-sm text-surface-600">用户邮箱</p>
                  <p class="text-lg font-semibold">
                    {{ user?.email || "无" }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 功能测试区域 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- 登录测试 -->
              <div class="flex flex-column gap-4">
                <h3 class="text-lg font-semibold text-surface-900">
                  🔐 登录测试
                </h3>
                <div class="flex flex-column gap-3">
                  <!-- FloatLabel 组件已移除 -->
                  <Input
                    class="w-full"
                    id="loginEmail"
                    type="email"
                    v-model="loginForm.email"
                  />
                  <label for="loginEmail">邮箱</label>
                  <!-- /FloatLabel -->

                  <!-- FloatLabel 组件已移除 -->
                  <Input
                    class="w-full"
                    input-class="w-full"
                    toggle-mask
                    type="password"
                    v-model="loginForm.password"
                  />
                  <label>密码</label>
                  <!-- /FloatLabel -->

                  <Button
                    class="w-full"
                    :loading="testing.login"
                    @click="testLogin"
                  />
                </div>
              </div>

              <!-- 注册测试 -->
              <div class="flex flex-column gap-4">
                <h3 class="text-lg font-semibold text-surface-900">
                  📝 注册测试
                </h3>
                <div class="flex flex-column gap-3">
                  <!-- FloatLabel 组件已移除 -->
                  <Input
                    class="w-full"
                    id="registerName"
                    v-model="registerForm.name"
                  />
                  <label for="registerName">姓名</label>
                  <!-- /FloatLabel -->

                  <!-- FloatLabel 组件已移除 -->
                  <Input
                    class="w-full"
                    id="registerEmail"
                    type="email"
                    v-model="registerForm.email"
                  />
                  <label for="registerEmail">邮箱</label>
                  <!-- /FloatLabel -->

                  <!-- FloatLabel 组件已移除 -->
                  <Input
                    class="w-full"
                    input-class="w-full"
                    toggle-mask
                    type="password"
                    v-model="registerForm.password"
                  />
                  <label>密码</label>
                  <!-- /FloatLabel -->

                  <Button
                    class="w-full"
                    :loading="testing.register"
                    @click="testRegister"
                  />
                </div>
              </div>

              <!-- 忘记密码测试 -->
              <div class="flex flex-column gap-4">
                <h3 class="text-lg font-semibold text-surface-900">
                  🔄 忘记密码测试
                </h3>
                <div class="flex flex-column gap-3">
                  <!-- FloatLabel 组件已移除 -->
                  <Input
                    class="w-full"
                    id="resetEmail"
                    type="email"
                    v-model="resetForm.email"
                  />
                  <label for="resetEmail">邮箱</label>
                  <!-- /FloatLabel -->

                  <Button
                    class="w-full"
                    :loading="testing.reset"
                    @click="testResetPassword"
                  />
                </div>
              </div>

              <!-- 会话管理测试 -->
              <div class="flex flex-column gap-4">
                <h3 class="text-lg font-semibold text-surface-900">
                  🔧 会话管理测试
                </h3>
                <div class="flex flex-column gap-3">
                  <Button
                    class="w-full"
                    :loading="testing.session"
                    @click="testGetSession"
                  />

                  <Button
                    class="w-full"
                    :loading="testing.refresh"
                    @click="testRefreshSession"
                  />

                  <Button
                    class="w-full"
                    severity="danger"
                    :disabled="!isAuthenticated"
                    :loading="testing.logout"
                    @click="testLogout"
                  />
                </div>
              </div>
            </div>

            <!-- 测试结果 -->
            <div class="mt-8">
              <h3 class="text-lg font-semibold text-surface-900 mb-4">
                📋 测试结果
              </h3>
              <div
                class="bg-surface-100 border-round-lg p-4 max-h-96 overflow-y-auto"
              >
                <div
                  class="text-surface-500 text-center py-8"
                  v-if="testResults.length === 0"
                >
                  暂无测试结果
                </div>
                <div class="flex flex-column gap-2" v-else>
                  <div
                    class="p-3 border-round border-1 border-surface"
                    v-for="(result, index) in testResults"
                    :key="index"
                    :class="
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    "
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-medium">{{ result.action }}</span>
                      <span class="text-sm text-surface-500"
                        >{{ result.timestamp }}</span
                      >
                    </div>
                    <p
                      class="text-sm mt-1"
                      :class="
                        result.success ? 'text-green-700' : 'text-red-700'
                      "
                    >
                      {{ result.message }}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                class="mt-2"
                size="sm"
                v-if="testResults.length > 0"
                @click="clearResults"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // import Card from 'primevue/card' // 已移除PrimeVue导入
  // import InputText from 'primevue/inputtext' // 已移除PrimeVue导入
  // import Password from 'primevue/password' // 已移除PrimeVue导入
  // import Button from 'primevue/button' // 已移除PrimeVue导入
  // import FloatLabel from 'primevue/floatlabel' // 已移除PrimeVue导入
  import { useAuth } from "~/composables/useAuth";

  // 页面配置
  definePageMeta({
    layout: false,
  });

  useHead({
    title: "认证功能测试 - ERP管理系统",
  });

  // 认证状态
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    resetPassword,
    logout,
    getSession,
    refreshSession,
  } = useAuth();

  // 表单数据
  const loginForm = ref({
    email: "test@example.com",
    password: "password123",
  });

  const registerForm = ref({
    name: "测试用户",
    email: "newuser@example.com",
    password: "password123",
  });

  const resetForm = ref({
    email: "test@example.com",
  });

  // 测试状态
  const testing = ref({
    login: false,
    register: false,
    reset: false,
    logout: false,
    session: false,
    refresh: false,
  });

  // 测试结果
  const testResults = ref<
    Array<{
      action: string;
      success: boolean;
      message: string;
      timestamp: string;
    }>
  >([]);

  const addResult = (action: string, success: boolean, message: string) => {
    testResults.value.unshift({
      action,
      success,
      message,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // 测试函数
  const testLogin = async () => {
    testing.value.login = true;
    try {
      const result = await login(loginForm.value);
      if (result.success) {
        addResult("登录测试", true, `登录成功: ${result.user?.email}`);
      } else {
        addResult("登录测试", false, result.error?.message || "登录失败");
      }
    } catch (error: any) {
      addResult("登录测试", false, `错误: ${error.message}`);
    } finally {
      testing.value.login = false;
    }
  };

  const testRegister = async () => {
    testing.value.register = true;
    try {
      const result = await register(
        registerForm.value.email,
        registerForm.value.password,
        {
          name: registerForm.value.name,
        }
      );
      if (result.success) {
        if (result.needsEmailConfirmation) {
          addResult("注册测试", true, "注册成功，需要邮箱验证");
        } else {
          addResult("注册测试", true, "注册成功，无需邮箱验证");
        }
      } else {
        addResult("注册测试", false, result.error?.message || "注册失败");
      }
    } catch (error: any) {
      addResult("注册测试", false, `错误: ${error.message}`);
    } finally {
      testing.value.register = false;
    }
  };

  const testResetPassword = async () => {
    testing.value.reset = true;
    try {
      const result = await resetPassword(resetForm.value.email);
      if (result.success) {
        addResult("密码重置", true, "重置邮件发送成功");
      } else {
        addResult("密码重置", false, result.error?.message || "发送失败");
      }
    } catch (error: any) {
      addResult("密码重置", false, `错误: ${error.message}`);
    } finally {
      testing.value.reset = false;
    }
  };

  const testLogout = async () => {
    testing.value.logout = true;
    try {
      const result = await logout();
      if (result.success) {
        addResult("登出测试", true, "登出成功");
      } else {
        addResult("登出测试", false, result.error?.message || "登出失败");
      }
    } catch (error: any) {
      addResult("登出测试", false, `错误: ${error.message}`);
    } finally {
      testing.value.logout = false;
    }
  };

  const testGetSession = async () => {
    testing.value.session = true;
    try {
      const session = await getSession();
      if (session) {
        addResult("获取会话", true, `会话有效: ${session.user?.email}`);
      } else {
        addResult("获取会话", false, "无有效会话");
      }
    } catch (error: any) {
      addResult("获取会话", false, `错误: ${error.message}`);
    } finally {
      testing.value.session = false;
    }
  };

  const testRefreshSession = async () => {
    testing.value.refresh = true;
    try {
      const session = await refreshSession();
      if (session) {
        addResult("刷新会话", true, "会话刷新成功");
      } else {
        addResult("刷新会话", false, "会话刷新失败");
      }
    } catch (error: any) {
      addResult("刷新会话", false, `错误: ${error.message}`);
    } finally {
      testing.value.refresh = false;
    }
  };

  const clearResults = () => {
    testResults.value = [];
  };
</script>
