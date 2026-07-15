<script lang="ts" setup>
  import type { MenubarGroupProps } from "reka-ui";
  import { MenubarGroup } from "reka-ui";

  const props = defineProps<MenubarGroupProps>();
</script>

<template>
  <MenubarGroup v-bind="props">
    <slot />
  </MenubarGroup>
</template>
