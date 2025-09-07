<script setup lang="ts">
// 页面权限
definePageMeta({
  layout: 'default',
  requiresAuth: true,
  permission: 'customer:view',
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mb-6">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">客户管理</h1>
        <p class="text-gray-600">Customer Management</p>
      </div>
      <div class="text-gray-500 mb-6">
        <p class="text-lg mb-2">🚧 敬请期待</p>
        <p class="text-sm">该功能正在开发中，即将上线</p>
      </div>
      <button @click="$router.go(-1)" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        返回上页
      </button>
    </div>
  </div>
</template>
