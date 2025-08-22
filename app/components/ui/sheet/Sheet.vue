<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog @close="$emit('update:modelValue', false)" class="relative z-50">
      <TransitionChild
        as="template"
        enter="ease-in-out duration-500"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in-out duration-500"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div :class="cn(panelPositionClasses[side || 'right'], 'pointer-events-none fixed flex max-w-full')">
            <TransitionChild
              as="template"
              enter="transform transition ease-in-out duration-500"
              :enter-from="enterFromClasses[side || 'right']"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leave-from="translate-x-0"
              :leave-to="leaveToClasses[side || 'right']"
            >
              <DialogPanel :class="cn(sheetVariants({ side, size }), className)">
                <slot />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const sheetVariants = cva(
  'pointer-events-auto relative flex h-full flex-col overflow-y-auto bg-white shadow-xl',
  {
    variants: {
      side: {
        top: 'w-full',
        bottom: 'w-full',
        left: 'h-full',
        right: 'h-full',
      },
      size: {
        sm: '',
        default: '',
        lg: '',
        xl: '',
        full: '',
      },
    },
    compoundVariants: [
      {
        side: ['left', 'right'],
        size: 'sm',
        class: 'w-80',
      },
      {
        side: ['left', 'right'],
        size: 'default',
        class: 'w-96',
      },
      {
        side: ['left', 'right'],
        size: 'lg',
        class: 'w-112',
      },
      {
        side: ['left', 'right'],
        size: 'xl',
        class: 'w-128',
      },
      {
        side: ['left', 'right'],
        size: 'full',
        class: 'w-full',
      },
      {
        side: ['top', 'bottom'],
        size: 'sm',
        class: 'h-80',
      },
      {
        side: ['top', 'bottom'],
        size: 'default',
        class: 'h-96',
      },
      {
        side: ['top', 'bottom'],
        size: 'lg',
        class: 'h-112',
      },
      {
        side: ['top', 'bottom'],
        size: 'xl',
        class: 'h-128',
      },
      {
        side: ['top', 'bottom'],
        size: 'full',
        class: 'h-full',
      },
    ],
    defaultVariants: {
      side: 'right',
      size: 'default',
    },
  }
)

const panelPositionClasses = {
  top: 'inset-x-0 top-0',
  bottom: 'inset-x-0 bottom-0',
  left: 'inset-y-0 left-0',
  right: 'inset-y-0 right-0',
}

const enterFromClasses = {
  top: '-translate-y-full',
  bottom: 'translate-y-full',
  left: '-translate-x-full',
  right: 'translate-x-full',
}

const leaveToClasses = {
  top: '-translate-y-full',
  bottom: 'translate-y-full',
  left: '-translate-x-full',
  right: 'translate-x-full',
}

interface SheetProps extends VariantProps<typeof sheetVariants> {
  modelValue?: boolean
  className?: string
}

withDefaults(defineProps<SheetProps>(), {
  modelValue: false,
  side: 'right',
  size: 'default',
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script> 