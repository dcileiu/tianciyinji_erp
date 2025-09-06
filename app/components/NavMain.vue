<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { getIconByName } from '~/components/icons'
import type { MenuPermission } from '~/stores/permissions'

interface Props {
  items: MenuPermission[]
}

defineProps<Props>()
</script>

<template>
  <nav class="flex flex-col gap-1 px-2">
    <template v-for="item in items" :key="item.id">
      <!-- 目录类型 - 可展开的菜单组 -->
      <Collapsible v-if="item.type === 'directory' && item.children?.length" class="group">
        <SidebarMenuButton as-child>
          <CollapsibleTrigger class="w-full">
            <component v-if="item.icon" :is="getIconByName(item.icon)" class="h-4 w-4" />
            <span>{{ item.name }}</span>
            <ChevronRight class="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
          </CollapsibleTrigger>
        </SidebarMenuButton>

        <CollapsibleContent>
          <SidebarMenuSub class="ml-6 border-l pl-4">
            <SidebarMenuSubItem v-for="subItem in item.children" :key="subItem.id">
              <SidebarMenuSubButton as-child :is-active="$route.path === subItem.path">
                <NuxtLink :to="subItem.path || '#'">
                  <span>{{ subItem.name }}</span>
                </NuxtLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>

      <!-- 菜单类型 - 直接链接 -->
      <SidebarMenuItem v-else>
        <SidebarMenuButton as-child :is-active="$route.path === item.path">
          <NuxtLink :to="item.path || '#'">
            <component v-if="item.icon" :is="getIconByName(item.icon)" class="h-4 w-4" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </template>
  </nav>
</template>
