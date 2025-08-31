<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div class="mb-6">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <component :is="iconComponent" class="w-10 h-10 text-blue-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ title }}</h1>
        <p class="text-gray-600">{{ subtitle }}</p>
      </div>
      <div class="text-gray-500 mb-6">
        <p class="text-lg mb-2">🚧 敬请期待</p>
        <p class="text-sm">该功能正在开发中，即将上线</p>
      </div>
      <button @click="goBack" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        返回上页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'Package'
})

// 图标映射
const iconMap = {
  'Package': 'svg',
  'ShoppingBag': 'svg',
  'Users': 'svg',
  'FileText': 'svg',
  'Building': 'svg',
  'Calendar': 'svg',
  'BarChart3': 'svg',
  'Settings': 'svg'
}

const iconComponent = computed(() => {
  // 返回默认的 SVG 图标
  return {
    template: `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
      </svg>
    `
  }
})

const goBack = () => {
  if (history.length > 1) {
    history.back()
  } else {
    navigateTo('/dashboard')
  }
}
</script>
