<template>
  <div class="min-h-screen bg-background flex">
    <!-- 侧边栏 -->
    <aside 
      class="transition-all duration-300 ease-in-out z-40 fixed top-0 left-0 h-screen overflow-hidden border-r bg-card"
      :class="sidebarCollapsed ? 'w-16' : 'w-64'"
    >
      <SidebarMenu 
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />
    </aside>

    <!-- 主要内容区域 -->
    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="sidebarCollapsed ? 'ml-16' : 'ml-64'"
    >
      <!-- 顶部导航栏 -->
      <header class="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-30 h-16">
        <div class="flex h-16 items-center justify-between px-6">
          <!-- 面包屑导航 -->
          <nav class="flex items-center space-x-1 text-sm text-muted-foreground">
            <template v-for="(item, index) in breadcrumbItems" :key="index">
              <NuxtLink 
                v-if="item.route" 
                :to="item.route" 
                class="hover:text-foreground transition-colors"
              >
                {{ item.label }}
              </NuxtLink>
              <span v-else class="text-foreground font-medium">{{ item.label }}</span>
              <ChevronRight v-if="index < breadcrumbItems.length - 1" class="h-4 w-4" />
            </template>
          </nav>

          <!-- 右侧操作区 -->
          <div class="flex items-center space-x-2">
            <!-- 搜索 -->
            <div class="relative">
              <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="globalSearch"
                placeholder="全局搜索..."
                class="w-64 pl-8"
                type="search"
              />
            </div>

            <!-- 通知 -->
            <Button
              variant="ghost"
              size="icon"
              class="relative"
              @click="toggleNotifications"
            >
              <Bell class="h-4 w-4" />
              <Badge 
                class="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                variant="destructive"
              >
                3
              </Badge>
            </Button>

            <!-- 主题切换 -->
            <Button
              variant="ghost"
              size="icon"
              @click="toggleTheme"
            >
              <Sun v-if="isDark" class="h-4 w-4" />
              <Moon v-else class="h-4 w-4" />
            </Button>

            <!-- 全屏 -->
            <Button
              variant="ghost"
              size="icon"
              @click="toggleFullscreen"
            >
              <Minimize v-if="isFullscreen" class="h-4 w-4" />
              <Maximize v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-hidden">
        <div class="h-full overflow-y-auto p-6">
          <slot />
        </div>
      </main>
    </div>

    <!-- 全局加载器 -->
    <GlobalLoader />
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Minimize, 
  Maximize, 
  ChevronRight 
} from 'lucide-vue-next'

// 获取路由信息
const route = useRoute()

// 状态管理
const sidebarCollapsed = ref(false)
const isDark = ref(false)
const isFullscreen = ref(false)
const globalSearch = ref('')

// 面包屑导航
const breadcrumbItems = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const items = [{ label: '首页', route: '/dashboard' }]
  
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1
    
    // 路径映射
    const pathLabels: Record<string, string> = {
      "dashboard": '仪表盘',
      "sales": '销售管理',
      "purchase": '采购管理',
      "warehouse": '库存管理',
      "production": '生产管理',
      "finance": '财务管理',
      'master-data': '基础数据',
      "reports": '报表分析',
      "system": '系统设置',
      "orders": '订单管理',
      "customers": '客户管理',
      "suppliers": '供应商管理',
      "inventory": '库存管理',
      "products": '产品管理',
      "invoices": '发票管理',
      "payments": '付款管理',
      "receipts": '收款管理',
      "plans": '计划管理',
      "bom": '物料清单',
      "config": '系统配置',
      "users": '用户管理',
      "roles": '角色权限'
    }
    
    items.push({
      label: pathLabels[segment] ?? segment,
      route: isLast ? '' : currentPath
    })
  })
  
  return items
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  // 这里可以实现主题切换逻辑
  console.log('切换主题:', isDark.value ? '深色' : '浅色')
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const toggleNotifications = () => {
  console.log('显示通知')
}

// 监听全屏状态变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})
</script>


