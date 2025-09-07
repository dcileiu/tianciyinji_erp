<template>
  <div class="space-y-2">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
      <span class="ml-2 text-sm text-muted-foreground">加载菜单中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="p-4 text-center text-red-500">
      <AlertCircle class="w-6 h-6 mx-auto mb-2" />
      <p class="text-sm">{{ error }}</p>
      <Button
        variant="outline"
        size="sm"
        class="mt-2"
        @click="refreshPermissions"
      >
        重试
      </Button>
    </div>

    <!-- 菜单列表 -->
    <template v-else>
      <NavMain :items="authorizedMenus" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, Loader2 } from 'lucide-vue-next';

const {
  authorizedMenus,
  loading,
  error,
  refreshPermissions,
  fetchUserPermissions,
} = usePermissions();

const permissionsStore = usePermissionsStore();

// 组件挂载时获取权限数据
onMounted(async () => {
  if (
    authorizedMenus.value.length === 0 &&
    !loading.value &&
    !permissionsStore.loaded
  ) {
    await fetchUserPermissions();
  }
});
</script>
