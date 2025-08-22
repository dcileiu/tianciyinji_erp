<template>
  <Switch
    v-model="internalValue"
    :class="cn(switchVariants({ size }), className)"
    v-bind="$attrs"
  >
    <span
      :class="cn(
        'pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
        internalValue ? 'translate-x-5' : 'translate-x-0',
        size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
      )"
    />
  </Switch>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { computed } from 'vue'

const switchVariants = cva(
  'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

interface SwitchProps extends VariantProps<typeof switchVariants> {
  modelValue?: boolean
  className?: string
}

const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: false,
  size: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script> 