<script lang="ts" setup>
  import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    LogOut,
    Moon,
    Sun,
  } from "lucide-vue-next";
  import { useSidebar } from "@/components/ui/sidebar";

  defineProps<{
    user: {
      name: string;
      email: string;
      avatar: string;
    };
  }>();

  const { isMobile } = useSidebar();

  // 主题切换功能
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            size="lg"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :alt="user.name" :src="user.avatar" />
              <AvatarFallback class="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :alt="user.name" :src="user.avatar" />
                <AvatarFallback class="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck />
              个人资料
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              消息通知
            </DropdownMenuItem>
            <DropdownMenuItem @click="toggleTheme">
              <Sun v-if="isDark" />
              <Moon v-else />
              {{ isDark ? "浅色模式" : "深色模式" }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout">
            <LogOut />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
