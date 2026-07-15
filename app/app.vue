<template>
  <div class="min-h-screen bg-background font-sans antialiased">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Toaster for global toast notifications -->
    <Toaster />
  </div>
</template>

<script lang="ts" setup>
  // shadcn-nuxt 会自动导入 Toaster 组件

  // 设置页面标题和meta信息
  useHead({
    title: "ERP 管理系统",
    meta: [
      {
        name: "description",
        content: "Modern Enterprise Resource Planning Management System",
      },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    htmlAttrs: {
      lang: "zh-CN",
    },
  });

  // 确保默认为明亮主题
  onMounted(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme || savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  });
</script>

<style>
  /* 全局样式 - CSS变量在 tailwind.css 中定义 */
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
</style>
