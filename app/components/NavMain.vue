<script lang="ts" setup>
  import { ChevronRight } from "lucide-vue-next";
  import { getIconByName } from "~/components/icons";
  import type { MenuPermission } from "~/stores/permissions";

  interface Props {
    items: MenuPermission[];
  }

  const props = defineProps<Props>();

  const route = useRoute();
  const openMap = reactive<Record<string, boolean>>({});

  const isDirectoryActive = (dir: MenuPermission) =>
    Array.isArray(dir.children) &&
    dir.children.some((child) => {
      if (!child?.path) {
        return false;
      }
      return (
        route.path === child.path || route.path.startsWith(`${child.path}/`)
      );
    });

  onMounted(() => {
    // 初始化时展开包含当前激活项的父级
    for (const dir of props.items) {
      if (
        dir.type === "directory" &&
        Array.isArray(dir.children) &&
        dir.children.length > 0
      ) {
        openMap[dir.id] = isDirectoryActive(dir);
      }
    }
  });

  watch(
    () => route.path,
    () => {
      // 路由变化时，只展开包含新激活项的父级，收起其他父级
      for (const dir of props.items) {
        if (
          dir.type === "directory" &&
          Array.isArray(dir.children) &&
          dir.children.length > 0
        ) {
          openMap[dir.id] = isDirectoryActive(dir);
        }
      }
    }
  );
</script>

<template>
  <nav class="flex flex-col gap-1 px-2">
    <template v-for="item in items" :key="item.id">
      <!-- 目录类型 - 可展开的菜单组 -->
      <Collapsible
        class="group"
        v-if="item.type === 'directory' && item.children?.length"
        v-model:open="openMap[item.id]"
      >
        <SidebarMenuButton as-child>
          <CollapsibleTrigger class="w-full">
            <component
              class="h-4 w-4"
              :is="getIconByName(item.icon)"
              v-if="item.icon"
            />
            <span>{{ item.name }}</span>
            <ChevronRight
              class="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90"
            />
          </CollapsibleTrigger>
        </SidebarMenuButton>

        <CollapsibleContent>
          <SidebarMenuSub class="ml-6 border-l pl-4">
            <SidebarMenuSubItem
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <SidebarMenuSubButton
                as-child
                :is-active="$route.path === subItem.path"
              >
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
            <component
              class="h-4 w-4"
              :is="getIconByName(item.icon)"
              v-if="item.icon"
            />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </template>
  </nav>
</template>
