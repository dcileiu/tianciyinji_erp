<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import '~/style/main.css'

// 设置页面标题
useHead({
  title: 'ERP 管理系统',
  meta: [
    { name: 'description', content: 'Enterprise Resource Planning Management System' },
  ],
})
</script>

<style>
/* Nuxt Tailwind 模块会自动处理 Tailwind CSS */
</style>
