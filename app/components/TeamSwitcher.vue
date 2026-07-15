<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            size="lg"
          >
            <div
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <AppLogo
                inverse
                size="1rem"
                v-if="activeTeam.logo === 'AppLogo'"
              />
              <component class="size-4" :is="activeTeam.logo" v-else />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ activeTeam.name }}</span>
              <span class="truncate text-xs">{{ activeTeam.plan }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          side="bottom"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground"
            >Teams</DropdownMenuLabel
          >
          <template v-for="(team, index) in teams" :key="team.name">
            <DropdownMenuItem
              :class="team.name === activeTeam.name ? 'bg-accent' : ''"
              @click="activeTeam = team"
            >
              <div
                class="flex size-6 items-center justify-center rounded-sm border"
              >
                <component class="size-4 shrink-0" :is="team.logo" />
              </div>
              {{ team.name }}
              <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </template>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div
              class="flex size-6 items-center justify-center rounded-md border bg-background"
            >
              <Plus class="size-4" />
            </div>
            <div class="font-medium text-muted-foreground">Add team</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<script lang="ts" setup>
  import type { LucideIcon } from "lucide-vue-next";
  import { ChevronsUpDown, Plus } from "lucide-vue-next";

  // shadcn-nuxt 会自动导入所有 UI 组件

  interface Team {
    logo: any; // 支持LucideIcon或字符串
    name: string;
    plan: string;
  }

  const props = defineProps<{
    teams: Team[];
  }>();

  const activeTeam = ref(
    props.teams?.[0] || { name: "默认团队", logo: Plus, plan: "免费版" }
  );
</script>
