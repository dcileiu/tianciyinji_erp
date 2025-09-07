<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">仪表盘</h1>
    <p class="text-gray-600 mb-6">欢迎使用智能ERP管理系统</p>

    <!-- 调试信息 -->
    <div class="bg-gray-100 p-4 rounded-lg">
      <h3 class="font-semibold mb-2">用户权限信息（调试）:</h3>
      <pre class="text-sm">{{ JSON.stringify({ permissions, menus }, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const { permissions, menus } = usePermissions();

// 页面权限配置
definePageMeta({
  layout: 'default',
  requiresAuth: true,
  // dashboard 页面不需要特定权限，所有登录用户都可以访问
});

useHead({
  title: '仪表盘 - 智能ERP管理系统',
});
</script>
