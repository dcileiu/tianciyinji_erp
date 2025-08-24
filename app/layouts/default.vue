<template>
  <div class="min-h-screen bg-surface-0 flex">
    <!-- 侧边栏 -->
    <aside 
      class="transition-all duration-300 ease-in-out z-40 fixed top-0 left-0 h-screen overflow-hidden"
      :class="sidebarCollapsed ? 'w-20' : 'w-[280px]'"
    >
      <SidebarMenu 
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
      />
    </aside>

    <!-- 主要内容区域 -->
    <div
class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
         :class="sidebarCollapsed ? 'ml-20' : 'ml-[280px]'">
      <!-- 顶部导航栏 -->
      <Toolbar class="border-b border-surface-200 bg-surface-0 sticky top-0 z-30 h-4rem">
        <template #start>
          <!-- 面包屑导航 -->
            <Breadcrumb :model="breadcrumbItems" class="text-sm">
              <template #item="{ item }">
                <NuxtLink v-if="item.route" :to="item.route" class="text-primary hover:text-primary-600">
                  {{ item.label }}
                </NuxtLink>
                <span v-else class="text-surface-600">{{ item.label }}</span>
              </template>
            </Breadcrumb>
        </template>

        <template #end>
          <!-- 右侧操作区 -->
          <div class="flex align-items-center gap-3">
            <!-- 搜索 -->
              <IconField icon-position="left">
                <InputIcon>
                  <i class="pi pi-search"></i>
                </InputIcon>
                <InputText
                  v-model="globalSearch"
                  placeholder="全局搜索..."
                class="w-16rem"
                  size="small"
                />
              </IconField>

            <!-- 通知 -->
            <Button
              v-tooltip.bottom="'通知'"
              icon="pi pi-bell"
              text
              rounded
              size="small"
              severity="secondary"
              class="relative"
              @click="toggleNotifications"
            >
              <Badge value="3" severity="danger" class="absolute -top-1 -right-1"></Badge>
            </Button>

            <!-- 主题切换 -->
            <Button
              v-tooltip.bottom="'切换主题'"
              :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
              text
              rounded
              size="small"
              severity="secondary"
              @click="toggleTheme"
            />

            <!-- 全屏 -->
            <Button
              v-tooltip.bottom="'全屏'"
              :icon="isFullscreen ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
              text
              rounded
              size="small"
              severity="secondary"
              @click="toggleFullscreen"
            />
          </div>
        </template>
      </Toolbar>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-hidden">
        <div class="h-full overflow-y-auto p-5">
          <slot />
        </div>
      </main>
    </div>

    <!-- 全局加载器 -->
    <GlobalLoader />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Breadcrumb from 'primevue/breadcrumb'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Toolbar from 'primevue/toolbar'

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


