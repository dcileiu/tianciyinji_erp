<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center space-x-4">
          <UButton
            icon="i-heroicons-bars-3"
            variant="ghost"
            @click="sidebarOpen = !sidebarOpen"
          />
          <h1 class="text-xl font-semibold text-gray-900">
            ERP管理系统
          </h1>
        </div>

        <div class="flex items-center space-x-4">
          <!-- 用户菜单 -->
          <UDropdown :items="userMenuItems">
            <UButton
              :label="user?.user_metadata?.name || user?.email || '用户'"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              variant="ghost"
            />
          </UDropdown>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- 侧边栏 -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="flex flex-col h-full pt-16 lg:pt-0">
          <nav class="flex-1 px-4 py-6 space-y-2">
            <UVerticalNavigation :links="navigationLinks" />
          </nav>
        </div>
      </aside>

      <!-- 遮罩层 (移动端) -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
        @click="sidebarOpen = false"
      />

      <!-- 主内容区域 -->
      <main class="flex-1 lg:ml-0">
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const toast = useToast()

const sidebarOpen = ref(false)

// 用户菜单项
const userMenuItems = [[
  {
    label: '个人设置',
    icon: 'i-heroicons-user-circle',
    click: () => router.push('/profile')
  },
  {
    label: '退出登录',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: async () => {
      await supabase.auth.signOut()
      toast.add({
        title: '已退出登录',
        color: 'green'
      })
      router.push('/login')
    }
  }
]]

// 导航链接
const navigationLinks = [
  {
    label: '仪表板',
    icon: 'i-heroicons-home',
    to: '/'
  },
  {
    label: '销售管理',
    icon: 'i-heroicons-shopping-cart',
    children: [
      {
        label: '客户管理',
        to: '/sales/customers'
      },
      {
        label: '销售订单',
        to: '/sales/orders'
      },
      {
        label: '发货管理',
        to: '/sales/shipments'
      }
    ]
  },
  {
    label: '采购管理',
    icon: 'i-heroicons-truck',
    children: [
      {
        label: '供应商管理',
        to: '/purchase/suppliers'
      },
      {
        label: '采购订单',
        to: '/purchase/orders'
      },
      {
        label: '到货管理',
        to: '/purchase/receipts'
      }
    ]
  },
  {
    label: '库存管理',
    icon: 'i-heroicons-cube',
    children: [
      {
        label: '产品管理',
        to: '/inventory/products'
      },
      {
        label: '产品分类',
        to: '/inventory/categories'
      },
      {
        label: '库存查询',
        to: '/inventory/stock'
      },
      {
        label: '库存记录',
        to: '/inventory/records'
      }
    ]
  },
  {
    label: '财务管理',
    icon: 'i-heroicons-banknotes',
    children: [
      {
        label: '收款管理',
        to: '/finance/receivables'
      },
      {
        label: '付款管理',
        to: '/finance/payables'
      },
      {
        label: '财务报表',
        to: '/finance/reports'
      }
    ]
  },
  {
    label: '系统设置',
    icon: 'i-heroicons-cog-6-tooth',
    children: [
      {
        label: '用户管理',
        to: '/settings/users'
      },
      {
        label: '角色权限',
        to: '/settings/roles'
      },
      {
        label: '系统日志',
        to: '/settings/logs'
      }
    ]
  }
]

// 监听路由变化，关闭侧边栏
watch(() => router.currentRoute.value.path, () => {
  sidebarOpen.value = false
})
</script>
