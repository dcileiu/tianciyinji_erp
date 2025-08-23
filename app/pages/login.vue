<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 max-w-4xl w-full bg-white/95 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl">
      <!-- 品牌标识 -->
      <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-12 flex flex-col justify-center">
        <div class="flex flex-col items-center mb-8">
          <div class="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-4">
            <span class="text-4xl font-bold text-white">E</span>
          </div>
          <h1 class="text-3xl font-bold text-center text-white drop-shadow-sm">ERP 管理系统</h1>
        </div>
        <p class="text-lg leading-relaxed text-center text-white/90">
          现代化企业资源规划系统，助力企业数字化转型
        </p>
      </div>

      <!-- 登录表单 -->
      <Login />
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入组件
import Login from '~/components/Login.vue'

// 页面元数据
definePageMeta({
  layout: 'auth'
})

// 页面标题
useHead({
  title: '用户登录 - ERP 管理系统'
})
</script>
