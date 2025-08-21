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

            <!-- 主导航 -->
            <nav class="hidden md:ml-8 md:flex md:space-x-8">
              <NuxtLink 
                to="/dashboard" 
                class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BarChart3 class="w-4 h-4 mr-2" />
                仪表板
              </NuxtLink>
              
              <!-- 快速入门 -->
              <NuxtLink 
                to="/getting-started" 
                class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BookOpen class="w-4 h-4 mr-2" />
                快速入门
              </NuxtLink>
              <NuxtLink 
                to="/master-data/products" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                主数据
              </NuxtLink>
              <NuxtLink 
                to="/warehouse/inventory" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                仓库管理
              </NuxtLink>
              <NuxtLink 
                to="/sales/orders" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                销售管理
              </NuxtLink>
              <NuxtLink 
                to="/purchase/orders" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                采购管理
              </NuxtLink>
              <NuxtLink 
                to="/production/orders" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                生产管理
              </NuxtLink>
              <NuxtLink 
                to="/finance/receipts" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                财务管理
              </NuxtLink>
              <NuxtLink 
                to="/reports/sales" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                报表中心
              </NuxtLink>
              <NuxtLink 
                to="/users" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                用户管理
              </NuxtLink>
              <NuxtLink 
                to="/system/roles" 
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
                active-class="text-blue-600 dark:text-blue-400"
              >
                系统设置
              </NuxtLink>
            </nav>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  BarChart3, Users, Package, ShoppingCart, ShoppingBag, Factory, 
  Warehouse, Settings, LogOut, Menu, X, BookOpen, Sun, Moon, ChevronDown
} from 'lucide-vue-next'

// 用户状态
const { user, logout, isAuthenticated } = useAuth()

// 界面状态
const isDark = ref(false)
const showUserMenu = ref(false)

// 计算属性
const userDisplayName = computed(() => {
  if (!user.value) return '未知用户'
  
  // 优先使用用户元数据中的 full_name
  if (user.value.user_metadata?.full_name) {
    return user.value.user_metadata.full_name
  }
  
  // 如果没有，使用邮箱的用户名部分
  if (user.value.email) {
    return user.value.email.split('@')[0]
  }
  
  return '未知用户'
})

const userInitials = computed(() => {
  const name = userDisplayName.value
  if (name === '未知用户') return 'U'
  
  // 如果是中文名，取前两个字符
  if (/[\u4e00-\u9fa5]/.test(name)) {
    return name.slice(0, 2)
  }
  
  // 如果是英文名，取首字母
  const words = name.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  
  return name[0]?.toUpperCase() || 'U'
})

// 主题切换
const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// 处理登出
const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
}

// Click away directive
const vClickAway = {
  beforeMount(el: any, binding: any) {
    el.clickAwayEvent = function (event: Event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickAwayEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickAwayEvent)
  }
}

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)

  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
})

// 确保用户已登录
watch(() => isAuthenticated.value, (isAuth) => {
  if (!isAuth) {
    navigateTo('/login')
  }
}, { immediate: true })
</script>
