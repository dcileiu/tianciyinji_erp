<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">仪表盘概览</h1>
      <p class="text-gray-600">欢迎使用智能ERP系统</p>
    </div>

    <!-- 用户菜单权限调试信息 -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">用户菜单权限</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <h3 class="font-medium text-blue-900 mb-2">加载状态</h3>
          <p class="text-blue-700">{{ loading ? '加载中...' : '加载完成' }}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <h3 class="font-medium text-green-900 mb-2">菜单组数量</h3>
          <p class="text-green-700">{{ availableMenus.length }} 个</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <h3 class="font-medium text-purple-900 mb-2">权限总数</h3>
          <p class="text-purple-700">{{ userPermissions.length }} 个</p>
        </div>
      </div>
    </div>

    <!-- 菜单权限详情 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">菜单权限详情</h2>
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-700">{{ error }}</p>
      </div>
      <div v-else-if="availableMenus.length > 0" class="space-y-4">
        <div v-for="menuGroup in availableMenus" :key="menuGroup.title" class="border rounded-lg p-4">
          <h3 class="font-medium text-gray-900 mb-2">{{ menuGroup.title }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div v-for="menuItem in menuGroup.menu" :key="menuItem.path"
                 class="flex items-center gap-2 text-sm text-gray-600">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{{ menuItem.name }}</span>
              <span class="text-xs text-gray-400">({{ menuItem.permission }})</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        <p>暂无菜单权限数据</p>
        <button @click="refreshMenus" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          重新加载菜单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 获取用户菜单权限
const { userMenus, loading, error, availableMenus, userPermissions, fetchUserMenus } = useUserMenus()

// 重新加载菜单
const refreshMenus = async () => {
  await fetchUserMenus()
}

// 页面加载时获取菜单权限
onMounted(async () => {
  if (userMenus.value.length === 0) {
    await refreshMenus()
  }
})
</script>
