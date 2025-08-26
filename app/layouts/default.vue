<template>
  <SidebarProvider>
    <AppSideBar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <template v-for="(item, index) in breadcrumbItems" :key="index">
                <BreadcrumbItem v-if="item.route" class="hidden md:block">
                  <BreadcrumbLink :href="item.route">
                    {{ item.label }}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem v-else>
                  <BreadcrumbPage>{{ item.label }}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator
                  v-if="index < breadcrumbItems.length - 1"
                  class="hidden md:block"
                />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <!-- 右侧操作区 -->
        <div class="flex items-center space-x-2 ml-auto pr-4">
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
          <Button variant="ghost" size="icon" class="relative" @click="toggleNotifications">
            <Bell class="h-4 w-4" />
            <Badge
              class="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              variant="destructive"
            >
              3
            </Badge>
          </Button>

          <!-- 主题切换 -->
          <Button variant="ghost" size="icon" @click="toggleTheme">
            <Sun v-if="isDark" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
          </Button>

          <!-- 全屏 -->
          <Button variant="ghost" size="icon" @click="toggleFullscreen">
            <Minimize v-if="isFullscreen" class="h-4 w-4" />
            <Maximize v-else class="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <slot />
      </div>
    </SidebarInset>

    <!-- 全局加载器 -->
    <GlobalLoader />
  </SidebarProvider>
</template>

<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Bell, Maximize, Minimize, Moon, Search, Sun } from 'lucide-vue-next'

// 获取路由信息
const route = useRoute()

// 状态管理
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
      'dashboard': '仪表盘',
      'sales': '销售管理',
      'purchase': '采购管理',
      'warehouse': '库存管理',
      'production': '生产管理',
      'finance': '财务管理',
      'master-data': '基础数据',
      'reports': '报表分析',
      'system': '系统设置',
      'orders': '订单管理',
      'customers': '客户管理',
      'suppliers': '供应商管理',
      'inventory': '库存管理',
      'products': '产品管理',
      'invoices': '发票管理',
      'payments': '付款管理',
      'receipts': '收款管理',
      'plans': '计划管理',
      'bom': '物料清单',
      'config': '系统配置',
      'users': '用户管理',
      'login': '登录',
      'roles': '角色权限',
    }

    items.push({
      label: pathLabels[segment] ?? segment,
      route: isLast ? '' : currentPath,
    })
  })

  return items
})

// 方法
const toggleTheme = () => {
  isDark.value = !isDark.value
  // 这里可以实现主题切换逻辑
  console.log('切换主题:', isDark.value ? '深色' : '浅色')
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  }
  else {
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
