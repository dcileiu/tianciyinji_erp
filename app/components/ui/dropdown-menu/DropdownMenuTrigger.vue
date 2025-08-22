<template>
  <MenuButton :class="cn('outline-none', className)" v-bind="$attrs">
    <slot />
  </MenuButton>
</template>

<script setup lang="ts">
import { MenuButton } from '@headlessui/vue'
import { cn } from '@/lib/utils'

interface DropdownMenuTriggerProps {
  className?: string
}

defineProps<DropdownMenuTriggerProps>()
</script> 