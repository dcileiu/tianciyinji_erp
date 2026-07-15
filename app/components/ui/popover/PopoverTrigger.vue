<script lang="ts" setup>
  import type { PopoverTriggerProps } from "reka-ui";
  import { PopoverTrigger } from "reka-ui";

  const props = defineProps<PopoverTriggerProps>();
</script>

<template>
  <PopoverTrigger v-bind="props">
    <slot />
  </PopoverTrigger>
</template>
