<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <Register />
  </div>
</template>

<script setup lang="ts">
// 使用认证布局
definePageMeta({
  layout: 'auth',
})

// 页面标题
useHead({
  title: '注册 - ERP 管理系统',
})
</script> 
