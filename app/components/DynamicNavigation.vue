<template>
  <nav class="hidden md:ml-8 md:flex md:space-x-8">
    <template v-for="menu in userMenus" :key="menu.id">
      <!-- 有子菜单的情况 -->
      <div v-if="menu.children && menu.children.length > 0" class="relative group">
        <button
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          @click="toggleSubmenu(menu.id)"
        >
          <component
            v-if="menu.icon"
            :is="getIconComponent(menu.icon)"
            class="w-4 h-4 mr-2"
          />
          {{ menu.name }}
          <ChevronDown class="w-4 h-4 ml-1" />
        </button>
        
        <!-- 子菜单下拉 -->
        <div
          v-if="openSubmenus.has(menu.id)"
          v-click-away="() => closeSubmenu(menu.id)"
          class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
        >
          <template v-for="child in menu.children" :key="child.id">
            <NuxtLink
              v-if="child.path && !child.is_external"
              :to="child.path"
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="closeSubmenu(menu.id)"
            >
              <component
                v-if="child.icon"
                :is="getIconComponent(child.icon)"
                class="w-4 h-4 mr-2 inline"
              />
              {{ child.name }}
            </NuxtLink>
            <a
              v-else-if="child.path && child.is_external"
              :href="child.path"
              target="_blank"
              rel="noopener noreferrer"
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="closeSubmenu(menu.id)"
            >
              <component
                v-if="child.icon"
                :is="getIconComponent(child.icon)"
                class="w-4 h-4 mr-2 inline"
              />
              {{ child.name }}
              <ExternalLink class="w-3 h-3 ml-1 inline" />
            </a>
          </template>
        </div>
      </div>
      
      <!-- 没有子菜单的情况 -->
      <template v-else>
        <NuxtLink
          v-if="menu.path && !menu.is_external"
          :to="menu.path"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          active-class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20"
        >
          <component
            v-if="menu.icon"
            :is="getIconComponent(menu.icon)"
            class="w-4 h-4 mr-2"
          />
          {{ menu.name }}
        </NuxtLink>
        <a
          v-else-if="menu.path && menu.is_external"
          :href="menu.path"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <component
            v-if="menu.icon"
            :is="getIconComponent(menu.icon)"
            class="w-4 h-4 mr-2"
          />
          {{ menu.name }}
          <ExternalLink class="w-3 h-3 ml-1" />
        </a>
      </template>
    </template>
  </nav>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  Database,
  Warehouse,
  ShoppingCart,
  Package,
  Factory,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  FileText,
  Calendar,
  Truck,
  ClipboardList,
  PieChart,
  Building,
  UserCheck,
  Shield,
  Key,
  Menu as MenuIcon,
  Folder,
  Tag,
  MapPin
} from 'lucide-vue-next'

// 图标映射
const iconMap = {
  LayoutDashboard,
  Database,
  Warehouse,
  ShoppingCart,
  Package,
  Factory,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  BookOpen,
  FileText,
  Calendar,
  Truck,
  ClipboardList,
  PieChart,
  Building,
  UserCheck,
  Shield,
  Key,
  MenuIcon,
  Folder,
  Tag,
  MapPin
}

// 获取图标组件
const getIconComponent = (iconName) => {
  return iconMap[iconName] || MenuIcon
}

// 状态
const userMenus = ref([])
const openSubmenus = ref(new Set())
const loading = ref(true)
const error = ref(null)

// 获取用户菜单
const { getUserMenus } = useMenus()
const user = useSupabaseUser()

// 切换子菜单
const toggleSubmenu = (menuId) => {
  if (openSubmenus.value.has(menuId)) {
    openSubmenus.value.delete(menuId)
  } else {
    openSubmenus.value.add(menuId)
  }
}

// 关闭子菜单
const closeSubmenu = (menuId) => {
  openSubmenus.value.delete(menuId)
}

// 关闭所有子菜单
const closeAllSubmenus = () => {
  openSubmenus.value.clear()
}

// 加载用户菜单
const loadUserMenus = async () => {
  if (!user.value?.id) {
    userMenus.value = []
    return
  }

  try {
    loading.value = true
    error.value = null
    
    const menus = await getUserMenus(user.value.id)
    userMenus.value = menus.filter(menu => !menu.is_hidden)
    
  } catch (err) {
    console.error('加载用户菜单失败:', err)
    error.value = err.message || '加载菜单失败'
    
    // 如果加载失败，使用默认菜单
    userMenus.value = [
      {
        id: 'dashboard',
        name: '仪表板',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        sort_order: 1
      }
    ]
  } finally {
    loading.value = false
  }
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

// 监听用户变化
watch(() => user.value?.id, (newUserId) => {
  if (newUserId) {
    loadUserMenus()
  } else {
    userMenus.value = []
  }
}, { immediate: true })

// 监听路由变化，关闭所有子菜单
const route = useRoute()
watch(() => route.path, () => {
  closeAllSubmenus()
})

// 组件挂载时加载菜单
onMounted(() => {
  if (user.value?.id) {
    loadUserMenus()
  }
})
</script>