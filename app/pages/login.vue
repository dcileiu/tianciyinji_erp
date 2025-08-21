<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo和标题区域 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ERP 管理系统
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          企业资源管理平台
        </p>
      </div>

      <!-- 登录卡片 -->
      <Card class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
        <div class="p-8">
          <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              欢迎回来
            </h2>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              请登录您的账户以继续使用系统
            </p>
          </div>

    <Login />

          <!-- 额外信息 -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <span>没有账户？</span>
              <span class="font-medium">请联系系统管理员</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- 页脚信息 -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          © 2025 ERP管理系统. 保留所有权利.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入组件
import Card from '~/components/ui/Card.vue'
import Login from '~/components/Login.vue'

// 页面元数据
definePageMeta({
  layout: 'auth'
})
</script>
