<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
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
                </div>
                <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  ERP系统
                </span>
              </div>
            </div>
          </div>

          <!-- 主题切换按钮 -->
          <div class="flex items-center space-x-4">
            <button
              class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              @click="toggleTheme"
            >
              <Sun
                v-if="isDark"
                class="w-5 h-5"
              />
              <Moon
                v-else
                class="w-5 h-5"
              />
            </button>
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
          <p class="text-sm text-gray-500 dark:text-gray-400">
            © 2024 ERP 管理系统. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'

// 主题管理
const isDark = ref(false)

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }
  else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)

  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})
</script>
