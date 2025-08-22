<template>
  <Transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-75 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <MenuItems
      :class="cn(dropdownMenuContentVariants(), className)"
      v-bind="$attrs"
    >
      <slot />
    </MenuItems>
  </Transition>
</template>

<script setup lang="ts">
import { MenuItems } from '@headlessui/vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dropdownMenuContentVariants = cva(
  'absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50'
)

interface DropdownMenuContentProps {
  className?: string
}

defineProps<DropdownMenuContentProps>()
</script> 