<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-background">
    <div class="text-center space-y-6 max-w-md mx-auto px-4">
      <!-- 403 错误图标 -->
      <div class="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <ShieldX class="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>

      <!-- 错误信息 -->
      <div class="space-y-2">
        <h1 class="text-6xl font-bold text-muted-foreground">403</h1>
        <h2 class="text-2xl font-semibold text-foreground">访问被拒绝</h2>
        <p class="text-muted-foreground">
          抱歉，您没有权限访问此页面。请联系管理员获取相应权限。
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button @click="$router.back()" variant="outline">
          <ArrowLeft class="w-4 h-4 mr-2" />
          返回上页
        </Button>
        <Button @click="$router.push('/dashboard')">
          <Home class="w-4 h-4 mr-2" />
          返回首页
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Home, ShieldX } from 'lucide-vue-next'

// 页面权限配置 - 403页面不需要认证
definePageMeta({
  requiresAuth: false
})

// 页面标题
useHead({
  title: '403 - 访问被拒绝',
})
</script>
