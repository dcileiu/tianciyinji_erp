<template>
  <Sidebar v-bind="$props" variant="inset">
    <!-- 显示骨架屏当数据加载中 -->
    <div v-if="isLoading" class="animate-pulse">
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
        <!-- Business Modules Section Skeleton -->
        <SidebarGroup>
          <SidebarGroupLabel>
            <Skeleton class="h-3 w-16" />
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="n in 8" :key="`menu-skeleton-${n}`" class="p-0">
              <div class="flex h-10 items-center gap-2 p-2">
                <Skeleton class="h-4 w-4" />
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-4 w-4 ml-auto" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <!-- Projects Section Skeleton -->
        <SidebarGroup class="mt-4">
          <SidebarGroupLabel>
            <Skeleton class="h-3 w-12" />
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem v-for="n in 3" :key="`project-skeleton-${n}`" class="p-0">
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

    <!-- 实际内容 -->
    <template v-else>
      <SidebarHeader>
        <TeamSwitcher :teams="teams" />
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarMenu />
        <!-- <NavProjects :projects="projects" /> -->
      </SidebarContent>
      <SidebarFooter>
        <NavUser :user="currentUser" />
      </SidebarFooter>
    </template>

    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import {
  AudioWaveform,
  BarChart3,
  Command,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from 'lucide-vue-next';

// shadcn-nuxt 会自动导入 Sidebar 相关组件
interface SidebarProps {
  collapsible?: 'icon' | 'offcanvas' | 'none';
}

withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
});

// 使用权限系统
const { loading: permissionLoading } = usePermissions();
const { user } = useAuth();

// 加载状态
const isLoading = computed(() => permissionLoading.value);

// 团队数据
const teams = ref([
  {
    name: '智能ERP',
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
  },
  {
    name: '财务系统',
    logo: AudioWaveform,
    plan: 'Professional',
  },
  {
    name: '生产管理',
    logo: Command,
    plan: 'Standard',
  },
]);

// 项目数据
const projects = ref([
  {
    name: '报表分析',
    url: '/reports',
    icon: BarChart3,
  },
  {
    name: '数据统计',
    url: '/analytics',
    icon: PieChart,
  },
  {
    name: '系统监控',
    url: '/monitoring',
    icon: Map,
  },
]);

// 当前用户信息
const currentUser = computed(() => {
  if (!user.value) {
    return {
      name: 'User',
      email: 'user@example.com',
      avatar: '',
    };
  }

  return {
    name:
      (user.value.user_metadata?.name as string) ||
      user.value.email?.split('@')[0] ||
      'User',
    email: user.value.email || 'user@example.com',
    avatar: user.value.user_metadata?.avatar_url || '',
  };
});
</script>
