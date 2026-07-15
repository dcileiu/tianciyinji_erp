<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">权限系统调试</h1>

    <!-- 用户信息 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>当前用户信息</CardTitle>
      </CardHeader>
      <CardContent>
        <pre
          class="bg-gray-100 p-4 rounded text-sm overflow-auto"
        >{{ JSON.stringify(user, null, 2) }}</pre>
      </CardContent>
    </Card>

    <!-- 权限加载状态 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>权限加载状态</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <p><strong>加载中:</strong> {{ loading }}</p>
          <p><strong>错误:</strong> {{ error || '无' }}</p>
          <p><strong>权限数量:</strong> {{ permissions.length }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- 用户权限列表 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>用户权限列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="permissions.length > 0">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <Badge
              variant="secondary"
              v-for="permission in permissions"
              :key="permission"
            >
              {{ permission }}
            </Badge>
          </div>
        </div>
        <p class="text-gray-500" v-else>暂无权限数据</p>
      </CardContent>
    </Card>

    <!-- 菜单数据 -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>菜单数据</CardTitle>
      </CardHeader>
      <CardContent>
        <pre
          class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96"
        >{{ JSON.stringify(authorizedMenus, null, 2) }}</pre>
      </CardContent>
    </Card>

    <!-- 操作按钮 -->
    <div class="flex gap-4">
      <Button :disabled="loading" @click="refreshPermissions">
        {{ loading ? '加载中...' : '刷新权限' }}
      </Button>
      <Button variant="outline" @click="testAPI"> 测试API </Button>
      <Button variant="destructive" @click="debugUserData"> 深度调试 </Button>
    </div>

    <!-- API测试结果 -->
    <Card class="mt-6" v-if="apiResult">
      <CardHeader>
        <CardTitle>API测试结果</CardTitle>
      </CardHeader>
      <CardContent>
        <pre
          class="bg-gray-100 p-4 rounded text-sm overflow-auto"
        >{{ apiResult }}</pre>
      </CardContent>
    </Card>
  </div>
</template>

<script lang="ts" setup>
  // 页面配置
  definePageMeta({
    requiresAuth: true,
    permission: "system:roles",
    layout: "default",
  });

  const { user } = useAuth();
  const { permissions, authorizedMenus, loading, error, refreshPermissions } =
    usePermissions();

  const apiResult = ref("");

  // 测试API调用
  const testAPI = async () => {
    try {
      apiResult.value = "正在测试API...";

      const [permissionsRes, menusRes] = await Promise.all([
        $fetch("/api/user", { query: { action: "permissions" } }),
        $fetch("/api/user", { query: { action: "menus" } }),
      ]);

      apiResult.value = JSON.stringify(
        {
          permissions: permissionsRes,
          menus: menusRes,
        },
        null,
        2
      );
    } catch (err: any) {
      apiResult.value = `API错误: ${err.message}\n${JSON.stringify(err, null, 2)}`;
    }
  };

  // 深度调试用户数据
  const debugUserData = async () => {
    try {
      apiResult.value = "正在深度调试...";

      const debugRes = await $fetch("/api/debug/user-data");

      apiResult.value = JSON.stringify(debugRes, null, 2);
    } catch (err: any) {
      apiResult.value = `调试API错误: ${err.message}\n${JSON.stringify(err, null, 2)}`;
    }
  };

  // 页面加载时获取权限
  onMounted(async () => {
    if (user.value && permissions.value.length === 0) {
      await refreshPermissions();
    }
  });
</script>
