<template>
  <TransitionRoot
    :show="show"
    as="template"
    enter="transform ease-out duration-300 transition"
    enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to="translate-y-0 opacity-100 sm:translate-x-0"
    leave="transition ease-in duration-100"
    leave-from="opacity-100"
    leave-to="opacity-0"
  >
    <div :class="cn(toastVariants({ variant }), className)" v-bind="$attrs">
      <div class="flex items-start">
        <div class="flex-1">
          <slot />
        </div>
        <button
          v-if="!hideClose"
          @click="$emit('close')"
          class="ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot } from '@headlessui/vue'
import { X } from 'lucide-vue-next'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toastVariants = cva(
  'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        success: 'bg-green-600 text-white',
        warning: 'bg-yellow-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface ToastProps extends VariantProps<typeof toastVariants> {
  show?: boolean
  hideClose?: boolean
  className?: string
}

withDefaults(defineProps<ToastProps>(), {
  show: true,
  hideClose: false,
  variant: 'default',
})

defineEmits<{
  close: []
}>()
</script> 