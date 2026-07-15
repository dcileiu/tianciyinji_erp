<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
  >
    <Card class="w-full max-w-md shadow-2xl border-0">
      <CardContent class="space-y-4 p-6 text-center">
        <h1 class="text-2xl font-bold">注册已关闭</h1>
        <p class="text-muted-foreground text-sm">
          本系统不开放自助注册。请联系管理员在「用户管理」中为您创建账号。
        </p>
        <Button class="w-full" type="button" @click="navigateTo('/login')">
          返回登录
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<script lang="ts" setup>
  definePageMeta({
    layout: false,
    requiresAuth: false,
  });

  useHead({ title: "注册已关闭" });
</script>
