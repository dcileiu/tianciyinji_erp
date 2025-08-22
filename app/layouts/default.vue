<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo 和导航 -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <NuxtLink to="/dashboard" class="flex items-center">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">E</span>
                </div>
                <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  ERP系统
                </span>
              </NuxtLink>
            </div>

            <!-- 动态导航菜单 -->
            <DynamicNavigation />
          </div>

          <!-- 右侧用户信息 -->
          <div class="flex items-center space-x-4">
            <!-- 主题切换按钮 -->
            <button
              class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              @click="toggleTheme"
            >
              <Sun
                v-if="isDark"
                class="w-5 h-5"
              />
              <Moon
                v-else
                class="w-5 h-5"
              />
            </button>

            <!-- 用户下拉菜单 -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ userInitials }}
                  </span>
                </div>
                <span class="hidden md:block text-sm font-medium">
                  {{ userDisplayName }}
                </span>
                <ChevronDown class="w-4 h-4" />
              </button>

              <!-- 下拉菜单 -->
              <div
                v-if="showUserMenu"
                v-click-away="() => showUserMenu = false"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
              >
                <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ userDisplayName }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ user?.email }}
                  </p>
                </div>
                
                <NuxtLink
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  @click="showUserMenu = false"
                >
                  个人资料
                </NuxtLink>
                
                <NuxtLink
                  to="/settings"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  @click="showUserMenu = false"
                >
                  设置
                </NuxtLink>
                
                <hr class="my-1 border-gray-200 dark:border-gray-700">
                
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- 移动端菜单（可选） -->
    <!-- 这里可以添加移动端抽屉菜单 -->
    
    <!-- 全局加载指示器 -->
    <GlobalLoader />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-vue-next'

import GlobalLoader from '~/components/ui/GlobalLoader.vue'

// 用户状态
const user = useSupabaseUser()
const { auth } = useSupabaseClient()

// 主题状态
const isDark = ref(false)
const showUserMenu = ref(false)

// 用户显示名称
const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.user_metadata?.full_name || 
         user.value.user_metadata?.name || 
         user.value.email?.split('@')[0] || 
         '用户'
})

// 用户首字母
const userInitials = computed(() => {
  if (!user.value) return ''
  const name = displayName.value
  if (name.length === 0) return ''
  if (name.length === 1) return name.toUpperCase()
  
  // 如果是中文名，取前两个字符
  if (/[\u4e00-\u9fa5]/.test(name)) {
    return name.slice(0, 2)
  }
  
  // 如果是英文名，取首字母
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name[0].toUpperCase()
})

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// 登出
const handleLogout = async () => {
  try {
    await auth.signOut()
    await navigateTo('/auth/login')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 关闭用户菜单
const closeUserMenu = () => {
  showUserMenu.value = false
}

// Click away directive
const vClickAway = {
  beforeMount(el, binding) {
    el.clickAwayEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickAwayEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickAwayEvent)
  }
}

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>
