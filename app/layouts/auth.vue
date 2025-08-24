<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-32 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
    </div>

    <!-- 头部 -->
    <header class="relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <!-- Logo -->
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">E</span>
                <span class="ml-2 text-xl font-bold text-gray-900">
                  ERP系统
                </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 主题切换按钮 -->
          <div class="flex items-center space-x-4">
            <Button
              icon="pi pi-sun"
              severity="secondary"
              text
              rounded
              class="theme-toggle"
              @click="toggleTheme"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="relative z-10">
      <slot></slot>
    </main>

    <!-- 页脚 -->
    <footer class="relative z-10 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-sm text-gray-500">
            © 2025 ERP 管理系统. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'

// 主题管理
const isDark = ref(false)

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  // 这里可以实现主题切换逻辑
  console.log('切换主题:', isDark.value ? '深色' : '浅色')
}
</script>

<style scoped>
.theme-toggle :deep(.p-button) {
  color: #6b7280;
}

.theme-toggle :deep(.p-button:hover) {
  color: #374151;
  background-color: #f3f4f6;
}
</style>
