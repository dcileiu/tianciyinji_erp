<script lang="ts" setup>
  import type { ContextMenuGroupProps } from "reka-ui";
  import { ContextMenuGroup } from "reka-ui";

  const props = defineProps<ContextMenuGroupProps>();
</script>

<template>
  <ContextMenuGroup v-bind="props">
    <slot />
  </ContextMenuGroup>
</template>
