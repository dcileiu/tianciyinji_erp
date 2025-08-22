<template>
  <MenuItem v-slot="{ active }" :disabled="disabled">
    <button
      :class="cn(dropdownMenuItemVariants({ active: active as boolean }), className)"
      v-bind="$attrs"
      @click="$emit('click')"
    >
      <slot />
    </button>
  </MenuItem>
</template>

<script setup lang="ts">
import { MenuItem } from '@headlessui/vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dropdownMenuItemVariants = cva(
  'group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors duration-150',
  {
    variants: {
      active: {
        true: 'bg-violet-500 text-white',
        false: 'text-gray-900 hover:bg-gray-100',
      },
    },
  }
)

interface DropdownMenuItemProps {
  disabled?: boolean
  className?: string
}

withDefaults(defineProps<DropdownMenuItemProps>(), {
  disabled: false,
})

defineEmits<{
  click: []
}>()
</script> 