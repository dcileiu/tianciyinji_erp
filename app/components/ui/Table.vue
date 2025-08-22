<template>
  <div class="relative w-full overflow-auto">
    <table
      :class="cn('w-full caption-bottom text-sm', $props.class)"
      v-bind="$attrs"
    >
      <slot />
    </table>
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  class?: string
}

withDefaults(defineProps<Props>(), {})
</script>