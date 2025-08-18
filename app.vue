<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// 全局配置
useHead({
  title: 'ERP管理系统',
  meta: [
    { name: 'description', content: '现代化企业资源规划管理系统' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// 全局样式和主题
const colorMode = useColorMode()

// 初始化应用
onMounted(() => {
  // 可以在这里添加全局初始化逻辑
})
</script>

<style>
/* 全局样式已在 assets/css/main.css 中定义 */
</style>
