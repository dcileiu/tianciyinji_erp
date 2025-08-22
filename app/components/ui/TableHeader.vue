<template>
  <thead
    :class="cn('[&_tr]:border-b', $props.class)"
    v-bind="$attrs"
  >
    <slot />
  </thead>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  class?: string
}

withDefaults(defineProps<Props>(), {})
</script>