<template>
  <SidebarProvider>
    <ClientOnly>
      <AppSideBar />
      <template #fallback>
        <Sidebar variant="inset">
          <div class="animate-pulse">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div class="flex h-12 items-center gap-2 p-2">
                    <Skeleton class="h-8 w-8 rounded-lg" />
                    <div class="flex-1 space-y-1">
                      <Skeleton class="h-4 w-20" />
                      <Skeleton class="h-3 w-16" />
                    </div>
                    <Skeleton class="h-4 w-4" />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>
                  <Skeleton class="h-3 w-16" />
                </SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem v-for="n in 8" :key="n" class="p-0">
                    <div class="flex h-10 items-center gap-2 p-2">
                      <Skeleton class="h-4 w-4" />
                      <Skeleton class="h-4 w-20" />
                      <Skeleton class="h-4 w-4 ml-auto" />
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>

              <SidebarGroup class="mt-4">
                <SidebarGroupLabel>
                  <Skeleton class="h-3 w-12" />
                </SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem v-for="n in 3" :key="n" class="p-0">
                    <div class="flex h-10 items-center gap-2 p-2">
                      <Skeleton class="h-4 w-4" />
                      <Skeleton class="h-4 w-16" />
                    </div>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div class="flex h-12 items-center gap-2 p-2">
                    <Skeleton class="h-8 w-8 rounded-full" />
                    <div class="flex-1 space-y-1">
                      <Skeleton class="h-4 w-16" />
                      <Skeleton class="h-3 w-24" />
                    </div>
                    <Skeleton class="h-4 w-4" />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </div>
          <SidebarRail />
        </Sidebar>
      </template>
    </ClientOnly>
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
            <Search
              class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
            />
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
      dashboard: '仪表盘',
      sales: '销售管理',
      purchase: '采购管理',
      warehouse: '库存管理',
      production: '生产管理',
      finance: '财务管理',
      'master-data': '基础数据',
      reports: '报表分析',
      system: '系统设置',
      orders: '订单管理',
      customers: '客户管理',
      suppliers: '供应商管理',
      inventory: '库存管理',
      products: '产品管理',
      invoices: '发票管理',
      payments: '付款管理',
      receipts: '收款管理',
      plans: '计划管理',
      bom: '物料清单',
      config: '系统配置',
      users: '用户管理',
      login: '登录',
      roles: '角色管理',
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
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
    isFullscreen.value = false
  } else {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  }
}

const toggleNotifications = () => { }

// 监听全屏状态变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})
</script>
